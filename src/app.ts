import { Scene1 } from './Scene1';


export class App {
  _i: number;
  _scene: Scene1;

  constructor() {
    ;
  }

  async init(): Promise<void> {
    this._i = 0;

    // Scene
    this._scene = new Scene1();

    // window resize
    window.addEventListener(
      'resize',
      () => {
        this._scene.onResize();
        this.render()
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
    this._scene.renderScene();
  }
}

// initialize app and enter the main loop
const app = new App();
app.init().then(() => {
  app.update();
})