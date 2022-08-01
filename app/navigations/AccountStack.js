import React from "react";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Account from "../screens/Account/Account";
import { Button, View, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import i18n from "../../i18n";
import { COLORS } from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

export default function AccountStack() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="account"
        component={Account}
        options={{
          title: "Equipos",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingRight: 24,
                width: 120,
              }}
            >
              <TouchableOpacity>
                <Icon
                  type="material-community"
                  name="logout"
                  size={30}
                  color="#E76565"
                  onPress={() => logout(navigation)}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

logout = async (navigation) => {
  console.log(navigation);
  try {
    clearAllData(navigation);
  } catch (error) {
    alert(error);
  }
};

async function clearAllData(navigation) {
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
      navigation.replace("Auth");
    });
}
