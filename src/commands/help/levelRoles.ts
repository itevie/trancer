import LevelRole from "../../models/LevelRole";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { b } from "../../util/language";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "levelroles",
  description: "Get the level roles for the current server",
  type: "help",

  handler: async (message) => {
    let levelRoles = await LevelRole.fetchAll(message.guild.id);

    return paginate({
      message,
      embed: createEmbed().setTitle("Level Roles for " + message.guild.name),
      type: "description",
      data: levelRoles
        .sort((a, b) => b.data.level - a.data.level)
        .map((x) => `Level ${b(x.data.level)}: <@&${x.data.role_id}>`),
    });
  },
};

export default command;
