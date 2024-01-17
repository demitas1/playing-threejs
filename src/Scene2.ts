import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { ISceneBase } from './ISceneBase';

import style from '../public/style.css';


// loader wrapper
const loadGLTF = (url: string) => {
  return new Promise<Record<string, any>>(resolve => {
    new GLTFLoader().load(url, resolve);
  });
};


class Scene2 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  _objButton: THREE.Object3D;

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

    // load gltf file
    const url = 'mesh/buttons-02.glb';
    const gltf: Record<string, any> = await loadGLTF(url);
    const root: THREE.Object3D = gltf.scene;
    const animations: Array<THREE.AnimationClip> = gltf.animations;

    // check animation content
    console.log(animations);

    // find child mesh in the gltf
    let i = 0;
    root.traverse((child: any) => {
      const nodeType = (<THREE.Object3D>child).type;
      const nodeName = (<THREE.Object3D>child).name;
      console.log(`node ${i}: ${nodeType} ${nodeName}`);
      i += 1;

      if (nodeName === 'button-00') {
        this._objButton = <THREE.Object3D>child;
      }
    });

    // attach the gltf models to the scene
    this.add(root);
    console.log(root);
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

    // keyDown / keyUp events
    window.addEventListener(
      'keydown',
      (ev: KeyboardEvent) => {
        if (ev.key === '2') {
          console.log('key down');
          if (this._objButton) {
            this._objButton.position.y = - 0.1;
          }
        }
      }
    );

    window.addEventListener(
      'keyup',
      (ev: KeyboardEvent) => {
        if (ev.key === '2') {
          console.log('key up');
          if (this._objButton) {
            this._objButton.position.y = 0.0;
          }
        }
      }
    );
  }

  initUI() {
    const _style = style;  // reference to css to access hashed class names
    console.log(`style: ${_style.hello}`);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // build UI html
    const htmlHUD = `
      <h1>Scene 2</h1>
      <div>Load mesh from glTF file</div>
    `;
    this._domUI = document.createElement('div');
    document.body.appendChild(this._domUI);
    this._domUI.classList.add('myHUD');
    this._domUI.insertAdjacentHTML('beforeend', htmlHUD);

    // add DOM button
    const button1 = document.createElement('div');
    button1.classList.add('myButton');
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

  updateScene(timeDelta: number) {
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
