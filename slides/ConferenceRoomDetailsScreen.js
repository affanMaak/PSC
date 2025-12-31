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

const ConferenceRoomScreen = ({ navigation, route }) => {
  const { venue, venueType } = route.params || {};

  const handleBookNow = () => {
    navigation.navigate('BHBooking', {
      venue: venue,
      venueType: venueType || 'hall',
      selectedMenu: null
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* 🔹 Notch Header */}
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
            <Text style={styles.headerText}>Conference Room</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Icon name="notifications-outline" size={26} color="#000" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* 🔹 Main Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            {/* 🔹 Image Slider */}
            <View style={styles.sliderContainer}>
              <Swiper
                autoplay
                autoplayTimeout={4}
                loop
                showsPagination
                activeDotColor="#A3834C"
                dotColor="rgba(255,255,255,0.5)"
              >
                <Image source={require('../assets/confrence_room.jpg')} style={styles.sliderImage} />
                <Image source={require('../assets/confrence_room.jpg')} style={styles.sliderImage} />
                <Image source={require('../assets/confrence_room.jpg')} style={styles.sliderImage} />
              </Swiper>
            </View>

            {/* 🔹 Why Our Conference Room Section */}
            <View style={styles.whySection}>
              <Text style={styles.whyTitle}>
                WHY OUR <Text style={styles.whyTitleGold}>CONFERENCE ROOM</Text>
              </Text>

              {/* 🔹 Features Grid */}
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
                    <Icon name="wifi-outline" size={36} color="#A3834C" />
                    <Text style={styles.featureText}>WiFi</Text>
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.featureRow}>
                  <View style={styles.featureBox}>
                    <Icon name="car-outline" size={36} color="#A3834C" />
                    <Text style={styles.featureText}>Parking</Text>
                  </View>
                  <View style={styles.featureBox}>
                    <Icon name="restaurant-outline" size={36} color="#A3834C" />
                    <Text style={styles.featureText}>Refreshments{'\n'}Available</Text>
                  </View>
                  <View style={styles.featureBox}>
                    <Icon name="desktop-outline" size={36} color="#A3834C" />
                    <Text style={styles.featureText}>Multimedia{'\n'}Available</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 🔹 Book Now Button */}
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
    fontSize: 22,
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
    marginBottom: 30,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  whySection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  whyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
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
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: '#A3834C',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    // marginTop: 4,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default ConferenceRoomScreen;