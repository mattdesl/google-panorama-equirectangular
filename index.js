var getTiles = require('./lib/panorama-tiles')
var stitcher = require('./lib/stitch-canvas')
var defined = require('defined')

module.exports = equirect

function equirect (opt, cb) {
  opt = opt || {}
  var canvas = opt.canvas || document.createElement('canvas')
  var context = canvas.getContext('2d')
  var zoom = defined(opt.zoom, 1) | 0 // integer value
  var data = getTiles(opt.id, zoom, opt.tiles)
  return stitcher(context, data.images, {
    width: data.width,
    height: data.height,
    crossOrigin: opt.crossOrigin
  })
}
