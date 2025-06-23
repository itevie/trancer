import HugeAlias from "../../models/HugeAlias";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { b, tick } from "../../util/language";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "myaliases",
  aliases: ["myhugealiases"],
  description: "Get a list of your huge aliases",
  type: "help",

  handler: async (message) => {
    let aliases = await HugeAlias.fetchAll(message.author.id);
    return paginate({
      message,
      embed: createEmbed().setTitle("Here is all your huge aliases"),
      type: "description",
      data: aliases.map((x) => `${b(x.data.command)}: ${tick(x.data.result)}`),
    });
  },
};

export default command;
