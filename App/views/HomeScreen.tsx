import { API_URL } from "../services/api";
import React, { useEffect, useState } from "react";

import {
  StatusBar,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Share,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../components/BottomNavigation";
import ImagemZoom from "../components/ImagemZoom";
import { imageUrl } from "../services/media";

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
  irParaPerfil: (perfilUsuarioId?: number) => void;

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
imagens?: string[];

  legenda: string;
  criado_em: string;

  pet: {
    nome: string;
    especie: string;
    raca: string;

    // FOTO DO PERFIL DO PET
    foto_perfil?: string | null;
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

function CarrosselPost({
  imagens,
  isWeb,
}: {
  imagens: string[];
  isWeb: boolean;
}) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [largura, setLargura] = useState(0);

  const fotos = imagens.filter(Boolean);

  if (fotos.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        width: "100%",
        overflow: "hidden",
      }}
      onLayout={(evento) => {
        setLargura(evento.nativeEvent.layout.width);
      }}
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={fotos.length > 1}
        onMomentumScrollEnd={(evento) => {
          const larguraPagina =
            evento.nativeEvent.layoutMeasurement.width;

          if (larguraPagina > 0) {
            const indice = Math.round(
              evento.nativeEvent.contentOffset.x /
                larguraPagina
            );

            setIndiceAtual(
              Math.max(
                0,
                Math.min(indice, fotos.length - 1)
              )
            );
          }
        }}
      >
        {fotos.map((foto, indice) => (
          <ImagemZoom
            key={`${indice}-${foto}`}
            uri={imageUrl(foto) || foto}
            width={largura || 320}
            height={isWeb ? 420 : 320}
          />
        ))}
      </ScrollView>

      {fotos.length > 1 && (
        <>
          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.65)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {indiceAtual + 1}/{fotos.length}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              paddingVertical: 10,
            }}
          >
            {fotos.map((_, indice) => (
              <View
                key={indice}
                style={{
                  width: indice === indiceAtual ? 9 : 6,
                  height: indice === indiceAtual ? 9 : 6,
                  borderRadius: 10,
                  backgroundColor:
                    indice === indiceAtual
                      ? "#D9A82E"
                      : "#BDBDBD",
                }}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export default function HomeScreen({
  isDark,
  setIsDark,

  irParaHome,
  irParaExplorar,
  irParaCriarPost,
  irParaComunidades,
  irParaPerfil,

  usuarioId,
  token,
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

  const valorBooleano = (
    valor: unknown
  ) =>
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

  // SEGUIR / DEIXAR DE SEGUIR (por usuário, não por publicação)
  const [seguindoUsuarios, setSeguindoUsuarios] = useState<Record<number, boolean>>({});
  const [seguindoProcessando, setSeguindoProcessando] = useState<Record<number, boolean>>({});

  const carregarSeguimentos = async (lista: Post[]) => {
    const ids = [...new Set(lista.map(p => Number(p.usuario?.id)))]
      .filter(id => Number.isSafeInteger(id) && id > 0 && id !== usuarioId);
    const resultados = await Promise.all(ids.map(async id => {
      try {
        const resposta = await fetch(`${API_URL}/perfil/${id}?visualizadorId=${usuarioId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!resposta.ok) return null;
        const dados = await resposta.json();
        return { id, seguindo: dados.seguindoPerfil === true };
      } catch (e) {
        console.log('Erro ao consultar seguimento:', e);
        return null;
      }
    }));
    const estados: Record<number, boolean> = {};
    resultados.forEach(item => { if (item) estados[item.id] = item.seguindo; });
    setSeguindoUsuarios(estados);
  };

  const alternarSeguir = async (seguidoId: number) => {
    if (!usuarioId || !seguidoId || seguidoId === usuarioId || seguindoProcessando[seguidoId]) return;
    setSeguindoProcessando(atual => ({ ...atual, [seguidoId]: true }));
    try {
      const jaSegue = seguindoUsuarios[seguidoId] === true;
      const resposta = await fetch(`${API_URL}/seguidores/${seguidoId}`, {
        method: jaSegue ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ seguidorId: usuarioId }),
      });
      const dados = await resposta.json();
      if (!resposta.ok || dados.success === false) throw new Error(dados.message || 'Erro ao atualizar seguimento.');
      setSeguindoUsuarios(atual => ({ ...atual, [seguidoId]: dados.seguindo === true }));
    } catch (e) {
      Alert.alert('Não foi possível atualizar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSeguindoProcessando(atual => ({ ...atual, [seguidoId]: false }));
    }
  };

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

  const [
    acaoProcessando,
    setAcaoProcessando,
  ] = useState(false);

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

      const dados =
        await resposta.json();

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
            Array.isArray(
              dadosOcultos.ids
            )
          ) {
            ocultos =
              dadosOcultos.ids.map(
                (id: any) =>
                  Number(id)
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
      await carregarSeguimentos(postsVisiveis);

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

  const alternarCurtida = async (
    postId: number
  ) => {
    if (
      !usuarioId ||
      curtidasProcessando[postId]
    ) {
      return;
    }

    const jaCurtiu =
      curtidasLocais[postId] ===
      true;

    setCurtidasProcessando(
      (atual) => ({
        ...atual,
        [postId]: true,
      })
    );

    setAviso("");

    try {
      const resposta =
        await fetch(
          `${API_URL}/posts/${postId}/curtir`,
          {
            method: jaCurtiu
              ? "DELETE"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              usuario_id:
                usuarioId,
            }),
          }
        );

      const textoResposta =
        await resposta.text();

      let dados: any = {};

      try {
        dados = textoResposta
          ? JSON.parse(
              textoResposta
            )
          : {};
      } catch {
        throw new Error(
          `Resposta inválida do servidor (${resposta.status}).`
        );
      }

      const mensagem = String(
        dados?.message || ""
      ).toLowerCase();

      const jaExisteNoBanco =
        !jaCurtiu &&
        (resposta.status === 409 ||
          mensagem.includes(
            "já curti"
          ) ||
          mensagem.includes(
            "ja curti"
          ) ||
          mensagem.includes(
            "já existe"
          ) ||
          mensagem.includes(
            "ja existe"
          ));

      if (jaExisteNoBanco) {
        setCurtidasLocais(
          (atual) => ({
            ...atual,
            [postId]: true,
          })
        );

        setPosts((atual) =>
          atual.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  curtido_por_mim:
                    true,
                }
              : post
          )
        );

        return;
      }

      if (
        !resposta.ok ||
        dados.success === false
      ) {
        throw new Error(
          dados.message ||
            `Erro ${resposta.status} ao atualizar a curtida.`
        );
      }

      const novoEstado =
        dados.curtido_por_mim !==
        undefined
          ? valorBooleano(
              dados.curtido_por_mim
            )
          : !jaCurtiu;

      setCurtidasLocais(
        (atual) => ({
          ...atual,
          [postId]: novoEstado,
        })
      );

      setPosts((atual) =>
        atual.map((post) => {
          if (
            post.id !== postId
          ) {
            return post;
          }

          let quantidade =
            Number(
              post.curtidas
            ) || 0;

          if (
            novoEstado &&
            !jaCurtiu
          ) {
            quantidade += 1;
          }

          if (
            !novoEstado &&
            jaCurtiu
          ) {
            quantidade -= 1;
          }

          return {
            ...post,

            curtidas:
              Math.max(
                0,
                quantidade
              ),

            curtido_por_mim:
              novoEstado,
          };
        })
      );
    } catch (error) {
      console.log(
        "Erro ao atualizar curtida:",
        error
      );

      setAviso(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar a curtida."
      );
    } finally {
      setCurtidasProcessando(
        (atual) => ({
          ...atual,
          [postId]: false,
        })
      );
    }
  };

  // ===================================================
  // ABRIR COMENTÁRIOS
  // ===================================================

  const abrirComentarios =
    async (postId: number) => {
      if (
        comentandoPostId ===
        postId
      ) {
        setComentandoPostId(
          null
        );

        setComentarioTexto("");

        return;
      }

      setComentandoPostId(
        postId
      );

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
    acao:
      | "salvar"
      | "ocultar"
      | "denunciar"
      | "excluir"
  ) => {
    if (
      !postMenu ||
      !usuarioId
    ) {
      return;
    }

    if (
      acao === "denunciar" &&
      !motivoDenuncia.trim()
    ) {
      setAviso(
        "Escreva o motivo da denúncia."
      );

      return;
    }

    try {
      setAcaoProcessando(true);
      setAviso("");

      const postId =
        postMenu.id;

      const rotas = {
        salvar: `${API_URL}/posts/${postId}/salvar`,
        ocultar: `${API_URL}/posts/${postId}/ocultar`,
        denunciar: `${API_URL}/posts/${postId}/denunciar`,
        excluir: `${API_URL}/posts/${postId}`,
      };

      const resposta =
        await fetch(
          rotas[acao],
          {
            method:
              acao === "excluir"
                ? "DELETE"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              usuario_id:
                usuarioId,

              ...(acao ===
              "denunciar"
                ? {
                    motivo:
                      motivoDenuncia.trim(),
                  }
                : {}),
            }),
          }
        );

      const textoResposta =
        await resposta.text();

      let dados: any = {};

      try {
        dados = textoResposta
          ? JSON.parse(
              textoResposta
            )
          : {};
      } catch {
        throw new Error(
          `A rota ${acao} respondeu de forma inválida (${resposta.status}).`
        );
      }

      if (
        !resposta.ok ||
        dados.success === false
      ) {
        throw new Error(
          dados.message ||
            `Não foi possível ${acao} a publicação. Erro ${resposta.status}.`
        );
      }

      if (
        acao === "ocultar" ||
        acao === "excluir"
      ) {
        setPosts((atual) =>
          atual.filter(
            (post) =>
              post.id !==
              postId
          )
        );
      }

      const mensagens = {
        salvar:
          "Publicação salva no perfil.",

        ocultar:
          "Publicação ocultada do seu feed.",

        denunciar:
          "Denúncia registrada.",

        excluir:
          "Publicação excluída.",
      };

      setPostMenu(null);

      setMotivoDenuncia("");

      setConfirmarExclusao(
        false
      );

      setAviso(
        mensagens[acao]
      );
    } catch (error) {
      console.log(
        `Erro na ação ${acao}:`,
        error
      );

      setAviso(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a ação."
      );
    } finally {
      setAcaoProcessando(
        false
      );
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
            `${
              post.legenda ||
              "Publicação no PetGram"
            }` +
            
imageUrl(
  Array.isArray(post.imagens) && post.imagens.length > 0
    ? post.imagens[0]
    : post.imagem
)
,
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
      backgroundColor: isDark
        ? "#302D27"
        : "#E4DCCB",
    },
  ]}
>
  <Image
    source={require("../assets/Logo-Petgram.jpeg")}
    style={styles.logoImagem}
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
                onPress={() => irParaPerfil(Number(post.usuario?.id))}
              >
                {/* =====================================
                    FOTO DO PERFIL DO PET
                    NÃO USA MAIS post.imagem
                ===================================== */}

                <Image
                  source={
                    post.pet
                      .foto_perfil
                      ? {
                          uri: imageUrl(
                            post.pet
                              .foto_perfil
                          ),
                        }
                      : require("../assets/Logo-Petgram.jpeg")
                        
                  }
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

              {Number(post.usuario?.id) > 0 && Number(post.usuario?.id) !== usuarioId && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={seguindoUsuarios[Number(post.usuario.id)] ? 'Deixar de seguir' : 'Seguir'}
                  disabled={seguindoProcessando[Number(post.usuario.id)] === true}
                  onPress={() => void alternarSeguir(Number(post.usuario.id))}
                  style={{ paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18,
                    backgroundColor: seguindoUsuarios[Number(post.usuario.id)] ? 'transparent' : dourado,
                    borderWidth: 1, borderColor: dourado, marginRight: 8,
                    opacity: seguindoProcessando[Number(post.usuario.id)] ? 0.5 : 1 }}
                >
                  <Text style={{ fontWeight: '800', color: seguindoUsuarios[Number(post.usuario.id)] ? dourado : '#211F1A' }}>
                    {seguindoProcessando[Number(post.usuario.id)] ? 'Aguarde...' :
                      seguindoUsuarios[Number(post.usuario.id)] ? 'Seguindo' : 'Seguir'}
                  </Text>
                </TouchableOpacity>
              )}

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

            {/* =========================================
                FOTO DA PUBLICAÇÃO
                CONTINUA SENDO post.imagem
            ========================================= */}

            
<CarrosselPost
  imagens={
    Array.isArray(post.imagens) &&
    post.imagens.length > 0
      ? post.imagens
      : post.imagem
        ? [post.imagem]
        : []
  }
  isWeb={isWeb}
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

      {/* AVISO */}

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

            {/* EXCLUIR */}

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
              }
            >
              <Text
                style={[
                  styles.menuCancelarTexto,

                  {
                    color: dourado,
                  },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MENU INFERIOR */}

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

    scroll: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 20,
    },

    scrollContentWeb: {
      alignItems: "center",
    },

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