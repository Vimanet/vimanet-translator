# Vimanet translator

Vimanet translator is a smart desktop application, which integrates with your operating system
and helps you translate text really fast.

This project was generated with [Electron Forge CLI](https://electronforge.io/) where angular2 was specified as template.


## KEY FEATURES

* cross platform desktop application which runs on Windows and Linux.
* supports more than 70 languages
(it requires [Yandex Translate API key](https://tech.yandex.com/translate/) which must be specified in application settings)
* runs in system tray
(on Linux distributions that only have app indicator support, you have to install `libappindicator1` to make the tray icon work. [More details.](https://github.com/electron/electron/blob/master/docs/api/tray.md))
* can be configured to
    * start with operating system
    * translate clipboard text (in application settings user may specify hotkey to bind to this action)
* contains fully searchable and manageable history
* has got responsive design
* free and opensource


## TECHNOLOGIES

* [Electron](https://electron.atom.io/)
* [Angular](https://angular.io/)
* [Bootstrap](http://getbootstrap.com/)
* [TypeScript](https://www.typescriptlang.org/)


## DEVELOPMENT

If you want to develop Vimanet translator:

* install [Node](https://nodejs.org)
* clone project's repository
* go to project's folder
* run `npm install` to install dependencies.
* after you will have dependencies installed you will be able to:
    * launch application by running: `npm start`
    * package application by running: `npm run package`
    * generate platform specific distributables by running: `npm run make`
    * lint application by running: `npm run lint`

NOTE: To know more about electron forge click [HERE](https://github.com/electron-userland/electron-forge).