import React from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
} from "react-native";
import Swiper from "react-native-swiper";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// ---------------------- DATA ----------------------

const features = [
    { icon: "theater", label: "Elegant Stage" },
    { icon: "chandelier", label: "Grand Lighting" },
    { icon: "sofa", label: "Premium Seating" },
    { icon: "fan", label: "Air Conditioning" },
    { icon: "silverware-fork-knife", label: "Catering" },
    { icon: "music", label: "Sound System" },
    { icon: "television", label: "Multimedia" },
    { icon: "flower", label: "Décor Options" },
    { icon: "parking", label: "Valet Parking" },
];


// ---------------------- SCREEN ----------------------

export default function BanquetHallDetailsScreen({ navigation, route }) {
    const { venue, venueType } = route.params || {};

    const handleBookNow = () => {
        navigation.navigate("BHBooking", {
            venue: venue,
            venueType: venueType || 'hall',
            selectedMenu: null
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fffaf2" }}>
            {/* ---------------- NOTCH AREA ---------------- */}
            <ImageBackground
                source={require("../assets/notch.jpg")}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchContent}>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcon name="arrow-left" size={28} color="#000" />
                    </TouchableOpacity>

                    <Text style={styles.headerText}>{venue?.name || 'Banquet Hall'}</Text>

                    {/* Notification Button */}
                    <TouchableOpacity style={styles.notificationButton}>
                        <MaterialIcon name="bell-outline" size={26} color="#000" />
                    </TouchableOpacity>

                </View>
            </ImageBackground>

            {/* ---------------- CONTENT AREA ---------------- */}
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="black" />
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* SLIDER */}
                    <View style={styles.sliderContainer}>
                        {venue?.images && venue.images.length > 0 ? (
                            <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
                                {venue.images.map((img, index) => (
                                    <Image key={index} source={{ uri: img.url }} style={styles.sliderImage} />
                                ))}
                            </Swiper>
                        ) : (
                            <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
                                <Image source={require("../assets/psc_home.jpeg")} style={styles.sliderImage} />
                                <Image source={require("../assets/psc2.jpeg")} style={styles.sliderImage} />
                                <Image source={require("../assets/psc3.jpeg")} style={styles.sliderImage} />
                            </Swiper>
                        )}
                    </View>

                    <Text style={styles.sectionHeading}>
                        MORE ABOUT <Text style={{ color: "#A3834C" }}>{venue?.name || 'Banquet Hall'}</Text>
                    </Text>


                    <View style={styles.card}>
                        <Text style={styles.detailTitle}>About {venue?.name}</Text>
                        <Text style={styles.detailText}>{venue?.description || 'Exprience the pinnacle of luxury and elegance at our prestigious hall. Designed for grand celebrations and corporate excellence.'}</Text>
                        <View style={styles.capacityBadge}>
                            <MaterialIcon name="account-group" size={20} color="#A3834C" />
                            <Text style={styles.capacityText}>Capacity: {venue?.capacity || 'N/A'} Guests</Text>
                        </View>
                    </View>

                    {/* PRICING SECTION */}
                    <View style={styles.card}>
                        <Text style={styles.detailTitle}>Booking Types</Text>
                        <View style={styles.priceContainer}>
                            <View style={styles.priceItem}>
                                <View style={styles.priceIconBg}>
                                    <MaterialIcon name="account-star" size={24} color="#A3834C" />
                                </View>
                                <Text style={styles.priceType}>Member Booking</Text>
                                <Text style={styles.priceValue}>Rs. {venue?.chargesMembers?.toLocaleString() || 'N/A'}</Text>
                            </View>
                            <View style={styles.priceItem}>
                                <View style={styles.priceIconBg}>
                                    <MaterialIcon name="account-outline" size={24} color="#A3834C" />
                                </View>
                                <Text style={styles.priceType}>Guest Booking</Text>
                                <Text style={styles.priceValue}>Rs. {venue?.chargesGuests?.toLocaleString() || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* FEATURES SECTION */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.featureTitle}>PREMIUM AMENITIES</Text>
                        <Text style={styles.featureSubtitle}>
                            Everything you need for an unforgettable event
                        </Text>
                        <View style={styles.featuresGrid}>
                            {features.map((item, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <View style={styles.featureIconBox}>
                                        <MaterialIcon name={item.icon} size={32} color="#A3834C" />
                                    </View>
                                    <Text style={styles.featureText}>{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 80 }} />
                </ScrollView>

                {/* BOOK NOW BUTTON */}
                <View style={styles.bookNowContainer}>
                    <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
                        <Text style={styles.bookNowText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// ---------------------- STYLES ----------------------

const styles = StyleSheet.create({
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: "hidden",
    },
    notchImage: { resizeMode: "cover" },

    notchContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

    headerText: { fontSize: 22, fontWeight: "bold", color: "#000", flex: 1, textAlign: "center" },

    notificationButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

    sliderContainer: {
        width: "92%",
        height: 200,
        alignSelf: "center",
        borderRadius: 20,
        overflow: "hidden",
        marginTop: 15,
        marginBottom: 10,
    },

    sliderImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 20,
    },

    sectionHeading: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginVertical: 15,
        letterSpacing: 1,
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A3834C',
        marginBottom: 10,
    },

    detailText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 15,
    },

    capacityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffaf2',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#e0d1b8',
    },

    capacityText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#A3834C',
    },

    // Pricing styles
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    priceItem: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: '#fffaf2',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0d1b8',
    },

    priceIconBg: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
    },

    priceType: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },

    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

    // Features section
    featuresSection: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },

    featureTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 2,
    },

    featureSubtitle: {
        color: "#666",
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 13,
    },

    featuresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    featureItem: {
        width: "30%",
        alignItems: "center",
        marginBottom: 20,
    },

    featureIconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#e0d1b8",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fffaf2",
        marginBottom: 8,
    },

    featureText: {
        fontSize: 10,
        color: "#555",
        textAlign: "center",
        fontWeight: "600",
    },

    bookNowContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },

    bookNowButton: {
        backgroundColor: "#a0855c",
        width: "100%",
        alignItems: "center",
        paddingVertical: 15,
        borderRadius: 15,
    },

    bookNowText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});
