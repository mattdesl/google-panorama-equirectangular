// Much inspired by:
// https://github.com/spite/PanomNom.js

var defined = require('defined')

var widths = [ 416, 832, 1664, 3328, 6656, 13312 ]
var heights = [ 416, 416, 832, 1664, 3328, 6656 ]
var levelsW = [ 1, 2, 4, 7, 13, 26 ]
var levelsH = [ 1, 1, 2, 4, 7, 13 ]

module.exports = equirect

function equirect (opt) {
  opt = opt || {}
  var id = opt.id
  if (!opt.id) {
    throw new Error('must specify panorama ID')
  }

  var zoom = defined(opt.zoom, 1) >>> 0
  var width = widths[zoom]
  var height = heights[zoom]

  var cols = levelsW[zoom]
  var rows = levelsH[zoom]
  var square = 512

  var tiles = []
  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      tiles.push({
        url: getURL(id, x, y, zoom),
        position: [ x * square, y * square ]
      })
    }
  }

  return {
    columns: cols,
    rows: rows,
    tileSize: square,
    width: width,
    height: height,
    tiles: tiles
  }
}

function getURL (id, x, y, zoom) {
  return 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + id + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + zoom + '&nbt&fover=2'
// return 'https://cbks2.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + id + '&output=tile&zoom=' + zoom + '&x=' + x + '&y=' + y + '&' + Date.now()
}
