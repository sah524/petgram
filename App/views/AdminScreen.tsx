
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../services/api";

// =====================================================
// TIPOS
// =====================================================

type Registro = {
  id: number;
  nome?: string;
  email?: string;
  legenda?: string;
  imagem?: string | null;
  imagens?: string[];
  criado_em?: string;
};

type Aba = "usuarios" | "posts";

type Props = {
  token: string;
  onLogout: () => void;
};

// =====================================================
// CORES ORIGINAIS DO PETGRAM
// =====================================================

const CORES = {
  fundo: "#F7F3EA",
  superficie: "#FFFDF8",
  branco: "#FFFFFF",
  dourado: "#D9A82E",
  douradoClaro: "#FBF3DA",
  douradoEscuro: "#A77C16",
  texto: "#211F1A",
  secundario: "#777168",
  borda: "#E7E0D3",
  vermelho: "#B42318",
  vermelhoClaro: "#FFF0ED",
  verde: "#43836B",
  verdeClaro: "#EDF7F0",
};

// =====================================================
// UTILITÁRIOS
// =====================================================

function obterImagem(item: Registro): string | undefined {
  const imagem =
    Array.isArray(item.imagens) && item.imagens.length > 0
      ? item.imagens[0]
      : item.imagem;

  if (!imagem || typeof imagem !== "string") {
    return undefined;
  }

  if (
    imagem.startsWith("http://") ||
    imagem.startsWith("https://") ||
    imagem.startsWith("data:")
  ) {
    return imagem;
  }

  if (imagem.startsWith("/")) {
    return `${API_URL}${imagem}`;
  }

  return `${API_URL}/${imagem}`;
}

