// import React from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   StatusBar,
//   ScrollView,
//   ImageBackground,
//   TouchableOpacity,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';

// const SportsScreen = ({ navigation }) => {
//   const sportsData = [
//     {
//       id: 1,
//       title: 'The Club Arena',
//       image: require('../assets/clubarena.jpeg'),
//       onPress: () => navigation.navigate('ClubArenaScreen'),
//     },
//     {
//       id: 2,
//       title: 'Aerobics + Gym',
//       image: require('../assets/gym.png'),
//       onPress: () => navigation.navigate('Aerobics_gym'),
//     },
//     {
//       id: 3,
//       title: 'Badminton',
//       image: require('../assets/badminton.jpeg'),
//       onPress: () => navigation.navigate('Badminton'),
//     },
//     {
//       id: 4,
//       title: 'Gym + Jogging Track',
//       image: require('../assets/track.png'),
//       onPress: () => navigation.navigate('Gym_jogging'),
//     },
//     {
//       id: 5,
//       title: 'Tennis Courts',
//       image: require('../assets/teniscourr.png'),
//       onPress: () => navigation.navigate('Tennis'),
//     },
//     {
//       id: 6,
//       title: 'Squash Courts',
//       image: require('../assets/squashcourt.jpg'),
//       onPress: () => navigation.navigate('Squash'),
//     },
//     {
//       id: 7,
//       title: 'Billiards',
//       image: require('../assets/8ballpool.jpg'),
//       onPress: () => navigation.navigate('Billiard'),
//     },
//   ];

//   return (
//     <>
//       <StatusBar barStyle="light-content" />
//       <View style={styles.container}>
//         {/* 🔹 Notch Header */}
//         <ImageBackground
//           source={require('../assets/notch.jpg')}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchContent}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.navigate('start')}
//               activeOpacity={0.7}
//             >
//               <Icon name="arrow-back" size={28} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>Sports</Text>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         {/* 🔹 Main Scrollable Content */}
//         <SafeAreaView style={styles.safeArea}>
//           <ScrollView
//             style={styles.scrollView}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* 🔹 Sports Cards */}
//             {sportsData.map((sport) => (
//               <TouchableOpacity
//                 key={sport.id}
//                 style={styles.sportCard}
//                 onPress={sport.onPress}
//               >
//                 <ImageBackground
//                   source={sport.image}
//                   style={styles.sportCardBackground}
//                   imageStyle={styles.sportCardImage}
//                 >
//                   <View style={styles.overlay} />
//                   <View style={styles.sportCardContent}>
//                     <Text style={styles.sportTitle}>{sport.title}</Text>
//                     <View style={styles.arrowContainer}>
//                       <Icon name="chevron-forward" size={28} color="#FFF" style={styles.arrowIcon} />
//                     </View>
//                   </View>
//                 </ImageBackground>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </SafeAreaView>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   notch: {
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomEndRadius: 30,
//     borderBottomStartRadius: 30,
//     overflow: 'hidden',
//     minHeight: 120,
//   },
//   notchImage: {
//     resizeMode: 'cover',
//   },
//   notchContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: -5,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//     marginLeft: -5,
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
//   },
//   placeholder: {
//     width: 40,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   sportCard: {
//     height: 120,
//     width: '100%',
//     marginBottom: 12,
//     borderRadius: 15,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   sportCardBackground: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//   },
//   sportCardImage: {
//     borderRadius: 15,
//     resizeMode: 'cover',
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//   },
//   sportCardContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     zIndex: 1,
//   },
//   sportTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#FFF',
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: { width: -1, height: 1 },
//     textShadowRadius: 6,
//   },
//   arrowContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   arrowIcon: {
//     marginRight: 5,
//   },
// });

// export default SportsScreen;


