export class UIController {
  constructor(models) {
    this.start = document.querySelector('#start');
    this.end = document.querySelector('#end');
    this.status = document.querySelector('#status');
    this.overlay = document.querySelector('#overlay');
    document.querySelector('#color').addEventListener('input', event => models.setColor(event.target.value));
    document.querySelector('#model').addEventListener('change', event => models.setModel(event.target.value));
    document.querySelector('#rotate').addEventListener('click', () => models.rotate());
    // Нажатия HTML-кнопок не создают XR select для размещения модели.
    document.querySelector('#controls').addEventListener('beforexrselect', event => event.preventDefault());
  }

  message(text) { this.status.textContent = text; }

  sessionActive(active) {
    this.start.hidden = active;
    this.start.disabled = false;
    this.end.hidden = !active;
  }
}
