import Logger from "../util/Logger";
import loadTs from "../util/tsLoader";
import { Init } from "./init";

const logger = new Logger("events");

const init: Init = {
  execute() {
    const eventFiles = loadTs(__dirname + "/../events");
    const progress = logger.logProgress("Loaded event", eventFiles.length);
    for (const eventFile of eventFiles) {
      require(eventFile);
      progress(eventFile);
    }
    progress(true);
  },
};

export default init;
