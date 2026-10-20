import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  isDark?: boolean;
  onVoltar?: () => void;
  titulo?: string;
}

export default function SecondaryScreen({
  isDark = false,
  onVoltar,
  titulo = "Petgram",
}: Props) {
  const background = isDark
    ? "#211F1A"
    : "#F7F3EA";

  const text = isDark
    ? "#FFFFFF"
    : "#211F1A";

  const gold = "#D9A82E";

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: background },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.titulo,
            { color: text },
          ]}
        >
          {titulo}
        </Text>

        <Text
          style={[
            styles.texto,
            { color: text },
          ]}
        >
          Esta é uma tela secundária do Petgram.
        </Text>

        {onVoltar && (
          <TouchableOpacity
            style={[
              styles.botao,
              { backgroundColor: gold },
            ]}
            onPress={onVoltar}
          >
            <Text style={styles.botaoTexto}>
              VOLTAR
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },

  texto: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
  },

  botao: {
    width: 180,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  botaoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});