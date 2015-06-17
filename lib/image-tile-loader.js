var each = require('async-each')
var loadImage = require('img')
var Emitter = require('events').EventEmitter

module.exports = asyncImages

function asyncImages (tiles, opt, cb) {
  if (typeof opt === 'function') {
    cb = opt
    opt = {}
  }

  opt = opt || {}

  var emitter = new Emitter()
  var count = 0
  var total = tiles.length
  var zero = [ 0, 0 ]

  emitter.load = load
  return emitter

  function load () {
    each(tiles, function (item, next) {
      loadImage(item.url, opt, function (err, image) {
        if (err) {
          emitter.emit('not-found', item.url)
        } else {
          var position = item.position || zero
          emitter.emit('tile', {
            image: image,
            position: [ position[0] || 0, position[1] || 0 ],
            url: item.url
          })
        }

        emitter.emit('progress', {
          count: ++count,
          total: total
        })

        next(null)
      })
    }, cb)
  }
}
