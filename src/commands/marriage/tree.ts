import { AttachmentBuilder, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import graphviz from "graphviz";
import { actions } from "../../util/database";
import { getUsernameSync } from "../../util/cachedUsernames";

const customColors = {
  "728714181192187964": "#FFB6C1",
  "978754785173983252": "#32e8bf",
};

const command: HypnoCommand<{
  global?: boolean;
  user?: User;
  depth?: number;
  connection?: RelationshipType;
  nocolors?: boolean;
  for?: User;
}> = {
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
      {
        name: "connection",
        type: "string",
        aliases: ["c", "con", "type"],
        description: "The kind of relationships to show",
        wickStyle: true,
        oneOf: [
          "dating",
          "married",
          "friends",
          "enemies",
          "worships",
          "parent",
        ],
      },
      {
        name: "nocolors",
        type: "boolean",
        aliases: ["nc"],
        description: "Turn off colors",
        wickStyle: true,
      },
      {
        name: "for",
        type: "user",
        aliases: ["foruser", "with"],
        description: "Get the relationship with just you and them",
        wickStyle: true,
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

    if (args.connection) {
      relationships = relationships.filter((x) => x.type === args.connection);
    }

    if (args.for) {
      relationships = relationships.filter(
        (x) =>
          (x.user1 === user.id && x.user2 === args.for.id) ||
          (x.user2 === user.id && x.user1 === args.for.id)
      );
    }

    const nodesAdded: string[] = [];
    for (const { user1, user2, type } of relationships) {
      const username1 = getUsernameSync(user1);
      const username2 = getUsernameSync(user2);

      const addNode = (userId, username) => {
        if (!nodesAdded.includes(userId)) {
          let node = g.addNode(username);
          node.set("style", "filled");

          if (username === user.username) {
            node.set("fillcolor", "lightblue");
            node.set("shape", "diamond");
          } else {
            if (!args.nocolors)
              node.set(
                "fillcolor",
                customColors[userId] ?? usernameToBrightHex(username)
              );
          }

          nodesAdded.push(userId);
        }
      };

      addNode(user1, username1);
      addNode(user2, username2);

      const colorMap = {
        married: "pink",
        dating: "purple",
        friends: "green",
        enemies: "red",
        parent: "yellow",
        worships: "grey",
      };

      const color = colorMap[type];
      g.addEdge(username1, username2).set("color", color);

      if (type === "married" || type === "dating") {
        g.addEdge(username2, username1).set("color", color);
      }
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

function usernameToBrightHex(username: string) {
  let hash = 0;

  // Hash the username into a numeric value
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Extract RGB components from hash
  let r = (hash >> 16) & 0xff;
  let g = (hash >> 8) & 0xff;
  let b = hash & 0xff;

  // **Ensure brightness is above a threshold**
  const minBrightness = 100; // 0 = black, 255 = white

  // Calculate brightness (perceived luminance formula)
  let brightness = 0.299 * r + 0.587 * g + 0.114 * b;

  // If too dark, shift values upward
  if (brightness < minBrightness) {
    r = (r + minBrightness) % 256;
    g = (g + minBrightness) % 256;
    b = (b + minBrightness) % 256;
  }

  // Convert to hex format
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
