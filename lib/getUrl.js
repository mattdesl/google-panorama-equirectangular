module.exports = function getUrl (panoId, opt) {
  opt = opt || {}
  var x = opt.x || 0
  var y = opt.y || 0
  var zoom = opt.zoom || 0
  var protocol = opt.protocol || ''
  if (protocol) {
    protocol = protocol.replace(/:(\/\/)?$/, '') + ':'
  }
  
  // alternative:
  // return 'https://cbks2.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + id + '&output=tile&zoom=' + zoom + '&x=' + x + '&y=' + y + '&' + Date.now()
  if (/^F:-.*$/gi.test(panoId)) {
    const width = typeof opt.width === 'number' ? opt.width : 2048
    const height = typeof opt.height === 'number' ? opt.height : (width / 2)
    const panoIdStripped = panoId.substr(2)
    // TODO: load with tiles using parameters like this:
    // http://lh4.googleusercontent.com/-vnkH-sENeCw/WA49Mr6a2SI/AAAAAAACY9M/j0gNPxDZPbwzBpbneSRlSwt-NAV7j7EvgCLIB/w512-h512-x1-y1-z3/
    return protocol + '//lh4.googleusercontent.com/' + panoIdStripped + '/w' + width + '-h' + height + '-n-k-no/'
  } else {
    return protocol + '//geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panoId + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + zoom + '&nbt&fover=2'
  }
}