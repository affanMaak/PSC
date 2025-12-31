// screens/Start.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { useAuth } from '../src/auth/contexts/AuthContext';
import { getUserData, removeAuthData, memberAPI, getAds } from '../config/apis';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function start({ navigation }) {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName] = useState('');
  const [promotionalAds, setPromotionalAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(true);
  const isDeactivatedRef = useRef(false);

  useEffect(() => {
    if (user?.name) setUserName(user.name);
    else loadUserData();

    // Fetch promotional ads
    loadPromotionalAds();
  }, [user]);

  // Check member status on mount - only for MEMBER role
  useEffect(() => {
    const checkMemberStatus = async () => {
      try {
        // Only check status for MEMBER role, not for ADMIN or SUPER_ADMIN
        if (user?.role && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
          console.log('👤 Admin user, skipping status check');
          return;
        }

        // Get membership number from user or storage
        let membershipNo = user?.membershipNo || user?.memberId || user?.id;

        if (!membershipNo) {
          console.log('⚠️ No membership number found, loading from storage');
          const userData = await getUserData();
          membershipNo = userData?.membershipNo || userData?.memberId || userData?.id;
        }

        if (!membershipNo) {
          console.log('⚠️ Still no membership number found');
          return;
        }

        console.log('🔍 Checking status for member:', membershipNo);
        const statusResponse = await memberAPI.checkMemberStatus(membershipNo);

        console.log('📊 Status response:', statusResponse);

        // If status is not ACTIVE, show non-cancelable alert
        if (!statusResponse.isActive || statusResponse.status !== 'ACTIVE') {
          isDeactivatedRef.current = true;
          showDeactivatedAlert(statusResponse.status, statusResponse.message);
        }
      } catch (error) {
        console.error('❌ Error checking member status:', error);
        // If we get a 403 or the error indicates deactivation, show alert
        if (error.response?.status === 403) {
          isDeactivatedRef.current = true;
          const message = error.response?.data?.message || 'Your account has been deactivated. Please contact support.';
          showDeactivatedAlert('DEACTIVATED', message);
        }
      }
    };

    // Only check if not loading and user exists
    if (!loading && user) {
      checkMemberStatus();
    }
  }, [user, loading]);

  // Prevent back button when deactivated
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDeactivatedRef.current) {
        // Don't allow back button when deactivated
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, []);

  // Show non-cancelable alert for deactivated members
  const showDeactivatedAlert = (status, message) => {
    const title = status === 'BLOCKED' ? 'Account Blocked' : 'Account Deactivated';

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAuthData();
              isDeactivatedRef.current = false;
              navigation.replace('LoginScr');
            } catch (err) {
              console.error('Force logout error:', err);
              navigation.replace('LoginScr');
            }
          },
        },
      ],
      { cancelable: false } // This makes the alert non-cancelable
    );
  };

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (data?.name) setUserName(data.name);
    } catch (err) {
      console.error('❌ Error loading user data:', err);
    }
  };

  const loadPromotionalAds = async () => {
    try {
      setAdsLoading(true);
      const ads = await getAds();

      // Filter only active ads
      const activeAds = ads.filter(ad => ad.isActive === true);
      setPromotionalAds(activeAds);
      console.log('✅ Loaded', activeAds.length, 'promotional ads');
    } catch (err) {
      console.error('❌ Error loading promotional ads:', err);
      // Use fallback images on error
      setPromotionalAds([]);
    } finally {
      setAdsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAuthData();
            navigation.replace('LoginScr');
          } catch (err) {
            console.error('Logout error:', err);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const facilities = [
    {
      id: 1,
      name: 'Sports',
      image: require('../assets/sports.png'),
      icon: 'sports-soccer',
      iconType: 'material',
      onPress: () => navigation.navigate('SportsScreen'),
    },
    {
      id: 2,
      name: 'Messing',
      image: require('../assets/messing.png'),
      icon: 'restaurant',
      iconType: 'material',
      onPress: () => navigation.navigate('Messing'),
    },
    {
      id: 3,
      name: 'GuestRooms',
      image: require('../assets/GR.png'),
      icon: 'hotel',
      iconType: 'material',
      onPress: () => navigation.navigate('home'),
    },
    // {
    //   id: 4,
    //   name: 'Conference Room',
    //   image: require('../assets/confrence_room.jpg'),
    //   icon: 'meeting-room',
    //   iconType: 'material',
    //   onPress: () => navigation.navigate('ConferenceRoomDetails'),
    // },
    {
      id: 5,
      name: 'Halls',
      image: require('../assets/psc_home.jpeg'),
      icon: 'party-popper',
      iconType: 'material-community',
      onPress: () => navigation.navigate('BH'),
    },
    {
      id: 6,
      name: 'PhotoShoots',
      image: require('../assets/bg.jpeg'),
      icon: 'camera-alt',
      iconType: 'material',
      onPress: () => navigation.navigate('shoots'),
    },
    {
      id: 7,
      name: 'Events',
      image: require('../assets/events.jpg'),
      icon: 'event',
      iconType: 'material',
      onPress: () => navigation.navigate('events'),
    },
    {
      id: 8,
      name: 'Bill Payments',
      image: require('../assets/bill.jpg'),
      icon: 'payment',
      iconType: 'material',
      onPress: () => navigation.navigate('BillPaymentScreen'),
    },
    {
      id: 9,
      name: 'Lawns',
      image: require('../assets/bg.jpeg'),
      icon: 'grass',
      iconType: 'material',
      onPress: () => navigation.navigate('Lawn'),
    },
    {
      id: 10,
      name: 'Send Notification',
      icon: 'notifications-active',
      iconType: 'material',
      color: '#A3834C',
      onPress: () => {
        // Replace 'ADMIN' with whatever role you see in the alert
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
          navigation.navigate('SendNotifications');
        } else {
          Alert.alert('Access Denied', 'Only admins can send notifications');
        }
      },
    },
  ];

  const renderIcon = (facility) => {
    const iconProps = {
      size: 50,
      color: facility.color || '#333',
    };

    switch (facility.iconType) {
      case 'material':
        return <Icon name={facility.icon} {...iconProps} />;
      case 'material-community':
        return <MaterialCommunityIcons name={facility.icon} {...iconProps} />;
      case 'fontawesome':
        return <FontAwesome name={facility.icon} {...iconProps} />;
      default:
        return <Icon name={facility.icon} {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/bg.jpeg')}
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>

        {/* ==================== FIXED SECTION ==================== */}
        <View style={styles.fixedSection}>

          {/* 🔹 Notch Header */}
          <ImageBackground
            source={require('../assets/notch.jpg')}
            style={styles.notch}
            imageStyle={styles.notchImage}
          >
            {/* Drawer Button - Left */}
            <TouchableOpacity
              style={styles.drawerButton}
              onPress={() => {
                // Open drawer if available, otherwise navigate to Home drawer
                if (navigation.openDrawer) {
                  navigation.openDrawer();
                } else {
                  navigation.navigate('Home');
                }
              }}
            >
              <Icon name="menu" size={26} color="#000" />
            </TouchableOpacity>

            {/* Title - Center */}
            <Text style={styles.headerTitle}>Peshawar Services Club</Text>

            {/* Bell Icon - Right */}
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => navigation.navigate('Announcements')}
            >
              <Icon name="notifications" size={24} color="#000" />
            </TouchableOpacity>

            {/* Welcome Text */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.usertext}>
                {userName
                  ? `Welcome: ${userName}`
                  : 'Welcome user:'}
              </Text>
              {/* Role Display with Icon */}
              <View style={styles.roleContainer}>
                <MaterialCommunityIcons
                  name={
                    user?.role === 'SUPER_ADMIN' ? 'crown' :
                      user?.role === 'ADMIN' ? 'shield-account' : 'account'
                  }
                  size={14}
                  color="#A3834C"
                />
                <Text style={styles.roleText}>
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                    user?.role === 'ADMIN' ? 'Admin' : 'Member'}
                </Text>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <MaterialCommunityIcons name="shield-check" size={12} color="#4CAF50" style={styles.adminBadge} />
                )}
              </View>
            </View>
          </ImageBackground>

          {/* 🔹 Image Slider */}
          <View style={styles.sliderContainer}>
            {adsLoading ? (
              <View style={styles.loadingAdsContainer}>
                <ActivityIndicator size="large" color="#A3834C" />
                <Text style={styles.loadingAdsText}>Loading promotions...</Text>
              </View>
            ) : (
              <Swiper
                autoplay
                autoplayTimeout={4}
                loop
                showsPagination
                activeDotColor="#A3834C"
                paginationStyle={styles.paginationStyle}
              >
                {promotionalAds.length > 0 ? (
                  promotionalAds.map((ad, index) => (
                    <View key={ad.id || index} style={styles.slideContainer}>
                      <Image
                        source={{ uri: ad.image }}
                        style={styles.sliderImage}
                        resizeMode="cover"
                        onError={() => console.error(`Failed to load image for ad: ${ad.title}`)}
                      />
                      {/* Optional: Show ad title/description overlay */}
                      {(ad.title || ad.description) && (
                        <View style={styles.adOverlay}>
                          {ad.title && (
                            <Text style={styles.adTitle}>{ad.title}</Text>
                          )}
                          {ad.description && (
                            <Text style={styles.adDescription}>{ad.description}</Text>
                          )}
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  // Fallback to default images if no ads
                  <>
                    <Image
                      source={require('../assets/psc_home.jpeg')}
                      style={styles.sliderImage}
                      resizeMode="cover"
                    />
                    <Image
                      source={require('../assets/psc2.jpeg')}
                      style={styles.sliderImage}
                      resizeMode="cover"
                    />
                    <Image
                      source={require('../assets/psc3.jpeg')}
                      style={styles.sliderImage}
                      resizeMode="cover"
                    />
                  </>
                )}
              </Swiper>
            )}
          </View>

          {/* 🔹 Facilities Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.line} />
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.line} />
          </View>

        </View>

        {/* ==================== SCROLLABLE SECTION ==================== */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 🔹 Facilities Grid */}
          <View style={styles.facilitiesGrid}>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={
                  facility.id === 10 && !(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN')
                    ? styles.hidden
                    : styles.facilityCard
                }
                onPress={
                  facility.onPress
                    ? facility.onPress
                    : () => Alert.alert('Facility', `${facility.name} - Coming Soon!`)
                }
              >
                {facility.image ? (
                  <Image source={facility.image} style={styles.facilityImage} />
                ) : (
                  <View
                    style={[
                      styles.facilityImageIcon,
                      { backgroundColor: facility.color || '#f8f8f8' },
                    ]}
                  >
                    {renderIcon(facility)}
                  </View>
                )}
                <Text style={styles.facilityName}>{facility.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  hidden: {
    display: "none"
  },

  /* ==================== LOADING ==================== */
  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },

  /* ==================== FIXED SECTION ==================== */
  fixedSection: {
    backgroundColor: 'white',
  },

  notch: {
    paddingTop: 110,
    paddingBottom: 40,
    borderBottomEndRadius: 40,
    borderBottomStartRadius: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  notchImage: {
    resizeMode: 'cover',
  },
  drawerButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  bellButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  headerTitle: {
    position: 'absolute',
    top: 53,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    zIndex: 5,
    lineHeight: 26,
  },
  usertext: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  roleText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  adminBadge: {
    marginLeft: 4,
  },
  welcomeContainer: {
    position: 'absolute',
    marginTop: 10,
    top: 85,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  sliderContainer: {
    height: 200,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingAdsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
  },
  loadingAdsText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  slideContainer: {
    flex: 1,
    position: 'relative',
  },
  paginationStyle: {
    bottom: 10,
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  adTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3834C',
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },

  /* ==================== SCROLLABLE SECTION ==================== */
  scrollContent: {
    paddingBottom: 30,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  facilityCard: {
    width: '45%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  facilityImageIcon: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 8,
  },

  /* ==================== BOTTOM NAV ==================== */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8D4B8',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  navButton: {
    padding: 10,
  },
  activeNavButton: {
    backgroundColor: '#b48a64',
    borderRadius: 12,
  },
});