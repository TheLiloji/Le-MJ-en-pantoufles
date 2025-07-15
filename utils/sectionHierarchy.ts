import { markdownContent } from '../assets/markdownContent';

// Types pour la hiérarchie
export interface SectionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  count: string;
  color: string;
  hasSubsections: boolean;
}

export interface SubsectionItem {
  id: string;
  title: string;
  parentId: string;
}

// Fonction pour obtenir toutes les sections principales
export function getMainSections(): SectionItem[] {
  const sections: SectionItem[] = [
    {
      id: 'creation-du-personnage',
      title: 'Création du Personnage',
      description: 'Guide complet pour créer votre personnage D&D 5e',
      icon: 'users',
      count: 'Étapes de création',
      color: '#10B981',
      hasSubsections: false,
    },
    {
      id: 'races',
      title: 'Races Jouables',
      description: 'Toutes les races disponibles avec leurs traits',
      icon: 'crown',
      count: '16 races',
      color: '#8B5CF6',
      hasSubsections: true,
    },
    {
      id: 'classes',
      title: 'Classes & Archétypes',
      description: 'Toutes les classes avec leurs sous-classes',
      icon: 'sword',
      count: '13 classes',
      color: '#DC2626',
      hasSubsections: true,
    },
    {
      id: 'personnalite-et-historique',
      title: 'Personnalité & Historique',
      description: 'Arrière-plans et traits de personnalité',
      icon: 'brain',
      count: '13 arrière-plans',
      color: '#F59E0B',
      hasSubsections: true,
    },
    {
      id: 'grimoire',
      title: 'Grimoire de Sorts',
      description: 'Tous les sorts disponibles par niveau',
      icon: 'sparkles',
      count: '400+ sorts',
      color: '#06B6D4',
      hasSubsections: true,
    },
    {
      id: 'bestiaire',
      title: 'Bestiaire',
      description: 'Créatures et monstres avec stats complètes',
      icon: 'skull',
      count: '200+ créatures',
      color: '#059669',
      hasSubsections: true,
    },
    {
      id: 'equipement-d-aventurier',
      title: 'Équipement',
      description: 'Armes, armures et équipement d\'aventurier',
      icon: 'shield',
      count: 'Équipement complet',
      color: '#7C3AED',
      hasSubsections: false,
    },
    {
      id: 'armes',
      title: 'Armes',
      description: 'Catalogue complet des armes',
      icon: 'sword',
      count: 'Toutes les armes',
      color: '#B91C1C',
      hasSubsections: false,
    },
    {
      id: 'armures',
      title: 'Armures',
      description: 'Protections et armures disponibles',
      icon: 'shield',
      count: 'Toutes les armures',
      color: '#1D4ED8',
      hasSubsections: false,
    },
    {
      id: 'objets-magiques',
      title: 'Objets Magiques',
      description: 'Objets magiques et artefacts',
      icon: 'gem',
      count: '300+ objets',
      color: '#F59E0B',
      hasSubsections: false,
    },
    {
      id: 'liste-objets-magiques',
      title: 'Liste des Objets Magiques',
      description: 'Catalogue détaillé des objets magiques',
      icon: 'star',
      count: 'Liste complète',
      color: '#D97706',
      hasSubsections: true,
    },
    {
      id: 'combattre',
      title: 'Règles de Combat',
      description: 'Mécaniques de combat et actions',
      icon: 'target',
      count: 'Règles complètes',
      color: '#DC2626',
      hasSubsections: false,
    },
    {
      id: 'lancer-des-sorts',
      title: 'Lancer des Sorts',
      description: 'Règles pour lancer des sorts',
      icon: 'zap',
      count: 'Mécaniques',
      color: '#7C2D12',
      hasSubsections: false,
    },
    {
      id: 'utiliser-les-caracteristiques',
      title: 'Caractéristiques',
      description: 'Utilisation des caractéristiques',
      icon: 'heart',
      count: '6 caractéristiques',
      color: '#059669',
      hasSubsections: false,
    },
    {
      id: 'gerer-la-sante-du-personnage',
      title: 'Santé & Soins',
      description: 'Gestion des points de vie et soins',
      icon: 'heart',
      count: 'Règles de santé',
      color: '#DC2626',
      hasSubsections: false,
    },
    {
      id: 'partir-a-l-aventure',
      title: 'Partir à l\'Aventure',
      description: 'Règles pour l\'exploration',
      icon: 'map',
      count: 'Exploration',
      color: '#059669',
      hasSubsections: false,
    },
    {
      id: 'outils',
      title: 'Outils & Compétences',
      description: 'Utilisation des outils et compétences',
      icon: 'hammer',
      count: 'Outils divers',
      color: '#7C3AED',
      hasSubsections: false,
    },
    {
      id: 'montures-et-vehicules',
      title: 'Montures & Véhicules',
      description: 'Transport et montures',
      icon: 'leaf',
      count: 'Transport',
      color: '#059669',
      hasSubsections: false,
    },
    {
      id: 'marchandises',
      title: 'Marchandises',
      description: 'Commerce et marchandises',
      icon: 'gem',
      count: 'Marchandises',
      color: '#F59E0B',
      hasSubsections: false,
    },
    {
      id: 'les-tresors',
      title: 'Trésors',
      description: 'Gestion des trésors et richesses',
      icon: 'star',
      count: 'Trésors',
      color: '#D97706',
      hasSubsections: false,
    },
    {
      id: 'poisons',
      title: 'Poisons',
      description: 'Poisons et toxines',
      icon: 'droplets',
      count: 'Poisons',
      color: '#059669',
      hasSubsections: false,
    },
    {
      id: 'pieges',
      title: 'Pièges',
      description: 'Pièges et mécanismes',
      icon: 'target',
      count: 'Pièges',
      color: '#7C3AED',
      hasSubsections: false,
    },
    {
      id: 'maladies',
      title: 'Maladies',
      description: 'Maladies et afflictions',
      icon: 'skull',
      count: 'Maladies',
      color: '#DC2626',
      hasSubsections: false,
    },
    {
      id: 'folie',
      title: 'Folie',
      description: 'Règles de folie et démence',
      icon: 'brain',
      count: 'Folie',
      color: '#7C2D12',
      hasSubsections: false,
    },
    {
      id: 'construire-une-rencontre',
      title: 'Construire une Rencontre',
      description: 'Création d\'encounters',
      icon: 'sword',
      count: 'Rencontres',
      color: '#DC2626',
      hasSubsections: false,
    },
    {
      id: 'inventer-un-monstre-ou-un-pnj',
      title: 'Créer Monstres & PNJ',
      description: 'Création de créatures personnalisées',
      icon: 'skull',
      count: 'Création',
      color: '#7C3AED',
      hasSubsections: false,
    },
    {
      id: 'comprendre-le-profil-technique-des-monstres',
      title: 'Profils Techniques',
      description: 'Comprendre les stats des monstres',
      icon: 'book',
      count: 'Analyse',
      color: '#059669',
      hasSubsections: false,
    },
    {
      id: 'au-dela-du-niveau-1',
      title: 'Au-delà du Niveau 1',
      description: 'Progression et développement',
      icon: 'star',
      count: 'Progression',
      color: '#F59E0B',
      hasSubsections: false,
    },
    {
      id: 'options-de-personnalisation',
      title: 'Options de Personnalisation',
      description: 'Personnalisation avancée',
      icon: 'crown',
      count: 'Options',
      color: '#8B5CF6',
      hasSubsections: false,
    },
    {
      id: 'systeme-monetaire',
      title: 'Système Monétaire',
      description: 'Gestion de l\'argent et des pièces',
      icon: 'gem',
      count: 'Monnaie',
      color: '#D97706',
      hasSubsections: false,
    },
    {
      id: 'depenses-courantes',
      title: 'Dépenses Courantes',
      description: 'Coûts de la vie quotidienne',
      icon: 'gem',
      count: 'Dépenses',
      color: '#F59E0B',
      hasSubsections: false,
    },
    {
      id: 'les-cinq-royaumes',
      title: 'Les Cinq Royaumes',
      description: 'Univers et lore',
      icon: 'map',
      count: 'Lore',
      color: '#059669',
      hasSubsections: true,
    },
    {
      id: 'communaute',
      title: 'Communauté',
      description: 'Ressources communautaires',
      icon: 'users',
      count: 'Communauté',
      color: '#10B981',
      hasSubsections: true,
    },
  ];

  return sections;
}

