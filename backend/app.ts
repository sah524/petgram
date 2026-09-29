import express from "express";
import cors from "cors";

import postsRoutes from "./routes/posts.routes";
import authRoutes from "./routes/auth.routes";
import petsRoutes from "./routes/pets.routes";
import perfilRoutes from "./routes/perfil.routes";
import comunidadeRoutes from "./routes/comunidades.routes";

import { pool } from "./database";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(cors());

// =====================================================
// UPLOADS
// =====================================================

const uploadsDir = path.resolve(
  process.cwd(),
  "uploads"
);

// Permite acessar as imagens salvas pelo navegador/app
app.use(
  "/uploads",
  express.static(uploadsDir)
);

// =====================================================
// UPLOAD DE IMAGEM
// =====================================================

app.post(
  "/uploads/image",

  // Permite que a requisição Base64 chegue ao servidor.
  // O limite real da imagem continua sendo 5 MB,
  // validado abaixo.
  express.json({
    limit: "20mb",
  }),

  async (req, res) => {
    try {
      const encoded = String(
        req.body?.base64 || ""
      );

      // =================================================
      // VERIFICAR SE RECEBEU A IMAGEM
      // =================================================

      if (!encoded) {
        return res.status(400).json({
          success: false,
          message: "Nenhuma imagem foi enviada.",
        });
      }

      // =================================================
      // VALIDAR BASE64
      // =================================================

      if (
        !/^[A-Za-z0-9+/]+={0,2}$/.test(
          encoded
        ) ||
        encoded.length > 7_000_000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Imagem inválida ou maior que 5 MB.",
        });
      }

      // =================================================
      // CONVERTER BASE64
      // =================================================

      const bytes = Buffer.from(
        encoded,
        "base64"
      );

      // Máximo de 5 MB
      if (bytes.length > 5_000_000) {
        return res.status(400).json({
          success: false,
          message:
            "Imagem maior que 5 MB.",
        });
      }

      // =================================================
      // IDENTIFICAR TIPO DA IMAGEM
      // =================================================

      let type = "";

      // JPG / JPEG
      if (
        bytes
          .subarray(0, 3)
          .toString("hex") === "ffd8ff"
      ) {
        type = "jpg";
      }

      // PNG
      else if (
        bytes
          .subarray(0, 8)
          .toString("hex") ===
        "89504e470d0a1a0a"
      ) {
        type = "png";
      }

      // WEBP
      else if (
        bytes
          .subarray(0, 4)
          .toString() === "RIFF" &&
        bytes
          .subarray(8, 12)
          .toString() === "WEBP"
      ) {
        type = "webp";
      }

      // Tipo não permitido
      if (!type) {
        return res.status(400).json({
          success: false,
          message:
            "Use uma foto JPG, PNG ou WebP.",
        });
      }

      // =================================================
      // CRIAR PASTA DE UPLOAD
      // =================================================

      await mkdir(
        uploadsDir,
        {
          recursive: true,
        }
      );

      // =================================================
      // GERAR NOME ÚNICO
      // =================================================

      const filename =
        `${randomUUID()}.${type}`;

      // =================================================
      // SALVAR ARQUIVO
      // =================================================

      await writeFile(
        path.join(
          uploadsDir,
          filename
        ),
        bytes
      );

      // =================================================
      // RESPOSTA
      // =================================================

      return res.status(201).json({
        success: true,
        imagem: `/uploads/${filename}`,
      });
    } catch (error) {
      console.error(
        "ERRO AO SALVAR IMAGEM:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Falha ao salvar imagem.",
      });
    }
  }
);

// =====================================================
// CONFIGURAÇÃO DO EXPRESS
// =====================================================

// Aumenta o limite das requisições JSON.
// Isso evita:
// PayloadTooLargeError: request entity too large

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    limit: "20mb",
    extended: true,
  })
);

// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get("/", (_req, res) => {
  return res.json({
    success: true,
    message:
      "🐾 API do PetGram funcionando!",
  });
});

// =====================================================
// TESTE DO BANCO
// =====================================================

app.get(
  "/health/db",
  async (_req, res) => {
    try {
      await pool.query(
        "SELECT 1"
      );

      return res.json({
        success: true,
        message:
          "Conexão com MySQL ativa.",
      });
    } catch (error) {
      console.error(
        "Falha na conexão com MySQL:",
        error
      );

      return res
        .status(503)
        .json({
          success: false,
          message:
            "Não foi possível conectar ao MySQL. Confira backend/.env e o serviço do banco.",
        });
    }
  }
);

// =====================================================
// ROTAS DA API
// =====================================================

// AUTENTICAÇÃO
app.use(
  "/auth",
  authRoutes
);

// PUBLICAÇÕES
app.use(
  "/posts",
  postsRoutes
);

// PETS
app.use(
  "/pets",
  petsRoutes
);

// PERFIL
app.use(
  "/perfil",
  perfilRoutes
);

// COMUNIDADES
app.use(
  "/comunidades",
  comunidadeRoutes
);

// =====================================================
// ROTA 404
// =====================================================

// Essa rota precisa ficar DEPOIS de todas as outras.
// Ela ajuda a descobrir quando o aplicativo chama
// uma URL que não existe no backend.

app.use((req, res) => {
  console.log(
    `ROTA NÃO ENCONTRADA: ${req.method} ${req.originalUrl}`
  );

  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
    method: req.method,
    rota: req.originalUrl,
  });
});

// =====================================================
// EXPORT
// =====================================================

export default app;