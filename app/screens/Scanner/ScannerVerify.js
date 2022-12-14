import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BASEPATH, BASEPATHETIQUETAS } from "../../utils/constants";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import axios from "../../components/Auth/axiosApiInstance";
import { Icon, Divider, Button } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import basic react native components
import { BottomSheet } from "react-native-btr";
import Layout from "../../utils/Layout";

export default function ScannerVerify() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [session, setSession] = useState({});
  const [asset, setAsset] = useState({});

  const [tareas, setTareas] = useState([]);

  const navigation = useNavigation();

  const [visible, setVisible] = useState(false);

  const toggleBottomNavigationView = () => {
    //Toggling the visibility state of the bottom sheet
    if (visible) {
      setTareas([]);
    }
    setVisible(!visible);
  };

  useEffect(() => {
    (async () => {
      // You can await here
      let userDataItem = await AsyncStorage.getItem("userData");
      setUserData(JSON.parse(userDataItem));

      let sessionItem = await AsyncStorage.getItem("token");
      setSession(JSON.parse(sessionItem));
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log("FOCUS");

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        console.log("UNFOCUS");
        setTareas([]);
        setVisible(false);
        setScanned(true);
      };
    }, [])
  );

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);

    console.log(type);
    console.log(data);

    var requestURL = "";
    requestURL = BASEPATH + "/api/tags/search/" + data;

    axios
      .get(requestURL)
      .then((response) => {
        console.log("RESP CLIENTS");
        if (response.status === 200) {
          console.log("OK");

          // console.log("RESPUESTA: ", response.data);

          if (response.data.length == 0) {
            console.log("VACIO");
          } else {
            var objeto = response.data.data;

            //  console.log(objeto);

            if (objeto.type_tag.id == 1) {
              setAsset(response.data.data);
              //Es asset
              navigation.navigate("loadhtmlformrevisionepi", {
                asset: response.data.data,
              });

              //setTareas(currentTareas);
              setVisible(true);

              //console.log("IDUSERROLE:: ", userData.roles[0].id);
            }
          }
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
      });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log(item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          console.log("PINCHA EN: ", item.code);
          console.log("ES EL ASSET: ", asset);
          if (item.code == "view_asset") {
            //Ver ficha
            navigation.navigate("productDetail", {
              id_asset: asset.object.id,
            });
          }
          if (item.code == "revisar_epi") {
            //Revisar EPI
            navigation.navigate("loadhtmlformrevisionepi", {
              asset: asset,
            });
          }
          if (item.code == "incidencia_epi") {
            //Crear incidencia
            navigation.navigate("loadhtmlformincidencia", {
              asset: asset,
            });
          }
          if (item.code == "ubicar_epi") {
            //Crear incidencia
            navigation.navigate("loadhtmlformubicar", {
              asset: asset,
            });
          }
          if (item.code == "entrega_epi") {
            //Crear incidencia
            var arrayAssets = [];
            var obj = {
              id: asset.object.id,
              name: asset.name,
            };
            arrayAssets.push(obj);
            console.log(arrayAssets);
            navigation.navigate("loadhtmlformentrega", {
              arrayAssets: arrayAssets,
            });
          }
        }}
      >
        <View
          style={{
            height: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Image source={item.image} style={{ height: 30, width: 30 }} />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              width: "50%",
            }}
          >
            <Text style={styles.textoTarea}>{item.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Loading
        isVisible={isLoading}
        text={"Cargando"}
        backgroundColor={COLORS.primary}
      ></Loading>
      {scanned == false ? (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.datamatrix],
          }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        /*    <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        /> */

        <Button
          icon={{
            type: "material-community",
            name: "camera-party-mode",
            size: 100,
            color: COLORS.primary,
          }}
          buttonStyle={{
            borderColor: "transparent",
          }}
          type="outline"
          titleStyle={{ color: COLORS.primary, fontSize: 10 }}
          containerStyle={{
            margin: 5,
          }}
          onPress={() => setScanned(false)}
        />
        /*  <Button
          icon={{
            type: "material-community",
            name: "camera-party-mode",
            size: 100,
            color: COLORS.primary,
          }}
          containerStyle={{ backgroundColor: "transparent" }}
          onPress={() => setScanned(false)}
        /> */
      )}
      {
        <BottomSheet
          visible={visible}
          //setting the visibility state of the bottom shee
          onBackButtonPress={toggleBottomNavigationView}
          //Toggling the visibility state on the click of the back botton
          onBackdropPress={toggleBottomNavigationView}
          //Toggling the visibility state on the clicking out side of the sheet
        >
          {asset.object ? (
            <View style={styles.contentContainer}>
              <Text h3 style={styles.titleText}>
                {asset.object.data.name}
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <View style={styles.viewFamily}>
                  <Text style={styles.textFamily}>Estado: </Text>
                  <Text style={styles.textFamily}>{asset.object.status}</Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <FlatList
                data={tareas}
                renderItem={(item) => (
                  <Item item={item} navigation={navigation} />
                )}
                keyExtractor={(item, index) => index.toString()}
                extraData={tareas}
              ></FlatList>
            </View>
          ) : (
            <></>
          )}
        </BottomSheet>
      }
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  contentContainer: {
    backgroundColor: "#fff",
    height: 400,
    padding: 20,
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
    marginHorizontal: 24,
    marginTop: 9,
    height: 55,
  },
  textoTarea: {
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "left",
    width: "100%",
    color: "#474952",
    paddingLeft: 24,
  },
  itemIcon: {
    height: "100%",
    width: "100%",
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
  },
  viewFamily: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  textFamily: {
    color: COLORS.greyDark,
  },
  textCodArt: {
    color: COLORS.foreground,
  },
  titleText: {
    marginBottom: 20,
    fontSize: 18,
  },
  divider: {
    backgroundColor: "#C0C0C0",
    width: Layout.window.width - 60,
    marginTop: 20,
  },
});
