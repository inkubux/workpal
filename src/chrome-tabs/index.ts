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
import { BrowserView, BrowserWindow, Menu, MenuItem } from "electron";
import { openHelpDialog } from "../help";
import { openSettingsDialog } from "../settings";

export const TABS_CONTAINER_HEIGHT = 46;

const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  preload: `${__dirname}/preload.js`,
  partition: "persist:workpal",
};

const handleContextMenu = (mainWindow, browserView) => (_event, params) => {
  const { webContents } = browserView;
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Settings",
      click: () => openSettingsDialog(mainWindow),
    })
  );
  menu.append(
    new MenuItem({ label: "Help", click: openHelpDialog(mainWindow) })
  );
  menu.append(
    new MenuItem({
      label: "DevTools",
      click: () => webContents.openDevTools({ mode: "detach", activate: true }),
    })
  );
  const { x, y } = params;
  menu.popup({ x, y });
};

export const initTabContainerView = (mainWindow: BrowserWindow) => {
  const tabContainer = new BrowserView({ webPreferences });
  mainWindow.addBrowserView(tabContainer);
  tabContainer.setAutoResize({ width: true, horizontal: true });
  tabContainer.webContents.loadURL(`file://${__dirname}/index.html`, {
    extraHeaders: "pragma: no-cache\nCache-control: no-cache",
  });
  tabContainer.webContents.on(
    "context-menu",
    handleContextMenu(mainWindow, tabContainer)
  );
  return tabContainer;
};
