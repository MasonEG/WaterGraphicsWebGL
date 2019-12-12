//
// Test of HeightMap.js renders a wireframe.  Edit lines ~60-65
// to change the height map function.
//

// Noise function to use with height map
var noiseMaker = new ClassicalNoise();
var frequency = 4;
var octaves = 1;
var increment = 0.0;
var noise2D = function(x, z)
{
  let nn = 0.0;
  let f = frequency;
  for (let k = 0; k < octaves; ++k)
  {
    //double arg[2] = {x * f, y * f};
    //nn += noise2(arg) / f;
    nn += noiseMaker.noise(x * f * Math.cos(increment), z * f * Math.cos(increment), 0) / ( f * 4 );
    f *= increment;
  }
  return nn;
}

let test = (x, z) => {
  return (
     0.1 * noiseMaker.noise(x, z + increment, 0)
    + 0.2 * noiseMaker.noise(z, x - increment, 0)
    + 0.1 * noiseMaker.noise(x + increment, z, 0)
    + 0.1 * noiseMaker.noise(z, x + increment, 0)
    + 0.1 * noiseMaker.noise(x - increment, z, 0)
    - 0.2
  );
}


// a couple of sample functions for the height map
var heightMap = new HeightMap(test, 200, 200, -1, 1, -1, 1);

// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexNormalBuffer;
var indexBuffer;

var vertexBufferCaustics;
var indexBufferCaustics;


// handle to the compiled shader program on the GPU
var shader;
var shaderCaustic;

// transformation matrices
var model = new Matrix4();

//view matrix
//One strategy is to identify a transformation to our camera frame,
//then invert it.  Here we use the inverse of
//rotate(30, 0, 1, 0) * rotateX(-45) * Translate(0, 0, 5)
//var view = new Matrix4().translate(0, 0, -5).rotate(45, 1, 0, 0).rotate(-30, 0, 1, 0);

//Alternatively, use the LookAt function, specifying the view (eye) point,
//a point at which to look, and a direction for "up".
//Approximate view point for the above is (1.77, 3.54, 3.06)
var view = new Matrix4().setLookAt(
		1.77, 1.54, 3.06,   // eye
		0, -0.5, 0,            // at - looking at the origin
		0, 1, 0);           // up vector - y axis


//Here use aspect ratio 3/2 corresponding to canvas size 600 x 400,
// and a 30 degree field of view
var projection = new Matrix4().setPerspective(30, 1.5, .1, 100);

//Or, here is the same perspective projection, using the Frustum function
//a 30 degree field of view with near plane at 4 corresponds
//view plane height of  4 * tan(15) = 1.07
//var projection = new Matrix4().setFrustum(-1.5 * 1.07, 1.5 * 1.07, -1.07, 1.07, 4, 6);

var axis = 'y';
var paused = true;

function loadHeightMapData()
{
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, heightMap.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, heightMap.meshIndices, gl.STATIC_DRAW);


  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

}

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
// rotate around
function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
    case '1':
      octaves = 1;
    break;
    case '2':
      octaves = 2;
    break;
    case '3':
      octaves = 3;
    break;
    case '4':
      octaves = 4;
    break;
    case '5':
      octaves = 5;
    break;
    case '6':
      octaves = 6;
    break;
    case '7':
      octaves = 7;
    break;

    case 'f':
      frequency += 1;
    break;
    case 'F':
      if (frequency > 1) frequency -= 1;
    break;

	// rotation controls
	case ' ':
		paused = !paused;
		break;
	case 'x':
		axis = 'x';
		break;
	case 'y':
		axis = 'y';
		break;
	case 'z':
		axis = 'z';
		break;
	case 'o':
		model.setIdentity();
		axis = 'x';
		break;
	}

  heightMap = new HeightMap(noise2D, 40, 40, -1, 1, -1, 1);
  loadHeightMapData();


}

