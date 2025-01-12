import { database } from "../database";

const _actions = {
  questionExists: async (
    question: string,
    serverId: string
  ): Promise<boolean> => {
    return !!(await database.get(
      "SELECT * FROM qotd_questions WHERE question = ? AND server_id = ?;",
      question,
      serverId
    ));
  },

  addQuestion: async (
    question: string,
    serverId: string,
    authorId: string
  ): Promise<void> => {
    await database.run(
      "INSERT INTO qotd_questions (question, server_id, suggestor) VALUES (?, ?, ?);",
      question,
      serverId,
      authorId
    );
  },

  getQuestions: async (serverId: string): Promise<QOTDQuestion[]> => {
    return await database.all<QOTDQuestion[]>(
      "SELECT * FROM qotd_questions WHERE server_id = ?;",
      serverId
    );
  },
} as const;

export default _actions;
