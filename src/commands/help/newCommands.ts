import { commands } from "../..";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { actions } from "../../util/database";
import { units } from "../../util/ms";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "newcommands",
  type: "help",
  description: "Gets a list of the latest added commands",

  handler: async (message) => {
    const period = units.day * 3;
    const list = (await actions.commandCreations.getAll())
      .map((x) => {
        return { ...x, created_at: new Date(x.created_at) };
      })
      .filter((x) => Date.now() - x.created_at.getTime() <= period);

    return paginate({
      message,
      embed: createEmbed().setTitle("Recently Added Commands"),
      type: "description",
      data: list.map(
        (x) => `**${x.name}**\n-# ${commands[x.name].description}`,
      ),
    });
  },
};

export default command;
