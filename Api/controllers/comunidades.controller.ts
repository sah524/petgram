import { Router, Request, Response } from "express";
import { pool } from "../models/database";

const router = Router();

// =====================================================
// FUNÇÃO AUXILIAR - VERIFICAR MEMBRO
// =====================================================

async function isMember(
  comunidadeId: number,
  usuarioId: number
): Promise<boolean> {
  if (!comunidadeId || !usuarioId) {
    return false;
  }

  const [rows] = await pool.query(
    `
    SELECT id
    FROM comunidade_membros
    WHERE comunidade_id = ?
      AND usuario_id = ?
    LIMIT 1
    `,
    [comunidadeId, usuarioId]
  );

  return (rows as any[]).length > 0;
}

// =====================================================
// LISTAR COMUNIDADES
// GET /comunidades
// =====================================================

router.get(
  "/",
  async (_req: Request, res: Response) => {
    try {
      const [comunidades] = await pool.query(
        `
        SELECT
          c.id,
          c.nome,
          c.descricao,
          c.imagem,
          c.criado_em,
          COUNT(cm.id) AS quantidade_membros
        FROM comunidades c
        LEFT JOIN comunidade_membros cm
          ON cm.comunidade_id = c.id
        GROUP BY
          c.id,
          c.nome,
          c.descricao,
          c.imagem,
          c.criado_em
        ORDER BY c.criado_em DESC
        `
      );

      return res.json({
        success: true,
        comunidades: (comunidades as any[]).map(
          (comunidade) => ({
            id: comunidade.id,
            nome: comunidade.nome,
            descricao: comunidade.descricao,
            imagem: comunidade.imagem,
            criado_em: comunidade.criado_em,
            quantidade_membros: Number(
              comunidade.quantidade_membros || 0
            ),
          })
        ),
      });
    } catch (error: any) {
      console.error(
        "ERRO AO LISTAR COMUNIDADES:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao listar comunidades.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// CRIAR COMUNIDADE
// POST /comunidades
// =====================================================

router.post(
  "/",
  async (req: Request, res: Response) => {
    const connection =
      await pool.getConnection();

    try {
      const nome = String(
        req.body.nome || ""
      ).trim();

      const descricao = String(
        req.body.descricao || ""
      ).trim();

      const imagem = req.body.imagem
        ? String(req.body.imagem)
        : null;

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!nome) {
        return res.status(400).json({
          success: false,
          message:
            "O nome da comunidade é obrigatório.",
        });
      }

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Faça login para criar uma comunidade.",
        });
      }

      const [usuarios] =
        await connection.query(
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
          message: "Usuário não encontrado.",
        });
      }

      await connection.beginTransaction();

      const [resultado]: any =
        await connection.execute(
          `
          INSERT INTO comunidades
            (nome, descricao, imagem)
          VALUES (?, ?, ?)
          `,
          [
            nome,
            descricao || null,
            imagem,
          ]
        );

      const comunidadeId =
        resultado.insertId;

      // Criador já entra como membro.
      await connection.execute(
        `
        INSERT INTO comunidade_membros
          (comunidade_id, usuario_id)
        VALUES (?, ?)
        `,
        [
          comunidadeId,
          usuarioId,
        ]
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message:
          "Comunidade criada com sucesso!",
        comunidade: {
          id: comunidadeId,
          nome,
          descricao:
            descricao || null,
          imagem,
          quantidade_membros: 1,
        },
      });
    } catch (error: any) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "ERRO AO CRIAR COMUNIDADE:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao criar comunidade.",
        erro: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// =====================================================
// ENTRAR NA COMUNIDADE
// POST /comunidades/:id/entrar
// =====================================================

