# Facebook Don't Track Me

![logo](src/logo64.png)

Strip Facebook track parameters and clarify url

Inspired by [nboughton/nofbclid](https://github.com/nboughton/nofbclid)

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

## Work with Other Extensions

* [Privacy Badger _by EFF Technologists_](https://addons.mozilla.org/firefox/addon/privacy-badger17/)

  They canceled `mousedown` event that I need, you can disable **Privacy Badger** in Facebook only

* [Facebook Container _by Mozilla_](https://addons.mozilla.org/firefox/addon/facebook-container/)

  Work well together

* [uBlock Origin _by Raymond Hill_](https://addons.mozilla.org/firefox/addon/ublock-origin/)

  Work well together

## LICENSE

The MIT License

Copyright (c) 2019 FlandreDaisuki \<vbnm123c@gmail.com>
