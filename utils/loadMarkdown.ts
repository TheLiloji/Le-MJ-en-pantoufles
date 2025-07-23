// Import du contenu Markdown depuis le fichier généré
import { markdownContent } from '@/assets/markdownContent';

// Fonction pour charger le contenu Markdown
export async function loadMarkdownContent(sectionId: string): Promise<string> {
  try {
    console.log('🔍 Tentative de chargement pour la section:', sectionId);
    
    const content = markdownContent[sectionId];
    
    if (!content) {
      throw new Error(`Section '${sectionId}' non trouvée`);
    }
    
    console.log('✅ Contenu chargé avec succès, longueur:', content.length);
    console.log('📄 Premiers 100 caractères:', content.substring(0, 100));
    
    return content;
  } catch (error) {
    console.error(`Erreur lors du chargement de la section ${sectionId}:`, error);
    throw new Error(`Impossible de charger la section ${sectionId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
} 