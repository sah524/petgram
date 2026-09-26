import React from "react";
import {
<<<<<<< HEAD
=======
  Image,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

<<<<<<< HEAD
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
=======
type Props = {
  active: string;
  isDark: boolean;

  onHome: () => void;
  onExplore: () => void;
  onCreate: () => void;
  onCommunities: () => void;
  onProfile: () => void;
};

export default function BottomNavigation({
  active,
  isDark,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  onHome,
  onExplore,
  onCreate,
  onCommunities,
  onProfile,
<<<<<<< HEAD
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
=======
}: Props) {
  const muted = isDark ? "#A8A29A" : "#777168";
  const gold = "#D9A82E";

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: isDark ? "#1E1E1E" : "#FFFDF8",
          borderTopColor: isDark ? "#333333" : "#E7E0D3",
        },
      ]}
    >
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.item}
          onPress={onHome}
          hitSlop={10}
        >
          <Text
            style={[
              styles.icon,
              {
                color: active === "home" ? gold : muted,
              },
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.label,
              {
                color: active === "home" ? gold : muted,
              },
            ]}
          >
            Início
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={onExplore}
          hitSlop={10}
        >
          <Text
            style={[
              styles.icon,
              {
                color: active === "explorar" ? gold : muted,
              },
            ]}
          >
            ⌕
          </Text>

          <Text
            style={[
              styles.label,
              {
                color: active === "explorar" ? gold : muted,
              },
            ]}
          >
            Explorar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreate}
          hitSlop={10}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={onCommunities}
          hitSlop={10}
        >
          <Text
            style={[
              styles.communityIcon,
              {
                color:
                  active === "comunidades" ? gold : muted,
              },
            ]}
          >
            👥
          </Text>

          <Text
            style={[
              styles.label,
              {
                color:
                  active === "comunidades" ? gold : muted,
              },
            ]}
          >
            Comunidades
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={onProfile}
          hitSlop={10}
        >
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=47",
            }}
            style={[
              styles.profileImage,
              {
                borderColor:
                  active === "perfil" ? gold : muted,
              },
            ]}
          />

          <Text
            style={[
              styles.label,
              {
                color: active === "perfil" ? gold : muted,
              },
            ]}
          >
            Perfil
          </Text>
        </TouchableOpacity>
      </View>
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 5,
    paddingBottom: 5,
=======
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    zIndex: 100,
    elevation: 100,
  },

  navigation: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  },

  item: {
    flex: 1,
<<<<<<< HEAD
    height: "100%",
=======
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
    alignItems: "center",
    justifyContent: "center",
  },

<<<<<<< HEAD
  label: {
    fontSize: 10,
=======
  icon: {
    fontSize: 25,
    lineHeight: 28,
  },

  communityIcon: {
    fontSize: 21,
    lineHeight: 26,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
    marginTop: 3,
  },

  createButton: {
<<<<<<< HEAD
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
=======
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D9A82E",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },

  plus: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 36,
  },

  profileImage: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 2,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  },
});