var bytewise = require('bytewise')
var collect = require('stream-collector')
var through = require('through2')
var pump = require('pump')

module.exports = function(db, props, opts) {
  if (!Array.isArray(props)) props = [props]
  if (!opts) opts = {}

  var sep = opts.sep || '!'
  var map = opts.map && function(data, enc, cb) { map(data, cb) }
  var that = {}

  that.keys = props

  that.key = function(doc, id) {
    if (!id) id = doc.key
    if (!id) throw new Error('No key defined for this document')

    var keys = props.map(function(n) {
      return doc[n] !== undefined ? bytewise.encode(doc[n]).toString('hex') : ''
    })

    return keys.join(sep)+sep+'-'+id
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

  that.findOne = function(opts, cb) {
    if (typeof opts === 'function') return that.findOne(null, opts)
    if (!opts) opts = {}

    opts.limit = 1
    return that.find(opts, cb && function(err, results) {
      if (err) return cb(err)
      cb(null, results.length ? results[0] : null)
    })
  }

  that.find = function(opts, cb) {
    if (typeof opts === 'function') return that.find(null, opts)
    if (!opts) opts = {}

    var lte = []
    var gte = []
    var gt = []
    var lt = []

    var add = function(list, val) {
      list.push(val !== undefined ? bytewise.encode(val).toString('hex') : '')
    }

    props.forEach(function(n) {
      if (opts.gte) add(gte, opts.gte[n])
      if (opts.lte) add(lte, opts.lte[n])
      if (opts.gt) add(gt, opts.gt[n])
      if (opts.lt) add(lt, opts.lt[n])
    })

    var xopts = {
      lte: lte.length ? lte.join(sep)+sep+'\xff' : undefined,
      gte: gte.length ? gte.join(sep)+sep : undefined,
      lt: lt.length ? lt.join(sep)+sep+'\x00' : undefined,
      gt: gt.length ? gt.join(sep)+sep : undefined,
      limit: opts.limit || -1,
      reverse: opts.reverse,
      valueEncoding: 'utf-8'
    }

    var rs = db.createValueStream(xopts)

    return collect(map ? pump(rs, through.obj(map)) : rs, cb)
  }

  return that
}