import { commands } from "../..";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { compareTwoStrings, createEmbed } from "../../util/other";

const command: HypnoCommand<{ query: string }> = {
  name: "searchcommand",
  aliases: ["searchcmd", "scmd"],
  description: "Search for a list of commands",
  type: "help",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "query",
      },
    ],
  },

  handler: async (message, { args }) => {
    const results: [HypnoCommand, number][] = [];

    let check = (what: string, w: HypnoCommand): [boolean, number] => {
      let checkString = (w1: string, w2: string) => {
        return w2.startsWith(w1) || compareTwoStrings(w1, w2) > 0.6;
      };

      if (w.name.includes(what)) {
        return [true, 10];
      } else if (compareTwoStrings(what, w.name) > 0.6) {
        return [true, 6];
      } else if (w.aliases?.some((x) => x.includes(what))) {
        return [true, 7];
      } else if (w.aliases?.some((x) => compareTwoStrings(what, x) > 0.6)) {
        return [true, 5];
      }
    };

    for (const cmd of Object.values(commands)) {
      let result = check(args.query, cmd);
      if (result?.[0])
        if (!results.some((x) => x[0] === cmd)) results.push([cmd, result[1]]);
    }

    for (const cmd of Object.values(commands)) {
      if (compareTwoStrings(args.query, cmd.type) > 0.8) {
        if (!results.some((x) => x[0] === cmd)) results.push([cmd, 0]);
      }
    }

    return paginate({
      type: "field",
      message,
      embed: createEmbed().setTitle(`Results for ${args.query}`),
      data: results
        .sort((a, b) => b[1] - a[1])
        .map((x) => ({
          name: x[0].name,
          value: x[0].description,
          inline: true,
        })),
    });
  },
};

export default command;
