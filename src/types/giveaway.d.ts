declare interface Giveaway {
  id: string;
  what: string;
  message_id: string;
  channel_id: string;
  author_id: string;
  min_level: number | null;
}

declare interface GiveawayEntry {
  giveaway_id: string;
  author_id: string;
}
