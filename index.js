var getTiles = require('./lib/panorama-tiles')
var stitcher = require('./lib/stitch-image-tiles')

module.exports = equirect

function equirect (opt, cb) {
  opt = opt || {}
  var canvas = opt.canvas || document.createElement('canvas')
  var context = canvas.getContext('2d')
  var data = getTiles(opt)
  return stitcher(context, {
    tiles: data.tiles,
    width: data.width,
    height: data.height,
    crossOrigin: opt.crossOrigin
  })
}
