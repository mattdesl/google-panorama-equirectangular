var equirect = require('../')
var panorama = require('google-panorama-by-location')

var loc = [ 51.50700703827454, -0.12791916931155356 ]
panorama(loc, function (err, results) {
  if (err) throw err

  var id = results[0].id
  var canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.style.width = '100%'
  equirect({
    canvas: canvas,
    id: id,
    zoom: 4
  }).on('complete', function (image) {
    console.log('Ready')
  }).on('progress', function (ev) {
    console.log(ev.count / ev.total)
  })
})
