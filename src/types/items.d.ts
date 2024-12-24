interface Item {
  id: number;
  name: string;
  price: number;
  description: string | null;
  droppable: boolean;
  weight: number;
  tag: string | null;
}

interface AquiredItem {
  item_id: number;
  user_id: string;
  amount: number;
}
