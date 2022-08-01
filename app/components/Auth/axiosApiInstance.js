import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { BASEPATH } from "../../utils/constants";
import NavigationService from "./NavigationService";

const axiosApiInstance = axios.create();
var token = "";

axiosApiInstance.interceptors.response.use(
  function (successRes) {
    return successRes;
  },
  async function (error) {
    if (error.message === "password") {
      console.log("responseKO:: ", error.message);
      AsyncStorage.getAllKeys()
        .then((keys) => {
          keys.forEach(async (key) => {
            console.log("KEY: ", key);
            if (key != "language") {
              await AsyncStorage.removeItem(key);
            }
          });
        })
        .then(() => {
          console.log("BORRANDO DATOS");
          console.log(NavigationService);
          NavigationService.navigate("Auth");
        });
      //  await AsyncStorage.clear();
    }

    return Promise.reject(error);
  }
);

// Request interceptor for API calls
axiosApiInstance.interceptors.request.use(
  async (config) => {
    let userDataItem = await AsyncStorage.getItem("userData");
    var userData = JSON.parse(userDataItem);
    let sessionItem = await AsyncStorage.getItem("token");
    var token = JSON.parse(sessionItem);
    console.log(token);

    const { exp } = jwt_decode(token);

    const expirationTime = exp * 1000 - 60000;

    if (Date.now() >= expirationTime) {
      console.log("userData.pw: ", userData.pw);
      if (userData.pw === undefined) {
        throw new axios.Cancel("password");
      } else {
        console.log("RELOGUEA ANTES: ", token);
        const resultRelogin = await relogin(userData);
        console.log("RELOGUEA DESPUES: ", token);
      }
    } else {
      token = token;
    }

    config.headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    return config;
  },
  (error) => {
    console.log("error ", error);
    Promise.reject(error);
  }
);

function relogin(userData) {
  let dataToSend = {
    username: userData.USUARIO,
    password: userData.pw,
  };
  return new Promise((resolve) => {
    fetch(BASEPATH + "/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dataToSend),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(async (responseJson) => {
        if (responseJson === undefined || responseJson[1] === undefined) {
          resolve(false);
        } else if (!responseJson.Error) {
          token = responseJson[1].token;
          await AsyncStorage.setItem("token", JSON.stringify(responseJson[1]));
          var usrData = responseJson[0];
          usrData.pw = dataToSend.password;
          await AsyncStorage.setItem("userData", JSON.stringify(usrData));
          resolve(true);
        } else {
          console.log(responseJson.Error);
          resolve(false);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
        resolve(false);
      });
  });
}

export default axiosApiInstance;