import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { getSports, testApiConnection, isAuthenticated } from '../../config/apis';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const SportsScreen = ({ navigation }) => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);

  const fetchSports = async () => {
    try {
      setLoading(true);

      console.log('🔄 Fetching sports data...');
      const result = await getSports();

      console.log(`📊 Received ${result.data?.length || 0} sports from ${result.source}`);
      setSports(result.data || []);
      setDataSource(result.source);

      // Update status
      if (result.source === 'mock') {
        if (result.requiresAuth) {
          setApiStatus('🔐 Login Required');
          setRequiresAuth(true);
        } else {
          setApiStatus('📡 Demo Mode');
          setRequiresAuth(false);
        }
      } else {
        setApiStatus('✅ Connected');
        setRequiresAuth(false);
      }

    } catch (error) {
      console.error('Error:', error);
      setApiStatus('❌ Connection Error');
      setSports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // const fetchSports = async () => {
  //   try {
  //     setLoading(true);

  //     // Check authentication status
  //     const authenticated = await isAuthenticated();
  //     console.log('Authentication status:', authenticated);

  //     // Test connection first
  //     const testResult = await testApiConnection();
  //     console.log('Test connection result:', testResult);

  //     let statusMessage = '';
  //     if (testResult.status === 403) {
  //       statusMessage = '🔐 Authentication Required';
  //       setRequiresAuth(true);
  //     } else if (!testResult.ok) {
  //       statusMessage = '📡 Using Demo Data';
  //       setRequiresAuth(false);
  //     } else {
  //       statusMessage = '✅ Connected to Server';
  //       setRequiresAuth(false);
  //     }
  //     setApiStatus(statusMessage);

  //     console.log('🔄 Fetching sports data...');
  //     const result = await getSports();

  //     console.log(`📊 Received ${result.data?.length || 0} sports from ${result.source}`);
  //     setSports(result.data || []);
  //     setDataSource(result.source);

  //     // Update status based on data source
  //     if (result.source === 'mock') {
  //       if (result.requiresAuth) {
  //         setApiStatus('🔐 Login Required for Real Data');
  //       } else {
  //         setApiStatus('📡 Using Demo Data');
  //       }
  //     } else {
  //       setApiStatus('✅ Connected to Server');
  //     }

  //   } catch (error) {
  //     console.error('Error in fetchSports:', error);
  //     setApiStatus('❌ Error Loading Data');
  //     Alert.alert(
  //       'Connection Error',
  //       'Unable to load sports data. Please check your internet connection.',
  //       [{ text: 'OK' }]
  //     );
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSports();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSports();
  };

  const handleLoginPress = () => {
    Alert.alert(
      'Authentication Required',
      'This feature requires you to log in to access real-time data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  const handleRetryWithAuth = () => {
    Alert.alert(
      'Try Again',
      'Would you like to try loading data with your current login or continue with demo data?',
      [
        { text: 'Use Demo Data', onPress: fetchSports },
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  const renderSportCard = ({ item }) => (
    <TouchableOpacity
      style={styles.sportCard}
      onPress={() => navigation.navigate('SportDetailsScreen', { sport: item })}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={
          item.images && item.images.length > 0 && item.images[0]
            ? { uri: item.images[0] }
            : require('../../assets/notch.jpg')
        }
        style={styles.cardBackground}
        imageStyle={styles.cardImage}
      >
        <View style={styles.overlay} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.sportTitle} numberOfLines={1}>
                {item.activity || 'Unnamed Activity'}
              </Text>
              {dataSource === 'mock' && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>DEMO</Text>
                </View>
              )}
            </View>
            <View style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={styles.statusText}>
                {item.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.sportDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {item.sportCharge && item.sportCharge.length > 0 && item.sportCharge[0]?.memberCharges && (
            <View style={styles.chargesContainer}>
              <Text style={styles.chargesTitle}>Starting from:</Text>
              <Text style={styles.chargesPrice}>
                PKR {item.sportCharge[0].memberCharges.toLocaleString()}
              </Text>
              <Text style={styles.chargesType}>
                /{item.sportCharge[0]?.chargeType?.toLowerCase().replace('per_', '') || 'session'}
              </Text>
            </View>
          )}

          {item.timing && (
            <View style={styles.timingContainer}>
              <Icon name="schedule" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.timingText} numberOfLines={1}>
                {item.timing.weekdays || item.timing.men || 'Check timing'}
              </Text>
            </View>
          )}

          <Icon name="arrow-forward-ios" size={18} color="#FFF" style={styles.arrowIcon} />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderHeader = () => (
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
        <Text style={styles.headerText}>Sports & Activities</Text>
        <TouchableOpacity
          onPress={fetchSports}
          style={styles.refreshButton}
        >
          <Icon name="refresh" size={28} color="#000" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );

  const renderStatusBar = () => {
    if (!apiStatus) return null;

    let backgroundColor = '#007AFF'; // Default blue
    let icon = 'info';

    if (apiStatus.includes('DEMO') || apiStatus.includes('Demo')) {
      backgroundColor = '#FF9800'; // Orange for demo
      icon = 'sports';
    } else if (apiStatus.includes('Required') || apiStatus.includes('Login')) {
      backgroundColor = '#F44336'; // Red for auth required
      icon = 'lock';
    } else if (apiStatus.includes('Error') || apiStatus.includes('❌')) {
      backgroundColor = '#9E9E9E'; // Grey for error
      icon = 'error';
    } else if (apiStatus.includes('Connected') || apiStatus.includes('✅')) {
      backgroundColor = '#4CAF50'; // Green for connected
      icon = 'check-circle';
    }

    return (
      <TouchableOpacity
        style={[styles.statusBar, { backgroundColor }]}
        onPress={requiresAuth ? handleLoginPress : undefined}
        activeOpacity={requiresAuth ? 0.7 : 1}
      >
        <Icon name={icon} size={14} color="#FFF" style={styles.statusIcon} />
        <Text style={styles.statusTextBar} numberOfLines={1}>
          {apiStatus}
        </Text>
        {requiresAuth && (
          <Icon name="login" size={14} color="#FFF" style={styles.loginIcon} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="sports" size={80} color="#CCCCCC" />
      <Text style={styles.emptyText}>No Sports Available</Text>
      <Text style={styles.emptySubtext}>
        {requiresAuth
          ? 'Login required to access sports data'
          : 'Could not load sports data at this time'
        }
      </Text>
      <TouchableOpacity
        onPress={requiresAuth ? handleRetryWithAuth : fetchSports}
        style={styles.retryButton}
      >
        <Icon
          name={requiresAuth ? "login" : "refresh"}
          size={18}
          color="#FFF"
          style={styles.retryIcon}
        />
        <Text style={styles.retryText}>
          {requiresAuth ? 'Login to Continue' : 'Retry'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Contact')}
        style={styles.contactButton}
      >
        <Text style={styles.contactText}>Need Help? Contact Support</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && sports.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Sports...</Text>
        {apiStatus && (
          <Text style={styles.statusHint}>{apiStatus}</Text>
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {/* {renderStatusBar()} */}

        <FlatList
          data={sports}
          renderItem={renderSportCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
              title="Pull to refresh"
              titleColor="#007AFF"
            />
          }
          ListEmptyComponent={renderEmptyState()}
          ListHeaderComponent={
            sports.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {sports.length} {sports.length === 1 ? 'Sport' : 'Sports'} Available
                  {dataSource === 'mock' && ' (Demo Data)'}
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statusHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
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
    marginTop: -5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: -5,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -5,
  },
  statusBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusTextBar: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  loginIcon: {
    marginLeft: 6,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sportCard: {
    height: 180,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBackground: {
    flex: 1,
  },
  cardImage: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  sportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  demoBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(158, 158, 158, 0.9)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sportDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    lineHeight: 18,
  },
  chargesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  chargesTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 6,
  },
  chargesPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 4,
  },
  chargesType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
    flex: 1,
  },
  arrowIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  contactButton: {
    paddingVertical: 8,
  },
  contactText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SportsScreen;