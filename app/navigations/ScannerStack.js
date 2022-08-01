import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Scanner from "../screens/Scanner/Scanner";
import i18n from "../../i18n";
import { COLORS } from "../utils/colors";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="scanner"
        component={Scanner}
        options={{ title: "Escanee un equipo" }}
      />
    </Stack.Navigator>
  );
}
