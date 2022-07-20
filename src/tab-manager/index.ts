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
  app,
  BrowserView,
  ContextMenuParams,
  Event,
  Menu,
  MenuItem,
  session,
  WebContents,
  clipboard,
} from "electron";
import { TabSettings } from "settings/types";
import { APP_EVENTS } from "../constants";
import { contextMenuHandler } from "../spell-check";
import { userAgentForView, addUserAgentInterceptor } from "../user-agent";
import { handleRedirect } from "./redirect";
import * as settings from "../settings";

let activeTab: string | null = null;
const tabs: Record<string, BrowserView> = {};

const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  preload: `${__dirname}/preload.js`,
};

const handlePageTitleUpdated =
  (ipcSender: WebContents, tabId: string) => (_e: Event, title: string) => {
    ipcSender.send(APP_EVENTS.setTabTitle, { id: tabId, title: title });
  };

const extractFavicon = async (browserView: BrowserView) => {
  let favicons = await browserView.webContents.executeJavaScript(
    "Array.from(document.querySelectorAll('link[rel=\"shortcut icon\"]')).map(el => el.href)"
  );
  if (favicons.length === 0) {
    favicons = await browserView.webContents.executeJavaScript(
      "Array.from(document.querySelectorAll('link[rel*=\"icon\"]')).map(el => el.href)"
    );
  }
  return favicons;
};

const handlePageFaviconUpdated =
  (browserView: BrowserView, ipcSender: WebContents, tabId: string) =>
  async (_e: Event, favicons: string[] = []) => {
    if (favicons.length === 0) {
      favicons = await extractFavicon(browserView);
    }
    if (favicons.length > 0) {
      ipcSender.send(APP_EVENTS.setTabFavicon, {
        id: tabId,
        favicon: favicons[favicons.length - 1],
      });
    }
  };

const copyToclipboard = (menu: Menu) => (label: string, content: string) => {
  menu.append(
    new MenuItem({
      label,
      click: () => {
        clipboard.writeText(content, "clipboard");
      },
    })
  );
};

const handleContextMenu =
  (browserView: BrowserView) =>
  async (event: Event, params: ContextMenuParams) => {
    const { webContents } = browserView;
    const menu = new Menu();
    const addCopyMenu = copyToclipboard(menu);

    if (params.linkURL) addCopyMenu("Copy link url", params.linkURL);
    if (params.linkText) addCopyMenu("Copy link text", params.linkText);
    if (params.selectionText) addCopyMenu("Copy", params.selectionText);
    if (menu.items.length > 0) menu.append(new MenuItem({ type: "separator" }));

    const spellingSuggestions = await contextMenuHandler(
      event,
      params,
      webContents
    );
    if (spellingSuggestions.length > 0) {
      spellingSuggestions.forEach((mi) => menu.append(mi));
      menu.append(new MenuItem({ type: "separator" }));
    }
    menu.append(
      new MenuItem({
        label: "DevTools",
        click: () => webContents.openDevTools(),
      })
    );
    const { x, y } = params;
    menu.popup({ x, y });
  };

// Required for Service Workers -> https://github.com/electron/electron/issues/16196
const setGlobalUserAgentFallback = (userAgent: string) =>
  (app.userAgentFallback = userAgent);

const cleanUserAgent = (browserView) => {
  const validUserAgent = userAgentForView(browserView);
  browserView.webContents.userAgent = validUserAgent;
  setGlobalUserAgentFallback(validUserAgent);
};

const addTabs =
  (ipcSender: Electron.WebContents) => (tabsMetadata: TabSettings[]) => {
    tabsMetadata.forEach(({ id, url, sandboxed = false }) => {
      const tabSession = sandboxed
        ? session.fromPartition(`persist:${id}`, {
            cache: true,
          })
        : session.defaultSession;

      const tab = new BrowserView({
        webPreferences: {
          ...webPreferences,
          session: addUserAgentInterceptor(tabSession),
        },
      });
      tab.setAutoResize({ width: true, height: true });
      cleanUserAgent(tab);
      tab.webContents.loadURL(url);

      tab.webContents.on("will-navigate", handleRedirect(tab));
      tab.webContents.on("new-window", handleRedirect(tab));

      tab.webContents.on(
        "page-title-updated",
        handlePageTitleUpdated(ipcSender, id)
      );

      tab.webContents.on(
        "page-favicon-updated",
        handlePageFaviconUpdated(tab, ipcSender, id)
      );

      tab.webContents.on("context-menu", handleContextMenu(tab));

      const registerIdInTab = () =>
        tab.webContents.executeJavaScript(`window.tabId = '${id}';`);

      tab.webContents.on("dom-ready", registerIdInTab);
      registerIdInTab();

      tabs[id.toString()] = tab;
    });
    ipcSender.send(APP_EVENTS.addTabs, tabsMetadata);
  };

const getTab = (tabId?: string | null) =>
  tabId ? tabs[tabId.toString()] : null;

const getActiveTab = () => activeTab;

const setActiveTab = (tabId: string) => {
  activeTab = tabId.toString();
  settings.updateSettings({ activeTab });
};

const removeAll = () => {
  Object.values(tabs).forEach((browserView) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browserView.webContents as any).destroy()
  );
  Object.keys(tabs).forEach((key) => delete tabs[key]);
};

const reload = () =>
  Object.values(tabs).forEach((browserView) =>
    browserView.webContents.reload()
  );

const canNotify = (tabId: string) => {
  const { tabs: tabsSettings, disableNotificationsGlobally } =
    settings.loadSettings();
  const currentTab = tabsSettings.find((tab) => tab.id === tabId);
  if (disableNotificationsGlobally === true) {
    return false;
  }
  return currentTab ? !currentTab.disableNotifications : true;
};

export {
  addTabs,
  getTab,
  getActiveTab,
  setActiveTab,
  canNotify,
  reload,
  removeAll,
};
