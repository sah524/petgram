import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "../../Api/src/api";
import BottomNavigation from '../components/BottomNavigation';
import {
  escolherImagem,
  enviarImagem,
} from "../../Api/src/media";

// =====================================================
// TIPOS
// =====================================================

interface Props {
  isDark: boolean;
  onNavigate: (screen: any) => void;
  usuarioId?: number;
  token?: string;
  colors?: any;
  onToggleTheme?: () => void;
  onHome?: () => void;
  onExplore?: () => void;
  onCommunities?: () => void;
  onProfile?: () => void;
  onCreate?: () => void;
}

type Pet = {
  id: number;
  usuario_id: number;
  nome: string;
  especie?: string | null;
  raca?: string | null;
  foto_perfil?: string | null;
};

// =====================================================
// COMPONENTE
// =====================================================

export default function CriarPostScreen({
  isDark,
  onNavigate,
  usuarioId = 0,
}: Props) {
  // ===================================================
  // PET DO USUÁRIO LOGADO
  // ===================================================

  const [pet, setPet] = useState<Pet | null>(null);

  const [carregandoPet, setCarregandoPet] =
    useState(true);

  const [erroPet, setErroPet] =
    useState("");

  // ===================================================
  // PUBLICAÇÃO
  // ===================================================

  const [imagem, setImagem] =
    useState("");

  const [fotoBase64, setFotoBase64] =
    useState("");

  const [local, setLocal] =
    useState("");

  const [hashtags, setHashtags] =
    useState("");

  const [legenda, setLegenda] =
    useState("");

  const [carregando, setCarregando] =
    useState(false);

  // ===================================================
  // CORES
  // ===================================================

  const background = isDark
    ? "#211F1A"
    : "#F7F3EA";

  const card = isDark
    ? "#302D27"
    : "#FFFDF8";

  const text = isDark
    ? "#FFFFFF"
    : "#211F1A";

  const muted = isDark
    ? "#C8C2B8"
    : "#777168";

  const border = isDark
    ? "#3D3932"
    : "#E7E0D3";

  const gold = "#D9A82E";

  // ===================================================
  // CARREGAR PET DO USUÁRIO LOGADO
  // ===================================================

  useEffect(() => {
    async function carregarPet() {
      setErroPet("");
      setPet(null);

      if (!usuarioId) {
        setErroPet(
          "Não foi possível identificar o usuário logado."
        );

        setCarregandoPet(false);
        return;
      }

      try {
        setCarregandoPet(true);

        console.log(
          "Carregando pet do usuário:",
          usuarioId
        );

        console.log(
          "URL:",
          `${API_URL}/pets/${usuarioId}`
        );

        const resposta = await fetch(
          `${API_URL}/pets/${usuarioId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        // Lê primeiro como texto para evitar:
        // JSON Parse error: Unexpected character: <

        const texto =
          await resposta.text();

        let dados: any = null;

        try {
          dados = texto
            ? JSON.parse(texto)
            : {};
        } catch {
          console.error(
            "Resposta inválida ao carregar pet:",
            texto
          );

          throw new Error(
            `A rota de pets respondeu de forma inválida (${resposta.status}).`
          );
        }

        if (!resposta.ok) {
          throw new Error(
            dados?.message ||
              "Não foi possível carregar o pet."
          );
        }

        const listaPets: Pet[] =
          Array.isArray(dados?.pets)
            ? dados.pets
            : [];

        console.log(
          "Pets encontrados:",
          listaPets
        );

        if (listaPets.length === 0) {
          setErroPet(
            "Nenhum pet foi encontrado para esta conta."
          );

          return;
        }

        // ===============================================
        // PET AUTOMÁTICO
        // ===============================================
        //
        // Não existe mais escolha manual.
        //
        // A rota /pets/:usuarioId retorna os pets
        // ordenados por criado_em DESC.
        //
        // Pegamos automaticamente o primeiro.
        // ===============================================

        const petDaConta =
          listaPets[0];

        setPet(petDaConta);

        console.log(
          "Pet selecionado automaticamente:",
          petDaConta.id,
          petDaConta.nome
        );
      } catch (erro) {
        console.error(
          "Erro ao carregar pet:",
          erro
        );

        setErroPet(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar o pet desta conta."
        );
      } finally {
        setCarregandoPet(false);
      }
    }

    carregarPet();
  }, [usuarioId]);

  // ===================================================
  // ESCOLHER FOTO
  // ===================================================

  async function selecionarFoto(
    camera: boolean
  ) {
    try {
      const foto =
        await escolherImagem(camera);

      if (foto) {
        setImagem(foto.uri);
        setFotoBase64(
          foto.base64
        );
      }
    } catch (erro) {
      Alert.alert(
        "Foto",
        erro instanceof Error
          ? erro.message
          : "Não foi possível escolher a foto."
      );
    }
  }

  // ===================================================
  // PUBLICAR
  // ===================================================

  async function publicar() {
    // ===============================================
    // USUÁRIO
    // ===============================================

    if (!usuarioId) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o usuário logado."
      );

      return;
    }

    // ===============================================
    // PET
    // ===============================================

    if (!pet?.id) {
      Alert.alert(
        "Pet não encontrado",
        "Não foi possível encontrar o pet vinculado à sua conta."
      );

      return;
    }

    // ===============================================
    // LEGENDA
    // ===============================================

    if (!legenda.trim()) {
      Alert.alert(
        "Atenção",
        "Digite uma legenda para o post."
      );

      return;
    }

    // ===============================================
    // FOTO
    // ===============================================

    if (!fotoBase64) {
      Alert.alert(
        "Atenção",
        "Escolha uma foto da galeria ou da câmera."
      );

      return;
    }

    setCarregando(true);

    try {
      // =============================================
      // UPLOAD DA FOTO
      // =============================================

      const urlImagem =
        await enviarImagem(
          fotoBase64
        );

      console.log(
        "Imagem enviada:",
        urlImagem
      );

      // =============================================
      // LEGENDA COMPLETA
      // =============================================

      const legendaCompleta = [
        legenda.trim(),

        local.trim()
          ? `📍 ${local.trim()}`
          : "",

        hashtags.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      // =============================================
      // DADOS DA PUBLICAÇÃO
      // =============================================

      const publicacao = {
        usuario_id:
          usuarioId,

        pet_id:
          pet.id,

        imagem:
          urlImagem,

        legenda:
          legendaCompleta,
      };

      console.log(
        "Publicando post:",
        publicacao
      );

      console.log(
        "URL da publicação:",
        `${API_URL}/posts`
      );

      // =============================================
      // ENVIAR PARA API
      // =============================================

      const resposta = await fetch(
        `${API_URL}/posts`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              publicacao
            ),
        }
      );

      // =============================================
      // RESPOSTA SEGURA
      // =============================================

      const textoResposta =
        await resposta.text();

      console.log(
        "Status publicação:",
        resposta.status
      );

      console.log(
        "Resposta publicação:",
        textoResposta
      );

      let dados: any = null;

      try {
        dados =
          textoResposta
            ? JSON.parse(
                textoResposta
              )
            : {};
      } catch {
        throw new Error(
          `A rota de publicação respondeu de forma inválida (${resposta.status}).`
        );
      }

      // =============================================
      // ERRO DA API
      // =============================================

      if (!resposta.ok) {
        throw new Error(
          dados?.message ||
            dados?.error ||
            "Não foi possível publicar."
        );
      }

      // =============================================
      // SUCESSO
      // =============================================

      Alert.alert(
        "Publicado! 🐾",
        `A publicação de @${pet.nome} foi criada com sucesso.`
      );

      // Limpar formulário

      setImagem("");
      setFotoBase64("");
      setLocal("");
      setHashtags("");
      setLegenda("");

      // Voltar para Home

      onNavigate("home");
    } catch (erro) {
      console.error(
        "Erro ao publicar:",
        erro
      );

      Alert.alert(
        "Erro",
        erro instanceof Error
          ? erro.message
          : "Não foi possível publicar."
      );
    } finally {
      setCarregando(false);
    }
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
            background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ===========================================
            TÍTULO
        =========================================== */}

        <Text
          style={[
            styles.titulo,
            { color: text },
          ]}
        >
          Criar publicação
        </Text>

        <Text
          style={[
            styles.subtitulo,
            { color: muted },
          ]}
        >
          Compartilhe um momento especial do seu pet 🐾
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                card,

              borderColor:
                border,
            },
          ]}
        >
          {/* =========================================
              PET AUTOMÁTICO
          ========================================= */}

          {carregandoPet ? (
            <View
              style={
                styles.petCarregando
              }
            >
              <ActivityIndicator
                color={gold}
              />

              <Text
                style={[
                  styles.carregandoTexto,
                  {
                    color: muted,
                  },
                ]}
              >
                Carregando perfil...
              </Text>
            </View>
          ) : erroPet ? (
            <View
              style={
                styles.erroContainer
              }
            >
              <Text
                accessibilityRole="alert"
                style={
                  styles.erroTexto
                }
              >
                {erroPet}
              </Text>
            </View>
          ) : pet ? (
            <View
              style={[
                styles.autorContainer,
                {
                  borderColor:
                    border,
                },
              ]}
            >
              {/* FOTO DO PET */}

              {pet.foto_perfil ? (
                <Image
                  source={{
                    uri:
                      pet.foto_perfil.startsWith(
                        "http"
                      )
                        ? pet.foto_perfil
                        : `${API_URL}${pet.foto_perfil}`,
                  }}
                  style={
                    styles.avatarPet
                  }
                />
              ) : (
                <View
                  style={[
                    styles.avatarSemFoto,
                    {
                      backgroundColor:
                        gold,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.avatarLetra
                    }
                  >
                    {pet.nome
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
              )}

              <View
                style={
                  styles.autorTextos
                }
              >
                <Text
                  style={[
                    styles.publicacaoDe,
                    {
                      color:
                        muted,
                    },
                  ]}
                >
                  Publicação de
                </Text>

                <Text
                  style={[
                    styles.nomePet,
                    {
                      color:
                        text,
                    },
                  ]}
                >
                  @{pet.nome.replace(
                    /\s+/g,
                    ""
                  )}
                </Text>
              </View>
            </View>
          ) : null}

          {/* =========================================
              IMAGEM
          ========================================= */}

          <Text
            style={[
              styles.label,
              { color: text },
            ]}
          >
            Foto
          </Text>

          <View
            style={
              styles.botoesFoto
            }
          >
            <TouchableOpacity
              onPress={() =>
                selecionarFoto(
                  false
                )
              }
              style={[
                styles.botaoFoto,
                {
                  backgroundColor:
                    gold,
                },
              ]}
              disabled={
                carregando
              }
            >
              <Text
                style={
                  styles.botaoTexto
                }
              >
                Galeria
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                selecionarFoto(
                  true
                )
              }
              style={[
                styles.botaoFoto,
                {
                  backgroundColor:
                    gold,
                },
              ]}
              disabled={
                carregando
              }
            >
              <Text
                style={
                  styles.botaoTexto
                }
              >
                Câmera
              </Text>
            </TouchableOpacity>
          </View>

          {/* =========================================
              PRÉ-VISUALIZAÇÃO
          ========================================= */}

          {!!imagem && (
            <View
              style={
                styles.previewContainer
              }
            >
              <Image
                source={{
                  uri: imagem,
                }}
                style={
                  styles.preview
                }
                resizeMode="cover"
              />

              <TouchableOpacity
                onPress={() => {
                  setImagem("");
                  setFotoBase64(
                    ""
                  );
                }}
                disabled={
                  carregando
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
            </View>
          )}

          {/* =========================================
              LEGENDA
          ========================================= */}

          <Text
            style={[
              styles.label,
              { color: text },
            ]}
          >
            Legenda
          </Text>

          <TextInput
            style={[
              styles.textarea,
              {
                color: text,
                borderColor:
                  border,
                backgroundColor:
                  background,
              },
            ]}
            placeholder="O que seu pet está fazendo?"
            placeholderTextColor={
              muted
            }
            value={legenda}
            onChangeText={
              setLegenda
            }
            multiline
            textAlignVertical="top"
            maxLength={4000}
          />

          {/* =========================================
              LOCALIZAÇÃO
          ========================================= */}

          <TextInput
            style={[
              styles.input,
              {
                color: text,
                borderColor:
                  border,
                backgroundColor:
                  background,
                marginTop: 14,
              },
            ]}
            placeholder="Adicionar localização (opcional)"
            placeholderTextColor={
              muted
            }
            value={local}
            onChangeText={
              setLocal
            }
          />

          {/* =========================================
              HASHTAGS
          ========================================= */}

          <TextInput
            style={[
              styles.input,
              {
                color: text,
                borderColor:
                  border,
                backgroundColor:
                  background,
                marginTop: 10,
              },
            ]}
            placeholder="Hashtags, ex.: #cachorros (opcional)"
            placeholderTextColor={
              muted
            }
            value={hashtags}
            onChangeText={
              setHashtags
            }
            autoCapitalize="none"
          />

          {/* =========================================
              PUBLICAR
          ========================================= */}

          <TouchableOpacity
            style={[
              styles.botao,
              {
                backgroundColor:
                  gold,
              },

              (carregando ||
                carregandoPet ||
                !pet) &&
                styles.botaoDesabilitado,
            ]}
            onPress={publicar}
            disabled={
              carregando ||
              carregandoPet ||
              !pet
            }
          >
            {carregando ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.botaoTexto
                }
              >
                PUBLICAR
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =============================================
          NAVEGAÇÃO
      ============================================= */}

      <BottomNavigation
        telaAtual="criar"
        onNavigate={
          onNavigate
        }
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

    scroll: {
      padding: 20,
      paddingBottom: 110,
    },

    titulo: {
      fontSize: 27,
      fontWeight: "800",
    },

    subtitulo: {
      fontSize: 14,
      marginTop: 5,
      marginBottom: 25,
    },

    card: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 18,
    },

    // ===============================================
    // AUTOR
    // ===============================================

    autorContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      paddingBottom: 16,
      marginBottom: 8,
    },

    autorTextos: {
      marginLeft: 12,
      flex: 1,
    },

    publicacaoDe: {
      fontSize: 12,
      marginBottom: 2,
    },

    nomePet: {
      fontSize: 18,
      fontWeight: "800",
    },

    avatarPet: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },

    avatarSemFoto: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent:
        "center",
      alignItems: "center",
    },

    avatarLetra: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "800",
    },

    petCarregando: {
      minHeight: 70,
      justifyContent:
        "center",
      alignItems: "center",
    },

    carregandoTexto: {
      marginTop: 8,
      fontSize: 13,
    },

    // ===============================================
    // ERRO
    // ===============================================

    erroContainer: {
      backgroundColor:
        "#FEECEB",
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
    },

    erroTexto: {
      color: "#B42318",
      fontWeight: "600",
      fontSize: 13,
      textAlign: "center",
    },

    // ===============================================
    // CAMPOS
    // ===============================================

    label: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 7,
      marginTop: 12,
    },

    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
    },

    textarea: {
      minHeight: 130,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
    },

    // ===============================================
    // FOTO
    // ===============================================

    botoesFoto: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
    },

    botaoFoto: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems: "center",
    },

    previewContainer: {
      marginBottom: 14,
      alignItems: "center",
    },

    preview: {
      width: "100%",
      height: 260,
      borderRadius: 12,
    },

    removerFoto: {
      color: "#B42318",
      fontSize: 13,
      fontWeight: "600",
      marginTop: 8,
    },

    // ===============================================
    // BOTÃO PUBLICAR
    // ===============================================

    botao: {
      height: 52,
      borderRadius: 13,
      justifyContent:
        "center",
      alignItems: "center",
      marginTop: 25,
    },

    botaoDesabilitado: {
      opacity: 0.55,
    },

    botaoTexto: {
      color: "#FFFFFF",
      fontWeight: "800",
    },
  });