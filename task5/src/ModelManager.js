import { Group, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';

export class ModelManager {
  constructor(scene) {
    // Матрица placement фиксирует положение в local-floor.
    // Поворот применяется к отдельному дочернему объекту и не сдвигает размещение.
    this.placement = new Group();
    this.content = new Group();
    this.placement.add(this.content);
    scene.add(this.placement);
    this.color = '#336699';
    this.angle = 0;
    this.setModel('chair');
  }

  setModel(type) {
    if (!['chair', 'table'].includes(type)) throw new Error('Неизвестная модель');
    this.content.traverse(object => {
      if (object.isMesh) object.geometry.dispose();
    });
    this.content.clear();
    this.wood?.dispose();
    this.surface?.dispose();
    this.wood = new MeshStandardMaterial({ color: 0x87512c, roughness: 0.8, metalness: 0 });
    this.surface = new MeshStandardMaterial({ color: this.color, roughness: 0.4, metalness: 0.2 });
    const part = (w, h, d, x, y, z, material) => {
      const mesh = new Mesh(new BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      this.content.add(mesh);
    };
    if (type === 'chair') {
      part(0.48, 0.06, 0.48, 0, 0.45, 0, this.surface);
      for (const x of [-0.19, 0.19]) {
        for (const z of [-0.19, 0.19]) part(0.05, 0.42, 0.05, x, 0.21, z, this.wood);
        part(0.05, 0.42, 0.05, x, 0.69, -0.19, this.wood);
      }
      part(0.43, 0.28, 0.055, 0, 0.75, -0.19, this.surface);
    } else {
      part(0.8, 0.06, 0.6, 0, 0.72, 0, this.surface);
      for (const x of [-0.34, 0.34]) {
        for (const z of [-0.24, 0.24]) part(0.06, 0.69, 0.06, x, 0.345, z, this.wood);
      }
    }
    this.content.rotation.y = this.angle;
  }

  setColor(color) {
    this.color = color;
    this.surface.color.set(color);
  }

  rotate() {
    this.angle += Math.PI / 12;
    this.content.rotation.y = this.angle;
  }

  place(matrix) {
    this.placement.matrixAutoUpdate = false;
    this.placement.matrix.copy(matrix);
    this.placement.matrixWorldNeedsUpdate = true;
    this.placement.visible = true;
  }

  preview() {
    this.placement.matrixAutoUpdate = true;
    this.placement.position.set(0, 0, 0);
    this.placement.quaternion.identity();
    this.placement.scale.setScalar(1);
    this.placement.updateMatrix();
    this.placement.visible = true;
  }
}
