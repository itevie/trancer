import Logger from "../util/Logger";
import loadTs from "../util/tsLoader";

const logger = new Logger("events");
export default function loadEvents() {
  const eventFiles = loadTs(__dirname + "/../events");
  for (const eventFile of eventFiles) {
    require(eventFile);
    logger.log(`Loaded event: ${eventFile}`);
  }
}
