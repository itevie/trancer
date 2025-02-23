import { HypnoCommand } from "../../types/util";
import graphviz from "graphviz";
import { actions } from "../../util/database";
import { getUsernameSync } from "../../util/cachedUsernames";
import { AttachmentBuilder } from "discord.js";
import { usernameToBrightHex } from "../marriage/tree";

const command: HypnoCommand = {
  name: "quotegraph",
  description: "Show who quoted who",
  type: "quotes",

  handler: async (message) => {
    const g = graphviz.digraph("G");
    const quotes = (await actions.quotes.getForServer(message.guild.id)).filter(
      (x) => x.created_by !== null
    );

    const addedNodes: string[] = [];

    for (const quote of quotes) {
      const authorUsername = getUsernameSync(quote.created_by);
      const quoteUsername = getUsernameSync(quote.author_id);

      if (!addedNodes.includes(authorUsername)) {
        addedNodes.push(authorUsername);
        let node = g.addNode(authorUsername);
        node.set("color", usernameToBrightHex(authorUsername));
        node.set("style", "filled");
      }

      if (!addedNodes.includes(quoteUsername)) {
        addedNodes.push(quoteUsername);
        let node = g.addNode(quoteUsername);
        node.set("color", usernameToBrightHex(quoteUsername));
        node.set("style", "filled");
      }

      g.addEdge(authorUsername, quoteUsername);
    }

    g.output("png", (buffer) => {
      const attachment = new AttachmentBuilder(buffer).setFile(buffer);

      return message.reply({
        files: [attachment],
      });
    });
  },
};

export default command;
