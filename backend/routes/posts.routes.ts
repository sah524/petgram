import { Router, Request, Response } from "express";

import { pool } from "../database";

const router = Router();

// =====================================================
// LISTAR PUBLICAÇÕES
// GET /posts?usuario_id=1&autor_id=2
// =====================================================

router.get("/", async (req: Request, res: Response) => {
  try {
    // Usado pelo HomeScreen para confirmar que está acessando
    // a versão nova da API.
    res.setHeader("X-Petgram-Build", "curtidas-v2");

    const usuarioId = Number(req.query.usuario_id) || 0;
    const autorId = Number(req.query.autor_id) || 0;

    const [posts] = await pool.query(
      `
        SELECT
          p.id,
          p.pet_id,
          p.imagem,
          p.legenda,
          p.criado_em,

          pet.nome AS pet_nome,
          pet.especie,
          pet.raca,

          -- FOTO DO PERFIL DO PET
          -- Não confundir com p.imagem, que é a foto da publicação.
          pet.foto_perfil AS pet_foto_perfil,

          u.id AS usuario_id,
          u.nome AS usuario_nome,

          (
            SELECT COUNT(*)
            FROM curtidas c
            WHERE c.post_id = p.id
          ) AS quantidade_curtidas,

          (
            SELECT COUNT(*)
            FROM comentarios co
            WHERE co.post_id = p.id
          ) AS quantidade_comentarios,

          CASE
            WHEN ? > 0 AND EXISTS (
              SELECT 1
              FROM curtidas mc
              WHERE mc.post_id = p.id
                AND mc.usuario_id = ?
            )
            THEN 1
            ELSE 0
          END AS curtido_por_mim

        FROM posts p

        INNER JOIN pets pet
          ON pet.id = p.pet_id

        INNER JOIN usuarios u
          ON u.id = pet.usuario_id

        WHERE (? = 0 OR u.id = ?)

        ORDER BY p.criado_em DESC
      `,
      [
        usuarioId,
        usuarioId,
        autorId,
        autorId,
      ]
    );

    const postsFormatados = (posts as any[]).map(
      (post) => ({
        id: post.id,
        pet_id: post.pet_id,

        // FOTO DA PUBLICAÇÃO
        imagem: post.imagem,

        legenda: post.legenda,
        criado_em: post.criado_em,

        pet: {
          nome: post.pet_nome,
          especie: post.especie,
          raca: post.raca,

          // FOTO FIXA DO PERFIL DO PET
          foto_perfil: post.pet_foto_perfil,
        },

        usuario: {
          id: post.usuario_id,
          nome: post.usuario_nome,
        },

        curtidas: Number(
          post.quantidade_curtidas || 0
        ),

        comentarios: Number(
          post.quantidade_comentarios || 0
        ),

        curtido_por_mim:
          Number(post.curtido_por_mim) === 1,
      })
    );

    return res.json({
      success: true,
      posts: postsFormatados,
    });
  } catch (error: any) {
    console.error(
      "ERRO AO LISTAR PUBLICAÇÕES:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Erro interno ao listar publicações.",
      erro: error.message,
    });
  }
});

// =====================================================
// CURTIR PUBLICAÇÃO
// POST /posts/:postId/curtir
// BODY: { usuario_id }
// =====================================================

