import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
};

export default function SignInRequiredModal({ visible, onClose, onSignIn }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.iconCircle}>
            <Ionicons name="lock-closed-outline" size={24} />
          </View>
          <Text style={s.title}>Please sign-in to checkout</Text>
          <Text style={s.subtitle}>
            You need an account to place orders and track delivery.
          </Text>

          <View style={s.row}>
            <Pressable style={[s.btn, s.btnGhost]} onPress={onClose}>
              <Text style={s.btnGhostText}>Not now</Text>
            </Pressable>
            <Pressable style={[s.btn, s.btnPrimary]} onPress={onSignIn}>
              <Text style={s.btnPrimaryText}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#4B5563", textAlign: "center", marginBottom: 16 },
  row: { flexDirection: "row", gap: 10 },
  btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, minWidth: 120, alignItems: "center" },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#fff", fontWeight: "600" },
  btnGhost: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#111827", fontWeight: "600" },
});
