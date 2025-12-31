import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Linking } from "react-native";

const BakistryItems = ({ route, navigation }) => {
  const { cart, items } = route.params;

  const [cartState, setCartState] = useState(cart);

  const getItemDetails = (id) => items.find((item) => item.id === id);

  const increaseQty = (id) => {
    setCartState((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decreaseQty = (id) => {
    setCartState((prev) => {
      if (prev[id] === 1) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: prev[id] - 1 };
    });
  };

  const deleteItem = (id) => {
    const updated = { ...cartState };
    delete updated[id];
    setCartState(updated);
  };

  const totalAmount = Object.keys(cartState).reduce((sum, id) => {
    const item = getItemDetails(parseInt(id));
    return sum + item.price * cartState[id];
  }, 0);

  const serviceCharges = totalAmount * 0.05;
  const gst = totalAmount * 0.15;

  const netTotal = totalAmount + serviceCharges + gst;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Notch Header */}
      <ImageBackground
        source={require("../assets/notch.jpg")}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Cart</Text>

          <View style={{ width: 40 }} />
        </View>
      </ImageBackground>

      {/* Cart Items */}
      <View style={{ flex: 1 }}>
        {Object.keys(cartState).length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 40, fontSize: 18 }}>
            Cart is empty
          </Text>
        ) : (
          Object.keys(cartState).map((id) => {
            const item = getItemDetails(parseInt(id));
            return (
              <View key={id} style={styles.itemCard}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.quantityText}>
                    Quantity: {cartState[id]}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => increaseQty(id)}>
                    <Icon name="add" size={26} color="green" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => decreaseQty(id)}>
                    <Icon name="remove" size={26} color="red" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteItem(id)}>
                    <Icon name="trash" size={26} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Bottom Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total: {totalAmount.toFixed(1)}</Text>
        <Text style={styles.summaryText}>
          Service charges (5%): {serviceCharges.toFixed(1)}
        </Text>
        <Text style={styles.summaryText}>GST (15%): {gst.toFixed(1)}</Text>

        <Text style={styles.netTotal}>Net Total: {netTotal.toFixed(1)}</Text>

        <TouchableOpacity
  style={styles.callButton}
  onPress={() => Linking.openURL("tel:03089688388")}
>
  <Icon name="call-outline" size={20} color="#A3834C" />
  <Text style={styles.callText}>Call</Text>
</TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF3E8" },

  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: "hidden",
  },
  notchImage: { resizeMode: "cover" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },

  itemCard: {
    backgroundColor: "#F5E9D8",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemName: { fontSize: 16, fontWeight: "bold", color: "#000" },

  quantityText: { color: "#A3834C", marginTop: 5 },

  actionsRow: { flexDirection: "row", alignItems: "center", gap: 15 },

  summaryContainer: {
    padding: 20,
    backgroundColor: "#F2E4CE",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  summaryText: { fontSize: 16, marginBottom: 5 },

  netTotal: { fontSize: 22, marginTop: 15, fontWeight: "bold" },

  callButton: {
    marginTop: 15,
    backgroundColor: "#FFF",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  callText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A3834C",
  },
});

export default BakistryItems;
