var getPanoramaTiles = require('./lib/getPanoramaTiles')
var loader = require('async-image-loader')
var Emitter = require('events').EventEmitter

module.exports = loadEquirectangular
function loadEquirectangular (id, opt) {
  opt = opt || {}
  var data = getPanoramaTiles(id, opt)

  var canvas = opt.canvas || document.createElement('canvas')
  var context = canvas.getContext('2d')
  var emitter = new Emitter()
  var images = data.images
  var zero = [0, 0]
  var tileWidth = Math.min(512, data.tileWidth)
  var tileHeight = Math.min(512, data.tileHeight)

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
      .on('progress', stitch)
  }

  function stitch (ev) {
    var tile = ev.data
    var image = ev.image
    var count = ev.count
    var total = ev.total
    var x, y
    var isPhotosphere = data.photosphere

    if (isPhotosphere && images.length !== 1) {
      throw new Error('google-panorama-equirectangular received non-legacy\n' +
        'data with an unusual amount of image tiles; please report a bug in GitHub:\n' +
        'https://github.com/mattdesl/google-panorama-equirectangular/issues')
    }

    if (isPhotosphere) {
      // New APIs may return a single really large image...
      // so we have to split it manually to keep it under 512x512

      var dataWidth = image ? image.width : data.width
      var dataHeight = image ? image.height : data.height

      var cols = Math.ceil(dataWidth / tileWidth)
      var rows = Math.ceil(dataHeight / tileHeight)
      count = 1
      total = cols * rows
      for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
          // stitch each 512x512 tile in this single image
          x = col * tileWidth
          y = row * tileWidth
          var srcWidth = Math.min(tileWidth, dataWidth, dataWidth - x)
          var srcHeight = Math.min(tileHeight, dataHeight, dataHeight - y)
          canvas.width = srcWidth
          canvas.height = srcHeight
          context.clearRect(0, 0, srcWidth, srcHeight)

          // if the image exists, blit it
          if (image) {
            context.drawImage(image, x, y, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight)
          }

          emitter.emit('progress', {
            count: count,
            total: total,
            position: [ x, y ],
            image: canvas,
            originalImage: ev.image
          })
          count++
        }
      }
    } else {
      // A single tile from the StreetView API, should be under 512x512
      var position = tile.position || zero
      x = position[0]
      y = position[1]

      var width = Math.min(tileWidth, data.width - x, data.width)
      var height = Math.min(tileHeight, data.height - y, data.height)

      // if we need to "crop" the image, or if the image wasn't found,
      // we will use an intermediate canvas
      if (!image || width !== image.width || height !== image.height) {
        canvas.width = width
        canvas.height = height
        context.clearRect(0, 0, width, height)

        // if the image exists, blit it
        if (image) {
          context.drawImage(image, 0, 0)
        }

        image = canvas
      }

      emitter.emit('progress', {
        count: count,
        total: total,
        position: position,
        image: image,
        originalImage: ev.image
      })
    }
  }
}
