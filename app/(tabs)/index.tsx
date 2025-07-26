import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Plus, Sword, Shield, Heart, BookOpen, Package, Zap, Users, Star, ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const handleCreateCharacter = () => {
    router.push('/create');
  };

  const handleFeaturePress = (featureTitle: string) => {
    switch (featureTitle) {
      case "Gestion des Sorts":
        router.push('/spells');
        break;
      case "Sacs à Dos":
        router.push('/equipment');
        break;
      case "Grimoire D&D":
        router.push('/grimoire');
        break;
      default:
        break;
    }
  };

  const features = [
    {
      icon: <Zap size={24} color="#F59E0B" />,
      title: "Gestion des Sorts",
      description: "Créez et gérez vos grimoires de sorts avec emplacements et descriptions détaillées",
      color: "#F59E0B"
    },
    {
      icon: <Package size={24} color="#10B981" />,
      title: "Sacs à Dos",
      description: "Organisez les équipements de vos personnages avec gestion du poids et de la valeur",
      color: "#10B981"
    },
    {
      icon: <BookOpen size={24} color="#6B46C1" />,
      title: "Grimoire D&D",
      description: "Référence complète en français avec toutes les règles, un bestiaire complet et fournis, races, classes, combats véhicules enfin tout ce qui touche à DnD5e quoi (affichage parfois pas au point pour certaines règles)",
      color: "#6B46C1"
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/images/LogoMjPantoufles.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Le Mj En Pantoufles</Text>
            <Text style={styles.subtitle}>Votre compagnon D&D</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Star size={32} color="#F59E0B" />
          <Text style={styles.welcomeTitle}>Bienvenue dans votre application D&D</Text>
          <Text style={styles.welcomeText}>
            Découvrez toutes les fonctionnalités disponibles pour enrichir vos parties de Donjons & Dragons
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Fonctionnalités Disponibles</Text>
        
        {features.map((feature, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.featureCard}
            onPress={() => handleFeaturePress(feature.title)}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
              {feature.icon}
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <ArrowRight size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}

        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonHeader}>
            <Users size={32} color="#EF4444" />
            <Text style={styles.comingSoonTitle}>Création de Personnages</Text>
          </View>
          <Text style={styles.comingSoonText}>
            🚧 Cette fonctionnalité arrive bientôt ! 🚧
          </Text>
          <Text style={styles.comingSoonDescription}>
            Nous travaillons actuellement sur un système complet de création de personnages D&D avec :
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Choix de race et classe</Text>
            <Text style={styles.featureItem}>• Génération de statistiques</Text>
            <Text style={styles.featureItem}>• Sélection d'équipement de départ</Text>
            <Text style={styles.featureItem}>• Gestion des sorts et capacités</Text>
            <Text style={styles.featureItem}>• Sauvegarde et modification</Text>
          </View>
        </View>

        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonHeader}>
            <Text style={styles.comingSoonEmoji}>🚀</Text>
            <Text style={styles.comingSoonTitle}>Bientôt Disponible</Text>
          </View>
          
          <Text style={styles.comingSoonSubtitle}>
            (si on est fou et qu'on aime les nuits blanches)
          </Text>

          <Text style={styles.comingSoonDescription}>
            Et après la création de perso, on va faire ça (en vrai j'ai la flemme mais bon) :
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItemRow}>
              <Text style={styles.featureItemEmoji}>🌐</Text>
              <Text style={styles.featureItem}>Extension Chrome pour Roll20</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.featureItemEmoji}>📤</Text>
              <Text style={styles.featureItem}>Import/Export de personnages</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.featureItemEmoji}>👥</Text>
              <Text style={styles.featureItem}>Mode campagne multi-joueurs</Text>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.featureItemEmoji}>🏰</Text>
              <Text style={styles.featureItem}>Générateur de donjons</Text>
            </View>
          </View>

          <View style={styles.crazyNote}>
            <Text style={styles.crazyNoteText}>💡 Note : Les développeurs survivent au chocolat chaud ☕</Text>
          </View>
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
    backgroundColor: '#6B46C1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  featuresList: {
    marginBottom: 15,
  },
  featureItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  featureItemEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  crazyNote: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  crazyNoteText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: 'bold',
  },
  notifyButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comingSoonEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
});