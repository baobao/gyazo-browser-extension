import thenChrome from 'then-chrome';

const defaultOptions = {
  behavior: 'element',
  delay: 1,
  contextMenu: true,
  fileSizeLimit: 2,
  team: {},
};

const ExtensionStorageWrapper = class ExtensionStorageWrapper {
  constructor() {
    // Firefox requires webextensions.storage.sync.enabled to true in about:config
    this.checkEnv = false;
    (async () => {
      const enabledSyncStorage =
        !!chrome.storage.sync &&
        ((await this.tryToGetSyncStatus()()) ||
          (await this.tryToSetSyncStatus()()));
      this.storageType = enabledSyncStorage ? 'sync' : 'local';
      this.checkEnv = true;
    })();

    this.onChanged = {
      addListener: (...args) => {
        this.addListener(...args);
      },
      removeListener: (...args) => {
        this.removeListener(...args);
      },
      hasListener: (...args) => {
        this.hasListener(...args);
      },
    };
  }

  tryToGetSyncStatus() {
    return async () => {
      let result = false;
      try {
        result = await thenChrome.storage.sync.get(
          'gyazo-extension-sync-storage-test'
        );
      } catch (e) {}
      return !!result;
    };
  }

  tryToSetSyncStatus() {
    return async () => {
      let result = false;
      try {
        await thenChrome.storage.sync.set({
          'gyazo-extension-sync-storage-test': 1,
        });
        result = true;
      } catch (e) {}
      return !!result;
    };
  }

  waitForCheckEnv(f) {
    return new Promise((resolve) => {
      const timerId = window.setInterval(async () => {
        if (!this.checkEnv) return;
        window.clearInterval(timerId);
        resolve(await f());
      }, 100);
    });
  }

  storageObject(args) {
    return thenChrome.storage[this.storageType];
  }

  get(defaultValue, ...args) {
    if (!defaultValue) defaultValue = defaultOptions;
    if (!this.checkEnv)
      return this.waitForCheckEnv(() => this.get(defaultValue, ...args));
    return this.storageObject(args).get(defaultValue, ...args);
  }

  set(...args) {
    if (!this.checkEnv) return this.waitForCheckEnv(() => this.set(...args));
    return this.storageObject(args).set(...args);
  }

  getBytesInUse(...args) {
    if (!this.checkEnv)
      return this.waitForCheckEnv(() => this.getBytesInUse(...args));
    return this.storageObject(args).getBytesInUse(...args);
  }

  remove(...args) {
    if (!this.checkEnv) return this.waitForCheckEnv(() => this.remove(...args));
    return this.storageObject(args).remove(...args);
  }

  clear(...args) {
    if (!this.checkEnv) return this.waitForCheckEnv(() => this.clear(...args));
    return this.storageObject(args).clear(...args);
  }

  addListener(...args) {
    if (!this.checkEnv)
      return this.waitForCheckEnv(() => this.addListener(...args));
    return chrome.storage.onChanged.addListener(...args);
  }

  removeListener(...args) {
    if (!this.checkEnv)
      return this.waitForCheckEnv(() => this.removeListener(...args));
    return chrome.storage.onChanged.removeListener(...args);
  }

  hasListener(...args) {
    if (!this.checkEnv)
      return this.waitForCheckEnv(() => this.hasListener(...args));
    return chrome.storage.onChanged.hasListener(...args);
  }
};
const storage = new ExtensionStorageWrapper();

export default storage;
