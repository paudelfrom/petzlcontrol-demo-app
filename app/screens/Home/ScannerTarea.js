import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BASEPATHETIQUETAS } from "../../utils/constants";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import axios from "../../components/Auth/axiosApiInstance";
import { Icon } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ScannerTarea(params) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activos, setActivos] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();

    var act = [];
    Object.keys(params.route.params).forEach((zona) => {
      act = [...act, ...params.route.params[zona]];
    });
    setActivos(act);
    console.log("ACTIVOS:: ", act);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        console.log("UNFOCUS");
        setScanned(true);
      };
    }, [])
  );

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    var encontrado = false;
    activos.forEach((activo) => {
      if (activo.qr == data) {
        encontrado = true;
        navigation.navigate("webViewScreen", activo.url);
      }
    });
    if (!encontrado) {
      alert(`Este equipo no está asignado a la tarea`);
    }
  };

  if (hasPermission === null) {
    return <Text>Falta permiso de cámara</Text>;
  }
  if (hasPermission === false) {
    return <Text>No hay acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      {scanned == false ? (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.datamatrix],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <Button
          title={"Pulse para volver a escanear"}
          onPress={() => setScanned(false)}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
