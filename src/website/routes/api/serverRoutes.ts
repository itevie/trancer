import { Router } from "express";
import { client } from "../../..";
import { actions } from "../../../util/database";

export function MakeServerRoutes(): Router {
  const router = Router();

  router.get("/api/servers", async (req, res) => {
    const servers = Array.from(client.guilds.cache)
      .map((x) => x[1])
      .filter((x) =>
        // @ts-ignore
        x.members.cache.has(req.user)
      );
    return res.status(200).send(
      servers.map((x) => {
        return {
          id: x.id,
          name: x.name,
          avatar: x.iconURL(),
        };
      })
    );
  });

  router.get("/api/servers/:id/usser_data", async (req, res) => {
    if (!client.guilds.cache.get(req.params.id))
      return res.status(400).send({ message: "Invalid server ID provided." });
    if (
      !client.guilds.cache.get(req.params.id).members.cache.has(
        //@ts-ignore
        req.user
      )
    )
      return res.status(401).send({ message: "You are not in this server" });

    const serverData = await actions.userData.getForServer(req.params.id);
    return res.status(200).send(serverData);
  });

  return router;
}
