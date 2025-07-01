import axios from "axios";
import { AttachmentBuilder } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";

const apodBase = "https://api.nasa.gov";

interface Apod {
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

const command: HypnoCommand<{ date?: Date }> = {
  name: "apod",
  description: "Get the Astronomy Picture Of the Day",
  type: "fun",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "date",
        type: "date",
      },
    ],
  },

  handler: async (message, { args }) => {
    await message.react("⏳");
    try {
      const result = await axios.get<Apod>(
        apodBase +
          `/planetary/apod?api_key=${process.env.NASA_API_KEY}` +
          (args.date ? `&date=${args.date.toISOString().split("T")[0]}` : ""),
      );

      const data = result.data;

      if (data.media_type !== "image") {
        return {
          content: "The APOD for this date is not an image.",
        };
      }

      const imageResponse = await axios.get(data.url, {
        responseType: "arraybuffer",
      });

      const imageBuffer = Buffer.from(imageResponse.data, "binary");
      const fileName = "apod.jpg";
      const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });

      const embed = createEmbed()
        .setTitle(data.title)
        .setURL(data.url)
        .setDescription(data.explanation)
        .setImage(`attachment://${fileName}`);

      return {
        files: [attachment],
        embeds: [embed],
      };
    } catch (e) {
      return {
        content:
          "Failed to fetch the Astronomy Picture of the Day!\n> " +
          (e?.response?.data?.msg ?? e.toString()),
      };
    }
  },
};

export default command;