router.post(
  "/:postId/curtir",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!postId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "postId e usuario_id são obrigatórios.",
        });
      }

      // Verifica se o post existe
      const [posts] = await pool.query(
        `
          SELECT id
          FROM posts
          WHERE id = ?
          LIMIT 1
        `,
        [postId]
      );

      if ((posts as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Publicação não encontrada.",
        });
      }

      // Verifica se o usuário existe
      const [usuarios] = await pool.query(
        `
          SELECT id
          FROM usuarios
          WHERE id = ?
          LIMIT 1
        `,
        [usuarioId]
      );

      if ((usuarios as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Usuário não encontrado.",
        });
      }

      // Verifica se já curtiu
      const [curtidas] = await pool.query(
        `
          SELECT id
          FROM curtidas
          WHERE post_id = ?
            AND usuario_id = ?
          LIMIT 1
        `,
        [postId, usuarioId]
      );

      if ((curtidas as any[]).length > 0) {
        return res.json({
          success: true,
          ja_curtido: true,
          curtido_por_mim: true,
          message:
            "Esta publicação já estava curtida.",
        });
      }

      await pool.execute(
        `
          INSERT INTO curtidas
            (post_id, usuario_id)
          VALUES (?, ?)
        `,
        [postId, usuarioId]
      );

      return res.status(201).json({
        success: true,
        ja_curtido: false,
        curtido_por_mim: true,
        message:
          "Publicação curtida com sucesso!",
      });
    } catch (error: any) {
      // Proteção caso exista UNIQUE(post_id, usuario_id)
      // e duas requisições cheguem juntas.
      if (error.code === "ER_DUP_ENTRY") {
        return res.json({
          success: true,
          ja_curtido: true,
          curtido_por_mim: true,
          message:
            "Esta publicação já estava curtida.",
        });
      }

      console.error(
        "ERRO AO CURTIR PUBLICAÇÃO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao curtir a publicação.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// DESCURTIR PUBLICAÇÃO
// DELETE /posts/:postId/curtir
// BODY: { usuario_id }
// =====================================================

router.delete(
  "/:postId/curtir",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!postId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "postId e usuario_id são obrigatórios.",
        });
      }

      const [resultado]: any =
        await pool.execute(
          `
            DELETE FROM curtidas
            WHERE post_id = ?
              AND usuario_id = ?
          `,
          [postId, usuarioId]
        );

      if (resultado.affectedRows === 0) {
        return res.json({
          success: true,
          ja_descurtido: true,
          curtido_por_mim: false,
          message:
            "A publicação já estava sem curtida.",
        });
      }

      return res.json({
        success: true,
        ja_descurtido: false,
        curtido_por_mim: false,
        message:
          "Curtida removida com sucesso!",
      });
    } catch (error: any) {
      console.error(
        "ERRO AO REMOVER CURTIDA:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao remover a curtida.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// CONTAR CURTIDAS
// GET /posts/:postId/curtidas
// =====================================================

router.get(
  "/:postId/curtidas",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      if (!postId) {
        return res.status(400).json({
          success: false,
          message:
            "ID da publicação inválido.",
        });
      }

      const [resultado] = await pool.query(
        `
          SELECT COUNT(*) AS quantidade
          FROM curtidas
          WHERE post_id = ?
        `,
        [postId]
      );

      const quantidade = Number(
        (resultado as any[])[0]?.quantidade || 0
      );

      return res.json({
        success: true,
        quantidade,
      });
    } catch (error: any) {
      console.error(
        "ERRO AO CONTAR CURTIDAS:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao contar curtidas.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// ADICIONAR COMENTÁRIO
// POST /posts/:postId/comentarios
// BODY: { usuario_id, texto }
// =====================================================

router.post(
  "/:postId/comentarios",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      const texto = String(
        req.body.texto || ""
      ).trim();

      if (!postId || !usuarioId || !texto) {
        return res.status(400).json({
          success: false,
          message:
            "postId, usuario_id e texto são obrigatórios.",
        });
      }

      // Verifica o post
      const [posts] = await pool.query(
        `
          SELECT id
          FROM posts
          WHERE id = ?
          LIMIT 1
        `,
        [postId]
      );

      if ((posts as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Publicação não encontrada.",
        });
      }

      // Verifica usuário
      const [usuarios] = await pool.query(
        `
          SELECT id
          FROM usuarios
          WHERE id = ?
          LIMIT 1
        `,
        [usuarioId]
      );

      if ((usuarios as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Usuário não encontrado.",
        });
      }

      const [resultado]: any =
        await pool.execute(
          `
            INSERT INTO comentarios
              (post_id, usuario_id, texto)
            VALUES (?, ?, ?)
          `,
          [
            postId,
            usuarioId,
            texto,
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          "Comentário adicionado com sucesso!",

        comentario: {
          id: resultado.insertId,
          post_id: postId,
          usuario_id: usuarioId,
          texto,
        },
      });
    } catch (error: any) {
      console.error(
        "ERRO AO ADICIONAR COMENTÁRIO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao adicionar comentário.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// LISTAR COMENTÁRIOS
// GET /posts/:postId/comentarios
// =====================================================

router.get(
  "/:postId/comentarios",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      if (!postId) {
        return res.status(400).json({
          success: false,
          message:
            "ID da publicação inválido.",
        });
      }

      const [comentarios] = await pool.query(
        `
          SELECT
            c.id,
            c.post_id,
            c.usuario_id,
            c.texto,
            c.criado_em,

            COALESCE(pet.nome, u.nome) AS nome,
            pet.id AS pet_id,
            pet.foto_perfil AS foto_perfil

          FROM comentarios c

          INNER JOIN usuarios u
            ON u.id = c.usuario_id

          LEFT JOIN pets pet
            ON pet.usuario_id = c.usuario_id

          WHERE c.post_id = ?

          ORDER BY c.criado_em ASC
        `,
        [postId]
      );

      return res.json({
        success: true,
        comentarios,
      });
    } catch (error: any) {
      console.error(
        "ERRO AO LISTAR COMENTÁRIOS:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao listar comentários.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// REMOVER PUBLICAÇÃO SALVA
// DELETE /posts/:postId/salvar
// =====================================================

router.delete(
  "/:postId/salvar",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!postId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Post e usuário obrigatórios.",
        });
      }

      await pool.execute(
        `
          DELETE FROM publicacoes_salvas
          WHERE usuario_id = ?
            AND post_id = ?
        `,
        [usuarioId, postId]
      );

      return res.json({
        success: true,
        message:
          "Publicação removida dos salvos.",
      });
    } catch (error: any) {
      console.error(
        "ERRO AO REMOVER POST SALVO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível remover a publicação salva.",
      });
    }
  }
);

