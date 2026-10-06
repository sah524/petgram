import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "../src/api";

import {
  escolherImagem,
  enviarImagem,
  imageUrl,
} from "../src/media";

// =====================================================
// TIPOS
// =====================================================

type Comunidade = {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  quantidade_membros?: number;
};

type Post = {
  id: number;
  usuario_id: number;
  autor: string;
  texto: string;
  criado_em: string;
  imagem?: string | null;
  quantidade_comentarios?: number;
};

type Comentario = {
  id: number;
  post_id: number;
  usuario_id: number;
  autor: string;
  texto: string;
  criado_em: string;
  foto_perfil?: string | null;
};

type Props = {
  comunidade: Comunidade;
  usuarioId: number;
  isDark: boolean;
  voltar: () => void;
};

// =====================================================
// COMPONENTE
// =====================================================

export default function ComunidadeDetalheScreen({
  comunidade,
  usuarioId,
  isDark,
  voltar,
}: Props) {
  const [membro, setMembro] =
    useState(false);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [textoPost, setTextoPost] =
    useState("");

  const [foto, setFoto] =
    useState<{
      uri: string;
      base64: string;
    } | null>(null);

  const [comentarios, setComentarios] =
    useState<Record<number, Comentario[]>>(
      {}
    );

  const [
    comentariosAbertos,
    setComentariosAbertos,
  ] = useState<Record<number, boolean>>(
    {}
  );

  const [
    textosComentarios,
    setTextosComentarios,
  ] = useState<Record<number, string>>(
    {}
  );

  const [erro, setErro] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [
    comentandoPost,
    setComentandoPost,
  ] = useState<number | null>(null);

  // ===================================================
  // CORES
  // ===================================================

  const colors = {
    bg: isDark
      ? "#211F1A"
      : "#F7F3EA",

    card: isDark
      ? "#302D27"
      : "#FFFDF8",

    text: isDark
      ? "#FFFFFF"
      : "#211F1A",

    muted: isDark
      ? "#C8C2B8"
      : "#777168",

    border: isDark
      ? "#3D3932"
      : "#E7E0D3",

    gold: "#D9A82E",
  };

  // ===================================================
  // CARREGAR COMUNIDADE
  // ===================================================

  const carregar =
    useCallback(async () => {
      try {
        setCarregando(true);
        setErro("");

        const [
          membersRes,
          postsRes,
        ] = await Promise.all([
          fetch(
            `${API_URL}/comunidades/${comunidade.id}/membros`
          ),

          fetch(
            `${API_URL}/comunidades/${comunidade.id}/posts`
          ),
        ]);

        const membersText =
          await membersRes.text();

        const postsText =
          await postsRes.text();

        let members: any = {};
        let feed: any = {};

        try {
          members = membersText
            ? JSON.parse(membersText)
            : {};

          feed = postsText
            ? JSON.parse(postsText)
            : {};
        } catch {
          throw new Error(
            "A API respondeu em um formato inválido."
          );
        }

        if (!membersRes.ok) {
          throw new Error(
            members.message ||
              "Não foi possível carregar os membros."
          );
        }

        if (!postsRes.ok) {
          throw new Error(
            feed.message ||
              "Não foi possível carregar as publicações."
          );
        }

        const listaMembros =
          Array.isArray(members.membros)
            ? members.membros
            : [];

        const participa =
          listaMembros.some(
            (m: {
              usuario_id: number;
            }) =>
              Number(
                m.usuario_id
              ) ===
              Number(usuarioId)
          );

        setMembro(participa);

        setPosts(
          Array.isArray(feed.posts)
            ? feed.posts
            : []
        );
      } catch (e) {
        console.error(
          "Erro ao abrir comunidade:",
          e
        );

        setErro(
          e instanceof Error
            ? e.message
            : "Falha ao abrir a comunidade."
        );
      } finally {
        setCarregando(false);
      }
    }, [
      comunidade.id,
      usuarioId,
    ]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // ===================================================
  // ENTRAR NA COMUNIDADE
  // ===================================================

  async function entrar() {
    if (!usuarioId) {
      setErro(
        "Faça login para entrar na comunidade."
      );

      return;
    }

    try {
      setErro("");

      const response =
        await fetch(
          `${API_URL}/comunidades/${comunidade.id}/entrar`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              usuario_id:
                usuarioId,
            }),
          }
        );

      const texto =
        await response.text();

      let data: any = {};

      try {
        data = texto
          ? JSON.parse(texto)
          : {};
      } catch {
        throw new Error(
          `A API respondeu de forma inválida (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível entrar."
        );
      }

      setMembro(true);

      await carregar();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível entrar."
      );
    }
  }

  // ===================================================
  // ESCOLHER FOTO DO POST
  // ===================================================

  async function escolherFoto() {
    try {
      const picked =
        await escolherImagem();

      if (picked) {
        setFoto(picked);
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Erro ao selecionar foto."
      );
    }
  }

  // ===================================================
  // PUBLICAR
  // ===================================================

  async function publicar() {
    if (!membro) {
      setErro(
        "Entre na comunidade antes de publicar."
      );

      return;
    }

    if (!textoPost.trim()) {
      setErro(
        "Escreva alguma coisa antes de publicar."
      );

      return;
    }

    try {
      setEnviando(true);
      setErro("");

      const imagem = foto
        ? await enviarImagem(
            foto.base64
          )
        : null;

      const response =
        await fetch(
          `${API_URL}/comunidades/${comunidade.id}/posts`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              usuario_id:
                usuarioId,

              texto:
                textoPost.trim(),

              imagem,
            }),
          }
        );

      const textoResposta =
        await response.text();

      let data: any = {};

      try {
        data = textoResposta
          ? JSON.parse(
              textoResposta
            )
          : {};
      } catch {
        throw new Error(
          `A API respondeu de forma inválida (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível publicar."
        );
      }

      setTextoPost("");
      setFoto(null);

      await carregar();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Falha ao publicar."
      );
    } finally {
      setEnviando(false);
    }
  }

  // ===================================================
  // CARREGAR COMENTÁRIOS
  // ===================================================

  async function carregarComentarios(
    postId: number
  ) {
    try {
      setErro("");

      const response =
        await fetch(
          `${API_URL}/comunidades/${comunidade.id}/posts/${postId}/comentarios`
        );

      const texto =
        await response.text();

      let data: any = {};

      try {
        data = texto
          ? JSON.parse(texto)
          : {};
      } catch {
        throw new Error(
          `A API respondeu de forma inválida (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível carregar os comentários."
        );
      }

      setComentarios(
        (anterior) => ({
          ...anterior,

          [postId]:
            Array.isArray(
              data.comentarios
            )
              ? data.comentarios
              : [],
        })
      );
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Erro ao carregar comentários."
      );
    }
  }

  // ===================================================
  // ABRIR / FECHAR COMENTÁRIOS
  // ===================================================

  async function alternarComentarios(
    postId: number
  ) {
    const vaiAbrir =
      !comentariosAbertos[
        postId
      ];

    setComentariosAbertos(
      (anterior) => ({
        ...anterior,
        [postId]: vaiAbrir,
      })
    );

    if (vaiAbrir) {
      await carregarComentarios(
        postId
      );
    }
  }

  // ===================================================
  // PUBLICAR COMENTÁRIO
  // ===================================================

  async function comentar(
    postId: number
  ) {
    if (!membro) {
      setErro(
        "Entre na comunidade para comentar."
      );

      return;
    }

    const texto =
      (
        textosComentarios[
          postId
        ] || ""
      ).trim();

    if (!texto) {
      setErro(
        "Escreva um comentário."
      );

      return;
    }

    try {
      setComentandoPost(
        postId
      );

      setErro("");

      const response =
        await fetch(
          `${API_URL}/comunidades/${comunidade.id}/posts/${postId}/comentarios`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              usuario_id:
                usuarioId,

              texto,
            }),
          }
        );

      const respostaTexto =
        await response.text();

      let data: any = {};

      try {
        data =
          respostaTexto
            ? JSON.parse(
                respostaTexto
              )
            : {};
      } catch {
        throw new Error(
          `A API respondeu de forma inválida (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível comentar."
        );
      }

      // Limpa somente o campo
      // deste post.
      setTextosComentarios(
        (anterior) => ({
          ...anterior,
          [postId]: "",
        })
      );

      await carregarComentarios(
        postId
      );

      // Atualiza a contagem.
      setPosts(
        (anteriores) =>
          anteriores.map(
            (post) =>
              post.id ===
              postId
                ? {
                    ...post,

                    quantidade_comentarios:
                      Number(
                        post.quantidade_comentarios ||
                          0
                      ) + 1,
                  }
                : post
          )
      );
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível comentar."
      );
    } finally {
      setComentandoPost(
        null
      );
    }
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.bg,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* VOLTAR */}

        <TouchableOpacity
          onPress={voltar}
        >
          <Text
            style={[
              styles.voltar,
              {
                color:
                  colors.gold,
              },
            ]}
          >
            ‹ Comunidades
          </Text>
        </TouchableOpacity>

        {/* CAPA */}

        {comunidade.imagem && (
          <Image
            source={{
              uri: imageUrl(
                comunidade.imagem
              ),
            }}
            style={
              styles.capa
            }
          />
        )}

        {/* CABEÇALHO */}

        <Text
          style={[
            styles.titulo,
            {
              color:
                colors.text,
            },
          ]}
        >
          {comunidade.nome}
        </Text>

        <Text
          style={[
            styles.descricao,
            {
              color:
                colors.muted,
            },
          ]}
        >
          {comunidade.descricao ||
            "Comunidade de tutores de pets"}
        </Text>

        <Text
          style={[
            styles.membros,
            {
              color:
                colors.gold,
            },
          ]}
        >
          {comunidade.quantidade_membros ||
            0}{" "}
          membros
        </Text>

        {/* ENTRAR */}

        {!membro &&
          !carregando && (
            <TouchableOpacity
              onPress={entrar}
              style={[
                styles.botao,
                {
                  backgroundColor:
                    colors.gold,
                },
              ]}
            >
              <Text
                style={
                  styles.botaoTexto
                }
              >
                Entrar na comunidade
              </Text>
            </TouchableOpacity>
          )}

        {/* ERRO */}

        {!!erro && (
          <Text
            accessibilityRole="alert"
            style={
              styles.erro
            }
          >
            {erro}
          </Text>
        )}

        {/* CARREGANDO */}

        {carregando && (
          <ActivityIndicator
            color={
              colors.gold
            }
            style={{
              marginVertical: 30,
            }}
          />
        )}

        {/* =========================================
            CRIAR PUBLICAÇÃO
        ========================================= */}

        {!carregando &&
          membro && (
            <View
              style={[
                styles.criarPost,
                {
                  backgroundColor:
                    colors.card,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.subtitulo,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Criar publicação
              </Text>

              <TextInput
                style={[
                  styles.campoPost,
                  {
                    color:
                      colors.text,

                    borderColor:
                      colors.border,

                    backgroundColor:
                      colors.bg,
                  },
                ]}
                placeholder="Compartilhe uma dica ou experiência..."
                placeholderTextColor={
                  colors.muted
                }
                multiline
                value={
                  textoPost
                }
                onChangeText={
                  setTextoPost
                }
                maxLength={
                  4000
                }
              />

              {foto && (
                <>
                  <Image
                    source={{
                      uri:
                        foto.uri,
                    }}
                    style={
                      styles.preview
                    }
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setFoto(
                        null
                      )
                    }
                  >
                    <Text
                      style={
                        styles.removerFoto
                      }
                    >
                      Remover foto
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={
                  escolherFoto
                }
                disabled={
                  enviando
                }
                style={[
                  styles.botaoSecundario,
                  {
                    borderColor:
                      colors.gold,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      colors.gold,
                    fontWeight:
                      "700",
                  }}
                >
                  📷 Adicionar foto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  publicar
                }
                disabled={
                  enviando
                }
                style={[
                  styles.botao,
                  {
                    backgroundColor:
                      colors.gold,
                  },
                ]}
              >
                {enviando ? (
                  <ActivityIndicator
                    color="#211F1A"
                  />
                ) : (
                  <Text
                    style={
                      styles.botaoTexto
                    }
                  >
                    Publicar na comunidade
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        {/* =========================================
            TÍTULO DO FEED
        ========================================= */}

        {!carregando && (
          <Text
            style={[
              styles.feedTitulo,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Publicações
          </Text>
        )}

        {/* SEM POSTS */}

        {!carregando &&
          posts.length ===
            0 && (
            <Text
              style={[
                styles.vazio,
                {
                  color:
                    colors.muted,
                },
              ]}
            >
              Ainda não há publicações nesta comunidade.
            </Text>
          )}

        {/* =========================================
            POSTS
        ========================================= */}

        {posts.map(
          (post) => {
            const listaComentarios =
              comentarios[
                post.id
              ] || [];

            const aberto =
              comentariosAbertos[
                post.id
              ] === true;

            return (
              <View
                key={
                  post.id
                }
                style={[
                  styles.post,
                  {
                    backgroundColor:
                      colors.card,

                    borderColor:
                      colors.border,
                  },
                ]}
              >
                {/* AUTOR */}

                <View
                  style={
                    styles.autorLinha
                  }
                >
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          colors.gold,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.avatarTexto
                      }
                    >
                      {post.autor
                        ?.charAt(
                          0
                        )
                        .toUpperCase() ||
                        "P"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.autor,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {post.autor}
                    </Text>

                    <Text
                      style={{
                        color:
                          colors.muted,
                        fontSize:
                          12,
                      }}
                    >
                      {new Date(
                        post.criado_em
                      ).toLocaleString(
                        "pt-BR"
                      )}
                    </Text>
                  </View>
                </View>

                {/* TEXTO */}

                <Text
                  style={[
                    styles.postTexto,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {post.texto}
                </Text>

                {/* FOTO */}

                {post.imagem && (
                  <Image
                    source={{
                      uri: imageUrl(
                        post.imagem
                      ),
                    }}
                    style={
                      styles.postImagem
                    }
                  />
                )}

                {/* COMENTÁRIOS */}

                <TouchableOpacity
                  onPress={() =>
                    void alternarComentarios(
                      post.id
                    )
                  }
                  style={
                    styles.comentariosBotao
                  }
                >
                  <Text
                    style={{
                      color:
                        colors.gold,
                      fontWeight:
                        "700",
                    }}
                  >
                    💬{" "}
                    {post.quantidade_comentarios ||
                      0}{" "}
                    {Number(
                      post.quantidade_comentarios ||
                        0
                    ) === 1
                      ? "comentário"
                      : "comentários"}
                  </Text>
                </TouchableOpacity>

                {/* =================================
                    ÁREA DOS COMENTÁRIOS
                ================================= */}

                {aberto && (
                  <View
                    style={[
                      styles.areaComentarios,
                      {
                        borderTopColor:
                          colors.border,
                      },
                    ]}
                  >
                    {listaComentarios.length ===
                      0 && (
                      <Text
                        style={{
                          color:
                            colors.muted,
                          marginBottom:
                            12,
                        }}
                      >
                        Ainda não há comentários.
                      </Text>
                    )}

                    {listaComentarios.map(
                      (
                        comentario
                      ) => (
                        <View
                          key={
                            comentario.id
                          }
                          style={[
                            styles.comentario,
                            {
                              backgroundColor:
                                colors.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.comentarioAutor,
                              {
                                color:
                                  colors.gold,
                              },
                            ]}
                          >
                            {
                              comentario.autor
                            }
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.text,
                              marginTop:
                                3,
                            }}
                          >
                            {
                              comentario.texto
                            }
                          </Text>

                          <Text
                            style={{
                              color:
                                colors.muted,
                              fontSize:
                                11,
                              marginTop:
                                5,
                            }}
                          >
                            {new Date(
                              comentario.criado_em
                            ).toLocaleString(
                              "pt-BR"
                            )}
                          </Text>
                        </View>
                      )
                    )}

                    {/* CAMPO PARA COMENTAR */}

                    {membro ? (
                      <>
                        <TextInput
                          style={[
                            styles.campoComentario,
                            {
                              color:
                                colors.text,

                              borderColor:
                                colors.border,

                              backgroundColor:
                                colors.bg,
                            },
                          ]}
                          placeholder="Escreva um comentário..."
                          placeholderTextColor={
                            colors.muted
                          }
                          multiline
                          value={
                            textosComentarios[
                              post.id
                            ] ||
                            ""
                          }
                          onChangeText={(
                            valor
                          ) =>
                            setTextosComentarios(
                              (
                                anterior
                              ) => ({
                                ...anterior,

                                [post.id]:
                                  valor,
                              })
                            )
                          }
                          maxLength={
                            2000
                          }
                        />

                        <TouchableOpacity
                          onPress={() =>
                            void comentar(
                              post.id
                            )
                          }
                          disabled={
                            comentandoPost ===
                            post.id
                          }
                          style={[
                            styles.botaoComentar,
                            {
                              backgroundColor:
                                colors.gold,
                            },
                          ]}
                        >
                          {comentandoPost ===
                          post.id ? (
                            <ActivityIndicator
                              color="#211F1A"
                            />
                          ) : (
                            <Text
                              style={
                                styles.botaoTexto
                              }
                            >
                              Comentar
                            </Text>
                          )}
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text
                        style={{
                          color:
                            colors.muted,
                        }}
                      >
                        Entre na comunidade para comentar.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          }
        )}
      </ScrollView>
    </View>
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

    content: {
      padding: 18,
      paddingBottom: 100,
    },

    voltar: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 15,
    },

    capa: {
      width: "100%",
      height: 180,
      borderRadius: 18,
      marginBottom: 15,
    },

    titulo: {
      fontSize: 27,
      fontWeight: "800",
    },

    descricao: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 5,
    },

    membros: {
      marginTop: 8,
      marginBottom: 18,
      fontWeight: "700",
    },

    erro: {
      color: "#B42318",
      backgroundColor: "#FEECEB",
      padding: 11,
      borderRadius: 10,
      marginBottom: 14,
    },

    criarPost: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 15,
      marginBottom: 22,
    },

    subtitulo: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 12,
    },

    campoPost: {
      minHeight: 105,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      textAlignVertical: "top",
      marginBottom: 12,
    },

    preview: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginBottom: 7,
    },

    removerFoto: {
      color: "#B42318",
      fontWeight: "600",
      marginBottom: 12,
      textAlign: "center",
    },

    botao: {
      minHeight: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 15,
      marginBottom: 12,
    },

    botaoSecundario: {
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },

    botaoTexto: {
      color: "#211F1A",
      fontWeight: "800",
    },

    feedTitulo: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 14,
    },

    vazio: {
      textAlign: "center",
      paddingVertical: 30,
    },

    post: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      marginBottom: 15,
    },

    autorLinha: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },

    avatarTexto: {
      color: "#211F1A",
      fontSize: 17,
      fontWeight: "800",
    },

    autor: {
      fontSize: 15,
      fontWeight: "800",
    },

    postTexto: {
      fontSize: 15,
      lineHeight: 21,
      marginTop: 13,
    },

    postImagem: {
      width: "100%",
      height: 250,
      borderRadius: 12,
      marginTop: 12,
    },

    comentariosBotao: {
      paddingVertical: 13,
      marginTop: 5,
    },

    areaComentarios: {
      borderTopWidth: 1,
      paddingTop: 13,
    },

    comentario: {
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
    },

    comentarioAutor: {
      fontWeight: "800",
      fontSize: 13,
    },

    campoComentario: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 11,
      minHeight: 48,
      maxHeight: 110,
      textAlignVertical: "top",
      marginTop: 5,
      marginBottom: 8,
    },

    botaoComentar: {
      minHeight: 42,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
  });