import * as ImagePicker from "expo-image-picker";
import { API_URL } from "./api";

// =====================================================
// MONTAR URL DA IMAGEM
// =====================================================

export function imageUrl(
  value?: string | null
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Imagem salva pelo nosso backend
  if (value.startsWith("/uploads/")) {
    return `${API_URL}${value}`;
  }

  // URL externa ou URI local
  return value;
}

// =====================================================
// ESCOLHER IMAGEM
// =====================================================

export async function escolherImagem(
  camera = false
): Promise<{
  uri: string;
  base64: string;
} | null> {
  // ===================================================
  // PERMISSÃO DA CÂMERA
  // ===================================================

  if (camera) {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      throw new Error(
        "Permita o uso da câmera para tirar uma foto."
      );
    }
  }

  // ===================================================
  // CONFIGURAÇÃO
  // ===================================================

  const options = {
    mediaTypes: ["images"] as ["images"],
    quality: 0.6,
    base64: true,
  };

  // ===================================================
  // ABRIR CÂMERA OU GALERIA
  // ===================================================

  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  // Usuário cancelou
  if (
    result.canceled ||
    !result.assets?.length
  ) {
    return null;
  }

  const photo = result.assets[0];

  // ===================================================
  // VALIDAR BASE64
  // ===================================================

  if (!photo.base64) {
    throw new Error(
      "Não foi possível ler a imagem selecionada."
    );
  }

  return {
    uri: photo.uri,
    base64: photo.base64,
  };
}

// =====================================================
// ENVIAR IMAGEM PARA O BACKEND
// =====================================================

export async function enviarImagem(
  base64: string
): Promise<string> {
  const url = `${API_URL}/uploads/image`;

  console.log(
    "=================================="
  );

  console.log(
    "📷 ENVIANDO FOTO"
  );

  console.log(
    "URL do upload:",
    url
  );

  console.log(
    "API_URL:",
    API_URL
  );

  console.log(
    "=================================="
  );

  try {
    // =================================================
    // REQUISIÇÃO
    // =================================================

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        base64,
      }),
    });

    // =================================================
    // LER PRIMEIRO COMO TEXTO
    // =================================================

    const texto =
      await response.text();

    console.log(
      "Status do upload:",
      response.status
    );

    console.log(
      "Resposta bruta do upload:",
      texto.substring(0, 500)
    );

    // =================================================
    // VERIFICAR RESPOSTA VAZIA
    // =================================================

    if (!texto.trim()) {
      throw new Error(
        `O servidor respondeu vazio no upload (${response.status}).`
      );
    }

    // =================================================
    // CONVERTER PARA JSON
    // =================================================

    let data: any;

    try {
      data = JSON.parse(texto);
    } catch {
      console.error(
        "❌ A rota de upload NÃO retornou JSON."
      );

      console.error(
        "URL:",
        url
      );

      console.error(
        "Status:",
        response.status
      );

      console.error(
        "Resposta:",
        texto.substring(0, 500)
      );

      throw new Error(
        `A rota de upload respondeu em formato inválido (${response.status}).`
      );
    }

    // =================================================
    // ERRO HTTP
    // =================================================

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Falha no upload da foto (${response.status}).`
      );
    }

    // =================================================
    // VALIDAR CAMPO IMAGEM
    // =================================================

    if (!data?.imagem) {
      console.error(
        "Resposta do upload sem o campo imagem:",
        data
      );

      throw new Error(
        "O servidor não retornou o endereço da imagem."
      );
    }

    // =================================================
    // SUCESSO
    // =================================================

    console.log(
      "✅ FOTO ENVIADA COM SUCESSO:",
      data.imagem
    );

    return data.imagem;
  } catch (erro) {
    console.error(
      "❌ ERRO NO UPLOAD:",
      erro
    );

    // Preserva mensagens que criamos acima
    if (erro instanceof Error) {
      throw erro;
    }

    throw new Error(
      "Não foi possível enviar a foto."
    );
  }
}