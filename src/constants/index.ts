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
import fs from "fs";
import path from "path";

export const ROOT_DIR = path.resolve(__dirname, "../../");

export const APP_EVENTS = {
  activateTab: "activateTab",
  activateTabInContainer: "activateTabInContainer",
  addTabs: "addTabs",
  closeDialog: "closeDialog",
  desktopCapturerGetSources: "desktopCapturerGetSources",
  desktopGetAllDisplays: "desktopGetAllDisplays",
  desktopGetPrimaryDisplay: "desktopGetPrimaryDisplay",
  dictionaryGetMisspelled: "dictionaryGetMisspelled",
  notificationClick: "notificationClick",
  reload: "reload",
  settingsOpenDialog: "settingsOpenDialog",
  settingsSave: "settingsSave",
  setTabFavicon: "setTabFavicon",
  setTabTitle: "setTabTitle",
  canNotify: "canNotify",
  tabsReady: "tabsReady",
  tabReorder: "tabReorder",
  zoomIn: "zoomIn",
  zoomOut: "zoomOut",
  zoomReset: "zoomReset",
};

export const WORKPAL_VERSION = JSON.parse(
  fs.readFileSync(path.resolve(ROOT_DIR, "package.json"), "utf8")
).version;
