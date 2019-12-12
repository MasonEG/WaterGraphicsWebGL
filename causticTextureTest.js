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
pointLight.position.set(200, 200, 300);
scene.add(pointLight);
//\setup

//build the water
let causticUrls = [
    './caustic_00.png',
    'caustic_01.png',
    'caustic_03.png',
    'caustic_04.png'
];

let texLoader = new THREE.TextureLoader();

//let planeGeometry = new THREE.PlaneGeometry(500, 500, 500, 500);
let planeGeometry = new THREE.CubeGeometry(1000, 1000, 10, 100, 100, 2);
planeGeometry.rotateX(1.5 * Math.PI);
let waterMat = new THREE.MeshPhongMaterial({
    color: 0x0087E6, 
    shininess: 100, 
    specularMap: texLoader.load(causticUrls[0]),
});
let waterMesh = new THREE.Mesh(planeGeometry, waterMat);
// waterMesh.geometry.dynamic = true;
// waterMesh.geometry.__dirtyVertices = true;
scene.add(waterMesh);
// var updateIncrement = 0.4;

function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
