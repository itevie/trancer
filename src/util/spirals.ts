import { actions } from "./database";

export async function getRandomSpiral(): Promise<Spiral> {
  const spirals = await actions.spirals.getAll();
  return spirals[Math.floor(Math.random() * spirals.length)];
}
