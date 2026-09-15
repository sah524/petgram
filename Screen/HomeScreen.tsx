import React, { useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STORIES = [
  {
    name: "Thor",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150",
  },
  {
    name: "Luna",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150",
  },
  {
    name: "Bob",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150",
  },
  {
    name: "Mel",
    image:
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=150",
  },
  {
    name: "Max",
    image:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150",
  },
];

const POSTS = [
  {
    id: "1",
    user: "Thor, o Golden",
    location: "Parque Ibirapuera, SP",
    avatar:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    likes: 128,
    caption:
      "Dia de passear no parque com a família! Adoro correr atrás da bolinha 🎾",
  },
  {
    id: "2",
    user: "Luna Miau",
    location: "Rio de Janeiro, RJ",
    avatar:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150",
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800",
    likes: 256,
    caption:
      "Pegando aquele solzinho da tarde na janela ✨",
  },
];

export default function HomeScreen({
  isDark,
  onToggleTheme,
  onNavigate,
}: any) {
  const [liked, setLiked] = useState<
    Record<string, boolean>
  >({});

  const [saved, setSaved] = useState<
    Record<string, boolean>
  >({});

  const colors = isDark ? DARK : LIGHT;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        <View style={styles.header}>
          <Image
            source={require("../assets/Logo-Petgram.jpeg")}
            style={styles.logo}
          />

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={onToggleTheme}
            >
              <Text
                style={[
                  styles.headerIcon,
                  { color: colors.text },
                ]}
              >
                {isDark ? "☀" : "☾"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                onNavigate("notifications")
              }
            >
              <Text
                style={[
                  styles.headerIcon,
                  { color: colors.text },
                ]}
              >
                ♢
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                onNavigate("messages")
              }
            >
              <Text
                style={[
                  styles.headerIcon,
                  { color: colors.text },
                ]}
              >
                ➤
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.storiesBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {STORIES.map((story) => (
              <TouchableOpacity
                key={story.name}
                style={styles.story}
                onPress={() =>
                  onNavigate("stories")
                }
              >
                <View
                  style={[
                    styles.storyRing,
                    { borderColor: colors.gold },
                  ]}
                >
                  <Image
                    source={{ uri: story.image }}
                    style={styles.storyImage}
                  />
                </View>

                <Text
                  style={[
                    styles.storyName,
                    { color: colors.text },
                  ]}
                >
                  {story.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {POSTS.map((post) => {
          const isLiked = liked[post.id];
          const isSaved = saved[post.id];

          return (
            <View
              key={post.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.authorRow}>
                <Image
                  source={{ uri: post.avatar }}
                  style={styles.authorAvatar}
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.author,
                      { color: colors.text },
                    ]}
                  >
                    {post.user}
                  </Text>

                  <Text
                    style={[
                      styles.location,
                      { color: colors.muted },
                    ]}
                  >
                    {post.location}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.more,
                    { color: colors.muted },
                  ]}
                >
                  •••
                </Text>
              </View>

              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
              />

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    setLiked((current) => ({
                      ...current,
                      [post.id]: !current[post.id],
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.action,
                      {
                        color: isLiked
                          ? "#C94B4B"
                          : colors.text,
                      },
                    ]}
                  >
                    {isLiked ? "♥" : "♡"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    onNavigate("comments")
                  }
                >
                  <Text
                    style={[
                      styles.action,
                      { color: colors.text },
                    ]}
                  >
                    ◯
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    onNavigate("share")
                  }
                >
                  <Text
                    style={[
                      styles.action,
                      { color: colors.text },
                    ]}
                  >
                    ➤
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginLeft: "auto" }}
                  onPress={() =>
                    setSaved((current) => ({
                      ...current,
                      [post.id]: !current[post.id],
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.action,
                      { color: colors.text },
                    ]}
                  >
                    {isSaved ? "▣" : "□"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.likes,
                  { color: colors.text },
                ]}
              >
                {post.likes +
                  (isLiked ? 1 : 0)}{" "}
                curtidas
              </Text>

              <Text
                style={[
                  styles.caption,
                  { color: colors.text },
                ]}
              >
                <Text style={{ fontWeight: "800" }}>
                  {post.user}{" "}
                </Text>
                {post.caption}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const LIGHT = {
  bg: "#F7F3EA",
  card: "#FFFDF8",
  text: "#211F1A",
  muted: "#777168",
  border: "#E7E0D3",
  gold: "#D9A82E",
};

const DARK = {
  bg: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  muted: "#A7A7A7",
  border: "#303030",
  gold: "#D9A82E",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 116,
    height: 48,
    resizeMode: "contain",
  },

  headerActions: {
    flexDirection: "row",
    gap: 16,
  },

  headerIcon: {
    fontSize: 25,
  },

  storiesBox: {
    marginHorizontal: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
  },

  story: {
    width: 76,
    alignItems: "center",
  },

  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    padding: 2,
  },

  storyImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },

  storyName: {
    fontSize: 11,
    marginTop: 5,
  },

  card: {
    marginHorizontal: 14,
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
  },

  authorRow: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  author: {
    fontSize: 14,
    fontWeight: "800",
  },

  location: {
    fontSize: 11,
    marginTop: 2,
  },

  more: {
    fontSize: 17,
  },

  postImage: {
    width: "100%",
    height: 300,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingTop: 10,
  },

  action: {
    fontSize: 25,
    marginRight: 15,
  },

  likes: {
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 14,
    paddingTop: 3,
  },

  caption: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
});