// =====================================================
// OCULTAR PUBLICAÇÃO
// POST /posts/:postId/ocultar
// =====================================================

router.post(
  "/:postId/ocultar",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!postId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Post e usuário obrigatórios.",
        });
      }

      await pool.execute(
        `
          INSERT IGNORE INTO publicacoes_ocultas
            (usuario_id, post_id)
          VALUES (?, ?)
        `,
        [usuarioId, postId]
      );

      return res.json({
        success: true,
        message:
          "Publicação ocultada do seu feed.",
      });
    } catch (error: any) {
      console.error(
        "ERRO AO OCULTAR PUBLICAÇÃO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível ocultar a publicação. Confira a migração.",
      });
    }
  }
);

// =====================================================
// LISTAR POSTS OCULTOS
// GET /posts/ocultos/:usuarioId
// =====================================================

router.get(
  "/ocultos/:usuarioId",
  async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(
        req.params.usuarioId
      );

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Usuário inválido.",
        });
      }

      const [rows] = await pool.query(
        `
          SELECT post_id
          FROM publicacoes_ocultas
          WHERE usuario_id = ?
        `,
        [usuarioId]
      );

      return res.json({
        success: true,

        ids: (rows as any[]).map(
          (row) =>
            Number(row.post_id)
        ),
      });
    } catch (error: any) {
      console.error(
        "ERRO AO CONSULTAR POSTS OCULTOS:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível consultar posts ocultos.",
      });
    }
  }
);

// =====================================================
// DENUNCIAR PUBLICAÇÃO
// POST /posts/:postId/denunciar
// =====================================================

router.post(
  "/:postId/denunciar",
  async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      const motivo = String(
        req.body.motivo || ""
      ).trim();

      if (!postId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Post e usuário obrigatórios.",
        });
      }

      if (!motivo) {
        return res.status(400).json({
          success: false,
          message:
            "Informe o motivo da denúncia.",
        });
      }

      await pool.execute(
        `
          INSERT IGNORE INTO denuncias
            (usuario_id, post_id, motivo)
          VALUES (?, ?, ?)
        `,
        [
          usuarioId,
          postId,
          motivo,
        ]
      );

      return res.json({
        success: true,
        message:
          "Denúncia registrada.",
      });
    } catch (error: any) {
      console.error(
        "ERRO AO DENUNCIAR PUBLICAÇÃO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível registrar a denúncia. Confira a migração.",
      });
    }
  }
);

