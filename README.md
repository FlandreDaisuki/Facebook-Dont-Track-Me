# Facebook Don't Track Me

![logo](src/logo64.png)

Strip Facebook track parameters and clarify url

[[English](./README.md)] - [[正體中文](./README_zh-TW.md)]

- [Examples](#examples)
- [Installation](#installation)
  - [Firefox](#firefox)
  - [Chromium-based](#chromium-based)
  - [Userscript (lite)](#userscript-lite)
- [Permission Explanation](#permission-explanation)
  - [tabs / contextMenus / clipboardWrite](#tabs--contextmenus--clipboardwrite)
  - [webRequest / webRequestBlocking / \<all_urls>](#webrequest--webrequestblocking--all_urls)
- [Work with Other Extensions](#work-with-other-extensions)
- [LICENSE](#license)

## Examples

|An example of internal link in Facebook|An example of external link in Facebook|
|:-:|:-:|
|![An example of internal link in Facebook](assets/example1.png)|![An example of external link in Facebook](assets/example2.png)|

## Installation

### Firefox

[![firefox-addons-badge](assets/firefox-addons-badge58.png)](https://addons.mozilla.org/zh-TW/firefox/addon/facebook-dont-track-me/)

### Chromium-based

1. Clone it or download the zip and unzip it

![download zip](assets/download-zip.png)

2. Open developer mode and load the **src/** in project folder

![load project](assets/load-project.png)

### Userscript (lite)

The userscript release can clarify url in address bar but the tracking parameters are still in requests.

1. After install script managers (Tampermonkey, ...) and click [![Install-userscript-brightgreen](assets/Install-userscript-brightgreen.svg)](https://github.com/FlandreDaisuki/Facebook-Dont-Track-Me/raw/master/Facebook-Dont-Track-Me.user.js)

## Permission Explanation

### tabs / contextMenus / clipboardWrite

These permissions are for the implementation of right click and copy the clarified link.

When click that function, the link will send to background and process it, then send back clarified URL to the tab you click and replace your clipboard content.

### webRequest / webRequestBlocking / \<all_urls>

The reason I use `<all_urls>` instead of Facebook's domain is the tracking parameter, like `fbclid`, are spread all over Facebook and non Facebook sites.

I don't want to send other sites these tracking parameters from non Facebook sites to other non Facebook sites.

The `webRequest` and `webRequestBlocking` can let me filter and clarify all requests.

## Work with Other Extensions

* [**Privacy Badger** _by EFF Technologists_](https://addons.mozilla.org/firefox/addon/privacy-badger17/)

  They canceled `mousedown` event that I need, you can disable **Privacy Badger** in Facebook only

* [**Facebook Container** _by Mozilla_](https://addons.mozilla.org/firefox/addon/facebook-container/)

  Work well together

* [**uBlock Origin** _by Raymond Hill_](https://addons.mozilla.org/firefox/addon/ublock-origin/)

  Work well together

## LICENSE

The MIT License

Copyright (c) 2019 FlandreDaisuki \<vbnm123c@gmail.com>
