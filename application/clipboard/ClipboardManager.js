export default class ClipboardManager {
  constructor(clipboard, changeEvent) {
    this.lastContent = undefined;
    this.clipboardChangeEvent = changeEvent || undefined;
    this.listen = true;
    this.clipboard = clipboard;
  }

  startListening() {
    if (this.listen) {
      let clip = this.clipboard.read();
      if (this.lastContent !== clip) {
        this.lastContent = clip;
        if (this.clipboardChangeEvent) {
          this.clipboardChangeEvent(this.lastContent);
        }
      }
      setTimeout(this.startListening.bind(this), 200);
    }
  }

  setChangeEvent(changeEvent) {
    this.clipboardChangeEvent = changeEvent;
  }

  stopListening() {
    this.listen = false;
  }

  copy(text) {
    this.clipboard.write(text);
  }

  destroy() {
    this.listen = false;
  }
}
