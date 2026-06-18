import * as React from "react";
import {
  StyleSheet,
  GestureResponderEvent,
  Text,
  Pressable,
} from "react-native";

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
    textAlign: "center",
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 30,
    paddingRight: 30,
    fontSize: 15,
    backgroundColor: "#2f80ed",
  },
  text: {
    color: "white",
  },
});
