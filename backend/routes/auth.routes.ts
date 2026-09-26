import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database";

const router = Router();

type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  foto_perfil: string | null;
};

// ================================
// CADASTRO
// POST /auth/register
// ================================

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, pet } = req.body || {};

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A senha deve possuir pelo menos 6 caracteres.",
      });
    }
    if (!pet || !String(pet.nome || "").trim() || !String(pet.especie || "").trim()) {
      return res.status(400).json({ success: false, message: "Informe nome e espécie do pet." });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const [usuarios] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [emailNormalizado]
    );

    if ((usuarios as any[]).length > 0) {
      return res.status(409).json({
        success: false,
        message: "Este e-mail já está cadastrado.",
      });
    }

    // Cria o hash da senha antes de salvar no banco
    const senhaHash = await bcrypt.hash(senha, 12);

    const connection = await pool.getConnection();
    let resultado: any;
    try {
      await connection.beginTransaction();
      [resultado] = await connection.execute(
      `
      INSERT INTO usuarios
      (nome, email, senha_hash)
      VALUES (?, ?, ?)
      `,
      [nome.trim(), emailNormalizado, senhaHash]
      );
      await connection.execute(
        "INSERT INTO pets (usuario_id, nome, especie, raca, bio, foto_perfil) VALUES (?, ?, ?, ?, ?, ?)",
        [resultado.insertId, String(pet.nome).trim(), String(pet.especie).trim(), String(pet.raca || "").trim() || null, String(pet.bio || "").trim() || null, pet.foto_perfil || null]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      usuario: {
        id: resultado.insertId,
        nome: nome.trim(),
        email: emailNormalizado,
      },
    });
  } catch (error: any) {
    console.error("========== ERRO NO CADASTRO ==========");
    console.error(error);
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
    console.error("SQL:", error.sql);
    console.error("======================================");

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
      erro: error.message,
      codigo: error.code,
    });
  }
});

// ================================
// LOGIN
// POST /auth/login
// ================================

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const [resultado] = await pool.query(
      `
      SELECT
        id,
        nome,
        email,
        senha_hash,
        foto_perfil
      FROM usuarios
      WHERE email = ?
      LIMIT 1
      `,
      [emailNormalizado]
    );

    const usuarios = resultado as Usuario[];

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    const usuario = usuarios[0];

    // Compara a senha digitada com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou senha inválidos.",
      });
    }

    // Verifica se o JWT_SECRET existe
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET não configurado.");
    }

    // Cria o token do usuário
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        foto_perfil: usuario.foto_perfil,
      },
    });
  } catch (error: any) {
    console.error("========== ERRO NO LOGIN ==========");
    console.error(error);
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
    console.error("SQL:", error.sql);
    console.error("===================================");

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
      erro: error.message,
      codigo: error.code,
    });
  }
});

export default router;
