import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { sendInquiry } from "./api";
import ServerBadge from "./ServerBadge";
import { C } from "./theme";

export default function InquiryScreen() {
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false); const [info, setInfo] = useState(null);

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) return Alert.alert("Missing details", "Please fill in all fields.");
    setBusy(true);
    try {
      const { data, ms } = await sendInquiry(name, phone, message);
      setInfo({ server: data.server, ms });
      setName(""); setPhone(""); setMessage("");
      Alert.alert("Thank you!", "We will contact you soon.");
    } catch (e) { Alert.alert("Could not send", e.message); }
    setBusy(false);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>Request a quote</Text>
      <Text style={s.l}>Name</Text><TextInput style={s.in} value={name} onChangeText={setName} />
      <Text style={s.l}>Phone</Text><TextInput style={s.in} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={s.l}>Message</Text><TextInput style={[s.in, { height: 100, textAlignVertical: "top" }]} value={message} onChangeText={setMessage} multiline />
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.bt}>Send inquiry</Text>}
      </TouchableOpacity>
      {info && <ServerBadge server={info.server} ms={info.ms} />}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: "700", color: C.navy, marginBottom: 8 }, l: { marginTop: 12, marginBottom: 4, color: C.text },
  in: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#c5ced8", borderRadius: 6, padding: 10, fontSize: 16 },
  btn: { backgroundColor: C.teal, padding: 14, borderRadius: 6, alignItems: "center", marginTop: 20 }, bt: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
