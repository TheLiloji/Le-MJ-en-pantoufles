import { Creature } from './bestiaryService';

export interface StructuredCreatureData {
  type: string;
  size: string;
  alignment: string;
  challenge: string;
  hitDiceCount: number;
  abilityScores: {
    for: number;
    dex: number;
    con: number;
    int: number;
    sag: number;
    cha: number;
  };
  savingThrows: string[];
  ac: {
    armorType: string;
    value: number;
  };
  skills: Array<{
    name: string;
    invalid: boolean;
    value: number;
  }>;
  movement: {
    walk: number;
  };
  senses: {
    darkvision: number;
    customPassivePerception: number;
  };
  damageTypeVulnerabilities: string[];
  damageTypeResistances: string[];
  damageTypeImmunities: string[];
  languages: string[];
  telepathy: number;
  environments: string[];
  dungeonTypes: string[];
  source: string;
  source_page: number;
}

/**
 * Convertit les données JSON structurées en format compatible avec le bestiaire
 */
export function convertStructuredToCreature(
  structuredData: StructuredCreatureData, 
  name: string
): Creature {
  return {
    nom: name,
    type: structuredData.type,
    taille: structuredData.size,
    alignement: structuredData.alignment,
    ca: `${structuredData.ac.value} (${structuredData.ac.armorType})`,
    pv: `${structuredData.hitDiceCount}d8`,
    vitesse: `${structuredData.movement.walk} m`,
    fp: structuredData.challenge,
    caracs: {
      FOR: `${structuredData.abilityScores.for} (${getModifier(structuredData.abilityScores.for)})`,
      DEX: `${structuredData.abilityScores.dex} (${getModifier(structuredData.abilityScores.dex)})`,
      CON: `${structuredData.abilityScores.con} (${getModifier(structuredData.abilityScores.con)})`,
      INT: `${structuredData.abilityScores.int} (${getModifier(structuredData.abilityScores.int)})`,
      SAG: `${structuredData.abilityScores.sag} (${getModifier(structuredData.abilityScores.sag)})`,
      CHA: `${structuredData.abilityScores.cha} (${getModifier(structuredData.abilityScores.cha)})`,
    },
    actions: generateActionsFromStructured(structuredData),
    actions_legendaires: '',
    image_url: null,
    ca_detail: generateCADetailFromStructured(structuredData),
    autres_infos: generateOtherInfoFromStructured(structuredData),
    legendary: false,
    url: '',
  };
}

/**
 * Calcule le modificateur d'une caractéristique
 */
