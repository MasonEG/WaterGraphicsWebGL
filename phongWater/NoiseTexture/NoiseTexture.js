
// Basic example of loading an image as a texture and mapping it onto a
// square. Edit the coordinates of the square or edit the texture coordinates
// to experiment.  Image filename is given directly below.  Use the "1" and
// "2" keys to switch from NEAREST to LINEAR magnification filter.
//
// For security reasons the browser restricts access to the local filesystem.
// To run the example, open a command shell in any directory above your examples
// and your teal book utilities, and run python -m SimpleHttpServer 2222
// or python3 -m http.server
// Then point your browser to http://localhost:2222 and navigate to the
// example you want to run.  For alternatives see
// https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally
//

// edit to configure the texture (which is created around line 410 using
// the createNoiseTexture function below.)
var size = 256;
var frequency = 20;
var octaves = 4;

var noiseMaker = new ClassicalNoise();

function createNoiseTexture(size, frequency, octaves)
{

  var canvas = document.createElement('canvas');

  canvas.height=size;
  canvas.width=size;

  // create an image programmatically by drawing to an offscreen html canvas
  var context = canvas.getContext("2d");
  var images = [];
  var imageData=context.createImageData(size, size);
  // The property data will contain an array of int8
  var data=imageData.data;

  let min = 0;
  let max = 0;

  let delta = (1.0 / size);
  for (let h = 0; h < size; ++h)
  {
    let z = h * delta;
    for (let i = 0; i < size; ++i)
    {
      let x = i * delta;
      for (let j = 0; j < size; ++j)
      {
        let y = j * delta;

        let nn = 0.0;
        let f = frequency;
        for (let k = 0; k < octaves; ++k)
        {
          nn += noiseMaker.noise(x * f, y * f, z * f) / f;
          f *= 2;
        }

        if (nn < min) min = nn;
        if (nn > max) max = nn;

        // offset within the array, treating i as row
        let base = i * size + j;

         // values appear to be about +/- .27, so scale appropriately
         let nnn = (nn + 0.5) * 256;
        data[base*4+0] = nnn;
        data[base*4+1] = nnn;
        data[base*4+2] = nnn;
        data[base*4+3]=256.0; // alpha (transparency)

      } // j loop
    } // i loop
    context.putImageData(imageData, 0, 0);
    images.push(canvas);
  }// z loop

  console.log("min " + min);
  console.log("max " + max);

  //context.putImageData(imageData, 0, 0); // at coords 0,0
  // return canvas;
  return images;
}


// Raw data for some point positions - this will be a square, consisting
// of two triangles.  We provide two values per vertex for the x and y coordinates
// (z will be zero by default).
var numPoints = 6;

 var vertices = new Float32Array([
-0.5, -0.5,
0.5, -0.5,
0.5, 0.5,
-0.5, -0.5,
0.5, 0.5,
-0.5, 0.5
]
);

// alternatively, try vertices for a trapezoid
// var vertices = new Float32Array([
// -0.5, -0.5,
// 0.5, -0.5,
// 0.25, 0.5,
// -0.5, -0.5,
// 0.25, 0.5,
// -0.25, 0.5
// ]
// );

// most straightforward way to choose texture coordinates
var texCoords = new Float32Array([
0.0, 0.0,
1.0, 0.0,
1.0, 1.0,
0.0, 0.0,
1.0, 1.0,
0.0, 1.0,
]);

// var texCoords = new Float32Array([
// 0.0, 0.0,
// 1.0, 0.0,
// .75, 1.0,
// 0.0, 0.0,
// .75, 1.0,
// 0.25, 1.0,
// ]);


//demonstrates wrapping behavior
// var texCoords = new Float32Array([
// 0.0, 0.0,
// 2.0, 0.0,
// 2.0, 1.0,
// 0.0, 0.0,
// 2.0, 1.0,
// 0.0, 1.0,
// ]);

//// demonstrates wrapping behavior
// var texCoords = new Float32Array([
// 0.5, 0.5,
// 1.5, 0.5,
// 1.5, 1.5,
// 0.5, 0.5,
// 1.5, 1.5,
// 0.5, 1.5,
// ]);

////slightly wacky
// var texCoords = new Float32Array([
// 0.0, 0.0,
// 1.0, 0.0,
// 0.5, 1.0,
// 0.0, 0.0,
// 0.5, 1.0,
// 0.5, 1.0,
// ]);

