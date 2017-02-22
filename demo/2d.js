/*globals google*/

/*
  Creates an image grid where each click loads
  a new StreetView panorama.
 */

var equirect = require('../')
var panorama = require('google-panorama-by-location')
var awesome = require('awesome-streetview')
var events = require('dom-events')
var shuffle = require('array-shuffle')

var service = new google.maps.StreetViewService()
var zoom = 1
var locations = shuffle(awesome.locations)
var idx = 0
run()

function run () {
  var location = locations[idx++]
  console.log(location)
  panorama(location, {
    service: service
  }, function (err, result) {
    if (err) throw err
    var canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    canvas.className = 'gallery-item'
    equirect(result.id, {
      tiles: result.tiles,
      canvas: canvas,
      zoom: zoom
    }).on('complete', function (image, info) {
      console.log('Ready', info)
    }).on('progress', function (ev) {
      console.log(ev.count / ev.total)
    })

    events.once(window, 'click', function () {
      run()
    })
  })
}