// Fonction pour obtenir les sous-sections d'une section principale
export function getSubsections(parentId: string): SubsectionItem[] {
  const subsections: SubsectionItem[] = [];
  
  // Parcourir toutes les clés du markdownContent
  Object.keys(markdownContent).forEach(key => {
    if (key.startsWith(`${parentId}__`)) {
      const subsectionId = key.replace(`${parentId}__`, '');
      const title = formatSubsectionTitle(subsectionId);
      
      subsections.push({
        id: key,
        title: title,
        parentId: parentId,
      });
    }
  });
  
  return subsections.sort((a, b) => a.title.localeCompare(b.title));
}

// Fonction pour formater le titre d'une sous-section
function formatSubsectionTitle(subsectionId: string): string {
  // Convertir les tirets en espaces et capitaliser
  return subsectionId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fonction pour vérifier si une section a des sous-sections
export function hasSubsections(sectionId: string): boolean {
  return Object.keys(markdownContent).some(key => key.startsWith(`${sectionId}__`));
}

// Fonction pour obtenir le titre d'une section
export function getSectionTitle(sectionId: string): string {
  const titles: { [key: string]: string } = {
    'creation-du-personnage': 'Création du Personnage',
    'races': 'Races Jouables',
    'classes': 'Classes & Archétypes',
    'personnalite-et-historique': 'Personnalité & Historique',
    'grimoire': 'Grimoire de Sorts',
    'bestiaire': 'Bestiaire',
    'equipement-d-aventurier': 'Équipement',
    'armes': 'Armes',
    'armures': 'Armures',
    'objets-magiques': 'Objets Magiques',
    'liste-objets-magiques': 'Liste des Objets Magiques',
    'combattre': 'Règles de Combat',
    'lancer-des-sorts': 'Lancer des Sorts',
    'utiliser-les-caracteristiques': 'Caractéristiques',
    'gerer-la-sante-du-personnage': 'Santé & Soins',
    'partir-a-l-aventure': 'Partir à l\'Aventure',
    'outils': 'Outils & Compétences',
    'montures-et-vehicules': 'Montures & Véhicules',
    'marchandises': 'Marchandises',
    'les-tresors': 'Trésors',
    'poisons': 'Poisons',
    'pieges': 'Pièges',
    'maladies': 'Maladies',
    'folie': 'Folie',
    'construire-une-rencontre': 'Construire une Rencontre',
    'inventer-un-monstre-ou-un-pnj': 'Créer Monstres & PNJ',
    'comprendre-le-profil-technique-des-monstres': 'Profils Techniques',
    'au-dela-du-niveau-1': 'Au-delà du Niveau 1',
    'options-de-personnalisation': 'Options de Personnalisation',
    'systeme-monetaire': 'Système Monétaire',
    'depenses-courantes': 'Dépenses Courantes',
    'les-cinq-royaumes': 'Les Cinq Royaumes',
    'communaute': 'Communauté',
  };

  return titles[sectionId] || 'Section D&D';
} 