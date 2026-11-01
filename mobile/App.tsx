import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useLocation } from './src/hooks/useLocation';
import { externalApiService, ExchangeRateResponse } from './src/services/externalApiService';
import { ventaService, MobileVenta } from './src/services/ventaService';

function MainApp() {
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const { coords, errorMsg: locationError, isLoading: locationLoading } = useLocation();

  // Login form state
  const [codigo, setCodigo] = useState('ADMIN01');
  const [clave, setClave] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);

  // External API state
  const [tipoCambio, setTipoCambio] = useState<ExchangeRateResponse | null>(null);

  // Camera Sensor state
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // Sales list state
  const [ventas, setVentas] = useState<MobileVenta[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // 1. Fetch External API (Tipo de Cambio SUNAT)
      externalApiService.obtenerTipoCambio().then(setTipoCambio);

      // 2. Fetch Core Backend Sales
      cargarVentas();
    }
  }, [isAuthenticated]);

  const cargarVentas = async () => {
    setLoadingVentas(true);
    try {
      const data = await ventaService.obtenerVentas();
      setVentas(data);
    } catch {
      // Demo sales fallback
      setVentas([
        { id: 101, clienteId: 1, usuarioId: 'ADMIN01', total: 45.5, estado: 'REGISTRADO' },
        { id: 102, clienteId: 2, usuarioId: 'CAJERO01', total: 18.0, estado: 'REGISTRADO' },
      ]);
    } finally {
      setLoadingVentas(false);
    }
  };

  const handleLogin = async () => {
    if (!codigo.trim() || !clave.trim()) {
      Alert.alert('Atención', 'Ingrese usuario y contraseña.');
      return;
    }
    setLoginLoading(true);
    try {
      await login(codigo, clave);
    } catch (err: unknown) {
      Alert.alert('Error de Autenticación', (err as Error)?.message || 'Credenciales inválidas');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOpenScanner = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert('Permiso Requerido', 'Se requiere acceso a la cámara para escanear productos.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setShowCamera(false);
    setScannedCode(data);
    Alert.alert('Código Escaneado', `Producto detectado: ${data}`);
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Iniciando CaseroYa Mobile...</Text>
      </View>
    );
  }

  // Camera Scanner Modal View
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraTitle}>Escanea el código de barras o QR</Text>
          <TouchableOpacity
            style={styles.closeCameraButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.closeCameraText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Login View
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginCard}>
          <Text style={styles.logoText}>CaseroYa</Text>
          <Text style={styles.subtitleText}>Módulo Móvil React Native</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código de Usuario</Text>
            <TextInput
              style={styles.input}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="ADMIN01"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={clave}
              onChangeText={setClave}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loginLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated Main View
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CaseroYa Mobile</Text>
          <Text style={styles.headerUser}>Operador: {user?.codigoUsuario}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sensor 1: Cámara Escáner */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📷 Sensor 1: Cámara (Escáner)</Text>
          <Text style={styles.cardDescription}>
            Lectura de código de barras / QR de comprobantes o productos.
          </Text>
          {scannedCode && (
            <Text style={styles.sensorOutput}>Último escaneo: {scannedCode}</Text>
          )}
          <TouchableOpacity style={styles.sensorButton} onPress={handleOpenScanner}>
            <Text style={styles.sensorButtonText}>Abrir Cámara Escáner</Text>
          </TouchableOpacity>
        </View>

        {/* Sensor 2: GPS / Ubicación */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Sensor 2: GPS (Ubicación)</Text>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : coords ? (
            <Text style={styles.sensorOutput}>
              Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
            </Text>
          ) : (
            <Text style={styles.errorText}>{locationError || 'Sin señal GPS'}</Text>
          )}
          <Text style={styles.cardFooterText}>
            Geolocalización para auditoría y registro de ventas móviles.
          </Text>
        </View>

        {/* API Externa: Tipo de Cambio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 API Externa: Tipo de Cambio SBS</Text>
          {tipoCambio ? (
            <View style={styles.row}>
              <View style={styles.exchangeBox}>
                <Text style={styles.exchangeLabel}>Compra</Text>
                <Text style={styles.exchangeValue}>S/ {tipoCambio.precioCompra}</Text>
              </View>
              <View style={styles.exchangeBox}>
                <Text style={styles.exchangeLabel}>Venta</Text>
                <Text style={styles.exchangeValue}>S/ {tipoCambio.precioVenta}</Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator size="small" color="#4F46E5" />
          )}
        </View>

        {/* Backend REST: Ventas Recientes */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>🛒 Ventas del Backend (Axios)</Text>
            <TouchableOpacity onPress={cargarVentas}>
              <Text style={styles.linkText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {loadingVentas ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : ventas.length === 0 ? (
            <Text style={styles.emptyText}>No hay ventas registradas.</Text>
          ) : (
            <FlatList
              data={ventas.slice(0, 5)}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.ventaItem}>
                  <Text style={styles.ventaId}>Venta #{item.id}</Text>
                  <Text style={styles.ventaTotal}>S/ {item.total?.toFixed(2)}</Text>
                  <Text style={styles.ventaEstado}>{item.estado}</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  loginCard: {
    margin: 24,
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerUser: {
    fontSize: 12,
    color: '#64748B',
  },
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  cardFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  sensorOutput: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  sensorButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sensorButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangeBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  exchangeLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  exchangeValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },
  linkText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 10,
  },
  ventaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ventaId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  ventaTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  ventaEstado: {
    fontSize: 11,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeCameraButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeCameraText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
