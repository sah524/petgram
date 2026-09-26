<<<<<<< HEAD
import React from "react";
import {
  SafeAreaView,
=======
import React from 'react';

import {
  ScrollView,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
<<<<<<< HEAD
} from "react-native";

interface Props {
  isDark?: boolean;
  onVoltar?: () => void;
  titulo?: string;
}

export default function SecondaryScreen({
  isDark = false,
  onVoltar,
  titulo = "Petgram",
}: Props) {
  const background = isDark
    ? "#211F1A"
    : "#F7F3EA";

  const text = isDark
    ? "#FFFFFF"
    : "#211F1A";

  const gold = "#D9A82E";

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: background },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.titulo,
            { color: text },
          ]}
        >
          {titulo}
        </Text>

        <Text
          style={[
            styles.texto,
            { color: text },
          ]}
        >
          Esta é uma tela secundária do Petgram.
        </Text>

        {onVoltar && (
          <TouchableOpacity
            style={[
              styles.botao,
              { backgroundColor: gold },
            ]}
            onPress={onVoltar}
          >
            <Text style={styles.botaoTexto}>
              VOLTAR
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
=======
} from 'react-native';

type Props = {
  screen: string;

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

const titles: Record<string, string> = {
  editarPerfil: 'Editar perfil',
  historias: 'Histórias',
  visualizarHistoria: 'História',
  criarHistoria: 'Criar história',
  notificacoes: 'Notificações',
  mensagens: 'Mensagens',
  conversa: 'Conversa',
  seguidores: 'Seguidores',
  seguindo: 'Seguindo',
  configuracoes: 'Configurações',
  privacidade: 'Privacidade',
  conta: 'Conta',
  ajuda: 'Ajuda',
  sobre: 'Sobre o Petgram',
  comunidadeDetalhes: 'Comunidade',
  criarComunidade: 'Criar comunidade',
  publicacao: 'Publicação',
};

export default function SecondaryScreen({
  screen,
  onNavigate,
  onHome,
  colors,
}: Props) {
  const title =
    titles[screen] || 'Petgram';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={onHome}>
          <Text
            style={[
              styles.back,
              { color: colors.gold },
            ]}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>

        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
      >
        {renderContent(
          screen,
          colors,
          onNavigate
        )}
      </ScrollView>
    </View>
  );
}

function renderContent(
  screen: string,
  colors: Props['colors'],
  onNavigate: Props['onNavigate']
) {
  switch (screen) {
    case 'editarPerfil':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Editar perfil
          </Text>

          <Text style={[styles.text, { color: colors.muted }]}>
            Atualize suas informações pessoais e a foto do seu perfil.
          </Text>

          <Button
            text="Salvar alterações"
            colors={colors}
          />
        </>
      );

    case 'historias':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Histórias
          </Text>

          <Text style={[styles.text, { color: colors.muted }]}>
            Veja as histórias recentes dos seus amigos e pets.
          </Text>

          <Button
            text="Criar história"
            colors={colors}
            onPress={() =>
              onNavigate('criarHistoria')
            }
          />
        </>
      );

    case 'notificacoes':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Notificações
          </Text>

          <Notification text="Luna curtiu sua publicação." colors={colors} />
          <Notification text="Você tem um novo seguidor." colors={colors} />
          <Notification text="Thor comentou na sua foto." colors={colors} />
        </>
      );

    case 'mensagens':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Mensagens
          </Text>

          <Button
            text="Abrir conversa com Luna"
            colors={colors}
            onPress={() =>
              onNavigate('conversa')
            }
          />

          <Button
            text="Abrir conversa com Thor"
            colors={colors}
            onPress={() =>
              onNavigate('conversa')
            }
          />
        </>
      );

    case 'seguidores':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Seguidores
          </Text>

          <UserItem name="Luna" colors={colors} />
          <UserItem name="Thor" colors={colors} />
          <UserItem name="Mel" colors={colors} />
        </>
      );

    case 'comunidadeDetalhes':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Amantes de Cachorros
          </Text>

          <Text style={[styles.text, { color: colors.muted }]}>
            Comunidade para compartilhar experiências,
            fotos, dicas e histórias sobre cães.
          </Text>

          <Button
            text="Entrar na comunidade"
            colors={colors}
          />
        </>
      );

    case 'criarHistoria':
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Criar história
          </Text>

          <Button
            text="Adicionar foto"
            colors={colors}
          />

          <Button
            text="Publicar história"
            colors={colors}
          />
        </>
      );

    default:
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            {titles[screen] || 'Tela do Petgram'}
          </Text>

          <Text style={[styles.text, { color: colors.muted }]}>
            Esta tela está preparada para receber as funcionalidades
            específicas do Petgram.
          </Text>

          <Button
            text="Voltar para o início"
            colors={colors}
          />
        </>
      );
  }
}

function Button({
  text,
  colors,
  onPress,
}: {
  text: string;
  colors: Props['colors'];
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: colors.gold },
      ]}
    >
      <Text style={styles.buttonText}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function Notification({
  text,
  colors,
}: {
  text: string;
  colors: Props['colors'];
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function UserItem({
  name,
  colors,
}: {
  name: string;
  colors: Props['colors'];
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontWeight: '800',
          },
        ]}
      >
        {name}
      </Text>
    </View>
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

<<<<<<< HEAD
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },

  texto: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
  },

  botao: {
    width: 180,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
=======
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  back: {
    fontSize: 34,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  content: {
    padding: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },

  text: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },

  button: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  buttonText: {
    color: '#211F1A',
    fontSize: 12,
    fontWeight: '800',
  },

  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
});