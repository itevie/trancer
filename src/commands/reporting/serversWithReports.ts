import { Guild } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand = {
  name: "serverswithreports",
  description: "Gets a list of servers that have reporting enabled",
  type: "reporting",

  handler: async (message) => {
    const servers = await database.all<ServerSettings[]>(
      "SELECT * FROM server_settings WHERE report_channel IS NOT NULL"
    );
    let resolved: Guild[] = [];
    for await (const server of servers) {
      resolved.push(await message.client.guilds.fetch(server.server_id));
    }

    return message.reply(
      `**Receivers:** ${resolved
        .map((x) => x.name)
        .join(", ")}\n\n**Senders:** ${servers
        .filter((x) => x.report_trusted)
        .map((x) => resolved.find((y) => x.server_id === y.id))
        .join(", ")}`
    );
  },
};

export default command;
