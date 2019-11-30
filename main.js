import * as THREE from './three.module.js';
import {OrbitControls} from './OrbitControls.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1000;
controls.maxDistance = 5000;

controls.update();

camera.position.set(0, 10, 0);


//load skybox
let urls = [
        'posx.jpg',
        'negx.jpg',
        'posy.jpg',
        'negy.jpg',
        'posz.jpg',
        'negz.jpg'
    ];
let cubeTexture = new THREE.CubeTextureLoader().load(urls);
cubeTexture.mapping = THREE.CubeRefractionMapping;
scene.background = cubeTexture;

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
var pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(800, 800, 300);
scene.add(pointLight);
//\setup

//build the water
// let geometry = new THREE.Geometry(); //doesn't work

// for(let i = 0; i < 100; i++) for(let j = 0; j < 100; j++) geometry.vertices.push(new THREE.Vector3(i, 5, j)); //add vertices
// for(let i = 2; i < 1000; i += 2) geometry.faces.push(new THREE.Face3(i - 2, i - 1, i));
// geometry.computeFaceNormals();
// geometry.computeVertexNormals();

// let testMat = new THREE.MeshStandardMaterial({color: 0xaa0000});

// scene.add(new THREE.Mesh(geometry, testMat));

let planeGeometry = new THREE.PlaneGeometry(500, 500, 500, 500);
planeGeometry.rotateX(1.5 * Math.PI);
//planeGeometry.translate(0, 10, 0);
let waterMat = new THREE.MeshPhongMaterial({color: 0x0087E6, shininess: 100, transparent: true, opacity: 0.5});
let waterMesh = new THREE.Mesh(planeGeometry, waterMat);
waterMesh.geometry.dynamic = true;
waterMesh.geometry.__dirtyVertices = true;
scene.add(waterMesh);
var updateIncrement = 0.1;

function animate() {
    waterMesh.geometry.vertices.forEach(vertex => {
        vertex.y = 8 * (Math.sin(0.05 * (vertex.x + updateIncrement)) + Math.cos(0.05 * (vertex.z + updateIncrement)));
    });
    waterMesh.geometry.verticesNeedUpdate = true;
    updateIncrement += 0.3;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
