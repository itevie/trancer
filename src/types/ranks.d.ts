interface Rank {
  rank_name: string;
  created_by: string;
  created_at: number;
  description: string | null;
}

interface Vote {
  rank_name: string;
  votee: string;
  voter: string;
  created_at: number;
}
