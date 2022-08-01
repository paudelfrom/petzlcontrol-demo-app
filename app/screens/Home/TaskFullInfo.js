import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, FlatList, Image, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  SearchBar,
  ListItem,
  Icon,
  BottomSheet,
  Text,
  Button,
  Tab,
  TabView,
  useTheme,
} from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProducts } from "../../utils/api";
import { BASEPATH, BASEPATHETIQUETAS } from "../../utils/constants";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import { ScrollView } from "react-native-gesture-handler";
import i18n from "../../../i18n";
import moment from "moment";
import axios from "../../components/Auth/axiosApiInstance";

export default function TaskInfo(params) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [zonas, setZonas] = useState({});
  const [index, setIndex] = useState(0);

  var sistema = params.route.params.sistema;
  var sistemaName = params.route.params.sistemaName;
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      console.log("FOCUS");
      async function fetchData() {
        // You can await here

        // setZonas(sistema);
        setIsLoading(true);
        console.log("item:: ", sistema);
        console.log("sistemaName:: ", sistemaName);
        console.log(
          "id_revision_sistema",
          params.route.params.id_revision_sistema
        );
        console.log("id_fecha", params.route.params.id_fecha);

        var urlAct =
          BASEPATHETIQUETAS +
          "cloud/task/" +
          params.route.params.id_revision_sistema +
          "/" +
          params.route.params.id_fecha;

        console.log("URL");
        console.log(urlAct);

        var config = {
          method: "get",
          url: urlAct,
          headers: {
            token: "123456789",
          },
        };
        await axios(config)
          .then(async function (response) {
            console.log("DATA:: ", response.data[sistemaName]);
            //setSistemas(response.data);
            var zona = response.data[sistemaName];
            setZonas(zona);
            setIsLoading(false);
          })
          .catch(function (error) {
            console.log(error);
            setIsLoading(false);
          });
      }

      fetchData();

      async function putEtiquetas(response) {
        if (Object.keys(response.data).length > 0) {
          for (let zona of Object.keys(response.data)) {
            if (Object.keys(response.data[zona]).length > 0) {
              for (let activos of Object.keys(response.data[zona])) {
                var arrayActivos = response.data[zona][activos];
                for (let activo of arrayActivos) {
                  // console.log("ACTIVO:: ", activo);

                  if (activo.id_activo != null) {
                    var urlAct2 =
                      BASEPATHETIQUETAS + "cloud/equipos/" + activo.id_activo;

                    // console.log("URL2");
                    console.log(urlAct2);

                    var config2 = {
                      method: "get",
                      url: urlAct2,
                      headers: {
                        token: "123456789",
                      },
                    };

                    await axios(config2)
                      .then(function (response2) {
                        if (response2.data.length > 0) {
                          activo.qr = response2.data[0].qr;
                          activo.etiqueta_id = response2.data[0].etiqueta_id;
                          if (
                            response2.data[0].name_informe.split("#")[1] !=
                              null &&
                            response2.data[0].name_informe.split("#")[1] !=
                              undefined
                          ) {
                            activo.numero =
                              response2.data[0].name_informe.split("#")[1];
                          } else {
                            activo.numero = "";
                          }
                          // console.log("ACTIVO:: ", activo);
                        }
                      })
                      .catch(function (error) {
                        console.log(error);
                        setIsLoading(false);
                      });
                  }
                }
              }
            }
          }
        }
        console.log("HAGO RETURN");
        return response;
      }

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        console.log("UNFOCUS");
      };
    }, [])
  );

  useEffect(async () => {
    navigation.setOptions({
      title: sistemaName,
    });
  }, []);

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log("ITEM::: ", item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          if (item.id_activo == null && item.qr == null) {
            console.log("URL::: ", item.url);
            navigation.navigate("webViewScreen", item.url);
          } else if (item.id_activo != null && item.qr == null) {
            console.log("id_activo::: ", item.id_activo);
            navigation.navigate("scannerPonerEtiqueta", item.id_activo);
          } else {
            console.log("URL::: ", item.url);
            navigation.navigate("webViewScreen", item.url);
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
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "50%",
              marginLeft: 10,
            }}
          >
            {item.id_activo == null ? (
              <Text style={styles.textoTarea}>Revisión genérica</Text>
            ) : item.id_activo != null && item.qr != null ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                {item.name_informe.split("#")[1] != null &&
                item.name_informe.split("#")[1] != undefined ? (
                  <Text style={styles.textoTarea}>
                    #{item.name_informe.split("#")[1]} - {item.qr}
                  </Text>
                ) : (
                  <Text style={styles.textoTarea}># - {item.qr}</Text>
                )}

                {item.completada == "0" ? (
                  <Text style={styles.estado}>Incompleto</Text>
                ) : (
                  <Text style={styles.estado}>Completo</Text>
                )}
              </View>
            ) : (
              <Text style={styles.textoTarea}>
                #{item.numero} - {item.qr}
              </Text>
            )}
          </View>
          {item.id_activo == null && item.qr == null ? (
            <Icon
              style={styles.itemIcon}
              type="material-community"
              name="chevron-right"
              size={30}
            ></Icon>
          ) : item.id_activo != null && item.qr == null ? (
            <View
              style={{
                alignItems: "center",
                width: 100,
              }}
            >
              <Image
                style={{ width: 32, height: 32 }}
                source={require("./../../../assets/line-scan.png")}
              />
              <Text style={styles.textoEtiqueta}>Poner etiqueta</Text>
            </View>
          ) : (
            <Icon
              style={styles.itemIcon}
              type="material-community"
              name="chevron-right"
              size={30}
            ></Icon>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaProvider>
      <Loading
        isVisible={isLoading}
        text={"Cargando"}
        backgroundColor={COLORS.primary}
      ></Loading>
      {zonas && Object.keys(zonas).length > 0 ? (
        <>
          <Tab
            value={index}
            onChange={setIndex}
            indicatorStyle={{
              backgroundColor: "#474952",
            }}
          >
            {Object.keys(zonas).map((n) => (
              <Tab.Item
                key={n.toString()}
                title={n.toString()}
                style={{
                  backgroundColor: "white",
                  color: "black",
                }}
              />
            ))}
          </Tab>
          <TabView value={index} onChange={setIndex}>
            {Object.keys(zonas).map((n) => (
              <TabView.Item
                onMoveShouldSetResponder={(e) => e.stopPropagation()}
                key={n.toString()}
                style={{ width: "100%" }}
              >
                <FlatList
                  data={zonas[n.toString()]}
                  renderItem={(item) => (
                    <Item item={item} navigation={navigation} />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  extraData={zonas[n.toString()]}
                  contentContainerStyle={{ paddingBottom: 30 }}
                ></FlatList>
              </TabView.Item>
            ))}
          </TabView>
          <View style={styles.bar}>
            <View style={styles.barInside}></View>
            <TouchableOpacity
              onPress={() => {
                console.log("Zonas: ", zonas);
                navigation.navigate("scannerTarea", zonas);
              }}
            >
              <Image
                style={{ width: 76, height: 76, zIndex: 100, marginBottom: 30 }}
                source={require("./../../../assets/line-scan.png")}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <></>
      )}
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 24,
    marginTop: 9,
    height: 70,
  },
  textoTarea: {
    height: "100%",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 17,
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
    color: "#474952",
  },
  estado: {
    height: "100%",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "right",
    flex: 1,
    color: "#474952",
  },
  itemIcon: {
    height: "100%",
    width: "100%",
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
  },
  bar: {
    width: "100%",
    height: Platform.OS === "ios" ? 100 : 85,
    alignItems: "center",
  },
  barInside: {
    width: "100%",
    height: Platform.OS === "ios" ? 60 : 49,
    backgroundColor: "white",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
  },
  textoEtiqueta: {
    fontSize: 10,
    lineHeight: 12,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    color: "#474952",
    opacity: 0.5,
  },
});
