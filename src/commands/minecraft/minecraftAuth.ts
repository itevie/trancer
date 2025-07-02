import { client } from "../..";
import MinecraftUserData from "../../models/MinecraftUserData";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { b } from "../../util/language";
import { mcAuthMap } from "../../website/routes/api/minecraftRoutes";

const command: HypnoCommand<{ code: string }> = {
  name: "mcauth",
  description: "Authenticate with the Minecraft server",
  type: "minecraft",
  guards: ["bot-server"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "code",
        type: "string",
        description: "The code the server gave you",
      },
    ],
  },

  handler: async (message, { args }) => {
    let body = Array.from(mcAuthMap.entries()).find(
      (x) => x[1].code === args.code,
    );
    if (!body)
      return {
        content: `That code does not exist.`,
      };

    let alreadyLoggedIn = await MinecraftUserData.getByUserId(
      message.author.id,
    );
    if (alreadyLoggedIn) {
      return {
        content: `You are already logged in as ${b(alreadyLoggedIn.data.username)} (${alreadyLoggedIn.data.uuid})`,
      };
    }

    let uuidAlreadyExists = await MinecraftUserData.getByUuid(body[1].uuid);
    if (uuidAlreadyExists) {
      let user = await client.users.fetch(uuidAlreadyExists.data.user_id);
      return {
        content: `That Minecraft player is already assigned to ${b(user.username)}`,
      };
    }

    mcAuthMap.delete(body[1].uuid);

    await MinecraftUserData.authenticate(message.author.id, body[1]);
    return {
      content: `Successfully assigned your Discord account to ${b(body[1].username)}!\nHave fun! :cyclone:`,
    };
  },
};

export default command;
