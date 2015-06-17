/*globals HTMLCanvasElement*/
var test = require('tape')
var equirect = require('../')

test('should get image', function (t) {
  t.plan(4)

  // can use google-panorama-by-location module
  // or StreetViewService#getPanoramaByLocation
  var id = 'dXZfBMex9_L7jO2JW3FTdA'
  equirect(id, {
    crossOrigin: 'Anonymous'
  }).on('complete', function (image) {
    t.equal(image instanceof HTMLCanvasElement, true, 'canvas')
    t.equal(image.width, 832, 'width')
    t.equal(image.height, 416, 'height')

    function pixels () {
      image.getContext('2d').getImageData(0, 0, 512, 512)
    }
    t.doesNotThrow(pixels, 'crossOrigin')

    setTimeout(function () {
      window.close()
    }, 500)
  }).on('not-found', function (err) {
    console.warning(err)
  })
})
