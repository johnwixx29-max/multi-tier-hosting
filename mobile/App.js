import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StatusBar, StyleSheet } from "react-native";
import ProductsScreen from "./src/ProductsScreen";
import InquiryScreen from "./src/InquiryScreen";
import StatusScreen from "./src/StatusScreen";
import { C } from "./src/theme";

const TABS = [
  { key: "products", label: "Products", Comp: ProductsScreen },
  { key: "inquiry", label: "Inquiry", Comp: InquiryScreen },
  { key: "status", label: "Status", Comp: StatusScreen },
];

export default function App() {
  const [tab, setTab] = useState("products");
  const Active = TABS.find((t) => t.key === tab).Comp;
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <View style={s.header}><Text style={s.title}>Sharma Metal Works</Text></View>
      <View style={{ flex: 1 }}><Active /></View>
      <View style={s.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={s.tab} onPress={() => setTab(t.key)}>
            <Text style={[s.tl, tab === t.key && s.on]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: StatusBar.currentHeight || 0 },
  header: { backgroundColor: C.navy, padding: 16 }, title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderColor: C.border, backgroundColor: "#fff" },
  tab: { flex: 1, padding: 14, alignItems: "center" }, tl: { color: "#667", fontWeight: "600" }, on: { color: C.teal },
});
