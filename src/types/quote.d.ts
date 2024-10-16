interface Quote {
  id: number;
  server_id: string;
  message_id: string;
  channel_id: string;
  author_id: string;
  created_at: number;
  last_guessed: number;
  content: string;
}
