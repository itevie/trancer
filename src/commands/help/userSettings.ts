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
          type: "boolean",
        },
        {
          dbName: "allow_triggers",
          human: "Allow Triggers (.i / .t)",
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