function formatarData(valor?: string): string {
  if (!valor) return "";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  return data.toLocaleDateString("pt-BR");
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function AdminScreen({
  token,
  onLogout,
}: Props) {
  const { width } = useWindowDimensions();

  const desktop = width >= 960;
  const compacto = width < 650;

  const [aba, setAba] = useState<Aba>("posts");

  const [registros, setRegistros] = useState<
    Record<Aba, Registro[]>
  >({
    posts: [],
    usuarios: [],
  });

  const [carregando, setCarregando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  // =====================================================
  // CARREGAR DADOS REAIS DA API
  // =====================================================

  const carregar = useCallback(async (abaAtual: Aba) => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `${API_URL}/admin/${abaAtual}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok || dados.success === false) {
        throw new Error(
          dados.message || "Não foi possível consultar os registros."
        );
      }

      setRegistros((anterior) => ({
        ...anterior,
        [abaAtual]: Array.isArray(dados[abaAtual])
          ? dados[abaAtual]
          : [],
      }));
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao carregar os dados.";

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    void carregar("posts");
    void carregar("usuarios");
  }, [carregar]);

  // =====================================================
  // BUSCA
  // =====================================================

  const itens = registros[aba];

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return itens;

    return itens.filter((item) => {
      const conteudo = [
        item.id,
        item.nome,
        item.email,
        item.legenda,
      ]
        .filter((valor) => valor !== undefined && valor !== null)
        .join(" ")
        .toLowerCase();

      return conteudo.includes(termo);
    });
  }, [itens, busca]);

  const mudarAba = (novaAba: Aba) => {
    setBusca("");
    setErro("");
    setAba(novaAba);
    void carregar(novaAba);
  };

  // =====================================================
  // EXCLUSÃO
  // =====================================================

  const executarExclusao = async (id: number) => {
    setExcluindoId(id);

    try {
      const resposta = await fetch(
        `${API_URL}/admin/${aba}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok || dados.success === false) {
        throw new Error(
          dados.message || "Não foi possível excluir o registro."
        );
      }

      await Promise.all([
        carregar("posts"),
        carregar("usuarios"),
      ]);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro ao excluir o registro.";

      if (Platform.OS === "web") {
        window.alert(mensagem);
      } else {
        Alert.alert("Erro", mensagem);
      }
    } finally {
      setExcluindoId(null);
    }
  };

  const excluir = (id: number) => {
    const mensagem =
      aba === "posts"
        ? "Deseja excluir esta publicação permanentemente?"
        : "Deseja excluir esta conta permanentemente?";

    if (Platform.OS === "web") {
      if (window.confirm(mensagem)) {
        void executarExclusao(id);
      }
      return;
    }

    Alert.alert("Confirmar exclusão", mensagem, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => void executarExclusao(id),
      },
    ]);
  };

  // =====================================================
  // MENU
  // =====================================================

  const renderizarMenu = () => (
    <View style={styles.menu}>
      <View style={styles.marca}>
        <Image
          source={require("../assets/Logo-Petgram.jpeg")}
          style={styles.logo}
          resizeMode="cover"
        />

        <View>
          <View style={styles.nomeMarca}>
            <Text style={styles.pet}>Pet</Text>
            <Text style={styles.gram}>Gram</Text>
          </View>

          <Text style={styles.marcaSubtitulo}>
            Painel administrativo
          </Text>
        </View>
      </View>

      <View style={styles.menuSeparador} />

      <Text style={styles.menuCategoria}>GERENCIAMENTO</Text>

      <TouchableOpacity
        onPress={() => mudarAba("posts")}
        style={[
          styles.menuOpcao,
          aba === "posts" && styles.menuOpcaoAtiva,
        ]}
      >
        <Ionicons
          name="images-outline"
          size={20}
          color={
            aba === "posts"
              ? CORES.douradoEscuro
              : CORES.secundario
          }
        />

        <Text
          style={[
            styles.menuTexto,
            aba === "posts" && styles.menuTextoAtivo,
          ]}
        >
          Publicações
        </Text>

        {aba === "posts" && (
          <View style={styles.indicadorAtivo} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => mudarAba("usuarios")}
        style={[
          styles.menuOpcao,
          aba === "usuarios" && styles.menuOpcaoAtiva,
        ]}
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={
            aba === "usuarios"
              ? CORES.douradoEscuro
              : CORES.secundario
          }
        />

        <Text
          style={[
            styles.menuTexto,
            aba === "usuarios" && styles.menuTextoAtivo,
          ]}
        >
          Contas
        </Text>

        {aba === "usuarios" && (
          <View style={styles.indicadorAtivo} />
        )}
      </TouchableOpacity>

      <View style={styles.menuRodape}>
        <View style={styles.menuSeparador} />

        <TouchableOpacity
          style={styles.menuOpcao}
          onPress={onLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={CORES.secundario}
          />

          <Text style={styles.menuTexto}>Sair</Text>
        </TouchableOpacity>

        <Text style={styles.rodapeTexto}>
          PetGram • Administração
        </Text>
      </View>
    </View>
  );

  // =====================================================
  // CARD DE RESUMO
  // =====================================================

  const renderizarResumo = (
    titulo: string,
    quantidade: number,
    icone: keyof typeof Ionicons.glyphMap,
    tipo: Aba
  ) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => mudarAba(tipo)}
      style={[
        styles.cardResumo,
        compacto && styles.cardResumoCompacto,
      ]}
    >
      <View style={styles.cardIcone}>
        <Ionicons
          name={icone}
          size={23}
          color={CORES.douradoEscuro}
        />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardNumero}>
          {quantidade}
        </Text>

        <Text style={styles.cardLegenda}>
          {titulo}
        </Text>
      </View>

     <Ionicons
  name="arrow-forward-outline"
  size={18}
  color={CORES.secundario}
