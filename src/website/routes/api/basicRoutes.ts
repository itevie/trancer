import { Router } from "express";
import statusThemes from "../../../commands/hypnosis/_util";
import settingsUpdate from "../../settingsUpdate";

export default function MakeBasicRoutes() {
  const router = Router();

  router.get("/api/bot_details", async (_, res) => {
    return res.status(200).send({
      status_themes: Object.keys(statusThemes),
      settings_definition: settingsUpdate,
    });
  });

  return router;
}
