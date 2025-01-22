interface Item {
  id: number;
  name: string;
  price: number;
  description: string | null;
  droppable: boolean;
  weight: number;
  tag: string | null;
  buyable: boolean;
  emoji: string | null;
  max: number | null;
}

interface AquiredItem {
  item_id: number;
  user_id: string;
  amount: number;
  protected: boolean;
}
