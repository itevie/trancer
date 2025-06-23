import { args, client, handlers } from "..";
import config from "../config";
import { HypnoMessageHandler } from "../types/util";
import Logger from "../util/Logger";
import loadTs from "../util/tsLoader";
import { Init } from "./init";

const logger = new Logger("handlers");
const init: Init = {
  whenReady: true,
  execute: async () => {
    if (
      !args["no-handlers"] &&
      !(
        client.user.id === config.devBot.id &&
        config.devBot.ignoreMessageHandlers
      )
    ) {
      // Load handlers
      const handleFiles = loadTs(__dirname + "/messageHandlers");

      for (const handleFile of handleFiles) {
        const handleImport = require(handleFile).default as HypnoMessageHandler;
        if (handleImport.disabled) continue;
        handlers.push(handleImport);
        logger.log(`Loaded handler: ${handleImport.name}`);
      }
    }
  },
};

export default init;
