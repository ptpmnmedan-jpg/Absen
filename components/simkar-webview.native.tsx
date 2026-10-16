import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { SIMKAR_HOST, SIMKAR_LOGIN_URL, isPresensiUrl, isSimkarUrl } from "@/constants/simkar";

const logo = require("@/assets/images/icon.png");

type LoadError = {
  code?: number;
  description?: string;
};

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <View style={styles.loadingOverlay} pointerEvents="none">
      <Image source={logo} style={styles.loadingLogo} resizeMode="contain" />
      <ActivityIndicator size="small" color="#0f766e" />
      <Text style={styles.loadingTitle}>Menghubungkan ke SIMKAR</Text>
      <Text style={styles.loadingCaption}>Menyiapkan halaman absensi Anda…</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${Math.max(8, progress * 100)}%` }]} />
      </View>
    </View>
  );
}

function ConnectionError({ error, onRetry }: { error: LoadError; onRetry: () => void }) {
  return (
    <View style={styles.errorOverlay}>
      <View style={styles.errorCard}>
        <View style={styles.errorMark}>
          <Text style={styles.errorMarkText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>SIMKAR belum bisa dibuka</Text>
        <Text style={styles.errorMessage}>
          Periksa koneksi internet Anda, lalu coba lagi. Login dan data absensi tetap diproses oleh server SIMKAR.
        </Text>
        {error.code ? <Text style={styles.errorCode}>Kode koneksi: {error.code}</Text> : null}
        <Pressable style={styles.retryButton} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retryButtonText}>Coba lagi</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SimkarWebView() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(SIMKAR_LOGIN_URL);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0.08);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const askedForLocation = useRef(false);

  const requestLocationPermission = useCallback(async (force = false) => {
    if (Platform.OS === "web" || (!force && askedForLocation.current)) return;
    askedForLocation.current = true;
    try {
      const existing = await Location.getForegroundPermissionsAsync();
      const permission = existing.granted
        ? existing
        : await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        askedForLocation.current = false;
        setLocationMessage("Izin lokasi belum diberikan. Aktifkan lokasi agar Presensi Mandiri dapat memvalidasi jarak ke kantor.");
      } else {
        setLocationMessage(null);
      }
    } catch {
      askedForLocation.current = false;
      setLocationMessage("Izin lokasi belum siap. Silakan coba lagi dari halaman Presensi Mandiri.");
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      Alert.alert("Keluar dari SIMKAR?", "Anda sedang berada di halaman utama aplikasi.", [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigation = useCallback(
    (navigation: WebViewNavigation) => {
      setCanGoBack(navigation.canGoBack);
      setCurrentUrl(navigation.url);
      if (isPresensiUrl(navigation.url)) {
        void requestLocationPermission();
      }
    },
    [requestLocationPermission],
  );

  const handleShouldStart = useCallback((request: { url: string }) => {
    if (isSimkarUrl(request.url)) return true;
    if (request.url.startsWith("mailto:") || request.url.startsWith("tel:") || request.url.startsWith("https://")) {
      void Linking.openURL(request.url).catch(() => undefined);
    }
    return false;
  }, []);

  const retry = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    setProgress(0.08);
    setRetryKey((value) => value + 1);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.brandGroup}>
          <Image source={logo} style={styles.brandLogo} resizeMode="contain" />
          <View>
            <Text style={styles.brandName}>SIMKAR</Text>
            <Text style={styles.brandCaption}>Absen Karyawan</Text>
          </View>
        </View>
        <Pressable
          style={styles.reloadButton}
          onPress={() => webViewRef.current?.reload()}
          accessibilityRole="button"
          accessibilityLabel="Muat ulang halaman SIMKAR"
        >
          <Text style={styles.reloadIcon}>↻</Text>
          <Text style={styles.reloadText}>Muat ulang</Text>
        </Pressable>
      </View>
      {locationMessage ? (
        <Pressable style={styles.locationNotice} onPress={() => void requestLocationPermission(true)}>
          <Text style={styles.locationNoticeText}>{locationMessage}</Text>
          <Text style={styles.locationNoticeAction}>Coba lagi</Text>
        </Pressable>
      ) : null}
      <View style={styles.webViewFrame}>
        <WebView
          key={retryKey}
          ref={webViewRef}
          source={{ uri: SIMKAR_LOGIN_URL }}
          style={styles.webView}
          originWhitelist={["https://*"]}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          geolocationEnabled
          setSupportMultipleWindows={false}
          startInLoadingState={false}
          cacheEnabled
          onNavigationStateChange={handleNavigation}
          onShouldStartLoadWithRequest={handleShouldStart}
          onLoadStart={() => {
            setLoading(true);
            setLoadError(null);
            setProgress(0.12);
          }}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
          onLoadEnd={() => {
            setLoading(false);
            setProgress(1);
          }}
          onError={({ nativeEvent }) => {
            setLoading(false);
            setLoadError({ code: nativeEvent.code, description: nativeEvent.description });
          }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 400) {
              setLoadError({ code: nativeEvent.statusCode, description: "Server SIMKAR mengembalikan respons yang tidak dapat diproses." });
            }
          }}
          renderLoading={() => <View />}
          renderError={() => <View />}
          applicationNameForUserAgent="SIMKAR-Absen-Android"
        />
        {loading && !loadError ? <LoadingOverlay progress={progress} /> : null}
        {loadError ? <ConnectionError error={loadError} onRetry={retry} /> : null}
      </View>
      <View style={styles.bottomHint}>
        <Text style={styles.bottomHintText}>
          {isPresensiUrl(currentUrl) ? `Presensi aktif · ${SIMKAR_HOST}` : "Login dan navigasi menggunakan server SIMKAR"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f7f6" },
  topBar: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#dce9e6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandLogo: { width: 38, height: 38, borderRadius: 10 },
  brandName: { color: "#123d3a", fontSize: 16, fontWeight: "800", letterSpacing: 0.6 },
  brandCaption: { color: "#6b8581", fontSize: 11, marginTop: 1 },
  reloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#c6dcd8",
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  reloadIcon: { color: "#0f766e", fontSize: 18, lineHeight: 18, fontWeight: "700" },
  reloadText: { color: "#0f766e", fontSize: 11, fontWeight: "700" },
  locationNotice: {
    backgroundColor: "#fff8e7",
    borderBottomWidth: 1,
    borderBottomColor: "#f0d58b",
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  locationNoticeText: { flex: 1, color: "#775713", fontSize: 12, lineHeight: 17 },
  locationNoticeAction: { color: "#9a6c06", fontSize: 12, fontWeight: "800" },
  webViewFrame: { flex: 1, position: "relative" },
  webView: { flex: 1, backgroundColor: "#ffffff" },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fbfa",
    padding: 28,
  },
  loadingLogo: { width: 82, height: 82, borderRadius: 22, marginBottom: 18 },
  loadingTitle: { marginTop: 12, color: "#164e49", fontSize: 18, fontWeight: "800" },
  loadingCaption: { marginTop: 6, color: "#718884", fontSize: 13 },
  progressTrack: { width: "72%", maxWidth: 260, height: 4, marginTop: 20, borderRadius: 4, backgroundColor: "#dce9e6", overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 4, backgroundColor: "#0f766e" },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fbfa",
    padding: 24,
  },
  errorCard: {
    width: "100%",
    maxWidth: 390,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce9e6",
    alignItems: "center",
    shadowColor: "#123d3a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  errorMark: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff1d6", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  errorMarkText: { color: "#a06a05", fontSize: 24, fontWeight: "800" },
  errorTitle: { color: "#123d3a", fontSize: 18, fontWeight: "800", textAlign: "center" },
  errorMessage: { marginTop: 9, color: "#657f7b", fontSize: 13, lineHeight: 20, textAlign: "center" },
  errorCode: { marginTop: 10, color: "#9aaba8", fontSize: 11 },
  retryButton: { marginTop: 20, minWidth: 150, alignItems: "center", borderRadius: 22, backgroundColor: "#0f766e", paddingHorizontal: 22, paddingVertical: 12 },
  retryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  bottomHint: { minHeight: 28, alignItems: "center", justifyContent: "center", backgroundColor: "#e9f2f0" },
  bottomHintText: { color: "#64817c", fontSize: 10 },
});
