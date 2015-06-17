var getWebGL = require('webgl-context')

module.exports = function (gl) {
  // iOS is restricted to 5MP canvases
  var maxGLSize = getMaxTextureSize(gl)
  return (maxGLSize <= 4096) ? 2 : 4
}

function getMaxTextureSize (gl) {
  gl = gl || getWebGL()
  return gl.getParameter(gl.MAX_TEXTURE_SIZE)
}
