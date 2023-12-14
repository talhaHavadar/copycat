/**
 *
 * https://github.com/electron/electron/issues/9035
 *
 * var rawFilePath = clipboard.read("FileGroupDescriptorW");
 * var filePath = rawFilePath.replace(new RegExp(String.fromCharCode(0), 'g'), '');
 *
 * ClipboardManager currently supports text copies but in future file copying will be supported.
 *
 */
export class ElectronClipboardAdapter {
  constructor(clipboard) {
    this.clipboard = clipboard;
  }

  read() {
    return this.clipboard.readText();
  }

  write(data) {
    return this.clipboard.writeText(data);
  }
}

export class CordovaClipboardAdapter {
  constructor(clipboard) {
    this.clipboard = clipboard;
  }
}
