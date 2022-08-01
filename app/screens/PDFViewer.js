import React, { useState, useEffect, useRef } from "react";
import { Image, SafeAreaView, StyleSheet, View, Text } from "react-native";
import PDFReader from "rn-pdf-reader-js";

export default function PDFViewer(params) {
  const [url, setUrl] = useState(params.route.params.url);

  return (
    <SafeAreaView style={styles.container}>
      <PDFReader
        source={{
          uri: url,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
