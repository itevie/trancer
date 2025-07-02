import { Router } from "express";
import { generateCode } from "../../../util/other";
import MinecraftUserData from "../../../models/MinecraftUserData";
import { client } from "../../..";
import config from "../../../config";

export interface McAuthBody {
  uuid: string;
  username: string;
}

export const mcAuthMap = new Map<string, McAuthBody & { code: string }>();

export default function MakeMinecraftRoutes() {
  const router = Router();

  router.post("/api/minecraft/authentication", async (req, res) => {
    const { uuid, username } = req.body as McAuthBody;

    let entry = mcAuthMap.get(uuid);
    if (!entry) {
      entry = { uuid, username, code: generateCode(6) };
      mcAuthMap.set(uuid, entry);
    }

    res.status(200).send({ code: entry.code });
  });

  router.get("/api/minecraft/users/:id", async (req, res) => {
    const user = await MinecraftUserData.getByUuid(req.params.id);
    if (!user) return res.status(404).send({ message: "Player not found" });
    const discordUser = await client.users.fetch(user.data.user_id);
    const member = await client.guilds.cache
      .get(config.botServer.id)
      .members.fetch(user.data.user_id);

    const role = member.roles.cache
      .filter((x) => x.color !== 0)
      .sort((a, b) => b.position - a.position)
      .first();

    console.log(role.hexColor, role.color);

    res.status(200).send({
      ...user.data,
      discord_username: discordUser.username,
      discord_avatar: discordUser.displayAvatarURL(),
      discord_color: role.hexColor,
    });
  });

  return router;
}
