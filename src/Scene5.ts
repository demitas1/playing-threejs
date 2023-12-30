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


class Scene5 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  _light: THREE.DirectionalLight;

  constructor(domElement: HTMLElement) {
    super();

    this.initUI();
    this.initScene(domElement);
  }

  async initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    // axes helper
    this.add(new THREE.AxesHelper(5.0));

    // add Light
    this._light = new THREE.DirectionalLight(
      0xffffff,
      1.0);
    this._light.position.set(2.0, 5.0, 1.0);
    this._light.target.position.set(0.0, 0.0, 0.0);
    this._light.castShadow = true;
    this.add(this._light);
    this._light.shadow.camera.top = 2;
    this._light.shadow.camera.bottom = -2;
    this._light.shadow.camera.left = -2;
    this._light.shadow.camera.right = 2;
    this._light.shadow.camera.near = 0.1;
    this._light.shadow.camera.far = 20;

    // camear helper for debug
    const helper = new THREE.CameraHelper(this._light.shadow.camera);
    this.add(helper);

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
    const geomCube = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({
      map: textureColorGrid,
    });

    const cube = new THREE.Mesh(geomCube, material);
    cube.castShadow = true;
    this.add(cube);

    // create ground
    const geomGround = new THREE.PlaneGeometry(10, 10);
    const planeGround = new THREE.Mesh(
      geomGround,
      new THREE.MeshPhongMaterial({
        map: textureColorGrid,
      }));
    planeGround.rotateX(-Math.PI / 2);
    planeGround.position.y = -1.0;
    planeGround.receiveShadow = true;
    this.add(planeGround);
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
          detail: '(end scene5)',
        }
      );
      window.dispatchEvent(ev);
    };
    this._domUI.appendChild(button1);
  }

  onResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
  }

  updateScene() {
    this._stats.update();
    this._light.target.updateMatrixWorld();
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


export { Scene5 };
