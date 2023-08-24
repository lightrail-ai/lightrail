import log from "electron-log/main";

log.initialize();
log.eventLogger.startLogging();
log.errorHandler.startCatching();

export default log;
