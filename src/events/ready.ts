import { client, whenReadyInitiators } from "..";
import initAllManagers from "../managers/loadAll";
import initServer from "../website";
import Logger from "../util/Logger";
import config from "../config";

const logger = new Logger("ready");

client.on("ready", async () => {
  initAllManagers();

  logger.log(`${client.user?.username} successfully logged in!`);

  await (await client.guilds.fetch(config.botServer.id)).members.fetch();

  if (true || config.website.enabled) {
    initServer();
  }

  logger.log(`Executing when readies...`);
  for await (const part of whenReadyInitiators) await part();
});
