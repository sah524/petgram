<<<<<<< HEAD
import { API_URL } from "../src/api";
import React, { useEffect, useState } from "react";

import {
  StatusBar,
  Alert,
  Image,
=======
import React, { useState } from "react";

import {
  Image,
  ScrollView,
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
<<<<<<< HEAD
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Share,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "./BottomNavigation";
import { imageUrl } from "../src/media";

// =====================================================
// PROPS
// =====================================================

interface HomeScreenProps {
  isDark: boolean;

  setIsDark: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  irParaHome: () => void;
  irParaExplorar: () => void;
  irParaCriarPost: () => void;
  irParaComunidades: () => void;
  irParaPerfil: () => void;

  usuarioId: number;
  token: string;
}

// =====================================================
// POST
// =====================================================

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

  curtido_por_mim?: boolean;
}

// =====================================================
// COMENTÁRIO
// =====================================================

interface Comentario {
  id: number;
  post_id: number;
  usuario_id: number;

  texto: string;
  criado_em: string;

  nome: string;
}

// =====================================================
// COMPONENTE
// =====================================================

export default function HomeScreen({
  isDark,
  setIsDark,

  irParaHome,
  irParaExplorar,
  irParaCriarPost,
  irParaComunidades,
  irParaPerfil,

  usuarioId,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();

  const isWeb = width >= 768;

  // ===================================================
  // CORES PETGRAM
  // ===================================================

  const fundo = isDark
    ? "#211F1A"
    : "#F7F3EA";

  const fundoCard = isDark
    ? "#302D27"
    : "#FFFDF8";

  const texto = isDark
    ? "#FFFFFF"
    : "#211F1A";

  const textoSecundario = isDark
    ? "#C8C2B8"
    : "#777168";

  const borda = isDark
    ? "#3D3932"
    : "#E7E0D3";

  const dourado = "#D9A82E";

  // Converte corretamente valores vindos do MySQL/API (true, 1, "1", etc.)
  const valorBooleano = (valor: unknown) =>
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    valor === "true";

  // ===================================================
  // POSTS
  // ===================================================

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  // ===================================================
  // MENU DOS TRÊS PONTINHOS
  // ===================================================

  const [postMenu, setPostMenu] =
    useState<Post | null>(null);

  const [
    motivoDenuncia,
    setMotivoDenuncia,
  ] = useState("");

  const [
    confirmarExclusao,
    setConfirmarExclusao,
  ] = useState(false);

  const [aviso, setAviso] =
    useState("");

  const [acaoProcessando, setAcaoProcessando] =
    useState(false);

  // ===================================================
  // CURTIDAS
  // ===================================================

  const [
    curtidasLocais,
    setCurtidasLocais,
  ] = useState<{
    [postId: number]: boolean;
  }>({});

  const [
    curtidasProcessando,
    setCurtidasProcessando,
  ] = useState<{
    [postId: number]: boolean;
  }>({});

  // ===================================================
  // COMENTÁRIOS
  // ===================================================

  const [
    comentandoPostId,
    setComentandoPostId,
  ] = useState<number | null>(null);

  const [
    comentarioTexto,
    setComentarioTexto,
  ] = useState("");

  const [
    comentariosPost,
    setComentariosPost,
  ] = useState<{
    [postId: number]: Comentario[];
  }>({});

  const [
    carregandoComentarios,
    setCarregandoComentarios,
  ] = useState<{
    [postId: number]: boolean;
  }>({});

  const [
    enviandoComentario,
    setEnviandoComentario,
  ] = useState(false);

  // ===================================================
  // CARREGAR POSTS
  // ===================================================

  const carregarPosts = async () => {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(
        `${API_URL}/posts?usuario_id=${usuarioId}`
      );

      console.log(
        "PetGram Home API:",
        resposta.headers.get(
          "X-Petgram-Build"
        ) || "versão antiga"
      );

      const dados = await resposta.json();

      if (
        !resposta.ok ||
        !dados.success
      ) {
        throw new Error(
          dados.message ||
            "Não foi possível carregar os posts."
        );
      }

      let ocultos: number[] = [];

      // Busca publicações ocultas.
      // Se essa rota falhar, o feed continua carregando.
      try {
        const respostaOcultos =
          await fetch(
            `${API_URL}/posts/ocultos/${usuarioId}`
          );

        if (respostaOcultos.ok) {
          const dadosOcultos =
            await respostaOcultos.json();

          if (
            dadosOcultos.success &&
            Array.isArray(dadosOcultos.ids)
          ) {
            ocultos =
              dadosOcultos.ids.map(
                (id: any) => Number(id)
              );
          }
        }
      } catch (error) {
        console.log(
          "Não foi possível carregar posts ocultos:",
          error
        );
      }

      const postsRecebidos: Post[] =
        Array.isArray(dados.posts)
          ? dados.posts
          : [];

      const postsVisiveis =
        postsRecebidos.filter(
          (post) =>
            !ocultos.includes(
              Number(post.id)
            )
        );

      setPosts(postsVisiveis);

      const estadoCurtidas: {
        [postId: number]: boolean;
      } = {};

      postsVisiveis.forEach(
        (post) => {
          estadoCurtidas[post.id] =
            valorBooleano(
              post.curtido_por_mim
            );
        }
      );

      setCurtidasLocais(
        estadoCurtidas
      );
    } catch (error) {
      console.log(
        "Erro ao carregar posts:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os posts."
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPosts();
  }, [usuarioId]);

  // ===================================================
  // CURTIR / DESCURTIR
  // ===================================================

  const alternarCurtida = async (postId: number) => {
    if (!usuarioId || curtidasProcessando[postId]) return;

    const jaCurtiu = curtidasLocais[postId] === true;
    setCurtidasProcessando((atual) => ({ ...atual, [postId]: true }));
    setAviso("");

    try {
      const resposta = await fetch(`${API_URL}/posts/${postId}/curtir`, {
        method: jaCurtiu ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioId }),
      });

      const textoResposta = await resposta.text();
      let dados: any = {};
      try {
        dados = textoResposta ? JSON.parse(textoResposta) : {};
      } catch {
        throw new Error(`Resposta inválida do servidor (${resposta.status}).`);
      }

      // Se o banco já possui a curtida, sincroniza a tela em vez de falhar.
      const mensagem = String(dados?.message || "").toLowerCase();
      const jaExisteNoBanco =
        !jaCurtiu &&
        (resposta.status === 409 ||
          mensagem.includes("já curti") ||
          mensagem.includes("ja curti") ||
          mensagem.includes("já existe") ||
          mensagem.includes("ja existe"));

      if (jaExisteNoBanco) {
        setCurtidasLocais((atual) => ({ ...atual, [postId]: true }));
        setPosts((atual) =>
          atual.map((post) =>
            post.id === postId
              ? { ...post, curtido_por_mim: true }
              : post
          )
        );
        return;
      }

      if (!resposta.ok || dados.success === false) {
        throw new Error(dados.message || `Erro ${resposta.status} ao atualizar a curtida.`);
      }

      const novoEstado =
        dados.curtido_por_mim !== undefined
          ? valorBooleano(dados.curtido_por_mim)
          : !jaCurtiu;

      setCurtidasLocais((atual) => ({ ...atual, [postId]: novoEstado }));

      setPosts((atual) =>
        atual.map((post) => {
          if (post.id !== postId) return post;

          let quantidade = Number(post.curtidas) || 0;
          if (novoEstado && !jaCurtiu) quantidade += 1;
          if (!novoEstado && jaCurtiu) quantidade -= 1;

          return {
            ...post,
            curtidas: Math.max(0, quantidade),
            curtido_por_mim: novoEstado,
          };
        })
      );
    } catch (error) {
      console.log("Erro ao atualizar curtida:", error);
      setAviso(error instanceof Error ? error.message : "Erro ao atualizar a curtida.");
    } finally {
      setCurtidasProcessando((atual) => ({ ...atual, [postId]: false }));
    }
  };

  // ===================================================
  // ABRIR COMENTÁRIOS
  // ===================================================

  const abrirComentarios =
    async (postId: number) => {
      if (
        comentandoPostId === postId
      ) {
        setComentandoPostId(null);
        setComentarioTexto("");

        return;
      }

      setComentandoPostId(postId);
      setComentarioTexto("");

      try {
        setCarregandoComentarios(
          (atual) => ({
            ...atual,
            [postId]: true,
          })
        );

        const resposta =
          await fetch(
            `${API_URL}/posts/${postId}/comentarios`
          );

        const dados =
          await resposta.json();

        if (
          !resposta.ok ||
          !dados.success
        ) {
          throw new Error(
            dados.message ||
              "Não foi possível carregar os comentários."
          );
        }

        setComentariosPost(
          (atual) => ({
            ...atual,

            [postId]:
              dados.comentarios ||
              [],
          })
        );
      } catch (error) {
        console.log(
          "Erro ao carregar comentários:",
          error
        );

        setAviso(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os comentários."
        );
      } finally {
        setCarregandoComentarios(
          (atual) => ({
            ...atual,
            [postId]: false,
          })
        );
      }
    };

  // ===================================================
  // ENVIAR COMENTÁRIO
  // ===================================================

  const enviarComentario =
    async (postId: number) => {
      const comentario =
        comentarioTexto.trim();

      if (!comentario) {
        return;
      }

      if (!usuarioId) {
        Alert.alert(
          "Erro",
          "Usuário não identificado. Faça login novamente."
        );

        return;
      }

      try {
        setEnviandoComentario(
          true
        );

        const resposta =
          await fetch(
            `${API_URL}/posts/${postId}/comentarios`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                usuario_id:
                  usuarioId,

                texto:
                  comentario,
              }),
            }
          );

        const dados =
          await resposta.json();

        if (
          !resposta.ok ||
          !dados.success
        ) {
          throw new Error(
            dados.message ||
              "Não foi possível enviar o comentário."
          );
        }

        setComentarioTexto("");

        // Atualiza contador
        setPosts((atual) =>
          atual.map((post) =>
            post.id === postId
              ? {
                  ...post,

                  comentarios:
                    post.comentarios +
                    1,
                }
              : post
          )
        );

        // Recarrega somente os comentários
        const respostaComentarios =
          await fetch(
            `${API_URL}/posts/${postId}/comentarios`
          );

        const dadosComentarios =
          await respostaComentarios.json();

        if (
          respostaComentarios.ok &&
          dadosComentarios.success
        ) {
          setComentariosPost(
            (atual) => ({
              ...atual,

              [postId]:
                dadosComentarios.comentarios ||
                [],
            })
          );
        }
      } catch (error) {
        console.log(
          "Erro ao enviar comentário:",
          error
        );

        setAviso(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o comentário."
        );
      } finally {
        setEnviandoComentario(
          false
        );
      }
    };

  // ===================================================
  // ABRIR MENU DO POST
  // ===================================================

  const abrirMenuPost = (
    post: Post
  ) => {
    setPostMenu(post);

    setMotivoDenuncia("");

    setConfirmarExclusao(
      false
    );

    setAviso("");
  };

  // ===================================================
  // FECHAR MENU
  // ===================================================

  const fecharMenuPost = () => {
    if (acaoProcessando) {
      return;
    }

    setPostMenu(null);

    setMotivoDenuncia("");

    setConfirmarExclusao(
      false
    );

    setAviso("");
  };

  // ===================================================
  // AÇÕES DO MENU
  // ===================================================

  const acaoPost = async (
    acao: "salvar" | "ocultar" | "denunciar" | "excluir"
  ) => {
    if (!postMenu || !usuarioId) return;

    if (acao === "denunciar" && !motivoDenuncia.trim()) {
      setAviso("Escreva o motivo da denúncia.");
      return;
    }

    try {
      setAcaoProcessando(true);
      setAviso("");

      const postId = postMenu.id;
      const rotas = {
        salvar: `${API_URL}/posts/${postId}/salvar`,
        ocultar: `${API_URL}/posts/${postId}/ocultar`,
        denunciar: `${API_URL}/posts/${postId}/denunciar`,
        excluir: `${API_URL}/posts/${postId}`,
      };

      const resposta = await fetch(rotas[acao], {
        method: acao === "excluir" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioId,
          ...(acao === "denunciar" ? { motivo: motivoDenuncia.trim() } : {}),
        }),
      });

      const textoResposta = await resposta.text();
      let dados: any = {};
      try {
        dados = textoResposta ? JSON.parse(textoResposta) : {};
      } catch {
        throw new Error(`A rota ${acao} respondeu de forma inválida (${resposta.status}).`);
      }

      if (!resposta.ok || dados.success === false) {
        throw new Error(dados.message || `Não foi possível ${acao} a publicação. Erro ${resposta.status}.`);
      }

      if (acao === "ocultar" || acao === "excluir") {
        setPosts((atual) => atual.filter((post) => post.id !== postId));
      }

      const mensagens = {
        salvar: "Publicação salva no perfil.",
        ocultar: "Publicação ocultada do seu feed.",
        denunciar: "Denúncia registrada.",
        excluir: "Publicação excluída.",
      };

      setPostMenu(null);
      setMotivoDenuncia("");
      setConfirmarExclusao(false);
      setAviso(mensagens[acao]);
    } catch (error) {
      console.log(`Erro na ação ${acao}:`, error);
      setAviso(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    } finally {
      setAcaoProcessando(false);
    }
  };

  // ===================================================
  // COMPARTILHAR
  // ===================================================

  const compartilharPost =
    async (post: Post) => {
      try {
        await Share.share({
          message:
            `${post.pet.nome}: ` +
            `${post.legenda || "Publicação no PetGram"}` +
            `\n${imageUrl(post.imagem)}`,
        });
      } catch (error) {
        console.log(
          "Erro ao compartilhar:",
          error
        );
      }
    };

  // ===================================================
  // CARREGANDO
  // ===================================================

  if (carregando) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              fundo,
          },
        ]}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={dourado}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: texto,
              },
            ]}
          >
            Carregando posts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // TELA
  // ===================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            fundo,
        },
      ]}
      edges={[
        "top",
        "bottom",
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={fundo}
      />

      {/* ===============================================
          HEADER
      =============================================== */}

      <View
        style={[
          styles.header,

          {
            backgroundColor:
              fundo,

            borderBottomColor:
              borda,
          },

          isWeb &&
            styles.headerWeb,
        ]}
      >
        <View
          style={
            styles.logoContainer
          }
        >
          <View
            style={[
              styles.logoImagemContainer,

              {
                backgroundColor:
                  isDark
                    ? "#302D27"
                    : "#E4DCCB",
              },
            ]}
          >
            <Image
              source={require(
                "../assets/Logo-Petgram.jpeg"
              )}
              style={
                styles.logoImagem
              }
              resizeMode="cover"
            />
          </View>

          <View
            style={
              styles.logoTextoContainer
            }
          >
            <Text
              style={[
                styles.logoPet,

                {
                  color: texto,
                },
              ]}
            >
              Pet
            </Text>

            <Text
              style={
                styles.logoGram
              }
            >
              Gram
            </Text>
          </View>
        </View>

        <View
          style={
            styles.headerAcoes
          }
        >
          {/* TEMA */}

          <TouchableOpacity
            style={
              styles.botaoHeader
            }
            onPress={() =>
              setIsDark(
                !isDark
              )
            }
          >
            <Ionicons
              name={
                isDark
                  ? "sunny-outline"
                  : "moon-outline"
              }
              size={24}
              color={dourado}
            />
          </TouchableOpacity>

          {/* COMUNIDADES */}

          <TouchableOpacity
            style={
              styles.botaoHeader
            }
            onPress={
              irParaComunidades
            }
          >
            <Ionicons
              name="people-outline"
              size={25}
              color={texto}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===============================================
          FEED
      =============================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,

          isWeb &&
            styles.scrollContentWeb,
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ERRO */}

        {erro ? (
          <View
            style={
              styles.errorContainer
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color="#D94B4B"
            />

            <Text
              style={[
                styles.errorText,

                {
                  color: texto,
                },
              ]}
            >
              {erro}
            </Text>

            <TouchableOpacity
              style={[
                styles.retryButton,

                {
                  backgroundColor:
                    dourado,
                },
              ]}
              onPress={
                carregarPosts
              }
            >
              <Text
                style={
                  styles.retryButtonText
                }
              >
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* SEM POSTS */}

        {!erro &&
          posts.length === 0 && (
            <View
              style={
                styles.vazioContainer
              }
            >
              <Ionicons
                name="paw-outline"
                size={50}
                color={dourado}
              />

              <Text
                style={[
                  styles.vazioTitulo,

                  {
                    color: texto,
                  },
                ]}
              >
                Nenhuma publicação
              </Text>

              <Text
                style={[
                  styles.vazioTexto,

                  {
                    color:
                      textoSecundario,
                  },
                ]}
              >
                As publicações do
                PetGram aparecerão
                aqui.
              </Text>
            </View>
          )}

        {/* POSTS */}

        {posts.map((post) => (
          <View
            key={post.id}
            style={[
              styles.postCard,

              {
                backgroundColor:
                  fundoCard,
              },

              isWeb &&
                styles.postCardWeb,
            ]}
          >
            {/* CABEÇALHO */}

            <View
              style={
                styles.postHeader
              }
            >
              <TouchableOpacity
                style={
                  styles.postUsuario
                }
                onPress={
                  irParaPerfil
                }
              >
                <Image
                  source={{
                    uri: imageUrl(
                      post.imagem
                    ),
                  }}
                  style={
                    styles.postAvatar
                  }
                  resizeMode="cover"
                />

                <View>
                  <Text
                    style={[
                      styles.postNome,

                      {
                        color: texto,
                      },
                    ]}
                  >
                    {post.pet.nome}
                  </Text>

                  <Text
                    style={[
                      styles.postLocal,

                      {
                        color:
                          textoSecundario,
                      },
                    ]}
                  >
                    {post.pet.especie}
                    {" • "}
                    {post.pet.raca}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* TRÊS PONTINHOS */}

              <TouchableOpacity
                accessibilityLabel="Opções da publicação"
                accessibilityRole="button"
                onPress={() =>
                  abrirMenuPost(
                    post
                  )
                }
                style={[
                  styles.botaoOpcoes,

                  {
                    backgroundColor:
                      fundo,
                  },
                ]}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={25}
                  color={dourado}
                />
              </TouchableOpacity>
            </View>

            {/* FOTO */}

            <Image
              source={{
                uri: imageUrl(
                  post.imagem
                ),
              }}
              style={[
                styles.postImagem,

                isWeb &&
                  styles.postImagemWeb,
              ]}
              resizeMode="cover"
            />

            {/* AÇÕES */}

            <View
              style={
                styles.acoesPost
              }
            >
              <View
                style={
                  styles.acoesEsquerda
                }
              >
                {/* CURTIR */}

                <TouchableOpacity
                  style={styles.acao}
                  disabled={
                    curtidasProcessando[
                      post.id
                    ]
                  }
                  onPress={() =>
                    alternarCurtida(
                      post.id
                    )
                  }
                >
                  {curtidasProcessando[
                    post.id
                  ] ? (
                    <ActivityIndicator
                      size="small"
                      color={dourado}
                    />
                  ) : (
                    <Ionicons
                      name={
                        curtidasLocais[
                          post.id
                        ]
                          ? "heart"
                          : "heart-outline"
                      }
                      size={27}
                      color={
                        curtidasLocais[
                          post.id
                        ]
                          ? "#D94B4B"
                          : texto
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.quantidade,

                      {
                        color: texto,
                      },
                    ]}
                  >
                    {post.curtidas}
                  </Text>
                </TouchableOpacity>

                {/* COMENTAR */}

                <TouchableOpacity
                  style={styles.acao}
                  onPress={() =>
                    abrirComentarios(
                      post.id
                    )
                  }
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={25}
                    color={texto}
                  />

                  <Text
                    style={[
                      styles.quantidade,

                      {
                        color: texto,
                      },
                    ]}
                  >
                    {post.comentarios}
                  </Text>
                </TouchableOpacity>

                {/* COMPARTILHAR */}

                <TouchableOpacity
                  style={styles.acao}
                  onPress={() =>
                    compartilharPost(
                      post
                    )
                  }
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={25}
                    color={texto}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* COMENTÁRIOS */}

            {comentandoPostId ===
              post.id && (
              <KeyboardAvoidingView
                behavior={
                  Platform.OS ===
                  "ios"
                    ? "padding"
                    : undefined
                }
              >
                <View
                  style={[
                    styles.comentariosContainer,

                    {
                      borderTopColor:
                        borda,
                    },
                  ]}
                >
                  {carregandoComentarios[
                    post.id
                  ] ? (
                    <ActivityIndicator
                      size="small"
                      color={dourado}
                      style={{
                        marginVertical:
                          10,
                      }}
                    />
                  ) : (
                    <>
                      {(
                        comentariosPost[
                          post.id
                        ] || []
                      ).map(
                        (
                          comentario
                        ) => (
                          <View
                            key={
                              comentario.id
                            }
                            style={
                              styles.comentarioItem
                            }
                          >
                            <Text
                              style={[
                                styles.comentarioUsuario,

                                {
                                  color:
                                    texto,
                                },
                              ]}
                            >
                              {
                                comentario.nome
                              }
                            </Text>

                            <Text
                              style={[
                                styles.comentarioTexto,

                                {
                                  color:
                                    texto,
                                },
                              ]}
                            >
                              {
                                comentario.texto
                              }
                            </Text>
                          </View>
                        )
                      )}

                      {(
                        comentariosPost[
                          post.id
                        ] || []
                      ).length ===
                        0 && (
                        <Text
                          style={[
                            styles.semComentarios,

                            {
                              color:
                                textoSecundario,
                            },
                          ]}
                        >
                          Ainda não há
                          comentários.
                        </Text>
                      )}

                      <View
                        style={
                          styles.comentarioArea
                        }
                      >
                        <TextInput
                          value={
                            comentarioTexto
                          }
                          onChangeText={
                            setComentarioTexto
                          }
                          placeholder="Escreva um comentário..."
                          placeholderTextColor={
                            textoSecundario
                          }
                          style={[
                            styles.inputComentario,

                            {
                              color:
                                texto,

                              backgroundColor:
                                fundo,

                              borderColor:
                                borda,
                            },
                          ]}
                          multiline
                        />

                        <TouchableOpacity
                          style={[
                            styles.botaoEnviar,

                            {
                              opacity:
                                enviandoComentario
                                  ? 0.5
                                  : 1,
                            },
                          ]}
                          disabled={
                            enviandoComentario
                          }
                          onPress={() =>
                            enviarComentario(
                              post.id
                            )
                          }
                        >
                          {enviandoComentario ? (
                            <ActivityIndicator
                              size="small"
                              color="#211F1A"
                            />
                          ) : (
                            <Ionicons
                              name="send"
                              size={20}
                              color="#211F1A"
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </KeyboardAvoidingView>
            )}

            {/* LEGENDA */}

            <View
              style={
                styles.legendaContainer
              }
            >
              <Text
                style={[
                  styles.legenda,

                  {
                    color: texto,
                  },
                ]}
              >
                <Text
                  style={
                    styles.legendaNegrito
                  }
                >
                  {post.pet.nome}
                </Text>

                {post.legenda
                  ? ` ${post.legenda}`
                  : ""}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  abrirComentarios(
                    post.id
                  )
                }
              >
                <Text
                  style={[
                    styles.comentarios,

                    {
                      color:
                        textoSecundario,
                    },
                  ]}
                >
                  {post.comentarios >
                  0
                    ? `Ver todos os ${post.comentarios} comentários`
                    : "Adicionar comentário"}
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.dataPost,

                  {
                    color:
                      textoSecundario,
                  },
                ]}
              >
                {new Date(
                  post.criado_em
                ).toLocaleDateString(
                  "pt-BR"
                )}
              </Text>
            </View>
          </View>
        ))}

        <View
          style={{
            height: 30,
          }}
        />
      </ScrollView>

      {/* ===============================================
          AVISO
      =============================================== */}

      {!!aviso &&
        !postMenu && (
          <View
            style={[
              styles.avisoContainer,

              {
                backgroundColor:
                  fundoCard,

                borderColor:
                  borda,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={dourado}
            />

            <Text
              accessibilityRole="alert"
              style={[
                styles.avisoTexto,

                {
                  color: texto,
                },
              ]}
            >
              {aviso}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setAviso("")
              }
            >
              <Ionicons
                name="close"
                size={21}
                color={
                  textoSecundario
                }
              />
            </TouchableOpacity>
          </View>
        )}

      {/* ===============================================
          MODAL DOS TRÊS PONTINHOS
      =============================================== */}

      <Modal
        visible={!!postMenu}
        transparent
        animationType="fade"
        onRequestClose={
          fecharMenuPost
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View
            style={[
              styles.menuPost,

              {
                backgroundColor:
                  fundoCard,

                borderColor:
                  borda,
              },
            ]}
          >
            {/* TOPO */}

            <View
              style={
                styles.menuCabecalho
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={[
                    styles.menuTitulo,

                    {
                      color: texto,
                    },
                  ]}
                >
                  Opções da publicação
                </Text>

                <Text
                  style={[
                    styles.menuSubtitulo,

                    {
                      color:
                        textoSecundario,
                    },
                  ]}
                >
                  {postMenu?.pet.nome}
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.menuFechar
                }
                onPress={
                  fecharMenuPost
                }
                disabled={
                  acaoProcessando
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={texto}
                />
              </TouchableOpacity>
            </View>

            {/* SALVAR */}

            <TouchableOpacity
              style={[
                styles.menuOpcao,

                {
                  borderTopColor:
                    borda,
                },
              ]}
              disabled={
                acaoProcessando
              }
              onPress={() =>
                acaoPost("salvar")
              }
            >
              <View
                style={[
                  styles.menuIcone,

                  {
                    backgroundColor:
                      fundo,
                  },
                ]}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={22}
                  color={dourado}
                />
              </View>

              <Text
                style={[
                  styles.menuTexto,

                  {
                    color: texto,
                  },
                ]}
              >
                Salvar no perfil
              </Text>
            </TouchableOpacity>

            {/* OCULTAR */}

            <TouchableOpacity
              style={[
                styles.menuOpcao,

                {
                  borderTopColor:
                    borda,
                },
              ]}
              disabled={
                acaoProcessando
              }
              onPress={() =>
                acaoPost("ocultar")
              }
            >
              <View
                style={[
                  styles.menuIcone,

                  {
                    backgroundColor:
                      fundo,
                  },
                ]}
              >
                <Ionicons
                  name="eye-off-outline"
                  size={22}
                  color={dourado}
                />
              </View>

              <Text
                style={[
                  styles.menuTexto,

                  {
                    color: texto,
                  },
                ]}
              >
                Ocultar do meu feed
              </Text>
            </TouchableOpacity>

            {/* DENÚNCIA */}

            <View
              style={[
                styles.denunciaArea,

                {
                  borderTopColor:
                    borda,
                },
              ]}
            >
              <View
                style={
                  styles.denunciaTitulo
                }
              >
                <View
                  style={[
                    styles.menuIcone,

                    {
                      backgroundColor:
                        fundo,
                    },
                  ]}
                >
                  <Ionicons
                    name="flag-outline"
                    size={22}
                    color="#B42318"
                  />
                </View>

                <Text
                  style={[
                    styles.menuTexto,

                    {
                      color: texto,
                    },
                  ]}
                >
                  Denunciar publicação
                </Text>
              </View>

              <TextInput
                style={[
                  styles.inputDenuncia,

                  {
                    color: texto,

                    backgroundColor:
                      fundo,

                    borderColor:
                      borda,
                  },
                ]}
                placeholder="Digite o motivo da denúncia..."
                placeholderTextColor={
                  textoSecundario
                }
                value={
                  motivoDenuncia
                }
                onChangeText={
                  setMotivoDenuncia
                }
                multiline
                maxLength={500}
              />

              <TouchableOpacity
                style={[
                  styles.botaoDenunciar,

                  {
                    opacity:
                      acaoProcessando
                        ? 0.5
                        : 1,
                  },
                ]}
                disabled={
                  acaoProcessando
                }
                onPress={() =>
                  acaoPost(
                    "denunciar"
                  )
                }
              >
                <Ionicons
                  name="flag"
                  size={17}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.botaoDenunciarTexto
                  }
                >
                  Enviar denúncia
                </Text>
              </TouchableOpacity>
            </View>

            {/* EXCLUIR - SÓ DONO */}

            {postMenu?.usuario.id ===
              usuarioId && (
              <>
                {!confirmarExclusao ? (
                  <TouchableOpacity
                    style={[
                      styles.menuOpcao,

                      {
                        borderTopColor:
                          borda,
                      },
                    ]}
                    disabled={
                      acaoProcessando
                    }
                    onPress={() =>
                      setConfirmarExclusao(
                        true
                      )
                    }
                  >
                    <View
                      style={[
                        styles.menuIcone,

                        {
                          backgroundColor:
                            "#FEECEB",
                        },
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#B42318"
                      />
                    </View>

                    <Text
                      style={[
                        styles.menuTexto,

                        {
                          color:
                            "#B42318",
                        },
                      ]}
                    >
                      Excluir minha
                      publicação
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.confirmarArea,

                      {
                        borderTopColor:
                          borda,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.confirmarTitulo,

                        {
                          color: texto,
                        },
                      ]}
                    >
                      Excluir esta
                      publicação?
                    </Text>

                    <Text
                      style={[
                        styles.confirmarTexto,

                        {
                          color:
                            textoSecundario,
                        },
                      ]}
                    >
                      Essa ação não
                      poderá ser
                      desfeita.
                    </Text>

                    <View
                      style={
                        styles.confirmarBotoes
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.botaoConfirmarCancelar,

                          {
                            borderColor:
                              borda,
                          },
                        ]}
                        disabled={
                          acaoProcessando
                        }
                        onPress={() =>
                          setConfirmarExclusao(
                            false
                          )
                        }
                      >
                        <Text
                          style={{
                            color:
                              texto,
                            fontWeight:
                              "600",
                          }}
                        >
                          Não
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          styles.botaoConfirmarExcluir
                        }
                        disabled={
                          acaoProcessando
                        }
                        onPress={() =>
                          acaoPost(
                            "excluir"
                          )
                        }
                      >
                        {acaoProcessando ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="trash"
                              size={17}
                              color="#FFFFFF"
                            />

                            <Text
                              style={
                                styles.botaoConfirmarExcluirTexto
                              }
                            >
                              Excluir
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* ERRO/AVISO DENTRO DO MODAL */}

            {!!aviso && (
              <View
                style={
                  styles.menuAviso
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#B42318"
                />

                <Text
                  style={
                    styles.menuAvisoTexto
                  }
                >
                  {aviso}
                </Text>
              </View>
            )}

            {/* PROCESSANDO */}

            {acaoProcessando &&
              !confirmarExclusao && (
                <View
                  style={
                    styles.processando
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color={dourado}
                  />

                  <Text
                    style={[
                      styles.processandoTexto,

                      {
                        color:
                          textoSecundario,
                      },
                    ]}
                  >
                    Aguarde...
                  </Text>
                </View>
              )}

            {/* CANCELAR */}

            <TouchableOpacity
              style={[
                styles.menuCancelar,

                {
                  borderTopColor:
                    borda,
                },
              ]}
              onPress={
                fecharMenuPost
              }
              disabled={
                acaoProcessando
=======
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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
              }
            >
              <Text
                style={[
<<<<<<< HEAD
                  styles.menuCancelarTexto,

                  {
                    color: dourado,
                  },
                ]}
              >
                Cancelar
=======
                  styles.headerIcon,
                  { color: colors.text },
                ]}
              >
                ➤
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
              </Text>
            </TouchableOpacity>
          </View>
        </View>
<<<<<<< HEAD
      </Modal>

      {/* ===============================================
          MENU INFERIOR
      =============================================== */}

      <BottomNavigation
        active="home"
        isDark={isDark}
        onHome={irParaHome}
        onExplore={
          irParaExplorar
        }
        onCreate={
          irParaCriarPost
        }
        onCommunities={
          irParaComunidades
        }
        onProfile={
          irParaPerfil
        }
      />
    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    // HEADER

    header: {
      height: 72,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      paddingHorizontal: 18,

      borderBottomWidth: 1,
    },

    headerWeb: {
      paddingHorizontal: 30,
    },

    logoContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    logoImagemContainer: {
      width: 44,

      height: 44,

      borderRadius: 22,

      overflow: "hidden",

      marginRight: 9,

      padding: 3,
    },

    logoImagem: {
      width: "100%",

      height: "100%",

      borderRadius: 20,
    },

    logoTextoContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    logoPet: {
      fontSize: 22,

      fontWeight: "800",
    },

    logoGram: {
      fontSize: 22,

      fontWeight: "800",

      color: "#D9A82E",
    },

    headerAcoes: {
      flexDirection: "row",

      alignItems: "center",

      gap: 15,
    },

    botaoHeader: {
      padding: 4,
    },

    // SCROLL

    scroll: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    scrollContentWeb: {
      alignItems: "center",
    },

    // POST

    postCard: {
      width: "100%",

      marginBottom: 15,

      paddingBottom: 12,
    },

    postCardWeb: {
      maxWidth: 700,
    },

    postHeader: {
      height: 62,

      paddingHorizontal: 15,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    postUsuario: {
      flexDirection: "row",

      alignItems: "center",

      flex: 1,
    },

    postAvatar: {
      width: 42,

      height: 42,

      borderRadius: 21,

      marginRight: 10,
    },

    postNome: {
      fontSize: 15,

      fontWeight: "700",
    },

    postLocal: {
      fontSize: 12,

      marginTop: 2,
    },

    botaoOpcoes: {
      width: 42,

      height: 42,

      borderRadius: 21,

      alignItems: "center",

      justifyContent:
        "center",
    },

    postImagem: {
      width: "100%",

      height: 320,

      backgroundColor:
        "#EEEEEE",
    },

    postImagemWeb: {
      height: 420,
    },

    // AÇÕES

    acoesPost: {
      paddingHorizontal: 15,

      paddingTop: 12,

      flexDirection: "row",

      justifyContent:
        "space-between",
    },

    acoesEsquerda: {
      flexDirection: "row",

      alignItems: "center",
    },

    acao: {
      minWidth: 42,

      minHeight: 38,

      flexDirection: "row",

      alignItems: "center",

      marginRight: 15,
    },

    quantidade: {
      fontSize: 13,

      marginLeft: 5,

      fontWeight: "600",
    },

    // COMENTÁRIOS

    comentariosContainer: {
      marginTop: 10,

      paddingHorizontal: 15,

      paddingTop: 8,

      borderTopWidth: 1,
    },

    comentarioItem: {
      paddingVertical: 5,
    },

    comentarioUsuario: {
      fontSize: 13,

      fontWeight: "700",

      marginBottom: 2,
    },

    comentarioTexto: {
      fontSize: 13,

      lineHeight: 18,
    },

    semComentarios: {
      fontSize: 13,

      paddingVertical: 8,
    },

    comentarioArea: {
      flexDirection: "row",

      alignItems: "flex-end",

      paddingTop: 10,

      gap: 8,
    },

    inputComentario: {
      flex: 1,

      minHeight: 42,

      maxHeight: 90,

      borderWidth: 1,

      borderRadius: 20,

      paddingHorizontal: 15,

      paddingVertical: 10,

      fontSize: 14,
    },

    botaoEnviar: {
      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor:
        "#D9A82E",

      justifyContent:
        "center",

      alignItems: "center",
    },

    // LEGENDA

    legendaContainer: {
      paddingHorizontal: 15,

      paddingTop: 10,
    },

    legenda: {
      fontSize: 14,

      lineHeight: 20,
    },

    legendaNegrito: {
      fontWeight: "700",
    },

    comentarios: {
      fontSize: 13,

      marginTop: 7,
    },

    dataPost: {
      fontSize: 11,

      marginTop: 7,
    },

    // LOADING

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      gap: 12,
    },

    loadingText: {
      fontSize: 15,
    },

    // ERRO

    errorContainer: {
      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal: 30,

      paddingVertical: 40,
    },

    errorText: {
      fontSize: 15,

      textAlign: "center",

      marginTop: 10,

      marginBottom: 20,
    },

    retryButton: {
      paddingHorizontal: 20,

      paddingVertical: 11,

      borderRadius: 8,
    },

    retryButtonText: {
      color: "#FFFFFF",

      fontWeight: "700",
    },

    // VAZIO

    vazioContainer: {
      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal: 30,

      paddingVertical: 70,
    },

    vazioTitulo: {
      fontSize: 18,

      fontWeight: "700",

      marginTop: 12,
    },

    vazioTexto: {
      fontSize: 14,

      marginTop: 5,

      textAlign: "center",
    },

    // AVISO

    avisoContainer: {
      marginHorizontal: 12,

      marginVertical: 7,

      paddingHorizontal: 12,

      paddingVertical: 10,

      borderWidth: 1,

      borderRadius: 12,

      flexDirection: "row",

      alignItems: "center",

      gap: 8,
    },

    avisoTexto: {
      flex: 1,

      fontSize: 13,
    },

    // MODAL

    modalFundo: {
      flex: 1,

      backgroundColor:
        "rgba(0, 0, 0, 0.55)",

      justifyContent:
        "center",

      alignItems: "center",

      paddingHorizontal: 22,
    },

    menuPost: {
      width: "100%",

      maxWidth: 400,

      maxHeight: "90%",

      borderRadius: 22,

      borderWidth: 1,

      paddingHorizontal: 18,

      paddingTop: 20,

      paddingBottom: 8,
    },

    menuCabecalho: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      paddingBottom: 13,
    },

    menuTitulo: {
      fontSize: 19,

      fontWeight: "800",
    },

    menuSubtitulo: {
      fontSize: 13,

      marginTop: 3,
    },

    menuFechar: {
      width: 38,

      height: 38,

      borderRadius: 19,

      alignItems: "center",

      justifyContent:
        "center",
    },

    menuOpcao: {
      minHeight: 62,

      flexDirection: "row",

      alignItems: "center",

      borderTopWidth: 1,
    },

    menuIcone: {
      width: 40,

      height: 40,

      borderRadius: 20,

      alignItems: "center",

      justifyContent:
        "center",
    },

    menuTexto: {
      flex: 1,

      fontSize: 15,

      fontWeight: "600",

      marginLeft: 12,
    },

    // DENÚNCIA

    denunciaArea: {
      borderTopWidth: 1,

      paddingVertical: 13,
    },

    denunciaTitulo: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 10,
    },

    inputDenuncia: {
      minHeight: 70,

      maxHeight: 110,

      borderWidth: 1,

      borderRadius: 12,

      paddingHorizontal: 12,

      paddingVertical: 10,

      textAlignVertical:
        "top",

      fontSize: 14,
    },

    botaoDenunciar: {
      height: 42,

      borderRadius: 10,

      backgroundColor:
        "#B42318",

      marginTop: 9,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 7,
    },

    botaoDenunciarTexto: {
      color: "#FFFFFF",

      fontWeight: "700",

      fontSize: 13,
    },

    // CONFIRMAR EXCLUSÃO

    confirmarArea: {
      borderTopWidth: 1,

      paddingVertical: 14,
    },

    confirmarTitulo: {
      fontSize: 15,

      fontWeight: "700",
    },

    confirmarTexto: {
      fontSize: 13,

      marginTop: 4,

      marginBottom: 12,
    },

    confirmarBotoes: {
      flexDirection: "row",

      gap: 8,
    },

    botaoConfirmarCancelar: {
      flex: 1,

      height: 42,

      borderRadius: 10,

      borderWidth: 1,

      alignItems: "center",

      justifyContent:
        "center",
    },

    botaoConfirmarExcluir: {
      flex: 1,

      height: 42,

      borderRadius: 10,

      backgroundColor:
        "#B42318",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap: 6,
    },

    botaoConfirmarExcluirTexto: {
      color: "#FFFFFF",

      fontWeight: "700",
    },

    // AVISO MODAL

    menuAviso: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      gap: 7,

      backgroundColor:
        "#FEECEB",

      padding: 10,

      borderRadius: 9,

      marginVertical: 5,
    },

    menuAvisoTexto: {
      flex: 1,

      color: "#B42318",

      fontSize: 12,

      lineHeight: 17,
    },

    processando: {
      flexDirection: "row",

      justifyContent:
        "center",

      alignItems: "center",

      gap: 8,

      paddingVertical: 10,
    },

    processandoTexto: {
      fontSize: 13,
    },

    // CANCELAR

    menuCancelar: {
      minHeight: 52,

      borderTopWidth: 1,

      alignItems: "center",

      justifyContent:
        "center",

      marginTop: 5,
    },

    menuCancelarTexto: {
      fontSize: 15,

      fontWeight: "700",
    },
  });
=======

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
>>>>>>> 1e92a31c74eb58baadca5f03e1dffc6faef9ba18
