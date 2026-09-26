import { Platform } from "react-native";

// Ajuste este IP se o IPv4 do computador mudar. A porta do backend é 3000.
const COMPUTER_IP = "192.168.1.102";
export const API_URL = Platform.OS === "web"
  ? "http://localhost:3000"
  : `http://${COMPUTER_IP}:3000`;

export const API_CONNECTION_MESSAGE =
  `Não foi possível conectar à API em ${API_URL}. Verifique se o backend está rodando, se o celular está na mesma rede Wi-Fi e se a porta 3000 está liberada no firewall.`;
