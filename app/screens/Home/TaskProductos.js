import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  SearchBar,
  ListItem,
  Icon,
  BottomSheet,
  Text,
  Button,
} from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
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

export default function TaskProductos(params) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [zonas, setZonas] = useState({});

  useEffect(async () => {
    console.log("sistemaName:: ", params.route.params.sistemaName);
    console.log("id_revision_sistema", params.route.params.id_revision_sistema);
    console.log("id_fecha", params.route.params.id_fecha);

    var sistema = params.route.params.sistema;
    var sistemaName = params.route.params.sistemaName;

    navigation.setOptions({
      title: params.route.params.sistemaName,
    });

    var urlAct =
      BASEPATH +
      "?type=task&id_revision_sistema=" +
      params.route.params.id_revision_sistema +
      "&id_fecha=" +
      params.route.params.id_fecha;

    console.log("URL");
    console.log(urlAct);

    var config = {
      method: "get",
      url: urlAct,
      headers: {
        Cookie: "PHPSESSID=r3k0p9s4424mstnc9n1oc6cil4",
      },
    };
    await axios(config)
      .then(async function (response) {
        // console.log("SISTEMAS:: ", response.data);
        setProductNames(Object.keys(response.data));
        setProductos(response.data);
        console.log(Object.keys(response.data));

        var urlAct2 =
          BASEPATHETIQUETAS +
          "cloud/task/" +
          params.route.params.id_revision_sistema +
          "/" +
          params.route.params.id_fecha;

        console.log("URL");
        console.log(urlAct2);

        var config2 = {
          method: "get",
          url: urlAct2,
          headers: {
            token: "123456789",
          },
        };
        await axios(config2)
          .then(async function (response2) {
            // console.log("sistemaName:: ", sistemaName);
            //setSistemas(response.data);
            var zona = {};

            var obj = {};
            var i = 0;
            Object.keys(response2.data).forEach((keyModelo) => {
              var modelo = response2.data[keyModelo];
              Object.keys(modelo).forEach((keyZona) => {
                var dentroZona = modelo[keyZona];
                var name = keyZona + " " + i;
                obj[name] = dentroZona;
              });
              zona = { ...zona, ...obj };
              i = i + 1;
            });

            console.log("DATA: ", response2.data);

            console.log("ZONA: ", zona);
            setZonas(zona);
            setIsLoading(false);
          })
          .catch(function (error) {
            console.log(error);
            setIsLoading(false);
          });
      })
      .catch(function (error) {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log(item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          console.log(productos[item]);
        }}
        onPress={() =>
          navigation.navigate("taskfullinfo", {
            sistema: productos[item],
            sistemaName: item,
            id_revision_sistema: params.route.params.id_revision_sistema,
            id_fecha: params.route.params.id_fecha,
          })
        }
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
            }}
          >
            <Text style={styles.textoTarea}>{item}</Text>
          </View>
          <Icon
            style={styles.itemIcon}
            type="material-community"
            name="chevron-right"
            size={30}
          ></Icon>
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
      <FlatList
        data={productNames}
        renderItem={(item) => <Item item={item} navigation={navigation} />}
        keyExtractor={(item, index) => index.toString()}
        extraData={productNames}
      ></FlatList>
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
});
