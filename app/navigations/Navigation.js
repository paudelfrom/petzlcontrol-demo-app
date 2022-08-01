import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Image, StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import AccountStack from "./AccountStack";
import HomeStack from "./HomeStack";
import ScannerStack from "./ScannerStack";
import Login from "../screens/Account/Login";
import SplashScreen from "../screens/SplashScreen";
import { COLORS } from "../utils/colors";
import i18n from "../../i18n";
import { Context } from "../utils/Store";
import { ScanOutlined } from "@ant-design/icons";
import TaskInfo from "../screens/Home/TaskInfo";
import TaskFullInfo from "../screens/Home/TaskFullInfo";
import TaskProductos from "../screens/Home/TaskProductos";
import WebViewScreen from "../screens/WebViewScreen";
import ScannerTarea from "../screens/Home/ScannerTarea";
import ScannerPonerEtiqueta from "../screens/Home/ScannerPonerEtiqueta";
import ProductDetail from "../screens/Home/ProductDetail";
import PDFViewer from "../screens/PDFViewer";
import LoadHTMLFormRevision from "../screens/Home/LoadHTMLFormRevision";
import LoadHTMLFormIncidencia from "../screens/Home/LoadHTMLFormIncidencia";
import LoadHTMLFormSalidaActivo from "../screens/Home/LoadHTMLFormSalidaActivo";
import LoadHTMLFormDevolucionActivo from "../screens/Home/LoadHTMLFormDevolucionActivo";
import LoadHTMLFormUbicar from "../screens/Home/LoadHTMLFormUbicar";
import LoadHTMLFormEntrega from "../screens/Home/LoadHTMLFormEntrega";
import LoadHTMLFormEntregaDesdeTarea from "../screens/Home/LoadHTMLFormEntregaDesdeTarea";
import LoadHTMLFormOrdenTrabajo from "../screens/Home/LoadHTMLFormOrdenTrabajo";
import LoadHTMLForm from "../screens/Home/LoadHTMLForm";
import TareaDetail from "../screens/Home/TareaDetail";
import ScanList from "../screens/Scanner/ScanList";
import ScannerReview from "../screens/Scanner/ScannerReview";
import ScannerUbicar from "../screens/Scanner/ScannerUbicar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebPetzl from "../screens/Home/WebPetzl";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Auth = () => {
  // Stack Navigator for Login and Sign up Screen
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const [state, dispatch] = useContext(Context);
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="account"
      tabBarOptions={{
        inactiveTintColor: "white",
        activeTintColor: "white",
        activeBackgroundColor: COLORS.primary,
        inactiveBackgroundColor: COLORS.primary,
        style: {
          height: 70 + insets.bottom,
        },
        tabStyle: {
          height: 70,
        },
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => screenOptions(route, color),
      })}
    >
      <Tab.Screen
        name="account"
        component={AccountStack}
        options={{ title: "" }}
      />
      <Tab.Screen
        name="scanner"
        component={ScannerStack}
        options={{ title: "" }}
      />
      {/*   <Tab.Screen
        name="mytasks"
        component={HomeStack}
        options={{ title: "" }}
      /> */}
      <Tab.Screen name="mytasks" component={WebPetzl} options={{ title: "" }} />
    </Tab.Navigator>
  );
};

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: "#474952",
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          // Hiding header for Splash Screen
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="App"
          component={App}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="taskinfo"
          component={TaskInfo}
          options={{ title: "Tarea" }}
        />
        <Stack.Screen
          name="taskProductos"
          component={TaskProductos}
          options={{ title: "Tarea" }}
        />
        <Stack.Screen
          name="taskfullinfo"
          component={TaskFullInfo}
          options={{ title: "Tarea" }}
        />
        <Stack.Screen
          name="webViewScreen"
          component={WebViewScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="scannerTarea"
          component={ScannerTarea}
          options={{ title: "Escanee un equipo" }}
        />
        <Stack.Screen
          name="scannerPonerEtiqueta"
          component={ScannerPonerEtiqueta}
          options={{ title: "Poner etiqueta" }}
        />
        <Stack.Screen
          name="productDetail"
          component={ProductDetail}
          options={{ title: "Detalle activo" }}
        />
        <Stack.Screen
          name="pdfviewer"
          component={PDFViewer}
          options={{ title: "Documento" }}
        />
        {/*         <Stack.Screen
          name="loadhtmlform"
          component={LoadHTMLForm}
          options={{ title: "Form" }}
        /> */}
        <Stack.Screen
          name="loadhtmlformrevisionepi"
          component={LoadHTMLFormRevision}
          options={{ title: "Revisión" }}
        />
        <Stack.Screen
          name="loadhtmlformincidencia"
          component={LoadHTMLFormIncidencia}
          options={{ title: "Crear incidencia" }}
        />
        <Stack.Screen
          name="loadhtmlformsalida"
          component={LoadHTMLFormSalidaActivo}
          options={{ title: "Salida de activo" }}
        />
        <Stack.Screen
          name="loadhtmlformdevolucion"
          component={LoadHTMLFormDevolucionActivo}
          options={{ title: "Devolución" }}
        />
        <Stack.Screen
          name="loadhtmlformentrega"
          component={LoadHTMLFormEntrega}
          options={{ title: "Entrega de activo" }}
        />
        {/*         <Stack.Screen
          name="loadhtmlformentregadesdetarea"
          component={LoadHTMLFormEntregaDesdeTarea}
          options={{ title: "Entrega de EPI" }}
        /> */}
        <Stack.Screen
          name="loadhtmlformubicar"
          component={LoadHTMLFormUbicar}
          options={{ title: "Ubicar Activo" }}
        />
        <Stack.Screen
          name="loadhtmlformordentrabajo"
          component={LoadHTMLFormOrdenTrabajo}
          options={{ title: "Orden de trabajo" }}
        />
        <Stack.Screen
          name="tareadetail"
          component={TareaDetail}
          options={{ title: "Tarea" }}
        />
        <Stack.Screen
          name="scanlist"
          component={ScanList}
          options={{ title: "Escanee los activos" }}
        />
        <Stack.Screen
          name="scanreview"
          component={ScannerReview}
          options={{ title: "Escanee el equipo a revisar" }}
        />
        <Stack.Screen
          name="scanubicar"
          component={ScannerUbicar}
          options={{ title: "Escanee el activo" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function screenOptions(route, color) {
  let iconName;

  switch (route.name) {
    case "mytasks":
      iconName = "calendar";
      return (
        <Image
          style={{ width: 50, height: 30 }}
          source={require("./../../assets/petzl_blanco.png")}
        />
      );
    case "account":
      iconName = "format-list-bulleted-square";
      return (
        <Image
          style={{ width: 30, height: 30 }}
          source={require("./../../assets/casco_blanco.png")}
        />
      );
    case "scanner":
      iconName = "ScanOutlined";
      return (
        <Image
          style={{ width: 76, height: 76, marginBottom: 60 }}
          source={require("./../../assets/scan.png")}
        />
      );
    default:
      break;
  }
  return (
    <Icon type="material-community" name={iconName} size={30} color={color} />
  );
}
