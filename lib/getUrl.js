module.exports = function getUrl (panoId, opt) {
  opt = opt || {}
  var x = opt.x || 0
  var y = opt.y || 0
  var zoom = opt.zoom || 0
  
  // alternative:
  // return 'https://cbks2.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + id + '&output=tile&zoom=' + zoom + '&x=' + x + '&y=' + y + '&' + Date.now()
  if (/^F:-.*$/gi.test(panoId)) {
    const width = typeof opt.width === 'number' ? opt.width : 2048
    const height = typeof opt.height === 'number' ? opt.height : (width / 2)
    const panoIdStripped = panoId.substr(2)
    return '//lh4.googleusercontent.com/' + panoIdStripped + '/w' + width + '-h' + height + '-n-k-no/'
  } else {
    return '//geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panoId + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + zoom + '&nbt&fover=2'
  }
}