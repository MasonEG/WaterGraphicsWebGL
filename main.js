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
//let planeGeometry = new THREE.PlaneGeometry(500, 500, 500, 500);
let planeGeometry = new THREE.CubeGeometry(1000, 1000, 10, 100, 100, 2);
planeGeometry.rotateX(1.5 * Math.PI);
let waterMat = new THREE.MeshPhongMaterial({color: 0x0087E6, shininess: 100, transparent: true, opacity: 0.8});
let waterMesh = new THREE.Mesh(planeGeometry, waterMat);
waterMesh.geometry.dynamic = true;
waterMesh.geometry.__dirtyVertices = true;
scene.add(waterMesh);
var updateIncrement = 0.1;

function animate() {
    waterMesh.geometry.vertices.forEach(vertex => {
        vertex.y = ( //calculating waves, play with here
            2 * (Math.sin(0.05 * ((250 - vertex.x) + updateIncrement))
            + Math.cos(0.05 * ((250 - vertex.z) + updateIncrement)))
            + 3 * Math.cos(0.04 * (500 - vertex.x - updateIncrement))
            + 10 * Math.sin(0.03 * (vertex.z + updateIncrement)) 
            + 30 * Math.cos(0.01 * (vertex.x + updateIncrement))
        );
    });
    waterMesh.geometry.verticesNeedUpdate = true;
    updateIncrement += 0.3;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
