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

  // Nettoyer les caractères spéciaux AVANT de nettoyer les balises HTML
  cleanedContent = cleanedContent.replace(/&nbsp;/g, ' ');
  cleanedContent = cleanedContent.replace(/&amp;/g, '&');
  cleanedContent = cleanedContent.replace(/&lt;/g, '<');
  cleanedContent = cleanedContent.replace(/&gt;/g, '>');

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

  // Nettoyer TOUTES les balises HTML restantes (sécurité)
  cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');

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

  // Cas spéciaux selon la section - appliquer AVANT le nettoyage général
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

  // Conversion des tableaux HTML vers Markdown
  cleanedContent = convertHtmlTablesToMarkdown(cleanedContent);

  return cleanedContent;
}

/**
 * Fonction pour convertir les tableaux HTML en Markdown
 */
function convertHtmlTablesToMarkdown(content: string): string {
  // Pattern pour détecter un tableau HTML complet
  const tablePattern = /<table[^>]*>([\s\S]*?)<\/table>/g;
  
  return content.replace(tablePattern, (match, tableContent) => {
    const rows: string[][] = [];
    const headers: string[] = [];
    
    // Extraire les en-têtes
    const headerMatch = tableContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/);
    if (headerMatch) {
      const headerRowMatch = headerMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/);
      if (headerRowMatch) {
        const headerCells = headerRowMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/g);
        if (headerCells) {
          headers.push(...headerCells.map((cell: string) => 
            cell.replace(/<th[^>]*>([\s\S]*?)<\/th>/, '$1').trim()
          ));
        }
      }
    }
    
    // Extraire les lignes de données
    const tbodyMatch = tableContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
    if (tbodyMatch) {
      const rowMatches = tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
      if (rowMatches) {
        rowMatches.forEach((rowMatch: string) => {
          const cells = rowMatch.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
          if (cells) {
            const rowData = cells.map((cell: string) => 
              cell.replace(/<td[^>]*>([\s\S]*?)<\/td>/, '$1').trim()
            );
            rows.push(rowData);
          }
        });
      }
    }
    
    // Construire le tableau Markdown
    if (headers.length > 0) {
      const headerRow = `| ${headers.join(' | ')} |`;
      const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
      const dataRows = rows.map((row: string[]) => `| ${row.join(' | ')} |`);
      
      return `\n${headerRow}\n${separatorRow}\n${dataRows.join('\n')}\n`;
    } else if (rows.length > 0) {
      // Si pas d'en-têtes, utiliser la première ligne comme en-tête
      const firstRow = rows[0];
      const headerRow = `| ${firstRow.join(' | ')} |`;
      const separatorRow = `| ${firstRow.map(() => '---').join(' | ')} |`;
      const dataRows = rows.slice(1).map((row: string[]) => `| ${row.join(' | ')} |`);
      
      return `\n${headerRow}\n${separatorRow}\n${dataRows.join('\n')}\n`;
    }
    
    return '';
  });
}

/**
 * Fonction pour nettoyer le contenu de manière plus agressive
 * À utiliser si le contenu contient beaucoup de HTML non supporté
 */
export function cleanMarkdownAggressive(content: string): string {
  if (!content) return '';

  let cleanedContent = content;

  // Supprimer tous les sélecteurs CSS
  cleanedContent = cleanedContent.replace(/§§§[^\\n]*/g, '');

  // Supprimer toutes les métadonnées
  cleanedContent = cleanedContent.replace(/^[a-zA-Z]+:\s*.*$/gm, '');

  // Décoder tous les caractères spéciaux
  cleanedContent = cleanedContent.replace(/&nbsp;/g, ' ');
  cleanedContent = cleanedContent.replace(/&amp;/g, '&');
  cleanedContent = cleanedContent.replace(/&lt;/g, '<');
  cleanedContent = cleanedContent.replace(/&gt;/g, '>');
  cleanedContent = cleanedContent.replace(/&quot;/g, '"');
  cleanedContent = cleanedContent.replace(/&#39;/g, "'");

  // Supprimer TOUTES les balises HTML
  cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');

  // Nettoyer les espaces et retours à la ligne
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
} 