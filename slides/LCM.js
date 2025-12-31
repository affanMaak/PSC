import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    StatusBar,
    ScrollView,
    ImageBackground,
    Image,
    TouchableOpacity
} from 'react-native';

import AntIcon from "react-native-vector-icons/AntDesign";

const LiveScreeningScreen = ({ navigation }) => {
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.container}>

                {/* 🔹 Notch Header */}
                <ImageBackground
                    source={require("../assets/notch.jpg")}
                    style={styles.notch}
                    imageStyle={styles.notchImage}
                >
                    <View style={styles.notchContent}>

                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('events')}
                        >
                            <AntIcon name="arrowleft" size={28} color="#000" />
                        </TouchableOpacity>

                        {/* Center Title */}
                        <Text style={styles.headerText}>Live Screening</Text>

                    </View>
                </ImageBackground>

                {/* 🔹 Main Scrollable Content */}
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >

                        {/* Description Card */}
                        <View style={styles.descriptionCard}>
                            <Text style={styles.descriptionText}>
                                Catch the excitement of major sports events live on the big screen!
                                Join fellow fans for live screenings of cricket matches, football games,
                                and other major sporting events in a lively atmosphere.
                            </Text>
                        </View>

                        {/* Image 1 */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={require('../assets/lv.jpg')}
                                style={styles.eventImage}
                                resizeMode="cover"
                            />
                        </View>

                    </ScrollView>
                </SafeAreaView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
        minHeight: 150,
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        flex: 1,
        marginRight: 40,
        letterSpacing: 0.5,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    descriptionCard: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 25,
        paddingHorizontal: 25,
        backgroundColor: '#ff5f2917',
        borderWidth: 1,
        borderColor: '#D0D0D0',
        borderRadius: 8,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#000',
        textAlign: 'center',
    },
    imageContainer: {
        marginHorizontal: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: 200,
    },
});

export default LiveScreeningScreen;
