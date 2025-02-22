import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";
import config from "../config";

let message: MessageCreateOptions = {
  embeds: [
    createEmbed()
      .setTitle(`Thanks for inviting me to your server!`)
      .setDescription(
        `Here's everything you need to know about setting up Trancer in your server - I hope you enjoy this bot!`
      )
      .addFields([
        {
          name: "Basic Settings",
          value: `To setup basic settings in your server (e.g. prefix, verification, level notifications, etc.) check out the command \`.serversettings\``,
        },
        {
          name: "XP",
          value: `Trancer comes with an XP system, this allows you to track who is the most active, check out \`.xp\` and \`.category economy\``,
        },
        {
          name: "Counting",
          value: `You can have your very own counting channel with Trancer, check out \`.count\``,
        },
        {
          name: "Random Imposition Settings",
          value: `You can configure Trancer to send random bits of impositions/triggers in selected channels! Checkout \`.impositionsettings\``,
        },
        {
          name: "Autoban Settings",
          value: `You can configure Trancer to auto ban new joiners depending on their username/display name! For example, if someone with "mommy" in their name joins, Trancer will autoban them! Check out \`.autoban\``,
        },
        {
          name: "Everything Else",
          value: `Check out the other commands Trancer has with the simple \`.help\` command! Get info on a command with \`.command (command name)\``,
        },
        {
          name: "Support",
          value: `Have an issue / suggestion for the bot? Or need general assistance? Join the bot's server [here](${config.botServer.invite}).`,
        },
        {
          name: "Enjoy",
          value: `I hope you enjoy Trancer as much as I had working on it :heart:`,
        },
      ]),
  ],
};

export default message;
