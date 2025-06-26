export interface DbCard {
  id: number;
  deck: number;
  description: string;
  name: string;
  file_name: string;
  link: string;
  rarity: Rarity;
  created_at: string;
}

export default class Card {}
