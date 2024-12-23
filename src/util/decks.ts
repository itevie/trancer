import { client } from "..";

export async function updateServerDecks(): Promise<void> {
  if (!client.isReady()) throw new Error("Client is not ready.");

  const guilds = await client.guilds.fetch();

  for await (const [_, fakeGuild] of guilds) {
    const guild = await fakeGuild.fetch();
    const members = await guild.members.fetch()
    for await (const [_, member] of members) {
      
    }
  }
}