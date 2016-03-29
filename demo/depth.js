var THREE = require('three');
var equirect = require('../');
var jsonp = require('jsonp');
var panorama = require('google-panorama-by-location');
var createOrbitViewer = require('three-orbit-viewer')(THREE);
var zlib = require('zlib');

var app = createOrbitViewer({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 45,
  position: new THREE.Vector3(0, 0, -0.1)
});

var texture = new THREE.Texture();
texture.minFilter = THREE.LinearFilter;
texture.generateMipmap = false;

// transparent canvas to start (white)
var canvas = document.createElement('canvas');
texture.needsUpdate = true;
texture.image = canvas;

// add a double-sided sphere
var geo = new THREE.SphereGeometry(1, 84, 84);
var mat = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
});
var sphere = new THREE.Mesh(geo, mat);
app.scene.add(sphere);

// flip the texture along X axis
sphere.scale.x = -1;

// var location = [40.7588902, -73.9852057]; // <-- invalid depth map
var location = [35.659607, 139.700378];
// var location = [43.6473963,-79.3923407];
// var location = [42.345601, -71.098348];

panorama(location, {
  source: google.maps.StreetViewSource.OUTDOOR,
  preference: google.maps.StreetViewPreference.NEAREST
}, function (err, result) {
  if (err) throw err

  console.log(result.id)
  // load the equirectangular image
  equirect(result.id, {
    tiles: result.tiles,
    canvas: canvas,
    crossOrigin: 'Anonymous',
    zoom: 2
  })
    .on('complete', function (image) {
      texture.needsUpdate = true;
      parseDepth(result.id, (err, result) => {
        if (err) throw err;
        var canvas2 = createDepthTexture(result.depthMap, result.width, result.height);
        canvas2.style.position = 'absolute';
        canvas2.style.top = result.height + 'px';
        canvas2.style.left = '0';
        canvas2.style.width = result.width + 'px';
        document.body.appendChild(canvas2);

        image.style.position = 'absolute';
        image.style.top = '0';
        image.style.left = '0';
        image.style.width = result.width + 'px';
        document.body.appendChild(image);
      });
    })
    .on('progress', function (ev) {
      texture.needsUpdate = true;
    });
});

function parseDepth (id, cb) {
  var url = 'http://maps.google.com/cbk?output=json&cb_client=maps_sv&v=4&dm=1&pm=1&ph=1&w=1024&h=1024&hl=en&panoid=' + id;
  // var url = 'https://cbks2.google.com/cbk?output=json&cb_client=maps_sv&v=4&dm=1&pm=1&ph=1&w=1024&h=1024&hl=en&panoid=' + id;

  jsonp(url, function (err, data) {
    if (err) return cb(err);
    parseJsonData(data);
  });

  function parseJsonData (data) {
    // Append '=' in order to make the length of the array a multiple of 4
    var depthMap = data.model.depth_map;
    while (depthMap.length % 4 !== 0) {
      depthMap += '=';
    }

    // Replace '-' by '+' and '_' by '/'
    depthMap = depthMap.replace(/-/g, '+');
    depthMap = depthMap.replace(/_/g, '/');

    var depth = new Buffer(depthMap, 'base64');
    zlib.inflate(depth, function (err, decompressed) {
      if (err) throw err;
      var uint8 = toArrayBuffer(decompressed);
      var dataView = new DataView(uint8.buffer);
      var header = parseHeader(dataView);
      var data = parsePlanes(header, dataView);
      var depthMap2D = computeDepthMap(header, data.indices, data.planes);
      cb(null, depthMap2D);
    });
  }

  function parseHeader (depthMap) {
    return {
      headerSize: depthMap.getUint8(0),
      numberOfPlanes: depthMap.getUint16(1, true),
      width: depthMap.getUint16(3, true),
      height: depthMap.getUint16(5, true),
      offset: depthMap.getUint16(7, true)
    };
  }

  function parsePlanes (header, depthMap) {
    var planes = [];
    var indices = [];
    var i, d, byteOffset;
    var n = [0, 0, 0];

    for (i = 0; i < header.width * header.height; ++i) {
      indices.push(depthMap.getUint8(header.offset + i));
    }

    for (i = 0; i < header.numberOfPlanes; ++i) {
      byteOffset = header.offset + header.width * header.height + i * 4 * 4;
      n[0] = depthMap.getFloat32(byteOffset, true);
      n[1] = depthMap.getFloat32(byteOffset + 4, true);
      n[2] = depthMap.getFloat32(byteOffset + 8, true);
      d = depthMap.getFloat32(byteOffset + 12, true);
      planes.push({
        n: n.slice(0),
        d: d
      });
    }

    return { planes: planes, indices: indices };
  }

  function toArrayBuffer (buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return view;
  }

  function computeDepthMap (header, indices, planes) {
    var x, y, planeIdx, phi, theta;
    var plane, t;
    var v = [0, 0, 0];
    var w = header.width;
    var h = header.height;
    var depthMapValues = new Float32Array(w * h);

    var groundIndex = indices[w * h - 1];
    var groundHeight = planes[groundIndex].d;
    var normals = new Float32Array(w * h);

    for (y = 0; y < h; ++y) {
      for (x = 0; x < w; ++x) {
        planeIdx = indices[y * w + x];

        phi = (w - x - 1) / (w - 1) * 2 * Math.PI + Math.PI / 2;
        theta = (h - y - 1) / (h - 1) * Math.PI;

        v[0] = Math.sin(theta) * Math.cos(phi);
        v[1] = Math.sin(theta) * Math.sin(phi);
        v[2] = Math.cos(theta);

        if (planeIdx > 0) {
          plane = planes[planeIdx];

          t = plane.d / (v[0] * plane.n[0] + v[1] * plane.n[1] + v[2] * plane.n[2]);
          v[0] *= t;
          v[1] *= t;
          v[2] *= t;
          depthMapValues[y * w + (w - x - 1)] = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
          normals[y * w + (w - x - 1)] = { x: v[0], y: v[1], z: v[2] };
        } else {
          depthMapValues[y * w + (w - x - 1)] = 9999999999999999999.0;
        }
      }
    }

    return {
      normals: normals,
      planes: planes,
      groundHeight: groundHeight,
      width: w,
      height: h,
      depthMap: depthMapValues
    };
  }
}

function createDepthTexture (buffer, w, h) {
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var context = canvas.getContext('2d');

  var image = context.createImageData(w, h);
  var data = image.data;

  var distOff = 100;
  var c = 0;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var realX = w - 1 - x;
      c = buffer[y * w + x] / distOff * 255;
      data[4 * (y * w + realX)] = c;
      data[4 * (y * w + realX) + 1] = c;
      data[4 * (y * w + realX) + 2] = c;
      data[4 * (y * w + realX) + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas;
}
