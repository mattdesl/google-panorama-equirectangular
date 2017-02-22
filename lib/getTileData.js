// Much inspired by:
// https://github.com/spite/PanomNom.js

var widths = [ 416, 832, 1664, 3328, 6656, 13312 ]
var heights = [ 416, 416, 832, 1664, 3328, 6656 ]
var levelsW = [ 1, 2, 4, 7, 13, 26 ]
var levelsH = [ 1, 1, 2, 4, 7, 13 ]

module.exports = equirect

function equirect (zoom, data) {
  if (typeof zoom !== 'number') {
    throw new Error('must provide zoom')
  }

  var width, height, cols, rows, squareW, squareH
  if (data) {
    // if meta info is specified, we will compute the exact tile sizes
    // works with StreetView and PhotoSphere
    var ratio = data.worldSize.width / data.tileSize.width
    var nearestZoom = Math.floor(Math.log(ratio) / Math.log(2))
    width = Math.floor(data.worldSize.width * Math.pow(2, zoom - 1) / Math.pow(2, nearestZoom))
    height = Math.floor(data.worldSize.height * Math.pow(2, zoom - 1) / Math.pow(2, nearestZoom))
    cols = Math.max(1, Math.ceil(width / data.tileSize.width))
    rows = Math.max(1, Math.ceil(height / data.tileSize.height))
    squareW = data.tileSize.width
    squareH = data.tileSize.height
  } else {
    // otherwise, we approximate them assuming the result is
    // a regular StreetView panorama
    width = widths[zoom]
    height = heights[zoom]
    cols = levelsW[zoom]
    rows = levelsH[zoom]
    squareW = 512
    squareH = 512
  }

  return {
    columns: cols,
    rows: rows,
    tileWidth: squareW,
    tileHeight: squareH,
    width: width,
    height: height
  }
}
