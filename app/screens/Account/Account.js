import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import {
  SearchBar,
  ListItem,
  Icon,
  BottomSheet,
  Text,
  Button,
  Overlay,
  Divider,
} from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProducts } from "../../utils/api";
import { BASEPATH } from "../../utils/constants";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import { ScrollView } from "react-native-gesture-handler";
import i18n from "../../../i18n";
import moment from "moment";
import axios from "../../components/Auth/axiosApiInstance";
import Layout from "../../utils/Layout";
import { MustLogout } from "../../utils/helpers";

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

export default function Account(params) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleOverlay, setVisibleOverlay] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsSearch, setAssetsSearch] = useState([]);
  const [search, setSearch] = useState("");
  const [assetSelected, setAssetSelected] = useState({});
  const [userData, setUserData] = useState({});

  const [offset, setOffset] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setOffset(1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      console.log("FOCUS");
      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        await MustLogout(navigation);
        loadAssets();
      }

      fetchData();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions

        // Guardamos info en localStorage de search, selectedFamily y selectedFormat
        console.log("UNFOCUS");
      };
    }, [])
  );

  async function loadAssets(nuevoOffset) {
    var off = nuevoOffset;
    if (!off) {
      off = offset;
    }
    var requestURL = BASEPATH + "/api/assets/list";
    console.log(requestURL);

    let userDataItem = await AsyncStorage.getItem("userData");
    setUserData(JSON.parse(userDataItem));

    var usuario = JSON.parse(userDataItem);

    //    console.log("USER:: ", JSON.parse(userDataItem));

    //  setIsLoading(true);
    setIsFetching(true);

    console.log("OFFSET:: ", off);

    var config = {
      method: "post",
      url: requestURL,
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "X-CSRF-TOKEN": "",
      },
      data: {
        id_client: usuario.clients[0].id,
        per_page: limit,
        page: off,
      },
    };
    await axios(config)
      .then((response) => {
        console.log("RESP CLIENTS");

        if (response.status === 200) {
          console.log("OK");
          //    console.log(response);
          response = response.data;

          if (offset > 1) {
            var prods = [...assets, ...response.data];
            setAssets(prods);
            var prodsS = [...assetsSearch, ...response.data];
            setAssetsSearch(prodsS);
          } else {
            setAssets(response.data);
            setAssetsSearch(response.data);
          }

          if (search.length > 0) {
            buscaAssets(search);
          }

          //    setIsLoading(false);
          setIsFetching(false);
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
          //    setIsLoading(true);
          setIsFetching(false);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
        //     setIsLoading(true);
        setIsFetching(false);
      });
  }

  function Item(props) {
    var { item, navigation } = props;
    var asset = item.item;

    var tCompra = new Date(parseInt(asset.purchase_date) * 1000);
    // console.log(tCompra);
    var formattedCompra =
      tCompra.getDate() +
      "/" +
      parseInt(tCompra.getMonth() + 1) +
      "/" +
      tCompra.getFullYear();
    asset.fecha_compra = formattedCompra;

    var tCaducidad = new Date(parseInt(asset.date_of_expiry) * 1000);
    //  console.log(tCaducidad);
    var formattedCaducidad =
      tCaducidad.getDate() +
      "/" +
      parseInt(tCaducidad.getMonth() + 1) +
      "/" +
      tCaducidad.getFullYear();
    asset.fecha_caducidad = formattedCaducidad;

    // console.log(asset);

    var arrayActions = [
      { value: "incidence_asset", text: "Crear incidencia" },
      { value: "locate_asset", text: "Ubicar" },
    ];

    if (
      asset.status.id == 2 &&
      userData.roles[0].name == "prl_cliente" //PRL
    ) {
      arrayActions.push({ value: "delivery_epi", text: "Entrega de activo" });
    }

    /*  if (asset.status.id == 2 && asset.product.isEpi == 0) {
      arrayActions.push({
        value: "delivery_no_epi",
        text: "Salida de activo",
      });
    } */

    if (asset.status.id == 3 && asset.product.isEpi == 0) {
      arrayActions.push({
        value: "return_asset",
        text: "Devolución",
      });
    }

    if (asset.product.isEpi == 1 && userData.roles[0].name == "prl_cliente") {
      arrayActions.push({ value: "review_epi", text: "Revisar EPI" });
    }
    if (asset.product.isEpi == 0) {
      arrayActions.push({ value: "review_asset", text: "Revisar activo" });
    }

    /*   if (userData.roles[0].name == "prl_cliente" && asset.tag.length == 0) {
      arrayActions.push({
        value: "link_tag_to_asset",
        text: "Vincular etiqueta",
      });
    } */

    asset.object = {};
    asset.object.id = asset.id;

    asset.arrayActions = arrayActions;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigation.navigate("productDetail", {
            id_asset: asset.id,
          });
        }}
      >
        <View style={styles.fila}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={{ uri: asset.product.imagen }}
          />
          <View style={{ flex: 3 }}>
            <View style={styles.fila}>
              <Text style={styles.name}>{asset.product.modelo}</Text>
            </View>
            {asset.name ? (
              <Text>
                {asset.name.length > 25
                  ? asset.name.substring(0, 22) + "..."
                  : asset.name}
              </Text>
            ) : (
              <></>
            )}
            {asset.apto == 1 && asset.status.id != 6 ? (
              <View style={styles.fila}>
                <View>
                  {asset.status.id == 2 ? (
                    <Button
                      title="Apto disponible"
                      buttonStyle={{
                        borderRadius: 17,
                        backgroundColor: "rgba(40, 199, 111, 0.12)",
                      }}
                      titleStyle={{
                        color: "#28C76F",
                        fontSize: 12,
                        paddingHorizontal: 10,
                      }}
                      containerStyle={{
                        margin: 5,
                        marginTop: 16,
                      }}
                    />
                  ) : asset.status.id == 3 ? (
                    <Button
                      title="Apto en uso"
                      buttonStyle={{
                        borderRadius: 17,
                        backgroundColor: "rgba(115, 103, 240, 0.12)",
                      }}
                      titleStyle={{
                        color: "#7367F0",
                        fontSize: 12,
                        paddingHorizontal: 10,
                      }}
                      containerStyle={{
                        margin: 5,
                        marginTop: 16,
                      }}
                    />
                  ) : (
                    <Button
                      title="Inactivo"
                      buttonStyle={{
                        borderRadius: 17,
                        backgroundColor: "rgba(244, 67, 54, 0.12)",
                      }}
                      titleStyle={{
                        color: "#F44336",
                        fontSize: 12,
                        paddingHorizontal: 10,
                      }}
                      containerStyle={{
                        margin: 5,
                        marginTop: 16,
                      }}
                    />
                  )}
                </View>
              </View>
            ) : asset.apto == 1 && asset.status.id == 6 ? (
              <View style={styles.fila}>
                <Button
                  title="Con incidencia"
                  buttonStyle={{
                    borderRadius: 17,
                    backgroundColor: "rgba(255, 159, 67, 0.12)",
                  }}
                  titleStyle={{
                    color: "#FF9F43",
                    fontSize: 12,
                    paddingHorizontal: 10,
                  }}
                  containerStyle={{
                    margin: 5,
                    marginTop: 16,
                  }}
                />
              </View>
            ) : (
              <View style={styles.fila}>
                <Button
                  title="No apto"
                  buttonStyle={{
                    borderRadius: 17,
                    backgroundColor: "rgba(244, 67, 54, 0.12)",
                  }}
                  titleStyle={{
                    color: "#F44336",
                    fontSize: 12,
                    paddingHorizontal: 10,
                  }}
                  containerStyle={{
                    margin: 5,
                    marginTop: 16,
                  }}
                />
              </View>
            )}
          </View>

          <Button
            buttonStyle={{
              width: 56,
              height: 56,
              borderRadius: 20,
              backgroundColor: "#F5F5F5",
            }}
            onPress={() => openActions(asset)}
            icon={
              <Icon
                type="material-community"
                name="dots-horizontal"
                size={24}
                color="#213F87"
              />
            }
          />
        </View>
      </TouchableOpacity>
    );
  }

  function ItemAction(props) {
    var action = props.item.item;

    return (
      <TouchableOpacity
        style={styles.itemAction}
        onPress={() => {
          setVisibleOverlay(false);
          doAction(action.value, assetSelected);
        }}
      >
        <View style={styles.fila}>
          <Text style={styles.name}>{action.text}</Text>
          <Icon
            type="material-community"
            name="arrow-right"
            size={24}
            color="#213F87"
            style={{ paddingRight: 20 }}
          />
        </View>
        <Divider style={styles.dividerItem} />
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
      <TextInput
        style={styles.buscador}
        onChangeText={(e) => buscaAssets(e)}
        value={search}
        placeholder={"Buscar"}
      />
      <FlatList
        data={assetsSearch}
        renderItem={(item) => <Item item={item} navigation={navigation} />}
        keyExtractor={(item, index) => index.toString()}
        extraData={assetsSearch}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        contentContainerStyle={{ paddingBottom: 30 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.9}
      ></FlatList>
      <Overlay
        isVisible={visibleOverlay}
        onBackButtonPress={() => setVisibleOverlay(false)}
        onBackdropPress={() => setVisibleOverlay(false)}
      >
        <View
          style={{
            padding: 10,
            minWidth: "90%",
            maxWidth: "90%",
            borderRadius: 6,
          }}
        >
          <View style={styles.fila}>
            <Text
              style={{
                fontStyle: "normal",
                fontWeight: "bold",
                fontSize: 18,
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              {assetSelected.name}
            </Text>
            <Button
              icon={<Icon name="close" size={30} color="black" />}
              buttonStyle={{
                backgroundColor: "white",
                borderRadius: 6,
              }}
              containerStyle={{
                marginTop: -30,
                marginRight: -30,
              }}
              onPress={() => setVisibleOverlay(false)}
            ></Button>
          </View>
          <Divider style={styles.divider} />
          <FlatList
            data={assetSelected.arrayActions}
            renderItem={(itemAction) => <ItemAction item={itemAction} />}
            keyExtractor={(item, index) => index.toString()}
            extraData={assetSelected.arrayActions}
            style={{ flexGrow: 0 }}
          ></FlatList>
        </View>
      </Overlay>
    </SafeAreaProvider>
  );

  function handleLoadMore() {
    console.log("offset ", offset);
    console.log("newOffset ", offset + 1);

    var newOffset = parseInt(offset + 1);

    console.log("limit ", limit);
    setTimeout(() => {
      setOffset(newOffset);
      setOffset(offset + 1);
    }, 1000);
    loadAssets(newOffset);
  }

  async function onRefresh() {
    setIsFetching(true);
    setOffset(1);
    setAssets([]);
    console.log("offset ", 1);
    await loadAssets();
  }

  function openActions(asset) {
    setAssetSelected(asset);
    console.log("AAAA:: ", assetSelected);
    setVisibleOverlay(true);
  }

  function doAction(value, asset) {
    asset.nameevent = value;
    if (value == "review_epi" || value == "review_asset") {
      console.log("ASSET", asset);
      //Revisar EPI
      navigation.navigate("loadhtmlformrevisionepi", {
        asset: asset,
      });
    }
    if (value == "incidence_asset") {
      //Crear incidencia
      navigation.navigate("loadhtmlformincidencia", {
        asset: asset,
      });
    }
    if (value == "delivery_no_epi") {
      //Salida activo
      navigation.navigate("loadhtmlformsalida", {
        asset: asset,
      });
    }
    if (value == "return_asset") {
      //Devolucion
      navigation.navigate("loadhtmlformdevolucion", {
        asset: asset,
      });
    }
    if (value == "locate_asset") {
      //Crear incidencia
      navigation.navigate("loadhtmlformubicar", {
        asset: asset,
      });
    }
    if (value == "delivery_epi") {
      //Crear incidencia
      var arrayAssets = [];
      var obj = {
        id: asset.id,
        name: asset.name,
        nameevent: value,
      };
      arrayAssets.push(obj);
      //  console.log(arrayAssets);
      navigation.navigate("loadhtmlformentrega", {
        arrayAssets: arrayAssets,
      });
    }
  }

  function buscaAssets(e) {
    setSearch(e);

    const itemsSea = assets.filter((item) =>
      item.name.toUpperCase().includes(e.toUpperCase())
    );

    setAssetsSearch(itemsSea);
  }
}
const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 20,
    marginHorizontal: 24,
    marginTop: 9,
  },
  itemAction: {
    backgroundColor: "white",
    paddingTop: 20,
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
  itemIcon: {
    height: "100%",
    width: "100%",
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
  },
  buscador: {
    backgroundColor: COLORS.foreground,
    height: 46,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: "solid",
    borderColor: COLORS.background,
    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "italic",
    color: "rgba(60, 60, 67, 0.6)",
    paddingHorizontal: 15,
  },
  image: {
    /* width: Layout.window.width - 300,
  height: Layout.window.height / 2 - 300, */
    flex: 1,
    borderRadius: 10,
    marginRight: 10,
  },
  name: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
    fontSize: 14,
  },
  nameTitle: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "bold",
  },
  desc: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
    fontSize: 14,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  caracteristica: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  divider: {
    backgroundColor: "#F5F5F5",
    marginTop: 24,
  },
  dividerItem: {
    backgroundColor: "#F5F5F5",
    marginTop: 12,
  },
});
