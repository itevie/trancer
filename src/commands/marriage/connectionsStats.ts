import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const emojis: Record<RelationshipType, string> = {
  dating: ":purple_heart:",
  married: ":pink_heart:",
  friends: ":green_heart:",
  enemies: ":red_heart:",
  worships: ":grey_heart:",
  parent: ":yellow_heart:",
};

const command: HypnoCommand = {
  name: "connectionstats",
  aliases: ["constats", "cstats"],
  description: "Get details on connections",
  type: "marriage",

  handler: async (message) => {
    const relationships = await actions.relationships.getAll();
    const singles = relationships.reduce((p, c) => {
      return { ...p, [c.type]: (p[c.type] ?? 0) + 1 };
    }, {}) as { [key: string]: number };
    const muturals: { [key: string]: number } = {};

    const done: string[] = [];
    for (const part of relationships) {
      const p1 = `${part.user1}-${part.user2}`;
      const p2 = `${part.user2}-${part.user1}`;

      if (done.includes(p1) || done.includes(p2)) continue;

      const secondary = relationships.find(
        (x) => x.user1 === part.user2 && x.user2 === part.user1
      );

      if (!secondary) continue;

      done.push(p1, p2);

      const key = [emojis[part.type], emojis[secondary.type]].sort().join("-");
      if (!muturals[key]) muturals[key] = 0;
      muturals[key]++;
    }

    return message.reply(
      "**List of relationships:**\n" +
        Object.entries(singles)
          .sort((a, b) => b[1] - a[1])
          .map((x) => `${emojis[x[0]]}: ${x[1]}`)
          .join("\n") +
        `\n\n**Mutural relationship types:**\n` +
        Object.entries(muturals)
          .sort((a, b) => b[1] - a[1])
          .map((x) => `${x[0]}: ${x[1]}`)
          .join("\n")
    );
  },
};

export default command;
