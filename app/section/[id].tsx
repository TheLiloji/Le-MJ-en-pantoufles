import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { loadMarkdownContent } from '../../utils/loadMarkdown';
import { getSectionTitle } from '../../utils/sectionHierarchy';
import { cleanSpecificMarkdown } from '../../utils/markdownCleaner';
import Markdown from 'react-native-markdown-display';

export default function SectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 SectionScreen: ID reçu:', id);
    
    if (!id) {
      setError('ID de section manquant');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        console.log('🚀 Début du chargement pour la section:', id);
        console.log('📁 Tentative de chargement du contenu...');
        
        const markdownContent = await loadMarkdownContent(id);
        const cleanedContent = cleanSpecificMarkdown(markdownContent, id);
        setContent(cleanedContent);
        
        console.log('✅ Contenu chargé avec succès, longueur:', markdownContent.length);
        console.log('📄 Premiers 100 caractères:', markdownContent.substring(0, 100));
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id]);

  const handleBackPress = () => {
    router.back();
  };

  const sectionTitle = id ? getSectionTitle(id) : 'Section D&D';

  console.log('🎨 Rendu de SectionScreen - loading:', loading, 'error:', error, 'content length:', content.length);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chargement...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Chargement du contenu...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{sectionTitle}</Text>
          <Text style={styles.subtitle}>Contenu D&D 5e</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Markdown style={markdownStyles}>
            {content}
          </Markdown>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#10B981',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  list_item: {
    marginBottom: 4,
    paddingLeft: 8,
  },
  bullet_list: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  ordered_list: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  code_block: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 16,
    marginVertical: 8,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  // Styles améliorés pour les tableaux
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#F9FAFB',
  },
  th: {
    padding: 12,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 14,
    color: '#1F2937',
  },
  td: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    fontSize: 14,
    color: '#374151',
  },
  tr: {
    flexDirection: 'row',
  },
  // Styles pour les éléments spéciaux
  hr: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 16,
  },
  // Styles pour les listes numérotées
  ordered_list_item: {
    marginBottom: 4,
    paddingLeft: 8,
  },
  // Styles pour les listes à puces
  bullet_list_item: {
    marginBottom: 4,
    paddingLeft: 8,
  },
}); 