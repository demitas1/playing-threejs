import * as THREE from 'three';


export interface ISceneBase {
  onResize: () => void;
  updateScene: () => void;
  getScene: () => THREE.Object3D;
  getCamera: () => THREE.Camera;
  disposeScene: () => void;
}
