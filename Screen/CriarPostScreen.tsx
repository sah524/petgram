import React, { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function CriarPostScreen({
  isDark,
  onHome,
  onExplore,
  onCommunities,
  onProfile,
  onCreate,
  colors,
}: Props) {
  const [caption, setCaption] = useState('');
  const [posted, setPosted] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          Criar publicação
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.muted },
          ]}
        >
          Compartilhe um momento especial do seu pet.
        </Text>

        <TouchableOpacity
          style={[
            styles.photoBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.photoIcon}>＋</Text>

          <Text
            style={[
              styles.photoTitle,
              { color: colors.text },
            ]}
          >
            Adicionar foto
          </Text>

          <Text
            style={[
              styles.photoSubtitle,
              { color: colors.muted },
            ]}
          >
            Toque para escolher uma imagem
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.label,
            { color: colors.text },
          ]}
        >
          Legenda
        </Text>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          multiline
          placeholder="Conte algo sobre esse momento..."
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />

        <TouchableOpacity
          onPress={() => setPosted(true)}
          style={[
            styles.publishButton,
            { backgroundColor: colors.gold },
          ]}
        >
          <Text style={styles.publishText}>
            Publicar
          </Text>
        </TouchableOpacity>

        {posted && (
          <View
            style={[
              styles.success,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.successText,
                { color: colors.text },
              ]}
            >
              Publicação preparada com sucesso! 🐾
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNavigation
        active="create"
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
    padding: 18,
    paddingBottom: 100,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },

  photoBox: {
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  photoIcon: {
    fontSize: 38,
    color: '#C28D20',
  },

  photoTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },

  photoSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },

  input: {
    minHeight: 120,
    borderRadius: 15,
    borderWidth: 1,
    padding: 14,
    fontSize: 13,
    textAlignVertical: 'top',
  },

  publishButton: {
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  publishText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#211F1A',
  },

  success: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    marginTop: 12,
  },

  successText: {
    fontSize: 12,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 20,
  },
});