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
// import AntIcon from "react-native-vector-icons/AntDesign";
// import BellIcon from "react-native-vector-icons/Feather";

// const events = ({ navigation }) => {

//   const sportsData = [
//     {
//       id: 1,
//       title: 'Vintage Car Rally',
//       image: require('../assets/vin.jpg'),
//       onPress: () => navigation.navigate('VCR'),
//     },
//     {
//       id: 2,
//       title: 'Grand Tambola Night',
//       image: require('../assets/tamb.jpg'),
//       onPress: () => navigation.navigate('GTN'),
//     },
//     {
//       id: 3,
//       title: 'Chand Raat',
//       image: require('../assets/cd.jpg'),
//       onPress: () => navigation.navigate('CR'),
//     },
//     {
//       id: 4,
//       title: 'New Year Night',
//       image: require('../assets/ny0.jpg'),
//       onPress: () => navigation.navigate('NY'),
//     },
//     {
//       id: 5,
//       title: 'Spring Festival',
//       image: require('../assets/sp.jpg'),
//       onPress: () => navigation.navigate('SF'),
//     },
//     {
//       id: 6,
//       title: 'Live Screaning of Matches',
//       image: require('../assets/lv.jpg'),
//       onPress: () => navigation.navigate('LCM'),
//     },
//     {
//       id: 7,
//       title: 'Saturday Night Buffet',
//       image: require('../assets/s.jpg'),
//       onPress: () => navigation.navigate('SNB'),
//     },
//     {
//       id: 8,
//       title: 'Hi Tea',
//       image: require('../assets/sb1.jpg'),
//       onPress: () => navigation.navigate('HiTea'),
//     },
//     {
//       id: 9,
//       title: 'Sunday Bruch',
//       image: require('../assets/h.jpg'),
//       onPress: () => navigation.navigate('SB'),
//     },

//   ];

//   return (
//     <>
//       <StatusBar barStyle="light-content" />
//       <View style={styles.container}>
//         {/* 🔹 Notch Header */}
//         <ImageBackground
//           source={require("../assets/notch.jpg")}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchContent}>

//             {/* Back Button (Real Icon) */}
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.navigate("start")}
//             >
//               <AntIcon name="arrowleft" size={28} color="#000" />
//             </TouchableOpacity>

