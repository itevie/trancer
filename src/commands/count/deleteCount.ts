import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "deletecount",
  description: "Removes the count from the server",
  type: "counting",

  handler: async (message) => {
    ConfirmAction({
      message,
      embed: createEmbed()
        .setTitle(`Confirm Deletion`)
        .setDescription(
          "Are you sure you want to delete the count from your server? This will remove your progress!"
        ),
      async callback() {
        await database.run(
          `DELETE FROM server_count WHERE server_id = ?`,
          message.guild.id
        );

        return {
          embeds: [
            createEmbed()
              .setTitle("Confirm Deletion")
              .setDescription("Counting has been removed from your server!"),
          ],
        };
      },
    });
  },
};

export default command;
