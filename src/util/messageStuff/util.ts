import { Message } from "discord.js";
import { HypnoCommand, HypnoCommandDetails } from "../../types/util";

/**
 * Returns true if it should proceed,
 * Returns false if it should not.
 */
export type CommandCheckPhase = Promise<boolean>;
export interface CommandCheckContext {
  command: HypnoCommand<{}>;
  details: HypnoCommandDetails;
  message: Message<true>;
  args: string[];
  wickStyle: { [key: string]: string };
  settings: ServerSettings;
  economy: Economy;
}
