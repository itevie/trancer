import { Router } from "express";
import { database } from "../../../util/database";

export default function MakeSettingsRoutes() {
  const router = Router();

  router.get("/api/imposition", async (req, res) => {
    // @ts-ignore
    const userId = req.user as string;
    const imposition = await database.all<UserImposition[]>(
      "SELECT * FROM user_imposition WHERE user_id = ?;",
      userId
    );
    return res.status(200).send(imposition);
  });

  router.post("/api/imposition", async (req, res) => {
    // @ts-ignore
    const userId = req.user;
    const toInsert: UserImposition[] = [];
    if (!Array.isArray(req.body))
      return res.status(400).send({
        message: "Expected array of triggers",
      });
    for (const trigger of req.body) {
      if (
        !trigger.what ||
        typeof trigger.what !== "string" ||
        !trigger.tags ||
        !Array.isArray(trigger.tags) ||
        trigger.tags.some((x: string) => typeof x !== "string")
      )
        return res.status(400).send({
          message: "Invalid body",
        });
      toInsert.push({
        what: trigger.what,
        tags: trigger.tags.join(";"),
        user_id: userId,
        is_bombardable: false,
      });
    }

    // Done
    await database.run(
      "DELETE FROM user_imposition WHERE user_id = ?;",
      userId
    );
    for (const trigger of toInsert)
      await database.run(
        "INSERT INTO user_imposition (user_id, what, tags) VALUES (?, ?, ?);",
        userId,
        trigger.what,
        trigger.tags
      );

    return res.status(200).send({
      message: "Updated",
    });
  });

  return router;
}
