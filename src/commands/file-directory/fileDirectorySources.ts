import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getSources, sources } from "./_util";
import { createEmbed } from "../../util/other";
import { paginate } from "../../util/components/pagination";

const command: HypnoCommand = {
  name: "sources",
  aliases: ["filesources"],
  description: "Get a list of sources in the file directory",
  type: "file-directory",

  handler: async (message, { serverSettings }) => {
    return paginate({
      message: message,
      embed: createEmbed()
        .setTitle("List of file sources")
        .setDescription(
          `Want to see your own files here? DM me on Discord! <@${config.owner}>`,
        ),
      type: "field",
      data: Object.entries(
        getSources(serverSettings.allow_nsfw_file_directory_sources),
      ).map((x) => {
        return {
          name: `${x[0]}`,
          value: `${x[1].description}\n> ${x[1].websites
            .map((x) => `[${x.match(/[a-z0-9]+(\.[a-z0-9]+)+/)[0]}](${x})`)
            .join(" | ")}`,
        };
      }),
    });
  },
};

export default command;
