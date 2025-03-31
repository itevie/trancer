import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "randomtriggeridea",
  description: "Get a random trigger idea",
  type: "hypnosis",
  aliases: ["randomtrigger", "rndtrigger", "rtrig"],

  handler: async (message) => {
    const triggers = await actions.triggerIdeas.getAll();
    const trigger = triggers[Math.floor(Math.random() * triggers.length)];
    return message.reply(
      `**${trigger.name}** (ID ${trigger.id})\n> ${trigger.description}`,
    );
  },
};

export default command;
