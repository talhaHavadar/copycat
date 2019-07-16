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
import { clipboard } from "electron";


export default class ClipboardManager {
    
    constructor(changeEvent) {
        this.lastContent = undefined;
        this.clipboardChangeEvent = changeEvent || undefined;
        this.listen = true;
    }

    startListening() {
        if (this.listen) {
            let clip = clipboard.readText();
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
        clipboard.writeText(text);
    }

}
