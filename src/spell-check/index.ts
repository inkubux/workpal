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
import { BrowserWindow, ipcMain } from "electron";
import { APP_EVENTS } from "../constants";
import { loadSettings } from "../settings";
import { MenuItem } from "electron";

const AVAILABLE_DICTIONARIES = {
  ca: {
    name: "Catalan",
  },
  "ca-valencia": {
    name: "Valencian",
  },
  de: {
    name: "German",
  },
  "en-GB": {
    name: "English (GB)",
  },
  "en-US": {
    name: "English (US)",
  },
  es: {
    name: "Spanish",
  },
  eu: {
    name: "Basque",
  },
  fr: {
    name: "French",
  },
  it: {
    name: "Italian",
  },
  ka: {
    name: "Georgian",
  },
  lt: {
    name: "Lithuanian",
  },
  nl: {
    name: "Dutch",
  },
  pl: {
    name: "Polish",
  },
  pt: {
    name: "Portuguese",
  },
  "pt-BR": {
    name: "Portuguese (Brazil)",
  },
  ru: {
    name: "Russian",
  },
  sv: {
    name: "Swedish",
  },
  tr: {
    name: "Turkish",
  },
  uk: {
    name: "Ukrainian",
  },
};

const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  nodeIntegration: true,
};

let fakeRendererWorker: BrowserWindow;

const handleGetMisspelled = async (_event, words) =>
  await fakeRendererWorker.webContents.executeJavaScript(
    `getMisspelled(${JSON.stringify(words)})`
  );

const getEnabledDictionaries = () => loadSettings().enabledDictionaries;

const loadDictionaries = () => {
  if (!fakeRendererWorker) {
    fakeRendererWorker = new BrowserWindow({
      show: false,
      webPreferences,
    });
    ipcMain.handle(APP_EVENTS.dictionaryGetMisspelled, handleGetMisspelled);
  }
  fakeRendererWorker.loadURL(
    `file://${__dirname}/dictionary.renderer/index.html`
  );
};

const contextMenuHandler = async (_event, { misspelledWord }, webContents) => {
  const ret: MenuItem[] = [];
  if (misspelledWord && misspelledWord.length > 0) {
    const suggestions =
      (await fakeRendererWorker.webContents.executeJavaScript(
        `getSuggestions('${misspelledWord}')`
      )) || [];

    (<string[]>suggestions).forEach((suggestion) =>
      ret.push(
        new MenuItem({
          label: suggestion,
          click: () => {
            webContents.replaceMisspelling(suggestion);
          },
        })
      )
    );
  }
  return ret;
};

export {
  AVAILABLE_DICTIONARIES,
  contextMenuHandler,
  getEnabledDictionaries,
  loadDictionaries,
};
