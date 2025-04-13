import { actions } from "../database";
import { msToHowLong } from "../ms";
import { createEmbed } from "../other";
import { CommandCheckContext, CommandCheckPhase } from "./util";

export async function checkCommandRatelimit({
  command,
  details,
  message,
}: CommandCheckContext): CommandCheckPhase {
  if (!command.ratelimit) return true;

  let lastUsed = await actions.ratelimits.get(message.author.id, command.name);
  let ratelimit =
    typeof command.ratelimit === "function"
      ? await command.ratelimit(message, details)
      : command.ratelimit;

  if (ratelimit !== null) {
    let ms = ratelimit - (Date.now() - lastUsed.getTime());

    if (ms > 0) {
      await message.reply({
        embeds: [
          createEmbed()
            .setTitle(`Hey! You can't do that!`)
            .setColor("#FF0000")
            .setDescription(
              `You need to wait **${msToHowLong(ms)}** to use the **${
                command.name
              }** command!`,
            ),
        ],
      });
      return false;
    }

    await actions.ratelimits.set(message.author.id, command.name, new Date());
  }

  return true;
}
