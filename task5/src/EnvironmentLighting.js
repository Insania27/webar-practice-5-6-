import { PMREMGenerator } from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export class EnvironmentLighting {
  async load(scene, renderer) {
    const generator = new PMREMGenerator(renderer);
    generator.compileEquirectangularShader();
    const hdr = await new RGBELoader().loadAsync(new URL('../assets/royal_esplanade_1k.hdr', import.meta.url).href);
    this.environment = generator.fromEquirectangular(hdr);
    scene.environment = this.environment.texture;
    hdr.dispose();
    generator.dispose();
  }
}
