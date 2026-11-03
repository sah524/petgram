import { useCallback, useState } from "react";
import { escolherImagens, FotoSelecionada } from "../services/media";

export function useGaleriaPost(limite = 5) {
  const [fotos, setFotos] = useState<FotoSelecionada[]>([]);
  const adicionar = useCallback(async (camera: boolean) => {
    const vagas = limite - fotos.length;
    if (vagas <= 0) throw new Error(`Limite de ${limite} fotos atingido.`);
    const novas = await escolherImagens(camera, vagas);
    setFotos(anteriores => {
      const unicas = novas.filter(nova => !anteriores.some(atual => atual.uri === nova.uri));
      return [...anteriores, ...unicas].slice(0, limite);
    });
  }, [fotos.length, limite]);
  const remover = useCallback((indice: number) => {
    setFotos(anteriores => anteriores.filter((_, i) => i !== indice));
  }, []);
  return { fotos, setFotos, adicionar, remover };
}
