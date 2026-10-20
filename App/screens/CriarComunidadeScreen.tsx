import React, { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "../../Api/src/api";

type Props = {
  isDark: boolean;
  usuarioId: number;
  token: string;

  onVoltar: () => void;

  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    gold: string;
  };
};

export default function CriarComunidadeScreen({
  usuarioId,
  token,
  onVoltar,
  colors,
}: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function criarComunidade() {
    // =====================================================
    // VALIDAÇÕES
    // =====================================================

    if (!nome.trim()) {
      Alert.alert(
        "Atenção",
        "Digite o nome da comunidade."
      );
      return;
    }

    if (!descricao.trim()) {
      Alert.alert(
        "Atenção",
        "Digite uma descrição para a comunidade."
      );
      return;
    }

    if (!usuarioId) {
      Alert.alert(
        "Atenção",
        "Não foi possível identificar o usuário logado."
      );
      return;
    }

    try {
      setCarregando(true);

      console.log("Criando comunidade...");
      console.log("Usuário:", usuarioId);
      console.log(
        "URL:",
        `${API_URL}/comunidades`
      );

      // ===================================================
      // CRIAR COMUNIDADE
      // ===================================================

      const resposta = await fetch(
        `${API_URL}/comunidades`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            nome: nome.trim(),
            descricao: descricao.trim(),

            // IMPORTANTE:
            // O backend espera "usuario_id"
            usuario_id: usuarioId,
          }),
        }
      );

      // ===================================================
      // LER RESPOSTA
      // ===================================================

      const texto = await resposta.text();

      console.log(
        "Status criação comunidade:",
        resposta.status
      );

      console.log(
        "Resposta criação comunidade:",
        texto
      );

      let dados: any = {};

      if (texto) {
        try {
          dados = JSON.parse(texto);
        } catch {
          console.log(
            "Resposta recebida:",
            texto
          );
        }
      }

      // ===================================================
      // ERRO DA API
      // ===================================================

      if (!resposta.ok) {
        Alert.alert(
          "Não foi possível criar",
          dados.message ||
            dados.error ||
            "Não foi possível criar a comunidade."
        );

        return;
      }

      // ===================================================
      // SUCESSO
      // ===================================================

      setNome("");
      setDescricao("");

      Alert.alert(
        "Comunidade criada",
        dados.message ||
          "Sua comunidade foi criada com sucesso.",
        [
          {
            text: "OK",
            onPress: onVoltar,
          },
        ]
      );
    } catch (erro) {
      console.error(
        "Erro ao criar comunidade:",
        erro
      );

      Alert.alert(
        "Erro de conexão",
        "Não foi possível conectar ao servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={onVoltar}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.backIcon,
                {
                  color: colors.text,
                },
              ]}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              Criar comunidade
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.muted,
                },
              ]}
            >
              Crie um espaço para reunir pets com
              interesses em comum.
            </Text>
          </View>
        </View>

        {/* FORMULÁRIO */}

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Nome da comunidade
          </Text>

          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Amantes de Golden Retriever"
            placeholderTextColor={colors.muted}
            maxLength={80}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor:
                  colors.background,
                borderColor: colors.border,
              },
            ]}
          />

          <Text
            style={[
              styles.contador,
              {
                color: colors.muted,
              },
            ]}
          >
            {nome.length}/80
          </Text>

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Descrição
          </Text>

          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Conte um pouco sobre a comunidade..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={300}
            textAlignVertical="top"
            style={[
              styles.textArea,
              {
                color: colors.text,
                backgroundColor:
                  colors.background,
                borderColor: colors.border,
              },
            ]}
          />

          <Text
            style={[
              styles.contador,
              {
                color: colors.muted,
              },
            ]}
          >
            {descricao.length}/300
          </Text>

          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: colors.gold,
                opacity: carregando ? 0.6 : 1,
              },
            ]}
            onPress={criarComunidade}
            disabled={carregando}
          >
            <Text style={styles.createButtonText}>
              {carregando
                ? "Criando..."
                : "Criar comunidade"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    padding: 18,
    paddingTop: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backIcon: {
    fontSize: 32,
    lineHeight: 34,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },

  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  textArea: {
    minHeight: 130,
    borderWidth: 1,
    borderRadius: 13,
    padding: 14,
    fontSize: 14,
  },

  contador: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 5,
    marginBottom: 18,
  },

  createButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  createButtonText: {
    color: "#211F1A",
    fontSize: 15,
    fontWeight: "800",
  },
});