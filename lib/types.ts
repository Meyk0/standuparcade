export interface Team {
  id: string;
  slug: string;
  name: string;
  skin: string;
  created_at: string;
}

export interface Member {
  id: string;
  team_id: string;
  name: string;
  tagline: string | null;
  is_active: boolean;
  ooo_date: string | null;
  created_at: string;
}

export interface SessionState {
  id: string;
  team_id: string;
  status: "idle" | "spinning" | "winner";
  spin_pool: string[];
  order_picked: string[];
  current_winner: string | null;
  updated_at: string;
}
