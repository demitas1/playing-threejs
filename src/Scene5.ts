import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { ISceneBase } from './ISceneBase';

import style from '../public/style.css';


type MeshRecord = Record<string, THREE.Mesh>;
type prepareMesh = (record: MeshRecord) => void;


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

  _Objects: MeshRecord;


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
    lightDirectional.shadow.mapSize.width = 4096;
    lightDirectional.shadow.mapSize.height = 4096;
    lightDirectional.castShadow = true;
    this.add(lightDirectional);
    // light frustum for cast shadow
    lightDirectional.shadow.camera.top = 2;
    lightDirectional.shadow.camera.bottom = -2;
    lightDirectional.shadow.camera.left = -2;
    lightDirectional.shadow.camera.right = 2;
    lightDirectional.shadow.camera.near = 0.1;
    lightDirectional.shadow.camera.far = 20;

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

    // create a simple qube.
    const geomCube = new THREE.BoxGeometry();
    const matCube = new THREE.MeshPhongMaterial({
      map: textureColorGrid,
    });

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
    this.addMeshFromGLTF(
      'mesh/vehicle-test.glb',
      (record) => {
        // TODO: check parent-child relationship to set shadow
        let mesh;
        mesh = record['base'];
        if (mesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this.add(mesh);
          this._Objects['vehicle'] = mesh;
        }

        // 'wheel' is a descendant of 'base'
        mesh = record['wheel'];
        if (mesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          this._Objects['wheel'] = mesh;
          // do not add wheel to the scene directly
        }
      }
    );

    // load gltf file for ground
    this.addMeshFromGLTF(
      'mesh/road-test.glb',
      (record) => {
        if (record['Cube']) {
          const mesh = record['Cube']
          mesh.receiveShadow = true;
          this.add(mesh);
        }
      }
    );
  }

  async addMeshFromGLTF(
    url: string,
    funcPrepareMesh: prepareMesh
  ) {
    const gltf: Record<string, any> = await loadGLTF(url);
    const root: THREE.Object3D = gltf.scene;

    const meshRecord: MeshRecord = {};

    // find child mesh in the gltf
    root.traverse((child: any) => {
      const nodeType = (<THREE.Object3D>child).type;
      const nodeName = (<THREE.Object3D>child).name;
      console.log(`node: ${nodeType}: "${nodeName}"`);

      if (nodeType === 'Mesh') {
        const meshToAdd = <THREE.Mesh>child;
        console.log(meshToAdd);

        meshRecord[nodeName] = meshToAdd;

        // process mesh tree graph
        if (funcPrepareMesh) {
          funcPrepareMesh(meshRecord);
        }

      }
    });
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
