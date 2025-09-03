import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("addresses").then((data) => {
      if (data) setAddresses(JSON.parse(data));
    });
  }, []);

  const addAddress = async () => {
    if (!newAddress.trim()) return;
    const updated = [...addresses, newAddress];
    setAddresses(updated);
    await AsyncStorage.setItem("addresses", JSON.stringify(updated));
    setNewAddress("");
  };

  const removeAddress = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    await AsyncStorage.setItem("addresses", JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Addresses</Text>
      <FlatList
        data={addresses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.addressRow}>
            <Text style={styles.address}>{item}</Text>
            <TouchableOpacity onPress={() => removeAddress(index)}>
              <Text style={styles.delete}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter new address"
        placeholderTextColor="#666"
        value={newAddress}
        onChangeText={setNewAddress}
      />
      <TouchableOpacity style={styles.button} onPress={addAddress}>
        <Text style={styles.buttonText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121216", padding: 20 },
  title: { color: "#fff", fontSize: 20, fontWeight: "600", marginBottom: 20 },
  addressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  address: { color: "#fff", fontSize: 14, flex: 1 },
  delete: { color: "#FF3366", marginLeft: 12 },
  input: { backgroundColor: "#1E1E22", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: "#FF3366", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
