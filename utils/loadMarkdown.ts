// Lazy loading for markdown content with caching
const markdownCache = new Map<string, string>();
let markdownContent: Record<string, string> | null = null;

/**
 * Lazy load markdown content only when needed
 */
async function loadMarkdownData(): Promise<Record<string, string>> {
  if (markdownContent === null) {
    try {
      // Dynamic import for code splitting
      const module = await import('../assets/markdownContent');
      markdownContent = module.markdownContent || {};
    } catch (error) {
      console.error('Failed to load markdown content:', error);
      markdownContent = {};
    }
  }
  return markdownContent;
}

/**
 * Fonction optimisée pour charger le contenu Markdown avec cache
 */
export async function loadMarkdownContent(sectionId: string): Promise<string> {
  try {
    console.log('🔍 Tentative de chargement pour la section:', sectionId);
    
    // Check cache first
    if (markdownCache.has(sectionId)) {
      console.log('✅ Contenu trouvé dans le cache');
      return markdownCache.get(sectionId)!;
    }
    
    // Load markdown data if not already loaded
    const content = await loadMarkdownData();
    
    if (!content[sectionId]) {
      throw new Error(`Section '${sectionId}' non trouvée`);
    }
    
    // Cache the content
    markdownCache.set(sectionId, content[sectionId]);
    
    console.log('✅ Contenu chargé avec succès, longueur:', content[sectionId].length);
    console.log('📄 Premiers 100 caractères:', content[sectionId].substring(0, 100));
    
    return content[sectionId];
  } catch (error) {
    console.error(`Erreur lors du chargement de la section ${sectionId}:`, error);
    throw new Error(`Impossible de charger la section ${sectionId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Preload specific sections for better performance
 */
export async function preloadMarkdownSections(sectionIds: string[]): Promise<void> {
  try {
    const content = await loadMarkdownData();
    
    sectionIds.forEach(sectionId => {
      if (content[sectionId] && !markdownCache.has(sectionId)) {
        markdownCache.set(sectionId, content[sectionId]);
      }
    });
    
    console.log(`✅ Préchargement de ${sectionIds.length} sections terminé`);
  } catch (error) {
    console.error('Erreur lors du préchargement:', error);
  }
}

/**
 * Clear cache to free memory
 */
export function clearMarkdownCache(): void {
  markdownCache.clear();
  console.log('🧹 Cache markdown nettoyé');
}

/**
 * Get cache statistics
 */
export function getMarkdownCacheStats(): { size: number; keys: string[] } {
  return {
    size: markdownCache.size,
    keys: Array.from(markdownCache.keys())
  };
} 