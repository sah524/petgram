import React from "react";
import { FlatList, Image, View, useWindowDimensions } from "react-native";
export function Galeria({ imagens, modo = "mosaico" }: { imagens: string[]; modo?: "mosaico" | "carousel" }) {
  const { width } = useWindowDimensions();
  const carousel = modo === "carousel";
  return <FlatList data={imagens} horizontal={carousel} pagingEnabled={carousel}
    numColumns={carousel ? undefined : 3} key={modo} keyExtractor={(item, index) => `${index}-${item}`}
    renderItem={({ item }) => <View style={{ padding: 2 }}><Image source={{ uri: item }}
      style={{ width: carousel ? width - 32 : (width - 44) / 3, height: carousel ? 280 : (width - 44) / 3, borderRadius: 8 }} /></View>} />;
}
