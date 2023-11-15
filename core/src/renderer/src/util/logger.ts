import log from "electron-log/renderer";

log.errorHandler.startCatching();
log.transports.console.level = "info";
log.transports.ipc.level = "info";

export default log;
