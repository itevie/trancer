interface MemberCount {
  time: string;
  server_id: string;
  amount: number;
}

interface MessagesAtTime {
  time: string;
  amount: number;
}

interface MessagesInChannel {
  channel_id: string;
  guild_id: string;
  amount: number;
}

interface MoneyTransaction {
  id: number;
  user_id: string;
  balance: number;
  added_at: number;
}

interface CommandUsage {
  command_name: string;
  used: number;
}
