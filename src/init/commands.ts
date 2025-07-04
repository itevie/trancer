import { args, commands, uniqueCommands } from "..";
import { HypnoCommand } from "../types/util";
import Logger from "../util/Logger";
import loadTs from "../util/tsLoader";
import { Init } from "./init";

const logger = new Logger("commands");

const init: Init = {
  whenReady: true,
  priority: 1,
  async execute() {
    const commandFiles: string[] =
      args["load-cmd"] && args["load-cmd"].length > 0
        ? args["load-cmd"].map((x: string) => `${__dirname}/commands/${x}`)
        : loadTs(__dirname + "/../commands");

    const commandFileCache: Map<string, string> = new Map();
    const progress = logger.logProgress("Loaded commands", commandFiles.length);

    for (const commandFile of commandFiles) {
      try {
        let start = Date.now();
        const commandImport = require(commandFile).default as HypnoCommand;
        if (commandImport.ignore) continue;

        if (commands[commandImport.name]) {
          logger.warn(
            `Command ${commandImport.name} already exists and will be overwritten (${commandFileCache.get(commandImport.name)} => ${commandFile})`,
          );
        }

        commands[commandImport.name] = commandImport;
        commandFileCache.set(commandImport.name, commandFile);
        uniqueCommands[commandImport.name] = commandImport;
        for (const alias of commandImport.aliases || []) {
          if (commands[alias]) {
            logger.warn(
              `Command ${alias} already exists and will be overwritten (${commandFileCache.get(alias)} => ${commandFile})`,
            );
          }

          if (commandImport.eachAliasIsItsOwnCommand) {
            commands[alias] = {
              ...commandImport,
              name: alias,
            };
          } else {
            commands[alias] = commandImport;
          }
          commandFileCache.set(alias, commandFile);
        }
        progress(commandImport.name);
        let period = Date.now() - start;

        // if (period > 50) console.log(commandImport.name);
      } catch (e) {
        logger.error("Failed to load command: " + commandFile, e);
        process.exit(1);
      }
    }
    progress(true);
  },
};

export default init;
