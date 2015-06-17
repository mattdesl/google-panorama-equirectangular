/*globals google*/
var equirect = require('../')
var panorama = require('google-panorama-by-location')

var streetview = [ 51.50700703827454, -0.12791916931155356 ]
// var photosphere = [ -21.203982, -159.83700899999997 ]
var service = new google.maps.StreetViewService()

panorama(streetview, {
  service: service
}, function (err, result) {
  if (err) throw err

  var canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.style['max-width'] = '100%'
  equirect(result.id, {
    tiles: result.tiles,
    canvas: canvas,
    zoom: 4
  }).on('complete', function (image) {
    console.log('Ready')
  }).on('progress', function (ev) {
    console.log(ev.count / ev.total)
  })
})
