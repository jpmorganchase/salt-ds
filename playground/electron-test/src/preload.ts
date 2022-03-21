//@ts-ignore
global.isElectron = true;
global.toString = () => "[object Window]";
//@ts-ignore
global.ipcRenderer = require("electron").ipcRenderer;
