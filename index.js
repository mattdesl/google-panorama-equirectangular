var getTiles = require('./lib/image-tiles')
var loader = require('./lib/image-tile-loader')

module.exports = loadEquirectangular
function loadEquirectangular (id, opt) {
  opt = opt || {}
  var canvas = opt.canvas || document.createElement('canvas')
  var context = canvas.getContext('2d')
  var zoom = (typeof opt.zoom === 'number' ? opt.zoom : 1) | 0 // integer value
  if (zoom < 0 || zoom > 5) {
    throw new Error('zoom is out of range, must be between 0 - 5 (inclusive)')
  }
  var data = getTiles(id, zoom, opt.tiles)

  var canvasWidth = data.width
  var canvasHeight = data.height

  // failed tiles will be transparent
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  context.clearRect(0, 0, canvasWidth, canvasHeight)

  var emitter = loader(data.images, { crossOrigin: opt.crossOrigin }, done)
  emitter.on('tile', function (tile) {
    context.drawImage(tile.image, tile.position[0], tile.position[1])
  })

  process.nextTick(start)
  return emitter

  function done () {
    emitter.emit('complete', canvas)
  }

  function start () {
    emitter.emit('start', data)
    emitter.load()
  }
}
