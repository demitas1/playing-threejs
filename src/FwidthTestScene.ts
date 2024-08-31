import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module';

import { ISceneBase } from './ISceneBase';

class FwidthTestScene extends THREE.Scene implements ISceneBase {
  private _camera: THREE.PerspectiveCamera;
  private _controls: OrbitControls;
  private _cube: THREE.Mesh;
  private _customUniforms: { [uniform: string]: THREE.IUniform };
  private _stats: Stats;
  private _domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    super();
    this._domElement = domElement;
    this.initScene();
  }

  private initScene(): void {
    this.initCamera();
    this.initControls();
    this.initLights();
    this.createTestCube();
    this.initStats();
    this.initGUI();
  }

  private initCamera(): void {
    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this._camera.position.z = 5;
  }

  private initControls(): void {
    this._controls = new OrbitControls(this._camera, this._domElement);
    this._controls.addEventListener('change', () => {});
  }

  private initLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    this.add(directionalLight);
  }

  private createTestCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    this._customUniforms = {
      testMode: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this._customUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform int testMode;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 testValue;
          
          if (testMode == 0) {
            // Test fwidth on position
            testValue = fwidth(vPosition);
          } else if (testMode == 1) {
            // Test fwidth on normal
            testValue = fwidth(vNormal);
          } else {
            // Fallback to show position
            testValue = vPosition * 0.5 + 0.5;
          }
          
          // Amplify the result to make it more visible
          testValue *= 10.0;
          
          gl_FragColor = vec4(testValue, 1.0);
        }
      `
    });

    this._cube = new THREE.Mesh(geometry, material);
    this.add(this._cube);
  }

  private initStats(): void {
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);
  }

  private initGUI(): void {
    const gui = new GUI();
    gui.add(this._customUniforms.testMode, 'value', {
      'fwidth(position)': 0,
      'fwidth(normal)': 1,
      'Raw position': 2
    }).name('Test Mode');
  }

  onResize(): void {
    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
    }
  }

  updateScene(timeDelta: number): void {
    this._stats.update();
    //this._cube.rotation.x += 0.01;
    //this._cube.rotation.y += 0.01;
  }

  getScene(): THREE.Object3D {
    return this;
  }

  getCamera(): THREE.Camera {
    return this._camera;
  }

  disposeScene(): void {
    document.body.removeChild(this._stats.dom);
    // Remove GUI
    //const gui = GUI.getInstance();
    //if (gui) gui.destroy();
  }
}

export { FwidthTestScene };
