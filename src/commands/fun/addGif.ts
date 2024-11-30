import axios from "axios";
import { HypnoCommand } from "../../types/util";
import { downloadFile } from "../../util/other";
import { existsSync, mkdirSync } from "fs";

const command: HypnoCommand<{ type: string; link?: string }> = {
  name: "addgif",
  description: "Add a GIF for the actions",
  type: "actions",

  args: {
    requiredArguments: 1,
    args: [
      {
        type: "string",
        name: "type",
        oneOf: (require("./action").default as HypnoCommand).aliases,
      },
      {
        type: "string",
        name: "link",
      },
    ],
  },

  handler: async (message, { args }) => {
    let link = message.attachments.at(0)?.url ?? args.link;
    if (!link)
      return message.reply(`Please attach a GIF or send a link to one.`);

    let folder = `${__dirname}/../../data/gifs/${args.type}`;
    if (!existsSync(folder)) mkdirSync(folder);

    let path = `${folder}/${Date.now()}-${message.author.id}.gif`;

    let head = await axios.head(link);
    if (head.headers["content-type"] !== "image/gif") {
      return message.reply(
        `That link isn't a GIF! It is a: ${head.headers["content-type"]}`
      );
    }

    await downloadFile(link, path);
    return message.reply(`Thanks for the GIF!`);
  },
};

export default command;
