import Logger from "../util/Logger";
import loadTs from "../util/tsLoader";

const logger = new Logger("events");
export default function loadEvents() {
  const eventFiles = loadTs(__dirname + "/../events");
  const progress = logger.logProgress("Loaded event", eventFiles.length);
  for (const eventFile of eventFiles) {
    require(eventFile);
    progress(eventFile);
  }
  progress(true);
}
