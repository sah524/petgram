import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomNavigation from "../components/BottomNavigation";
import { API_URL } from "../src/api";

type Comunidade = {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  quantidade_membros?: number;
};

type Props = {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (screen: any) => void;

  onHome: () => void;
  onExplore: () => void;
  onCommunities: () => void;
  onProfile: () => void;
  onCreate: () => void;

  usuarioId: number;
  token: string;

  onAbrirComunidade?: (comunidade: Comunidade) => void;

  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    gold: string;
  };
};

export default function ComunidadeScreen({
  isDark,
  onNavigate,
  onHome,
  onExplore,
  onCommunities,
  onProfile,
  onCreate,
  usuarioId,
  token,
  onAbrirComunidade,
  colors,
}: Props) {
  const [communities, setCommunities] = useState<Comunidade[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarComunidades() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(`${API_URL}/comunidades`, {
        headers: {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const texto = await resposta.text();

      let dados: any = {};

      if (texto) {
        try {
          dados = JSON.parse(texto);
        } catch {
          throw new Error(
            "A API retornou uma resposta inválida."
          );
        }
      }

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            dados.error ||
            "Não foi possível carregar as comunidades."
        );
      }

      const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.comunidades)
        ? dados.comunidades
        : [];

      setCommunities(lista);
    } catch (e) {
      console.error("Erro ao carregar comunidades:", e);

      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar as comunidades."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarComunidades();
  }, []);

  const comunidadesFiltradas = communities.filter(
    (community) => {
      const termo = busca.trim().toLowerCase();

      if (!termo) {
        return true;
      }

      return (
        community.nome
          ?.toLowerCase()
          .includes(termo) ||
        community.descricao
          ?.toLowerCase()
          .includes(termo)
      );
    }
  );

  function abrirComunidade(
    comunidade: Comunidade
  ) {
    if (onAbrirComunidade) {
      onAbrirComunidade(comunidade);
      return;
    }

    onNavigate("comunidadeDetalhes");
  }

  return (
    <View
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
        keyboardShouldPersistTaps="handled"
      >
        {/* CABEÇALHO */}

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
              Comunidades
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.muted,
                },
              ]}
            >
              Encontre pessoas que amam os mesmos pets
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              onNavigate("criarComunidade")
            }
            style={[
              styles.addButton,
              {
                backgroundColor: colors.gold,
              },
            ]}
          >
            <Text style={styles.addText}>
              ＋
            </Text>
          </TouchableOpacity>
        </View>

        {/* BUSCA */}

        <View
          style={[
            styles.search,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar comunidades"
            placeholderTextColor={colors.muted}
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />
        </View>

        {/* ERRO */}

        {!!erro && (
          <Text style={styles.erro}>
            {erro}
          </Text>
        )}

        {/* CARREGANDO */}

        {carregando && (
          <ActivityIndicator
            size="large"
            color={colors.gold}
            style={styles.loading}
          />
        )}

        {/* COMUNIDADES */}

        {!carregando &&
          comunidadesFiltradas.map(
            (community) => (
              <TouchableOpacity
                key={community.id}
                onPress={() =>
                  abrirComunidade(community)
                }
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      colors.card,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.communityIcon,
                    {
                      backgroundColor:
                        `${colors.gold}22`,
                    },
                  ]}
                >
                  <Text style={styles.emoji}>
                    🐾
                  </Text>
                </View>

                <View
                  style={styles.cardContent}
                >
                  <Text
                    style={[
                      styles.communityName,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {community.nome}
                  </Text>

                  <Text
                    style={[
                      styles.members,
                      {
                        color:
                          colors.gold,
                      },
                    ]}
                  >
                    {community.quantidade_membros ??
                      0}{" "}
                    membros
                  </Text>

                  <Text
                    style={[
                      styles.description,
                      {
                        color:
                          colors.muted,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {community.descricao ||
                      "Comunidade de pets"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.arrow,
                    {
                      color:
                        colors.muted,
                    },
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            )
          )}

        {!carregando &&
          comunidadesFiltradas.length ===
            0 &&
          !erro && (
            <Text
              style={[
                styles.empty,
                {
                  color: colors.muted,
                },
              ]}
            >
              Nenhuma comunidade encontrada.
            </Text>
          )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <BottomNavigation
        active="comunidades"
        isDark={isDark}
        onHome={onHome}
        onExplore={onExplore}
        onCreate={onCreate}
        onCommunities={onCommunities}
        onProfile={onProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
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
    fontSize: 11,
    marginTop: 3,
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  addText: {
    fontSize: 25,
    color: "#211F1A",
  },

  search: {
    height: 47,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 22,
    marginRight: 8,
    color: "#8E8272",
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    height: "100%",
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  communityIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  emoji: {
    fontSize: 27,
  },

  cardContent: {
    flex: 1,
  },

  communityName: {
    fontSize: 14,
    fontWeight: "800",
  },

  members: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },

  description: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
  },

  arrow: {
    fontSize: 28,
    marginLeft: 8,
  },

  loading: {
    marginTop: 35,
  },

  erro: {
    color: "#B42318",
    backgroundColor: "#FEECEB",
    padding: 11,
    borderRadius: 10,
    marginBottom: 14,
  },

  empty: {
    textAlign: "center",
    marginTop: 35,
    fontSize: 14,
  },

  bottomSpace: {
    height: 20,
  },
});