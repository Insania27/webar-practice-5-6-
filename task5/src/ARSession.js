import { Mesh, RingGeometry, MeshBasicMaterial, Matrix4, Vector3, DoubleSide } from 'three';

export class ARSession {
  constructor(renderer, scene, models, ui) {
    Object.assign(this, { renderer, scene, models, ui });
    this.session = null;
    this.source = null;
    this.placed = false;
    this.matrix = new Matrix4();
    this.normal = new Vector3();
    this.reticle = new Mesh(new RingGeometry(0.09, 0.12, 32).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: 0x00aa44, side: DoubleSide }));
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    scene.add(this.reticle);
    ui.start.addEventListener('click', () => this.start());
    ui.end.addEventListener('click', () => this.session?.end().catch(error => ui.message(error.message)));
  }

  async checkSupport() {
    const supported = window.isSecureContext && navigator.xr && await navigator.xr.isSessionSupported('immersive-ar');
    this.ui.start.disabled = !supported;
    this.ui.message(supported
      ? 'Запустите AR. Наведите камеру на пол и коснитесь экрана при появлении кольца.'
      : 'AR недоступен. Цвет, модель и поворот можно проверить в обычном режиме. Для AR нужен HTTPS и совместимое устройство.');
  }

  async start() {
    this.ui.start.disabled = true;
    let session;
    try {
      session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor', 'hit-test', 'dom-overlay'],
        domOverlay: { root: this.ui.overlay },
      });
      this.session = session;
      this.placed = false;
      this.models.placement.visible = false;
      session.addEventListener('end', () => this.cleanup(), { once: true });
      session.addEventListener('select', event => {
        if (this.placed) return;
        this.update(event.frame);
        if (!this.reticle.visible) return;
        this.models.place(this.reticle.matrix);
        this.placed = true;
        this.reticle.visible = false;
        this.ui.message('Объект размещён. Используйте цвет, поворот и выбор модели.');
      });
      await this.renderer.xr.setSession(session);
      const viewer = await session.requestReferenceSpace('viewer');
      const source = await session.requestHitTestSource({ space: viewer });
      if (this.session !== session) { source.cancel(); return; }
      this.source = source;
      this.ui.sessionActive(true);
    } catch (error) {
      if (session) { try { await session.end(); } catch { this.cleanup(); } }
      else this.ui.start.disabled = false;
      this.ui.message(`Ошибка запуска AR: ${error.message}`);
    }
  }

  update(frame) {
    this.reticle.visible = false;
    if (!frame || !this.source || this.placed) return;
    const space = this.renderer.xr.getReferenceSpace();
    if (!space) return;
    for (const hit of frame.getHitTestResults(this.source)) {
      const pose = hit.getPose(space);
      if (!pose) continue;
      this.matrix.fromArray(pose.transform.matrix);
      this.normal.setFromMatrixColumn(this.matrix, 1).normalize();
      if (this.normal.y < 0.9) continue;
      this.reticle.matrix.copy(this.matrix);
      this.reticle.visible = true;
      break;
    }
    this.ui.message(this.reticle.visible ? 'Коснитесь экрана для размещения.' : 'Медленно наведите камеру на пол. Поиск плоскости…');
  }

  cleanup() {
    this.source?.cancel();
    this.source = null;
    this.session = null;
    this.placed = false;
    this.reticle.visible = false;
    this.models.preview();
    this.ui.sessionActive(false);
    this.ui.message('AR завершён.');
  }
}
