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
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { lawnAPI } from '../../config/apis';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

// Lawn Features - matching home.js style
const features = [
  { icon: "theater", label: "Elegant Stage" },
  { icon: "floor-plan", label: "Weather Flooring" },
  { icon: "tent", label: "Covered Canopy" },
  { icon: "flash", label: "Power Points" },
  { icon: "engine", label: "Generator" },
  { icon: "door", label: "VIP Entrance" },
  { icon: "party-popper", label: "Lighting" },
  { icon: "music", label: "DJ Console" },
  { icon: "flower", label: "Décor" },
  { icon: "silverware-fork-knife", label: "Catering" },
  { icon: "grill", label: "BBQ Station" },
  { icon: "glass-cocktail", label: "Mocktail Bar" },
];

const Lawn = ({ navigation }) => {
  const [lawnCategories, setLawnCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ message: null, status: null });
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const fetchLawnCategories = async () => {
    try {
      console.log('🔄 Loading lawn categories...');
      setError({ message: null, status: null });
      setLoading(true);

      if (!lawnAPI || !lawnAPI.getLawnCategories) {
        const errorMsg = 'API configuration error - lawnAPI not found';
        console.error('❌', errorMsg);
        setError({
          message: errorMsg,
          status: null
        });
        setLoading(false);
        return;
      }

      console.log('📞 Fetching lawn categories data...');
      const categoriesResponse = await lawnAPI.getLawnCategories();

      console.log('✅ Response received:', {
        status: categoriesResponse?.status,
        dataLength: categoriesResponse?.data?.length
      });

      if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
        console.log(`🌿 Found ${categoriesResponse.data.length} lawn categories`);

        const transformedCategories = categoriesResponse.data.map((category, index) => {
          const sampleLawn = category.lawns && category.lawns.length > 0
            ? category.lawns[0]
            : null;

          return {
            id: category.id || index,
            name: category.category || 'Unnamed Category',
            images: category.images || [],
            description: `${category.lawns?.length || 0} lawns available`,
            lawnCount: category.lawns?.length || 0,
            priceMember: sampleLawn ? `Rs. ${sampleLawn.memberCharges?.toLocaleString()}` : null,
            priceGuest: sampleLawn ? `Rs. ${sampleLawn.guestCharges?.toLocaleString()}` : null,
            isActive: true,
            type: 'lawnCategory',
            rawData: category,
          };
        });

        setLawnCategories(transformedCategories);
        console.log('✅ Lawn categories loaded successfully');
      } else {
        console.warn('⚠️ No lawn categories found in response:', categoriesResponse);
        setLawnCategories([]);
      }

    } catch (err) {
      console.error('❌ Error loading lawn categories:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      let errorMessage = 'Failed to load lawn categories';
      let errorStatus = err.response?.status;

      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your authentication or contact administrator.';
        errorStatus = 403;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to access lawns';
        errorStatus = 401;
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error - Please check your internet connection';
        errorStatus = 'NETWORK_ERROR';
      } else if (err.response?.status === 404) {
        errorMessage = 'Lawns endpoint not found - Please contact support';
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

  const handleCategoryPress = (category, index) => {
    setActiveCategory(index);

    // Check if category has lawn data
    const lawns = category.rawData?.lawns;

    // If category has exactly one lawn, go directly to LawnBooking
    if (lawns && lawns.length === 1) {
      const lawn = lawns[0];
      console.log('📍 Single lawn found, navigating directly to LawnBooking:', lawn);

      navigation.navigate('LawnBooking', {
        venue: {
          id: lawn.id,
          description: lawn.description || lawn.name || category.name,
          memberCharges: lawn.memberCharges,
          guestCharges: lawn.guestCharges,
          minGuests: lawn.minGuests || 0,
          maxGuests: lawn.maxGuests || 500,
          category: category.rawData.category,
        },
        categoryId: category.rawData.id,
      });
    } else {
      // Multiple lawns or no lawns - show lawn list
      console.log(`📋 ${lawns?.length || 0} lawns found, navigating to LawnListScreen`);
      navigation.navigate('LawnListScreen', {
        categoryId: category.rawData.id,
        categoryName: category.rawData.category,
      });
    }
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying to fetch lawn categories...');
    setLoading(true);
    setError({ message: null, status: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    fetchLawnCategories();
  };

  const onRefresh = () => {
    console.log('🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    setError({ message: null, status: null });
    fetchLawnCategories();
  };

  useEffect(() => {
    fetchLawnCategories();
  }, []);

  // Render lawn card - matching home.js roomCard style
  const renderLawnCard = (category, index) => {
    const hasImages = category.images && category.images.length > 0;
    const firstImage = hasImages ? category.images[0] : null;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.lawnCard,
          index === activeCategory && styles.lawnCardActive,
        ]}
        onPress={() => handleCategoryPress(category, index)}
      >
        {/* Lawn Image */}
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage.url }}
              style={styles.lawnImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Icon name="grass" size={40} color="#ccc" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
        </View>

        {/* Lawn Info */}
        <View style={styles.lawnInfo}>
          <Text style={styles.lawnName} numberOfLines={1}>
            {category.name}
          </Text>

          <Text style={styles.lawnDescription}>{category.description}</Text>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            {category.priceMember && (
              <View style={styles.priceRow}>
                <Icon name="account" size={14} color="#2E7D32" />
                <Text style={styles.memberPrice}>
                  {category.priceMember}
                </Text>
                <Text style={styles.priceLabel}>Member</Text>
              </View>
            )}

            {category.priceGuest && (
              <View style={styles.priceRow}>
                <Icon name="account-outline" size={14} color="#666" />
                <Text style={styles.guestPrice}>
                  {category.priceGuest}
                </Text>
                <Text style={styles.priceLabel}>Guest</Text>
              </View>
            )}
          </View>

          {/* View Details Button */}
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Lawns</Text>
            <Icon name="chevron-right" size={16} color="#2E7D32" />
          </View>
        </View>

        {/* Active Indicator */}
        {index === activeCategory && (
          <View style={styles.activeIndicator}>
            <Icon name="check-circle" size={20} color="#2E7D32" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render lawn categories
  const renderLawnCategories = () => {
    if (loading && lawnCategories.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading lawn types...</Text>
        </View>
      );
    }

    if (error.message && lawnCategories.length === 0) {
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

    if (lawnCategories.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name="grass" size={50} color="#999" />
          <Text style={styles.noDataText}>No lawn categories available</Text>
          <Text style={styles.noDataSubtext}>
            Lawn categories will appear here once added
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
          <Text style={styles.sectionTitle}>Available Lawn Categories</Text>
          <Text style={styles.sectionSubtitle}>
            {lawnCategories.length} categor{lawnCategories.length !== 1 ? 'ies' : 'y'} available
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.lawnTypesScroll}
          contentContainerStyle={styles.lawnTypesContainer}
        >
          {lawnCategories.map((category, index) => renderLawnCard(category, index))}
        </ScrollView>
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreenContainer}>
        <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
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
            <Text style={styles.headerText}>Lawns</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading Lawns...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
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
            <Text style={styles.headerText}>Lawns</Text>
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
                colors={['#2E7D32']}
                tintColor="#2E7D32"
              />
            }
          >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Host Your Perfect Event</Text>
              <Text style={styles.welcomeText}>
                Our beautifully maintained lawns are perfect for weddings, birthdays,
                corporate events, and family celebrations. Choose from our premium venues.
              </Text>
            </View>

            {/* Lawn Categories */}
            {renderLawnCategories()}

            {/* Features Section - matching home.js style */}
            <View style={styles.featuresSection}>
              <Text style={styles.featureTitle}>WHY OUR LAWNS</Text>
              <Text style={styles.featureSubtitle}>
                Premium amenities for unforgettable events
              </Text>
              <View style={styles.featuresGrid}>
                {features.map((item, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconBox}>
                      <Icon name={item.icon} size={32} color="#2E7D32" />
                    </View>
                    <Text style={styles.featureText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Policy Section */}
            <View style={styles.policySection}>
              <Text style={styles.policyTitle}>Lawn Booking Policy</Text>

              <Text style={styles.policySub}>Timings</Text>
              <Text style={styles.bullet}>• Morning Slot: 8:00 AM - 2:00 PM</Text>
              <Text style={styles.bullet}>• Evening Slot: 2:00 PM - 8:00 PM</Text>
              <Text style={styles.bullet}>• Night Slot: 8:00 PM - 12:00 AM</Text>

              <Text style={styles.policySub}>Booking Guidelines</Text>
              <Text style={styles.bullet}>• Advance booking required (min 7 days)</Text>
              <Text style={styles.bullet}>• 50% deposit at time of booking</Text>
              <Text style={styles.bullet}>• Full payment 3 days before event</Text>
              <Text style={styles.bullet}>• Cancellation charges may apply</Text>

              <Text style={styles.policySub}>What's Included</Text>
              <Text style={styles.bullet}>• Basic setup and cleanup</Text>
              <Text style={styles.bullet}>• Electricity and lighting</Text>
              <Text style={styles.bullet}>• Backup generator</Text>
              <Text style={styles.bullet}>• Parking for guests</Text>

              <Text style={styles.policySub}>Important Notes</Text>
              <Text style={styles.bullet}>• Outside caterers subject to approval</Text>
              <Text style={styles.bullet}>• Music to end by designated time</Text>
              <Text style={styles.bullet}>• Responsible for any damages</Text>
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
    backgroundColor: "#e8f5e9",
    margin: 15,
    borderRadius: 15,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: '#2E7D32',
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
  // Lawn Types Scroll
  lawnTypesScroll: {
    marginBottom: 20,
  },
  lawnTypesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  // Lawn Card - matching home.js roomCard style
  lawnCard: {
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
  lawnCardActive: {
    borderColor: '#2E7D32',
    borderWidth: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  lawnImage: {
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
  lawnInfo: {
    padding: 15,
  },
  lawnName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lawnDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
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
    color: '#2E7D32',
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
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  viewDetailsText: {
    color: '#2E7D32',
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Features Section - matching home.js style
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
    borderColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
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
    backgroundColor: "#f1f8e9",
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
    color: '#2E7D32',
  },
  policySub: {
    fontWeight: "bold",
    color: "#2E7D32",
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

export default Lawn;