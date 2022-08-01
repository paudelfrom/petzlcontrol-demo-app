import React, { useState, useEffect, useRef } from "react";
import { Image, SafeAreaView, StyleSheet, View, Text } from "react-native";
import { Divider, Icon, Card, Chip, Button } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProducts } from "../../utils/api";
import { BASEPATH } from "../../utils/constants";
import Loading from "../../components/LoadingSpinner";
import Toast from "react-native-easy-toast";
import { COLORS } from "../../utils/colors";
import i18n from "../../../i18n";
import moment from "moment";
import axios from "../../components/Auth/axiosApiInstance";
import Layout from "../../utils/Layout";
import * as FileSystem from "expo-file-system";

export default function ProductDetail(params) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState({});
  const [asset, setAsset] = useState({});

  var idAsset = params.route.params.id_asset;
  console.log("item:: ", idAsset);

  useEffect(async () => {
    var requestURL = BASEPATH + "/api/assets/" + idAsset;
    console.log(requestURL);
    axios
      .get(requestURL)
      .then((response) => {
        console.log("RESP CLIENTS");
        if (response.status === 200) {
          console.log("OK");

          var tCompra = new Date(
            parseInt(response.data.data.purchase_date) * 1000
          );
          console.log(tCompra);
          var formattedCompra =
            tCompra.getDate() +
            "/" +
            parseInt(tCompra.getMonth() + 1) +
            "/" +
            tCompra.getFullYear();
          response.data.data.fecha_compra = formattedCompra;

          var tCaducidad = new Date(
            parseInt(response.data.data.date_of_expiry) * 1000
          );
          console.log(tCaducidad);
          var formattedCaducidad =
            tCaducidad.getDate() +
            "/" +
            parseInt(tCaducidad.getMonth() + 1) +
            "/" +
            tCaducidad.getFullYear();
          response.data.data.fecha_caducidad = formattedCaducidad;

          response.data.data.vida_util = "3a, 2m";

          console.log("RESPUESTA ASSET: ", response.data.data);
          setAsset(response.data.data);

          navigation.setOptions({
            title: response.data.data.name,
          });

          var requestURL2 =
            BASEPATH + "/api/products/" + response.data.data.product.id;
          console.log(requestURL2);
          axios
            .get(requestURL2)
            .then((response2) => {
              console.log("RESP CLIENTS");
              if (response2.status === 200) {
                console.log("OK");
                var urlImagen = response2.data.data.imagen;
                urlImagen = urlImagen.split(" ").join("%20");
                response2.data.data.imagen = urlImagen;

                console.log("RESPUESTA PROD: ", response2.data.data);

                setProduct(response2.data.data);
              } else {
                console.error("ERROR ELSE");
                console.error(response2.status);
              }
            })
            .catch((error) => {
              console.error("ERR2");
              console.error(error);
            });
        } else {
          console.error("ERROR ELSE");
          console.error(response.status);
        }
      })
      .catch((error) => {
        console.error("ERR2");
        console.error(error);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Card>
        <Card.Title>Información</Card.Title>
        <Card.Divider />
        <View style={styles.fila}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={{ uri: product.imagen }}
          />
          <View style={{ flex: 3 }}>
            {asset.tag ? (
              <Text style={styles.name}>
                {asset.serial_number} | {asset.tag.code}
              </Text>
            ) : (
              <Text style={styles.name}>
                {asset.serial_number} | {asset.code}
              </Text>
            )}

            {asset.name ? (
              <Text>
                {asset.name.length > 30
                  ? asset.name.substring(0, 27) + "..."
                  : asset.name}
              </Text>
            ) : (
              <></>
            )}
            <Text style={styles.name}>{asset.description}</Text>
            {asset.apto == 1 ? (
              <View style={styles.fila}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="APTO"
                    buttonStyle={{
                      borderColor: "green",
                    }}
                    type="outline"
                    titleStyle={{ color: "green", fontSize: 10 }}
                    containerStyle={{
                      margin: 5,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  {asset.status.id == 6 ? (
                    <Button
                      title="CON INCIDENCIA"
                      buttonStyle={{
                        borderColor: "purple",
                      }}
                      type="outline"
                      titleStyle={{ color: "purple", fontSize: 10 }}
                      containerStyle={{
                        margin: 5,
                      }}
                    />
                  ) : asset.status.id == 2 ? (
                    <Button
                      title="DISPONIBLE"
                      buttonStyle={{
                        borderColor: "blue",
                      }}
                      type="outline"
                      titleStyle={{ color: "blue", fontSize: 10 }}
                      containerStyle={{
                        margin: 5,
                      }}
                    />
                  ) : asset.status.id == 3 ? (
                    <Button
                      title="EN USO"
                      buttonStyle={{
                        borderColor: "orange",
                      }}
                      type="outline"
                      titleStyle={{ color: "orange", fontSize: 10 }}
                      containerStyle={{
                        margin: 5,
                      }}
                    />
                  ) : (
                    <Button
                      title="INACTIVO"
                      buttonStyle={{
                        borderColor: "black",
                      }}
                      type="outline"
                      titleStyle={{ color: "black", fontSize: 10 }}
                      containerStyle={{
                        margin: 5,
                      }}
                    />
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.fila}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="NO APTO"
                    buttonStyle={{
                      borderColor: "black",
                    }}
                    type="outline"
                    titleStyle={{ color: "black", fontSize: 10 }}
                    containerStyle={{
                      margin: 5,
                    }}
                  />
                </View>
              </View>
            )}
            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>F. Compra</Text>
                <Text style={styles.name}>{asset.fecha_compra}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>F. Cad</Text>
                <Text style={styles.name}>{asset.fecha_caducidad}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>Vida útil</Text>
                <Text style={styles.name}>{asset.vida_util}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      <View style={{ paddingTop: 30, marginHorizontal: 20 }}>
        <View style={styles.caracteristica}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Text style={styles.desc}>Ficha técnica:</Text>
          </View>
          <View style={{ flex: 2 }}>
            <Button
              style={{ width: 50 }}
              buttonStyle={{
                backgroundColor: "transparent",
              }}
              icon={
                <Icon
                  name="file-pdf-box"
                  type="material-community"
                  size={30}
                  color="black"
                />
              }
              onPress={() => openPdf(product.fichaTecnica)}
              title=""
            />
          </View>
        </View>
      </View>
      <Card>
        <Card.Title>Información</Card.Title>
        <Card.Divider />
        <View style={styles.fila}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={{ uri: product.imagen }}
          />
          <View style={{ flex: 3 }}>
            <Text style={styles.name}>{product.ean13}</Text>
            <Text style={styles.name}>{product.codart}</Text>
            {product.name ? (
              <Text>
                {product.name.length > 30
                  ? product.name.substring(0, 27) + "..."
                  : product.name}
              </Text>
            ) : (
              <></>
            )}

            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Chip title="APTO" containerStyle={{ margin: 5 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Chip title="DISPONIBLE" containerStyle={{ margin: 5 }} />
              </View>
            </View>
            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>F. Compra</Text>
                <Text style={styles.name}>{product.codart}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>F. Cad</Text>
                <Text style={styles.name}>{product.codart}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>Vida útil</Text>
                <Text style={styles.name}>{product.codart}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </SafeAreaView>
  );
  function openPdf(url) {
    navigation.navigate("pdfviewer", {
      url: url,
    });
  }
}

function isUrl(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    /* width: Layout.window.width - 300,
    height: Layout.window.height / 2 - 300, */
    flex: 1,
    borderRadius: 20,
  },
  name: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
  },
  desc: {
    color: "#5E5E5E",
    alignSelf: "flex-start",
    fontSize: 14,
  },
  divider: {
    backgroundColor: "#C0C0C0",
    width: Layout.window.width - 60,
    margin: 20,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  caracteristica: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
});
