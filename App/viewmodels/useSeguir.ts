import { useCallback, useState } from "react";
import { API_URL } from "../services/api";
import { request } from "../services/http";
/** Estado de seguir para novas telas, sem alterar o comportamento das telas existentes. */
export function useSeguir(seguidorId: number) {
  const [seguindo, setSeguindo] = useState<Record<number, boolean>>({});
  const alternar = useCallback(async (seguidoId: number) => {
    const ativo = Boolean(seguindo[seguidoId]);
    const resposta = await request(`${API_URL}/seguidores/${seguidoId}`, {
      method: ativo ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seguidorId }),
    });
    if (!resposta.ok) throw new Error("Não foi possível atualizar o seguimento");
    setSeguindo(atual => ({ ...atual, [seguidoId]: !ativo }));
  }, [seguidorId, seguindo]);
  return { seguindo, alternar };
}
