var getTileData = require('google-panorama-tiles')
var getUrl = require('google-panorama-url')

module.exports = getPanoTileImages
function getPanoTileImages (id, zoom, tiles) {
  if (!id) {
    throw new Error('must specify panorama ID')
  }

  zoom = (typeof zoom === 'number' ? zoom : 1) | 0 // integer value
  if (zoom < 0 || zoom > 5) {
    throw new Error('zoom is out of range, must be between 0 - 5 (inclusive)')
  }

  var data = getTileData(zoom, tiles)
  var images = []
  for (var y = 0; y < data.rows; y++) {
    for (var x = 0; x < data.columns; x++) {
      images.push({
        url: getUrl(id, { x: x, y: y, zoom: zoom }),
        position: [ x * data.tileWidth, y * data.tileHeight ]
      })
    }
  }

  data.images = images
  return data
}
