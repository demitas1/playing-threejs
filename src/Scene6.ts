import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';

import { ISceneBase } from './ISceneBase';

class Scene6 extends THREE.Scene implements ISceneBase {
  private _camera: THREE.PerspectiveCamera;
  private _controls: OrbitControls;
  private _stats: Stats;
  private _cube: THREE.Mesh;
  private _domElement: HTMLElement;
  private _customUniforms: { [uniform: string]: THREE.IUniform };

  private _debugMode: number = 0;

  constructor(domElement: HTMLElement) {
    super();
    this._domElement = domElement;
    this.initScene();
  }

  private initScene(): void {
    this.initCamera();
    this.initControls();
    this.initLights();
    this.createCubeWithCustomShader();
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

  private createCubeWithCustomShader(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    this._customUniforms = {
      edgeStrength: { value: 1.0 },
      edgeColor: { value: new THREE.Color(0x000000) },
      edgeThickness: { value: 1.0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      debugMode: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this._customUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalMatrix * normal;
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float edgeStrength;
        uniform vec3 edgeColor;
        uniform float edgeThickness;
        uniform vec2 resolution;
        uniform int debugMode;

        varying vec3 vNormal;
        varying vec3 vPosition;

        float getEdgeFactor(vec3 position, vec3 normal) {
          // Edge detection based on position
          vec3 dFdxPos = dFdx(position);
          vec3 dFdyPos = dFdy(position);
          float edgePos = length(cross(dFdxPos, dFdyPos));

          // Face detection based on normal
          float faceFactor = abs(dot(normalize(normal), vec3(0.0, 0.0, 1.0)));

          // Combine position-based edges and face factor
          return smoothstep(0.0, edgeStrength, edgePos) * (1.0 - faceFactor) * edgeThickness;
        }

        void main() {
          vec3 baseColor = vec3(1.0); // Flat white color
          
          float edge = getEdgeFactor(vPosition, vNormal);
          
          vec3 finalColor;
          
          if (debugMode == 0) {
            finalColor = mix(baseColor, edgeColor, edge);
          } else if (debugMode == 1) {
            // Raw edge detection
            finalColor = vec3(edge);
          } else if (debugMode == 2) {
            // Normal visualization
            finalColor = normalize(vNormal) * 0.5 + 0.5;
          } else if (debugMode == 3) {
            // Position visualization
            finalColor = fract(vPosition);
          }
          
          gl_FragColor = vec4(finalColor, 1.0);
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
    gui.add(this._customUniforms.edgeStrength, 'value', 0, 2).name('Edge Strength');
    gui.add(this._customUniforms.edgeThickness, 'value', 0, 5).name('Edge Thickness');

    const edgeColorController = gui.addColor(this._customUniforms.edgeColor, 'value').name('Edge Color');
    edgeColorController.onChange((value) => {
        if (Array.isArray(value)) {
            this._customUniforms.edgeColor.value.setRGB(value[0] / 255, value[1] / 255, value[2] / 255);
        }
    });

    gui.add(this._customUniforms.debugMode, 'value', {
        'Normal': 0,
        'Raw Edge Detection': 1,
        'Normal Visualization': 2,
        'Position Visualization': 3
    }).name('Debug Mode');
}

  onResize(): void {
    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
    }
    this._customUniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  updateScene(timeDelta: number): void {
    this._stats.update();

    //this._customUniforms.time.value += timeDelta;
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
  }
}

export { Scene6 };
