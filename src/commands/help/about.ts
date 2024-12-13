import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import config from "../../config";
import { commands, errors } from "../..";
import { promisify } from "util";
import { exec } from "child_process";
import { msToHowLong } from "../../util/ms";
import { database } from "../../util/database";

const command: HypnoCommand = {
  name: "about",
  description: "Get details about the bot",
  type: "help",

  handler: async (message, { serverSettings }) => {
    // Try fetch creators username
    let username: string = config.credits.creatorUsername;
    try {
      username = (await message.client.users.fetch(config.credits.creatorId))
        .username;
    } catch {}

    let cmds: string[] = [];
    for (const i in commands) {
      if (!cmds.includes(commands[i].name)) cmds.push(commands[i].name);
    }

    let spirals = await database.get("SELECT COUNT(*) as c FROM spirals");

    let { stdout: commitMessage } = await promisify(exec)(
      "git log -1 --pretty=%B"
    );
    let { stdout: dataSize } = await promisify(exec)(
      "du -h data.db | cut -f -1"
    );
    let { stdout: analyticSize } = await promisify(exec)(
      "du -h analytics_data.db | cut -f -1"
    );

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`About ${message.client.user.username}!`)
          .setDescription(
            `I am a hypnosis-oriented discord bot with many features! Check out: \`${serverSettings.prefix}help\`!`
          )
          .addFields([
            {
              name: "Details",
              value: [
                ["Server Count", `${message.client.guilds.cache.size}`],
                ["Command Count", `${cmds.length}`],
                ["Spiral Count", spirals.c],
                ["Uptime", msToHowLong(message.client.uptime)],
                ["Errors", errors],
                ["DB Size", dataSize.trim()],
                ["Analytics DB Size", analyticSize.trim()],
                ["Latest Update", `${commitMessage.trim()}`],
              ]
                .map((x) => `**${x[0]}**: ${x[1]}`)
                .join("\n"),
            },
            {
              name: "Credits",
              value: `**Created by**: ${username}\n**Server invite link**: ${config.credits.serverInvite}\n**GitHub**: ${config.credits.github}`,
            },
            {
              name: "Invite Me!",
              value:
                "Invite me to your own server by [clicking here!](https://discord.com/oauth2/authorize?client_id=1257438471664963705&permissions=563362270661696&integration_type=0&scope=bot)",
            },
          ]),
      ],
    });
  },
};

export default command;
