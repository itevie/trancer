import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { Attachment, Message } from "discord.js";
import axios from "axios";
import { resolve } from "path";
import { createWriteStream } from "fs";
import Logger from "../../util/Logger";
import { actions } from "../../util/database";
import ecoConfig from "../../ecoConfig";
import { currency } from "../../util/textProducer";

let spiralLogger = new Logger("spirals");

const command: HypnoCommand = {
  name: "addspiral",
  aliases: ["as"],
  description: "Adds a spiral (link to one) to the database",
  usage: [["addspiral <link>", "Add a link which is after the spiral command"]],
  type: "spirals",
  guards: ["admin", "bot-server"],
  allowExceptions: true,

  handler: async (message) => {
    // Get the message
    let msg: Message = message.reference
      ? await message.fetchReference()
      : message;

    // Try get the link
    let link: string | null;

    // Check for file
    if (msg.attachments.size !== 0) {
      // Check the first one
      let attachment = msg.attachments.entries().next().value[1] as Attachment;

      // Check if correct type
      if (attachment.contentType !== "image/gif")
        return message.reply(`Please provide a GIF as the attachment!`);

      // Success
      link = attachment.proxyURL;
    } else if (msg.content.startsWith("https://")) {
      link = msg.content.split(" ")[0];
    } else {
      return message.reply(`Could not find an attachment or a link!`);
    }

    // Check if already exists
    if (await actions.spirals.has(link))
      return message.reply(`That spiral has already been added`);

    // Fetch it
    try {
      let head = await axios.head(link);

      // Check content-type
      if (head.headers["content-type"] !== "image/gif")
        return message.reply(
          `Expected a gif! Got: ${head.headers["content-type"]}`
        );

      // Download it
      let fileName = `${Date.now()}-${message.author.username}.gif`;
      let path = resolve(__dirname + `/../../data/spirals/${fileName}`);

      const writer = createWriteStream(path);

      axios
        .get(link, {
          responseType: "stream",
        })
        .then((response) => {
          response.data.pipe(writer);

          writer.on("error", async (err) => {
            console.log(err);
            await message.reply(
              `Failed to write the file :(\n(Added anyway, thanks)`
            );
            await actions.spirals.add(link, message.author.id, "");
            writer.close();
          });

          writer.on("finish", async () => {
            spiralLogger.log(
              `Sucessfully downloaded spiral ${link} to ${path}`
            );

            // Send to the logs and get the created attachment
            const channel = await message.client.channels.fetch(
              config.botServer.channels.logs
            );
            let spiral: Spiral;
            if (channel.isTextBased()) {
              // Send message
              await channel.send(
                `The following spiral was added by ${message.author.username}`
              );
              let createdMessage = await channel.send({ files: [path] });

              // Extract link
              let link = (
                createdMessage.attachments.entries().next()
                  .value[1] as Attachment
              ).url;
              spiral = await actions.spirals.add(link, msg.author.id, fileName);
            }

            await actions.eco.addMoneyFor(
              msg.author.id,
              ecoConfig.payouts.spirals.max,
              "helping"
            );

            // Done
            return message.reply(
              `Thanks! Sucessfully added the spiral (ID ${spiral.id})}! **${
                msg.author.username
              }** gained ${currency(ecoConfig.payouts.spirals.max)}!`
            );
          });
        });
    } catch (err) {
      console.log(err);
      let spiral = await actions.spirals.add(link, message.author.id, "");
      return message.reply(
        `Failed to download the spiral :(\nLink added directly (ID ${spiral.id})`
      );
    }
  },
};

export default command;
