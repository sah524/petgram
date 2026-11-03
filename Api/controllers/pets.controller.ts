import { Router, Request, Response } from "express";
import { pool } from "../models/database";

const router = Router();

// =====================================================
// LISTAR PETS DO USUÁRIO
// GET /pets/:usuarioId
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

      const [pets] = await pool.query(
        `
        SELECT
          id,
          usuario_id,
          nome,
          especie,
          raca,
          idade,
          bio,
          instagram_tutor,
          foto_perfil,
          criado_em
        FROM pets
        WHERE usuario_id = ?
        ORDER BY criado_em DESC
        `,
        [usuarioId]
      );

      return res.json({
        success: true,
        pets,
      });
    } catch (error: any) {
      console.error("ERRO AO LISTAR PETS:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar pets.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// CADASTRAR PET
// POST /pets
// =====================================================

router.post(
  "/",
  async (req: Request, res: Response) => {
    try {
      const {
        usuario_id,
        nome,
        especie,
        raca,
        idade,
        bio,
        instagram_tutor,
        foto_perfil,
      } = req.body;

      if (!usuario_id || !nome || !especie) {
        return res.status(400).json({
          success: false,
          message:
            "usuario_id, nome e especie são obrigatórios.",
        });
      }

      // Verifica se o usuário existe
      const [usuarios] = await pool.query(
        "SELECT id FROM usuarios WHERE id = ?",
        [usuario_id]
      );

      if ((usuarios as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      const [resultado]: any = await pool.execute(
        `
        INSERT INTO pets
        (
          usuario_id,
          nome,
          especie,
          raca,
          idade,
          bio,
          instagram_tutor,
          foto_perfil
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          usuario_id,
          String(nome).trim(),
          String(especie).trim(),
          raca ? String(raca).trim() : null,
          idade ?? null,
          bio ? String(bio).trim() : null,
          instagram_tutor ? String(instagram_tutor).trim().replace(/^@/, "") : null,
          foto_perfil || null,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Pet cadastrado com sucesso!",
        pet: {
          id: resultado.insertId,
          usuario_id,
          nome: String(nome).trim(),
          especie: String(especie).trim(),
          raca: raca ? String(raca).trim() : null,
          idade: idade ?? null,
          bio: bio ? String(bio).trim() : null,
          instagram_tutor: instagram_tutor || null,
          foto_perfil: foto_perfil || null,
        },
      });
    } catch (error: any) {
      console.error("ERRO AO CADASTRAR PET:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao cadastrar pet.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// EDITAR PET
// PUT /pets/:id
// =====================================================

router.put(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const petId = Number(req.params.id);

      const {
        nome,
        especie,
        raca,
        idade,
        bio,
        instagram_tutor,
        foto_perfil,
      } = req.body;

      if (!petId) {
        return res.status(400).json({
          success: false,
          message: "ID do pet inválido.",
        });
      }

      const [pets] = await pool.query(
        "SELECT id FROM pets WHERE id = ?",
        [petId]
      );

      if ((pets as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "Pet não encontrado.",
        });
      }

      await pool.execute(
        `
        UPDATE pets
        SET
          nome = ?,
          especie = ?,
          raca = ?,
          idade = ?,
          bio = ?,
          instagram_tutor = ?,
          foto_perfil = ?
        WHERE id = ?
        `,
        [
          nome ? String(nome).trim() : null,
          especie ? String(especie).trim() : null,
          raca ? String(raca).trim() : null,
          idade ?? null,
          bio ? String(bio).trim() : null,
          instagram_tutor ? String(instagram_tutor).trim().replace(/^@/, "") : null,
          foto_perfil || null,
          petId,
        ]
      );

      return res.json({
        success: true,
        message: "Pet atualizado com sucesso!",
      });
    } catch (error: any) {
      console.error("ERRO AO EDITAR PET:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao editar pet.",
        erro: error.message,
      });
    }
  }
);

// =====================================================
// EXCLUIR PET
// DELETE /pets/:id
// =====================================================

router.delete(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      const petId = Number(req.params.id);

      if (!petId) {
        return res.status(400).json({
          success: false,
          message: "ID do pet inválido.",
        });
      }

      const [resultado]: any = await pool.execute(
        `
        DELETE FROM pets
        WHERE id = ?
        `,
        [petId]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Pet não encontrado.",
        });
      }

      return res.json({
        success: true,
        message: "Pet excluído com sucesso!",
      });
    } catch (error: any) {
      console.error("ERRO AO EXCLUIR PET:", error);

      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir pet.",
        erro: error.message,
      });
    }
  }
);

export default router;