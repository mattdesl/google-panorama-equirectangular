var getWebGL = require('webgl-context')

// iOS is restricted to 3-5MP canvas elements in RAM
// this is different than VRAM max texture size,
// but we can use it for a very rough check of hardware
// capability

module.exports = function (gl) {
  var maxGLSize = getMaxTextureSize(gl)
  return (maxGLSize <= 4096) ? 2 : 4
}

function getMaxTextureSize (gl) {
  gl = gl || getWebGL()
  return gl.getParameter(gl.MAX_TEXTURE_SIZE)
}
