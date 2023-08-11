import * as THREE from 'three';
import { ISceneBase } from './ISceneBase';
import { Scene1 } from './Scene1';
import { Scene2 } from './Scene2';
import { Scene3 } from './Scene3';
import { Scene4 } from './Scene4';


export class App {
  _renderer: THREE.WebGLRenderer;

  _scene: ISceneBase;
  _i: number;

  constructor() {
    ;
  }

  async init(): Promise<void> {
    this._i = 0;

    // Renderer
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);

    // starting Scene
    this._scene = new Scene1(this._renderer.domElement);
    //this._scene = new Scene4(this._renderer.domElement);

    // window resize
    window.addEventListener(
      'resize',
      () => {
        this._scene.onResize();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this.render();
      },
      false
    );

    // custom event test
    // TODO: make better scene transition mechanism.
    window.addEventListener(
      'sceneEnd',
      (ev: CustomEvent) => {
        console.log(`sceneEnd event with ${ev.detail}.`);
        if (ev.detail === '(end scene1)') {
          // change to new Scene2
          this._scene.disposeScene();
          this._scene = new Scene2(this._renderer.domElement);
        } else if (ev.detail === '(end scene2)') {
          // change to new Scene3
          this._scene.disposeScene();
          this._scene = new Scene3(this._renderer.domElement);
        } else if (ev.detail === '(end scene3)') {
          // change to new Scene4
          this._scene.disposeScene();
          this._scene = new Scene4(this._renderer.domElement);
        } else if (ev.detail === '(end scene4)') {
          // change to new Scene1
          this._scene.disposeScene();
          this._scene = new Scene1(this._renderer.domElement);
        }
      },
      false
    );
  }

  update() {
    // update current scene
    this._scene.updateScene();

    // render the scene animation
    this.render();
    requestAnimationFrame(
      () => {
        this.update();
      }
    );

    this._i += 1;
    //console.log(`frame ${this._i}`);
  }

  render() {
    // render current scene
    this._renderer.render(
      this._scene.getScene(),
      this._scene.getCamera()
    );
  }
}

// initialize app and enter the main loop
const app = new App();
app.init().then(() => {
  app.update();
})
