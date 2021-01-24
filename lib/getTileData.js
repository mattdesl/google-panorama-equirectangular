// Much inspired by:
// https://github.com/spite/PanomNom.js

var levelsW = [ 1, 2, 4, 8, 16 ]
var levelsH = [ 1, 1, 2, 4, 8 ]

module.exports = equirect

function equirect (zoom, data) {
  if (typeof zoom !== 'number') {
    throw new Error('must provide zoom')
  }

  var width, height, cols, rows, squareW, squareH
  if (data) { // Haven't tested with new street view tile dimensions
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
    width = levelsW[zoom] * 512
    height = levelsH[zoom] * 512
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
