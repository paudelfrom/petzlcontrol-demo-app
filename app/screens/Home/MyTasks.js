import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Icon, Tab, TabView } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProducts } from "../../utils/api";
import { BASEPATH } from "../../utils/constants";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import axios from "../../components/Auth/axiosApiInstance";
import i18n from "../../../i18n";
import { Context } from "../../utils/Store";
import RNPickerSelect from "react-native-picker-select";
import { MustLogout } from "../../utils/helpers";

export default function MyTasks(params) {
  var dat = new Date();
  var tod = dat.toISOString().slice(0, 10);
  let month = dat.getMonth();

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [originalItems, setOriginalItems] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsSearched, setItemsSearched] = useState([]);
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState({});
  const [dateToday, setDateToday] = useState(dat);
  const [today, setToday] = useState(tod);

  const [index, setIndex] = useState(0);

  const [offset, setOffset] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setOffset(1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      console.log("FOCUS:: ", index);
      async function fetchData() {
        // You can await here
        // setZonas(sistema);
        setIndex(index);
        await MustLogout(navigation);
        await loadTasks();
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

  useEffect(() => {
    console.log("CAMBIA INDEX:: ", index);
    onRefresh();
  }, [index]);

  useEffect(() => {
    if (search == "") {
      onRefresh();
    }
  }, [search]);

  async function loadTasks(nuevoOffset) {
    setIsLoading(true);
    var off = nuevoOffset;
    if (!off) {
      off = 1;
    }

    let userDataItem = await AsyncStorage.getItem("userData");
    setUserData(JSON.parse(userDataItem));

    var usuario = JSON.parse(userDataItem);

    //  console.log("USER:: ", JSON.parse(userDataItem));

    var requestURL = BASEPATH + "/api/tasks/user/" + usuario.id;

    console.log("URL:: ", requestURL);
    var config = {
      method: "post",
      url: requestURL,
      headers: {
        "X-localization": "X-localization",
      },
      data: {
        per_page: limit,
        page: off,
        status_task_id: index == 0 ? 1 : 3,
        search: search,
        orderBy: { label: "Fecha fin", column: "date_fin", type: "desc" },
      },
    };

    console.log("CONFIG:: ", config.data);

    setItems([]);
    await axios(config)
      .then((response) => {
        console.log("RESP CLIENTS");

        if (response.status === 200) {
          console.log("OK");
          response = response.data;

          if (offset > 1 && search == "") {
            var prods = [...originalItems, ...response.data];
            setOriginalItems(prods);
            var prodsS = [...items, ...response.data];
            setItems(prodsS);
            var prodsA = [...itemsSearched, ...response.data];
            setItemsSearched(prodsA);
          } else {
            setOriginalItems(response.data);
            setItems(response.data);
            setItemsSearched(response.data);
          }

          setIsFetching(false);
          setIsLoading(false);
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
          setIsFetching(false);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
        setIsFetching(false);
        setIsLoading(false);
      });
  }
  async function onRefresh() {
    setIsFetching(true);

    setOffset(0);
    setItems([]);
    setOriginalItems([]);
    setItemsSearched([]);
    console.log("offset ", 1);
    await loadTasks();
  }

  async function doSearch(e) {
    setOffset(0);
    setItems([]);
    setOriginalItems([]);
    setItemsSearched([]);
    await loadTasks();

    /*  const itemsSea = items.filter((item) =>
      item.name.toUpperCase().includes(e.toUpperCase())
    );

    setItemsSearched(itemsSea) */
  }

  async function clearSearch() {
    setSearch("");

    // onRefresh();
  }

  return (
    <SafeAreaProvider>
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={{
          backgroundColor: "#474952",
        }}
      >
        <Tab.Item
          title="Pendientes"
          style={{
            backgroundColor: "white",
            color: "black",
          }}
        />
        <Tab.Item
          title="Completadas"
          style={{
            backgroundColor: "white",
            color: "black",
          }}
        />
      </Tab>
      {/*  <TabView value={index} onChange={setIndex}>
      
      </TabView> */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.buscador}
          onChangeText={(e) => setSearch(e)}
          onSubmitEditing={(e) => doSearch(e)}
          value={search}
          placeholder={"Buscar"}
          placeholderTextColor="#97a2ad"
          returnKeyType="search"
          returnKeyLabel="buscar"
        />
        {search.length > 0 ? (
          <Icon
            style={styles.iconClose}
            name="close"
            size={30}
            color="black"
            onPress={() => {
              clearSearch();
            }}
          />
        ) : (
          <></>
        )}
      </View>
      <FlatList
        data={itemsSearched}
        renderItem={(item) => <Item item={item} navigation={navigation} />}
        /*  renderItem={this.renderItem.bind(this)} */
        keyExtractor={(item, index) => index.toString()}
        extraData={itemsSearched}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 30 }}
      ></FlatList>
      <Loading
        isVisible={isLoading}
        text={"Cargando tareas"}
        backgroundColor={COLORS.primary}
      ></Loading>
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
    loadTasks(newOffset);
  }

  function Item(props) {
    var { item, navigation } = props;

    var tarea = item.item;

    var tIni = new Date(parseInt(tarea.date_ini) * 1000);
    var formattedIni =
      tIni.getDate() +
      "/" +
      parseInt(tIni.getMonth() + 1) +
      "/" +
      tIni.getFullYear();

    var tFin = new Date(parseInt(tarea.date_fin) * 1000);
    var formattedFin =
      tFin.getDate() +
      "/" +
      parseInt(tFin.getMonth() + 1) +
      "/" +
      tFin.getFullYear();

    if (tarea.status.name == "Hacer") {
      tarea.status.name = "Pendiente";
    } else if (tarea.status.name == "Cerrada") {
      tarea.status.name = "Completada";
    } else if (tarea.status.name == "Con incidencia") {
      tarea.status.name = "Completada";
    }

    if (tFin < new Date() && tarea.status.name == "Pendiente") {
      tarea.color = "#E76565";
    } else if (tFin > new Date()) {
      if (tarea.status.name == "En curso") {
        tarea.color = "#F2A56D";
      } else {
        tarea.color = "transparent";
      }
    } else {
      tarea.color = "transparent";
    }

    return (
      <TouchableOpacity
        style={{
          backgroundColor: "white",
          flex: 1,
          borderRadius: 20,
          padding: 15,
          marginHorizontal: 24,
          marginTop: 9,
          height: 90,
        }}
        onPress={() => {
          passInfoTask(tarea);
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
              height: "100%",
              width: "90%",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 2,
            }}
          >
            <Text style={styles.textoTarea}>{tarea.name}</Text>
            {/*  <Text style={styles.textoTarea}>{item.nombre_obra}</Text> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: 6,
              }}
            >
              <Icon
                type="material-community"
                name="calendar"
                size={18}
                color={tarea.color == "#474952"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  fontStyle: "normal",
                  fontWeight: "bold",
                  fontSize: 14,
                  lineHeight: 17,
                  display: "flex",
                  alignItems: "center",
                  color: "#474952",
                }}
              >
                {formattedIni} -{" "}
              </Text>
              <Text
                style={{
                  fontStyle: "normal",
                  fontWeight: "bold",
                  fontSize: 14,
                  lineHeight: 17,
                  display: "flex",
                  alignItems: "center",
                  color: "#474952",
                }}
              >
                {formattedFin}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: "100%",
              width: "30%",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <Text
              style={{
                fontStyle: "normal",
                fontWeight: "bold",
                fontSize: 14,
                lineHeight: 17,
                display: "flex",
                alignItems: "center",
                color:
                  tarea.priority == "medium"
                    ? "#E49E35"
                    : tarea.priority == "high"
                    ? "#E76565"
                    : "#A7A9AC",
              }}
            >
              {tarea.priority == "medium"
                ? "Media"
                : tarea.priority == "high"
                ? "Alta"
                : "Baja"}
            </Text>
            <Text
              style={{
                fontStyle: "normal",
                fontWeight: "bold",
                fontSize: 14,
                lineHeight: 17,
                display: "flex",
                alignItems: "center",
                color:
                  tarea.status.name == "Completada"
                    ? "#0BC16F"
                    : tarea.status.name == "Pendiente"
                    ? "#A7A9AC"
                    : tarea.status.name == "En curso"
                    ? "#01C0FC"
                    : "#E76565",
              }}
            >
              {tarea.status.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function passInfoTask(item) {
    navigation.navigate("tareadetail", {
      tarea: item,
    });
  }

  function renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Text>Ninguna tarea asignada para hoy</Text>
      </View>
    );
  }

  function timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 24,
    marginTop: 9,
    height: 100,
  },
  textoTarea: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 17,
    display: "flex",
    alignItems: "center",
    color: "#474952",
  },
  textoFecha: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 17,
    display: "flex",
    alignItems: "center",
    color: "#A7A9AC",
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  itemIcon: {
    padding: 10,
    height: "100%",
    width: "100%",
    justifyContent: "center", //Centered horizontally
    alignItems: "center", //Centered vertically
    flex: 1,
  },
  buscador: {
    flex: 1,

    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "italic",
    color: "rgba(60, 60, 67, 0.6)",
  },
  searchSection: {
    flexDirection: "row",

    backgroundColor: COLORS.foreground,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: "solid",
    borderColor: COLORS.background,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  iconClose: {
    flexDirection: "row",
  },
});
