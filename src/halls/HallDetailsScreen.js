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

const HallDetailsScreen = ({ navigation, route }) => {
  const {
    item,
    name,
    description,
    capacity,
    memberPrice,
    guestPrice,
    isActive
  } = route.params || {};

  // Get images from the item data
  const images = item?.images || [];
  const hasImages = images.length > 0;

  const handleBookNow = () => {
    navigation.navigate('BHBooking', {
      venue: item,
      venueType: 'hall',
      selectedMenu: null
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf2" />
      <View style={styles.container}>

        {/* Notch Header */}
        <ImageBackground
          source={require('../../assets/notch.jpg')}
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
            <Text style={styles.headerText}>{name || 'Hall Details'}</Text>
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

            {/* Image Slider */}
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

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>About {name}</Text>
              <Text style={styles.descriptionText}>
                {description || 'No description available for this hall.'}
              </Text>

              <View style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <Icon name="people" size={20} color="#A3834C" />
                  <Text style={styles.infoText}>Capacity: {capacity || 'N/A'} Persons</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isActive ? '#e8f5e9' : '#ffebee' }]}>
                  <View style={[styles.statusDot, { backgroundColor: isActive ? '#4caf50' : '#f44336' }]} />
                  <Text style={[styles.statusText, { color: isActive ? '#2e7d32' : '#c62828' }]}>
                    {isActive ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Pricing Section */}
            <View style={styles.pricingSection}>
              <Text style={styles.pricingTitle}>Booking Charges</Text>
              <View style={styles.priceContainer}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Member Price</Text>
                  <Text style={styles.priceValue}>Rs. {memberPrice?.toLocaleString() || 'N/A'}</Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Guest Price</Text>
                  <Text style={styles.priceValue}>Rs. {guestPrice?.toLocaleString() || 'N/A'}</Text>
                </View>
              </View>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>AMENITIES</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <Icon name="snow-outline" size={30} color="#A3834C" />
                  <Text style={styles.featureText}>AC</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="wifi-outline" size={30} color="#A3834C" />
                  <Text style={styles.featureText}>WiFi</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="car-outline" size={30} color="#A3834C" />
                  <Text style={styles.featureText}>Parking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="cafe-outline" size={30} color="#A3834C" />
                  <Text style={styles.featureText}>Catering</Text>
                </View>
              </View>
            </View>

            {/* Book Now Button */}
            <TouchableOpacity
              style={[styles.bookButton, !isActive && styles.disabledButton]}
              onPress={handleBookNow}
              activeOpacity={0.8}
              disabled={!isActive}
            >
              <Text style={styles.bookButtonText}>
                {isActive ? 'Book Now' : 'Currently Unavailable'}
              </Text>
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
    backgroundColor: '#eee',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#A3834C',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  pricingSection: {
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
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A3834C',
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  featuresSection: {
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
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    width: '22%',
  },
  featureText: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#A3834C',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default HallDetailsScreen;
