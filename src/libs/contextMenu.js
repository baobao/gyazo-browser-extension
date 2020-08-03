import thenChrome from 'then-chrome';
import MessageListener from './MessageListener';
import gyazoIt from './gyazoIt';
import storage from './storageSwitcher';

const onContextMenuClickListener = new MessageListener('contextmenu');

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.insertCSS(tab.id, {
    file: '/menu.css',
  });
  onContextMenuClickListener.listen({
    target: 'contextmenu',
    action: info.menuItemId,
    info,
    tab,
  });
});

onContextMenuClickListener.add('gyazoIt', ({ info, tab }) => {
  gyazoIt(tab, info.srcUrl);
});

onContextMenuClickListener.add('captureSelectElement', ({ tab }) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureElement',
    tab,
  });
});

onContextMenuClickListener.add('captureWindow', ({ tab }) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureWindow',
    tab,
  });
});

onContextMenuClickListener.add('captureSelectArea', ({ tab }) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureSelectArea',
    tab,
  });
});

onContextMenuClickListener.add('captureWholePage', ({ tab }) => {
  chrome.tabs.sendMessage(tab.id, {
    target: 'content',
    action: 'captureWholePage',
    tab,
  });
});

const checkContextMenuEnabled = async () => {
  let contextMenuEnabled = true;
  const settings = await storage.get({ contextMenu: true });

  contextMenuEnabled = settings.contextMenu;

  if (!contextMenuEnabled) {
    try {
      await thenChrome.contextMenus.removeAll();
      await thenChrome.contextMenus.create({
        title: chrome.i18n.getMessage('contextMenuImage'),
        id: 'gyazoIt',
        contexts: ['image'],
      });
    } catch {
      // no-op
    }
    return;
  }
  try {
    await thenChrome.contextMenus.removeAll();
    await thenChrome.contextMenus.create({
      title: chrome.i18n.getMessage('captureParentTitle'),
      id: 'captureParent',
      contexts: ['all'],
    });
    await thenChrome.contextMenus.create({
      parentId: 'captureParent',
      title: chrome.i18n.getMessage('thisImage'),
      id: 'gyazoIt',
      contexts: ['image'],
    });
    await thenChrome.contextMenus.create({
      parentId: 'captureParent',
      id: 'gyazoContextMenuSeparator',
      type: 'separator',
      contexts: ['image'],
    });
    await thenChrome.contextMenus.create({
      parentId: 'captureParent',
      id: 'captureSelectElement',
      title: chrome.i18n.getMessage('selectElement'),
      contexts: ['all'],
    });
    await thenChrome.contextMenus.create({
      parentId: 'captureParent',
      id: 'captureSelectArea',
      title: chrome.i18n.getMessage('selectArea'),
      contexts: ['all'],
    });
    await thenChrome.contextMenus.create({
      parentId: 'captureParent',
      id: 'captureWindow',
      title: chrome.i18n.getMessage('captureWindow'),
      contexts: ['all'],
    });
    chrome.contextMenus.create({
      parentId: 'captureParent',
      id: 'captureWholePage',
      title: chrome.i18n.getMessage('topToBottom'),
      contexts: ['all'],
    });
  } catch (e) {
    if (!e.message.match('duplicate id')) console.error(e);
  }
};

storage.onChanged.addListener(
  checkContextMenuEnabled.bind(checkContextMenuEnabled)
);
checkContextMenuEnabled();
