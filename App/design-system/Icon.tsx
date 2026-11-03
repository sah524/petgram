import React from "react";
import { Ionicons } from "@expo/vector-icons";
export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({ name, size = 22, color = "#211F1A" }: { name: IconName; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} />;
}
