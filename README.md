# google-panorama-equirectangular

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

![2d](http://i.imgur.com/AukW6Mv.png)

Stitches Google Street View and Photo Sphere tiles into an equirectangular image. For use in the browser, with Webpack or Browserify.

## Install

```sh
npm install google-panorama-equirectangular
```

## Example

For full examples, see the [demo/](demo/) folder. 

Simple example:

```js
var load = require('google-panorama-equirectangular')
var panoID = 'dXZfBMex9_L7jO2JW3FTdA'

load(panoID, { zoom: 2 })
  .on('start', function (data) {
    console.log('canvas size: ', data.width, data.height)
  })
  .on('progress', function (ev) {
    console.log('progress: ', ev.count / ev.total)
  })
  .on('complete', function (image) {
    document.body.appendChild(image)
    console.log('canvas image: ', image)
  })
```

## Usage

[![NPM](https://nodei.co/npm/google-panorama-equirectangular.png)](https://www.npmjs.com/package/google-panorama-equirectangular)

#### `emitter = load(id, [opt])`

Creates a new StreetView stitcher with `id` and optional settings. `opt` can be:

- `zoom` an integer between 0 and 5 (inclusive), defaults to 1
- `canvas` a HTMLCanvasElement to re-use, defaults to creating a new element
- `tiles` is the tile dimensions from `getPanoramaByLocation` or `getPanoramaById`, defaults to assuming StreetView image dimensions
- `crossOrigin` crossOrigin String for image loading, defaults to `undefined`

Here is an example using [google-panorama-by-id](https://github.com/Jam3/google-panorama-by-id).

```js
var load = require('google-panorama-equirectangular')
var panoData = require('google-panorama-by-id')
var id = 'dXZfBMex9_L7jO2JW3FTdA'

panoData(id, function (err, result) {
  var tiles = result.tiles
  load(id, { tiles: tiles, zoom: 2, canvas: myCanvas })
})
```

## Also See

- [google-panorama-by-id](https://github.com/Jam3/google-panorama-by-id)
- [google-panorama-by-location](https://github.com/Jam3/google-panorama-by-location)
- [google-panorama-tiles](https://github.com/Jam3/google-panorama-tiles)

## Credits

Thanks to @thespite's prior work on [PanomNom.js](https://github.com/spite/PanomNom.js/), which was used as a reference while building out some of these modules.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/google-panorama-equirectangular/blob/master/LICENSE.md) for details.
