import { measureAsync, measureSync } from './performanceMonitor';

// Lazy import for better code splitting
let monstresData: Creature[] | null = null;

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

// Cache for expensive operations
const searchCache = new Map<string, Creature[]>();
const typeCache = new Map<string, Creature[]>();
let allTypesCache: string[] | null = null;

/**
 * Lazy load creatures data only when needed
 */
async function loadCreaturesData(): Promise<Creature[]> {
  if (monstresData === null) {
    // Dynamic import for code splitting with performance tracking
    monstresData = await measureAsync('bestiary:loadData', async () => {
      const module = await import('../data/monstres_dnd_fr_complet.json');
      return module.default;
    }, { fileSize: '824KB' });
  }
  return monstresData;
}

/**
 * Charge toutes les créatures du bestiaire avec cache
 */
export async function loadAllCreatures(): Promise<Creature[]> {
  return await loadCreaturesData();
}

/**
 * Version synchrone pour la compatibilité ascendante
 * @deprecated Utilisez loadAllCreatures() async à la place
 */
export function loadAllCreaturesSync(): Creature[] {
  if (monstresData === null) {
    // Fallback synchrone - attention aux performances
    const monstresDataSync = require('../data/monstres_dnd_fr_complet.json');
    monstresData = monstresDataSync as Creature[];
  }
  return monstresData;
}

/**
 * Recherche une créature par son nom avec cache
 */
export async function findCreatureByName(name: string): Promise<Creature | undefined> {
  const creatures = await loadCreaturesData();
  return creatures.find(creature => 
    creature.nom.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Recherche des créatures par type avec cache
 */
export async function findCreaturesByType(type: string): Promise<Creature[]> {
  const cacheKey = type.toLowerCase();
  
  if (typeCache.has(cacheKey)) {
    return typeCache.get(cacheKey)!;
  }
  
  const creatures = await loadCreaturesData();
  const results = creatures.filter(creature => 
    creature.type.toLowerCase().includes(type.toLowerCase())
  );
  
  typeCache.set(cacheKey, results);
  return results;
}

/**
 * Recherche des créatures par puissance (FP)
 */
export async function findCreaturesByChallenge(challenge: string): Promise<Creature[]> {
  const creatures = await loadCreaturesData();
  return creatures.filter(creature => 
    creature.fp.toLowerCase().includes(challenge.toLowerCase())
  );
}

/**
 * Recherche des créatures légendaires
 */
export async function findLegendaryCreatures(): Promise<Creature[]> {
  const creatures = await loadCreaturesData();
  return creatures.filter(creature => creature.legendary);
}

/**
 * Recherche avancée de créatures avec cache et debouncing
 */
export async function searchCreatures(query: string): Promise<Creature[]> {
  return await measureAsync('bestiary:search', async () => {
    const cacheKey = query.toLowerCase().trim();
    
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey)!;
    }
    
    const creatures = await loadCreaturesData();
    const lowerQuery = cacheKey;
    
    const results = creatures.filter(creature => 
      creature.nom.toLowerCase().includes(lowerQuery) ||
      creature.type.toLowerCase().includes(lowerQuery) ||
      creature.alignement.toLowerCase().includes(lowerQuery) ||
      creature.taille.toLowerCase().includes(lowerQuery)
    );
    
    searchCache.set(cacheKey, results);
    return results;
  }, { query, totalCreatures: monstresData?.length || 0 });
}

/**
 * Obtient les types de créatures disponibles avec cache
 */
export async function getCreatureTypes(): Promise<string[]> {
  if (allTypesCache !== null) {
    return allTypesCache;
  }
  
  const creatures = await loadCreaturesData();
  const types = new Set(creatures.map(creature => creature.type));
  allTypesCache = Array.from(types).sort();
  return allTypesCache;
}

/**
 * Obtient les tailles de créatures disponibles
 */
export async function getCreatureSizes(): Promise<string[]> {
  const creatures = await loadCreaturesData();
  const sizes = new Set(creatures.map(creature => creature.taille));
  return Array.from(sizes).sort();
}

/**
 * Nettoie le cache - utile pour les tests ou la gestion mémoire
 */
export function clearCache(): void {
  searchCache.clear();
  typeCache.clear();
  allTypesCache = null;
} 