//             <Text style={styles.headerText}>Events</Text>




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
//                 onPress={sport.onPress} // ✅ Navigation fixed
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
//                       <Text style={styles.arrowIcon}>›</Text>
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
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: {
//     fontSize: 28,
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     flex: 1,
//     marginRight: 55,
//     marginBottom: 6
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
//     width: 2,
//     height: '100%',
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     position: 'absolute',
//     right: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   arrowIcon: {
//     fontSize: 32,
//     color: '#FFF',
//     fontWeight: 'bold',
//     position: 'absolute',
//     right: -15,
//   },
// });

// export default events;

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
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { getEvents } from '../config/apis';
import Icon from 'react-native-vector-icons/Ionicons';

const events = ({ navigation }) => {
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching events...');

      const data = await getEvents();
      console.log('📊 Raw API data:', data);

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.warn('⚠️ API did not return an array:', data);
        setEventsData(getFallbackEvents());
        return;
      }

      // Transform the data
      const transformedEvents = data
        // .filter(event => event.isActive !== false) // Remove filter temporarily for debugging
        .map((event, index) => {
          console.log(`Processing event ${index + 1}:`, event);

          // Handle images - check if images is a string or array
          let imageSource;
          if (event.images) {
            try {
              // Check if images is a string that needs parsing
              const imagesArray = typeof event.images === 'string'
                ? JSON.parse(event.images)
                : event.images;

              if (Array.isArray(imagesArray) && imagesArray.length > 0) {
                imageSource = { uri: imagesArray[0] };
              } else {
                imageSource = require('../assets/psc_home.jpeg');
              }
            } catch (err) {
              console.warn('Failed to parse images:', err);
              imageSource = require('../assets/psc_home.jpeg');
            }
          } else {
            imageSource = require('../assets/psc_home.jpeg');
          }

          return {
            id: event.id || `event-${index}`,
            title: event.title || 'Untitled Event',
            description: event.description || 'No description available',
            image: imageSource,
            date: event.date || event.createdAt || '',
            time: event.time || '',
            location: event.location || '',
            isActive: event.isActive !== false,
            rawData: event, // Keep original data for debugging
            onPress: () => handleEventPress(event),
          };
        });

      console.log('✅ Transformed events:', transformedEvents);
      setEventsData(transformedEvents);

    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setError(error.message || 'Failed to load events');
      Alert.alert('Error', 'Failed to load events. Using sample data instead.');

      // Fallback to dummy data
      setEventsData(getFallbackEvents());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback dummy data
  const getFallbackEvents = () => {
    console.log('🔄 Using fallback events');
    return [
      {
        id: 1,
        title: 'Vintage Car Rally',
        image: require('../assets/psc_home.jpeg'),
        description: 'Join us for our annual vintage car exhibition and rally.',
        date: '2024-03-15',
        onPress: () => navigation.navigate('EventDetails', {
          event: {
            id: 1,
            title: 'Vintage Car Rally',
            image: require('../assets/psc_home.jpeg'),
            description: 'Join us for our annual vintage car exhibition and rally.',
            date: '2024-03-15',
            time: '10:00 AM - 4:00 PM',
            location: 'Main Club Lawn'
          }
        }),
      },
      {
        id: 2,
        title: 'Grand Tambola Night',
        image: require('../assets/psc_home.jpeg'),
        description: 'Exciting tambola night with amazing prizes.',
        date: '2024-03-20',
        onPress: () => navigation.navigate('EventDetails', {
          event: {
            id: 2,
            title: 'Grand Tambola Night',
            image: require('../assets/psc_home.jpeg'),
            description: 'Exciting tambola night with amazing prizes.',
            date: '2024-03-20',
            time: '7:00 PM - 11:00 PM',
            location: 'Banquet Hall'
          }
        }),
      },
      {
        id: 3,
        title: 'New Year Gala',
        image: require('../assets/psc_home.jpeg'),
        description: 'Celebrate the new year with music, dance, and fine dining.',
        date: '2024-12-31',
        onPress: () => navigation.navigate('EventDetails', {
          event: {
            id: 3,
            title: 'New Year Gala',
            image: require('../assets/psc_home.jpeg'),
            description: 'Celebrate the new year with music, dance, and fine dining.',
            date: '2024-12-31',
            time: '8:00 PM - 1:00 AM',
            location: 'Main Club House'
          }
        }),
      },
    ];
  };

  // Handle event press
  const handleEventPress = (event) => {
    console.log('Event pressed:', event.title);
    navigation.navigate('EventDetails', { event });
  };

  // Pull to refresh
  const onRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    fetchEvents();
  };

  // Load events on component mount
  useEffect(() => {
    console.log('📱 Events screen mounted');
    fetchEvents();
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ActivityIndicator size="large" color="#A3834C" />
        <Text style={styles.loadingText}>Loading events...</Text>
        {/* <Text style={styles.debugText}>Fetching from: {'/content/events'}</Text> */}
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
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
              onPress={() => navigation.navigate('start')}
            >
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Events</Text>
            {/* <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log('📊 Current eventsData:', eventsData);
                Alert.alert('Debug Info', `Total events: ${eventsData.length}\nError: ${error || 'None'}`);
              }}
            >
              <Icon name="search-outline" size={24} color="#000" />
            </TouchableOpacity> */}
          </View>
        </ImageBackground>

        {/* 🔹 Main Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#A3834C']}
                tintColor="#A3834C"
              />
            }
          >
            {/* Debug info (visible in development) */}
            {/* {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                  Events: {eventsData.length} | Error: {error ? 'Yes' : 'No'}
                </Text>
              </View>
            )} */}

            {/* Events Count */}
            <View style={styles.eventsCountContainer}>
              <Text style={styles.eventsCountText}>
                {eventsData.length} {eventsData.length === 1 ? 'Event' : 'Events'} happening
              </Text>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <Text style={styles.errorSubText}>Showing sample events</Text>
              </View>
            )}

            {/* 🔹 Events Cards */}
            {eventsData.length > 0 ? (
              eventsData.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={event.onPress}
                >
                  <ImageBackground
                    source={event.image}
                    style={styles.eventCardBackground}
                    imageStyle={styles.eventCardImage}
                  >
                    <View style={styles.overlay} />
                    <View style={styles.eventCardContent}>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {event.date && (
                          <Text style={styles.eventDate}>
                            📅 {new Date(event.date).toLocaleDateString() || event.date}
                          </Text>
                        )}
                        {event.time && (
                          <Text style={styles.eventTime}>⏰ {event.time}</Text>
                        )}
                      </View>
                      <View style={styles.arrowContainer}>
                        <Icon name="chevron-forward" size={24} color="#FFF" />
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))
            ) : (
              // No events state
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No events available at the moment</Text>
                <Text style={styles.noEventsSubText}>
                  Check back later for upcoming events or contact club administration
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchEvents}
                >
                  <Text style={styles.retryButtonText}>Retry Loading</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sampleButton}
                  onPress={() => setEventsData(getFallbackEvents())}
                >
                  <Text style={styles.sampleButtonText}>Show Sample Events</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
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
  backIcon: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
    marginRight: 50
  },
  debugButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 20,
    color: '#000',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  eventsCountContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  eventsCountText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  errorSubText: {
    color: '#856404',
    fontSize: 12,
  },
  eventCard: {
    height: 140,
    width: '100%',
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  eventCardBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  eventCardImage: {
    borderRadius: 15,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  eventCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  arrowIcon: {
    // No longer used for text, keeping it here won't hurt or can be removed
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noEventsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#A3834C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sampleButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '80%',
  },
  sampleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default events;