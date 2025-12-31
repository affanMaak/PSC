// import React, { useState, useEffect } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   StatusBar,
//   ScrollView,
//   ImageBackground,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { lawnAPI } from '../../config/apis';

// const LawnListScreen = ({ route, navigation }) => {
//   const { categoryId, categoryName } = route.params;
//   const [lawns, setLawns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchLawns = async () => {
//     try {
//       console.log(`🌿 Loading lawns for category ${categoryId}...`);
//       setError({ message: null, status: null });
//       setLoading(true);

//       const response = await lawnAPI.getLawnsByCategory(categoryId);

//       if (response?.data && Array.isArray(response.data)) {
//         console.log(`✅ Found ${response.data.length} lawns`);

//         const transformedLawns = response.data.map((lawn, index) => {
//           return {
//             id: lawn.id || index,
//             title: lawn.description || 'Unnamed Lawn',
//             description: `Capacity: ${lawn.minGuests || 0} - ${lawn.maxGuests || 0} guests`,
//             minGuests: lawn.minGuests || 0,
//             maxGuests: lawn.maxGuests || 0,
//             memberCharges: lawn.memberCharges || 0,
//             guestCharges: lawn.guestCharges || 0,
//             isActive: lawn.isActive !== undefined ? lawn.isActive : true,
//             isOutOfService: lawn.isOutOfService || false,
//             type: 'lawn',
//             onPress: () => handleLawnPress(lawn),
//           };
//         });

//         setLawns(transformedLawns);
//       } else {
//         console.warn('⚠️ No lawns found');
//         setLawns([]);
//       }

//     } catch (err) {
//       console.error('❌ Error loading lawns:', err);

//       let errorMessage = 'Failed to load lawns';
//       if (err.response?.status === 404) {
//         errorMessage = 'No lawns found for this category';
//       } else if (err.message?.includes('Network Error')) {
//         errorMessage = 'Network error. Please check your connection.';
//       }

//       setError({
//         message: errorMessage,
//         status: err.response?.status
//       });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleLawnPress = (lawn) => {
//     navigation.navigate('LawnBooking', {
//       venue: lawn,
//       venueType: 'lawn',
//     });
//   };

//   const handleRetry = async () => {
//     setLoading(true);
//     setError({ message: null, status: null });
//     await new Promise(resolve => setTimeout(resolve, 500));
//     fetchLawns();
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     setError({ message: null, status: null });
//     fetchLawns();
//   };

//   useEffect(() => {
//     fetchLawns();
//   }, [categoryId]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <StatusBar barStyle="light-content" />
//         <ImageBackground
//           source={require('../../assets/notch.jpg')}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchContent}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrow-back" size={28} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>{categoryName}</Text>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <View style={styles.centerContent}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//           <Text style={styles.loadingText}>Loading Lawns...</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <>
//       <StatusBar barStyle="light-content" />
//       <View style={styles.container}>
//         <ImageBackground
//           source={require('../../assets/notch.jpg')}
//           style={styles.notch}
//           imageStyle={styles.notchImage}
//         >
//           <View style={styles.notchContent}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrow-back" size={28} color="#000" />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>{categoryName}</Text>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <SafeAreaView style={styles.safeArea}>
//           <ScrollView
//             style={styles.scrollView}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 colors={['#4CAF50']}
//                 tintColor="#4CAF50"
//               />
//             }
//           >
//             {error.message && (
//               <View style={styles.errorBanner}>
//                 <Text style={styles.errorBannerText}>{error.message}</Text>
//                 <TouchableOpacity
//                   style={styles.retryButtonSmall}
//                   onPress={handleRetry}
//                 >
//                   <Text style={styles.retryButtonText}>Retry</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             <View style={styles.infoContainer}>
//               <Text style={styles.infoText}>
//                 🌿 {lawns.length} lawns available
//               </Text>
//             </View>

//             {lawns.length > 0 ? (
//               lawns.map((lawn) => (
//                 <TouchableOpacity
//                   key={lawn.id}
//                   style={styles.card}
//                   onPress={lawn.onPress}
//                   disabled={lawn.isOutOfService}
//                 >
//                   <View style={styles.cardContent}>
//                     <View style={styles.textContainer}>
//                       <Text style={styles.cardTitle}>{lawn.title}</Text>
//                       <Text style={styles.cardDescription}>
//                         {lawn.description}
//                       </Text>

