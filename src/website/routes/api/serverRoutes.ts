import { Router } from "express";
import { client } from "../../..";
import { actions } from "../../../util/database";

export function MakeServerRoutes(): Router {
  const router = Router();

  router.get("/api/servers/:id/data", async (req, res) => {
    if (!client.guilds.cache.get(req.params.id))
      return res.status(400).send("Invalid server ID provided.");
    const serverData = await actions.userData.getForServer(req.params.id);
    return res.status(200).send(serverData);
  });

  return router;
}
