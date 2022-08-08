//@ts-ignore
global.isDesktop = true;
global.toString = () => "[object Window]";
//@ts-ignore
global.ipcRenderer = require("electron").ipcRenderer;
