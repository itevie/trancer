import { AttachmentBuilder, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import graphviz from "graphviz";
import { actions } from "../../util/database";
import { getUsernameSync } from "../../util/cachedUsernames";

const command: HypnoCommand<{ global?: boolean; user?: User; depth?: number }> =
  {
    name: "tree",
    description: "View your marriage tree",
    type: "marriage",

    args: {
      requiredArguments: 0,
      args: [
        {
          name: "user",
          type: "user",
          infer: true,
          description: "Get the tree from someone else's prespective",
        },
        {
          name: "global",
          type: "boolean",
          description:
            "Whether or not to show all relationships, not ones just somehow related to you",
          wickStyle: true,
        },
        {
          name: "depth",
          type: "wholepositivenumber",
          description:
            "The depth of relationships, default = 1. Overwritten with ?global",
          wickStyle: true,
          min: 1,
          max: 5,
        },
      ],
    },

    handler: async (message, { args }) => {
      const user = args.user ? args.user : message.author;
      const g = graphviz.digraph("G");

      let relationships = await actions.relationships.getAll();
      const relavent: string[] = [user.id];
      let _relationships: Relationship[] = [];

      if (!args.global) {
        for (let i = 0; i != (args.depth ?? 1); i++) {
          for (const r of relationships) {
            if (
              !_relationships.includes(r) &&
              relavent.some((x) => x === r.user1 || x === r.user2)
            )
              _relationships.push(r);
          }

          for (const r of _relationships) {
            if (!relavent.includes(r.user1)) relavent.push(r.user1);
            if (!relavent.includes(r.user2)) relavent.push(r.user2);
          }
        }

        relationships = _relationships;
        /*relationships = relationships.filter((x) =>
          relavent.some((y) => y === x.user1 || y === x.user2)
        );*/
      }

      const nodesAdded: string[] = [];
      for (const relationship of relationships) {
        const username1 = getUsernameSync(relationship.user1);
        const username2 = getUsernameSync(relationship.user2);
        if (!nodesAdded.includes(relationship.user1)) {
          let node = g.addNode(username1);
          if (username1 === user.username) {
            node.set("style", "filled");
            node.set("fillcolor", "lightblue");
          }
          nodesAdded.push(relationship.user1);
        }
        if (!nodesAdded.includes(relationship.user2)) {
          let node = g.addNode(username2);
          if (username2 === user.username) {
            node.set("style", "filled");
            node.set("fillcolor", "lightblue");
          }
          nodesAdded.push(relationship.user2);
        }

        const color = {
          married: "pink",
          dating: "purple",
          friends: "green",
          enemies: "red",
          parent: "yellow",
          worships: "grey",
        }[relationship.type];

        g.addEdge(username1, username2).set("color", color);
        if (relationship.type === "married" || relationship.type === "dating")
          g.addEdge(username2, username1).set("color", color);
      }

      g.output("png", (buffer) => {
        const attachment = new AttachmentBuilder(buffer).setFile(buffer);

        return message.reply({
          content: `:green_heart: = Friends :heart: = Enemies :purple_heart: = Dating :pink_heart: = Partners :yellow_heart: = Parent for :grey_heart: = Worships`,
          files: [attachment],
        });
      });
    },
  };

export default command;
