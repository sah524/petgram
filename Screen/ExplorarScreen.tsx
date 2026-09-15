import React, { useState } from "react";

import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import BottomNavigation from "./BottomNavigation";

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

const categories = [
  "Todos",
  "Cães",
  "Gatos",
  "Aves",
  "Coelhos",
];

const posts = [
  {
    rank: 1,
    animal: "Cães",
    user: "Thor",
    time: "6h",
    avatar:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
    text:
      "The way he looks at me like I am his whole world 🐾",
    hashtags:
      "#labrador #dogbirthday #petgram",
    likes: "3,4 mil",
    comments: "124",
  },
  {
    rank: 2,
    animal: "Cães",
    user: "Bolinha",
    time: "2h",
    avatar:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150",
    image:
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=700",
    text:
      "Domingo é dia de passeio e muita diversão! 🐶",
    hashtags:
      "#goldenretriever #sundaywalk #pet",
    likes: "1,3 mil",
    comments: "47",
  },
  {
    rank: 3,
    animal: "Gatos",
    user: "Luna",
    time: "8h",
    avatar:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=150",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700",
    text:
      "Um dia tranquilo também merece uma foto. 🐱",
    hashtags:
      "#cat #cats #petgram",
    likes: "987",
    comments: "56",
  },
];

export default function ExplorarScreen({
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
  const { width } = useWindowDimensions();

  const [selected, setSelected] = useState("Todos");
  const [search, setSearch] = useState("");

  const filteredPosts = posts.filter((post) => {
    const categoryMatch =
      selected === "Todos" ||
      post.animal === selected;

    const searchText = search.toLowerCase().trim();

    const searchMatch =
      searchText === "" ||
      post.user.toLowerCase().includes(searchText) ||
      post.text.toLowerCase().includes(searchText) ||
      post.hashtags.toLowerCase().includes(searchText) ||
      post.animal.toLowerCase().includes(searchText);

    return categoryMatch && searchMatch;
  });

  const imageWidth = Math.min(110, width * 0.28);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Explorar
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.muted,
                },
              ]}
            >
              Descubra novos pets e histórias
            </Text>
          </View>

          <TouchableOpacity
            onPress={onToggleTheme}
            activeOpacity={0.8}
            style={[
              styles.themeButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.themeText,
                {
                  color: colors.text,
                },
              ]}
            >
              {isDark ? "☀" : "☾"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* BUSCA */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.searchIcon,
              {
                color: colors.muted,
              },
            ]}
          >
            ⌕
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar pets, pessoas..."
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              {
                color: colors.text,
              },
            ]}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.clearText,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORIAS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => {
            const categorySelected =
              category === selected;

            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelected(category)}
                activeOpacity={0.8}
                style={[
                  styles.category,
                  {
                    backgroundColor: categorySelected
                      ? colors.gold
                      : colors.card,

                    borderColor: categorySelected
                      ? colors.gold
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: categorySelected
                        ? "#211F1A"
                        : colors.text,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* EM ALTA */}
        <View style={styles.trendingHeader}>
          <View>
            <Text
              style={[
                styles.trendingTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              🔥 Em alta
            </Text>

            <Text
              style={[
                styles.trendingSubtitle,
                {
                  color: colors.muted,
                },
              ]}
            >
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1
                ? "publicação"
                : "publicações"}
            </Text>
          </View>
        </View>

        {/* PUBLICAÇÕES */}
        {filteredPosts.map((post) => (
          <TouchableOpacity
            key={post.rank}
            activeOpacity={0.9}
            onPress={() =>
              onNavigate("publicacao")
            }
            style={[
              styles.postCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* RANK */}
            <View style={styles.rank}>
              <Text
                style={[
                  styles.rankText,
                  {
                    color: colors.gold,
                  },
                ]}
              >
                {post.rank}
              </Text>
            </View>

            {/* CONTEÚDO */}
            <View style={styles.postContent}>
              {/* USUÁRIO */}
              <View style={styles.userRow}>
                <Image
                  source={{
                    uri: post.avatar,
                  }}
                  style={styles.avatar}
                />

                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      {
                        color: colors.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {post.user}
                  </Text>

                  <Text
                    style={[
                      styles.time,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {post.time}
                  </Text>
                </View>
              </View>

              {/* TEXTO */}
              <Text
                style={[
                  styles.postText,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={3}
              >
                {post.text}
              </Text>

              {/* HASHTAGS */}
              <Text
                style={[
                  styles.hashtags,
                  {
                    color: colors.gold,
                  },
                ]}
                numberOfLines={1}
              >
                {post.hashtags}
              </Text>

              {/* INTERAÇÕES */}
              <View style={styles.interactions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    onNavigate("curtidas")
                  }
                >
                  <Text
                    style={[
                      styles.interaction,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    ♡ {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    onNavigate("comentarios")
                  }
                >
                  <Text
                    style={[
                      styles.interaction,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    ○ {post.comments}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    onNavigate("compartilhar")
                  }
                >
                  <Text
                    style={[
                      styles.interaction,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    ✈
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* IMAGEM */}
            <Image
              source={{
                uri: post.image,
              }}
              style={[
                styles.postImage,
                {
                  width: imageWidth,
                  height: imageWidth * 1.18,
                },
              ]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}

        {/* NENHUM RESULTADO */}
        {filteredPosts.length === 0 && (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.emptyEmoji}>
              🐾
            </Text>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Nenhuma publicação encontrada
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.muted,
                },
              ]}
            >
              Tente buscar outro termo ou
              selecionar outra categoria.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setSelected("Todos");
              }}
              activeOpacity={0.8}
              style={[
                styles.clearFilters,
                {
                  backgroundColor: colors.gold,
                },
              ]}
            >
              <Text style={styles.clearFiltersText}>
                Limpar filtros
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* NAVEGAÇÃO */}
      <BottomNavigation
        active="explorar"
        isDark={isDark}
        onHome={onHome}
        onExplore={onExplore}
        onCreate={onCreate}
        onCommunities={onCommunities}
        onProfile={onProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  themeText: {
    fontSize: 19,
  },

  searchBox: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 23,
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 10,
  },

  clearButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  clearText: {
    fontSize: 24,
    lineHeight: 25,
  },

  categories: {
    paddingBottom: 20,
    paddingRight: 10,
  },

  category: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },

  trendingHeader: {
    marginBottom: 10,
  },

  trendingTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  trendingSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  postCard: {
    width: "100%",
    minHeight: 145,
    borderWidth: 1,
    borderRadius: 17,
    padding: 11,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  rank: {
    width: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    fontSize: 17,
    fontWeight: "900",
  },

  postContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 9,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  avatar: {
    width: 27,
    height: 27,
    borderRadius: 14,
    marginRight: 7,
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    fontSize: 12,
    fontWeight: "800",
  },

  time: {
    fontSize: 9,
    marginTop: 1,
  },

  postText: {
    fontSize: 11,
    lineHeight: 15,
  },

  hashtags: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 5,
  },

  interactions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  interaction: {
    fontSize: 9,
    marginRight: 11,
  },

  postImage: {
    borderRadius: 12,
    flexShrink: 0,
  },

  empty: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 25,
    paddingVertical: 35,
    marginTop: 5,
  },

  emptyEmoji: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },

  clearFilters: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },

  clearFiltersText: {
    color: "#211F1A",
    fontSize: 12,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 25,
  },
});