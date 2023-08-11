import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

import style from '../public/style.css';


// image wrapper to load by url
// TODO: test image by svg
const loadImage = (url: string) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const _img = new Image();
    _img.onload = () => { resolve(_img); };
    _img.src = url;
  })
};


class Scene4 extends THREE.Scene implements ISceneBase {
  _camera: THREE.PerspectiveCamera;
  _controls: OrbitControls;
  _stats: Stats;
  _domUI: HTMLElement;

  _material: THREE.MeshBasicMaterial;
  _canvas: HTMLCanvasElement;
  _context: CanvasRenderingContext2D;
  _tick: number;

  _image1: HTMLImageElement;

  constructor(domElement: HTMLElement) {
    super();

    this.initScene(domElement);
    this.initUI();

    this._tick = 0;
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._camera.position.x = 0.0;
    this._camera.position.z = 4.0;
    this._camera.position.y = 0.0;
  }

  initControls(domElement: HTMLElement) {
    this._controls = new OrbitControls(
      this._camera,
      domElement
    );
    // on 'change' do nothing. rendering is done by animation.
    this._controls.addEventListener('change', () => {});
  }

  async initScene(domElement: HTMLElement) {
    this.initCamera();
    this.initControls(domElement);

    // add Light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    this.add(directionalLight);

    // create a simple square plane.
    const geometry = new THREE.BufferGeometry();
    const v = new Float32Array([
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
    ]);

    const iv: Array<number> = [
      1, 2, 0,
      1, 3, 2,
    ];

    const uv = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(v, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setIndex(iv);

    // preload custom font
    const font = await new FontFace(
      'Orbitron',
      "url('./fonts/Orbitron-VariableFont_wght.woff') format('woff')")
      .load();
    console.log(font);

    // preload image
    this._image1 = await loadImage('images/icon.jpg');

    // prepare 2d canvas
    this._canvas = document.createElement("canvas");
    this._canvas.width = 1024;
    this._canvas.height = 1024;
    this._context = this._canvas.getContext("2d");
    const textureCanvas = new THREE.Texture(this._canvas);

    this._material = new THREE.MeshBasicMaterial({
      map: textureCanvas,
    });

    const mesh = new THREE.Mesh(geometry, this._material);
    this.add(mesh);
  }

  initUI() {
    const _style = style;  // reference to css to access hashed class names
    console.log(`style: ${_style.hello}`);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // build UI html
    const htmlHUD = `
      <h1>Scene 4</h1>
      <div>Canvas texture animation</div>
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
          detail: '(end scene4)',
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
    // frame tick counter
    this._tick += 1;
    const n_frames = 100;
    if (this._tick >= n_frames) {
      this._tick = 0;
    }

    this._stats.update();

    // texture as canvas animation
    if (this._context && this._material) {
      const w = this._canvas.width;
      const h = this._canvas.height;
      const p = (this._tick % n_frames) / n_frames;

      // clear canvas by filled rectangle
      this._context.fillStyle = '#020208';
      this._context.fillRect(0, 0, w, h);

      // fill rectangle
      this._context.fillStyle = '#404040';
      this._context.fillRect(
        w * 0.9, h * 0.9,
        w * 0.1, h * 0.1
      );

      // draw text with preloaded font family
      // specify font by 'weight, size, family'
      // TODO: animation text
      const fontSize = Math.floor(w * 0.1);
      this._context.font = `400 ${fontSize}px Orbitron`;
      this._context.fillStyle = '#407f40';
      this._context.fillText(
        'A quick brown fox.',
        w * 0.0,
        h * 0.1
      );

      // draw image bitmap
      this._context.drawImage(
        this._image1,
        w * 0.0,
        h * 0.8
      );

      // notify: the texture material is updated
      this._material.map.needsUpdate = true;
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


export { Scene4 };
