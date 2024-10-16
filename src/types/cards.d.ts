type Rarity = "common" | "uncommon" | "rare" | "epic" | "mythic";

interface Deck {
  id: number;
  name: string;
  description: string;
}

interface Card {
  id: number;
  deck: number;
  description: string | null;
  name: string;
  link: string;
  file_name: string;
  rarity: Rarity;
  created_at: string;
}

interface AquiredCard {
  card_id: number;
  user_id: string;
  amount: number;
}
