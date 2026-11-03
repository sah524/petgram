import { request } from "../services/http";
import { API_URL } from "../services/api";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from '../components/BottomNavigation';
import { imageUrl } from "../services/media";



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
  "Todos",
  "Cães",
  "Gatos",
  "Aves",
  "Coelhos",
  "Outros",
];

export default function ExplorarScreen({
  isDark,
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

      const resposta = await request(`${API_URL}/posts`);

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

  return (
    <SafeAreaView
      style={[
        styles.container,
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
                  },
                ]}
              >
                <Text
                  style={{
                    color: ativo ? "#FFFFFF" : text,
                    fontWeight: ativo ? "700" : "500",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.tituloLinha}>
          <View>
            <Text
              style={[
                styles.titulo,
                { color: text },
              ]}
            >
              Em alta <Ionicons name="flame" size={22} color={gold} />
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
            <Ionicons name="paw" size={42} color={gold} />

            <Text
              style={[
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
                  <Ionicons name="heart" size={16} color={gold} /> {post.curtidas}
                </Text>

                <Text style={{ color: muted }}>
                  <Ionicons name="chatbubble-outline" size={16} color={gold} /> {post.comentarios}
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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
    fontSize: 12,
    marginTop: 3,
  },

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
