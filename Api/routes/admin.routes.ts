
import {
  Router,
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { db, pool } from "../models/database";

const router = Router();

// =====================================================
// AUTENTICAÇÃO DO SUPERADMIN
// =====================================================

router.use(
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = /^Bearer (.+)$/i.exec(
      String(req.headers.authorization || "")
    )?.[1];

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Autenticação necessária.",
      });
    }

    try {
      const dados = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as jwt.JwtPayload;

      if (
        dados.role !== "superadmin" ||
        dados.email !== "admin@admin.com"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Acesso restrito ao superadmin.",
        });
      }

      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
      });
    }
  }
);

// =====================================================
// LISTAR USUÁRIOS
// GET /admin/usuarios
// =====================================================

router.get(
  "/usuarios",
  async (_req: Request, res: Response) => {
    try {
      const resultado = await db.execute(
        sql`
          SELECT
            id,
            nome,
            email
          FROM usuarios
          ORDER BY id DESC
        `
      );

      return res.json({
        success: true,
        usuarios: resultado[0],
      });
    } catch (error) {
      console.error(
        "ERRO ADMIN AO LISTAR USUÁRIOS:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Erro ao listar usuários.",
      });
    }
  }
);

// =====================================================
// LISTAR PUBLICAÇÕES COM IMAGENS REAIS
// GET /admin/posts
// =====================================================

router.get(
  "/posts",
  async (_req: Request, res: Response) => {
    try {
      const [rows] = await pool.query(
        `
          SELECT
            p.id,
            p.pet_id,
            p.imagem,
            p.legenda,
            p.criado_em,

            pet.nome AS pet_nome,
            pet.foto_perfil AS pet_foto_perfil,

            u.id AS usuario_id,
            u.nome AS usuario_nome

          FROM posts p

          LEFT JOIN pets pet
            ON pet.id = p.pet_id

          LEFT JOIN usuarios u
            ON u.id = pet.usuario_id

          ORDER BY p.id DESC
        `
      );

      const posts = rows as any[];

      const ids = posts.map(
        (post) => Number(post.id)
      );

      const imagensPorPost = new Map<
        number,
        string[]
      >();

      // Buscar imagens da galeria no MySQL
      if (ids.length > 0) {
        const placeholders = ids
          .map(() => "?")
          .join(",");

        const [galeria] = await pool.query(
          `
            SELECT
              post_id,
              imagem
            FROM post_imagens
            WHERE post_id IN (${placeholders})
            ORDER BY ordem ASC, id ASC
          `,
          ids
        );

        for (const foto of galeria as any[]) {
          const postId = Number(
            foto.post_id
          );

          const imagens =
            imagensPorPost.get(postId) || [];

          imagens.push(foto.imagem);

          imagensPorPost.set(
            postId,
            imagens
          );
        }
      }

      // Montar publicações com imagens reais
      const postsFormatados = posts.map(
        (post) => {
          const imagensGaleria =
            imagensPorPost.get(
              Number(post.id)
            ) || [];

          const imagens =
            imagensGaleria.length > 0
              ? imagensGaleria
              : post.imagem
                ? [post.imagem]
                : [];

          return {
            id: post.id,
            pet_id: post.pet_id,
            pet_nome: post.pet_nome,
            pet_foto_perfil:
              post.pet_foto_perfil,

            usuario_id:
              post.usuario_id,
            usuario_nome:
              post.usuario_nome,

            legenda: post.legenda,
            criado_em:
              post.criado_em,

            imagem:
              imagens[0] || null,

            imagens,

            quantidade_imagens:
              imagens.length,
          };
        }
      );

      return res.json({
        success: true,
        posts: postsFormatados,
      });
    } catch (error) {
      console.error(
        "ERRO ADMIN AO LISTAR PUBLICAÇÕES:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro ao listar publicações.",
      });
    }
  }
);

// =====================================================
// EXCLUIR PUBLICAÇÃO
// DELETE /admin/posts/:id
// =====================================================

router.delete(
  "/posts/:id",
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID inválido.",
      });
    }

    const conn =
      await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Excluir dados relacionados
      for (const tabela of [
        "curtidas",
        "comentarios",
        "publicacoes_salvas",
        "publicacoes_ocultas",
        "denuncias",
      ]) {
        await conn.query(
          `DELETE FROM ${tabela} WHERE post_id = ?`,
          [id]
        );
      }

      // Excluir imagens da galeria
      await conn.query(
        "DELETE FROM post_imagens WHERE post_id = ?",
        [id]
      );

      // Excluir publicação
      const [resultado] =
        await conn.query(
          "DELETE FROM posts WHERE id = ?",
          [id]
        );

      await conn.commit();

      return res.json({
        success: true,
        excluidos:
          (resultado as any).affectedRows,
      });
    } catch (error) {
      await conn.rollback();

      console.error(
        "ERRO ADMIN AO EXCLUIR PUBLICAÇÃO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível excluir a publicação.",
      });
    } finally {
      conn.release();
    }
  }
);

// =====================================================
// EXCLUIR USUÁRIO
// DELETE /admin/usuarios/:id
// =====================================================

router.delete(
  "/usuarios/:id",
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID inválido.",
      });
    }

    const conn =
      await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Buscar pets do usuário
      const [pets] = await conn.query(
        "SELECT id FROM pets WHERE usuario_id = ?",
        [id]
      );

      for (const pet of pets as {
        id: number;
      }[]) {
        // Buscar publicações de cada pet
        const [posts] = await conn.query(
          "SELECT id FROM posts WHERE pet_id = ?",
          [pet.id]
        );

        for (const post of posts as {
          id: number;
        }[]) {
          // Excluir relacionamentos
          for (const tabela of [
            "curtidas",
            "comentarios",
            "publicacoes_salvas",
            "publicacoes_ocultas",
            "denuncias",
            "post_imagens",
          ]) {
            await conn.query(
              `DELETE FROM ${tabela} WHERE post_id = ?`,
              [post.id]
            );
          }

          // Excluir publicação
          await conn.query(
            "DELETE FROM posts WHERE id = ?",
            [post.id]
          );
        }
      }

      // Excluir seguidores
      await conn.query(
        `
          DELETE FROM seguidores
          WHERE seguidor_id = ?
             OR seguido_id = ?
        `,
        [id, id]
      );

      // Excluir pets
      await conn.query(
        "DELETE FROM pets WHERE usuario_id = ?",
        [id]
      );

      // Excluir usuário
      const [resultado] =
        await conn.query(
          "DELETE FROM usuarios WHERE id = ?",
          [id]
        );

      await conn.commit();

      return res.json({
        success: true,
        excluidos:
          (resultado as any).affectedRows,
      });
    } catch (error) {
      await conn.rollback();

      console.error(
        "ERRO ADMIN AO EXCLUIR USUÁRIO:",
        error
      );

      return res.status(409).json({
        success: false,
        message:
          "Não foi possível excluir a conta. Verifique os relacionamentos no banco.",
      });
    } finally {
      conn.release();
    }
  }
);

// =====================================================
// EXPORT
// =====================================================

export default router;
