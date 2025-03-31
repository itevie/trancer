import { uniqueCommands } from "../..";
import { database } from "../database";

const _actions = {
  getAll: async (): Promise<CommandCreation[]> => {
    return await database.all<CommandCreation[]>(
      "SELECT * FROM command_creations;",
    );
  },

  insertFor: async (name: string): Promise<void> => {
    await database.run(
      "INSERT INTO command_creations (name, created_at) VALUES (?, ?);",
      name,
      new Date().toISOString(),
    );
  },

  init: async (): Promise<void> => {
    let current = await _actions.getAll();
    for await (const [_, command] of Object.entries(uniqueCommands)) {
      if (!current.some((x) => x.name === command.name)) {
        await _actions.insertFor(command.name);
      }
    }
  },
} as const;

export default _actions;
