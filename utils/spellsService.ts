import spellsData from '@/assets/data/sorts_dnd_fr.json';

export interface Spell {
  nom: string;
  niveau: string;
  ecole: string;
  temps_incantation: string;
  portee: string;
  composantes: string;
  concentration: string;
  rituel: string;
  description: string;
  url: string;
  classes?: string[];
}

export interface SavedSpell extends Spell {
  id: string;
  dateAdded: string;
}

let savedSpells: SavedSpell[] = [];

export const loadAllSpells = (): Spell[] => {
  const spells = spellsData as Spell[];
  // Nettoyer les données pour éviter les chaînes vides
  return spells.map(spell => {
    return {
      ...spell,
      concentration: spell.concentration?.trim() || '',
      rituel: spell.rituel?.trim() || '',
      nom: spell.nom?.trim() || '',
      ecole: spell.ecole?.trim() || '',
      temps_incantation: spell.temps_incantation?.trim() || '',
      portee: spell.portee?.trim() || '',
      composantes: spell.composantes?.trim() || '',
      description: spell.description?.trim() || '',
      url: spell.url?.trim() || '',
      niveau: spell.niveau?.trim() || '0',
      classes: spell.classes || [],
    };
  }).filter(spell => 
    spell.nom && 
    spell.nom.length > 0 && 
    spell.description && 
    spell.description.length > 0
  ).map(spell => {
    // Nettoyer encore plus strictement les chaînes vides
    const cleanSpell = { ...spell };
    
    // Remplacer les chaînes qui ne contiennent que des espaces ou des points par des chaînes vides
    const cleanString = (str: string) => {
      if (!str) return '';
      const trimmed = str.trim();
      // Si après trim c'est vide ou ne contient que des points/espaces
      if (!trimmed || /^[.\s]+$/.test(trimmed) || trimmed === '.') return '';
      return trimmed;
    };
    
    cleanSpell.concentration = cleanString(spell.concentration);
    cleanSpell.rituel = cleanString(spell.rituel);
    cleanSpell.temps_incantation = cleanString(spell.temps_incantation);
    cleanSpell.portee = cleanString(spell.portee);
    cleanSpell.composantes = cleanString(spell.composantes);
    cleanSpell.description = cleanString(spell.description);
    cleanSpell.url = cleanString(spell.url);
    
    return cleanSpell;
  });
};

// Fonction utilitaire pour vérifier si une chaîne est valide pour l'affichage
export const isValidDisplayString = (str: string | undefined | null): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed || trimmed.length === 0) return false;
  if (trimmed === '.') return false;
  if (/^[.\s]+$/.test(trimmed)) return false;
  return true;
};

// Cette fonction n'est plus nécessaire car les classes viennent directement du JSON
// const getClassesBySchool = (school: string): string[] => {
//   // Supprimé car on utilise maintenant les vraies classes du JSON
// };

export const searchSpells = (query: string): Spell[] => {
  const spells = loadAllSpells();
  const searchTerm = query.toLowerCase();
  
  return spells.filter(spell => 
    spell.nom.toLowerCase().includes(searchTerm) ||
    spell.ecole.toLowerCase().includes(searchTerm) ||
    spell.description.toLowerCase().includes(searchTerm) ||
    (spell.classes && spell.classes.some(c => c.toLowerCase().includes(searchTerm)))
  );
};

export const getSpellByLevel = (level: string): Spell[] => {
  const spells = loadAllSpells();
  return spells.filter(spell => spell.niveau === level);
};

export const getSpellBySchool = (school: string): Spell[] => {
  const spells = loadAllSpells();
  return spells.filter(spell => spell.ecole.toLowerCase() === school.toLowerCase());
};

export const getSpellByClass = (className: string): Spell[] => {
  const spells = loadAllSpells();
  return spells.filter(spell => {
    if (!spell.classes) return false;
    return spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
  });
};

export const getAvailableClasses = (): string[] => {
  const spells = loadAllSpells();
  const allClasses = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      spell.classes.forEach(className => {
        if (className && className.trim()) {
          allClasses.add(className.trim());
        }
      });
    }
  });
  
  return Array.from(allClasses).sort();
};

export const getSpellsByClassAndLevel = (className: string, level: string): Spell[] => {
  const spells = getSpellByClass(className);
  return spells.filter(spell => spell.niveau === level);
};

export const addSpellToSaved = (spell: Spell): void => {
  const savedSpell: SavedSpell = {
    ...spell,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString()
  };
  
  // Vérifier si le sort n'est pas déjà sauvegardé
  const exists = savedSpells.find(s => s.nom === spell.nom);
  if (!exists) {
    savedSpells.push(savedSpell);
  }
};

export const removeSpellFromSaved = (spellId: string): void => {
  savedSpells = savedSpells.filter(spell => spell.id !== spellId);
};

export const getSavedSpells = (): SavedSpell[] => {
  return [...savedSpells];
};

export const isSpellSaved = (spellName: string): boolean => {
  return savedSpells.some(spell => spell.nom === spellName);
}; 