# Workpal

Personal Fork of [ElectronIM](https://github.com/manusa/electronim)

<!-- [![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/inkubux/workpal/blob/master/LICENSE)
[<img src="https://github.com/inkubux/workpal/workflows/Tests/badge.svg" />](https://github.com/inkubux/workpal/actions)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=manusa_workpal&metric=bugs)](https://sonarcloud.io/dashboard?id=manusa_workpal)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=manusa_workpal&metric=coverage)](https://sonarcloud.io/dashboard?id=manusa_workpal)
[![npm](https://img.shields.io/npm/v/workpal)](https://www.npmjs.com/package/workpal)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/inkubux/workpal?sort=semver)](https://github.com/inkubux/workpal/releases/latest)
[![workpal](https://snapcraft.io//workpal/badge.svg)](https://snapcraft.io/workpal) -->

Combine all your IM applications (or whatever you want) in a single browser (Electron) window.

## Quickstart

Detailed guides for installation can be followed in our comprehensive [setup guide](docs/Setup.md).

Download the latest binary version for your platform:
[releases](https://github.com/inkubux/workpal/releases/latest)

Or if you have Node installed in your system, you can try out Workpal by running one of the following commands:

```
npx workpal
```

```
npm install -g workpal
workpal
```

## Features

- ⚛ Multi-platform: Workpal is available for Linux 🐧, Mac 🍏 and Windows.
- 🌍 Based on Chromium 101
- 🔔 Desktop notifications: Workpal will notify you using your native system notifications.
- 🧐 Spellchecker: Workpal contains spellchecker dictionaries for many languages,
  if your language is not supported, just [file an issue](https://github.com/inkubux/workpal/issues/new).
- Supports any web based IM solution
- Drag-and-drop tab reordering
- 🔒 Configurable context for tabs (Isolated/sandboxed or shared). i.e. You can have multiple
  tabs/instances of the same service/web application if the context is sandboxed.
- 🔕 Notifications can be disabled for individual Applications
- 💤 Notifications can be disabled globally (Do not disturb)
- ⌨ Keyboard [shortcuts](docs/Keyboard-shortcuts.md)
- 🖥️ Screen sharing
- ⏯️ Mini player that displays the music playing in other tabs with play/pause buttons on the main interface
- 🧑‍💻 It slowly being migrated to typescript

<!-- ## [Screenshot](docs/Screenshots.md)

![Screenshot](docs/screenshots/main.png) -->

## Motivation

Personal Fork of [ElectronIM](https://github.com/manusa/electronim)
Inspired by [Rambox](https://github.com/ramboxapp/community-edition),
[Franz](https://github.com/meetfranz/franz) and [Ferdium](https://github.com/ferdium/ferdium-app)

I created **Workpal** because most of the solutions for having multiple web apps combined together were bloated or not maintained anymore. I found ElectronIM and liked the simplicity, the codebase was small and easy to get in. It lacked some elements but felt I could add them.

You should probably use [ElectronIM](https://github.com/manusa/electronim) as this fork is only a learning experience and a way to add features that I use everyday.

## Documentation

0. [Setup Guide](docs/Setup.md)
1. [Keyboard Shortcuts](docs/Keyboard-shortcuts.md)
2. [Troubleshooting](docs/Troubleshooting.md)

## Acknowledgements

- [Electron](https://electronjs.org/)
- [Bulma](https://github.com/jgthms/bulma)
- [Preact](https://github.com/preactjs/preact)
- [Chrome tabs](https://github.com/adamschwartz/chrome-tabs#readme)
- [Font Awesome Free](https://github.com/FortAwesome/Font-Awesome)
- [Nodehun](https://github.com/Wulf/nodehun/)
- [Woorm's dictionary repo](https://github.com/wooorm/dictionaries)
