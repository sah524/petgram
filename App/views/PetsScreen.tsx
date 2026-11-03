import { request } from "../services/http";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_URL } from "../services/api";
import BottomNavigation from '../components/BottomNavigation';
type Pet = { id: number; nome: string; especie: string; raca?: string | null };
type Props = { usuarioId: number; isDark: boolean; onNavigate: (screen: any) => void };

export default function PetsScreen({ usuarioId, isDark, onNavigate }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [raca, setRaca] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const text = isDark ? "#FFF" : "#211F1A";
  const background = isDark ? "#211F1A" : "#F7F3EA";
  const input = { borderWidth: 1, borderColor: "#AA9A80", borderRadius: 10, padding: 12, color: text, marginBottom: 12 } as const;

  async function carregar() {
    try {
      setErro("");
      const resposta = await request(`${API_URL}/pets/${usuarioId}`);
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.message || "Não foi possível carregar seus pets.");
      setPets(dados.pets || []);
    } catch (e) { setErro(e instanceof Error ? e.message : "Erro de conexão com a API."); }
  }
  useEffect(() => { if (usuarioId) carregar(); }, [usuarioId]);

  async function cadastrar() {
    if (!nome.trim() || !especie.trim()) { setErro("Digite o nome e a espécie do pet."); return; }
    try {
      setCarregando(true); setErro("");
      const resposta = await request(`${API_URL}/pets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario_id: usuarioId, nome: nome.trim(), especie: especie.trim(), raca: raca.trim() || null }) });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.message || "Não foi possível cadastrar o pet.");
      setNome(""); setEspecie(""); setRaca(""); await carregar();
    } catch (e) { setErro(e instanceof Error ? e.message : "Erro de conexão com a API."); }
    finally { setCarregando(false); }
  }

  return <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
    <ScrollView contentContainerStyle={{ padding: 22 }}>
      <Text style={{ color: text, fontSize: 26, fontWeight: "bold", marginBottom: 18 }}>Meus pets</Text>
      <TextInput style={input} placeholder="Nome do pet" placeholderTextColor="#888" value={nome} onChangeText={setNome} />
      <TextInput style={input} placeholder="Espécie (ex.: cachorro)" placeholderTextColor="#888" value={especie} onChangeText={setEspecie} />
      <TextInput style={input} placeholder="Raça (opcional)" placeholderTextColor="#888" value={raca} onChangeText={setRaca} />
      {!!erro && <Text accessibilityRole="alert" style={{ color: "#B42318", marginBottom: 10 }}>{erro}</Text>}
      <TouchableOpacity onPress={cadastrar} disabled={carregando} style={{ padding: 15, backgroundColor: "#D9A82E", borderRadius: 10, alignItems: "center" }}><Text style={{ fontWeight: "bold" }}>{carregando ? "Salvando..." : "Cadastrar pet"}</Text></TouchableOpacity>
      {pets.map(pet => <View key={pet.id} style={{ padding: 14, marginTop: 12, borderWidth: 1, borderColor: "#AA9A80", borderRadius: 10 }}><Text style={{ color: text }}>{pet.nome} · {pet.especie}{pet.raca ? ` · ${pet.raca}` : ""}</Text></View>)}
    </ScrollView>
    <BottomNavigation telaAtual="perfil" onNavigate={onNavigate} isDark={isDark} />
  </SafeAreaView>;
}
