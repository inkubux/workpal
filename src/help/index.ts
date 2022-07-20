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
import { handleRedirect } from "../tab-manager/redirect";
import { showDialog } from "../browser-window";
import markDownIt from "markdown-it";

const md = markDownIt({ html: true, xhtmlOut: true });

const DOCS_DIR = path.resolve(__dirname, "../../docs");

const webPreferences = {
  contextIsolation: false,
  nativeWindowOpen: true,
  preload: `${__dirname}/preload.js`,
};

// Visible for testing
const fixRelativeUrls = (s: string) =>
  s.replace(
    /((src|href)\s*?=\s*?['"](?!http))([^'"]+)(['"])/gi,
    `$1${DOCS_DIR}/$3$4`
  );

const loadDocs = () =>
  fs
    .readdirSync(DOCS_DIR)
    .filter((fileName) => fileName.endsWith(".md"))
    .reduce((acc, fileName) => {
      acc[fileName] = fixRelativeUrls(
        md.render(fs.readFileSync(path.resolve(DOCS_DIR, fileName), "utf8"))
      );
      return acc;
    }, {});

const openHelpDialog = (mainWindow: BrowserWindow) => () => {
  const helpView = new BrowserView({ webPreferences });
  helpView.webContents.loadURL(`file://${__dirname}/index.html`);
  const handleRedirectForCurrentUrl = handleRedirect(helpView);
  helpView.webContents.on("will-navigate", handleRedirectForCurrentUrl);
  helpView.webContents.on("new-window", handleRedirectForCurrentUrl);
  showDialog(mainWindow, helpView);
};

export { fixRelativeUrls, openHelpDialog, loadDocs };
