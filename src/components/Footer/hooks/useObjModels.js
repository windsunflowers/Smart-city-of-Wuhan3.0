/*
 * @Author: wangshiyang
 * @Date: 2023-06-28 14:53:01
 * @LastEditors: wangshiyang
 * @LastEditTime: 2025-11-12 10:30:00
 * @Description: 仅添加 obj 模型
 *
 */
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";

class modelLoadHelper {
  constructor(map, options) {
    this.map = map;
    this.modelId = options.modelId ? options.modelId : "3dModel";
    this.modelOrigin = options.center ? options.center : [148.9819, -35.39847];
    this.modelAltitude = options.height ? options.height : 0;
    this.modelRotate = options.angle ? options.angle : 0;
    this.modelScale = options.scale
      ? options.scale
      : {
          x: 5,
          y: 5,
          z: 5,
        };
    this.objUrl = options.objUrl ? options.objUrl : "";
    this.mtlUrl = options.mtlUrl ? options.mtlUrl : "";
    
    // 明确模型类型
    this.modelType = "obj";
    
    this.modelTransform = this.getModelTransform();
  }

  getModelTransform() {
    const modelOrigin = mapboxgl.MercatorCoordinate.fromLngLat(
      this.modelOrigin,
      this.modelAltitude
    );

    const modelRotate = [
      Math.PI / 2,
      this.modelRotate * (Math.PI / 180),
      0,
    ];

    const modelTransform = {
      translateX: modelOrigin.x,
      translateY: modelOrigin.y,
      translateZ: modelOrigin.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelOrigin.meterInMercatorCoordinateUnits() * this.modelScale.x,
    };

    return modelTransform;
  }
  
  addModel() {
    return new Promise((resolve, reject) => {
      const customLayer = {
        id: this.modelId,
        type: "custom",
        renderingMode: "3d",
        onAdd: async (map, gl) => {
          try {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            const directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            const directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            const ambient = new THREE.AmbientLight(0xffffff, 1);
            this.scene.add(ambient);

            this.renderer = new THREE.WebGLRenderer({
              canvas: map.getCanvas(),
              context: gl,
              antialias: true,
            });
            this.renderer.autoClear = false;

            // OBJ 加载逻辑
            const mtlLoader = new MTLLoader();
            const materials = await mtlLoader.loadAsync(this.mtlUrl);
            materials.preload();
            
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            const obj = await objLoader.loadAsync(this.objUrl);
            
            this.scene.add(obj);
            resolve(customLayer); // OBJ 加载成功
            
          } catch (error) {
            console.error("onAdd 失败:", error);
            reject(error); // 将错误传递给 Promise
          }
        },
        render: (gl, matrix) => {
          if (!this.renderer || !this.scene || !this.camera) return;
          
          const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            this.modelTransform.rotateX
          );
          const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            this.modelTransform.rotateY
          );
          const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            this.modelTransform.rotateZ
          );

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              this.modelTransform.translateX,
              this.modelTransform.translateY,
              this.modelTransform.translateZ
            )
            .scale(
              new THREE.Vector3(
                this.modelTransform.scale,
                -this.modelTransform.scale,
                this.modelTransform.scale
              )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          this.camera.projectionMatrix = m.multiply(l);

          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
          this.map.triggerRepaint();
        },
      };
      
      this.map.addLayer(customLayer);
    });
  }

  removeModel(layerId) {
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
    }

    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.camera = null;
  }
}

// 适配 mtlLoader 和 objLoader 的异步加载
MTLLoader.prototype.loadAsync = function (url) {
  return new Promise((resolve, reject) => {
    this.load(url, resolve, undefined, reject);
  });
};

OBJLoader.prototype.loadAsync = function (url) {
  return new Promise((resolve, reject) => {
    this.load(url, resolve, undefined, reject);
  });
};


export default modelLoadHelper;