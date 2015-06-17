/*globals google*/
var THREE = require('three')
var equirect = require('../')
var panorama = require('google-panorama-by-location')

var preloader = document.querySelector('.preloader')
var streetview = [ 51.50700703827454, -0.12791916931155356 ]
var photosphere = [ -21.203982, -159.83700899999997 ]
var service = new google.maps.StreetViewService()

var createOrbitViewer = require('three-orbit-viewer')(THREE)

var app = createOrbitViewer({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 50,
  position: new THREE.Vector3(0, 0, -0.1)
})

var texture = new THREE.Texture()
texture.minFilter = THREE.LinearFilter
texture.generateMipmap = false

var geo = new THREE.SphereGeometry(1, 32, 32)
var mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
var sphere = new THREE.Mesh(geo, mat)
sphere.visible = false

app.scene.add(sphere)

var location = Math.random() > 0.5 ? streetview : photosphere
panorama(location, {
  service: service
}, function (err, result) {
  if (err) throw err
  preloader.style.height = '4px'
  equirect({
    tiles: result.tiles,
    id: result.id,
    crossOrigin: 'Anonymous',
    zoom: 3
  }).on('complete', function (image) {
    texture.image = image
    texture.needsUpdate = true
    mat.needsUpdate = true
    sphere.visible = true
    preloader.style.height = '0'
  }).on('progress', function (ev) {
    preloader.style.width = ((ev.count / ev.total).toFixed(1) * 100) + '%'
  })
})
