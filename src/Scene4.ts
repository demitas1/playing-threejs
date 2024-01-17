import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

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


// loader wrapper
const loadGLTF = (url: string) => {
  return new Promise<Record<string, any>>(resolve => {
    new GLTFLoader().load(url, resolve);
  });
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
    this._camera.position.z = 2.0;
    this._camera.position.y = 5.0;
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
      name: 'screenCanvas',
      map: textureCanvas,
    });

    // load gltf file
    const url = 'mesh/monitor-01.glb';
    //const url = 'mesh/texture-test.glb';
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
      if (nodeType === 'Mesh' && nodeName === 'screen') {
        const _placeHolder = child.material;
        child.material = this._material;
        _placeHolder.dispose();
      }
      i += 1;
    });

    // attach the gltf models to the scene
    root.position.x = - 12.0;
    root.position.y = - 20.0;
    this.add(root);
    console.log(root);
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

  updateScene(timeDelta: number) {
    // frame tick counter
    this._tick += 1;
    const nFrames = 1000;
    if (this._tick >= nFrames) {
      this._tick = 0;
    }

    this._stats.update();

    // texture as canvas animation
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac auctor augue mauris augue neque gravida in. Suscipit adipiscing bibendum est ultricies integer quis auctor elit sed. Lobortis scelerisque fermentum dui faucibus. Pulvinar proin gravida hendrerit lectus. Pellentesque massa placerat duis ultricies lacus sed turpis. Nisi porta lorem mollis aliquam ut. Ipsum faucibus vitae aliquet nec ullamcorper sit amet risus nullam. Vel orci porta non pulvinar neque laoreet. Dolor magna eget est lorem ipsum. Ullamcorper velit sed ullamcorper morbi.';

    if (this._context && this._material) {
      // Note:
      // canvas 2d has +Y down coordinate while blender UV has +Y up.
      // take care of uv coordinates of the plane to draw on.

      const w = this._canvas.width;
      const h = this._canvas.height;

      // clear canvas by filled rectangle
      this._context.fillStyle = '#020208';
      this._context.fillRect(0, 0, w, h);

      // draw text with preloaded font family
      // specify font by 'weight, size, family'
      const nLines = 40;
      const fontSize = Math.floor(h / nLines);
      const lineHeight = fontSize + 1;

      const marginLeft = w * 0.05;
      const marginTop = h * 0.1;
      const maxLineWidth = w * 0.9;

      this._context.font = `300 ${fontSize}px Orbitron`;
      this._context.fillStyle = '#407f40';

      // animation text
      const nCharPerFrame = 2.0;
      const nMaxChar = text.length;
      const nDisplayText = Math.min(nMaxChar, Math.floor(this._tick * nCharPerFrame));

      // split text into multiple lines
      const textLine = new Array<string>();

      let iStart = 0;
      let iEnd = 0;
      let iLine = 0;
      let pxWidth = 0;
      let endOfText = false;

      while (iLine < nLines) {
        do {
          if (iEnd >= nDisplayText) {
            endOfText = true;
            break;
          }
          iEnd += 1;
          pxWidth = this._context
                        .measureText(text.slice(iStart, iEnd + 1))
                        .width;
        } while (pxWidth < maxLineWidth);

        textLine.push(text.slice(iStart, iEnd));
        if (endOfText) {
          break;
        }
        iStart = iEnd;
        iLine += 1;
      }

      // draw multiple lines
      for (let n = 0; n < textLine.length; n++) {
        this._context.fillText(
          textLine[n],
          marginLeft,
          marginTop + lineHeight * n
        );
      }

      // draw image bitmap
      this._context.drawImage(
        this._image1,
        w * 0.05,
        h * 0.4
      );

      // notify: the texture material is updated
      this._material.map.needsUpdate = true;
    }
  }

  getScene() {
    return this;
  }

  getCamera() {
    return this._camera;
  }

  disposeScene() {
    // dispose UI elements
    document.body.removeChild(this._stats.dom);
    document.body.removeChild(this._domUI);
  }
}


export { Scene4 };
