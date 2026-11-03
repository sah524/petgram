import React, { useRef, useState } from "react";
import { Image, View, StyleSheet } from "react-native";

/** Zoom por pinça (dois dedos) com retorno à escala original ao soltar. */
export default function ImagemZoom({ uri, width, height }: { uri: string; width: number; height: number }) {
  const [escala, setEscala] = useState(1);
  const distanciaInicial = useRef<number | null>(null);
  const escalaInicial = useRef(1);
  const medir = (toques: readonly { pageX: number; pageY: number }[]) => {
    if (toques.length < 2) return;
    const d = Math.hypot(toques[0].pageX - toques[1].pageX, toques[0].pageY - toques[1].pageY);
    if (distanciaInicial.current === null) {
      distanciaInicial.current = d;
      escalaInicial.current = escala;
    } else if (distanciaInicial.current > 0) {
      setEscala(Math.max(1, Math.min(4, escalaInicial.current * d / distanciaInicial.current)));
    }
  };
  const terminar = () => { distanciaInicial.current = null; escalaInicial.current = 1; setEscala(1); };
  return (
    <View style={[styles.container, { width, height }]}
      onStartShouldSetResponder={event => event.nativeEvent.touches.length >= 2}
      onMoveShouldSetResponder={event => event.nativeEvent.touches.length >= 2}
      onResponderGrant={event => medir(event.nativeEvent.touches)}
      onResponderMove={event => medir(event.nativeEvent.touches)}
      onResponderRelease={terminar} onResponderTerminate={terminar}>
      <Image source={{ uri }} resizeMode="cover"
        style={{ width, height, backgroundColor: "#EEEEEE", transform: [{ scale: escala }] }} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { overflow: "hidden" } });
