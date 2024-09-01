import * as THREE from 'three';


export interface ISceneBase {
  onResize: () => void;
  onMouseMove?: (x: number, y: number) => void;
  updateScene: (timeDelta: number) => void;
  getScene: () => THREE.Object3D;
  getCamera: () => THREE.Camera;
  disposeScene: () => void;
}
