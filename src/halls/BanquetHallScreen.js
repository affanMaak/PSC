import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { banquetAPI } from '../../config/apis';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

// Hall Features - matching lawn.js style
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
  { icon: "engine", label: "Backup Power" },
  { icon: "door", label: "VIP Entrance" },
  { icon: "glass-cocktail", label: "Refreshments" },
];

const BH = ({ navigation }) => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ message: null, status: null });
  const [refreshing, setRefreshing] = useState(false);
  const [activeHall, setActiveHall] = useState(0);

  const fetchHallsData = async () => {
    try {
      console.log('🔄 Loading banquet halls...');
      setError({ message: null, status: null });
      setLoading(true);

      if (!banquetAPI || !banquetAPI.getAllHalls) {
        const errorMsg = 'API configuration error - banquetAPI not found';
        console.error('❌', errorMsg);
        setError({
          message: errorMsg,
          status: null
        });
        setLoading(false);
        return;
      }

      console.log('📞 Fetching halls data...');
      const hallsResponse = await banquetAPI.getAllHalls();

      console.log('✅ Response received:', {
        status: hallsResponse?.status,
        dataLength: hallsResponse?.data?.length
      });

      if (hallsResponse?.data && Array.isArray(hallsResponse.data)) {
        console.log(`🏛️ Found ${hallsResponse.data.length} halls`);

        const transformedHalls = hallsResponse.data.map((hall, index) => {
          return {
            id: hall.id || index,
            name: hall.name || 'Unnamed Hall',
            images: hall.images || [],
            description: hall.description || 'No description available',
            capacity: hall.capacity || 0,
            priceMember: hall.chargesMembers ? `Rs. ${hall.chargesMembers?.toLocaleString()}` : null,
            priceGuest: hall.chargesGuests ? `Rs. ${hall.chargesGuests?.toLocaleString()}` : null,
            isActive: hall.isActive !== undefined ? hall.isActive : true,
            type: 'hall',
            rawData: hall,
          };
        });

        setHalls(transformedHalls);
        console.log('✅ Halls loaded successfully');
      } else {
        console.warn('⚠️ No halls data found in response:', hallsResponse);
        setHalls([]);
      }

    } catch (err) {
      console.error('❌ Error loading halls:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = 'Failed to load banquet halls';
      let errorStatus = err.response?.status;

      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your authentication or contact administrator.';
        errorStatus = 403;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to access banquet halls';
        errorStatus = 401;
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error - Please check your internet connection';
        errorStatus = 'NETWORK_ERROR';
      } else if (err.response?.status === 404) {
        errorMessage = 'Halls endpoint not found - Please contact support';
        errorStatus = 404;
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error - Please try again later';
        errorStatus = 500;
      }

      setError({
        message: errorMessage,
        status: errorStatus
      });

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleHallPress = (hall, index) => {
    setActiveHall(index);
    console.log('🏛️ Hall clicked:', hall.name);

    // Navigate to BanquetHallDetailsScreen for all halls as requested
    console.log('✅ Navigating to BanquetHallDetailsScreen');
    navigation.navigate('BanquetHallDetailsScreen', {
      venue: hall.rawData,
      venueType: 'hall'
    });
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying to fetch halls...');
    setLoading(true);
    setError({ message: null, status: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    fetchHallsData();
  };

  const onRefresh = () => {
    console.log('🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    setError({ message: null, status: null });
    fetchHallsData();
  };

  useEffect(() => {
    fetchHallsData();
  }, []);

  // Render hall card - matching lawn.js lawnCard style
  const renderHallCard = (hall, index) => {
    const hasImages = hall.images && hall.images.length > 0;
    const firstImage = hasImages ? hall.images[0] : null;

    return (
      <TouchableOpacity
        key={hall.id}
        style={[
          styles.hallCard,
          index === activeHall && styles.hallCardActive,
        ]}
        onPress={() => handleHallPress(hall, index)}
      >
        {/* Hall Image */}
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage.url }}
              style={styles.hallImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Icon name="office-building" size={40} color="#ccc" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
        </View>

        {/* Hall Info */}
        <View style={styles.hallInfo}>
          <Text style={styles.hallName} numberOfLines={1}>
            {hall.name}
          </Text>

          <Text style={styles.hallDescription} numberOfLines={2}>
            {hall.description}
          </Text>

          {/* Capacity */}
          <View style={styles.capacityRow}>
            <Icon name="account-group" size={16} color="#8B4513" />
            <Text style={styles.capacityText}>Capacity: {hall.capacity} guests</Text>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            {/* {hall.priceMember && (
              <View style={styles.priceRow}>
                <Icon name="account" size={14} color="#8B4513" />
                <Text style={styles.memberPrice}>
                  {hall.priceMember}
                </Text>
                <Text style={styles.priceLabel}>Member</Text>
              </View>
            )} */}

            {hall.priceGuest && (
              <View style={styles.priceRow}>
                <Icon name="account-outline" size={14} color="#8B4513" />
                <Text style={styles.memberPrice}>
                  {hall.priceGuest}
                </Text>
                <Text style={styles.priceLabel}>Guest</Text>
              </View>
            )}
          </View>

          {/* View Details Button */}
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#8B4513" />
          </View>
        </View>

        {/* Active Indicator */}
        {index === activeHall && (
          <View style={styles.activeIndicator}>
            <Icon name="check-circle" size={20} color="#8B4513" />
          </View>
        )}

        {/* Availability Badge */}
        {hall.isActive !== undefined && (
          <View style={[
            styles.availabilityBadge,
            hall.isActive ? styles.availableBadge : styles.unavailableBadge
          ]}>
            <Text style={styles.availabilityText}>
              {hall.isActive ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render halls section
  const renderHalls = () => {
    if (loading && halls.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading halls...</Text>
        </View>
      );
    }

    if (error.message && halls.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (halls.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name="office-building" size={50} color="#999" />
          <Text style={styles.noDataText}>No halls available</Text>
          <Text style={styles.noDataSubtext}>
            Halls will appear here once added
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Halls</Text>
          <Text style={styles.sectionSubtitle}>
            {halls.length} hall{halls.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hallsScroll}
          contentContainerStyle={styles.hallsContainer}
        >
          {halls.map((hall, index) => renderHallCard(hall, index))}
        </ScrollView>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreenContainer}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Halls</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading  Halls...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Halls</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#8B4513']}
                tintColor="#8B4513"
              />
            }
          >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Host Your Grand Celebration</Text>
              <Text style={styles.welcomeText}>
                Our elegant banquet halls provide the perfect setting for weddings,
                corporate events, conferences, and special celebrations. Experience
                luxury and sophistication.
              </Text>
            </View>

            {/* Halls Section */}
            {renderHalls()}

            {/* Features Section - matching lawn.js style */}
            <View style={styles.featuresSection}>
              <Text style={styles.featureTitle}>WHY OUR BANQUET HALLS</Text>
              <Text style={styles.featureSubtitle}>
                Premium amenities for unforgettable events
              </Text>
              <View style={styles.featuresGrid}>
                {features.map((item, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconBox}>
                      <Icon name={item.icon} size={32} color="#8B4513" />
                    </View>
                    <Text style={styles.featureText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Policy Section */}
            <View style={styles.policySection}>
              <Text style={styles.policyTitle}>Hall Booking Policy</Text>

              <Text style={styles.policySub}>Timings</Text>
              <Text style={styles.bullet}>• Lunch Event: 12:00 PM - 3:00 PM</Text>
              <Text style={styles.bullet}>• Dinner Event: 7:30 PM - 10:30 PM</Text>

              <Text style={styles.policySub}>Booking Guidelines</Text>
              <Text style={styles.bullet}>• Rs. 5000/- advance payment required</Text>
              <Text style={styles.bullet}>• Remaining amount 24 hours before event</Text>
              <Text style={styles.bullet}>• Membership (CNIC) card mandatory at entry</Text>
              <Text style={styles.bullet}>• Cancellation policy applies</Text>

              <Text style={styles.policySub}>Cancellation Schedule</Text>
              <Text style={styles.bullet}>• 7+ days before: Full refund</Text>
              <Text style={styles.bullet}>• 3-7 days before: 50% refund</Text>
              <Text style={styles.bullet}>• Less than 3 days: No refund</Text>

              <Text style={styles.policySub}>Important Notes</Text>
              <Text style={styles.bullet}>• Fireworks and firecrackers not allowed</Text>
              <Text style={styles.bullet}>• Firing is strictly prohibited</Text>
              <Text style={styles.bullet}>• Outside catering subject to approval</Text>
              <Text style={styles.bullet}>• Feedback book available at reception</Text>
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
    backgroundColor: '#fff',
  },
  loadingScreenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  // Header styles
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
  placeholder: {
    width: 40,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Welcome Section
  welcomeSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fdf5e6",
    margin: 15,
    borderRadius: 15,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: '#8B4513',
    textAlign: 'center',
  },
  welcomeText: {
    textAlign: "center",
    color: "#555",
    lineHeight: 20,
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Halls Scroll
  hallsScroll: {
    marginBottom: 20,
  },
  hallsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  // Hall Card - matching lawn.js lawnCard style
  hallCard: {
    width: screenWidth * 0.75,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  hallCardActive: {
    borderColor: '#8B4513',
    borderWidth: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  hallImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  hallInfo: {
    padding: 15,
  },
  hallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hallDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  capacityText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 6,
    fontWeight: '500',
  },
  pricingContainer: {
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 6,
    marginRight: 4,
  },
  guestPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
    marginRight: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf5e6',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#deb887',
  },
  viewDetailsText: {
    color: '#8B4513',
    fontWeight: '600',
    marginRight: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
  },
  availabilityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Loading and error states
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 30,
    margin: 15,
    backgroundColor: '#fff8f8',
    borderRadius: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    textAlign: 'center',
    color: '#d32f2f',
    marginBottom: 20,
    lineHeight: 18,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
    margin: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  noDataSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  // Button styles
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Features Section - matching lawn.js style
  featuresSection: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  featureSubtitle: {
    color: "#666",
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 25,
  },
  featureIconBox: {
    width: 70,
    height: 70,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#8B4513",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdf5e6",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 11,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
    fontWeight: "500",
  },
  // Policy Section
  policySection: {
    backgroundColor: "#fdf5e6",
    margin: 15,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: '#8B4513',
  },
  policySub: {
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 15,
    marginBottom: 5,
  },
  bullet: {
    color: "#444",
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
    lineHeight: 18,
  },
});

export default BH;