import { User } from "discord.js";
import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { database } from "../../util/database";
import { b } from "../../util/language";
import { createEmbed } from "../../util/other";

const mapping: Record<
  string,
  { text: string; has2?: boolean; default1?: string; default2?: string }
> = {
  user: {
    text: "SELECT * FROM user_data WHERE user_id = ? AND guild_id = ?",
    has2: true,
    default2: config.botServer.id,
  },
  server: {
    text: "SELECT * FROM server_settings WHERE server_id = ?",
    default1: config.botServer.id,
  },
  eco: {
    text: "SELECT * FROM economy WHERE user_id = ?",
  },
} as const;

const command: HypnoCommand<{ table: string; id: any; id2: any }> = {
  name: "sqlnice",
  aliases: ["sqln"],
  description: "Get a nice view of objects",
  type: "admin",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "table",
        type: "string",
        oneOf: [...Object.keys(mapping)],
      },
      {
        name: "id",
        type: "user",
        infer: false,
        or: [
          {
            type: "string",
          },
        ],
      },
      {
        name: "id2",
        type: "user",
        infer: false,
        or: [
          {
            type: "string",
          },
        ],
      },
    ],
  },

  handler: async (message, { args }) => {
    if (args.id instanceof User) args.id = args.id.id;
    if (args.id2 instanceof User) args.id2 = args.id2.id;

    let part = mapping[args.table];
    let data = await database.get<any>(
      part.text,
      ...[
        args.id || part.default1 || null,
        args.id2 || part.default2 || null,
      ].filter((x) => !!x),
    );

    return paginate({
      message,
      embed: createEmbed(),
      pageLength: 40,
      type: "description",
      data: Object.keys(data).map((x) => `${b(x)}: ${data[x]}`),
    });
  },
};

export default command;
