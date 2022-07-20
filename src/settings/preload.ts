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
import preact from "preact";
import preactHooks from "preact/hooks";
import htm from "htm";
import { AVAILABLE_DICTIONARIES, getEnabledDictionaries } from "../spell-check";
import { loadSettings } from "./";
import "../main/preload";
const settings = loadSettings();

const dictionaries = {
  available: AVAILABLE_DICTIONARIES,
  enabled: getEnabledDictionaries(),
};

declare global {
  interface Window {
    preact: typeof preact;
    preactHooks: typeof preactHooks;
    htm: typeof htm;
    dictionaries: typeof dictionaries;
    tabs: typeof settings.tabs;
    disableNotificationsGlobally: boolean;
  }
}

window.preact = preact;
window.preactHooks = preactHooks;
window.htm = htm;
window.dictionaries = dictionaries;

window.tabs = [...settings.tabs];

window.disableNotificationsGlobally = settings.disableNotificationsGlobally;
