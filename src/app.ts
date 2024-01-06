import * as THREE from 'three';
import { ISceneBase } from './ISceneBase';
import { Scene1 } from './Scene1';
import { Scene2 } from './Scene2';
import { Scene3 } from './Scene3';
import { Scene4 } from './Scene4';
import { Scene5 } from './Scene5';


const _fps = 60;
const _interval = 1.0 / _fps;


export class App {
  _renderer: THREE.WebGLRenderer;

  _scene: ISceneBase;

  _clock: THREE.Clock;  // clock for measuring delta
  _ticker: number;      // counter of rendered frames
  _timeDelta: number;   // delta time between frames

  constructor() {
    ;
  }

  async init(): Promise<void> {
    this._clock = new THREE.Clock();
    this._ticker = 0;
    this._timeDelta = 0;

    // Renderer
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._renderer.shadowMap.enabled = true;
    //this._renderer.shadowMap.type = THREE.BasicShadowMap;
    //this._renderer.shadowMap.type = THREE.PCFShadowMap
    //this._renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this._renderer.shadowMap.type = THREE.VSMShadowMap

    document.body.appendChild(this._renderer.domElement);

    // starting Scene
    this._scene = new Scene5(this._renderer.domElement);

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
          this._scene = new Scene5(this._renderer.domElement);
        } else if (ev.detail === '(end scene5)') {
          // change to new Scene1
          this._scene.disposeScene();
          this._scene = new Scene1(this._renderer.domElement);
        }
      },
      false
    );
  }

  update() {
    // get time delta
    this._timeDelta += this._clock.getDelta();

    if (this._timeDelta > _interval) {
      // get epoch for timestamp im milliseconds
      // TODO: make timestamp
      const timeNow = now();

      // update current scene
      this._scene.updateScene(this._timeDelta);
      this._timeDelta %= _interval;
      this._ticker += 1;

      // render
      this.render();
    }

    // render the scene animation
    requestAnimationFrame(
      () => {
        this.update();
      }
    );
  }

  render() {
    // render current scene
    this._renderer.render(
      this._scene.getScene(),
      this._scene.getCamera()
    );
  }
}


//
// get current time from epoch in milliseconds
//
function now() {
  const isPerformanceSupported = (typeof performance === 'undefined');

  if (isPerformanceSupported) {
    return performance.now() + performance.timing.navigationStart;
  } else {
    return Date.now()
  }
}


// initialize app and enter the main loop
const app = new App();
app.init().then(() => {
  app.update();
})
