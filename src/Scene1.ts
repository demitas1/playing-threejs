import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

import style from '../public/style.css';


// loader wrapper
const loadTexture = (url: string) => {
  return new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      resolve,
      undefined,  // onProgress callback (not suppoted)
      reject);
  });
}


class Scene1 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();

    this.initUI();
    this.initScene(domElement);
  }

  async initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    // add Light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    this.add(directionalLight);

    // load texture
    let textureColorGrid;
    try {
      textureColorGrid = await loadTexture('texture/color_grid.png');
    } catch (err) {
      console.error('error on load texture');
      console.error(err);
    }
    //console.log(textureColorGrid);

    // create a simple qube.
    const geometry = new THREE.BufferGeometry();
    const v = new Float32Array([
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0,
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0, -1.0, -1.0,
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
    ]);

    const iv: Array<number> = [
      0, 2, 1,
      0, 3, 2,
      4, 6, 5,
      4, 7, 6,
      8, 10, 9,
      8, 11, 10,
      12, 14, 13,
      12, 15, 14,
      16, 18, 17,
      16, 19, 18,
      20, 22, 21,
      20, 23, 22,
    ];

    const uv = new Float32Array([
      0.375, 0.75,
      0.375, 1.0,
      0.625, 1.0,
      0.625, 0.75,

      0.625, 0.5,
      0.625, 0.25,
      0.375, 0.25,
      0.375, 0.5,

      0.625, 0.5,
      0.375, 0.5,
      0.375, 0.75,
      0.625, 0.75,

      0.625, 0.0,
      0.375, 0.0,
      0.375, 0.25,
      0.625, 0.25,

      0.875, 0.75,
      0.875, 0.5,
      0.625, 0.5,
      0.625, 0.75,

      0.375, 0.75,
      0.375, 0.5,
      0.125, 0.5,
      0.125, 0.75,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(v, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setIndex(iv);

    const material = new THREE.MeshBasicMaterial({
      map: textureColorGrid,
    });

    const cube = new THREE.Mesh(geometry, material);
    this.add(cube);
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._camera.position.x = 4.0;
    this._camera.position.z = 5.0;
    this._camera.position.y = 3.0;
  }

  initControls(domElement: HTMLElement) {
    this._controls = new OrbitControls(
      this._camera,
      domElement
    );
    // on 'change' do nothing. rendering is done by animation.
    this._controls.addEventListener('change', () => {});
  }

  async initUI() {
    const _style = style;  // reference to css to access hashed class names
    console.log(`style: ${_style.hello}`);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // html load external html file
    const r = await fetch('data/hud.html');
    const htmlHUD = await r.text();

    this._domUI = document.createElement('div');
    document.body.appendChild(this._domUI);
    this._domUI.classList.add('myHUD');
    this._domUI.insertAdjacentHTML('beforeend', htmlHUD);

    // add DOM button to UI
    const button1 = document.createElement('div');
    button1.classList.add('myButton');
    button1.innerHTML = 'Click me!';
    button1.onclick = () => {
      const ev = new CustomEvent(
        'sceneEnd',
        {
          detail: '(end scene1)',
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


export { Scene1 };
