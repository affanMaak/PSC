import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Linking } from "react-native";

const ClubCafeCart = ({ route, navigation }) => {
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
        const item = getItemDetails(id);
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
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {Object.keys(cartState).length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                        <Icon name="cart-outline" size={80} color="#A3834C" />
                        <Text style={styles.emptyCartText}>Your cart is empty</Text>
                        <TouchableOpacity
                            style={styles.continueShoppingButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    Object.keys(cartState).map((id) => {
                        const item = getItemDetails(id);
                        return (
                            <View key={id} style={styles.itemCard}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemSize}>{item.size}</Text>
                                    <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                                    <Text style={styles.quantityText}>
                                        Quantity: {cartState[id]}
                                    </Text>
                                    <Text style={styles.subtotalText}>
                                        Subtotal: Rs. {(item.price * cartState[id]).toFixed(0)}
                                    </Text>
                                </View>

                                <View style={styles.actionsColumn}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => increaseQty(id)}
                                    >
                                        <Icon name="add" size={24} color="#A3834C" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => decreaseQty(id)}
                                    >
                                        <Icon name="remove" size={24} color="#A3834C" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => deleteItem(id)}
                                    >
                                        <Icon name="trash" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Bottom Summary */}
            {Object.keys(cartState).length > 0 && (
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total:</Text>
                        <Text style={styles.summaryValue}>Rs. {totalAmount.toFixed(0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service charges (5%):</Text>
                        <Text style={styles.summaryValue}>Rs. {serviceCharges.toFixed(0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>GST (15%):</Text>
                        <Text style={styles.summaryValue}>Rs. {gst.toFixed(0)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.netTotalLabel}>Net Total:</Text>
                        <Text style={styles.netTotalValue}>Rs. {netTotal.toFixed(0)}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => Linking.openURL("tel:03089688388")}
                    >
                        <Icon name="call-outline" size={20} color="#FFF" />
                        <Text style={styles.callText}>Call to Order</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5E6D3"
    },

    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: "hidden",
    },
    notchImage: {
        resizeMode: "cover"
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center"
    },

    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
        flex: 1,
    },

    emptyCartContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
    },

    emptyCartText: {
        fontSize: 20,
        color: "#666",
        marginTop: 20,
        marginBottom: 30,
    },

    continueShoppingButton: {
        backgroundColor: "#A3834C",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },

    continueShoppingText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },

    itemCard: {
        backgroundColor: "#FFF9F0",
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    itemInfo: {
        flex: 1,
    },

    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },

    itemSize: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },

    itemPrice: {
        fontSize: 15,
        fontWeight: "500",
        color: "#A3834C",
        marginBottom: 4,
    },

    quantityText: {
        color: "#666",
        marginTop: 5,
        fontSize: 14,
    },

    subtotalText: {
        color: "#000",
        marginTop: 5,
        fontSize: 15,
        fontWeight: "600",
    },

    actionsColumn: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },

    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#A3834C",
    },

    deleteButton: {
        backgroundColor: "#d9534f",
        borderColor: "#d9534f",
    },

    summaryContainer: {
        padding: 20,
        backgroundColor: "#FFF9F0",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    summaryLabel: {
        fontSize: 15,
        color: "#666"
    },

    summaryValue: {
        fontSize: 15,
        fontWeight: "500",
        color: "#000",
    },

    divider: {
        height: 1,
        backgroundColor: "#E0D4C0",
        marginVertical: 12,
    },

    netTotalLabel: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },

    netTotalValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#A3834C",
    },

    callButton: {
        marginTop: 15,
        backgroundColor: "#A3834C",
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },

    callText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
});

export default ClubCafeCart;
