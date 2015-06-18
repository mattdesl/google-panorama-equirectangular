var getTileData = require('google-panorama-tiles')

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
        url: getURL(id, x, y, zoom),
        position: [ x * data.tileWidth, y * data.tileHeight ]
      })
    }
  }

  data.images = images
  return data
}

function getURL (id, x, y, zoom) {
  // alternative:
  // return 'https://cbks2.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + id + '&output=tile&zoom=' + zoom + '&x=' + x + '&y=' + y + '&' + Date.now()
  return 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + id + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + zoom + '&nbt&fover=2'
}
