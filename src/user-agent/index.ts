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
import axios from "axios";
import { BrowserView, BrowserWindow, Session } from "electron";
import {
  ChromiumVersions,
  ChromiumVersionsChannel,
  FirefoxVersions,
} from "./types";
const CHROMIUM_VERSIONS = "https://omahaproxy.appspot.com/all.json";
const FIREFOX_VERSIONS =
  "https://product-details.mozilla.org/1.0/firefox_versions.json";

const BROWSER_VERSIONS = {
  chromium: null,
  firefox: null,
  firefoxESR: null, // Extended support release
};

const USER_AGENT_INTERCEPTOR_FILTER = {
  urls: ["*://*.google.com/*"],
};

const latestChromium = async () => {
  const { data: tags } = await axios.get<ChromiumVersions>(CHROMIUM_VERSIONS);
  const stableVersion = tags
    .filter((version) => version.os === "linux")
    .flatMap((version) => version.versions)
    .filter((version) => version.channel === ChromiumVersionsChannel.Stable);
  return stableVersion?.[0]?.version;
};

const latestFirefox = async () => {
  const { data: versions } = await axios.get<FirefoxVersions>(FIREFOX_VERSIONS);
  return versions?.LATEST_FIREFOX_VERSION;
};

const latestFirefoxESR = async () => {
  const { data: versions } = await axios.get(FIREFOX_VERSIONS);
  return versions && versions.FIREFOX_ESR ? versions.FIREFOX_ESR : null;
};

const initBrowserVersions = async () => {
  const setVersion = (browser: string) => (version?: string) => {
    if (version) {
      BROWSER_VERSIONS[browser] = version;
    }
  };
  await Promise.all([
    latestChromium().then(setVersion("chromium")),
    latestFirefox().then(setVersion("firefox")),
    latestFirefoxESR().then(setVersion("firefoxESR")),
  ]);
};

const replaceChromeVersion = (userAgent: string) =>
  BROWSER_VERSIONS.chromium
    ? userAgent.replace(/Chrome\/.*? /g, `Chrome/${BROWSER_VERSIONS.chromium} `)
    : userAgent;

const sanitizeUserAgent = (userAgent: string) =>
  userAgent.replace(/Workpal\/.*? /g, "").replace(/Electron\/.*? /g, "");

const defaultUserAgent = (userAgent: string) =>
  sanitizeUserAgent(replaceChromeVersion(userAgent));

const firefoxUserAgent = (userAgent: string) => (firefoxVersion) => {
  if (firefoxVersion) {
    userAgent = userAgent.replace(
      /\) AppleWebKit.*/,
      `; rv:${firefoxVersion}) Gecko/20100101 Firefox/${firefoxVersion}`
    );
  }
  return userAgent;
};

const userAgentForView = (browserViewOrWindow: BrowserView | BrowserWindow) =>
  defaultUserAgent(browserViewOrWindow.webContents.userAgent);

const addUserAgentInterceptor = (
  session: Session & { userAgentInterceptor?: boolean }
) => {
  if (!session.userAgentInterceptor) {
    session.webRequest.onBeforeSendHeaders(
      USER_AGENT_INTERCEPTOR_FILTER,
      (details, callback) => {
        if (
          details.url.match(/https?:\/\/[^/]+google\.com.*/) && // NOSONAR
          !details.url.match(/https?:\/\/meet.google\.com.*/)
        ) {
          details.requestHeaders["User-Agent"] = firefoxUserAgent(
            details.requestHeaders["User-Agent"]
          )(BROWSER_VERSIONS.firefoxESR);
        }
        callback({ requestHeaders: details.requestHeaders });
      }
    );
    session.userAgentInterceptor = true;
  }
  return session;
};

export {
  BROWSER_VERSIONS,
  initBrowserVersions,
  userAgentForView,
  addUserAgentInterceptor,
};
