import { client, whenReadyInitiators } from "..";
import Logger from "../util/Logger";

const logger = new Logger("ready");

client.on("ready", async () => {
  logger.log(`${client.user?.username} successfully logged in!`);
  logger.log(`Executing when readies...`);
  for await (const part of whenReadyInitiators.sort(
    (a, b) => (b?.priority ?? 0) - (a?.priority ?? 0),
  ))
    await part.execute();
  logger.log(`All done! ${client.user?.username} is completely ready`);
});
