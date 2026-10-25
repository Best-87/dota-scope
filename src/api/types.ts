/**
 * TypeScript interfaces for OpenDota API responses and Dota 2 game entities.
 */

export interface PlayerProfile {
  account_id: number;
  personaname: string;
  name?: string | null;
  plus?: boolean;
  cheese?: number;
  steamid?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull: string;
  profileurl?: string;
  last_login?: string | null;
  loccountrycode?: string | null;
  is_contributor?: boolean;
  is_subscriber?: boolean;
}

export interface Player {
  account_id?: number;
  personaname?: string;
  avatarfull?: string;
  rank_tier: number | null;
  leaderboard_rank: number | null;
  tracked_until?: string | null;
  solo_competitive_rank?: number | null;
  competitive_rank?: number | null;
  mmr_estimate?: {
    estimate?: number | null;
  };
  profile?: PlayerProfile;
}

export interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
  similarity?: number;
  last_match_time?: string;
}

export interface WinLoss {
  win: number;
  lose: number;
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type: number;
  hero_id: number;
  start_time: number;
  kills: number;
  deaths: number;
  assists: number;
  average_rank?: number | null;
  xp_per_min: number;
  gold_per_min: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  last_hits: number;
  lane?: number | null;
  lane_role?: number | null;
  is_roaming?: boolean | null;
  cluster?: number;
  version?: number | null;
  party_size?: number | null;
}

export interface WardEvent {
  time: number;
  x: number;
  y: number;
  z?: number;
  key?: string;
  slot?: number;
  type?: string;
  entityleft?: boolean;
  ehandle?: number;
}

export interface PurchaseEvent {
  time: number;
  key: string;
  charges?: number;
}

export interface AbilityUpgrade {
  ability: number;
  time: number;
  level: number;
}

export interface MatchPlayer extends RecentMatch {
  // Items
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  backpack_0?: number | null;
  backpack_1?: number | null;
  backpack_2?: number | null;
  item_neutral?: number | null;

  // Economy & Resources
  net_worth: number;
  denies: number;
  level?: number;
  total_gold?: number;
  total_xp?: number;

  // Ward logs and counts
  obs_placed?: number;
  sen_placed?: number;
  obs_log?: WardEvent[];
  sen_log?: WardEvent[];
  obs_left_log?: WardEvent[];
  sen_left_log?: WardEvent[];

  // Time-series & upgrades
  gold_t?: number[];
  xp_t?: number[];
  purchase_log?: PurchaseEvent[];
  ability_upgrades_arr?: number[];
  ability_upgrades?: AbilityUpgrade[];

  // Combat metrics
  multi_kills?: Record<string, number>;
  kill_streaks?: Record<string, number>;
  stuns?: number;
  camps_stacked?: number;
  creeps_stacked?: number;
  runes?: Record<string, number>;
  actions_per_min?: number;
  pings?: number;

  // Player identity and benchmarks
  account_id?: number;
  personaname?: string;
  name?: string;
  rank_tier?: number | null;
  benchmarks?: Record<string, { raw: number; pct: number }>;
}

export interface PickBan {
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export interface MatchDetail {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  start_time: number;
  radiant_score: number;
  dire_score: number;
  players: MatchPlayer[];
  game_mode: number;
  lobby_type: number;
  radiant_gold_adv?: number[];
  radiant_xp_adv?: number[];
  patch?: number;
  cluster?: number;
  first_blood_time?: number;
  replay_url?: string;
  picks_bans?: PickBan[];
  barracks_status_radiant?: number;
  barracks_status_dire?: number;
  tower_status_radiant?: number;
  tower_status_dire?: number;
  skill?: number | null;
}

export interface HeroStats {
  hero_id: number;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

export interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}

export interface CountMetric {
  games: number;
  win: number;
}

export interface PlayerCount {
  leaver_status?: Record<string, CountMetric>;
  game_mode?: Record<string, CountMetric>;
  lobby_type?: Record<string, CountMetric>;
  lane_role?: Record<string, CountMetric>;
  region?: Record<string, CountMetric>;
  patch?: Record<string, CountMetric>;
  is_radiant?: Record<string, CountMetric>;
  [key: string]: Record<string, CountMetric> | undefined;
}

export interface HeroRanking {
  hero_id: number;
  score: number;
  percent_rank: number;
  card: number;
}

export interface WardMap {
  obs: Record<string, number>;
  sen: Record<string, number>;
}

export interface HeroConstant {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  legs?: number;
  base_health?: number;
  base_health_regen?: number;
  base_mana?: number;
  base_mana_regen?: number;
  base_armor?: number;
  base_mr?: number;
  base_attack_min?: number;
  base_attack_max?: number;
  base_str?: number;
  base_agi?: number;
  base_int?: number;
  str_gain?: number;
  agi_gain?: number;
  int_gain?: number;
  attack_range?: number;
  projectile_speed?: number;
  attack_rate?: number;
  move_speed?: number;
  turn_rate?: number | null;
  cm_enabled?: boolean;
}

export interface ItemConstant {
  id: number;
  name?: string;
  img: string;
  dname: string;
  cost: number | null;
  cd: number | false;
  mc: number | false;
  qual?: string;
  created?: boolean;
  notes?: string;
  attrib?: Array<{ key: string; header: string; value: string }>;
  hint?: string[];
  lore?: string;
  components?: string[] | null;
}

export interface MatchQueryParams {
  limit?: number;
  offset?: number;
  win?: number;
  patch?: number;
  game_mode?: number;
  lobby_type?: number;
  region?: number;
  date?: number;
  lane_role?: number;
  hero_id?: number;
  is_radiant?: number;
  included_account_id?: number[];
  excluded_account_id?: number[];
  with_hero_id?: number[];
  against_hero_id?: number[];
  significant?: number;
  having?: number;
  sort?: string;
  project?: string[];
}

export interface ParseResponse {
  job: {
    jobId: number;
  };
}
