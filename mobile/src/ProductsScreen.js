import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { getProducts } from "./api";
import ServerBadge from "./ServerBadge";
import { C } from "./theme";

export default function ProductsScreen() {
  const [items, setItems] = useState([]);
  const [server, setServer] = useState(null);
  const [ms, setMs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const { data, ms } = await getProducts();
      setItems(data.products); setServer(data.server); setMs(ms);
    } catch (e) { setError(e.message); }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={C.teal} />;

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={s.err}>{error}{"\n"}Pull down to retry.</Text> : <ServerBadge server={server} ms={ms} />}
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        refreshing={refreshing}
        onRefresh={() => load(true)}   // pull-to-refresh: each pull may hit a different server
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.cat}>{item.category}</Text>
            </View>
            <Text style={s.price}>₹{item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: "#fff", marginHorizontal: 12, marginBottom: 8, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600", color: C.text }, cat: { color: "#667", marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700", color: C.teal },
  err: { color: C.err, margin: 16, textAlign: "center" },
});
