import React from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomNavigation from './BottomNavigation';

type Props = {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (screen: any) => void;

  onHome: () => void;
  onExplore: () => void;
  onCommunities: () => void;
  onProfile: () => void;
  onCreate: () => void;

  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    gold: string;
  };
};

const userImage =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300';

const petImages = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
];

export default function PerfilScreen({
  isDark,
  onToggleTheme,
  onNavigate,
  onHome,
  onExplore,
  onCommunities,
  onProfile,
  onCreate,
  colors,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.top}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Meu perfil
          </Text>

          <TouchableOpacity
            onPress={() =>
              onNavigate('editarPerfil')
            }
            style={[
              styles.editButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.editText,
                { color: colors.text },
              ]}
            >
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userImage }}
            style={styles.profileImage}
          />

          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.username,
                { color: colors.text },
              ]}
            >
              @tais.petgram
            </Text>

            <Text
              style={[
                styles.name,
                { color: colors.text },
              ]}
            >
              Taís Barbosa
            </Text>

            <Text
              style={[
                styles.bio,
                { color: colors.muted },
              ]}
            >
              Apaixonada por animais 🐾
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.stats,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Stat number="24" label="Publicações" colors={colors} />
          <Stat number="1,2 mil" label="Seguidores" colors={colors} />
          <Stat number="384" label="Seguindo" colors={colors} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.gold },
            ]}
            onPress={() => onNavigate('editarPerfil')}
          >
            <Text style={styles.actionButtonText}>
              Editar perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButtonSecondary,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onNavigate('seguidores')}
          >
            <Text
              style={[
                styles.actionButtonSecondaryText,
                { color: colors.text },
              ]}
            >
              Seguidores
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Minhas publicações
        </Text>

        <View style={styles.grid}>
          {petImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gridItem}
              onPress={() =>
                onNavigate('publicacao')
              }
            >
              <Image
                source={{ uri: image }}
                style={styles.gridImage}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNavigation
        active="profile"
        isDark={isDark}
        onHome={onHome}
        onExplore={onExplore}
        onCreate={onCreate}
        onCommunities={onCommunities}
        onProfile={onProfile}
      />
    </View>
  );
}

function Stat({
  number,
  label,
  colors,
}: {
  number: string;
  label: string;
  colors: Props['colors'];
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statNumber,
          { color: colors.text },
        ]}
      >
        {number}
      </Text>

      <Text
        style={[
          styles.statLabel,
          { color: colors.muted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
  },

  editButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  editText: {
    fontSize: 11,
    fontWeight: '700',
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginRight: 17,
  },

  profileInfo: {
    flex: 1,
  },

  username: {
    fontSize: 15,
    fontWeight: '800',
  },

  name: {
    fontSize: 12,
    marginTop: 3,
  },

  bio: {
    fontSize: 11,
    marginTop: 7,
  },

  stats: {
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    marginTop: 18,
  },

  stat: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 16,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 9,
    marginTop: 3,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 24,
  },

  actionButton: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#211F1A',
  },

  actionButtonSecondary: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  actionButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    width: '31.8%',
    aspectRatio: 1,
    marginBottom: 7,
  },

  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  bottomSpace: {
    height: 20,
  },
});