global.isElectron = true;
global.toString = () => "[object Window]";
window.ipcRenderer = require("electron").ipcRenderer;
