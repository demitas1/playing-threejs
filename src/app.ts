import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

// styles for DOM elements
import style from './assets/style.css';

// scene
// TODO: separate SceneBase class and Scene1 class
// TODO: init() method and dispose() method
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);

// TODO: replace this with BufferGeometry
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// html load test
const htmlHUD = `
  <h1>heading level 1</h1>
`;
const div1 = document.createElement('div');
document.body.appendChild(div1);
div1.insertAdjacentHTML('beforeend', htmlHUD);


// normal DOM button
const button1 = document.createElement('BUTTON');
button1.classList.add(style.myButton);
button1.innerHTML = 'Click me!';
button1.onclick = () => {
  alert('Clicked.');
};
document.body.appendChild(button1);

// window resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// dat GUI
const gui = new GUI();
const cubeFolder = gui.addFolder('Cube');
const cubeRotationFolder = cubeFolder.addFolder('Rotation');
cubeRotationFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
cubeRotationFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
cubeRotationFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
cubeFolder.open();
cubeRotationFolder.open();
const cubePositionFolder = cubeFolder.addFolder('Position');
cubePositionFolder.add(cube.position, 'x', -10, 10, 2);
cubePositionFolder.add(cube.position, 'y', -10, 10, 2);
cubePositionFolder.add(cube.position, 'z', -10, 10, 2);
cubeFolder.open();
cubePositionFolder.open();
const cubeScaleFolder = cubeFolder.addFolder('Scale');
cubeScaleFolder.add(cube.scale, 'x', -5, 5);
cubeScaleFolder.add(cube.scale, 'y', -5, 5);
cubeScaleFolder.add(cube.scale, 'z', -5, 5);
cubeFolder.add(cube, 'visible');
cubeFolder.open();
cubeScaleFolder.open();

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'z', 0, 10);
cameraFolder.open();

// animate
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  stats.update();

  render();
}

// render
function render() {
  renderer.render(scene, camera);
}

animate();
//render();
