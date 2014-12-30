var indexer = require('./')
var db = require('memdb')()

var name = indexer(db, ['country', 'age'])

name.add({key:'mafintosh', name:'mathias', age:27, country:'denmark'})
name.add({key:'watson', name:'thomas', age:30, country:'denmark'})
name.add({key:'sorribas', name:'eduardo', age:23, country:'dominican republic'})

var stream = name.find({
  gt: {
    country: 'denmark',
    age: 20,
  },
  lt: {
    country: 'denmark',
    age: 30
  }
})

stream.on('data', console.log)