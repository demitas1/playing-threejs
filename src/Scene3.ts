import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

import style from '../public/style.css';


const vshader = /* glsl */`
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.5, 1.0);
}
`

const fshader = `
void main() {
  gl_FragColor = vec4(0.1, 0.2, 0.3, 1.0);
}
`

class Scene3 extends THREE.Scene implements ISceneBase {
  _camera: THREE.OrthographicCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();

    this.initUI();
    this.initScene(domElement);
  }

  initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: vshader,
      fragmentShader: fshader,
    });

    const plane = new THREE.Mesh(geometry, material);
    this.add(plane);
  }

  initCamera() {
    this._camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 10 );
    this._camera.position.z = 1;
  }

  initControls(domElement: HTMLElement) {
    this._controls = new OrbitControls(
      this._camera,
      domElement
    );
    // on 'change' do nothing. rendering is done by animation.
    this._controls.addEventListener('change', () => {});
  }

  initUI() {
    const _style = style;  // reference to css to access hashed class names
    console.log(`style: ${_style.hello}`);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // build UI html
    const htmlHUD = `
      <h1>Scene 3</h1>
      <div>Shader language</div>
    `;
    this._domUI = document.createElement('div');
    document.body.appendChild(this._domUI);
    this._domUI.classList.add('myHUD');
    this._domUI.insertAdjacentHTML('beforeend', htmlHUD);

    // normal DOM button
    const button1 = document.createElement('div');
    button1.classList.add('myButton');
    button1.innerHTML = 'Click me!';
    button1.onclick = () => {
      const ev = new CustomEvent(
        'sceneEnd',
        {
          detail: '(end scene3)',
        }
      );
      window.dispatchEvent(ev);
    };
    this._domUI.appendChild(button1);
  }

  onResize() {
    const aspectRatio = window.innerWidth/window.innerHeight;

    let width, height;
    if (aspectRatio >= 1){
      width = 1;
      height = (window.innerHeight / window.innerWidth) * width;
    } else {
      width = aspectRatio;
      height = 1;
    }

    this._camera.left = - width;
    this._camera.right = width;
    this._camera.top = height;
    this._camera.bottom = - height;
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



















export { Scene3 };
