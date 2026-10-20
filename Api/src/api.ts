import { Platform } from "react-native";

// IPv4 atual do computador.
// Se o IPv4 mudar, altere apenas este valor.
const COMPUTER_IP = "10.167.209.128";

export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : `http://${COMPUTER_IP}:3000`;

export const API_CONNECTION_MESSAGE =
  `Não foi possível conectar à API em ${API_URL}. ` +
  `Verifique se o backend está rodando, se o celular está na mesma rede Wi-Fi ` +
  `e se a porta 3000 está liberada no firewall.`;