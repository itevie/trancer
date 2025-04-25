import { REST } from "discord.js";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { CommandCheckContext } from "../util/messageStuff/util";

async function generateContext(args: string[]): Promise<CommandCheckContext> {
  return {
    command: {
      name: "test",
      type: "help",
      description: "Test",
      args: {
        requiredArguments: 2,
        args: [
          {
            name: "user",
            type: "user",
          },
          {
            name: "parts",
            type: "array",
            inner: "string",
          },
        ],
      },
      handler: async () => {},
    },
    args,
    wickStyle: {},
    details: {} as any,
    message: {} as any,
    settings: {} as any,
    economy: {} as any,
  };
}

test("implicit user", async () => {
  const result = 2;
});
