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
import { BASEPATH } from "../../utils/constants";
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
  const [sistemas, setSistemas] = useState({});

  useEffect(async () => {
    navigation.setOptions({
      title: params.route.params.itemsTarea[0].job.nombre,
    });
  }, []);
  //var item = params.route.params.item;
  //console.log("itemsTarea:: ", params.route.params.itemsTarea);

  /*  console.log("idFecha:: ", item.id_fecha);
  console.log("idRevisionSistema:: ", item.id_revision_sistema); */

  /*  useEffect(async () => {
    navigation.setOptions({
      title: item.job.nombre,
    });
    var urlAct =
      BASEPATH +
      "?type=task&id_revision_sistema=" +
      item.id_revision_sistema +
      "&id_fecha=" +
      item.id_fecha;

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
      .then(function (response) {
        console.log("SISTEMAS:: ", response.data);
        setSistemas(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []); */

  function Item(props) {
    var { item, navigation } = props;
    item = item.item;
    console.log(item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate("taskProductos", {
            sistemaName: item.subfamilia.nombre,
            id_revision_sistema: item.id_revision_sistema,
            id_fecha: item.id_fecha,
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
            {/*  <Text style={styles.textoTarea}>{item.familia.nombre}</Text> */}
            <Text style={styles.textoTarea}>{item.subfamilia.nombre}</Text>
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
        data={params.route.params.itemsTarea}
        renderItem={(item) => <Item item={item} navigation={navigation} />}
        keyExtractor={(item, index) => index.toString()}
        extraData={params.route.params.itemsTarea}
        contentContainerStyle={{ paddingBottom: 30 }}
      ></FlatList>
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
});
