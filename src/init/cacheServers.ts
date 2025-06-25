import { client } from "..";
import Logger from "../util/Logger";
import { Init } from "./init";

const logger = new Logger("server-cache");
const init: Init = {
  whenReady: true,
  execute: async () => {
    const guilds = await client.guilds.fetch();
    const progress = logger.logProgress("Loading servers", guilds.size);
    for await (const [_, guild] of guilds) {
      const g = await guild.fetch();
      await g.members.fetch();
      progress();
    }
    progress(true);
  },
};

export default init;