//                       <View style={styles.detailsContainer}>
//                         <Text style={styles.detailText}>
//                           💰 Member: Rs. {lawn.memberCharges}
//                         </Text>
//                         <Text style={styles.detailText}>
//                           👤 Guest: Rs. {lawn.guestCharges}
//                         </Text>
//                       </View>

//                       <View style={styles.statusContainer}>
//                         {lawn.isOutOfService ? (
//                           <Text style={styles.statusInactive}>
//                             ⚠️ Currently Unavailable
//                           </Text>
//                         ) : (
//                           <Text style={styles.statusActive}>
//                             ✅ Available for Booking
//                           </Text>
//                         )}
//                       </View>
//                     </View>
//                     <View style={styles.arrowContainer}>
//                       <Text style={styles.arrowIcon}>›</Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               !loading && !error && (
//                 <View style={styles.noDataContainer}>
//                   <Text style={styles.noDataText}>
//                     No lawns available in this category
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.retryButton}
//                     onPress={handleRetry}
//                   >
//                     <Text style={styles.retryButtonText}>Try Again</Text>
//                   </TouchableOpacity>
//                 </View>
//               )
//             )}
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
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   centerContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '600',
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
//   infoContainer: {
//     backgroundColor: '#e8f5e8',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 15,
//     alignItems: 'center',
//   },
//   infoText: {
//     color: '#2E7D32',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   errorBanner: {
//     backgroundColor: '#ffebee',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#f44336',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   errorBannerText: {
//     color: '#d32f2f',
//     fontSize: 14,
//     flex: 1,
//     marginRight: 10,
//   },
//   retryButtonSmall: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   retryButtonText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   noDataContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   noDataText: {
//     fontSize: 18,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 10,
//     fontWeight: '600',
//   },
//   retryButton: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   card: {
//     backgroundColor: '#FFF',
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   cardContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   textContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 5,
//   },
//   cardDescription: {
//     fontSize: 14,
//     color: '#718096',
//     marginBottom: 10,
//   },
//   detailsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 5,
//   },
//   detailText: {
//     fontSize: 12,
//     color: '#4A5568',
//     fontWeight: '500',
//   },
//   statusContainer: {
//     marginTop: 5,
//   },
//   statusActive: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//   },
//   statusInactive: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#F44336',
//   },
//   arrowContainer: {
//     paddingLeft: 10,
//   },
//   arrowIcon: {
//     fontSize: 24,
//     color: '#2E7D32',
//     fontWeight: 'bold',
//   },
// });