router.post(
  "/:id/entrar",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      const usuarioId = Number(
        req.body.usuario_id
      );

      if (!comunidadeId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Comunidade e usuário são obrigatórios.",
        });
      }

      const [comunidades] =
        await pool.query(
          `
          SELECT id
          FROM comunidades
          WHERE id = ?
          LIMIT 1
          `,
          [comunidadeId]
        );

      if (
        (comunidades as any[]).length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Comunidade não encontrada.",
        });
      }

      const [usuarios] =
        await pool.query(
          `
          SELECT id
          FROM usuarios
          WHERE id = ?
          LIMIT 1
          `,
          [usuarioId]
        );

      if (
        (usuarios as any[]).length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      const jaParticipa =
        await isMember(
          comunidadeId,
          usuarioId
        );

      if (jaParticipa) {
        return res.json({
          success: true,
          ja_membro: true,
          message:
            "Você já participa desta comunidade.",
        });
      }

      await pool.execute(
        `
        INSERT INTO comunidade_membros
          (comunidade_id, usuario_id)
        VALUES (?, ?)
        `,
        [
          comunidadeId,
          usuarioId,
        ]
      );

      return res.status(201).json({
        success: true,
        ja_membro: false,
        message:
          "Você entrou na comunidade!",
      });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.json({
          success: true,
          ja_membro: true,
          message:
            "Você já participa desta comunidade.",
        });
      }

      console.error(
        "ERRO AO ENTRAR NA COMUNIDADE:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao entrar na comunidade.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// LISTAR MEMBROS
// GET /comunidades/:id/membros
// =====================================================

router.get(
  "/:id/membros",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      if (!comunidadeId) {
        return res.status(400).json({
          success: false,
          message:
            "ID da comunidade inválido.",
        });
      }

      const [membros] =
        await pool.query(
          `
          SELECT
            cm.id,
            cm.comunidade_id,
            cm.usuario_id,
            cm.criado_em,
            u.nome,
            u.email,
            u.foto_perfil
          FROM comunidade_membros cm
          INNER JOIN usuarios u
            ON u.id = cm.usuario_id
          WHERE cm.comunidade_id = ?
          ORDER BY cm.criado_em ASC
          `,
          [comunidadeId]
        );

      return res.json({
        success: true,
        membros,
      });
    } catch (error: any) {
      console.error(
        "ERRO AO LISTAR MEMBROS:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao listar membros.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// LISTAR POSTS DA COMUNIDADE
// GET /comunidades/:id/posts
// =====================================================

router.get(
  "/:id/posts",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      if (!comunidadeId) {
        return res.status(400).json({
          success: false,
          message:
            "ID da comunidade inválido.",
        });
      }

      const [rows] = await pool.query(
        `
        SELECT
          p.id,
          p.texto,
          p.imagem,
          p.criado_em,
          p.usuario_id,
          u.nome AS autor,

          (
            SELECT COUNT(*)
            FROM comunidade_comentarios cc
            WHERE cc.post_id = p.id
          ) AS quantidade_comentarios

        FROM comunidade_posts p

        INNER JOIN usuarios u
          ON u.id = p.usuario_id

        WHERE p.comunidade_id = ?

        ORDER BY p.criado_em DESC
        `,
        [comunidadeId]
      );

      return res.json({
        success: true,
        posts: (rows as any[]).map(
          (post) => ({
            ...post,
            quantidade_comentarios:
              Number(
                post.quantidade_comentarios || 0
              ),
          })
        ),
      });
    } catch (error: any) {
      console.error(
        "ERRO AO LISTAR POSTS DA COMUNIDADE:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível carregar as publicações da comunidade.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// CRIAR POST NA COMUNIDADE
// POST /comunidades/:id/posts
// =====================================================

router.post(
  "/:id/posts",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      const usuarioId = Number(
        req.body.usuario_id
      );

      const texto = String(
        req.body.texto || ""
      ).trim();

      const imagem = req.body.imagem
        ? String(req.body.imagem)
        : null;

      if (!comunidadeId || !usuarioId) {
        return res.status(400).json({
          success: false,
          message:
            "Comunidade e usuário são obrigatórios.",
        });
      }

      if (!texto) {
        return res.status(400).json({
          success: false,
          message:
            "Escreva o conteúdo da publicação.",
        });
      }

      if (texto.length > 4000) {
        return res.status(400).json({
          success: false,
          message:
            "Escreva um texto de até 4000 caracteres.",
        });
      }

      const membro =
        await isMember(
          comunidadeId,
          usuarioId
        );

      if (!membro) {
        return res.status(403).json({
          success: false,
          message:
            "Entre na comunidade antes de publicar.",
        });
      }

      const [resultado]: any =
        await pool.execute(
          `
          INSERT INTO comunidade_posts
          (
            comunidade_id,
            usuario_id,
            texto,
            imagem
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            comunidadeId,
            usuarioId,
            texto,
            imagem,
          ]
        );

      return res.status(201).json({
        success: true,
        message:
          "Publicação criada na comunidade.",
        post: {
          id: resultado.insertId,
        },
      });
    } catch (error: any) {
      console.error(
        "ERRO AO PUBLICAR NA COMUNIDADE:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível publicar na comunidade.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// LISTAR COMENTÁRIOS DE UMA PUBLICAÇÃO
// GET /comunidades/:id/posts/:postId/comentarios
// =====================================================

router.get(
  "/:id/posts/:postId/comentarios",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      const postId = Number(
        req.params.postId
      );

      if (!comunidadeId || !postId) {
        return res.status(400).json({
          success: false,
          message:
            "Comunidade ou publicação inválida.",
        });
      }

      // Confirma que o post pertence à comunidade.
      const [posts] = await pool.query(
        `
        SELECT id
        FROM comunidade_posts
        WHERE id = ?
          AND comunidade_id = ?
        LIMIT 1
        `,
        [
          postId,
          comunidadeId,
        ]
      );

      if ((posts as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Publicação não encontrada nesta comunidade.",
        });
      }

      const [comentarios] =
        await pool.query(
          `
          SELECT
            cc.id,
            cc.post_id,
            cc.usuario_id,
            cc.texto,
            cc.criado_em,
            u.nome AS autor,
            u.foto_perfil
          FROM comunidade_comentarios cc
          INNER JOIN usuarios u
            ON u.id = cc.usuario_id
          WHERE cc.post_id = ?
          ORDER BY cc.criado_em ASC
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
          "Não foi possível carregar os comentários.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// COMENTAR EM UMA PUBLICAÇÃO
// POST /comunidades/:id/posts/:postId/comentarios
// =====================================================

router.post(
  "/:id/posts/:postId/comentarios",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      const postId = Number(
        req.params.postId
      );

      const usuarioId = Number(
        req.body.usuario_id
      );

      const texto = String(
        req.body.texto || ""
      ).trim();

      if (
        !comunidadeId ||
        !postId ||
        !usuarioId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Comunidade, publicação e usuário são obrigatórios.",
        });
      }

      if (!texto) {
        return res.status(400).json({
          success: false,
          message:
            "Escreva um comentário.",
        });
      }

      if (texto.length > 2000) {
        return res.status(400).json({
          success: false,
          message:
            "O comentário deve ter no máximo 2000 caracteres.",
        });
      }

      // Só membros podem comentar.
      const membro =
        await isMember(
          comunidadeId,
          usuarioId
        );

      if (!membro) {
        return res.status(403).json({
          success: false,
          message:
            "Entre na comunidade para comentar.",
        });
      }

      // Confirma que o post pertence à comunidade.
      const [posts] = await pool.query(
        `
        SELECT id
        FROM comunidade_posts
        WHERE id = ?
          AND comunidade_id = ?
        LIMIT 1
        `,
        [
          postId,
          comunidadeId,
        ]
      );

      if ((posts as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Publicação não encontrada nesta comunidade.",
        });
      }

      const [resultado]: any =
        await pool.execute(
          `
          INSERT INTO comunidade_comentarios
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
          "Comentário publicado.",
        comentario: {
          id: resultado.insertId,
          post_id: postId,
          usuario_id: usuarioId,
          texto,
        },
      });
    } catch (error: any) {
      console.error(
        "ERRO AO COMENTAR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Não foi possível publicar o comentário.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// BUSCAR UMA COMUNIDADE
// GET /comunidades/:id
// =====================================================

router.get(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const comunidadeId = Number(
        req.params.id
      );

      if (!comunidadeId) {
        return res.status(400).json({
          success: false,
          message:
            "ID da comunidade inválido.",
        });
      }

      const [comunidades] =
        await pool.query(
          `
          SELECT
            c.id,
            c.nome,
            c.descricao,
            c.imagem,
            c.criado_em,
            COUNT(cm.id) AS quantidade_membros

          FROM comunidades c

          LEFT JOIN comunidade_membros cm
            ON cm.comunidade_id = c.id

          WHERE c.id = ?

          GROUP BY
            c.id,
            c.nome,
            c.descricao,
            c.imagem,
            c.criado_em
          `,
          [comunidadeId]
        );

      const lista =
        comunidades as any[];

      if (lista.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Comunidade não encontrada.",
        });
      }

      const comunidade =
        lista[0];

      return res.json({
        success: true,
        comunidade: {
          id: comunidade.id,
          nome: comunidade.nome,
          descricao:
            comunidade.descricao,
          imagem:
            comunidade.imagem,
          criado_em:
            comunidade.criado_em,
          quantidade_membros:
            Number(
              comunidade.quantidade_membros || 0
            ),
        },
      });
    } catch (error: any) {
      console.error(
        "ERRO AO BUSCAR COMUNIDADE:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Erro interno ao buscar comunidade.",
        erro: error.message,
      });
    }
  }
);

export default router;