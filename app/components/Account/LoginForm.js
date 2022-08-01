import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  NativeModules,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Input,
  Icon,
  Button,
  BottomSheet,
  CheckBox,
  Text,
} from "react-native-elements";
import { isEmpty } from "lodash";
import { useNavigation } from "@react-navigation/native";
import Loading from "../LoadingSpinner";
import { BASEPATH } from "../../utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../utils/colors";
import i18n from "../../../i18n";

const { height } = Dimensions.get("window");

export default function LoginForm(props) {
  const { toastRef } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue());
  const [loading, setLoading] = useState(false);
  const [tokenState, setTokenState] = useState("");
  const [userState, setUserState] = useState("");
  const navigation = useNavigation();

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
    const nuevoValor = e.nativeEvent.text;
    if (type === "password") {
      if (!isEmpty(formData.username) && !isEmpty(nuevoValor)) {
        setDisabledBtn(false);
      } else {
        setDisabledBtn(true);
      }
    } else if (type === "username") {
      if (!isEmpty(formData.password) && !isEmpty(nuevoValor)) {
        setDisabledBtn(false);
      } else {
        setDisabledBtn(true);
      }
    }
  };

  useEffect(() => {
    const deviceLanguage =
      Platform.OS === "ios"
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier;
    var systemLanguage = "en";
    if (
      deviceLanguage.substring(0, 2) === null ||
      deviceLanguage.substring(0, 2) !== "en"
    ) {
      systemLanguage = "es";
    }

    console.log("EL systemLanguage ES: ", systemLanguage);

    AsyncStorage.getItem("language").then((value) => {
      console.log("EL LANGUAGE ES: ", value);
      if (value === null) {
        i18n.locale = systemLanguage;
        AsyncStorage.setItem("language", systemLanguage);
      } else {
        i18n.locale = value;
        AsyncStorage.setItem("language", value);
      }
    });
  }, []);

  const onSubmit = () => {
    if (isEmpty(formData.username) || isEmpty(formData.password)) {
      toastRef.current.show(i18n.t("login.errorData"), 1000);
    } else {
      setLoading(true);
      setLoading(true);

      let dataToSend = {
        email: formData.username,
        password: formData.password,
      };
      fetch(BASEPATH + "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(dataToSend),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((responseJson) => {
          setLoading(false);
          console.log("RESP LOGIN");
          console.log(responseJson);

          if (!responseJson.Error) {
            console.log("OK");

            setTokenState(JSON.stringify(responseJson.access_token));
            var userData = responseJson.user_data;
            setUserState(JSON.stringify(userData));

            console.log("USERDATA:: ", userData);
            console.log("formData:: ", formData);

            if (!userData) {
              console.log("La contraseña no es correcta");
              toastRef.current.show("La contraseña no es correcta", 1000);
            } else {
              userData.pw = formData.password;

              console.log("ROL_ID:", userData.roles[0].id);

              if (userData.roles[0].id == 4 || userData.roles[0].id == 5) {
                AsyncStorage.setItem(
                  "token",
                  JSON.stringify(responseJson.access_token)
                );
                AsyncStorage.setItem("userData", JSON.stringify(userData));
                navigation.replace("App");
              } else {
                console.log(
                  "Lo siento, el usuario no tiene permisos de acceso"
                );
                toastRef.current.show(
                  "Lo siento, el usuario no tiene permisos de acceso",
                  1000
                );
              }
            }
          } else {
            console.log(responseJson.Error);
            toastRef.current.show(i18n.t("login.errorData"), 1000);
          }
        })
        .catch((error) => {
          setLoading(false);
          console.error("ERR2");
          console.error(error);
          toastRef.current.show(i18n.t("login.error"), 1000);
        });
    }
  };

  const postLogin = () => {
    AsyncStorage.setItem("token", tokenState);
    AsyncStorage.setItem("userData", userState);
    navigation.replace("App");
  };

  return (
    <View style={styles.formContainer}>
      <BottomSheet
        isVisible={isDialogVisible}
        containerStyle={{ backgroundColor: "rgba(0.5, 0.25, 0, 0.2)" }}
        style={{ height, backgroundColor: "#fff" }}
      >
        <View
          style={{
            paddingHorizontal: 15,
            height: height - 20,
          }}
        >
          <Button
            containerStyle={styles.btnContainerClose}
            buttonStyle={styles.btnClose}
            icon={<Icon name="close" size={20} color="black" />}
            onPress={() => setIsDialogVisible(false)}
            title=" "
          />

          <Text h4 style={styles.titleStyle}>
            {i18n.t("account.legal")}
          </Text>

          <Text style={{ paddingTop: 20, paddingBottom: 10 }}>
            {i18n.t("account.text1Legal")}
          </Text>

          <Text style={{ paddingBottom: 30 }}>
            {i18n.t("account.text2Legal")}
          </Text>

          <CheckBox
            title={i18n.t("account.buttonLegal")}
            checked={checked}
            onPress={() => setChecked(!checked)}
            style={{ paddingVertical: 10 }}
            checkedColor={COLORS.secondary}
          />

          <Button
            containerStyle={{ paddingVertical: 30, padding: 16, width: "100%" }}
            buttonStyle={styles.btnShoppingSend}
            title={i18n.t("account.legal5")}
            onPress={() => {
              postLogin();
            }}
            disabled={!checked}
          ></Button>
        </View>
      </BottomSheet>
      <Input
        placeholder={i18n.t("login.user")}
        onChange={(e) => onChange(e, "username")}
        autoCapitalize="none"
      ></Input>
      <Input
        placeholder={i18n.t("login.password")}
        password={true}
        onChange={(e) => onChange(e, "password")}
        secureTextEntry={showPassword ? false : true}
        rightIcon={
          <Icon
            type="material-community"
            color={COLORS.primary}
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            iconStyle={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          ></Icon>
        }
      ></Input>
      <TouchableOpacity style={styles.TextViewStyle} onPress={onSubmit}>
        <Text style={styles.TextStyle}> Acceder </Text>
      </TouchableOpacity>

      <Loading
        isVisible={loading}
        text={i18n.t("login.pendingLogin")}
      ></Loading>
    </View>
  );
}

function defaultFormValue() {
  return {
    username: "sheila+metalco@pinchaaqui.es",
    password: "password",
  };
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  btnContainerClose: {
    width: "100%",
    alignItems: "flex-end",
  },
  btnClose: {
    backgroundColor: "#fff",
    height: 40,
    width: 40,
  },
  titleStyle: {
    backgroundColor: "#fff",
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  TextViewStyle: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: COLORS.primary,
    padding: 5,
    marginHorizontal: 10,
    marginTop: 20,
    backgroundColor: COLORS.primary,
  },

  TextStyle: {
    textAlign: "center",
    color: COLORS.foreground,
    fontWeight: "bold",
    fontSize: 18,
    padding: 10,
    fontSize: 16,
    lineHeight: 21,
  },

  btnContainerSend: {
    padding: 16,
    width: "100%",
    bottom: 0,
  },
  btnShoppingSend: {
    height: 50,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },
});
