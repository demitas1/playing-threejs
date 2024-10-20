import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { ISceneBase } from './ISceneBase';

import style from '../public/style.css';


type ObjectRecord = Record<string, THREE.Object3D>;


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


const loadGLTF = (url: string) => {
  return new Promise<Record<string, any>>(resolve => {
    new GLTFLoader().load(url, resolve);
  });
};


class Scene5 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  _Objects: ObjectRecord;


  constructor(domElement: HTMLElement) {
    super();

    this._Objects = {};

    this.initUI();
    this.initScene(domElement);
  }

  async initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    // axes helper
    this.add(new THREE.AxesHelper(5.0));

    // add Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.add(ambientLight);

    // add Directional light to cast shadow
    const lightDirectional = new THREE.DirectionalLight(
      0xffffff,
      1.0);
    lightDirectional.position.set(2.0, 5.0, 5.0);
    lightDirectional.target.position.set(0.0, 0.0, 0.0);
    lightDirectional.castShadow = true;
    lightDirectional.shadow.mapSize.width = 512;
    lightDirectional.shadow.mapSize.height = 512;
    lightDirectional.shadow.radius = 5;
    lightDirectional.shadow.blurSamples = 25;
    // light frustum for cast shadow
    lightDirectional.shadow.camera.top = 2;
    lightDirectional.shadow.camera.bottom = -2;
    lightDirectional.shadow.camera.left = -2;
    lightDirectional.shadow.camera.right = 2;
    lightDirectional.shadow.camera.near = 0.1;
    lightDirectional.shadow.camera.far = 20;
    this.add(lightDirectional);

    // camear helper for debug
    const helper = new THREE.CameraHelper(
      lightDirectional.shadow.camera);
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

    // load gltf for vehicle
    const gltfVehicle = await loadGLTF('mesh/vehicle-test.glb');

    gltfVehicle.scene.traverse((n: THREE.Object3D) => {
      // load "base" mesh, and add "base" to the scene
      if (n.name === 'base') {
        this.add(n);
        this._Objects['vehicle'] = n;
      }

      // load "wheel" mesh
      if (n.name === 'wheel') {
        this._Objects['wheel'] = n;
        // do not add wheel to the scene directly
      }
    });

    // traverse graph to set cast/receive shadow
    if (this._Objects['vehicle']) {
      this._Objects['vehicle'].traverse((n) => {
        if (n.type === 'Mesh') {
          (<THREE.Mesh>n).castShadow = true;
          (<THREE.Mesh>n).receiveShadow = true;
        }
      });
    }

    // load gltf file for ground
    const gltfRoad = await loadGLTF('mesh/road_straight_1p1v1v1p.glb');
    gltfRoad.scene.traverse((n: THREE.Object3D) => {
      // load "Cube" group
      // add "Cube" group to the scene
      if (n.name === 'Cube') {
        this.add(n);
        this._Objects['road'] = n;
      }
    });

    // traverse graph to set receive shadow
    if (this._Objects['road']) {
      this._Objects['road'].traverse((n) => {
        if (n.type === 'Mesh') {
          (<THREE.Mesh>n).receiveShadow = true;
        }
      });
    }
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
    console.log(`style: ${_style}`);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // html load external html file
    const htmlHUD = `
      <h1>Scene 5</h1>
      <div>Load mesh from glTF file</div>
    `;
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
    this._camera.updateProjectionMatrix();
  }

  updateScene(timeDelta: number) {
    this._stats.update();

    const vehicle1 = this._Objects["vehicle"];
    if (vehicle1) {
      vehicle1.rotation.y += (Math.PI * timeDelta * 0.1);
    }

    const wheel1 = this._Objects["wheel"];
    if (wheel1) {
      wheel1.rotation.y += - (Math.PI * timeDelta * 0.5);
    }
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
