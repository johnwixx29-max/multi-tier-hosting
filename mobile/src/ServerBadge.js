import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "./theme";

// Shows which server answered + response time. Great for demonstrating load balancing.
export default function ServerBadge({ server, ms }) {
  if (!server) return null;
  return (
    <View style={s.box}>
      <Text style={s.t}>Served by: {server}{ms != null ? `  •  ${ms} ms` : ""}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  box: { backgroundColor: "#e8f1f3", padding: 8, borderRadius: 6, margin: 12 },
  t: { color: C.teal, fontSize: 12, fontFamily: undefined },
});
