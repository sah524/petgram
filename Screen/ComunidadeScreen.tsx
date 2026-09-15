import React from 'react';

import {
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

const communities = [
  {
    icon: '🐶',
    name: 'Amantes de Cachorros',
    members: '12,8 mil membros',
    description:
      'Compartilhe momentos, dicas e histórias dos seus cães.',
  },
  {
    icon: '🐱',
    name: 'Mundo dos Gatos',
    members: '8,4 mil membros',
    description:
      'Um espaço para quem é apaixonado por gatos.',
  },
  {
    icon: '🐾',
    name: 'Pets de Brasília',
    members: '4,2 mil membros',
    description:
      'Encontre outros tutores e pets da região.',
  },
];

export default function ComunidadeScreen({
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
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              Comunidades
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.muted },
              ]}
            >
              Encontre pessoas que amam os mesmos pets
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              onNavigate('criarComunidade')
            }
            style={[
              styles.addButton,
              { backgroundColor: colors.gold },
            ]}
          >
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.search,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.searchIcon}>⌕</Text>

          <Text
            style={[
              styles.searchPlaceholder,
              { color: colors.muted },
            ]}
          >
            Buscar comunidades
          </Text>
        </View>

        {communities.map((community) => (
          <TouchableOpacity
            key={community.name}
            onPress={() =>
              onNavigate('comunidadeDetalhes')
            }
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.communityIcon,
                { backgroundColor: `${colors.gold}22` },
              ]}
            >
              <Text style={styles.emoji}>
                {community.icon}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.communityName,
                  { color: colors.text },
                ]}
              >
                {community.name}
              </Text>

              <Text
                style={[
                  styles.members,
                  { color: colors.gold },
                ]}
              >
                {community.members}
              </Text>

              <Text
                style={[
                  styles.description,
                  { color: colors.muted },
                ]}
                numberOfLines={2}
              >
                {community.description}
              </Text>
            </View>

            <Text
              style={[
                styles.arrow,
                { color: colors.muted },
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNavigation
        active="communities"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addText: {
    fontSize: 25,
    color: '#211F1A',
  },

  search: {
    height: 47,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 22,
    marginRight: 8,
    color: '#8E8272',
  },

  searchPlaceholder: {
    fontSize: 13,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  communityIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  emoji: {
    fontSize: 27,
  },

  cardContent: {
    flex: 1,
  },

  communityName: {
    fontSize: 14,
    fontWeight: '800',
  },

  members: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },

  description: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
  },

  arrow: {
    fontSize: 28,
    marginLeft: 8,
  },

  bottomSpace: {
    height: 20,
  },
});