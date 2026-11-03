import { request } from "../services/http";
import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Image,
} from "react-native";

import {
  API_URL,
  API_CONNECTION_MESSAGE,
} from "../services/api";

import {
  escolherImagem,
  enviarImagem,
} from "../services/media";

// =====================================================
// PROPS
// =====================================================

type Props = {
  voltarParaLogin: () => void;
};

// =====================================================
// COMPONENTE
// =====================================================

export default function CadastroScreen({
  voltarParaLogin,
}: Props) {
  // ===================================================
  // DADOS DO USUÁRIO
  // ===================================================

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  // ===================================================
  // DADOS DO PET
  // ===================================================

  const [petNome, setPetNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");

  const [petFoto, setPetFoto] = useState<{
    uri: string;
    base64: string;
  } | null>(null);

  // ===================================================
  // ESTADOS DA TELA
  // ===================================================

  const [carregando, setCarregando] =
    useState(false);

  const [erroCadastro, setErroCadastro] =
    useState("");

  // ===================================================
  // ESCOLHER FOTO
  // ===================================================

  const selecionarFoto = async () => {
    try {
      setErroCadastro("");

      const foto = await escolherImagem();

      if (foto) {
        setPetFoto(foto);
      }
    } catch (erro) {
      console.error(
        "Erro ao escolher foto:",
        erro
      );

      setErroCadastro(
        erro instanceof Error
          ? erro.message
          : "Erro ao escolher foto."
      );
    }
  };

  // ===================================================
  // CADASTRO
  // ===================================================

  const fazerCadastro = async () => {
    setErroCadastro("");

    // =================================================
    // VALIDAÇÃO
    // =================================================

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha ||
      !confirmarSenha ||
      !petNome.trim() ||
      !especie.trim()
    ) {
      setErroCadastro(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    if (senha.length < 6) {
      setErroCadastro(
        "A senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    if (senha !== confirmarSenha) {
      setErroCadastro(
        "As senhas não são iguais."
      );

      return;
    }

    // =================================================
    // INICIAR CADASTRO
    // =================================================

    try {
      setCarregando(true);

      // =================================================
      // UPLOAD DA FOTO
      // =================================================

      let foto_perfil: string | null = null;

      if (petFoto) {
        try {
          foto_perfil = await enviarImagem(
            petFoto.base64
          );
        } catch (erro) {
          console.error(
            "Erro ao enviar foto:",
            erro
          );

          throw new Error(
            erro instanceof Error
              ? erro.message
              : "Não foi possível enviar a foto do pet."
          );
        }
      }

      // =================================================
      // URL DO CADASTRO
      // =================================================

      const urlCadastro =
        `${API_URL}/auth/register`;

      console.log(
        "URL de cadastro:",
        urlCadastro
      );

      // =================================================
      // REQUISIÇÃO
      // =================================================

      const resposta = await request(
        urlCadastro,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            nome:
              nome.trim(),

            email:
              email
                .trim()
                .toLowerCase(),

            senha,

            pet: {
              nome:
                petNome.trim(),

              especie:
                especie.trim(),

              raca:
                raca.trim(),

              foto_perfil,
            },
          }),
        }
      );

      console.log(
        "Status do cadastro:",
        resposta.status
      );

      // =================================================
      // LER RESPOSTA COMO TEXTO PRIMEIRO
      // =================================================
      //
      // Não usamos resposta.json() diretamente.
      //
      // Se o servidor devolver HTML, como uma página 404,
      // isso evita:
      //
      // JSON Parse error: Unexpected character: <
      // =================================================

      const textoResposta =
        await resposta.text();

      console.log(
        "Resposta bruta do cadastro:",
        textoResposta
      );

      // =================================================
      // TENTAR CONVERTER PARA JSON
      // =================================================

      let dados: any = null;

      if (textoResposta.trim()) {
        try {
          dados =
            JSON.parse(textoResposta);
        } catch {
          console.error(
            "A API não retornou JSON.",
            {
              status:
                resposta.status,

              url:
                urlCadastro,

              resposta:
                textoResposta.substring(
                  0,
                  300
                ),
            }
          );

          throw new Error(
            `A rota de cadastro respondeu de forma inválida (${resposta.status}).`
          );
        }
      }

      // =================================================
      // ERRO HTTP
      // =================================================

      if (!resposta.ok) {
        const mensagem =
          dados?.message ||
          dados?.erro ||
          `Erro ao realizar cadastro (${resposta.status}).`;

        throw new Error(
          mensagem
        );
      }

      // =================================================
      // VALIDAR RESPOSTA
      // =================================================

      if (
        dados?.success === false
      ) {
        throw new Error(
          dados.message ||
            "Não foi possível realizar o cadastro."
        );
      }

      // =================================================
      // CADASTRO REALIZADO
      // =================================================

      console.log(
        "CADASTRO REALIZADO COM SUCESSO"
      );

      // Limpar formulário

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");

      setPetNome("");
      setEspecie("");
      setRaca("");
      setPetFoto(null);

      // =================================================
      // WEB
      // =================================================

      if (Platform.OS === "web") {
        voltarParaLogin();
        return;
      }

      // =================================================
      // MOBILE
      // =================================================

      const nomeUsuario =
        dados?.usuario?.nome ||
        nome.trim();

      Alert.alert(
        "Cadastro realizado!",
        `Bem-vindo(a), ${nomeUsuario}!`,
        [
          {
            text: "Entrar",
            onPress:
              voltarParaLogin,
          },
        ]
      );
    } catch (erro) {
      console.error(
        "Erro ao fazer cadastro:",
        erro
      );

      // =================================================
      // MOSTRAR ERRO REAL
      // =================================================

      if (erro instanceof Error) {
        // Erros gerados pela própria tela/API
        if (
          erro.message &&
          erro.message !==
            "Network request failed" &&
          !erro.message.includes(
            "Failed to fetch"
          )
        ) {
          setErroCadastro(
            erro.message
          );

          return;
        }
      }

      // Erro de conexão

      setErroCadastro(
        API_CONNECTION_MESSAGE
      );
    } finally {
      setCarregando(false);
    }
  };

  // =====================================================
  // TELA
  // =====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F3EA"
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =============================================
            LOGO
        ============================================= */}

        <View
          style={styles.nomeLogo}
        >
          <Text style={styles.pet}>
            Pet
          </Text>

          <Text style={styles.gram}>
            Gram
          </Text>
        </View>

        <Text
          style={styles.subtitulo}
        >
          Aqui seu pet brilha de likes!
        </Text>

        <Text style={styles.titulo}>
          Criar conta
        </Text>

        {/* =============================================
            FORMULÁRIO
        ============================================= */}

        <View
          style={styles.formulario}
        >
          {/* NOME */}

          <Text style={styles.label}>
            Nome *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#99938A"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          {/* E-MAIL */}

          <Text style={styles.label}>
            E-mail *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#99938A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* SENHA */}

          <Text style={styles.label}>
            Senha *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#99938A"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* CONFIRMAR SENHA */}

          <Text style={styles.label}>
            Confirmar senha *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#99938A"
            value={confirmarSenha}
            onChangeText={
              setConfirmarSenha
            }
            secureTextEntry
            autoCapitalize="none"
          />

          {/* ===========================================
              PET
          =========================================== */}

          <Text style={styles.label}>
            Nome do pet *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do pet"
            placeholderTextColor="#99938A"
            value={petNome}
            onChangeText={setPetNome}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            Espécie *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: cachorro, gato"
            placeholderTextColor="#99938A"
            value={especie}
            onChangeText={setEspecie}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            Raça (opcional)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Raça do pet"
            placeholderTextColor="#99938A"
            value={raca}
            onChangeText={setRaca}
            autoCapitalize="words"
          />

          {/* ===========================================
              FOTO DO PET
          =========================================== */}

          <TouchableOpacity
            style={
              styles.botaoFoto
            }
            onPress={
              selecionarFoto
            }
            disabled={carregando}
          >
            <Text
              style={
                styles.textoBotaoFoto
              }
            >
              {petFoto
                ? "Trocar foto do pet"
                : "Escolher foto do pet (opcional)"}
            </Text>
          </TouchableOpacity>

          {petFoto && (
            <View
              style={
                styles.fotoContainer
              }
            >
              <Image
                source={{
                  uri: petFoto.uri,
                }}
                style={styles.fotoPet}
                resizeMode="cover"
              />

              <TouchableOpacity
                onPress={() =>
                  setPetFoto(null)
                }
                disabled={carregando}
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

          {/* ===========================================
              ERRO
          =========================================== */}

          {!!erroCadastro && (
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
                {erroCadastro}
              </Text>
            </View>
          )}

          {/* ===========================================
              CRIAR CONTA
          =========================================== */}

          <TouchableOpacity
            style={[
              styles.botao,

              carregando &&
                styles.botaoDesabilitado,
            ]}
            onPress={fazerCadastro}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.textoBotao
                }
              >
                CRIAR CONTA
              </Text>
            )}
          </TouchableOpacity>

          {/* ===========================================
              LOGIN
          =========================================== */}

          <View
            style={
              styles.loginContainer
            }
          >
            <Text
              style={
                styles.textoLogin
              }
            >
              Já possui uma conta?
            </Text>

            <TouchableOpacity
              onPress={
                voltarParaLogin
              }
              disabled={carregando}
            >
              <Text
                style={
                  styles.linkLogin
                }
              >
                Entrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
      backgroundColor:
        "#F7F3EA",
    },

    content: {
      flexGrow: 1,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 30,
      paddingVertical: 30,
    },

    // LOGO

    nomeLogo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    pet: {
      fontSize: 32,
      fontWeight: "700",
      color: "#211F1A",
    },

    gram: {
      fontSize: 32,
      fontWeight: "700",
      color: "#D9A82E",
    },

    subtitulo: {
      fontSize: 15,
      color: "#777168",
      marginBottom: 25,
      textAlign: "center",
    },

    titulo: {
      fontSize: 26,
      fontWeight: "700",
      color: "#211F1A",
      marginBottom: 10,
    },

    // FORMULÁRIO

    formulario: {
      width: "100%",
      maxWidth: 400,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#211F1A",
      marginBottom: 7,
      marginTop: 12,
    },

    input: {
      width: "100%",
      height: 50,
      backgroundColor:
        "#FFFDF8",
      borderWidth: 1,
      borderColor: "#E7E0D3",
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 15,
      color: "#211F1A",
    },

    // FOTO

    botaoFoto: {
      width: "100%",
      minHeight: 50,
      backgroundColor:
        "#FFFDF8",
      borderWidth: 1,
      borderColor: "#D9A82E",
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems: "center",
      marginTop: 18,
      paddingHorizontal: 15,
    },

    textoBotaoFoto: {
      color: "#A77B12",
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },

    fotoContainer: {
      alignItems: "center",
      marginTop: 15,
    },

    fotoPet: {
      height: 130,
      width: 130,
      borderRadius: 65,
      borderWidth: 2,
      borderColor: "#D9A82E",
    },

    removerFoto: {
      color: "#B42318",
      fontSize: 13,
      fontWeight: "600",
      marginTop: 8,
    },

    // ERRO

    erroContainer: {
      marginTop: 15,
      padding: 12,
      borderRadius: 10,
      backgroundColor:
        "#FEECEB",
    },

    erroTexto: {
      color: "#B42318",
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },

    // BOTÃO

    botao: {
      width: "100%",
      height: 50,
      backgroundColor:
        "#D9A82E",
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems: "center",
      marginTop: 25,
    },

    botaoDesabilitado: {
      opacity: 0.7,
    },

    textoBotao: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    // LOGIN

    loginContainer: {
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 10,
    },

    textoLogin: {
      color: "#777168",
      fontSize: 14,
    },

    linkLogin: {
      color: "#D9A82E",
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 5,
    },
  });