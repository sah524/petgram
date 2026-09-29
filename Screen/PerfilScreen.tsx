import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Modal,
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
import { API_URL } from "../src/api";

import {
  escolherImagem,
  enviarImagem,
  imageUrl,
} from "../src/media";

// =====================================================
// TIPOS
// =====================================================

type Usuario = {
  id: number;
  nome: string;
  email: string;
  foto_perfil?: string | null;
  criado_em?: string;
};

type Estatisticas = {
  pets: number;
  seguindo: number;
  seguidores: number;
};

type Pet = {
  id: number;
  usuario_id?: number;
  nome: string;
  especie: string;
  raca?: string | null;
  bio?: string | null;
  idade?: number | null;
  foto_perfil?: string | null;
  instagram_tutor?: string | null;
};

type Post = {
  id: number;
  imagem: string;
  legenda: string;
  pet_id?: number;

  pet?: {
    id: number;
    nome?: string;
  };

  usuario?: {
    id: number;
  };
};

type Props = {
  isDark: boolean;
  onNavigate: (screen: any) => void;
  usuarioId?: number;
  onLogout?: () => void;
  token?: string;
};

// =====================================================
// COMPONENTE
// =====================================================

export default function PerfilScreen({
  isDark,
  onNavigate,
  usuarioId = 0,
  onLogout,
}: Props) {
  const { width } = useWindowDimensions();

  // ===================================================
  // DADOS
  // ===================================================

  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [estatisticas, setEstatisticas] =
    useState<Estatisticas>({
      pets: 0,
      seguindo: 0,
      seguidores: 0,
    });

  const [pet, setPet] =
    useState<Pet | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [salvos, setSalvos] =
    useState<number[]>([]);

  const [aba, setAba] =
    useState<"posts" | "salvos">("posts");

  // ===================================================
  // CONTROLE
  // ===================================================

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [editando, setEditando] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [postAberto, setPostAberto] =
    useState<Post | null>(null);

  // ===================================================
  // EDIÇÃO
  // ===================================================

  const [nome, setNome] =
    useState("");

  const [especie, setEspecie] =
    useState("");

  const [raca, setRaca] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [idade, setIdade] =
    useState("");

  const [instagram, setInstagram] =
    useState("");

  const [foto, setFoto] =
    useState<{
      uri: string;
      base64: string;
    } | null>(null);

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
      ? "#FFFDF8"
      : "#211F1A",

    muted: isDark
      ? "#C8C2B8"
      : "#777168",

    border: isDark
      ? "#584632"
      : "#E7E0D3",

    gold: "#D9A82E",
  };

  const tile = Math.max(
    80,
    Math.floor((width - 44) / 3)
  );

  // ===================================================
  // FUNÇÃO PARA CONVERTER RESPOSTA
  // ===================================================

  function converterJSON(
    texto: string,
    nomeRota: string
  ) {
    if (!texto) {
      return {};
    }

    try {
      return JSON.parse(texto);
    } catch {
      console.error(
        `❌ ${nomeRota} NÃO RETORNOU JSON:`,
        texto
      );

      throw new Error(
        `${nomeRota} respondeu em formato inválido. Veja o console.`
      );
    }
  }

  // ===================================================
  // CARREGAR PERFIL
  // ===================================================

  const carregar =
    useCallback(async () => {
      if (!usuarioId) {
        setErro(
          "Não foi possível identificar o usuário logado."
        );

        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        console.log(
          "=================================="
        );

        console.log(
          "🐾 CARREGANDO PERFIL"
        );

        console.log(
          "Usuário:",
          usuarioId
        );

        console.log(
          "API:",
          API_URL
        );

        console.log(
          "=================================="
        );

        // =============================================
        // REQUISIÇÕES
        // =============================================

        const [
          perfilResponse,
          petsResponse,
          postsResponse,
          salvosResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/perfil/${usuarioId}`
          ),

          fetch(
            `${API_URL}/pets/${usuarioId}`
          ),

          fetch(
            `${API_URL}/posts?usuario_id=${usuarioId}`
          ),

          fetch(
            `${API_URL}/posts/salvos/${usuarioId}`
          ),
        ]);

        // =============================================
        // PEGAR RESPOSTA COMO TEXTO
        // =============================================

        const [
          perfilTexto,
          petsTexto,
          postsTexto,
          salvosTexto,
        ] = await Promise.all([
          perfilResponse.text(),
          petsResponse.text(),
          postsResponse.text(),
          salvosResponse.text(),
        ]);

        // =============================================
        // DEBUG
        // =============================================

        console.log(
          "========== PERFIL DEBUG =========="
        );

        console.log(
          "PERFIL:",
          perfilResponse.status,
          perfilTexto
        );

        console.log(
          "PETS:",
          petsResponse.status,
          petsTexto
        );

        console.log(
          "POSTS:",
          postsResponse.status,
          postsTexto
        );

        console.log(
          "SALVOS:",
          salvosResponse.status,
          salvosTexto
        );

        console.log(
          "=================================="
        );

        // =============================================
        // PERFIL
        // =============================================

        const perfilData =
          converterJSON(
            perfilTexto,
            "PERFIL"
          );

        if (!perfilResponse.ok) {
          throw new Error(
            perfilData.message ||
              `Erro ${perfilResponse.status} ao carregar perfil.`
          );
        }

        // =============================================
        // PETS
        // =============================================

        const petsData =
          converterJSON(
            petsTexto,
            "PETS"
          );

        if (!petsResponse.ok) {
          throw new Error(
            petsData.message ||
              `Erro ${petsResponse.status} ao carregar pet.`
          );
        }

        // =============================================
        // POSTS
        // =============================================

        const postsData =
          converterJSON(
            postsTexto,
            "POSTS"
          );

        if (!postsResponse.ok) {
          throw new Error(
            postsData.message ||
              `Erro ${postsResponse.status} ao carregar publicações.`
          );
        }

        // =============================================
        // SALVOS
        //
        // Se esta rota não existir, NÃO derrubamos
        // o perfil inteiro.
        // =============================================

        let salvosData: any = {};

        if (salvosResponse.ok) {
          try {
            salvosData =
              converterJSON(
                salvosTexto,
                "SALVOS"
              );
          } catch {
            console.log(
              "⚠️ Rota de salvos indisponível."
            );

            salvosData = {};
          }
        } else {
          console.log(
            "⚠️ SALVOS retornou status:",
            salvosResponse.status
          );
        }

        // =============================================
        // USUÁRIO
        // =============================================

        setUsuario(
          perfilData.usuario || null
        );

        // =============================================
        // ESTATÍSTICAS
        // =============================================

        setEstatisticas({
          pets: Number(
            perfilData?.estatisticas?.pets || 0
          ),

          seguindo: Number(
            perfilData?.estatisticas?.seguindo || 0
          ),

          seguidores: Number(
            perfilData?.estatisticas?.seguidores || 0
          ),
        });

        // =============================================
        // PET
        // =============================================

        const listaPets: Pet[] =
          Array.isArray(petsData.pets)
            ? petsData.pets
            : [];

        if (listaPets.length > 0) {
          setPet(listaPets[0]);

          console.log(
            "🐶 PET ENCONTRADO:",
            listaPets[0]
          );
        } else {
          setPet(null);

          console.log(
            "⚠️ Nenhum pet encontrado para o usuário:",
            usuarioId
          );
        }

        // =============================================
        // POSTS
        // =============================================

        const listaPosts =
          Array.isArray(postsData.posts)
            ? postsData.posts
            : [];

        setPosts(listaPosts);

        // =============================================
        // SALVOS
        // =============================================

        if (
          Array.isArray(salvosData.ids)
        ) {
          setSalvos(
            salvosData.ids.map(
              (id: any) => Number(id)
            )
          );
        } else {
          setSalvos([]);
        }

        console.log(
          "✅ PERFIL CARREGADO COM SUCESSO"
        );
      } catch (e) {
        console.error(
          "❌ ERRO AO CARREGAR PERFIL:",
          e
        );

        setErro(
          e instanceof Error
            ? e.message
            : "Erro ao carregar perfil."
        );
      } finally {
        setCarregando(false);
      }
    }, [usuarioId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // ===================================================
  // POSTS DO PET
  // ===================================================

  const meusPosts =
    pet
      ? posts.filter(
          (post) =>
            Number(
              post.pet_id ??
                post.pet?.id
            ) === Number(pet.id)
        )
      : [];

  const tiles =
    aba === "salvos"
      ? posts.filter((post) =>
          salvos.includes(
            Number(post.id)
          )
        )
      : meusPosts;

  // ===================================================
  // EDITAR
  // ===================================================

  function editar() {
    if (!pet) {
      return;
    }

    setNome(pet.nome || "");
    setEspecie(pet.especie || "");
    setRaca(pet.raca || "");
    setBio(pet.bio || "");

    setIdade(
      pet.idade == null
        ? ""
        : String(pet.idade)
    );

    setInstagram(
      pet.instagram_tutor || ""
    );

    setFoto(null);
    setErro("");
    setEditando(true);
  }

  // ===================================================
  // ESCOLHER FOTO
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
          : "Erro ao selecionar imagem."
      );
    }
  }

  // ===================================================
  // SALVAR
  // ===================================================

  async function salvar() {
    if (!pet) {
      return;
    }

    if (
      !nome.trim() ||
      !especie.trim()
    ) {
      setErro(
        "Nome e espécie são obrigatórios."
      );

      return;
    }

    try {
      setSalvando(true);
      setErro("");

      let fotoPerfil =
        pet.foto_perfil || null;

      if (foto) {
        fotoPerfil =
          await enviarImagem(
            foto.base64
          );
      }

      const response =
        await fetch(
          `${API_URL}/pets/${pet.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              nome: nome.trim(),

              especie:
                especie.trim(),

              raca: raca.trim(),

              bio: bio.trim(),

              idade:
                idade.trim()
                  ? Number(idade)
                  : null,

              instagram_tutor:
                instagram
                  .trim()
                  .replace(/^@/, ""),

              foto_perfil:
                fotoPerfil,
            }),
          }
        );

      const texto =
        await response.text();

      console.log(
        "RESPOSTA EDIÇÃO:",
        response.status,
        texto
      );

      let data: any = {};

      try {
        data = texto
          ? JSON.parse(texto)
          : {};
      } catch {
        throw new Error(
          "A API respondeu de forma inválida ao editar o perfil."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Não foi possível salvar o perfil."
        );
      }

      setEditando(false);
      setFoto(null);

      await carregar();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Erro ao salvar perfil."
      );
    } finally {
      setSalvando(false);
    }
  }

  // ===================================================
  // BOTÃO
  // ===================================================

  function Botao({
    texto,
    onPress,
    secundario = false,
    disabled = false,
  }: {
    texto: string;
    onPress: () => void;
    secundario?: boolean;
    disabled?: boolean;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.botao,

          secundario
            ? {
                backgroundColor:
                  "transparent",

                borderWidth: 1,

                borderColor:
                  colors.gold,
              }
            : {
                backgroundColor:
                  colors.gold,
              },

          disabled && {
            opacity: 0.5,
          },
        ]}
      >
        <Text
          style={{
            color: secundario
              ? colors.gold
              : "#211F1A",

            fontWeight: "800",
          }}
        >
          {texto}
        </Text>
      </TouchableOpacity>
    );
  }

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
              colors.bg,
          },
        ]}
      >
        <View
          style={
            styles.carregandoContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={colors.gold}
          />

          <Text
            style={{
              color: colors.muted,
              marginTop: 12,
            }}
          >
            Carregando perfil...
          </Text>
        </View>

        <BottomNavigation
          telaAtual="perfil"
          onNavigate={onNavigate}
          isDark={isDark}
        />
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
            colors.bg,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {/* CAPA */}

        <View
          style={[
            styles.capa,
            {
              backgroundColor:
                isDark
                  ? "#4A321F"
                  : "#7A5234",
            },
          ]}
        >
          <View
            style={styles.marcaCapa1}
          />

          <View
            style={styles.marcaCapa2}
          />

          <View style={styles.topo}>
            <Text style={styles.logo}>
              PetGram
            </Text>

            {onLogout && (
              <TouchableOpacity
                onPress={onLogout}
                style={styles.sair}
              >
                <Text
                  style={
                    styles.sairTexto
                  }
                >
                  Sair
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* PERFIL */}

        <View
          style={styles.perfilArea}
        >
          {/* FOTO */}

          <View
            style={[
              styles.avatarContainer,
              {
                borderColor:
                  colors.bg,

                backgroundColor:
                  colors.card,
              },
            ]}
          >
            {pet?.foto_perfil ? (
              <Image
                source={{
                  uri: imageUrl(
                    pet.foto_perfil
                  ),
                }}
                style={styles.avatar}
              />
            ) : usuario?.foto_perfil ? (
              <Image
                source={{
                  uri: imageUrl(
                    usuario.foto_perfil
                  ),
                }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarVazio,
                  {
                    backgroundColor:
                      colors.gold,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 42,
                  }}
                >
                  🐾
                </Text>
              </View>
            )}
          </View>

          {/* EDITAR */}

          {pet && (
            <View
              style={
                styles.editarContainer
              }
            >
              <TouchableOpacity
                onPress={editar}
                style={[
                  styles.editarBotao,
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
                      "800",
                  }}
                >
                  Editar perfil
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ERRO */}

          {!!erro && (
            <Text
              style={styles.erro}
            >
              {erro}
            </Text>
          )}

          {/* DADOS DO PET */}

          {pet ? (
            <>
              <Text
                style={[
                  styles.nomePet,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {pet.nome}
              </Text>

              <Text
                style={[
                  styles.usuarioPet,
                  {
                    color:
                      colors.gold,
                  },
                ]}
              >
                @
                {pet.nome
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    ""
                  )}
              </Text>

              {usuario && (
                <Text
                  style={[
                    styles.tutor,
                    {
                      color:
                        colors.muted,
                    },
                  ]}
                >
                  Tutor:{" "}
                  {usuario.nome}
                </Text>
              )}

              <Text
                style={[
                  styles.infoPet,
                  {
                    color:
                      colors.muted,
                  },
                ]}
              >
                {pet.especie}

                {pet.raca
                  ? ` · ${pet.raca}`
                  : ""}

                {pet.idade != null
                  ? ` · ${pet.idade} ${
                      Number(
                        pet.idade
                      ) === 1
                        ? "ano"
                        : "anos"
                    }`
                  : ""}
              </Text>

              {pet.bio ? (
                <Text
                  style={[
                    styles.bio,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {pet.bio}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.bioVazia,
                    {
                      color:
                        colors.muted,
                    },
                  ]}
                >
                  Este pet ainda não possui uma bio.
                </Text>
              )}

              {!!pet.instagram_tutor && (
                <Text
                  style={[
                    styles.instagram,
                    {
                      color:
                        colors.gold,
                    },
                  ]}
                >
                  Instagram do tutor: @
                  {pet.instagram_tutor.replace(
                    /^@/,
                    ""
                  )}
                </Text>
              )}
            </>
          ) : (
            <View
              style={[
                styles.semPet,
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
                  styles.semPetTitulo,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Perfil
              </Text>

              {usuario && (
                <>
                  <Text
                    style={{
                      color:
                        colors.text,
                      fontWeight:
                        "700",
                      fontSize: 18,
                    }}
                  >
                    {usuario.nome}
                  </Text>

                  <Text
                    style={{
                      color:
                        colors.muted,
                      marginTop: 4,
                    }}
                  >
                    {usuario.email}
                  </Text>
                </>
              )}

              <Text
                style={{
                  color:
                    colors.muted,
                  marginTop: 12,
                }}
              >
                Não foi encontrado um pet vinculado a esta conta.
              </Text>
            </View>
          )}

          {/* ESTATÍSTICAS */}

          <View
            style={[
              styles.estatisticas,
              {
                borderTopColor:
                  colors.border,

                borderBottomColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.estatistica
              }
            >
              <Text
                style={[
                  styles.numero,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {meusPosts.length}
              </Text>

              <Text
                style={{
                  color:
                    colors.muted,
                  fontSize: 12,
                }}
              >
                Publicações
              </Text>
            </View>

            <View
              style={
                styles.estatistica
              }
            >
              <Text
                style={[
                  styles.numero,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  estatisticas.seguidores
                }
              </Text>

              <Text
                style={{
                  color:
                    colors.muted,
                  fontSize: 12,
                }}
              >
                Seguidores
              </Text>
            </View>

            <View
              style={
                styles.estatistica
              }
            >
              <Text
                style={[
                  styles.numero,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  estatisticas.seguindo
                }
              </Text>

              <Text
                style={{
                  color:
                    colors.muted,
                  fontSize: 12,
                }}
              >
                Seguindo
              </Text>
            </View>
          </View>

          {/* ABAS */}

          <View
            style={[
              styles.abas,
              {
                borderBottomColor:
                  colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                setAba("posts")
              }
              style={[
                styles.aba,

                aba === "posts" && {
                  borderBottomColor:
                    colors.gold,
                  borderBottomWidth: 3,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    aba === "posts"
                      ? colors.gold
                      : colors.muted,
                  fontWeight: "700",
                }}
              >
                ▦ Publicações
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setAba("salvos")
              }
              style={[
                styles.aba,

                aba === "salvos" && {
                  borderBottomColor:
                    colors.gold,
                  borderBottomWidth: 3,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    aba === "salvos"
                      ? colors.gold
                      : colors.muted,
                  fontWeight: "700",
                }}
              >
                ▣ Salvos
              </Text>
            </TouchableOpacity>
          </View>

          {/* VAZIO */}

          {tiles.length === 0 && (
            <View
              style={styles.vazio}
            >
              <Text
                style={{
                  fontSize: 36,
                }}
              >
                🐾
              </Text>

              <Text
                style={{
                  color:
                    colors.text,
                  fontWeight:
                    "800",
                  marginTop: 10,
                }}
              >
                {aba === "posts"
                  ? "Nenhuma publicação ainda"
                  : "Nenhuma publicação salva"}
              </Text>
            </View>
          )}

          {/* POSTS */}

          <View
            style={styles.grade}
          >
            {tiles.map(
              (post) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() =>
                    setPostAberto(
                      post
                    )
                  }
                >
                  <Image
                    source={{
                      uri: imageUrl(
                        post.imagem
                      ),
                    }}
                    style={{
                      width: tile,
                      height: tile,
                      backgroundColor:
                        colors.card,
                    }}
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL EDITAR */}

      <Modal
        visible={editando}
        animationType="slide"
        onRequestClose={() =>
          setEditando(false)
        }
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor:
              colors.bg,
          }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: 22,
              paddingBottom: 60,
            }}
          >
            <Text
              style={[
                styles.modalTitulo,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Editar perfil
            </Text>

            <View
              style={
                styles.fotoEditarContainer
              }
            >
              {foto ? (
                <Image
                  source={{
                    uri: foto.uri,
                  }}
                  style={
                    styles.fotoEditar
                  }
                />
              ) : pet?.foto_perfil ? (
                <Image
                  source={{
                    uri: imageUrl(
                      pet.foto_perfil
                    ),
                  }}
                  style={
                    styles.fotoEditar
                  }
                />
              ) : (
                <View
                  style={[
                    styles.fotoEditar,
                    {
                      backgroundColor:
                        colors.gold,
                      justifyContent:
                        "center",
                      alignItems:
                        "center",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 38,
                    }}
                  >
                    🐾
                  </Text>
                </View>
              )}
            </View>

            <Botao
              texto="Escolher foto do pet"
              onPress={escolherFoto}
              secundario
            />

            <TextInput
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="Nome do pet"
              placeholderTextColor={
                colors.muted
              }
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="Espécie"
              placeholderTextColor={
                colors.muted
              }
              value={especie}
              onChangeText={
                setEspecie
              }
            />

            <TextInput
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="Raça"
              placeholderTextColor={
                colors.muted
              }
              value={raca}
              onChangeText={setRaca}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="Idade em anos"
              placeholderTextColor={
                colors.muted
              }
              keyboardType="numeric"
              value={idade}
              onChangeText={setIdade}
            />

            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                {
                  color:
                    colors.text,
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="Bio do pet"
              placeholderTextColor={
                colors.muted
              }
              multiline
              value={bio}
              onChangeText={setBio}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.border,
                },
              ]}
              placeholder="@ do tutor"
              placeholderTextColor={
                colors.muted
              }
              value={instagram}
              onChangeText={
                setInstagram
              }
            />

            {!!erro && (
              <Text
                style={styles.erro}
              >
                {erro}
              </Text>
            )}

            <Botao
              texto={
                salvando
                  ? "Salvando..."
                  : "Salvar alterações"
              }
              onPress={salvar}
              disabled={salvando}
            />

            <Botao
              texto="Cancelar"
              onPress={() => {
                setEditando(false);
                setFoto(null);
                setErro("");
              }}
              secundario
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL POST */}

      <Modal
        visible={!!postAberto}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setPostAberto(null)
        }
      >
        <View
          style={
            styles.modalPostFundo
          }
        >
          <View
            style={[
              styles.modalPost,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
            {postAberto && (
              <>
                <Image
                  source={{
                    uri: imageUrl(
                      postAberto.imagem
                    ),
                  }}
                  style={
                    styles.postGrande
                  }
                />

                <Text
                  style={{
                    color:
                      colors.text,
                    marginVertical: 14,
                  }}
                >
                  {postAberto.legenda}
                </Text>

                <Botao
                  texto="Fechar"
                  onPress={() =>
                    setPostAberto(
                      null
                    )
                  }
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavigation
        telaAtual="perfil"
        onNavigate={onNavigate}
        isDark={isDark}
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

    carregandoContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
    },

    capa: {
      height: 180,
      overflow: "hidden",
      position: "relative",
    },

    topo: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      zIndex: 3,
    },

    logo: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
    },

    sair: {
      backgroundColor:
        "rgba(0,0,0,0.28)",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },

    sairTexto: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    marcaCapa1: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor:
        "rgba(217,168,46,0.16)",
      right: -30,
      top: -50,
    },

    marcaCapa2: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor:
        "rgba(0,0,0,0.12)",
      left: -20,
      bottom: -40,
    },

    perfilArea: {
      paddingHorizontal: 18,
    },

    avatarContainer: {
      width: 112,
      height: 112,
      borderRadius: 56,
      borderWidth: 5,
      marginTop: -56,
      overflow: "hidden",
    },

    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 56,
    },

    avatarVazio: {
      justifyContent:
        "center",
      alignItems: "center",
    },

    editarContainer: {
      alignItems: "flex-end",
      marginTop: -43,
      marginBottom: 23,
    },

    editarBotao: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 18,
    },

    nomePet: {
      fontSize: 25,
      fontWeight: "900",
      marginTop: 4,
    },

    usuarioPet: {
      fontSize: 14,
      fontWeight: "700",
      marginTop: 2,
    },

    tutor: {
      fontSize: 14,
      marginTop: 8,
    },

    infoPet: {
      fontSize: 13,
      marginTop: 5,
    },

    bio: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 12,
    },

    bioVazia: {
      fontSize: 13,
      fontStyle: "italic",
      marginTop: 12,
    },

    instagram: {
      fontSize: 13,
      marginTop: 10,
      fontWeight: "600",
    },

    semPet: {
      borderWidth: 1,
      borderRadius: 15,
      padding: 18,
      marginTop: 15,
    },

    semPetTitulo: {
      fontSize: 21,
      fontWeight: "800",
      marginBottom: 12,
    },

    estatisticas: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      marginTop: 23,
      paddingVertical: 17,
    },

    estatistica: {
      flex: 1,
      alignItems: "center",
    },

    numero: {
      fontSize: 19,
      fontWeight: "900",
    },

    abas: {
      flexDirection: "row",
      borderBottomWidth: 1,
      marginTop: 15,
    },

    aba: {
      flex: 1,
      minHeight: 48,
      justifyContent:
        "center",
      alignItems: "center",
    },

    grade: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 7,
    },

    vazio: {
      alignItems: "center",
      justifyContent:
        "center",
      paddingVertical: 45,
    },

    erro: {
      color: "#B42318",
      backgroundColor: "#FEECEB",
      padding: 11,
      borderRadius: 10,
      marginVertical: 12,
    },

    botao: {
      minHeight: 48,
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },

    modalTitulo: {
      fontSize: 25,
      fontWeight: "900",
      marginBottom: 20,
    },

    fotoEditarContainer: {
      alignItems: "center",
      marginBottom: 15,
    },

    fotoEditar: {
      width: 105,
      height: 105,
      borderRadius: 53,
    },

    input: {
      borderWidth: 1,
      borderRadius: 12,
      minHeight: 50,
      paddingHorizontal: 13,
      paddingVertical: 11,
      marginBottom: 14,
    },

    bioInput: {
      minHeight: 100,
      textAlignVertical: "top",
    },

    modalPostFundo: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.78)",
      justifyContent:
        "center",
      padding: 18,
    },

    modalPost: {
      borderRadius: 18,
      padding: 14,
    },

    postGrande: {
      width: "100%",
      height: 340,
      borderRadius: 12,
    },
  });