var getTileData = require('./getTileData')
var getUrl = require('./getUrl')

module.exports = getPanoramaTiles
function getPanoramaTiles (id, opt) {
  if (!id) {
    throw new Error('must specify panorama ID')
  }

  var zoom = (typeof opt.zoom === 'number' ? opt.zoom : 1) | 0 // integer value
  if (zoom < 0 || zoom > 5) {
    throw new Error('zoom is out of range, must be between 0 - 5 (inclusive)')
  }

  var data = getTileData(zoom, opt.tiles)
  data.photosphere = /^F:-.*$/gi.test(id)
  if(data.photosphere) {
    data.rows = data.columns = 1
    // Allow user-specified width override for these IDs
    if (typeof opt.width === 'number') {
      data.width = Math.floor(opt.width)
      data.height = Math.floor(data.width / 2)
    }
  }
  var images = []
  for (var y = 0; y < data.rows; y++) {
    for (var x = 0; x < data.columns; x++) {
      images.push({
        url: getUrl(id, {
          x: x,
          y: y,
          zoom: zoom,
          width: data.width,
          height: data.height,
          protocol: opt.protocol
        }),
        position: [ x * data.tileWidth, y * data.tileHeight ]
      })
    }
  }

  data.images = images
  return data
}