// export default LawnListScreen;


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
} from 'react-native';
import { lawnAPI } from '../../config/apis';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LawnListScreen = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [lawns, setLawns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLawns = async () => {
    try {
      console.log(`🌿 Loading lawns for category ${categoryId}...`);
      setError({ message: null, status: null });
      setLoading(true);

      const response = await lawnAPI.getLawnsByCategory(categoryId);

      if (response?.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} lawns`);

        const transformedLawns = response.data.map((lawn, index) => {
          return {
            id: lawn.id || index,
            title: lawn.description || 'Unnamed Lawn',
            description: `Capacity: ${lawn.minGuests || 0} - ${lawn.maxGuests || 0} guests`,
            minGuests: lawn.minGuests || 0,
            maxGuests: lawn.maxGuests || 0,
            memberCharges: lawn.memberCharges || 0,
            guestCharges: lawn.guestCharges || 0,
            isActive: lawn.isActive !== undefined ? lawn.isActive : true,
            isOutOfService: lawn.isOutOfService || false,
            type: 'lawn',
            onPress: () => handleLawnPress(lawn),
          };
        });

        setLawns(transformedLawns);
      } else {
        console.warn('⚠️ No lawns found');
        setLawns([]);
      }

    } catch (err) {
      console.error('❌ Error loading lawns:', err);

      let errorMessage = 'Failed to load lawns';
      if (err.response?.status === 404) {
        errorMessage = 'No lawns found for this category';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setError({
        message: errorMessage,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLawnPress = (lawn) => {
    navigation.navigate('LawnBooking', {
      venue: lawn,
      venueType: 'lawn',
    });
  };

  const handleRetry = async () => {
    setLoading(true);
    setError({ message: null, status: null });
    await new Promise(resolve => setTimeout(resolve, 500));
    fetchLawns();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setError({ message: null, status: null });
    fetchLawns();
  };

  useEffect(() => {
    fetchLawns();
  }, [categoryId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
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
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{categoryName}</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading Lawns...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
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
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{categoryName}</Text>
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
                colors={['#4CAF50']}
                tintColor="#4CAF50"
              />
            }
          >
            {error.message && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error.message}</Text>
                <TouchableOpacity
                  style={styles.retryButtonSmall}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                🌿 {lawns.length} lawns available
              </Text>
            </View>

            {lawns.length > 0 ? (
              lawns.map((lawn) => {
                // Truncate title to "Catering" if it's too long
                const truncateTitle = (title) => {
                  if (!title) return 'Unnamed Lawn';
                  const cateringIndex = title.toLowerCase().indexOf('catering');
                  if (cateringIndex !== -1) {
                    return title.substring(0, cateringIndex + 8).trim(); // +8 for "catering" length
                  }
                  // If no "catering" found, limit to 50 characters
                  return title.length > 50 ? title.substring(0, 50) + '...' : title;
                };

                return (
                  <View
                    key={lawn.id}
                    style={styles.card}
                  >
                    {/* Card Upper Section - White Background */}
                    <View style={styles.cardUpperSection}>
                      {/* Title */}
                      <Text style={styles.cardTitle}>{truncateTitle(lawn.title)}</Text>

                      {/* Status Indicator */}
                      {lawn.isOutOfService && (
                        <View style={styles.unavailableBadge}>
                          <Text style={styles.unavailableBadgeText}>Unavailable</Text>
                        </View>
                      )}

                      {/* Tags Section */}
                      <View style={styles.tagsContainer}>
                        <View style={styles.tag}>
                          <Icon name="local-parking" size={14} color="#555" />
                          <Text style={styles.tagText}>Parking</Text>
                        </View>
                        <View style={styles.tag}>
                          <Icon name="park" size={14} color="#555" />
                          <Text style={styles.tagText}>Outdoor</Text>
                        </View>
                        <View style={styles.tag}>
                          <Icon name="grass" size={14} color="#555" />
                          <Text style={styles.tagText}>Garden Setup</Text>
                        </View>
                        <View style={styles.tag}>
                          <Icon name="lightbulb" size={14} color="#555" />
                          <Text style={styles.tagText}>Event Lighting</Text>
                        </View>
                      </View>
                    </View>

                    {/* Card Bottom Section - Colored Background */}
                    <View style={styles.cardBottomSection}>
                      {/* Left Side - Capacity & Pricing */}
                      <View style={styles.bottomLeftContainer}>
                        {/* Capacity */}
                        <View style={styles.capacityContainer}>
                          <Text style={styles.capacityLabel}>Capacity</Text>
                          <Text style={styles.capacityValue}>
                            {lawn.minGuests} - {lawn.maxGuests} Guests
                          </Text>
                        </View>

                        {/* Pricing */}
                        <View style={styles.pricingContainer}>
                          <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Member:</Text>
                            <Text style={styles.priceValue}>PKR {lawn.memberCharges?.toLocaleString()}</Text>
                          </View>
                          <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Guest:</Text>
                            <Text style={styles.priceValue}>PKR {lawn.guestCharges?.toLocaleString()}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Side - View Detail Button */}
                      <TouchableOpacity
                        style={[styles.viewDetailButton, lawn.isOutOfService && styles.viewDetailButtonDisabled]}
                        onPress={lawn.onPress}
                        disabled={lawn.isOutOfService}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.viewDetailButtonText}>View Detail</Text>
                        <Icon name="arrow-forward" size={16} color="#b48a64" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              !loading && !error && (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    No lawns available in this category
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )
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
    paddingVertical: 15,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  infoContainer: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  retryButtonSmall: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#FFF',
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  cardUpperSection: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  cardBottomSection: {
    backgroundColor: '#b48a64',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1a1a2e',
    marginBottom: 12,
    lineHeight: 24,
  },
  unavailableBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  unavailableBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 5,
    fontWeight: '500',
  },
  bottomLeftContainer: {
    flex: 1,
  },
  capacityContainer: {
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 2,
  },
  capacityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pricingContainer: {
    alignItems: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginRight: 6,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  viewDetailButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewDetailButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  viewDetailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b48a64',
  },
});

export default LawnListScreen;