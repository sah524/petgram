import { Router, Request, Response } from "express";
import { pool } from "../database";

const router = Router();

// =====================================================
// BUSCAR PERFIL
// GET /perfil/:usuarioId
// =====================================================

router.get(
  "/:usuarioId",
  async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuarioId);

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário inválido.",
        });
      }

      const [usuarios] = await pool.query(
        `
        SELECT
          id,
          nome,
          email,
          foto_perfil,
          criado_em
        FROM usuarios
        WHERE id = ?
        LIMIT 1
        `,
        [usuarioId]
      );

      const listaUsuarios = usuarios as any[];

      if (listaUsuarios.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      const usuario = listaUsuarios[0];

      // Conta quantos pets o usuário possui
      const [pets] = await pool.query(
        `
        SELECT COUNT(*) AS quantidade
        FROM pets
        WHERE usuario_id = ?
        `,
        [usuarioId]
      );

      // Conta quantas pessoas o usuário segue
      const [seguindo] = await pool.query(
        `
        SELECT COUNT(*) AS quantidade
        FROM seguidores
        WHERE seguidor_id = ?
        `,
        [usuarioId]
      );

      // Conta quantas pessoas seguem o usuário
      const [seguidores] = await pool.query(
        `
        SELECT COUNT(*) AS quantidade
        FROM seguidores
        WHERE seguido_id = ?
        `,
        [usuarioId]
      );

      return res.json({
        success: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          foto_perfil: usuario.foto_perfil,
          criado_em: usuario.criado_em,
        },
        estatisticas: {
          pets: Number((pets as any[])[0].quantidade),
          seguindo: Number((seguindo as any[])[0].quantidade),
          seguidores: Number(
            (seguidores as any[])[0].quantidade
          ),
        },
      });
    } catch (error: any) {
      console.error("ERRO AO BUSCAR PERFIL:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar perfil.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// ATUALIZAR PERFIL
// PUT /perfil/:usuarioId
// =====================================================

router.put(
  "/:usuarioId",
  async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuarioId);

      const { nome, foto_perfil } = req.body;

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário inválido.",
        });
      }

      if (!nome) {
        return res.status(400).json({
          success: false,
          message: "O nome é obrigatório.",
        });
      }

      const nomeLimpo = String(nome).trim();

      if (nomeLimpo.length === 0) {
        return res.status(400).json({
          success: false,
          message: "O nome não pode estar vazio.",
        });
      }

      // Verifica se o usuário existe
      const [usuarios] = await pool.query(
        "SELECT id FROM usuarios WHERE id = ?",
        [usuarioId]
      );

      if ((usuarios as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      await pool.execute(
        `
        UPDATE usuarios
        SET
          nome = ?,
          foto_perfil = ?
        WHERE id = ?
        `,
        [
          nomeLimpo,
          foto_perfil || null,
          usuarioId,
        ]
      );

      // Busca novamente os dados atualizados
      const [resultado] = await pool.query(
        `
        SELECT
          id,
          nome,
          email,
          foto_perfil,
          criado_em
        FROM usuarios
        WHERE id = ?
        LIMIT 1
        `,
        [usuarioId]
      );

      const usuarioAtualizado =
        (resultado as any[])[0];

      return res.json({
        success: true,
        message: "Perfil atualizado com sucesso!",
        usuario: usuarioAtualizado,
      });
    } catch (error: any) {
      console.error("ERRO AO ATUALIZAR PERFIL:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar perfil.",
        erro: error.message,
      });
    }
  }
);

export default router;