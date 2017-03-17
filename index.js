var bytewise = require('bytewise')
var collect = require('stream-collector')
var through = require('through2')
var pump = require('pump')

var writer = function(fn) {
  return function(data, enc, cb) {
    fn(data, cb)
  }
}

module.exports = function(db, props, opts) {
  if (!Array.isArray(props)) props = [props]
  if (!opts) opts = {}

  var sep = opts.sep || '!'
  var map = opts.map && writer(opts.map)
  var prefix = opts.prefix || props.join(sep)+sep
  var that = {}

  that.keys = props

  that.key = function(doc, id) {
    if (!id) id = doc.key
    if (!id) throw new Error('No key defined for this document')

    var keys = props.map(function(n) {
      return doc[n]
    })

    return prefix+bytewise.encode(keys).toString('hex')+sep+id
  }

  that.add = function(doc, id, cb) {
    if (typeof id === 'function') return that.add(doc, null, id)
    if (!id) id = doc.key
    db.put(that.key(doc, id), id, cb)
  }

  that.remove = function(doc, id, cb) {
    if (typeof id === 'function') return that.remove(doc, null, id)
    db.del(that.key(doc, id), cb)
  }

  var normalizeQuery = function(opts) {
    if (!opts) return {}
    return typeof opts === 'object' && !Array.isArray(opts) ? opts : {gte:opts, lte:opts}
  }

  that.findOne = function(opts, cb) {
    if (typeof opts === 'function') return that.findOne(null, opts)
  
    opts = normalizeQuery(opts)
    opts.limit = 1

    return that.find(opts, cb && function(err, results) {
      if (err) return cb(err)
      cb(null, results.length ? results[0] : null)
    })
  }

  var encode = function(val) {
    if (val === undefined) return null
    if (Array.isArray(val)) return prefix+bytewise.encode(val).toString('hex')
    if (typeof val !== 'object') return prefix+bytewise.encode([val]).toString('hex')

    var keys = props.map(function(n) {
      return val[n]
    })

    return prefix+bytewise.encode(keys).toString('hex')
  }

  that.find = function(opts, cb) {
    if (typeof opts === 'function') return that.find(null, opts)
    opts = normalizeQuery(opts)

    var lte = encode(opts.lte)
    var gte = encode(opts.gte)
    var gt = encode(opts.gt)
    var lt = encode(opts.lt)

    var xopts = {
      lte: lte ? lte+sep+'\xff' : undefined,
      gte: gte ? gte+sep+'\x00' : undefined,
      lt: lt ? lt+sep+'\x00' : undefined,
      gt: gt ? gt+sep+'\xff' : undefined,
      limit: opts.limit || -1,
      reverse: opts.reverse,
      valueEncoding: 'utf-8'
    }

    var rs = db.createValueStream(xopts)
    var m = opts.map ? writer(opts.map) : map

    return collect(m ? pump(rs, through.obj(m)) : rs, cb)
  }

  return that
}