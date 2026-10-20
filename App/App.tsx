import React, { useState } from "react";
import { API_URL, API_CONNECTION_MESSAGE } from "../Api/src/api";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import CadastroScreen from "./screens/CadastroScreen";
import HomeScreen from "./screens/HomeScreen";
import ExplorarScreen from "./screens/ExplorarScreen";
import CriarPostScreen from "./screens/CriarPostScreen";
import ComunidadeScreen from "./screens/ComunidadeScreen";
import PerfilScreen from "./screens/PerfilScreen";
import PetsScreen from "./screens/PetsScreen";
import CriarComunidadeScreen from "./screens/CriarComunidadeScreen";
import ComunidadeDetalheScreen from "./screens/ComunidadeDetalheScreen";


export type Screen =
  | "home"
  | "explorar"
  | "criar"
  | "comunidades"
  | "comunidadeDetalhes"
  | "criarComunidade"
  | "perfil"
  | "pets";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  foto_perfil: string | null;
}
interface Comunidade {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  quantidade_membros?: number;
}

export default function App() {

const [comunidadeSelecionada, setComunidadeSelecionada] =
  useState<Comunidade | null>(null);

  const [telaCadastro, setTelaCadastro] = useState(false);
  const [logado, setLogado] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");


  const [token, setToken] = useState<string | null>(null);

  const [usuarioAtual, setUsuarioAtual] =
    useState<Usuario | null>(null);

  // ---------------------------------------------------
  // NAVEGAÇÃO
  // ---------------------------------------------------

  const [telaAtual, setTelaAtual] =
    useState<Screen>("home");

  // ---------------------------------------------------
  // TEMA
  // ---------------------------------------------------

  const [modoEscuro, setModoEscuro] = useState(false);

  // ===================================================
  // CORES
  // ===================================================

  const colors = {

    background: modoEscuro
      ? "#211F1A"
      : "#F7F3EA",

    card: modoEscuro
      ? "#302D27"
      : "#FFFDF8",

    text: modoEscuro
      ? "#FFFFFF"
      : "#211F1A",

    muted: modoEscuro
      ? "#C8C2B8"
      : "#777168",

    border: modoEscuro
      ? "#3D3932"
      : "#E7E0D3",

    gold: "#D9A82E",

  };

  // ===================================================
  // LOGIN
  // ===================================================

  async function fazerLogin() {
    setErroLogin("");
    if (!email.trim() || !senha.trim()) {
      setErroLogin("Digite seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);

    try {
      console.log("Iniciando login...");
      console.log("URL da API:", `${API_URL}/auth/login`);

      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha,
        }),
      });

      console.log("Status da resposta:", resposta.status);

      const textoResposta = await resposta.text();

      console.log("Resposta de login recebida da API.");

      let dados: any;

      try {
        dados = JSON.parse(textoResposta);
      } catch (erroJSON) {
        console.error(
          "A API não retornou um JSON válido:",
          textoResposta
        );

        setErroLogin("A resposta recebida pelo servidor não é válida.");
        return;
      }

      if (!resposta.ok) {
        setErroLogin(dados.message || dados.error || `Erro HTTP: ${resposta.status}`);
        return;
      }

      if (!dados.token || !dados.usuario) {
        console.error(
          "Resposta sem token ou usuário:",
          dados
        );

        setErroLogin("A API não retornou os dados necessários para o login.");
        return;
      }

      setToken(dados.token);
      setUsuarioAtual(dados.usuario);

      console.log("LOGIN REALIZADO COM SUCESSO");
      console.log("Login confirmado para o usuário:", dados.usuario.id);

      setLogado(true);
      setTelaAtual("home");
    } catch (erro) {
      console.error("ERRO REAL NO LOGIN:", erro);

      setErroLogin(API_CONNECTION_MESSAGE);
    } finally {
      setCarregando(false);
    }
  }

  function iniciarLoginSocial(provedor: "Google" | "Facebook") {
    Alert.alert(
      `Login com ${provedor}`,
      "Para ativar o login social, configure as credenciais OAuth do provedor, a validação no backend e gere um development build. O Expo Go não consegue concluir o redirecionamento de login social neste projeto. Use e-mail e senha por enquanto."
    );
  }

  // ===================================================
  // LOGOUT
  // ===================================================

  function fazerLogout() {

    setLogado(false);

    setToken(null);

    setUsuarioAtual(null);

    setEmail("");

    setSenha("");
    setErroLogin("");

    setTelaAtual("home");

  }

  // ===================================================
  // NAVEGAÇÃO
  // ===================================================

  function navegar(screen: Screen) {

    setTelaAtual(screen);

  }

  function irParaHome() {

    setTelaAtual("home");

  }

  function irParaExplorar() {

    setTelaAtual("explorar");

  }

  function irParaCriar() {

    setTelaAtual("criar");

  }

  function irParaComunidades() {

    setTelaAtual("comunidades");

  }

  function irParaPerfil() {

    setTelaAtual("perfil");

  }

  // ===================================================
  // PROPRIEDADES DE NAVEGAÇÃO
  // ===================================================

  const propriedadesNavegacao = {

    isDark: modoEscuro,

    onToggleTheme: () =>
      setModoEscuro(
        valor => !valor
      ),

    onNavigate: navegar,

    onHome: irParaHome,

    onExplore: irParaExplorar,

    onCommunities: irParaComunidades,

    onProfile: irParaPerfil,

    onCreate: irParaCriar,

    colors,

  };

  // ===================================================
  // TELA DE CADASTRO
  // ===================================================

  if (telaCadastro) {

    return (

      <SafeAreaProvider>

        <CadastroScreen
          voltarParaLogin={() =>
            setTelaCadastro(false)
          }
        />

      </SafeAreaProvider>

    );

  }

  // ===================================================
  // TELA DE LOGIN
  // ===================================================

  if (!logado) {

    return (

      <SafeAreaProvider>

        <SafeAreaView
          style={[
            styles.loginContainer,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >

          <KeyboardAvoidingView
            style={{ flex: 1 }}

            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >

            <ScrollView
              contentContainerStyle={
                styles.loginScroll
              }
              keyboardShouldPersistTaps="handled"
            >

              {/* LOGO */}

              <Image
                source={
                 require("../assets/Logo-Petgram.jpeg")
                }
                style={styles.logo}
              />

              {/* TÍTULO */}

              <Text
                style={[
                  styles.titulo,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Bem-vindo ao Petgram
              </Text>


              {/* E-MAIL */}

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                placeholder="E-mail"
                placeholderTextColor={
                  colors.muted
                }
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={
                  setEmail
                }
              />

              {/* SENHA */}

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                placeholder="Senha"
                placeholderTextColor={
                  colors.muted
                }
                secureTextEntry
                value={senha}
                onChangeText={
                  setSenha
                }
              />

              {!!erroLogin && (
                <Text accessibilityRole="alert" style={{ color: "#B42318", marginBottom: 12, fontWeight: "600" }}>
                  {erroLogin}
                </Text>
              )}

              {/* LOGIN */}

              <TouchableOpacity
                style={[
                  styles.botaoLogin,
                  {
                    backgroundColor:
                      colors.gold,
                  },
                ]}
                onPress={fazerLogin}
                disabled={carregando}
              >

                <Text
                  style={styles.textoBotao}
                >
                  {carregando
                    ? "Entrando..."
                    : "Entrar"}
                </Text>

              </TouchableOpacity>

              <View style={styles.divisorContainer}>
                <View style={[styles.linha, { backgroundColor: colors.border }]} />
                <Text style={{ color: colors.muted, marginHorizontal: 13 }}>ou entre com</Text>
                <View style={[styles.linha, { backgroundColor: colors.border }]} />
              </View>
              <View style={styles.socialRow}>
                <TouchableOpacity accessibilityLabel="Entrar com Google" accessibilityRole="button" style={[styles.socialCircle, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => iniciarLoginSocial("Google")}>
                 <Image source={require("../assets/google.png")} style={styles.socialIcon} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity accessibilityLabel="Entrar com Facebook" accessibilityRole="button" style={[styles.socialCircle, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => iniciarLoginSocial("Facebook")}>
                  <Image source={require("../assets/facebook.png")} style={styles.socialIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              {/* CADASTRO */}

              <TouchableOpacity
                onPress={() =>
                  setTelaCadastro(true)
                }
              >

                <Text
                  style={[
                    styles.cadastroTexto,
                    {
                      color: colors.text,
                    },
                  ]}
                >

                  Não possui uma conta?{" "}

                  <Text
                    style={{
                      color: colors.gold,
                      fontWeight: "bold",
                    }}
                  >
                    Cadastre-se
                  </Text>

                </Text>

              </TouchableOpacity>

            </ScrollView>

          </KeyboardAvoidingView>

        </SafeAreaView>

      </SafeAreaProvider>

    );

  }

  // ===================================================
  // USUÁRIO LOGADO
  // ===================================================

  return (

    <SafeAreaProvider>

      {telaAtual === "home" && (

        <HomeScreen

          isDark={modoEscuro}

          setIsDark={
            setModoEscuro
          }

          irParaHome={
            irParaHome
          }

          irParaExplorar={
            irParaExplorar
          }

          irParaCriarPost={
            irParaCriar
          }

          irParaComunidades={
            irParaComunidades
          }

          irParaPerfil={
            irParaPerfil
          }

          usuarioId={
            usuarioAtual?.id ?? 0
          }

          token={
            token ?? ""
          }

        />

      )}

      {telaAtual === "explorar" && (

        <ExplorarScreen
          {...propriedadesNavegacao}
        />

      )}

      {telaAtual === "criar" && (

        <CriarPostScreen
          {...propriedadesNavegacao}
          usuarioId={usuarioAtual?.id ?? 0}
          token={token ?? ""}
        />

      )}

      {telaAtual === "comunidades" && (
  <ComunidadeScreen
    {...propriedadesNavegacao}
    usuarioId={usuarioAtual?.id ?? 0}
    token={token ?? ""}
    onAbrirComunidade={(comunidade) => {
      setComunidadeSelecionada(comunidade);
      setTelaAtual("comunidadeDetalhes");
    }}
  />
)}

{telaAtual === "comunidadeDetalhes" &&
  comunidadeSelecionada && (
    <ComunidadeDetalheScreen
      comunidade={comunidadeSelecionada}
      usuarioId={usuarioAtual?.id ?? 0}
      isDark={modoEscuro}
      voltar={() => {
        setTelaAtual("comunidades");
      }}
    />
  )}

{telaAtual === "criarComunidade" && (
  <CriarComunidadeScreen
    isDark={modoEscuro}
    usuarioId={usuarioAtual?.id ?? 0}
    token={token ?? ""}
    colors={colors}
    onVoltar={() => {
      setTelaAtual("comunidades");
    }}
  />
)}
      {telaAtual === "perfil" && (

        <PerfilScreen
          {...propriedadesNavegacao}
          usuarioId={usuarioAtual?.id ?? 0}
          token={token ?? ""}
          onLogout={fazerLogout}
        />

      )}

      {telaAtual === "pets" && (
        <PetsScreen usuarioId={usuarioAtual?.id ?? 0} isDark={modoEscuro} onNavigate={navegar} />
      )}

    </SafeAreaProvider>

  );

}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  loginContainer: {
    flex: 1,
  },

  loginScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  logo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: "center",
    marginBottom: 20,
  },

  titulo: {
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
  },

  botaoLogin: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 20,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  cadastroTexto: {
    textAlign: "center",
    fontSize: 15,
  },

  divisorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  linha: {
    flex: 1,
    height: 1,
  },

  botaoSocial: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 22,
  },
  socialCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 31,
    height: 31,
  },

});
