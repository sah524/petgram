import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  onHome,
  onExplore,
  onCreate,
  onCommunities,
  onProfile,
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

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
    marginTop: 3,
  },

  createButton: {
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
  },
});