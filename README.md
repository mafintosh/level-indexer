# level-indexer

Generic indexer for leveldb. Only stores document keys for space efficiency.

```
npm install level-indexer
```

## Usage

``` js
var indexer = require('level-indexer')

// create a index (by country)
var country = indexer(db, ['country']) // index by country

country.add({
  key: 'mafintosh',
  name: 'mathias',
  country: 'denmark'
})

country.add({
  key: 'maxogden',
  name: 'max',
  country: 'united states'
})

var stream = country.find({
  gte:{country:'denmark'},
  lte:{country:'denmark'}
})

stream.on('data', function(key) {
  console.log(key) // will print mafintosh
})
```

## API

#### `index = indexer(db, [prop1, prop2, ...], [options])`

Creates a new index using the given properties.
Options include

``` js
{
  map: function(key, cb) {
    // map find results to another value
    db.get(key, cb)
  }
}
```

#### `index.add(doc, [key], [cb])`

Add a document to the index. The document needs to have a key or provide one.
Only the key will be stored in the index.

#### `index.remove(doc, [key], [cb])`

Remove a document from the index.

#### `index.key(doc, [key])`

Returns the used leveldb key. Useful if you want to batch multiple index updates
together yourself

``` js
var batch = [{type:'put', key:index.key(doc), value:doc.key}, ...]
```

#### `stream = index.find(options, [cb])`

Search the index. Use `options.{gt,gte,lt,lte}` to scope your search.

``` js
// find everyone in the age range 20-50 in denmark

var index = indexer(db, ['country', 'age'])

...
var stream = index.find({
  gt: {
    country: 'denmark',
    age: 20
  },
  lt: {
    country: 'denmark',
    age: 50
  }
})
```

The stream will contain the keys of the documents that where found in the index.
Use `options.map` to map the to the document values.

Options also include the regular [levelup](https://github.com/rvagg/node-levelup) `db.createReadStream` options.

If you set `cb` the stream will be buffered and passed as an array.

#### `index.findOne(options, cb)`

Only find the first match in the index and pass that to the callbck

## License

MIT
