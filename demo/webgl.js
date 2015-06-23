/*
  Renders a StreetView panorama in ThreeJS.
 */

var THREE = require('three')
var equirect = require('../')
var streetview = require('awesome-streetview')
var panorama = require('google-panorama-by-location')
var createOrbitViewer = require('three-orbit-viewer')(THREE)
var getBestZoom = require('./max-ram-zoom')

var app = createOrbitViewer({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 45,
  position: new THREE.Vector3(0, 0, -0.1)
})

var texture = new THREE.Texture()
texture.minFilter = THREE.LinearFilter
texture.generateMipmap = false

// transparent canvas to start (white)
var canvas = document.createElement('canvas')
texture.needsUpdate = true
texture.image = canvas

// add a double-sided sphere
var geo = new THREE.SphereGeometry(1, 84, 84)
var mat = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
})
var sphere = new THREE.Mesh(geo, mat)
app.scene.add(sphere)

// flip the texture along X axis
sphere.scale.x = -1

// a street view in Tokyo
var location = [35.659607, 139.700378]
panorama(location, function (err, result) {
  if (err) throw err

  // load the equirectangular image
  equirect(result.id, {
    tiles: result.tiles,
    canvas: canvas,
    crossOrigin: 'Anonymous',
    zoom: getBestZoom()
  })
    .on('complete', function (image) {
      texture.needsUpdate = true
    })
    .on('progress', function (ev) {
      texture.needsUpdate = true
    })
})
