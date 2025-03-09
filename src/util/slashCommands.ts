import { REST, Routes } from "discord.js";
import { commands as _commands, client, uniqueCommands } from "..";
import config from "../config";
import { HypnoInteractionCommand } from "../types/util";
import Logger from "./Logger";

const logger = new Logger("slash");

export async function loadSlashCommands() {
  const rest = new REST().setToken(process.env.BOT_TOKEN);
  const commands = (
    Object.entries(uniqueCommands).filter((x) => "slash" in x[1]) as [
      string,
      HypnoInteractionCommand
    ][]
  ).map((x) => x[1].slash.toJSON());

  try {
    logger.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = (await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    })) as any;
    logger.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
}
