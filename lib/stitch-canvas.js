var async = require('./async-image-tiles')
var defined = require('defined')

module.exports = stitch

function stitch (context, images, opt) {
  if (!context || !context.canvas) {
    throw new Error('must provide a canvas rendering context')
  }

  opt = opt || {}

  var canvas = context.canvas
  var canvasWidth = defined(opt.width, canvas.width)
  var canvasHeight = defined(opt.height, canvas.height)

  // failed tiles will show as black
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  var emitter = async(images, opt, done)
  emitter.on('tile', function (tile) {
    context.drawImage(tile.image, tile.position[0], tile.position[1])
  })

  return emitter

  function done () {
    emitter.emit('complete', canvas)
  }
}
