class Mediator {
  constructor() {
    this.events = new Map();
  }
  bind(DOMStorage) {
    DOMStorage.domStorageItemUpdated(({ key, newValue }) => {
      if (key !== 'aw') {
        return;
      }
      if (newValue === '') {
        return;
      }
      const event = JSON.parse(newValue);
      this.emit(event.name, event.data);
    });
  }
  emit(event, data) {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
  on(event, callback) {
    let callbacks = this.events.get(event);
    callbacks = callbacks || [];
    callbacks.push(callback);
    this.events.set(event, callbacks);
  }
}

module.exports = Mediator;
