import React, { Component } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
// @ts-expect-error
import { Agenda } from "react-native-calendars";
import { Icon } from "react-native-elements";
import { LocaleConfig } from "react-native-calendars";
import { Card, Avatar } from "react-native-paper";
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

export default class Home extends Component {
  constructor(props) {
    super(props);
    var dateToday = new Date();
    var today = dateToday.toISOString().slice(0, 10);
    let month = dateToday.getMonth();
    console.log("today ", today);
    console.log("month ", month);
    this.state = {
      originalItems: {},
      items: {},
      today: today,
      userData: {},
      loading: false,
      monthToLoad: dateToday,
      markedDates: {},
      monthJobs: [],
    };
    LocaleConfig.locales["es"] = {
      monthNames: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
      monthNamesShort: [
        "Ene.",
        "Feb.",
        "Mar.",
        "Abr.",
        "May.",
        "Jun.",
        "Jul.",
        "Ago.",
        "Sep.",
        "Oct.",
        "Nov.",
        "Dic.",
      ],
      dayNames: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ],
      dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
      today: "Hoy",
    };
    LocaleConfig.defaultLocale = "es";

    var dia = { dateString: today };
    this.loadDay(dia);
  }
  async componentDidMount() {
    let userDataItem = await AsyncStorage.getItem("userData");
    this.state.userData = JSON.parse(userDataItem);

    console.log(this.state.userData);

    await this.loadMonth(this.state.monthToLoad);
  }
  async loadMonth(dateToLoad) {
    console.log("loadMonth:: ", dateToLoad);
    var date = dateToLoad,
      y = date.getFullYear(),
      m = date.getMonth();
    var firstDay = new Date(y - 1, m, 2);
    var lastDay = new Date(y + 1, m + 1, 1);
    console.log("firstDay: ", firstDay);
    console.log("lastDay: ", lastDay);
    var firstDayString = firstDay.toISOString().slice(0, 10);
    var lastDayString = lastDay.toISOString().slice(0, 10);

    var urlAct =
      BASEPATH +
      "?type=calendar&id_tecnico_responsable=78&start=" +
      firstDayString +
      "&end=" +
      lastDayString;

    console.log("URL");
    console.log(urlAct);

    var config = {
      method: "get",
      url: urlAct,
      headers: {
        Cookie: "PHPSESSID=r3k0p9s4424mstnc9n1oc6cil4",
      },
    };

    this.state.loading = true;

    var self = this;
    var mk = {};
    //var idJobsAdded = [];
    var isJobsAdded = {};
    var self = this;
    await axios(config)
      .then(function (response) {
        self.setState({
          monthJobs: response.data,
        });
        response.data.forEach((element) => {
          var start = new Date(element.fecha);
          var end = new Date(element.fecha_fin);
          var loopTime = start.getTime();
          /*  var randomColor =
            "#" + Math.floor(Math.random() * 16777215).toString(16);
 */
          if (
            !isJobsAdded[element.job.id] ||
            !isJobsAdded[element.job.id].includes(element.fecha)
          ) {
            var randomColor =
              "#" +
              element.job.id.charAt(element.job.id.length - 1) +
              element.job.id +
              element.job.id.charAt(element.job.id.length - 1);
            for (
              loopTime = start.getTime();
              loopTime <= end.getTime();
              loopTime += 86400000
            ) {
              var loopDay = new Date(loopTime);

              var dateString = loopDay.toISOString().slice(0, 10);

              var periods = [];
              if (mk[dateString] != undefined) {
                periods = mk[dateString].periods;
              } else {
                mk[dateString] = {};
              }
              var obj = {
                startingDay: loopTime == start.getTime(),
                endingDay: loopTime == end.getTime(),
                color: randomColor,
              };

              periods.push(obj);

              mk[dateString].periods = periods;
            }

            if (!isJobsAdded[element.job.id]) {
              var ar = [];
              ar.push(element.fecha);
              isJobsAdded[element.job.id] = ar;
            } else {
              var ar = isJobsAdded[element.job.id];
              ar.push(element.fecha);
              isJobsAdded[element.job.id] = ar;
            }
          }
        });
        self.state.loading = false;
      })
      .catch(function (error) {
        console.log(error);
      });

    // console.log(mk);
    this.setState({
      markedDates: mk,
    });
  }

  render() {
    return (
      <SafeAreaProvider>
        <Loading
          isVisible={this.state.loading}
          text={"Cargando agenda"}
          backgroundColor={COLORS.primary}
        ></Loading>
        <View
          style={{
            height: 350,
          }}
        >
          <Agenda
            items={this.state.items}
            //  loadItemsForMonth={this.loadItems.bind(this)}
            selected={this.state.today}
            renderItem={this.renderItem.bind(this)}
            renderEmptyDate={this.renderEmptyDate.bind(this)}
            rowHasChanged={this.rowHasChanged.bind(this)}
            onDayPress={(day) => {
              this.loadDay(day);
            }}
            loadItemsForMonth={async (month) => {
              /*  console.log("MES: ", month.month, " AÑO: ", month.year);
              console.log("MONTH: ", month); */
              /*   var date = new Date(month.timestamp); */
              // await this.loadMonth(date);
            }}
            markingType="multi-period"
            markedDates={this.state.markedDates}
            // monthFormat={'yyyy'}
            // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
            //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  async changeDay(day) {
    console.log(day);
    var urlAct =
      BASEPATH +
      "?type=calendar_date&id_tecnico_responsable=78&date=" +
      day.dateString;

    console.log("URL");
    console.log(urlAct);

    var config = {
      method: "get",
      url: urlAct,
      headers: {
        Cookie: "PHPSESSID=r3k0p9s4424mstnc9n1oc6cil4",
      },
    };

    this.state.loading = true;

    var self = this;
    this.state.items = {};
    this.state.items[day.dateString] = [];
    await axios(config)
      .then(function (response) {
        self.setState({
          originalItems: response.data,
        });
        // console.log(response.data);
        var jobsDia = [];
        response.data.forEach((element) => {
          if (!jobsDia.includes(element.job.id)) {
            jobsDia.push(element.job.id);

            console.log("ELEMENT:: ", element);

            self.state.items[day.dateString].push(element);
          }
        });
        self.state.loading = false;
        const newItems = {};
        Object.keys(self.state.items).forEach((key) => {
          newItems[key] = self.state.items[key];
        });
        self.setState({
          items: newItems,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async loadDay(day) {
    console.log("JOBS del dia ", day.dateString);
    this.changeDay(day);
  }

  renderItem(item) {
    var self = this;
    console.log("ITEM:: ", item);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          /*  this.props.navigation.navigate("taskinfo", {
            item: item,
          }) */
          {
            self.passInfoTask(item.job.id);
          }
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
              height: "100%",
              width: "90%",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.textoTarea}>{item.job.nombre}</Text>
            {/*  <Text style={styles.textoTarea}>{item.nombre_obra}</Text> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Icon
                type="material-community"
                name="calendar"
                size={18}
                color="#A7A9AC"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.textoFecha}>
                {item.fecha.split("-")[2]}/{item.fecha.split("-")[1]}/
                {item.fecha.split("-")[0]} -
              </Text>
              <Text style={styles.textoFecha}>
                {item.fecha_fin.split("-")[2]}/{item.fecha_fin.split("-")[1]}/
                {item.fecha_fin.split("-")[0]}
              </Text>
            </View>
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

  passInfoTask(jobId) {
    var itemsToPass = [];
    var subfamiliasAdded = [];
    console.log("---------------------------");
    this.state.originalItems.forEach((item) => {
      if (
        !subfamiliasAdded.includes(item.subfamilia.id) &&
        item.job.id == jobId
      ) {
        itemsToPass.push(item);
        subfamiliasAdded.push(item.subfamilia.id);
        //  console.log(item);
      }
    });
    //console.log(itemsToPass);
    this.props.navigation.navigate("taskinfo", {
      itemsTarea: itemsToPass,
    });
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Text>Ninguna tarea asignada para hoy</Text>
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  timeToString(time) {
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
    marginHorizontal: 10,
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
});
