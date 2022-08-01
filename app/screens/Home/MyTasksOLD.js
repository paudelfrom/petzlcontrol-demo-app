import React, { Component } from "react";
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
import { withNavigation } from "react-navigation";
import { Icon } from "react-native-elements";
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

class MyTask extends Component {
  constructor(props) {
    super(props);
    var dateToday = new Date();
    var today = dateToday.toISOString().slice(0, 10);
    let month = dateToday.getMonth();
    console.log("today ", today);
    console.log("month ", month);
    this.state = {
      originalItems: [],
      items: [],
      itemsSearched: [],
      dateToday: dateToday,
      today: today,
      userData: {},
      loading: false,
      isFetching: false,
      search: "",
    };
  }
  async loadTasks() {
    this.setState({ loading: true });

    let userDataItem = await AsyncStorage.getItem("userData");
    this.state.userData = JSON.parse(userDataItem);

    var usuario = JSON.parse(userDataItem);

    console.log("USER:: ", JSON.parse(userDataItem));

    var requestURL = BASEPATH + "/api/tasks/user/" + usuario.id;

    console.log("URL:: ", requestURL);
    var config = {
      method: "post",
      url: requestURL,
      headers: {
        "X-localization": "X-localization",
      },
      data: {
        per_page: 200,
      },
    };

    var self = this;
    this.state.items = [];
    await axios(config)
      .then((response) => {
        console.log("RESP CLIENTS");

        if (response.status === 200) {
          console.log("OK");
          response = response.data;

          self.setState({
            originalItems: response.data,
          });

          self.setState({
            items: response.data,
          });
          self.setState({
            itemsSearched: response.data,
          });

          if (self.state.search != "") {
            self.setSearch(self.state.search);
          }

          self.setState({ isFetching: false, loading: false });
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
          self.setState({ isFetching: false, loading: false });
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
        self.setState({ isFetching: false, loading: false });
      });
  }
  async componentDidMount() {
    await MustLogout(this.props.navigation);
    await this.loadTasks();
  }
  async onRefresh() {
    this.setState({ isFetching: true }, async () => {
      await this.loadTasks();
    });
  }
  setSearch(e) {
    this.setState({
      search: e,
    });

    const itemsSea = this.state.items.filter((item) =>
      item.name.toUpperCase().includes(e.toUpperCase())
    );
    this.setState({
      itemsSearched: itemsSea,
    });
  }

  render() {
    return (
      <SafeAreaProvider>
        <TextInput
          style={styles.buscador}
          onChangeText={(e) => this.setSearch(e)}
          value={this.state.search}
          placeholder={"Buscar"}
        />
        <FlatList
          data={this.state.itemsSearched}
          renderItem={this.renderItem.bind(this)}
          keyExtractor={(item, index) => index.toString()}
          extraData={this.state.itemsSearched}
          onRefresh={() => this.onRefresh()}
          refreshing={this.state.isFetching}
          contentContainerStyle={{ paddingBottom: 30 }}
        ></FlatList>
        <Loading
          isVisible={this.state.loading}
          text={"Cargando tareas"}
          backgroundColor={COLORS.primary}
        ></Loading>
      </SafeAreaProvider>
    );
  }

  renderItem(i) {
    var item = i.item;
    var self = this;
    console.log("ITEM:: ", item);

    var tIni = new Date(parseInt(item.date_ini) * 1000);
    console.log(tIni);
    var formattedIni =
      tIni.getDate() +
      "/" +
      parseInt(tIni.getMonth() + 1) +
      "/" +
      tIni.getFullYear();

    var tFin = new Date(parseInt(item.date_fin) * 1000);
    var formattedFin =
      tFin.getDate() +
      "/" +
      parseInt(tFin.getMonth() + 1) +
      "/" +
      tFin.getFullYear();

    if (item.status.name == "Hacer") {
      item.status.name = "Pendiente";
    } else if (item.status.name == "Cerrada") {
      item.status.name = "Completada";
    } else if (item.status.name == "Con incidencia") {
      item.status.name = "Completada";
    }

    if (tFin < new Date() && item.status.name == "Pendiente") {
      item.color = "#E76565";
    } else if (tFin > new Date()) {
      if (item.status.name == "En curso") {
        item.color = "#F2A56D";
      } else {
        item.color = "transparent";
      }
    } else {
      item.color = "transparent";
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
          self.passInfoTask(item);
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
            <Text style={styles.textoTarea}>{item.name}</Text>
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
                color={item.color == "#474952"}
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
                  item.priority == "medium"
                    ? "#E49E35"
                    : item.priority == "high"
                    ? "#E76565"
                    : "#A7A9AC",
              }}
            >
              {item.priority == "medium"
                ? "Media"
                : item.priority == "high"
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
                  item.status.name == "Completada"
                    ? "#0BC16F"
                    : item.status.name == "Pendiente"
                    ? "#A7A9AC"
                    : item.status.name == "En curso"
                    ? "#01C0FC"
                    : "#E76565",
              }}
            >
              {item.status.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  passInfoTask(item) {
    this.props.navigation.navigate("tareadetail", {
      tarea: item,
    });
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Text>Ninguna tarea asignada para hoy</Text>
      </View>
    );
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  }
}

// withNavigation returns a component that wraps MyBackButton and passes in the
// navigation prop
export default withNavigation(MyTask);

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
});
