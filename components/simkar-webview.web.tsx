import { useEffect, useState, type CSSProperties } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SIMKAR_LOGIN_URL } from "@/constants/simkar";

const logo = require("@/assets/images/icon.png");

export default function SimkarWebView() {
  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setFailed(true), 12000);
    return () => clearTimeout(timer);
  }, [loading, frameKey]);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setFrameKey((value) => value + 1);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.brandGroup}>
          <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
          <View>
            <Text style={styles.brandName}>SIMKAR</Text>
            <Text style={styles.brandCaption}>Absen Karyawan</Text>
          </View>
        </View>
        <Pressable style={styles.reloadButton} onPress={retry}>
          <Text style={styles.reloadIcon}>↻</Text>
          <Text style={styles.reloadText}>Muat ulang</Text>
        </Pressable>
      </View>
      <View style={styles.frameWrap}>
        {loading && !failed ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <Image source={logo} style={styles.loadingLogo} resizeMode="contain" />
            <Text style={styles.loadingTitle}>Menghubungkan ke SIMKAR</Text>
            <Text style={styles.loadingCaption}>Preview web menggunakan halaman server asli.</Text>
          </View>
        ) : null}
        {failed ? (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <View style={styles.errorMark}><Text style={styles.errorMarkText}>!</Text></View>
              <Text style={styles.errorTitle}>SIMKAR belum bisa dibuka</Text>
              <Text style={styles.errorMessage}>Periksa koneksi internet atau status server, lalu coba lagi.</Text>
              <Pressable style={styles.retryButton} onPress={retry}><Text style={styles.retryButtonText}>Coba lagi</Text></Pressable>
            </View>
          </View>
        ) : null}
        {(() => {
          return (
            <iframe
              key={frameKey}
              title="SIMKAR Absen Karyawan"
              src={SIMKAR_LOGIN_URL}
              allow="geolocation"
              onLoad={() => { setFailed(false); setLoading(false); }}
              style={iframeStyle}
            />
          );
        })()}
      </View>
      <View style={styles.bottomHint}>
        <Text style={styles.bottomHintText}>Preview web · login menggunakan server SIMKAR</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f7f6" },
  topBar: { minHeight: 60, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#dce9e6", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandLogo: { width: 38, height: 38, borderRadius: 10 },
  brandName: { color: "#123d3a", fontSize: 16, fontWeight: "800", letterSpacing: 0.6 },
  brandCaption: { color: "#6b8581", fontSize: 11, marginTop: 1 },
  reloadButton: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: "#c6dcd8", borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  reloadIcon: { color: "#0f766e", fontSize: 18, lineHeight: 18, fontWeight: "700" },
  reloadText: { color: "#0f766e", fontSize: 11, fontWeight: "700" },
  frameWrap: { flex: 1, position: "relative" },
  loadingOverlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fbfa", zIndex: 1 },
  loadingLogo: { width: 82, height: 82, borderRadius: 22, marginBottom: 18 },
  loadingTitle: { color: "#164e49", fontSize: 18, fontWeight: "800" },
  loadingCaption: { marginTop: 7, color: "#718884", fontSize: 13 },
  errorOverlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fbfa", padding: 24, zIndex: 2 },
  errorCard: { width: "100%", maxWidth: 390, padding: 24, borderRadius: 20, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dce9e6", alignItems: "center" },
  errorMark: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff1d6", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  errorMarkText: { color: "#a06a05", fontSize: 24, fontWeight: "800" },
  errorTitle: { color: "#123d3a", fontSize: 18, fontWeight: "800", textAlign: "center" },
  errorMessage: { marginTop: 9, color: "#657f7b", fontSize: 13, lineHeight: 20, textAlign: "center" },
  retryButton: { marginTop: 20, minWidth: 150, alignItems: "center", borderRadius: 22, backgroundColor: "#0f766e", paddingHorizontal: 22, paddingVertical: 12 },
  retryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  bottomHint: { minHeight: 28, alignItems: "center", justifyContent: "center", backgroundColor: "#e9f2f0" },
  bottomHintText: { color: "#64817c", fontSize: 10 },
});

const iframeStyle: CSSProperties = {
  border: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "#ffffff",
};
