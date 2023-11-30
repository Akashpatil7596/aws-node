/**
 * Logger setup
 */
import log4js from "log4js";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

log4js.configure({
    appenders: {
        out: { type: "stdout" },
        app: {
            type: "dateFile",
            filename: path.join(__dirname, "../public/logs/all-logs.log"),
            maxLogSize: 10485760,
            backups: 4,
            compress: true,
        },
        socketLogs: {
            type: "dateFile",
            filename: path.join(__dirname, "../public/logs/socketLogs/socket-logs.log"),
            maxLogSize: 10485760,
            backups: 4,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ["out", "app"], level: "debug" },
        socketLogs: {
            appenders: ["socketLogs"],
            level: "debug",
        },
    },
});
const logger = log4js.getLogger("app");
logger.level = "debug";
const socketLogs = log4js.getLogger("socketLogs");

export { logger, socketLogs };
