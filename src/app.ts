import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

// styles for DOM elements
import style from './assets/style.css';



export class App {
  _i: number;
  _scene: THREE.Scene;
  _camera: THREE.PerspectiveCamera;
  _renderer: THREE.WebGLRenderer;
  _controls: OrbitControls;
  _stats: Stats;


  constructor() {
    ;
  }

  async init(): Promise<void> {

    this._i = 0;

    // Scene
    this._scene = new THREE.Scene();

    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._camera.position.z = 2;

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);

    this._controls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._controls.addEventListener(
      'change',
      () => { this.render(); }
    );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });

    const cube = new THREE.Mesh(geometry, material);
    this._scene.add(cube);
    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // html load test
    // TODO: load this from external html file.
    const htmlHUD = `
      <h1>heading level 1</h1>
    `;
    const div1 = document.createElement('div');
    document.body.appendChild(div1);
    div1.classList.add(style.myHUD);
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
    window.addEventListener(
      'resize',
      () => {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this.render()
      },
      false
    );

    console.log('init.');
  }

  update() {
    // TODO: update scene here

    requestAnimationFrame(() => { this.update(); });
    this.render();

    this._stats.update();

    this._i += 1;
    console.log(`frame ${this._i}`);
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }

}

// initialize app and enter the main loop
const app = new App();
app.init().then(() => {
  app.update();
})
