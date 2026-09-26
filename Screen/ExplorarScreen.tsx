<<<<<<< HEAD
import { API_URL } from "../src/api";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Alert,
=======
import React, { useState } from "react";

import {
  Image,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
<<<<<<< HEAD
} from "react-native";

import BottomNavigation from "./BottomNavigation";
import { imageUrl } from "../src/media";



interface Post {
  id: number;
  pet_id: number;
  imagem: string;
  legenda: string;
  criado_em: string;
  pet: {
    nome: string;
    especie: string;
    raca: string;
  };
  usuario: {
    id: number;
    nome: string;
  };
  curtidas: number;
  comentarios: number;
}

interface Props {
  isDark: boolean;
  onNavigate: (screen: any) => void;
  onToggleTheme?: () => void;
  onHome?: () => void;
  onExplore?: () => void;
  onCommunities?: () => void;
  onProfile?: () => void;
  onCreate?: () => void;
  colors?: any;
}

const CATEGORIAS = [
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  "Todos",
  "Cães",
  "Gatos",
  "Aves",
  "Coelhos",
<<<<<<< HEAD
  "Outros",
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
];

export default function ExplorarScreen({
  isDark,
<<<<<<< HEAD
  onNavigate,
}: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const background = isDark ? "#211F1A" : "#F7F3EA";
  const card = isDark ? "#302D27" : "#FFFDF8";
  const text = isDark ? "#FFFFFF" : "#211F1A";
  const muted = isDark ? "#C8C2B8" : "#777168";
  const border = isDark ? "#3D3932" : "#E7E0D3";
  const gold = "#D9A82E";

  async function carregarPosts() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(`${API_URL}/posts`);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar posts");
      }

      const dados = await resposta.json();

      setPosts(Array.isArray(dados) ? dados : dados.posts || []);
    } catch (erro) {
      console.error("Erro explorar:", erro);
      setErro("Não foi possível carregar os posts. Confira a conexão com a API e o banco.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPosts();
  }, []);

  const postsFiltrados = useMemo(() => {
    return posts.filter((post) => {
      const texto =
        `${post.legenda} ${post.pet.nome} ${post.pet.especie} ${post.pet.raca} ${post.usuario.nome}`
          .toLowerCase();

      const correspondeBusca =
        texto.includes(busca.toLowerCase());

      const correspondeCategoria =
        categoria === "Todos" ||
        (categoria === "Cães" && /c[aã]o|cachorro/i.test(post.pet.especie || "")) ||
        (categoria === "Gatos" && /gato/i.test(post.pet.especie || "")) ||
        (categoria === "Aves" && /ave|p[aá]ssaro/i.test(post.pet.especie || "")) ||
        (categoria === "Coelhos" && /coelho/i.test(post.pet.especie || "")) ||
        (categoria === "Outros" && !/c[aã]o|cachorro|gato|ave|p[aá]ssaro|coelho/i.test(post.pet.especie || ""));

      return correspondeBusca && correspondeCategoria;
    });
  }, [posts, busca, categoria]);
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18

  return (
    <SafeAreaView
      style={[
        styles.container,
<<<<<<< HEAD
        { backgroundColor: background },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: card,
            borderBottomColor: border,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.logo,
              { color: text },
            ]}
          >
            Pet<Text style={{ color: gold }}>Gram</Text>
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { color: muted },
            ]}
          >
            Descubra conteúdos da comunidade
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {!!erro && <Text accessibilityRole="alert" style={{ color: "#B42318", marginBottom: 12 }}>{erro}</Text>}
        <TextInput
          style={[
            styles.busca,
            {
              backgroundColor: card,
              borderColor: border,
              color: text,
            },
          ]}
          placeholder="Pesquisar pets, pessoas..."
          placeholderTextColor={muted}
          value={busca}
          onChangeText={setBusca}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categorias}
        >
          {CATEGORIAS.map((item) => {
            const ativo = categoria === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setCategoria(item)}
                style={[
                  styles.categoria,
                  {
                    backgroundColor: ativo
                      ? gold
                      : card,
                    borderColor: ativo
                      ? gold
                      : border,
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
                  },
                ]}
              >
                <Text
<<<<<<< HEAD
                  style={{
                    color: ativo ? "#FFFFFF" : text,
                    fontWeight: ativo ? "700" : "500",
                  }}
                >
                  {item}
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

<<<<<<< HEAD
        <View style={styles.tituloLinha}>
          <View>
            <Text
              style={[
                styles.titulo,
                { color: text },
              ]}
            >
              Em alta 🔥
            </Text>

            <Text style={{ color: muted }}>
              Conteúdos recentes da Petgram
            </Text>
          </View>

          <Text
            style={{
              color: gold,
              fontWeight: "700",
            }}
          >
            {postsFiltrados.length} posts
          </Text>
        </View>

        {carregando ? (
          <ActivityIndicator
            size="large"
            color={gold}
            style={{ marginTop: 40 }}
          />
        ) : postsFiltrados.length === 0 ? (
          <View
            style={[
              styles.vazio,
              {
                backgroundColor: card,
                borderColor: border,
              },
            ]}
          >
            <Text style={{ fontSize: 40 }}>
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
              🐾
            </Text>

            <Text
              style={[
<<<<<<< HEAD
                styles.vazioTitulo,
                { color: text },
              ]}
            >
              Nenhum post encontrado
            </Text>

            <Text
              style={{ color: muted, textAlign: "center" }}
            >
              Tente outra pesquisa ou categoria.
            </Text>
          </View>
        ) : (
          postsFiltrados.map((post, index) => (
            <View
              key={post.id}
              style={[
                styles.post,
                {
                  backgroundColor: card,
                  borderColor: border,
                },
              ]}
            >
              <View style={styles.postTopo}>
                <View style={styles.numero}>
                  <Text style={styles.numeroTexto}>
                    {index + 1}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.nome,
                      { color: text },
                    ]}
                  >
                    {post.usuario.nome}
                  </Text>

                  <Text style={{ color: muted }}>
                    {post.pet.nome} •{" "}
                    {post.pet.especie}
                  </Text>
                </View>
              </View>

              <Image source={{ uri: imageUrl(post.imagem) }} style={{ width: "100%", height: 230, borderRadius: 12, marginBottom: 10 }} resizeMode="cover" />
              <Text
                style={[
                  styles.legenda,
                  { color: text },
                ]}
              >
                {post.legenda || "Publicação do Petgram"}
              </Text>

              <View style={styles.interacoes}>
                <Text style={{ color: muted }}>
                  ❤️ {post.curtidas}
                </Text>

                <Text style={{ color: muted }}>
                  💬 {post.comentarios}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavigation
        telaAtual="explorar"
        onNavigate={onNavigate}
        isDark={isDark}
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

<<<<<<< HEAD
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },

  logo: {
    fontSize: 27,
    fontWeight: "800",
  },

  subtitulo: {
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
    fontSize: 12,
    marginTop: 3,
  },

<<<<<<< HEAD
  scroll: {
    padding: 16,
    paddingBottom: 25,
  },

  busca: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
  },

  categorias: {
    marginTop: 14,
  },

  categoria: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },

  tituloLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 22,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "800",
  },

  post: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 13,
  },

  postTopo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  numero: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#D9A82E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  numeroTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  nome: {
    fontSize: 15,
    fontWeight: "700",
  },

  legenda: {
    fontSize: 14,
    lineHeight: 21,
  },

  interacoes: {
    flexDirection: "row",
    gap: 20,
    marginTop: 13,
  },

  vazio: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
  },

  vazioTitulo: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
});
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
