import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

// styles for DOM elements
import style from './assets/style.css';


class Scene3 extends THREE.Scene implements ISceneBase {
  _camera: THREE.OrthographicCamera;
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

  initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    const vshader = `
    void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.5, 1.0);
    }
    `

    const fshader = `
    void main() {
    gl_FragColor = vec4(0.1, 0.2, 0.3, 1.0);
    }
    `
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: vshader,
      fragmentShader: fshader,
    });

    const plane = new THREE.Mesh(geometry, material);
    this.add(plane);
  }

  initUI() {
    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // html load test
    // TODO: load this from external html file.
    const htmlHUD = `
      <h1>heading level 1</h1>
      <div>Scene 1</div>
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
    if (aspectRatio>=1){
      width = 1;
      height = (window.innerHeight/window.innerWidth) * width;
    }else{
      width = aspectRatio;
      height = 1;
    }

    this._camera.left = -width;
    this._camera.right = width;
    this._camera.top = height;
    this._camera.bottom = -height;
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
