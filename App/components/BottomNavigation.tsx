import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Screen =
  | "home"
  | "explorar"
  | "criar"
  | "comunidades"
  | "perfil";

interface Props {
  // Formato usado pelo HomeScreen
  active?: Screen;
  onHome?: () => void;
  onExplore?: () => void;
  onCreate?: () => void;
  onCommunities?: () => void;
  onProfile?: () => void;

  // Formato usado pelas outras telas
  telaAtual?: Screen;
  onNavigate?: (screen: Screen) => void;

  isDark: boolean;
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function BottomNavigation({
  active,
  onHome,
  onExplore,
  onCreate,
  onCommunities,
  onProfile,
  telaAtual,
  onNavigate,
  isDark,
}: Props) {
  // =====================================================
  // CORES PETGRAM
  // =====================================================

  const background = isDark ? "#302D27" : "#FFFDF8";
  const border = isDark ? "#3D3932" : "#E7E0D3";

  const text = isDark ? "#C8C2B8" : "#5C554B";

  // Dourado / laranja da identidade PetGram
  const gold = "#D9A82E";

  // Descobre qual tela está ativa
  const telaAtiva = active ?? telaAtual ?? "home";

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================

  const navegar = (screen: Screen) => {
    // Formato utilizado pelas telas que usam onNavigate
    if (onNavigate) {
      onNavigate(screen);
      return;
    }

    // Formato utilizado pelo HomeScreen
    switch (screen) {
      case "home":
        onHome?.();
        break;

      case "explorar":
        onExplore?.();
        break;

      case "criar":
        onCreate?.();
        break;

      case "comunidades":
        onCommunities?.();
        break;

      case "perfil":
        onProfile?.();
        break;
    }
  };

  // =====================================================
  // ITEM DA NAVEGAÇÃO
  // =====================================================

  const Item = ({
    screen,
    iconOutline,
    iconFilled,
    label,
  }: {
    screen: Screen;
    iconOutline: IconName;
    iconFilled: IconName;
    label: string;
  }) => {
    const ativo = telaAtiva === screen;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navegar(screen)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons
          name={ativo ? iconFilled : iconOutline}
          size={24}
          color={ativo ? gold : text}
        />

        <Text
          style={[
            styles.label,
            {
              color: ativo ? gold : text,
              fontWeight: ativo ? "700" : "500",
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: background,
          borderTopColor: border,
        },
      ]}
    >
      {/* INÍCIO */}
      <Item
        screen="home"
        iconOutline="home-outline"
        iconFilled="home"
        label="Início"
      />

      {/* EXPLORAR */}
      <Item
        screen="explorar"
        iconOutline="search-outline"
        iconFilled="search"
        label="Explorar"
      />

      {/* CRIAR */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navegar("criar")}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Criar"
      >
        <View
          style={[
            styles.createButton,
            {
              backgroundColor: gold,
            },
          ]}
        >
          <Ionicons
            name="add"
            size={27}
            color="#211F1A"
          />
        </View>

        <Text
          style={[
            styles.label,
            {
              color:
                telaAtiva === "criar"
                  ? gold
                  : text,
              fontWeight:
                telaAtiva === "criar"
                  ? "700"
                  : "500",
            },
          ]}
        >
          Criar
        </Text>
      </TouchableOpacity>

      {/* COMUNIDADES */}
      <Item
        screen="comunidades"
        iconOutline="people-outline"
        iconFilled="people"
        label="Comunidade"
      />

      {/* PERFIL */}
      <Item
        screen="perfil"
        iconOutline="person-outline"
        iconFilled="person"
        label="Perfil"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },

  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 10,
    marginTop: 3,
  },

  createButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});