/*
  Renders a StreetView panorama in ThreeJS.

  Uses a GPU stitching algorithm to support
  higher quality images on low-memory devices
  (like iOS Safari).
 */

var equirect = require('../intermediate')
var panorama = require('google-panorama-by-location')
var awesome = require('awesome-streetview')
var THREE = require('three')
var createOrbitViewer = require('three-orbit-viewer')(THREE)

// unlike max-ram-zoom, this is based on VRAM
var bestZoom = require('google-panorama-zoom-level')
var preloader = document.querySelector('.preloader')

var app = createOrbitViewer({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 50,
  position: new THREE.Vector3(0, 0, -0.1)
})

var tex = new THREE.DataTexture(null, 1, 1, THREE.RGBAFormat)
tex.minFilter = THREE.LinearFilter
tex.magFilter = THREE.LinearFilter
tex.generateMipmaps = false

// add a double-sided sphere
var geo = new THREE.SphereGeometry(1, 84, 84)
var mat = new THREE.MeshBasicMaterial({
  map: tex,
  side: THREE.DoubleSide
})
var sphere = new THREE.Mesh(geo, mat)
sphere.scale.x = -1

var location = awesome()
console.log('Location: %s', location.join(', '))
panorama(location, function (err, result) {
  if (err) throw err
  var renderer = app.renderer

  // ensure handle is created
  renderer.uploadTexture(tex)

  var gl = renderer.getContext()
  var handle = tex.__webglTexture
  var texHeight
  var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  var zoom = Math.max(0, Math.min(4, bestZoom(maxSize)))

  equirect(result.id, {
    zoom: zoom,
    tiles: result.tiles,
    crossOrigin: 'Anonymous'
  }).on('start', function (data) {
    texHeight = data.height

    // reshape the texture initially with transparent data
    gl.bindTexture(gl.TEXTURE_2D, handle)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, data.width, data.height,
          0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // now we can show the sphere
    app.scene.add(sphere)
  }).on('progress', function (ev) {
    var x = ev.position[0]
    var y = texHeight - ev.position[1] - ev.image.height

    // now blit the intermediate image
    gl.bindTexture(gl.TEXTURE_2D, handle)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y,
          gl.RGBA, gl.UNSIGNED_BYTE, ev.image)

    setProgress(ev.count / ev.total)
  }).on('complete', function () {
    preloader.style.height = '0'
  })
})

function setProgress(val) {
  preloader.style.width = Math.round(val.toFixed(1) * 100) + '%'
}