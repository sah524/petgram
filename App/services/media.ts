
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "./api";

export type FotoSelecionada = {
  uri: string;
  base64: string;
};

// =====================================================
// MONTAR URL DA IMAGEM
// =====================================================

export function imageUrl(
  value?: string | null
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_URL}${value}`;
  }

  return value;
}

// =====================================================
// ESCOLHER UMA IMAGEM
// =====================================================

export async function escolherImagem(
  camera = false
): Promise<FotoSelecionada | null> {
  const fotos = await escolherImagens(camera, 1);

  return fotos[0] || null;
}

// =====================================================
// ESCOLHER ATÉ 5 IMAGENS
// =====================================================

export async function escolherImagens(
  camera = false,
  limite = 5
): Promise<FotoSelecionada[]> {
  if (limite <= 0) {
    return [];
  }

  // Permissão da câmera
  if (camera) {
    const permissao =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      throw new Error(
        "Permita o uso da câmera para tirar uma foto."
      );
    }
  }

  // Configuração da seleção
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.6,
    base64: true,
    allowsMultipleSelection: !camera && limite > 1,
    selectionLimit: camera ? 1 : limite,
  };

  // Abrir câmera ou galeria
  const resultado = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

  if (
    resultado.canceled ||
    !resultado.assets?.length
  ) {
    return [];
  }

  // Validar e retornar as fotos
  return resultado.assets
    .slice(0, limite)
    .map((foto) => {
      if (!foto.base64) {
        throw new Error(
          "Não foi possível ler uma das imagens selecionadas."
        );
      }

      return {
        uri: foto.uri,
        base64: foto.base64,
      };
    });
}

// =====================================================
// ENVIAR IMAGEM PARA O BACKEND
// =====================================================

export async function enviarImagem(
  base64: string
): Promise<string> {
  const url = `${API_URL}/uploads/image`;

  try {
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

    // Ler resposta
    const texto = await response.text();

    if (!texto.trim()) {
      throw new Error(
        `O servidor respondeu vazio no upload (${response.status}).`
      );
    }

    // Converter para JSON
    let data: any;

    try {
      data = JSON.parse(texto);
    } catch {
      throw new Error(
        `A rota de upload respondeu em formato inválido (${response.status}).`
      );
    }

    // Validar resposta HTTP
    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Falha no upload da foto (${response.status}).`
      );
    }

    // Validar imagem retornada
    if (!data?.imagem) {
      throw new Error(
        "O servidor não retornou o endereço da imagem."
      );
    }

    return data.imagem;
  } catch (erro) {
    console.error(
      "ERRO NO UPLOAD:",
      erro
    );

    if (erro instanceof Error) {
      throw erro;
    }

    throw new Error(
      "Não foi possível enviar a foto."
    );
  }
}
