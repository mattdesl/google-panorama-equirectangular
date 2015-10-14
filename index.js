var getTiles = require('./lib/image-tiles')
var loader = require('async-image-loader')
var Emitter = require('events').EventEmitter

module.exports = loadEquirectangular
function loadEquirectangular (id, opt) {
  opt = opt || {}
  var data = getTiles(id, opt.zoom, opt.tiles)

  var canvas = opt.canvas || document.createElement('canvas')
  var context = canvas.getContext('2d')
  var canvasWidth = data.width
  var canvasHeight = data.height

  // failed tiles will be transparent
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  context.clearRect(0, 0, canvasWidth, canvasHeight)

  var emitter = new Emitter()
  var images = data.images
  var zero = [0, 0]

  process.nextTick(start)
  return emitter

  function done () {
    emitter.emit('complete', canvas)

    // ensure these will get collected quickly
    canvas = null
    context = null
  }

  function start () {
    emitter.emit('start', data)
    loader(images, { crossOrigin: opt.crossOrigin }, done)
      .on('not-found', function (data) {
        emitter.emit('not-found', data.url)
      })
      .on('progress', function (ev) {
        var tile = ev.data
        var position = tile.position || zero
        if (ev.image) {
          context.drawImage(ev.image, position[0], position[1])
        }
        emitter.emit('progress', {
          count: ev.count,
          total: ev.total,
          image: ev.image,
          position: position
        })
      })
  }
}
