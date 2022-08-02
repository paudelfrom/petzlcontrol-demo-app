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
  const [type, setType] = useState(Camera.Constants.Type.back);

  var asset = params.route.params;
  console.log("ASSET: ", asset);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
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

    var urlAct = BASEPATHETIQUETAS + "cloud/etiquetas/" + data;

    console.log("URL");
    console.log(urlAct);

    var config = {
      method: "get",
      url: urlAct,
      headers: {
        token: "123456789",
      },
    };

    setIsLoading(true);

    var self = this;
    await axios(config)
      .then(async function (response) {
        console.log(response.data);
        var obj = {};
        if (response.data.length > 0) {
          obj = response.data[0];

          if (
            obj.type == null &&
            obj.object_id == null &&
            obj.project_id == null
          ) {
            //Es etiqueta y no esta asignada
            console.log("ASSET: ", asset);
            console.log("ETIQUETA: ", data);
            console.log("Es etiqueta y no esta asignada");
            var url = BASEPATHETIQUETAS + "app/qr/associate";

            console.log("URL");
            console.log(url);

            var formdata = new FormData();
            formdata.append("asset", asset);
            formdata.append("qr", data);

            var config2 = {
              method: "POST",
              url: url,
              data: {
                asset: asset,
                qr: data,
              },
              headers: {
                token: "123456789",
              },
            };

            await axios(config2)
              .then(function (response2) {
                console.log(response2.data);
                alert(`Etiqueta asignada correctamente`);
                navigation.goBack();
                setIsLoading(false);
              })
              .catch(function (error) {
                // Error
                if (error.response) {
                  console.log(error.response.data);
                  alert(
                    `Error al asignar la etiqueta ${data} al asset ${asset}: ${error.response.data}`
                  );
                } else {
                  console.log("Error", error.message);
                  alert(
                    `Error al asignar la etiqueta: ${data} al asset:  ${asset}`
                  );
                }
              });
          }
        } else {
          alert(`Código escaneado no identificado en el sistema: ${data}`);
        }
        setIsLoading(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>Debe dar acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      {scanned == false ? (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.datamatrix],
          }}
          style={{ flex: 1 }}
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
