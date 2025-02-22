import { HypnoCommand } from "../../types/util";
import { createSettingsPage } from "../../util/components/settingsPanel";
import { actions, database } from "../../util/database";

const command: HypnoCommand = {
  name: "usersettings",
  aliases: ["uset"],
  description: "Modify your user settings",
  type: "help",

  handler: async (message) => {
    return createSettingsPage({
      message,
      dbData: await actions.userData.getFor(
        message.author.id,
        message.guild.id
      ),
      options: [
        {
          dbName: "allow_requests",
          human: "Allow Game Requests",
          description:
            "Whether or not people can send you game invites (.ttt, .c4)",
          type: "boolean",
        },
        {
          dbName: "allow_triggers",
          human: "Allow Triggers (.i / .t)",
          description: "Whether or not people can use any of your triggers",
          type: "boolean",
        },
        {
          dbName: "auto_sell",
          human: "Auto-sell Fishes",
          description: "Whether ot not to auto-sell fishes",
          type: "boolean",
        },
      ],
      title: "Your Settings",
      onChange: async (key, value) => {
        return await database.get<UserData>(
          `UPDATE user_data SET ${key} = ? WHERE user_id = ? AND guild_id = ? RETURNING *;`,
          value,
          message.author.id,
          message.guild.id
        );
      },
    });
  },
};

export default command;
