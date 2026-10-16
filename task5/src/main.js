import { Scene, PerspectiveCamera, WebGLRenderer, Color, ACESFilmicToneMapping } from 'three';
import { EnvironmentLighting } from './EnvironmentLighting.js';
import { ModelManager } from './ModelManager.js';
import { UIController } from './UIController.js';
import { ARSession } from './ARSession.js';

async function main() {
  const scene = new Scene();
  scene.background = new Color(0xeeeeee);
  const camera = new PerspectiveCamera(60, innerWidth / innerHeight, 0.01, 30);
  camera.position.set(1.2, 1.1, 1.6);
  camera.lookAt(0, 0.4, 0);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  document.body.appendChild(renderer.domElement);
  const models = new ModelManager(scene);
  const ui = new UIController(models);
  await new EnvironmentLighting().load(scene, renderer);
  const ar = new ARSession(renderer, scene, models, ui);
  renderer.xr.addEventListener('sessionstart', () => { scene.background = null; });
  renderer.xr.addEventListener('sessionend', () => {
    scene.background = new Color(0xeeeeee);
    camera.position.set(1.2, 1.1, 1.6);
    camera.lookAt(0, 0.4, 0);
  });
  renderer.setAnimationLoop((time, frame) => {
    if (frame) ar.update(frame);
    renderer.render(scene, camera);
  });
  window.addEventListener('resize', () => {
    if (renderer.xr.isPresenting) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  await ar.checkSupport();
}

main().catch(error => { document.querySelector('#status').textContent = `Ошибка: ${error.message}`; });
