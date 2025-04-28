import { AttachmentBuilder, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import graphviz from "graphviz";
import { actions } from "../../util/database";
import { getUsernameSync } from "../../util/cachedUsernames";
import { colorMap, marriageEmojis } from "./_util";

const customColors = {
  "728714181192187964": "#FFB6C1",
  "978754785173983252": "#32e8bf",
  "1211609576437317652": "#59CEFA",
};

export const customShapes = {
  "978754785173983252": "hexagon",
  "395877903998648322": "cylinder",
  "538666562878439435": "star",
  "1172150765150806046": "tripleoctagon",
  "506978166657646593": "triangle",
  "1317564797214134296": "folder",
};

const command: HypnoCommand<{
  global?: boolean;
  user?: User;
  depth?: number;
  connection?: RelationshipType;
  nocolors?: boolean;
  for?: User[];
  outgoing?: boolean;
  incoming?: boolean;
  allservers?: boolean;
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
        aliases: ["g"],
        description:
          "Whether or not to show all relationships, not ones just somehow related to you",
        wickStyle: true,
      },
      {
        name: "depth",
        type: "wholepositivenumber",
        aliases: ["d"],
        description:
          "The depth of relationships, default = 1. Overwritten with ?global",
        wickStyle: true,
        min: 1,
        max: 5,
      },
      {
        name: "connection",
        type: "string",
        aliases: ["c", "t", "con", "type"],
        description: "The kind of relationships to show",
        wickStyle: true,
        oneOf: Object.keys(marriageEmojis),
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
        type: "array",
        aliases: ["f", "foruser", "with"],
        description: "Get the relationship with just you and them",
        wickStyle: true,
        inner: "user",
      },
      {
        name: "incoming",
        type: "boolean",
        aliases: ["i", "inc"],
        description: "Only show incoming relationships",
        wickStyle: true,
      },
      {
        name: "outgoing",
        type: "boolean",
        aliases: ["o", "out"],
        description: "Only show outgoing relationships",
        wickStyle: true,
      },
      {
        name: "allservers",
        type: "boolean",
        aliases: ["as"],
        description: "Shows all servers in the tree",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const user = args.user ? args.user : message.author;
    const g = graphviz.digraph("G");

    let relationships = await actions.relationships.getAll();

    if (!args.allservers) {
      relationships = relationships.filter(
        (x) =>
          message.guild.members.cache.has(x.user1) &&
          message.guild.members.cache.has(x.user2),
      );
    }

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
          if (!relavent.includes(r.user1) && relavent.includes(r.user2))
            relavent.push(r.user1);
          if (!relavent.includes(r.user2) && relavent.includes(r.user1))
            relavent.push(r.user2);
        }
      }

      if (args.depth) {
        for (const r of relationships) {
          if (
            !_relationships.includes(r) &&
            _relationships.some(
              (x) => x.user1 === r.user1 || x.user2 === r.user1,
            ) &&
            _relationships.some(
              (x) => x.user1 === r.user2 || x.user2 === r.user2,
            )
          ) {
            _relationships.push(r);
          }
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

    if (args.outgoing) {
      relationships = relationships.filter((x) => x.user1 === user.id);
    }

    if (args.incoming) {
      relationships = relationships.filter((x) => x.user2 === user.id);
    }

    if (args.for) {
      const allowed = new Set([...(args.for || []).map((x) => x.id), user.id]);
      relationships = relationships.filter(({ user1, user2 }) => {
        const u1InAllowed = allowed.has(user1);
        const u2InAllowed = allowed.has(user2);

        return !(!u1InAllowed || !u2InAllowed);
      });
    }

    const nodesAdded: string[] = [];
    for (const { user1, user2, type } of relationships) {
      const username1 = getUsernameSync(user1);
      const username2 = getUsernameSync(user2);

      const addNode = (userId: string, username: string) => {
        if (!nodesAdded.includes(userId)) {
          let node = g.addNode(username);
          node.set("style", "filled");
          if (customShapes[userId]) node.set("shape", customShapes[userId]);

          if (username === user.username) {
            node.set("fillcolor", "lightblue");
            //node.set("shape", "diamond");
            node.set("penwidth", "3");
          } else {
            if (!args.nocolors)
              node.set(
                "fillcolor",
                customColors[userId] ?? usernameToBrightHex(username, userId),
              );
          }

          nodesAdded.push(userId);
        }
      };

      addNode(user1, username1);
      addNode(user2, username2);

      const color = colorMap[type];
      g.addEdge(username1, username2).set("color", color);

      if (type === "married" || type === "dating") {
        g.addEdge(username2, username1).set("color", color);
      }
    }

    g.output("png", (buffer) => {
      const attachment = new AttachmentBuilder(buffer).setFile(buffer);

      return message.reply({
        content: [
          "💚 = Friends",
          "❤️ = Enemies",
          "💜 = Dating",
          "🩷 = Partners",
          "💛 = Parent for",
          "🩶 = Worships",
          "🩵 = Owner of",
        ]
          .map((x) => `-# ${x}`)
          .join("\n"),
        files: [attachment],
      });
    });
  },
};

export default command;

export function usernameToBrightHex(username: string, userId?: string) {
  if (userId && customColors[userId]) return customColors[userId];

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
