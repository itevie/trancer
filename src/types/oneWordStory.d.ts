declare interface OneWordStory {
  id: number;
  guild_id: string;
  done: boolean;
  sentence: string;
  created_at: string;
  last_user: string | null;
}
