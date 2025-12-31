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
    TouchableOpacity,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';

const EngleBrightHallDetailsScreen = ({ navigation, route }) => {
    const { venue, venueType } = route.params || {};

    // Get images from backend venue data
    const images = venue?.images || [];
    const hasImages = images.length > 0;

    const handleBookNow = () => {
        navigation.navigate('BHBooking', {
            venue: venue,
            venueType: venueType || 'hall',
            selectedMenu: null
        });
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#fffaf2" />
            <View style={styles.container}>

                {/* Notch Header */}
                <ImageBackground
                    source={require('../assets/notch.jpg')}
                    style={styles.notch}
                    imageStyle={styles.notchImage}
                >
                    <View style={styles.notchContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-back" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Engle Bright Hall</Text>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="notifications-outline" size={26} color="#000" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {/* Main Scrollable Content */}
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                        {/* Image Slider - Images from Backend */}
                        <View style={styles.sliderContainer}>
                            {hasImages ? (
                                <Swiper
                                    autoplay
                                    autoplayTimeout={4}
                                    loop
                                    showsPagination
                                    activeDotColor="#A3834C"
                                    dotColor="rgba(255,255,255,0.5)"
                                >
                                    {images.map((img, index) => (
                                        <Image
                                            key={index}
                                            source={{ uri: img.url }}
                                            style={styles.sliderImage}
                                        />
                                    ))}
                                </Swiper>
                            ) : (
                                <View style={styles.noImageContainer}>
                                    <Icon name="image-outline" size={50} color="#ccc" />
                                    <Text style={styles.noImageText}>No images available</Text>
                                </View>
                            )}
                        </View>



                        {/* Why Our Engle Bright Hall Section */}
                        <View style={styles.whySection}>
                            <Text style={styles.whyTitle}>
                                WHY OUR <Text style={styles.whyTitleGold}>ENGLE BRIGHT HALL</Text>
                            </Text>

                            {/* Features Grid */}
                            <View style={styles.featuresGrid}>
                                {/* Row 1 */}
                                <View style={styles.featureRow}>
                                    <View style={styles.featureBox}>
                                        <Icon name="pricetag-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Best Rate</Text>
                                    </View>
                                    <View style={styles.featureBox}>
                                        <Icon name="snow-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Air Conditioned</Text>
                                    </View>
                                    <View style={styles.featureBox}>
                                        <Icon name="people-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>48 Capacity</Text>
                                    </View>
                                </View>

                                {/* Row 2 */}
                                <View style={styles.featureRow}>
                                    <View style={styles.featureBox}>
                                        <Icon name="home-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Family{'\n'}Friendly</Text>
                                    </View>
                                    <View style={styles.featureBox}>
                                        <Icon name="restaurant-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Dining{'\n'}Service</Text>
                                    </View>
                                    <View style={styles.featureBox}>
                                        <Icon name="heart-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Intimate{'\n'}Setting</Text>
                                    </View>
                                </View>

                                {/* Row 3 */}
                                <View style={styles.featureRow}>
                                    <View style={styles.featureBox}>
                                        <Icon name="car-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Parking</Text>
                                    </View>
                                    <View style={styles.featureBox}>
                                        <Icon name="bulb-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Ambient{'\n'}Lighting</Text>
                                    </View>
                                    <View style={styles.featureBox}>
                                        <Icon name="shield-checkmark-outline" size={36} color="#A3834C" />
                                        <Text style={styles.featureText}>Privacy</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Description Section */}
                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionTitle}>About Engle Bright Hall</Text>
                            <Text style={styles.descriptionText}>
                                It is a dining space particularly designed for families. The Engle Bright Hall
                                provides an intimate and comfortable setting for family gatherings, celebrations,
                                and private dining experiences.
                            </Text>
                            {/* <View style={styles.capacityBadge}>
                                <Icon name="people" size={20} color="#A3834C" />
                                <Text style={styles.capacityText}>Capacity: 48 Persons</Text>
                            </View> */}
                        </View>
                        {/* Dress Code Section
                        <View style={styles.dressCodeSection}>
                            <Text style={styles.dressCodeTitle}>Dress Code</Text>

                            <Text style={styles.dressCodeSub}>To be followed:</Text>
                            <Text style={styles.dressCodeItem}>• Dress Pants/Shirts, Safari suit or lounge suit</Text>
                            <Text style={styles.dressCodeItem}>• Shalwar Kameez with waist coat</Text>
                            <Text style={styles.dressCodeItem}>• Closed shoes</Text>

                            <Text style={styles.dressCodeSub}>Not allowed:</Text>
                            <Text style={styles.dressCodeItem}>• Jeans with T-Shirts</Text>
                            <Text style={styles.dressCodeItem}>• Sandals/Back Strap Chapels</Text>
                            <Text style={styles.dressCodeItem}>• Joggers/Shorts</Text>
                            <Text style={styles.dressCodeItem}>• Shalwar Kameez without waist coat</Text>
                        </View> */}

                        {/* Contact Info
                        <View style={styles.contactSection}>
                            <Icon name="call-outline" size={24} color="#A3834C" />
                            <Text style={styles.contactText}>For booking: 0341-9777711</Text>
                        </View> */}

                        {/* Book Now Button */}
                        <TouchableOpacity
                            style={styles.bookButton}
                            onPress={handleBookNow}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </SafeAreaView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF9F3',
    },
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
        minHeight: 120,
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        flex: 1,
    },
    notificationButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sliderContainer: {
        height: 250,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    sliderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    noImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    noImageText: {
        marginTop: 10,
        color: '#999',
        fontSize: 14,
    },
    descriptionSection: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A3834C',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 15,
    },
    capacityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF9F3',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    capacityText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#A3834C',
    },
    whySection: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    whyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 25,
    },
    whyTitleGold: {
        color: '#A3834C',
        fontWeight: 'bold',
    },
    featuresGrid: {
        width: '100%',
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    featureBox: {
        width: '31%',
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: '#A3834C',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 10,
    },
    featureText: {
        fontSize: 11,
        color: '#000',
        textAlign: 'center',
        fontWeight: '500',
        marginTop: 8,
    },
    dressCodeSection: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    dressCodeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A3834C',
        marginBottom: 15,
        textAlign: 'center',
    },
    dressCodeSub: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 10,
        marginBottom: 5,
    },
    dressCodeItem: {
        fontSize: 13,
        color: '#555',
        lineHeight: 22,
        marginLeft: 10,
    },
    contactSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    contactText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    bookButton: {
        backgroundColor: '#A3834C',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
});

export default EngleBrightHallDetailsScreen;
