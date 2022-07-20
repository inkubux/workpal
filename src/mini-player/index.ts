import { BrowserView, BrowserWindow, Menu, MenuItem } from "electron";

/*
    Copyright 2022 Francis Bélanger

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
export const MINI_PLAYER_CONTAINER_HEIGHT = 100;
const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  preload: `${__dirname}/preload.js`,
  partition: "persist:workpal",
};

const handleContextMenu = (browserView) => (_event, params) => {
  const { webContents } = browserView;
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "DevTools",
      click: () => webContents.openDevTools({ mode: "detach", activate: true }),
    })
  );
  const { x, y } = params;
  menu.popup({ x, y });
};

export const initMiniPlayerView = (mainWindow: BrowserWindow) => {
  const view = new BrowserView({ webPreferences });
  mainWindow.addBrowserView(view);
  view.setAutoResize({ width: true, height: false });

  view.webContents.loadURL(`file://${__dirname}/index.html`, {
    extraHeaders: "pragma: no-cache\nCache-control: no-cache",
  });

  view.webContents.on("context-menu", handleContextMenu(view));

  return view;
};
