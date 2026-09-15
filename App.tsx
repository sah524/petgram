import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import HomeScreen from "./Screen/HomeScreen";
import ExplorarScreen from "./Screen/ExplorarScreen";
import ComunidadeScreen from "./Screen/ComunidadeScreen";
import PerfilScreen from "./Screen/PerfilScreen";
import CriarPostScreen from "./Screen/CriarPostScreen";
import SecondaryScreen from "./Screen/SecondaryScreen";

export type ScreenName =
  | "home"
  | "explorar"
  | "comunidades"
  | "perfil"
  | "criar"
  | "editarPerfil"
  | "historias"
  | "visualizarHistoria"
  | "criarHistoria"
  | "notificacoes"
  | "mensagens"
  | "conversa"
  | "seguidores"
  | "seguindo"
  | "comentarios"
  | "curtidas"
  | "configuracoes"
  | "privacidade"
  | "conta"
  | "ajuda"
  | "sobre"
  | "comunidadeDetalhes"
  | "criarComunidade"
  | "membrosComunidade"
  | "buscarComunidade"
  | "buscarUsuarios"
  | "buscarPets"
  | "perfilUsuario"
  | "perfilPet"
  | "publicacao"
  | "editarPublicacao"
  | "compartilhar"
  | "salvos"
  | "denunciar"
  | "bloqueados"
  | "favoritos"
  | "login"
  | "cadastro"
  | "recuperarSenha";

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<ScreenName>("home");

  const [isDark, setIsDark] = useState(false);

  const colors = {
    background: isDark ? "#121212" : "#F7F3EA",
    card: isDark ? "#1E1E1E" : "#FFFDF8",
    text: isDark ? "#FFFFFF" : "#211F1A",
    muted: isDark ? "#999999" : "#777168",
    border: isDark ? "#2D2D2D" : "#E7E0D3",
    gold: "#D9A82E",
  };

  const navigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const goHome = () => {
    setCurrentScreen("home");
  };

  const goExplore = () => {
    setCurrentScreen("explorar");
  };

  const goCommunities = () => {
    setCurrentScreen("comunidades");
  };

  const goProfile = () => {
    setCurrentScreen("perfil");
  };

  const goCreate = () => {
    setCurrentScreen("criar");
  };

  const goBack = () => {
    setCurrentScreen("home");
  };

  const commonProps = {
    isDark,
    colors,
    onToggleTheme: () => setIsDark((value) => !value),
    onNavigate: navigate,
    onBack: goBack,
    onHome: goHome,
    onExplore: goExplore,
    onCommunities: goCommunities,
    onProfile: goProfile,
    onCreate: goCreate,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen {...commonProps} />;

      case "explorar":
        return <ExplorarScreen {...commonProps} />;

      case "comunidades":
        return <ComunidadeScreen {...commonProps} />;

      case "perfil":
        return <PerfilScreen {...commonProps} />;

      case "criar":
        return <CriarPostScreen {...commonProps} />;

      default:
        return (
          <SecondaryScreen
            screen={currentScreen}
            {...commonProps}
          />
        );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});