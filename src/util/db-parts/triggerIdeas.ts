import { database } from "../database";

const _actions = {
  add: async (
    name: string,
    description: string,
    addedBy: string,
  ): Promise<TriggerIdea> => {
    return await database.get<TriggerIdea>(
      "INSERT INTO trigger_ideas (name, description, added_by, added_at) VALUES (?, ?, ?, ?) RETURNING *;",
      name,
      description,
      addedBy,
      new Date().toISOString(),
    );
  },

  getAll: async (): Promise<TriggerIdea[]> => {
    return await database.all<TriggerIdea[]>("SELECT * FROM trigger_ideas");
  },

  remove: async (id: number): Promise<void> => {
    await database.run("DELETE FROM trigger_ideas WHERE id = ?", id);
  },
} as const;

export default _actions;
