import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

// styles for DOM elements
import style from './assets/style.css';

// HUD json file
import hud from './assets/data/hud.json';


class Scene2 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();

    this.initRenderer();
    this.initScene(domElement);
    this.initUI();
  }

  initRenderer() {
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._camera.position.z = 2;
  }

  initControls(domElement: HTMLElement) {
    this._controls = new OrbitControls(
      this._camera,
      domElement
    );
    // on 'change' do nothing. rendering is done by animation.
    this._controls.addEventListener('change', () => {});
  }

  initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true,
    });

    const cube = new THREE.Mesh(geometry, material);
    this.add(cube);
  }

  initUI() {
    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // json load test
    console.log(hud);
    // TODO: construct HUD UI based on hud.json

    // html load test
    // TODO: replace this with hud.json
    const htmlHUD = `
      <h1>heading level 1</h1>
      <div>Scene 2</div>
    `;
    this._domUI = document.createElement('div');
    document.body.appendChild(this._domUI);
    this._domUI.classList.add(style.myHUD);
    this._domUI.insertAdjacentHTML('beforeend', htmlHUD);

    // normal DOM button
    const button1 = document.createElement('BUTTON');
    button1.classList.add(style.myButton);
    button1.innerHTML = 'Click me!';
    button1.onclick = () => {
      const ev = new CustomEvent(
        'sceneEnd',
        {
          detail: '(end scene2)',
        }
      );
      window.dispatchEvent(ev);
    };
    this._domUI.appendChild(button1);
  }

  onResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
  }

  updateScene() {
    this._stats.update();
  }

  getScene() : THREE.Object3D {
    return this;
  }

  getCamera() : THREE.Camera {
    return this._camera;
  }

  disposeScene() {
    // dispose UI elements
    document.body.removeChild(this._stats.dom);
    document.body.removeChild(this._domUI);
  }
}


export { Scene2 };
