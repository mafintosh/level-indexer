var indexer = require('./')
var memdb = require('memdb')
var tape = require('tape')

tape('single index', function(t) {
  var index = indexer(memdb(), ['name'])

  index.add({key:'mafintosh', name:'mathias', age:27, country:'denmark'})
  index.add({key:'watson', name:'thomas', age:30, country:'denmark'})
  index.add({key:'sorribas', name:'eduardo', age:23, country:'dominican republic'})

  index.find('mathias', function(err, keys) {
    t.notOk(err, 'no err')
    t.same(keys, ['mafintosh'])
    t.end()
  })
})

tape('single index gt/gte/lt/lte', function(t) {
  var index = indexer(memdb(), ['name'])

  index.add({key:'mafintosh', name:'mathias', age:27, country:'denmark'})
  index.add({key:'watson', name:'thomas', age:30, country:'denmark'})
  index.add({key:'sorribas', name:'eduardo', age:23, country:'dominican republic'})

  index.find({ gte: 'mathias' }, function(err, keys) {
    t.notOk(err, 'no err')
    t.same(keys, ['mafintosh', 'watson'])

    index.find({ gt: 'mathias' }, function(err, keys) {
      t.notOk(err, 'no err')
      t.same(keys, ['watson'])

      index.find({ lte: 'mathias' }, function(err, keys) {
        t.notOk(err, 'no err')
        t.same(keys, ['sorribas', 'mafintosh'])

        index.find({ lt: 'mathias' }, function(err, keys) {
          t.notOk(err, 'no err')
          t.same(keys, ['sorribas'])
          t.end()
        })
      })
    })
  })
})

tape('compound index', function(t) {
  var index = indexer(memdb(), ['country', 'age'])

  index.add({key:'mafintosh', name:'mathias', age:27, country:'denmark'})
  index.add({key:'watson', name:'thomas', age:30, country:'denmark'})
  index.add({key:'sorribas', name:'eduardo', age:23, country:'dominican republic'})

  index.find(['denmark', 27], function(err, keys) {
    t.notOk(err, 'no err')
    t.same(keys, ['mafintosh'])
    t.end()
  })
})

tape('compound index no result', function(t) {
  var index = indexer(memdb(), ['country', 'age'])

  index.add({key:'mafintosh', name:'mathias', age:27, country:'denmark'})
  index.add({key:'watson', name:'thomas', age:30, country:'denmark'})
  index.add({key:'sorribas', name:'eduardo', age:23, country:'dominican republic'})

  index.find(['denmark', 28], function(err, keys) {
    t.notOk(err, 'no err')
    t.same(keys, [])
    t.end()
  })
})

tape('compound index ranges', function(t) {
  var index = indexer(memdb(), ['country', 'age'])

  index.add({key:'mafintosh', name:'mathias', age:27, country:'denmark'})
  index.add({key:'watson', name:'thomas', age:30, country:'denmark'})
  index.add({key:'sorribas', name:'eduardo', age:23, country:'dominican republic'})

  index.find({gte:['denmark', 27], lte:['denmark',30]}, function(err, keys) {
    t.notOk(err, 'no err')
    t.same(keys, ['mafintosh', 'watson'])
    t.end()
  })
})