//////slightly wacky
// var texCoords = new Float32Array([
// 0.0, 0.0,
// 1.0, 0.0,
// 1.25, 1.0,
// 0.0, 0.0,
// 1.25, 1.0,
// -.25, 1.0,
// ]);

////slightly wacky
//var texCoords = new Float32Array([
//0.0, 0.0,
//1.0, 0.0,
//1.0, 1.0,
//0.0, 0.0,
//2.0, 2.0,
//0.0, 2.0
//]);

// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexbuffer;
var texCoordBuffer;

// handle to the compiled shader program on the GPU
var shader;

// handle to the texture object on the GPU
var textureHandle;



//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
return String.fromCharCode(event.which)   // the rest
} else {
return null // special key
}
}

//handler for key press events will choose which axis to
//rotate around
function handleKeyPress(event)
{
var ch = getChar(event);

switch(ch)
{


case '1':
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  break;
case '2':
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  break;
case '3':
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  break;


  default:
    return;
}
}



// code to actually render our geometry
function draw()
{
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // bind the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.  Don't worry about
  // the last three args just yet.)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // bind the texture coordinate buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  var texCoordIndex = gl.getAttribLocation(shader, 'a_TexCoord');
  if (texCoordIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(texCoordIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.  Don't worry about
  // the last three args just yet.)
  gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);

  // we can unbind the buffer now (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // need to choose a texture unit, then bind the texture to TEXTURE_2D for that unit
  var textureUnit = 3;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);

  // once we have the texture handle bound, we don't need 3
  // to be the active texture unit any longer - what matters is
  // that we pass in 3 when setting the uniform for the sampler
  gl.activeTexture(gl.TEXTURE0);

  var loc = gl.getUniformLocation(shader, "sampler");

  // sampler value in shader is set to index for texture unit
  gl.uniform1i(loc, textureUnit);

  // draw, specifying the type of primitive to assemble from the vertices
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  //gl.drawArrays(gl.LINES, 0, numPoints);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);

}


function main() {


  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is
  // redrawn

  // key handler
  window.onkeypress = handleKeyPress;


  // retrieve <canvas> element
  var canvas = document.getElementById('theCanvas');

  // get the rendering context for WebGL, using the utility from the teal book
  gl = getWebGLContext(canvas);
  //gl = getWebGLContext(canvas, {"antialias": false});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }


  // query the GPU for the number of available texture units
  console.log("Texture units: " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
  var ext = gl.getExtension("EXT_texture_filter_anisotropic");
  if (ext)
  {
    var max_anisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    //gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
    console.log("Anisotropy: " + max_anisotropy)
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById('vertexShader').textContent;
  var fshaderSource = document.getElementById('fragmentShader').textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // retain a handle to the shader program, then unbind it
  // (This looks odd, but the way initShaders works is that it "binds" the shader and
  // stores the handle in an extra property of the gl object.  That's ok, but will really
  // mess things up when we have more than one shader pair.)
  shader = gl.program;
  gl.useProgram(null);

  // request a handle for a chunk of GPU memory
  vertexbuffer = gl.createBuffer();
  if (!vertexbuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // request a handle for a chunk of GPU memory
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // ask the GPU to create a texture object
  textureHandle = gl.createTexture();

  // choose a texture unit to use during setup, defaults to zero
  // (can use a different one when drawing)
  // max value is MAX_COMBINED_TEXTURE_IMAGE_UNITS
  gl.activeTexture(gl.TEXTURE0);

  // bind the texture
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);

  // load the image bytes to the currently bound texture, flipping the vertical
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // create the noise texture
  image = createNoiseTexture(size, frequency, octaves);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[0]);

  // texture parameters are stored with the texture, not the texture unit
  // we have to change the default MIN_FILTER unless we create mipmaps
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //gl.NEAREST);

  // can also change the wrapping behavior, default is gl.REPEAT
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let imageIt = 0;
  // define an animation loop
  var animate = function() {
	   draw();

     console.log("Here");

     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[++imageIt]);


     /* TODO
      1. Make an array of images
      2. Don't just flip from one image to the next.  Try to interpolate inbetween them somehow.
      3. Instead of looping when the last image is rendered, change direction of sampled images (like a snake draft)
      Result: Hopefully a moving random image
     */

     console.log( noiseMaker.noise( 0.1, 0.2, imageIt / 200.0) );

     //TODO: Um, ok.  I don't know if there are multiple images being created?


	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate, canvas);
  };

  // start drawing!
  animate();


}



/*
Ideas:
  Caustics
  Waves



*/
