import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

let message: MessageCreateOptions = {
  embeds: [
    createEmbed()
      .setTitle("Here are all the ways you can setup Trancer in your server!")
      .addFields([
        {
          name: "Basic Settings",
          value:
            "A lot of trancer's settings are in `$prefixserversettings`! You can change many things like, prefix, channels, etc.!",
        },
        {
          name: "Random Imposition",
          value:
            "You can make Trancer send random imposition in differnet channels! Check it out with `$prefiximposet`!",
        },
        {
          name: "Autoban Settings",
          value:
            'Tired of manually banning people with bad usernames? Like "mommy"? Check out the `$prefixautoban` command!',
        },
        {
          name: "Counting Channel",
          value: "Have your very own conuting channel with `$prefixsetupcount`",
        },
        {
          name: "Themes",
          value:
            "Change how Trancer looks with `$prefixsetstatustheme`! Here you can change how the `$prefixsetstatus` command looks!",
        },
      ]),
  ],
};

export default message;
