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
const { APP_EVENTS, WORKPAL_VERSION, ipcRenderer, docs } = window;
const { h, render } = window.preact;
// const {useReducer} = window.preactHooks;
const html = window.htm.bind(h);
const helpRoot = () => document.querySelector(".help-root");

const HelpDocument = ({ id }) => html`
  <a id=${id} />
  <div
    dangerouslySetInnerHTML=${{
      __html: docs[id],
    }}
  ></div>
`;

const Toc = () => html`
  <div class="toc-container">
    <h1 class="title">Table of Contents</h1>
    <ol>
      <li><a href="#Setup.md">Setup</a></li>
      <li><a href="#Keyboard-shortcuts.md">Keyboard Shortcuts</a></li>
      <li><a href="#Troubleshooting.md">Troubleshooting</a></li>
    </ol>
  </div>
`;

const Footer = () => html`
  <div class="documents-footer">Workpal version ${WORKPAL_VERSION}</div>
`;

const Content = () => html`
  <div class="documents-container">
    <${HelpDocument} id="Setup.md" />
    <${HelpDocument} id="Keyboard-shortcuts.md" />
    <${HelpDocument} id="Troubleshooting.md" />
    <${Footer} />
  </div>
`;

const Toolbar = () => {
  const close = () => ipcRenderer.send(APP_EVENTS.closeDialog);
  return html`
    <div class="toolbar">
      <button class="button is-link is-light" onclick=${close}>Close</button>
    </div>
  `;
};

const Help = () => html`
  <div class="help-content">
    <${Toc} />
    <${Content} />
  </div>
  <${Toolbar} />
`;

render(html`<${Help} />`, <HTMLDivElement>helpRoot());
