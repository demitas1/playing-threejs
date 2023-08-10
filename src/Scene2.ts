import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

// styles for DOM elements
import style from '../public/style.css';

// HUD json file
import hud from '../public/data/hud.json';


class Scene2 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  _objButton: THREE.Object3D;

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

  async initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    // add Light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    this.add(directionalLight);

    // fetch mesh file test
    const res = await fetch('mesh/buttons-02.glb');
    console.log(res);

    // loader wrapper
    const loadGLTF = (url: string) => {
      return new Promise<Record<string, any>>(resolve => {
        new GLTFLoader().load(url, resolve);
      });
    };

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
      <h1>Scene 2</h1>
      <div>Load mesh from glTF file</div>
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
