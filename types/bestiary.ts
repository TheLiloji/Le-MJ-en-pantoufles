export interface Creature {
  nom: string;
  type: string;
  taille: string;
  alignement: string;
  ca: string;
  pv: string;
  vitesse: string;
  fp: string;
  caracs: {
    FOR: string;
    DEX: string;
    CON: string;
    INT: string;
    SAG: string;
    CHA: string;
  };
  actions: string;
  actions_legendaires: string;
  image_url?: string | null;
  ca_detail?: string;
  autres_infos?: string[];
  legendary?: boolean;
  url?: string;
}

export interface CreatureFilters {
  searchQuery: string;
  minFP: number;
  maxFP: number;
  type?: string;
  taille?: string;
  alignement?: string;
}

export interface SortOptions {
  type: 'alphabetical' | 'fp' | 'type';
  order: 'asc' | 'desc';
}