// =====================================================
// EXCLUIR PUBLICAÇÃO
// DELETE /posts/:postId
// =====================================================

router.delete(
  "/:postId",
  async (req: Request, res: Response) => {
    const connection =
      await pool.getConnection();

    try {
      const postId = Number(req.params.postId);

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!postId || !usuarioId) {
        connection.release();

        return res.status(400).json({
          success: false,
          message:
            "Post e usuário obrigatórios.",
        });
      }

      await connection.beginTransaction();

      // Só o dono do pet/post pode excluir.
      const [owner] = await connection.query(
        `
          SELECT p.id
          FROM posts p

          INNER JOIN pets pet
            ON pet.id = p.pet_id

          WHERE p.id = ?
            AND pet.usuario_id = ?

          LIMIT 1
        `,
        [postId, usuarioId]
      );

      if ((owner as any[]).length === 0) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message:
            "Você só pode excluir suas próprias publicações.",
        });
      }

      // Remove os registros relacionados antes do post.

      await connection.execute(
        `
          DELETE FROM curtidas
          WHERE post_id = ?
        `,
        [postId]
      );

      await connection.execute(
        `
          DELETE FROM comentarios
          WHERE post_id = ?
        `,
        [postId]
      );

      await connection.execute(
        `
          DELETE FROM publicacoes_salvas
          WHERE post_id = ?
        `,
        [postId]
      );

      await connection.execute(
        `
          DELETE FROM publicacoes_ocultas
          WHERE post_id = ?
        `,
        [postId]
      );

      await connection.execute(
        `
          DELETE FROM denuncias
          WHERE post_id = ?
        `,
        [postId]
      );

      await connection.execute(
        `
          DELETE FROM posts
          WHERE id = ?
        `,
        [postId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message:
          "Publicação excluída com sucesso.",
      });
    } catch (error: any) {
      await connection.rollback();

      console.error(
        "ERRO AO EXCLUIR PUBLICAÇÃO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível excluir a publicação.",
        erro: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// =====================================================
// CRIAR PUBLICAÇÃO
// POST /posts
// =====================================================

router.post(
  "/",
  async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(
        req.body.usuario_id
      );

      const petId = Number(
        req.body.pet_id
      );

      const imagem = String(
        req.body.imagem || ""
      );

      const legenda = String(
        req.body.legenda || ""
      ).trim();

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Usuário não identificado.",
        });
      }

      if (!petId) {
        return res.status(400).json({
          success: false,
          message:
            "Escolha um pet.",
        });
      }

      if (!imagem.startsWith("/uploads/")) {
        return res.status(400).json({
          success: false,
          message:
            "Escolha uma foto válida.",
        });
      }

      if (legenda.length > 4000) {
        return res.status(400).json({
          success: false,
          message:
            "A legenda deve ter no máximo 4000 caracteres.",
        });
      }

      // Confirma que o pet pertence ao usuário.
      const [pets] = await pool.query(
        `
          SELECT id
          FROM pets
          WHERE id = ?
            AND usuario_id = ?
          LIMIT 1
        `,
        [petId, usuarioId]
      );

      if ((pets as any[]).length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Escolha um pet cadastrado na sua conta.",
        });
      }

      // IMPORTANTE:
      // A imagem da publicação é salva SOMENTE na tabela posts.
      // Não alteramos pets.foto_perfil aqui.
      const [resultado]: any =
        await pool.execute(
          `
            INSERT INTO posts
              (pet_id, imagem, legenda)
            VALUES (?, ?, ?)
          `,
          [
            petId,
            imagem,
            legenda,
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          "Publicação criada com sucesso!",

        post: {
          id: resultado.insertId,
        },
      });
    } catch (error: any) {
      console.error(
        "ERRO AO CRIAR PUBLICAÇÃO:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível criar a publicação.",
        erro: error.message,
      });
    }
  }
);

export default router;