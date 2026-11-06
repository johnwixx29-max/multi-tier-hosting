import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { checkHealth } from "./api";
import { API_BASE } from "./config";
import { C } from "./theme";

// Demo screen: tap "Ping" repeatedly - the server ID changes as the load balancer rotates servers.
export default function StatusScreen() {
  const [log, setLog] = useState([]);
  const ping = async () => {
    try {
      const { data, ms } = await checkHealth();
      setLog((l) => [{ t: new Date().toLocaleTimeString(), txt: `${data.status} • ${data.server} • ${ms} ms`, ok: true }, ...l].slice(0, 30));
    } catch (e) {
      setLog((l) => [{ t: new Date().toLocaleTimeString(), txt: e.message, ok: false }, ...l].slice(0, 30));
    }
  };
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={s.h}>Server status</Text>
      <Text style={s.sub}>Backend: {API_BASE}</Text>
      <TouchableOpacity style={s.btn} onPress={ping}><Text style={s.bt}>Ping server</Text></TouchableOpacity>
      <ScrollView style={{ marginTop: 12 }}>
        {log.map((x, i) => <Text key={i} style={[s.row, { color: x.ok ? C.text : C.err }]}>{x.t}  {x.txt}</Text>)}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: "700", color: C.navy }, sub: { color: "#667", marginVertical: 6, fontSize: 12 },
  btn: { backgroundColor: C.orange, padding: 12, borderRadius: 6, alignItems: "center" }, bt: { color: "#fff", fontWeight: "600", fontSize: 16 },
  row: { paddingVertical: 4, fontSize: 13 },
});
