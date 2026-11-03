import { Router, Request, Response } from "express";
import { pool } from "../models/database";

const router = Router();

// =====================================================
// BUSCAR PERFIL
// GET /perfil/:usuarioId
//
// Opcional:
// ?visualizadorId=5
//
// Informa se o usuário 5 segue o perfil consultado.
// =====================================================

router.get(
  "/:usuarioId",
  async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const visualizadorId = Number(
        req.query.visualizadorId
      );

      // Validar o ID do perfil
      if (
        !Number.isSafeInteger(usuarioId) ||
        usuarioId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário inválido.",
        });
      }

      // Buscar usuário
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

      // =================================================
      // CONTAR PETS
      // =================================================

      const [pets] = await pool.query(
        `
        SELECT COUNT(*) AS quantidade
        FROM pets
        WHERE usuario_id = ?
        `,
        [usuarioId]
      );

      // =================================================
      // CONTAR QUANTAS PESSOAS O PERFIL SEGUE
      // =================================================

      const [seguindo] = await pool.query(
        `
        SELECT COUNT(*) AS quantidade
        FROM seguidores
        WHERE seguidor_id = ?
        `,
        [usuarioId]
      );

      // =================================================
      // CONTAR SEGUIDORES DO PERFIL
      // =================================================

      const [seguidores] = await pool.query(
        `
        SELECT COUNT(*) AS quantidade
        FROM seguidores
        WHERE seguido_id = ?
        `,
        [usuarioId]
      );

      // =================================================
      // VERIFICAR SE O VISUALIZADOR SEGUE O PERFIL
      // =================================================

      let seguindoPerfil = false;

      if (
        Number.isSafeInteger(visualizadorId) &&
        visualizadorId > 0
      ) {
        const [relacoes] = await pool.query(
          `
          SELECT 1
          FROM seguidores
          WHERE seguidor_id = ?
            AND seguido_id = ?
          LIMIT 1
          `,
          [visualizadorId, usuarioId]
        );

        seguindoPerfil =
          (relacoes as any[]).length > 0;
      }

      // =================================================
      // RESPOSTA
      // =================================================

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
          pets: Number(
            (pets as any[])[0].quantidade
          ),

          seguindo: Number(
            (seguindo as any[])[0].quantidade
          ),

          seguidores: Number(
            (seguidores as any[])[0].quantidade
          ),
        },

        seguindoPerfil,
      });
    } catch (error: any) {
      console.error("ERRO AO BUSCAR PERFIL:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao buscar perfil.",
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

      // Validar ID
      if (
        !Number.isSafeInteger(usuarioId) ||
        usuarioId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário inválido.",
        });
      }

      // Validar nome
      if (
        typeof nome !== "string" ||
        nome.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "O nome é obrigatório.",
        });
      }

      const nomeLimpo = nome.trim();

      // Verificar se o usuário existe
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
          message: "Usuário não encontrado.",
        });
      }

      // Atualizar os dados
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

      // Buscar os dados atualizados
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
      });
    }
  }
);

export default router;