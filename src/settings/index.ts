import { WorkpalSettings } from "./types";

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
import { BrowserView, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import { showDialog } from "../browser-window";

const HOME_DIR = os.homedir();
const APP_DIR = ".workpal";
const SETTINGS_FILE = "settings.json";
const DEFAULT_SETTINGS: WorkpalSettings = {
  disableNotificationsGlobally: false,
  tabs: [],
  enabledDictionaries: ["en-US"],
  activeTab: null,
  width: 800,
  height: 600,
};

const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  preload: `${__dirname}/preload.js`,
  partition: "persist:workpal",
};

const appDir = path.join(HOME_DIR, APP_DIR);
const settingsPath = path.join(appDir, SETTINGS_FILE);

const initAppDir = () => fs.mkdirSync(appDir, { recursive: true });

const containsTabId = (tabs: WorkpalSettings["tabs"]) => (tabId) =>
  tabs.map(({ id }) => id).includes(tabId);

const ensureActiveTab = (settings: WorkpalSettings) => {
  let { activeTab } = settings;
  const enabledTabs = settings.tabs.filter(({ disabled }) => !disabled);
  if (enabledTabs.length > 0 && !containsTabId(enabledTabs)(activeTab)) {
    activeTab = enabledTabs[0].id;
  }
  return { ...settings, activeTab };
};

const loadSettings = (): WorkpalSettings => {
  initAppDir();
  let loadedSettings = {};
  if (fs.existsSync(settingsPath)) {
    loadedSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  }
  return ensureActiveTab(Object.assign(DEFAULT_SETTINGS, loadedSettings));
};

const writeSettings = (settings) => {
  initAppDir();
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
};

const updateSettings = (settings) =>
  writeSettings(ensureActiveTab({ ...loadSettings(), ...settings }));

const openSettingsDialog = (mainWindow: BrowserWindow) => {
  const settingsView = new BrowserView({ webPreferences });
  settingsView.webContents.loadURL(`file://${__dirname}/index.html`);
  showDialog(mainWindow, settingsView);
};

export { loadSettings, updateSettings, openSettingsDialog };
