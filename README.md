# google-panorama-equirectangular

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[![2d](http://i.imgur.com/AukW6Mv.png)](http://mattdesl.github.io/google-panorama-equirectangular/demo/)

[webgl demo](http://mattdesl.github.io/google-panorama-equirectangular/demo/) - [source](./demo/gpu.js)

Stitches Google Street View and Photo Sphere tiles into an equirectangular image. For use in the browser, with Webpack or Browserify.

Also includes an [intermediate mode](#intermediate-mode) for higher quality WebGL rendering on low-end devices.

## Install

```sh
npm install google-panorama-equirectangular
```

## Example

For full examples, see the [demo/](demo/) folder, or [running from source](#running-from-source) for details.

Make sure to include the Google Client library first:

```html
  <script src="http://maps.google.com/maps/api/js?sensor=false"></script>
```

Then, in JavaScript:

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

It's recommended you specify `tiles` for an accurate result across different image types (panorama, photo sphere, etc).

```js
var load = require('google-panorama-equirectangular')
var panoData = require('google-panorama-by-id')
var id = 'dXZfBMex9_L7jO2JW3FTdA'

panoData(id, function (err, result) {
  var tiles = result.tiles
  load(id, { tiles: tiles, zoom: 2, canvas: myCanvas })
})
```

### events

#### `emitter.on('start', fn)`

Called when the stitching process begins, with `data` parameter that includes the output of [google-panorama-tiles](https://github.com/Jam3/google-panorama-tiles):

```js
{
  columns: Number,    // x tile count
  rows: Number,       // y tile count
  tileWidth: Number,  // tile size
  tileHeight: Number, // tile size
  width: Number,      // canvas size
  height: Number      // canvas size
}
```

#### `emitter.on('progress', fn)`

Called after a new tile has been loaded and drawn to the canvas.

```js
{
  count: Number,    // current # of tiles loaded
  total: Number,    // total number of tiles
  image: Image,     // an image for this tile, might be null
  position: [x, y], // the pixel position of the tile in the full image
}
```

In [intermediate mode](#intermediate-mode), the `image` might be an Image or a Canvas, depending on crop.

#### `emitter.on('not-found', fn)`

Called when an image is skipped due to it not being found. The `url` is passed.

#### `emitter.on('complete', fn)`

Called when the stitching is complete. The resulting `canvas` is passed as the parameter.

In [intermediate mode](#intermediate-mode), the passed `canvas` is the one used during cropping.

## Intermediate Mode

The default export stitches all tiles into a single Canvas element. This is convenient, but not ideal for low-end devices like iOS Safari. In some browsers, there is a maximum size for canvas elements, and no way to query this value. 

For example, in a 256MB RAM iPhone, the full canvas size must be less than `1024 * 1024 * 3` (3 MP).

WebGL applications can leverage "intermediate rendering" mode which keeps no more than a single 512x512 canvas in memory at a time. This allows higher quality panoramas to be stitched on low-end devices. The interface is the same, and can be required like this:

```js
var equirect = require('google-panorama-equirectangular/intermediate')
```

Each `'progress'` event simply returned a cropped image for that tile. You will need to stitch and upload sub-images yourself to WebGL. See [demo/gpu.js](demo/gpu.js) for an example.

In intermediate mode, the `imgage` field of `'progress'` events might be a canvas or image, depending on whether a crop was necessary. The `originalImage` is provided to allow access to the HTMLImageElement, so the event data is:

```js
{
  count: Number,
  total: Number,
  image: Canvas|Image,
  position: [x, y],
  originalImage: Image
}
```

## Running From Source

To run the demos from source:

```sh
git clone https://github.com/mattdesl/google-panorama-equirectangular.git
cd google-panorama-equirectangular
npm install
```

Now run one of the demos:

```sh
# the simple WebGL demo
npm run webgl

# the simple 2D DOM demo
npm run 2d

# the GPU stitching demo
npm run gpu
```

And open [http://localhost:9966/](http://localhost:9966/). Changing the source will re-load the browser page.

## Also See

- [google-panorama-zoom-level](https://github.com/Jam3/google-panorama-zoom-level)
- [google-panorama-by-id](https://github.com/Jam3/google-panorama-by-id)
- [google-panorama-by-location](https://github.com/Jam3/google-panorama-by-location)
- [google-panorama-tiles](https://github.com/Jam3/google-panorama-tiles)
- [awesome-streetview](https://github.com/Jam3/awesome-streetview)

## Credits

Thanks to @thespite's prior work on [PanomNom.js](https://github.com/spite/PanomNom.js/), which was used as a reference while building these modules.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/google-panorama-equirectangular/blob/master/LICENSE.md) for details.
