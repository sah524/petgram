import express from "express";
import cors from "cors";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

import postsRoutes from "./routes/posts.routes";
import authRoutes from "./routes/auth.routes";
import petsRoutes from "./routes/pets.routes";
import perfilRoutes from "./routes/perfil.routes";
import comunidadeRoutes from "./routes/comunidades.routes";
import seguidoresRoutes from "./routes/seguidores.routes";
import adminRoutes from "./routes/admin.routes";

import { pool } from "./database";

// =====================================================
// CONFIGURAÇÃO DO CLOUDINARY
// =====================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("CONFIGURAÇÃO CLOUDINARY:", {
  cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
});

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(cors());

// =====================================================
// UPLOADS ANTIGOS
// Mantém acesso às imagens que ainda estão localmente
// =====================================================

const uploadsDir = path.resolve(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadsDir));

// =====================================================
// UPLOAD DE IMAGEM
// =====================================================

app.post(
  "/uploads/image",
  express.json({
    limit: "20mb",
  }),
  async (req, res) => {
    try {
      const encoded = String(req.body?.base64 || "");

      // Verificar se recebeu a imagem
      if (!encoded) {
        return res.status(400).json({
          success: false,
          message: "Nenhuma imagem foi enviada.",
        });
      }

      // Validar Base64
      if (
        !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) ||
        encoded.length > 7_000_000
      ) {
        return res.status(400).json({
          success: false,
          message: "Imagem inválida ou maior que 5 MB.",
        });
      }

      // Converter Base64
      const bytes = Buffer.from(encoded, "base64");

      // Limite de 5 MB
      if (bytes.length > 5_000_000) {
        return res.status(400).json({
          success: false,
          message: "Imagem maior que 5 MB.",
        });
      }

      // Identificar tipo da imagem
      let type = "";

      // JPG / JPEG
      if (bytes.subarray(0, 3).toString("hex") === "ffd8ff") {
        type = "jpg";
      }

      // PNG
      else if (bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
        type = "png";
      }

      // WEBP
      else if (
        bytes.subarray(0, 4).toString() === "RIFF" &&
        bytes.subarray(8, 12).toString() === "WEBP"
      ) {
        type = "webp";
      }

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "Use uma foto JPG, PNG ou WebP.",
        });
      }

      // Enviar imagem para o Cloudinary
      const resultado = await cloudinary.uploader.upload(
        `data:image/${type};base64,${encoded}`,
        {
          folder: "petgram",
          resource_type: "image",
        },
      );

      // Retornar endereço permanente da imagem
      return res.status(201).json({
        success: true,
        imagem: resultado.secure_url,
      });
    } catch (error) {
      console.error("ERRO AO ENVIAR IMAGEM PARA O CLOUDINARY:", error);

      return res.status(500).json({
        success: false,
        message: "Falha ao enviar imagem.",
      });
    }
  },
);

// =====================================================
// CONFIGURAÇÃO DO EXPRESS
// =====================================================

app.use(
  express.json({
    limit: "20mb",
  }),
);

app.use(
  express.urlencoded({
    limit: "20mb",
    extended: true,
  }),
);

// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get("/", (_req, res) => {
  return res.json({
    success: true,
    message: "🐾 API do PetGram funcionando!",
  });
});

// =====================================================
// TESTE DO BANCO
// =====================================================

app.get("/health/db", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.json({
      success: true,
      message: "Conexão com MySQL ativa.",
    });
  } catch (error) {
    console.error("Falha na conexão com MySQL:", error);

    return res.status(503).json({
      success: false,
      message:
        "Não foi possível conectar ao MySQL. Confira backend/.env e o serviço do banco.",
    });
  }
});

// =====================================================
// ROTAS DA API
// =====================================================

// AUTENTICAÇÃO
app.use("/auth", authRoutes);

// PUBLICAÇÕES
app.use("/posts", postsRoutes);

// PETS
app.use("/pets", petsRoutes);

// PERFIL
app.use("/perfil", perfilRoutes);

// SEGUIDORES
app.use("/seguidores", seguidoresRoutes);

// ADMIN
app.use("/admin", adminRoutes);

// COMUNIDADES
app.use("/comunidades", comunidadeRoutes);

// =====================================================
// ROTA 404
// =====================================================

app.use((req, res) => {
  console.log(`ROTA NÃO ENCONTRADA: ${req.method} ${req.originalUrl}`);

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
