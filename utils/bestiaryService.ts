import monstresData from '@/assets/data/monstres_dnd_fr_complet.json';

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

/**
 * Charge toutes les créatures du bestiaire
 */
export function loadAllCreatures(): Creature[] {
  return monstresData as Creature[];
}

/**
 * Recherche une créature par son nom
 */
export function findCreatureByName(name: string): Creature | undefined {
  const creatures = loadAllCreatures();
  return creatures.find(creature => 
    creature.nom.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Recherche des créatures par type
 */
export function findCreaturesByType(type: string): Creature[] {
  const creatures = loadAllCreatures();
  return creatures.filter(creature => 
    creature.type.toLowerCase().includes(type.toLowerCase())
  );
}

/**
 * Recherche des créatures par puissance (FP)
 */
export function findCreaturesByChallenge(challenge: string): Creature[] {
  const creatures = loadAllCreatures();
  return creatures.filter(creature => 
    creature.fp.toLowerCase().includes(challenge.toLowerCase())
  );
}

/**
 * Recherche des créatures légendaires
 */
export function findLegendaryCreatures(): Creature[] {
  const creatures = loadAllCreatures();
  return creatures.filter(creature => creature.legendary);
}

/**
 * Recherche avancée de créatures
 */
export function searchCreatures(query: string): Creature[] {
  const creatures = loadAllCreatures();
  const lowerQuery = query.toLowerCase();
  
  return creatures.filter(creature => 
    creature.nom.toLowerCase().includes(lowerQuery) ||
    creature.type.toLowerCase().includes(lowerQuery) ||
    creature.alignement.toLowerCase().includes(lowerQuery) ||
    creature.taille.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtient les types de créatures disponibles
 */
export function getCreatureTypes(): string[] {
  const creatures = loadAllCreatures();
  const types = new Set(creatures.map(creature => creature.type));
  return Array.from(types).sort();
}

/**
 * Obtient les tailles de créatures disponibles
 */
export function getCreatureSizes(): string[] {
  const creatures = loadAllCreatures();
  const sizes = new Set(creatures.map(creature => creature.taille));
  return Array.from(sizes).sort();
}

/**
 * Obtient les alignements disponibles
 */
export function getCreatureAlignments(): string[] {
  const creatures = loadAllCreatures();
  const alignments = new Set(creatures.map(creature => creature.alignement));
  return Array.from(alignments).sort();
} 