function getModifier(score: number): string {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Génère les actions à partir des données structurées
 */
function generateActionsFromStructured(data: StructuredCreatureData): string {
  let actions = '';
  
  // Ajouter les jets de sauvegarde
  if (data.savingThrows.length > 0) {
    actions += `Jets de sauvegarde: ${data.savingThrows.join(', ')}\n\n`;
  }
  
  // Ajouter les compétences
  if (data.skills.length > 0) {
    actions += `Compétences: ${data.skills.map(skill => `${skill.name} +${skill.value}`).join(', ')}\n\n`;
  }
  
  // Ajouter les sens
  actions += `Sens: vision dans le noir ${data.senses.darkvision} m, Perception passive ${data.senses.customPassivePerception}\n\n`;
  
  // Ajouter les langues
  if (data.languages.length > 0) {
    actions += `Langues: ${data.languages.join(', ')}\n\n`;
  }
  
  // Ajouter la télépathie si présente
  if (data.telepathy > 0) {
    actions += `Télépathie: ${data.telepathy} m\n\n`;
  }
  
  return actions;
}

/**
 * Génère les détails de CA à partir des données structurées
 */
function generateCADetailFromStructured(data: StructuredCreatureData): string {
  let detail = `Classe d'armure${data.ac.value} (${data.ac.armorType})\n`;
  detail += `Points de vie${data.hitDiceCount}d8\n`;
  detail += `Vitesse${data.movement.walk} m\n`;
  detail += `FOR${data.abilityScores.for} (${getModifier(data.abilityScores.for)})\n`;
  detail += `DEX${data.abilityScores.dex} (${getModifier(data.abilityScores.dex)})\n`;
  detail += `CON${data.abilityScores.con} (${getModifier(data.abilityScores.con)})\n`;
  detail += `INT${data.abilityScores.int} (${getModifier(data.abilityScores.int)})\n`;
  detail += `SAG${data.abilityScores.sag} (${getModifier(data.abilityScores.sag)})\n`;
  detail += `CHA${data.abilityScores.cha} (${getModifier(data.abilityScores.cha)})\n`;
  
  if (data.savingThrows.length > 0) {
    detail += `Jets de sauvegarde${data.savingThrows.join(', ')}\n`;
  }
  
  if (data.skills.length > 0) {
    detail += `Compétences${data.skills.map(skill => `${skill.name} +${skill.value}`).join(', ')}\n`;
  }
  
  detail += `Sensvision dans le noir ${data.senses.darkvision} m, Perception passive ${data.senses.customPassivePerception}\n`;
  
  if (data.languages.length > 0) {
    detail += `Langues${data.languages.join(', ')}\n`;
  }
  
  detail += `Puissance${data.challenge}`;
  
  return detail;
}

/**
 * Génère les autres informations à partir des données structurées
 */
function generateOtherInfoFromStructured(data: StructuredCreatureData): string[] {
  const info: string[] = [];
  
  // Ajouter les résistances et immunités
  if (data.damageTypeVulnerabilities.length > 0) {
    info.push(`Vulnérabilités: ${data.damageTypeVulnerabilities.join(', ')}`);
  }
  
  if (data.damageTypeResistances.length > 0) {
    info.push(`Résistances: ${data.damageTypeResistances.join(', ')}`);
  }
  
  if (data.damageTypeImmunities.length > 0) {
    info.push(`Immunités: ${data.damageTypeImmunities.join(', ')}`);
  }
  
  // Ajouter les environnements
  if (data.environments.length > 0) {
    info.push(`Environnements: ${data.environments.join(', ')}`);
  }
  
  if (data.dungeonTypes.length > 0) {
    info.push(`Types de donjon: ${data.dungeonTypes.join(', ')}`);
  }
  
  return info;
}

/**
 * Parse les données JSON structurées depuis une chaîne
 */
export function parseStructuredCreatureData(jsonString: string): StructuredCreatureData | null {
  try {
    const data = JSON.parse(jsonString);
    return data as StructuredCreatureData;
  } catch (error) {
    console.error('Erreur lors du parsing des données structurées:', error);
    return null;
  }
}

/**
 * Valide les données structurées
 */
export function validateStructuredCreatureData(data: any): data is StructuredCreatureData {
  return (
    data &&
    typeof data.type === 'string' &&
    typeof data.size === 'string' &&
    typeof data.alignment === 'string' &&
    typeof data.challenge === 'string' &&
    typeof data.hitDiceCount === 'number' &&
    data.abilityScores &&
    typeof data.abilityScores.for === 'number' &&
    typeof data.abilityScores.dex === 'number' &&
    typeof data.abilityScores.con === 'number' &&
    typeof data.abilityScores.int === 'number' &&
    typeof data.abilityScores.sag === 'number' &&
    typeof data.abilityScores.cha === 'number' &&
    Array.isArray(data.savingThrows) &&
    data.ac &&
    typeof data.ac.armorType === 'string' &&
    typeof data.ac.value === 'number' &&
    Array.isArray(data.skills) &&
    data.movement &&
    typeof data.movement.walk === 'number' &&
    data.senses &&
    typeof data.senses.darkvision === 'number' &&
    typeof data.senses.customPassivePerception === 'number' &&
    Array.isArray(data.damageTypeVulnerabilities) &&
    Array.isArray(data.damageTypeResistances) &&
    Array.isArray(data.damageTypeImmunities) &&
    Array.isArray(data.languages) &&
    typeof data.telepathy === 'number' &&
    Array.isArray(data.environments) &&
    Array.isArray(data.dungeonTypes) &&
    typeof data.source === 'string' &&
    typeof data.source_page === 'number'
  );
} 