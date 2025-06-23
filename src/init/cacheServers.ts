import { client } from "..";
import Logger from "../util/Logger";
import { Init } from "./init";

const logger = new Logger("server-cache");
const init: Init = {
  whenReady: true,
  execute: async () => {
    const guilds = await client.guilds.fetch();
    for await (const [_, guild] of guilds) {
      const g = await guild.fetch();
      await g.members.fetch();
      logger.log(`Loaded server: ${g.name} (${g.id}) owned by ${g.ownerId}`);
    }
  },
};

export default init;
