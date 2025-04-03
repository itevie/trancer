import { Router } from "express";
import { client } from "../../..";
import { actions } from "../../../util/database";
import config from "../../../config";
import { ChannelType, PermissionsBitField } from "discord.js";
import { channel } from "diagnostics_channel";
import {
  getWebsiteSettingsFor,
  saveWebsiteSettingsFor,
} from "../../settingsUpdate";

export function MakeServerRoutes(): Router {
  const router = Router();

  router.get("/api/servers", async (req, res) => {
    const servers = Array.from(client.guilds.cache)
      .map((x) => x[1])
      .filter(
        (x) =>
          client.user.id === config.devBot.id ||
          // @ts-ignore
          x.members.cache.has(req.user),
      );
    return res.status(200).send(
      servers.map((x) => {
        return {
          id: x.id,
          name: x.name,
          avatar: x.iconURL(),
          can_manage: x.members.cache
            .get((req as any).user)
            ?.permissions.has(PermissionsBitField.Flags.ManageGuild),
        };
      }),
    );
  });

  router.get("/api/servers/:id/resources", async (req, res) => {
    if (!client.guilds.cache.get(req.params.id))
      return res.status(400).send({ message: "Invalid server ID provided." });
    if (
      !client.guilds.cache.get(req.params.id).members.cache.has(
        //@ts-ignore
        req.user,
      ) ||
      !client.guilds.cache
        .get(req.params.id)
        .members.cache.get((req as any).user)
        .permissions.has(PermissionsBitField.Flags.ManageGuild)
    )
      return res.status(401).send({
        message:
          "You are either not in this server, or do not have Manage Guilds permission.",
      });

    const server = client.guilds.cache.get(req.params.id);

    return res.status(200).send({
      channels: server.channels.cache
        .filter((x) => !x.isVoiceBased() && x.isTextBased())
        // @ts-ignore
        .sort((a, b) => a.position - b.position)
        .map((x) => {
          return {
            id: x.id,
            name: x.name,
          };
        }),
      roles: server.roles.cache.map((x) => {
        return {
          id: x.id,
          name: x.name,
          color: x.color,
        };
      }),
      settings: await getWebsiteSettingsFor(server.id),
      raw_settings: await actions.serverSettings.getFor(server.id),
    });
  });

  router.post("/api/servers/:id/settings", async (req, res) => {
    if (!client.guilds.cache.get(req.params.id))
      return res.status(400).send({ message: "Invalid server ID provided." });
    if (
      !client.guilds.cache.get(req.params.id).members.cache.has(
        //@ts-ignore
        req.user,
      ) ||
      !client.guilds.cache
        .get(req.params.id)
        .members.cache.get((req as any).user)
        .permissions.has(PermissionsBitField.Flags.ManageGuild)
    )
      return res.status(401).send({
        message:
          "You are either not in this server, or do not have Manage Guilds permission.",
      });

    const server = client.guilds.cache.get(req.params.id);
    const result = await saveWebsiteSettingsFor(server, req.body);

    if (!result) return res.status(200).send({ messasge: "Updated!" });
    return res.status(400).send({
      message: result,
    });
  });

  router.get("/api/servers/:id/user_data", async (req, res) => {
    if (!client.guilds.cache.get(req.params.id))
      return res.status(400).send({ message: "Invalid server ID provided." });
    if (
      !client.guilds.cache.get(req.params.id).members.cache.has(
        //@ts-ignore
        req.user,
      )
    )
      return res.status(401).send({ message: "You are not in this server" });

    const serverData = await actions.userData.getForServer(req.params.id);
    return res.status(200).send(serverData);
  });

  return router;
}
