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

const VeteransLoungeDetailsScreen = ({ navigation, route }) => {
    const { venue, venueType } = route.params || {};
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
                <ImageBackground
                    source={require('../assets/notch.jpg')}
                    style={styles.notch}
                    imageStyle={styles.notchImage}
                >
                    <View style={styles.notchContent}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Veterans' Lounge</Text>
                        <TouchableOpacity style={styles.notificationButton}>
                            <Icon name="notifications-outline" size={26} color="#000" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <SafeAreaView style={styles.safeArea}>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.sliderContainer}>
                            {hasImages ? (
                                <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
                                    {images.map((img, index) => (
                                        <Image key={index} source={{ uri: img.url }} style={styles.sliderImage} />
                                    ))}
                                </Swiper>
                            ) : (
                                <View style={styles.noImageContainer}>
                                    <Icon name="image-outline" size={50} color="#ccc" />
                                    <Text style={styles.noImageText}>No images available</Text>
                                </View>
                            )}
                        </View>


                        <View style={styles.whySection}>
                            <Text style={styles.whyTitle}>WHY OUR <Text style={styles.whyTitleGold}>VETERANS' LOUNGE</Text></Text>
                            <View style={styles.featuresGrid}>
                                <View style={styles.featureRow}>
                                    <View style={styles.featureBox}><Icon name="medal-outline" size={36} color="#A3834C" /><Text style={styles.featureText}>Senior{'\n'}Exclusive</Text></View>
                                    <View style={styles.featureBox}><Icon name="snow-outline" size={36} color="#A3834C" /><Text style={styles.featureText}>Air Conditioned</Text></View>
                                    <View style={styles.featureBox}><Icon name="heart-outline" size={36} color="#A3834C" /><Text style={styles.featureText}>Comfortable</Text></View>
                                </View>
                                <View style={styles.featureRow}>
                                    <View style={styles.featureBox}><Icon name="chatbubble-ellipses-outline" size={36} color="#A3834C" /><Text style={styles.featureText}>Social Space</Text></View>
                                    <View style={styles.featureBox}><Icon name="restaurant-outline" size={36} color="#A3834C" /><Text style={styles.featureText}>Meal Service</Text></View>
                                    <View style={styles.featureBox}><Icon name="newspaper-outline" size={36} color="#A3834C" /><Text style={styles.featureText}>Newspapers</Text></View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.descriptionSection}>
                            <Text style={styles.descriptionTitle}>About Veterans' Lounge</Text>
                            <Text style={styles.descriptionText}>
                                A designated lounge for our senior club members where they can socialize,
                                enjoy meals, and pass a joyful day in comfort.
                            </Text>
                            <View style={styles.specialBadge}>
                                <Icon name="medal-outline" size={20} color="#A3834C" />
                                <Text style={styles.specialText}>Exclusive for Senior Members</Text>
                            </View>
                        </View>

                        {/* <View style={styles.contactSection}>
                            <Icon name="call-outline" size={24} color="#A3834C" />
                            <Text style={styles.contactText}>For inquiries: 0341-9777711</Text>
                        </View> */}

                        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                            <Text style={styles.bookButtonText}>Book Now</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' },
    notch: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomEndRadius: 30, borderBottomStartRadius: 30, overflow: 'hidden', minHeight: 120 },
    notchImage: { resizeMode: 'cover' },
    notchContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerText: { fontSize: 20, fontWeight: 'bold', color: '#000', textAlign: 'center', flex: 1 },
    notificationButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingVertical: 20, paddingHorizontal: 20, paddingBottom: 40 },
    sliderContainer: { height: 250, width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    sliderImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    noImageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    noImageText: { marginTop: 10, color: '#999', fontSize: 14 },
    descriptionSection: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 5 },
    descriptionTitle: { fontSize: 18, fontWeight: 'bold', color: '#A3834C', marginBottom: 10 },
    descriptionText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 15 },
    specialBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9F3', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
    specialText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#A3834C' },
    whySection: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, marginBottom: 20, elevation: 5 },
    whyTitle: { fontSize: 16, fontWeight: '600', color: '#000', textAlign: 'center', marginBottom: 25 },
    whyTitleGold: { color: '#A3834C', fontWeight: 'bold' },
    featuresGrid: { width: '100%' },
    featureRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    featureBox: { width: '31%', aspectRatio: 1, borderWidth: 2, borderColor: '#A3834C', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 10 },
    featureText: { fontSize: 11, color: '#000', textAlign: 'center', fontWeight: '500', marginTop: 8 },
    contactSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 5 },
    contactText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: '#333' },
    bookButton: { backgroundColor: '#A3834C', paddingVertical: 18, borderRadius: 10, alignItems: 'center' },
    bookButtonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
});

export default VeteransLoungeDetailsScreen;
