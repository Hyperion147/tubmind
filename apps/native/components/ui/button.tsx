import type { GestureResponderEvent } from "react-native";
import { Pressable, StyleSheet, Text } from "react-native";

export interface ButtonProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export function Button({ text, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    maxWidth: 200,
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: "#2f80ed",
  },
  text: {
    color: "white",
    textAlign: "center",
  },
});
