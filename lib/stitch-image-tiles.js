var each = require('async-each')
var loadImage = require('img')
var Emitter = require('events').EventEmitter
var defined = require('defined')

module.exports = stitch

function stitch (context, opt) {
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

  var emitter = new Emitter()
  var count = 0
  var tiles = opt.tiles
  var total = tiles.length
  var zero = [ 0, 0 ]

  each(tiles, function (item, next) {
    loadImage(item.url, opt, function (err, image) {
      if (err) {
        emitter.emit('not-found', item)
      } else {
        var position = item.position || zero
        context.drawImage(image, position[0] || 0, position[1] || 0)
      }

      emitter.emit('progress', {
        count: ++count,
        total: total
      })

      next(null)
    })
  }, function () {
    emitter.emit('complete', canvas)
  })

  return emitter
}
