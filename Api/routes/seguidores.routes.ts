import { Router, Request, Response } from "express";
import { pool } from "../database";

const router = Router();

// =====================================================
// SEGUIR USUÁRIO
// POST /seguidores/:usuarioId
//
// Exemplo:
// POST /seguidores/12
// Body: { "seguidorId": 5 }
//
// O usuário 5 começa a seguir o usuário 12.
// =====================================================

router.post(
  "/:usuarioId",
  async (req: Request, res: Response) => {
    try {
      const seguidoId = Number(req.params.usuarioId);
      const seguidorId = Number(req.body?.seguidorId);

      // Validar os IDs
      if (
        !Number.isSafeInteger(seguidoId) ||
        seguidoId <= 0 ||
        !Number.isSafeInteger(seguidorId) ||
        seguidorId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "IDs de usuários inválidos.",
        });
      }

      // Impedir que alguém siga a si mesmo
      if (seguidorId === seguidoId) {
        return res.status(400).json({
          success: false,
          message: "Você não pode seguir a si mesmo.",
        });
      }

      // Verificar se os dois usuários existem
      const [usuarios] = await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE id IN (?, ?)
        `,
        [seguidorId, seguidoId]
      );

      if ((usuarios as any[]).length !== 2) {
        return res.status(404).json({
          success: false,
          message: "Um ou ambos os usuários não foram encontrados.",
        });
      }

      // Registrar a relação de seguimento
      const [resultado]: any = await pool.execute(
        `
        INSERT IGNORE INTO seguidores
          (seguidor_id, seguido_id)
        VALUES (?, ?)
        `,
        [seguidorId, seguidoId]
      );

      // Confirmar o resultado
      return res.json({
        success: true,
        seguindo: true,
        jaSeguia: resultado.affectedRows === 0,
        message:
          resultado.affectedRows === 0
            ? "Você já segue esse usuário."
            : "Você começou a seguir esse usuário!",
      });
    } catch (error: any) {
      console.error("ERRO AO SEGUIR USUÁRIO:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao seguir usuário.",
      });
    }
  }
);

// =====================================================
// DEIXAR DE SEGUIR USUÁRIO
// DELETE /seguidores/:usuarioId
//
// Exemplo:
// DELETE /seguidores/12
// Body: { "seguidorId": 5 }
//
// O usuário 5 deixa de seguir o usuário 12.
// =====================================================

router.delete(
  "/:usuarioId",
  async (req: Request, res: Response) => {
    try {
      const seguidoId = Number(req.params.usuarioId);
      const seguidorId = Number(req.body?.seguidorId);

      // Validar os IDs
      if (
        !Number.isSafeInteger(seguidoId) ||
        seguidoId <= 0 ||
        !Number.isSafeInteger(seguidorId) ||
        seguidorId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "IDs de usuários inválidos.",
        });
      }

      // Impedir operações sobre si mesmo
      if (seguidorId === seguidoId) {
        return res.status(400).json({
          success: false,
          message: "Operação inválida.",
        });
      }

      // Remover a relação de seguimento
      const [resultado]: any = await pool.execute(
        `
        DELETE FROM seguidores
        WHERE seguidor_id = ?
          AND seguido_id = ?
        `,
        [seguidorId, seguidoId]
      );

      return res.json({
        success: true,
        seguindo: false,
        deixouDeSeguir: resultado.affectedRows > 0,
        message:
          resultado.affectedRows > 0
            ? "Você deixou de seguir esse usuário."
            : "Você não seguia esse usuário.",
      });
    } catch (error: any) {
      console.error("ERRO AO DEIXAR DE SEGUIR:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao deixar de seguir usuário.",
      });
    }
  }
);

export default router;