var indexer = require('./')
var db = require('memdb')()

var name = indexer(db, 'age')

name.add({username:'mafintosh', name:'mathias', age:27}, 'mafintosh')
name.add({username:'watson', name:'thomas', age:30}, 'watson')
name.add({username:'sorribas', name:'eduardo', age:29}, 'sorribas')

// name.get({age:30}, function() {

// })

var stream = name.find({
  gt: {
    age: 30
  },
  lt: {
    age: 50
  }
})

stream.on('data', console.log)