// code to actually render our geometry
function draw()
{

  vertexNormalBuffer = createAndLoadBuffer(heightMap.normals);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, heightMap.vertices, gl.STATIC_DRAW);

  // request a handle to another chunk of GPU memory
  indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }

  // bind the buffer as the current "index" buffer, note the constant
  // ELEMENT_ARRAY_BUFFER rather than ARRAY_BUFFER
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // load our index data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, heightMap.meshIndices, gl.STATIC_DRAW);

  // now that the buffer is set up, we can unbind the buffer
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  //Load the Casutic mesh
  vertexBufferCaustics = gl.createBuffer();
  if (!vertexBufferCaustics) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCaustics);
  gl.bufferData(gl.ARRAY_BUFFER, heightMap.vertices, gl.STATIC_DRAW);
  indexBufferCaustics = gl.createBuffer();
  if (!indexBufferCaustics) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferCaustics);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, heightMap.meshIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);



  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

 // console.log(increment);
  // clear the framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

  // bind the shader
  gl.useProgram(shader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.uniform1f(gl.getUniformLocation(shader, "minY"), heightMap.minY);
  gl.uniform1f(gl.getUniformLocation(shader, "maxY"), heightMap.maxY);
  gl.uniform1i(gl.getUniformLocation(shader, "caustic"), 0);
  gl.uniform1i(gl.getUniformLocation(shader, "causticV"), 0);
  gl.uniform1f(gl.getUniformLocation(shader, "increment"), increment);
  // set uniform in shader for projection * view * model transformation
  var transform = new Matrix4().multiply(projection).multiply(view).multiply(model);
  var transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);

  //gl.drawArrays(gl.POINTS, 0, heightMap.numVertices);

  // bind the index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // draw - note use of function drawElements instead of drawArrays
  // gl.drawElements(gl.LINES, heightMap.numWireframeIndices, gl.UNSIGNED_SHORT, 0);
  gl.drawElements(gl.TRIANGLES, heightMap.numMeshIndices, gl.UNSIGNED_SHORT, 0);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }


  //Caustic floor
  gl.useProgram(shader);

  normalIndex = gl.getAttribLocation(shader, 'a_Normal');
  gl.enableVertexAttribArray(normalIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  gl.enableVertexAttribArray(positionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCaustics);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.uniform1i(gl.getUniformLocation(shader, "caustic"), 1);
  gl.uniform1i(gl.getUniformLocation(shader, "causticV"), 1);
  gl.uniform1f(gl.getUniformLocation(shader, "minY"), heightMap.minY);
  gl.uniform1f(gl.getUniformLocation(shader, "maxY"), heightMap.maxY);
  loc = gl.getUniformLocation(shader, "lightVector");
  gl.uniform4f(loc, 0.0, 1.0, 0.0, 0.0);
  transform = new Matrix4().multiply(projection).multiply(view).multiply(model);
  transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);
  loc = gl.getUniformLocation(shader, "normalMatrix");
  gl.uniformMatrix3fv(loc, false, makeNormalMatrixElements(transform, new THREE.Matrix4()));
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.drawElements(gl.TRIANGLES, heightMap.numMeshIndices, gl.UNSIGNED_SHORT, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


  //Edit this to the caustic buffers




  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

// entry point when page is loaded
function main() {

  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is
  // redrawn

  // retrieve <canvas> element
  var canvas = document.getElementById('theCanvas');

  // key handlers
  window.onkeypress = handleKeyPress;

  // get the rendering context for WebGL, using the utility from the teal book
  gl = getWebGLContext(canvas, false);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //Enable the derivative extension
  gl.getExtension('OES_standard_derivatives');

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

  //normalsArray
  vertexNormalBuffer = createAndLoadBuffer(heightMap.normals);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, heightMap.vertices, gl.STATIC_DRAW);

  // request a handle to another chunk of GPU memory
  indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }

  // bind the buffer as the current "index" buffer, note the constant
  // ELEMENT_ARRAY_BUFFER rather than ARRAY_BUFFER
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // load our index data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, heightMap.meshIndices, gl.STATIC_DRAW);

  // now that the buffer is set up, we can unbind the buffer
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  //Load the Casutic mesh
  vertexBufferCaustics = gl.createBuffer();
  if (!vertexBufferCaustics) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCaustics);
  gl.bufferData(gl.ARRAY_BUFFER, heightMap.vertices, gl.STATIC_DRAW);
  indexBufferCaustics = gl.createBuffer();
  if (!indexBufferCaustics) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferCaustics);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, heightMap.meshIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);



  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = function() {
	draw();
    increment += 0.1;
  // noiseMaker = new ClassicalNoise();
  //  heightMap = new HeightMap(noise2D, 40, 40, -1, 1, -1, 1);
  heightMap = new HeightMap(test, 200, 200, -1, 1, -1, 1);

  // loadHeightMapData();

	// increase the rotation by 1 degree, depending on the axis chosen
	if (!paused)
	{

  		// multiply on *left* by a new one-degree rotation about the chosen axis
		  // this always rotates about one of the world coordinate axes
	  switch(axis)
	  {
		case 'x':
			model = new Matrix4().setRotate(0.1, 1, 0, 0).multiply(model);
			axis = 'x';
			break;
		case 'y':
			axis = 'y';
			model = new Matrix4().setRotate(0.1, 0, 1, 0).multiply(model);
			break;
		case 'z':
			axis = 'z';
			model = new Matrix4().setRotate(0.1, 0, 0, 1).multiply(model);
			break;
		default:
		}

  		// multiply on *right* by a new one-degree rotation about the chosen axis
		  // this always rotates about one of the cube's local coordinate axes
   // switch(axis)
   // {
   // case 'x':
   //   model.rotate(1, 1, 0, 0);
   //   axis = 'x';
   //   break;
   // case 'y':
   //   axis = 'y';
   //   model.rotate(1, 0, 1, 0);
   //   break;
   // case 'z':
   //   axis = 'z';
   //   model.rotate(1, 0, 0, 1);
   //   break;
   // default:
		// }

    // another way to get the same effect as above: multiply on left by
		// a new one-degree rotation about TRANSFORMED axis
//    var v;
//    switch(axis)
//    {
// 		case 'x':
//		  v = new Vector3([1, 0, 0]);
//      axis = 'x';
//      break;
//    case 'y':
//      axis = 'y';
//      v = new Vector3([0, 1, 0]);
//      break;
//    case 'z':
//      v = new Vector3([0, 0, 1]);
//
//      axis = 'z';
//      break;
//    default:
//		}
//    var newAxis = model.multiplyVector3(v);
//    var e = newAxis.elements;
//    model = new Matrix4().setRotate(1, e[0], e[1], e[2]).multiply(model);

	}

	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate, canvas);
  };

  // start drawing!
  console.log(heightMap.normals);

  animate();


}
