import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Overlay } from "react-native-elements";
import { COLORS } from "../utils/colors";

export default function Loading(props) {
  const { isVisible, text, backgroundColor } = props;

  return (
    <View>
      {isVisible ? (
        <View isVisible={isVisible} style={{ backgroundColor }} round={true}>
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      ) : (
        <></>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    height: 100,
    width: 200,
    backgroundColor: "#fff",
    borderColor: COLORS.primary,
    borderWidth: 2,
    borderRadius: 10,
  },
  view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: COLORS.foreground,
    margin: 5,
    textAlign: "center",
  },
});
