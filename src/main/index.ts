/*
   Copyright 2019 Marc Nuri San Felix

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
import {
  BrowserWindow,
  Notification,
  app,
  desktopCapturer,
  ipcMain as ipc,
  screen,
  BrowserView,
} from "electron";
import { APP_EVENTS } from "../constants";
import { TABS_CONTAINER_HEIGHT, initTabContainerView } from "../chrome-tabs";
import { loadSettings, updateSettings, openSettingsDialog } from "../settings";
import { loadDictionaries } from "../spell-check";
import * as tabManager from "../tab-manager";
import { initBrowserVersions, userAgentForView } from "../user-agent";
import {
  initMiniPlayerView,
  MINI_PLAYER_CONTAINER_HEIGHT,
} from "../mini-player";
import { WorkpalSettings } from "settings/types";

const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  preload: `${__dirname}/preload.js`,
  partition: "persist:workpal",
};

let mainWindow: BrowserWindow;
let tabContainer: BrowserView;
let miniPlayerContainer: BrowserView;

const fixUserDataLocation = () => {
  const userDataPath = app.getPath("userData");
  if (userDataPath && userDataPath.length > 0) {
    app.setPath("userData", userDataPath.toLowerCase());
  }
};

const resetMainWindow = () => {
  const currentViews = mainWindow.getBrowserViews();
  currentViews.forEach((bv) => mainWindow.removeBrowserView(bv));

  mainWindow.addBrowserView(tabContainer);
  mainWindow.addBrowserView(miniPlayerContainer);
};

const updateLayout = () => {
  const [width, height] = mainWindow.getSize();
  const activeTab = tabManager.getTab(tabManager.getActiveTab());
  tabContainer.setBounds({ x: 0, y: 0, width, height: TABS_CONTAINER_HEIGHT });
  if (activeTab) {
    activeTab.setBounds({
      x: 0,
      y: TABS_CONTAINER_HEIGHT,
      width,
      height: height - TABS_CONTAINER_HEIGHT - MINI_PLAYER_CONTAINER_HEIGHT,
    });
  }
  miniPlayerContainer.setBounds({
    x: 0,
    y: height - MINI_PLAYER_CONTAINER_HEIGHT,
    width,
    height: MINI_PLAYER_CONTAINER_HEIGHT,
  });
};

const activateTab = (tabId: string) => {
  const activeTab = tabManager.getTab(tabId);
  if (activeTab) {
    resetMainWindow();
    mainWindow.addBrowserView(activeTab);
    tabManager.setActiveTab(tabId);
    updateLayout();
    activeTab.webContents.focus();
  }
};

const handleTabReload = (event) => event.sender.reloadIgnoringCache();

const handleZoomIn = (event) =>
  event.sender.setZoomFactor(event.sender.getZoomFactor() + 0.1);

const handleZoomOut = (event) => {
  const newFactor = event.sender.getZoomFactor() - 0.1;
  if (newFactor >= 0.1) {
    event.sender.setZoomFactor(newFactor);
  }
};

const handleZoomReset = (event) => event.sender.setZoomFactor(1);

const handleTabReorder = (_event, { tabIds: visibleTabIds }) => {
  const currentTabs = loadSettings().tabs;
  const hiddenTabIds = currentTabs
    .map(({ id }) => id)
    .filter((tabId) => !visibleTabIds.includes(tabId));
  const currentTabMap = currentTabs.reduce((acc, tab) => {
    acc[tab.id] = tab;
    return acc;
  }, {});
  const tabs = [
    ...visibleTabIds.map((tabId) => currentTabMap[tabId]),
    ...hiddenTabIds.map((tabId) => currentTabMap[tabId]),
  ];
  updateSettings({ tabs });
};

const initTabListener = () => {
  ipc.on(APP_EVENTS.tabsReady, (event) => {
    const currentSettings = loadSettings();
    const tabs = currentSettings.tabs
      .filter((tab) => !tab.disabled)
      .map((tab) => ({ ...tab, active: tab.id === currentSettings.activeTab }));
    if (tabs.length > 0) {
      const ipcSender = event.sender;
      tabManager.addTabs(ipcSender)(tabs);
    } else {
      openSettingsDialog(mainWindow);
    }
  });
  ipc.on(APP_EVENTS.activateTab, (_event, data) => activateTab(data.id));
  ipc.on(APP_EVENTS.canNotify, (event, tabId) => {
    event.returnValue = tabManager.canNotify(tabId);
  });
  ipc.on(APP_EVENTS.notificationClick, (_event, { tabId }) => {
    tabContainer.webContents.send(APP_EVENTS.activateTabInContainer, { tabId });
    mainWindow.restore();
    mainWindow.show();
    activateTab(tabId);
  });
  ipc.on(APP_EVENTS.reload, handleTabReload);
  ipc.on(APP_EVENTS.settingsOpenDialog, () => openSettingsDialog(mainWindow));
  ipc.on(APP_EVENTS.tabReorder, handleTabReorder);
  ipc.on(APP_EVENTS.zoomIn, handleZoomIn);
  ipc.on(APP_EVENTS.zoomOut, handleZoomOut);
  ipc.on(APP_EVENTS.zoomReset, handleZoomReset);
};

const initDesktopCapturerHandler = () => {
  ipc.handle(APP_EVENTS.desktopCapturerGetSources, async (_event, opts) => {
    const sources = await desktopCapturer.getSources(opts);
    const displays = screen.getAllDisplays();
    return sources.map((source) => {
      // eslint-disable-next-line no-warning-comments
      // FIXME On linux the display_id is empty
      // as a workaround I find the best screen by display ratio
      // Note that this could technically fail but it works for my setup
      const ratio = source.thumbnail.getAspectRatio().toPrecision(2);

      const display = displays.find(
        (d) => ratio === (d.size.width / d.size.height).toPrecision(2)
      );
      return [source, display];
    });
  });
};

const closeDialog = () => {
  const settingsView = mainWindow.getBrowserView();
  const activeTab = tabManager.getActiveTab();
  if (activeTab) activateTab(activeTab);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (settingsView?.webContents as any).destroy();
};

const saveSettings = (_event, settings: WorkpalSettings) => {
  updateSettings(settings);
  loadDictionaries();
  const currentBrowserView = mainWindow.getBrowserView();
  if (currentBrowserView) mainWindow.removeBrowserView(currentBrowserView);
  tabManager.removeAll();
  const viewsToDestroy = [currentBrowserView, tabContainer];
  tabContainer = initTabContainerView(mainWindow);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewsToDestroy.forEach((view) => (view?.webContents as any).destroy());
};

const initDialogListeners = () => {
  ipc.on(APP_EVENTS.settingsSave, saveSettings);
  ipc.on(APP_EVENTS.closeDialog, closeDialog);
};

const handleMainWindowResize = () => {
  const [windowWidth, windowHeight] = mainWindow.getSize();
  updateSettings({ width: windowWidth, height: windowHeight });
  setTimeout(updateLayout, 10);
};

const initMainWindow = () => {
  const { width = 800, height = 600 } = loadSettings();
  mainWindow = new BrowserWindow({
    width,
    height,
    resizable: true,
    maximizable: true,
    webPreferences,
    show: false,
  });

  mainWindow.removeMenu();
  mainWindow.on("resize", handleMainWindowResize);
  mainWindow.on("maximize", handleMainWindowResize);
  mainWindow.on("closed", () => app.quit());
  app.userAgentFallback = userAgentForView(mainWindow);
};

const initMiniPlayer = () => {
  miniPlayerContainer = initMiniPlayerView(mainWindow);
};

const initTabContainer = () => {
  initTabListener();
  tabContainer = initTabContainerView(mainWindow);
};

const init = async () => {
  try {
    await initBrowserVersions();
    fixUserDataLocation();
    loadDictionaries();
    initMainWindow();
    initTabContainer();
    initMiniPlayer();
    initDesktopCapturerHandler();
    initDialogListeners();
  } catch (e) {
    new Notification({
      title: "Workpal: Failed to initialize",
      urgency: "critical",
    }).show();
  } finally {
    //Oh! well this is an Electron thing...
    //Otherwise it produces a blank screen that you need to resize
    //It works 90% of the time, good enough for now
    setTimeout(() => {
      mainWindow.show();
    }, 400);
  }

  return mainWindow;
};

export default { APP_EVENTS, init };
