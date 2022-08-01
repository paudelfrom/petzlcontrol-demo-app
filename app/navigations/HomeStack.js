import React from "react";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, View, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import Home from "../screens/Home/Home";
import MyTasks from "../screens/Home/MyTasks";

import i18n from "../../i18n";
import { COLORS } from "../utils/colors";

const Stack = createStackNavigator();

export default function HomeStack() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerTintColor: "#474952",
      }}
    >
      <Stack.Screen
        name="mytasks"
        component={MyTasks}
        options={{
          title: "Mis tareas",
          /* headerRight: () => (
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
                  name="calendar"
                  size={30}
                  color="#474952"
                  onPress={() => navigation.navigate("home")}
                />
              </TouchableOpacity>
            </View>
          ), */
        }}
      />
      <Stack.Screen
        name="home"
        component={Home}
        options={{ title: i18n.t("navigation.home") }}
      />
    </Stack.Navigator>
  );
}
