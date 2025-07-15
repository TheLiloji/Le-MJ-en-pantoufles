/**
 * Utilitaire pour nettoyer le contenu Markdown avant affichage
 * Supprime les éléments non supportés par React Native Markdown
 */

export function cleanMarkdownContent(content: string): string {
  if (!content) return '';

  let cleanedContent = content;

  // Supprimer les sélecteurs CSS (comme §§§ .hero, §§§ .table-container)
  cleanedContent = cleanedContent.replace(/§§§\s*\.\w+/g, '');

  // Supprimer les métadonnées (comme "title: Les cinq royaumes")
  cleanedContent = cleanedContent.replace(/^title:\s*.*$/gm, '');

  // Nettoyer les balises HTML non supportées
  // Supprimer les spans avec des classes spécifiques
  cleanedContent = cleanedContent.replace(/<span\s+class="orn">(\d+)<\/span>/g, '$1');
  cleanedContent = cleanedContent.replace(/<span\s+class="[^"]*">([^<]*)<\/span>/g, '$1');

  // Supprimer les divs avec des classes spécifiques
  cleanedContent = cleanedContent.replace(/<div\s+class="[^"]*">/g, '');
  cleanedContent = cleanedContent.replace(/<\/div>/g, '');

  // Nettoyer les liens internes qui ne fonctionnent pas
  // Remplacer les liens avec ancres par du texte simple
  cleanedContent = cleanedContent.replace(/\[([^\]]+)\]\(\/[^#]*#([^)]+)\)/g, '$1');
  
  // Remplacer les liens vers des pages inexistantes par du texte simple
  cleanedContent = cleanedContent.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Supprimer les balises HTML non supportées
  cleanedContent = cleanedContent.replace(/<br\s*\/?>/g, '\n');
  cleanedContent = cleanedContent.replace(/<hr\s*\/?>/g, '\n---\n');
  cleanedContent = cleanedContent.replace(/<p>/g, '');
  cleanedContent = cleanedContent.replace(/<\/p>/g, '\n\n');

  // Nettoyer les caractères spéciaux qui peuvent causer des problèmes
  cleanedContent = cleanedContent.replace(/&nbsp;/g, ' ');
  cleanedContent = cleanedContent.replace(/&amp;/g, '&');
  cleanedContent = cleanedContent.replace(/&lt;/g, '<');
  cleanedContent = cleanedContent.replace(/&gt;/g, '>');

  // Supprimer les lignes vides multiples
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Nettoyer les espaces en début et fin
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
}

/**
 * Fonction pour nettoyer un contenu Markdown spécifique
 * Peut être utilisée pour des cas particuliers
 */
export function cleanSpecificMarkdown(content: string, sectionId: string): string {
  let cleanedContent = cleanMarkdownContent(content);

  // Cas spéciaux selon la section
  if (sectionId.includes('grimoire')) {
    // Nettoyage spécifique pour les sorts
    cleanedContent = cleanedContent.replace(/<span\s+class="niveau">(\d+)<\/span>/g, '**Niveau $1**');
    cleanedContent = cleanedContent.replace(/<span\s+class="ecole">([^<]+)<\/span>/g, '**École: $1**');
    cleanedContent = cleanedContent.replace(/<span\s+class="composantes">([^<]+)<\/span>/g, '**Composantes: $1**');
  }

  if (sectionId.includes('bestiaire')) {
    // Nettoyage spécifique pour les créatures
    cleanedContent = cleanedContent.replace(/<span\s+class="ca">(\d+)<\/span>/g, '**CA $1**');
    cleanedContent = cleanedContent.replace(/<span\s+class="pv">(\d+)<\/span>/g, '**PV $1**');
    cleanedContent = cleanedContent.replace(/<span\s+class="vitesse">([^<]+)<\/span>/g, '**Vitesse: $1**');
  }

  if (sectionId.includes('classes')) {
    // Nettoyage spécifique pour les classes
    cleanedContent = cleanedContent.replace(/<span\s+class="niveau">(\d+)<\/span>/g, '**Niveau $1**');
    cleanedContent = cleanedContent.replace(/<span\s+class="dice">([^<]+)<\/span>/g, '**$1**');
  }

  if (sectionId.includes('races')) {
    // Nettoyage spécifique pour les races
    cleanedContent = cleanedContent.replace(/<span\s+class="trait">([^<]+)<\/span>/g, '**$1**');
  }

  // Nettoyage général pour tous les tableaux
  cleanedContent = cleanedContent.replace(/<table>/g, '');
  cleanedContent = cleanedContent.replace(/<\/table>/g, '');
  cleanedContent = cleanedContent.replace(/<thead>/g, '');
  cleanedContent = cleanedContent.replace(/<\/thead>/g, '');
  cleanedContent = cleanedContent.replace(/<tbody>/g, '');
  cleanedContent = cleanedContent.replace(/<\/tbody>/g, '');
  cleanedContent = cleanedContent.replace(/<tr>/g, '| ');
  cleanedContent = cleanedContent.replace(/<\/tr>/g, ' |\n');
  cleanedContent = cleanedContent.replace(/<th>/g, '**');
  cleanedContent = cleanedContent.replace(/<\/th>/g, '** | ');
  cleanedContent = cleanedContent.replace(/<td>/g, '');
  cleanedContent = cleanedContent.replace(/<\/td>/g, ' | ');

  return cleanedContent;
} 