/>
    </TouchableOpacity>
  );

  // =====================================================
  // REGISTROS
  // =====================================================

  const renderizarRegistro = (item: Registro) => {
    const imagem = obterImagem(item);

    return (
      <View key={item.id} style={styles.registro}>
        <View style={styles.registroConteudo}>
          <View style={styles.miniatura}>
            {aba === "posts" && imagem ? (
              <Image
                source={{ uri: imagem }}
                style={styles.imagem}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name={
                  aba === "posts"
                    ? "image-outline"
                    : "person-outline"
                }
                size={25}
                color={CORES.douradoEscuro}
              />
            )}
          </View>

          <View style={styles.registroInformacoes}>
            <Text
              style={styles.registroTitulo}
              numberOfLines={2}
            >
              {aba === "posts"
                ? item.legenda || "Publicação sem legenda"
                : item.nome || "Usuário sem nome"}
            </Text>

            <Text
              style={styles.registroIdentificador}
            >
              {aba === "posts"
                ? `Publicação #${item.id}`
                : `Conta #${item.id}`}
            </Text>

            {aba === "usuarios" && !!item.email && (
              <Text
                style={styles.registroDescricao}
                numberOfLines={1}
              >
                {item.email}
              </Text>
            )}

            {!!item.criado_em && (
              <View style={styles.dataLinha}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={CORES.secundario}
                />

                <Text style={styles.registroData}>
                  {formatarData(item.criado_em)}
                </Text>
              </View>
            )}

            {aba === "posts" &&
              Array.isArray(item.imagens) &&
              item.imagens.length > 1 && (
                <Text style={styles.registroData}>
                  {item.imagens.length} imagens
                </Text>
              )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.botaoExcluir,
            excluindoId !== null &&
              styles.botaoDesabilitado,
          ]}
          onPress={() => excluir(item.id)}
          disabled={excluindoId !== null}
        >
          {excluindoId === item.id ? (
            <ActivityIndicator
              size="small"
              color={CORES.vermelho}
            />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={17}
                color={CORES.vermelho}
              />

              <Text style={styles.botaoExcluirTexto}>
                Excluir
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // =====================================================
  // TELA
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layout}>
        {desktop && renderizarMenu()}

        <View style={styles.principal}>
          <View style={styles.cabecalho}>
            <View style={styles.cabecalhoEsquerda}>
              {!desktop && (
                <Image
                  source={require("../assets/Logo-Petgram.jpeg")}
                  style={styles.logoMobile}
                />
              )}

              <View style={styles.cabecalhoTextos}>
                <Text
                  style={[
                    styles.titulo,
                    compacto && styles.tituloCompacto,
                  ]}
                >
                  Administração
                </Text>

                <Text style={styles.subtitulo}>
                  Gerencie sua comunidade PetGram
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botaoSair}
              onPress={onLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color={CORES.texto}
              />

              {!compacto && (
                <Text style={styles.botaoSairTexto}>
                  Sair
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.rolagem}
            contentContainerStyle={[
              styles.conteudo,
              compacto && styles.conteudoCompacto,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.boasVindas}>
              <View>
                <Text style={styles.sobreTitulo}>
                  VISÃO GERAL
                </Text>

                <Text style={styles.boasVindasTitulo}>
                  Painel de controle
                </Text>

                <Text style={styles.boasVindasDescricao}>
                  Acompanhe e gerencie as informações
                  da comunidade.
                </Text>
              </View>

              {!compacto && (
                <View style={styles.seloAdmin}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color={CORES.verde}
                  />

                  <Text style={styles.seloAdminTexto}>
                    Superadmin
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.resumo,
                compacto && styles.resumoCompacto,
              ]}
            >
              {renderizarResumo(
                "Publicações",
                registros.posts.length,
                "images-outline",
                "posts"
              )}

              {renderizarResumo(
                "Contas cadastradas",
                registros.usuarios.length,
                "people-outline",
                "usuarios"
              )}
            </View>

            {!desktop && (
              <View style={styles.abas}>
                <TouchableOpacity
                  style={[
                    styles.aba,
                    aba === "posts" && styles.abaAtiva,
                  ]}
                  onPress={() => mudarAba("posts")}
                >
                  <Ionicons
                    name="images-outline"
                    size={18}
                    color={
                      aba === "posts"
                        ? CORES.douradoEscuro
                        : CORES.secundario
                    }
                  />

                  <Text
                    style={[
                      styles.abaTexto,
                      aba === "posts" &&
                        styles.abaTextoAtivo,
                    ]}
                  >
                    Publicações
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.aba,
                    aba === "usuarios" &&
                      styles.abaAtiva,
                  ]}
                  onPress={() => mudarAba("usuarios")}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={
                      aba === "usuarios"
                        ? CORES.douradoEscuro
                        : CORES.secundario
                    }
                  />

                  <Text
                    style={[
                      styles.abaTexto,
                      aba === "usuarios" &&
                        styles.abaTextoAtivo,
                    ]}
                  >
                    Contas
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.painel}>
              <View
                style={[
                  styles.painelCabecalho,
                  compacto &&
                    styles.painelCabecalhoCompacto,
                ]}
              >
                <View style={styles.painelTextos}>
                  <Text style={styles.painelTitulo}>
                    {aba === "posts"
                      ? "Publicações"
                      : "Contas cadastradas"}
                  </Text>

                  <Text style={styles.painelSubtitulo}>
                    {aba === "posts"
                      ? "Publicações compartilhadas na comunidade."
                      : "Usuários cadastrados no PetGram."}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botaoAtualizar}
                  onPress={() => void carregar(aba)}
                  disabled={carregando}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={19}
                    color={CORES.douradoEscuro}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buscaContainer}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={CORES.secundario}
                />

                <TextInput
                  style={styles.campoBusca}
                  value={busca}
                  onChangeText={setBusca}
                  placeholder={
                    aba === "posts"
                      ? "Buscar publicação..."
                      : "Buscar conta..."
                  }
                  placeholderTextColor={
                    CORES.secundario
                  }
                />

                {busca.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setBusca("")}
                  >
                    <Ionicons
                      name="close-circle"
                      size={19}
                      color={CORES.secundario}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.listaCabecalho}>
                <Text style={styles.listaQuantidade}>
                  {itensFiltrados.length}{" "}
                  {aba === "posts"
                    ? "publicações"
                    : "contas"}
                </Text>
              </View>

              {carregando ? (
                <View style={styles.estadoCentral}>
                  <ActivityIndicator
                    size="large"
                    color={CORES.dourado}
                  />

                  <Text style={styles.estadoTexto}>
                    Carregando registros...
                  </Text>
                </View>
              ) : erro ? (
                <View style={styles.estadoCentral}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={36}
                    color={CORES.vermelho}
                  />

                  <Text style={styles.estadoTexto}>
                    {erro}
                  </Text>

                  <TouchableOpacity
                    onPress={() => void carregar(aba)}
                  >
                    <Text style={styles.tentarNovamente}>
                      Tentar novamente
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : itensFiltrados.length === 0 ? (
                <View style={styles.estadoCentral}>
                  <Ionicons
                    name={
                      aba === "posts"
                        ? "images-outline"
                        : "people-outline"
                    }
                    size={40}
                    color={CORES.dourado}
                  />

                  <Text style={styles.estadoVazio}>
                    Nenhum registro encontrado.
                  </Text>
                </View>
              ) : (
                <View style={styles.lista}>
                  {itensFiltrados.map(renderizarRegistro)}
                </View>
              )}
            </View>

            <Text style={styles.rodapePagina}>
              PetGram • Painel administrativo
            </Text>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  layout: {
    flex: 1,
    flexDirection: "row",
  },

  // MENU LATERAL

  menu: {
    width: 230,
    backgroundColor: CORES.superficie,
    borderRightWidth: 1,
    borderRightColor: CORES.borda,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  marca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: CORES.douradoClaro,
  },

  nomeMarca: {
    flexDirection: "row",
  },

  pet: {
    fontSize: 22,
    fontWeight: "900",
    color: CORES.texto,
  },

  gram: {
    fontSize: 22,
    fontWeight: "900",
    color: CORES.dourado,
  },

  marcaSubtitulo: {
    fontSize: 10,
    color: CORES.secundario,
    marginTop: 2,
  },

  menuSeparador: {
    height: 1,
    backgroundColor: CORES.borda,
    marginVertical: 25,
  },

  menuCategoria: {
    fontSize: 10,
    fontWeight: "800",
    color: CORES.secundario,
    letterSpacing: 1.2,
    marginBottom: 15,
    paddingHorizontal: 14,
  },

  menuOpcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 7,
  },

  menuOpcaoAtiva: {
    backgroundColor: CORES.douradoClaro,
  },

  menuTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: CORES.secundario,
    flex: 1,
  },

  menuTextoAtivo: {
    color: CORES.texto,
    fontWeight: "800",
  },

  indicadorAtivo: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CORES.dourado,
  },

  menuRodape: {
    marginTop: "auto",
    paddingBottom: 20,
  },

  rodapeTexto: {
    fontSize: 11,
    color: CORES.secundario,
    marginTop: 20,
    paddingHorizontal: 14,
  },

  // ÁREA PRINCIPAL

  principal: {
    flex: 1,
    minWidth: 0,
  },

  cabecalho: {
    minHeight: 84,
    paddingHorizontal: 28,
    paddingVertical: 15,
    backgroundColor: CORES.superficie,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cabecalhoEsquerda: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  logoMobile: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  cabecalhoTextos: {
    flex: 1,
  },

  titulo: {
    fontSize: 23,
    fontWeight: "900",
    color: CORES.texto,
  },

  tituloCompacto: {
    fontSize: 19,
  },

  subtitulo: {
    fontSize: 12,
    color: CORES.secundario,
    marginTop: 5,
  },

  botaoSair: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: CORES.branco,
  },

  botaoSairTexto: {
    color: CORES.texto,
    fontWeight: "700",
    fontSize: 13,
  },

  rolagem: {
    flex: 1,
  },

  conteudo: {
    padding: 26,
    paddingBottom: 35,
  },

  conteudoCompacto: {
    padding: 14,
  },

  // VISÃO GERAL

  boasVindas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },

  sobreTitulo: {
    color: CORES.douradoEscuro,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  boasVindasTitulo: {
    fontSize: 26,
    fontWeight: "900",
    color: CORES.texto,
  },

  boasVindasDescricao: {
    fontSize: 13,
    color: CORES.secundario,
    marginTop: 7,
    lineHeight: 20,
  },

  seloAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: CORES.verdeClaro,
  },

  seloAdminTexto: {
    color: CORES.verde,
    fontWeight: "700",
    fontSize: 12,
  },

  // CARDS

  resumo: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },

  resumoCompacto: {
    flexDirection: "column",
    gap: 10,
  },

  cardResumo: {
    flex: 1,
    minHeight: 115,
    backgroundColor: CORES.superficie,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  cardResumoCompacto: {
    flex: 0,
    minHeight: 90,
  },

  cardIcone: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: CORES.douradoClaro,
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    flex: 1,
  },

  cardNumero: {
    fontSize: 30,
    fontWeight: "900",
    color: CORES.texto,
  },

  cardLegenda: {
    fontSize: 12,
    color: CORES.secundario,
    marginTop: 3,
  },

  // ABAS MOBILE

  abas: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  aba: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: CORES.superficie,
    borderWidth: 1,
    borderColor: CORES.borda,
  },

  abaAtiva: {
    backgroundColor: CORES.douradoClaro,
    borderColor: CORES.dourado,
  },

  abaTexto: {
    color: CORES.secundario,
    fontWeight: "700",
    fontSize: 13,
  },

  abaTextoAtivo: {
    color: CORES.texto,
  },

  // PAINEL

  painel: {
    backgroundColor: CORES.superficie,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 20,
    padding: 20,
  },

  painelCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },

  painelCabecalhoCompacto: {
    flexWrap: "wrap",
  },

  painelTextos: {
    flex: 1,
  },

  painelTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: CORES.texto,
  },

  painelSubtitulo: {
    fontSize: 12,
    color: CORES.secundario,
    marginTop: 5,
    lineHeight: 18,
  },

  botaoAtualizar: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: CORES.douradoClaro,
    alignItems: "center",
    justifyContent: "center",
  },

  // BUSCA

  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 13,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 18,
  },

  campoBusca: {
    flex: 1,
    color: CORES.texto,
    fontSize: 13,
    outlineStyle: "none",
  } as any,

  listaCabecalho: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    marginBottom: 13,
  },

  listaQuantidade: {
    fontSize: 12,
    fontWeight: "700",
    color: CORES.secundario,
  },

  // REGISTROS

  lista: {
    gap: 10,
  },

  registro: {
    backgroundColor: CORES.branco,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },

  registroConteudo: {
    flex: 1,
    minWidth: 160,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  miniatura: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: CORES.douradoClaro,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  imagem: {
    width: "100%",
    height: "100%",
  },

  registroInformacoes: {
    flex: 1,
  },

  registroTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: CORES.texto,
    lineHeight: 20,
  },

  registroIdentificador: {
    fontSize: 11,
    fontWeight: "700",
    color: CORES.douradoEscuro,
    marginTop: 5,
  },

  registroDescricao: {
    fontSize: 12,
    color: CORES.secundario,
    marginTop: 5,
  },

  dataLinha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
  },

  registroData: {
    fontSize: 11,
    color: CORES.secundario,
    marginTop: 5,
  },

  botaoExcluir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#F4D0CB",
    backgroundColor: CORES.vermelhoClaro,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    minWidth: 96,
  },

  botaoExcluirTexto: {
    color: CORES.vermelho,
    fontWeight: "800",
    fontSize: 12,
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },

  // ESTADOS

  estadoCentral: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 13,
    padding: 20,
  },

  estadoTexto: {
    fontSize: 13,
    color: CORES.secundario,
    textAlign: "center",
  },

  estadoVazio: {
    fontSize: 14,
    color: CORES.secundario,
    textAlign: "center",
  },

  tentarNovamente: {
    color: CORES.douradoEscuro,
    fontWeight: "800",
  },

  rodapePagina: {
    fontSize: 11,
    color: CORES.secundario,
    textAlign: "center",
    marginTop: 25,
  },
});
