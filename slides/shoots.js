import React, { useState, useEffect } from 'react'; 
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ImageBackground, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import BellIcon from 'react-native-vector-icons/Feather';
import { photoshootAPI, makeApiCall } from '../config/apis';
import Swiper from 'react-native-swiper';

// --- Component for the individual rule section ---
const RuleSection = ({ title, children }) => (
  <View style={styles.ruleSection}>
    <Text style={styles.ruleTitle}>{title}</Text>
    {children}
  </View>
);

// Photoshoot Card Component
const PhotoshootCard = React.memo(({ photoshoot, onBookNow }) => (
  <View style={styles.photoshootCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>Photoshoot Package</Text>
      {/* <View style={styles.priceBadge}>
        {/* <Text style={styles.priceText}>Rs:{photoshoot.memberCharges}</Text> */}
        {/* <Text style={styles.memberText}>Member</Text> */}
      {/* </View> */} 
    </View>
    
    <Text style={styles.description}>{photoshoot.description}</Text>
    
    <View style={styles.pricingContainer}>
      <View style={styles.pricingItem}>
        <Text style={styles.pricingLabel}>Member Charges</Text>
        <Text style={styles.pricingValue}>Rs:{photoshoot.memberCharges}</Text>
      </View>
      <View style={styles.pricingItem}>
        <Text style={styles.pricingLabel}>Guest Charges</Text>
        <Text style={styles.pricingValue}>Rs:{photoshoot.guestCharges}</Text>
      </View>
    </View>
    
    <TouchableOpacity 
      style={styles.bookButton}
      onPress={() => {
        console.log('Button pressed for photoshoot:', photoshoot);
        onBookNow(photoshoot);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.bookButtonText}>Book This Package</Text>
    </TouchableOpacity>
  </View>
));

const shoots = ({ navigation }) => {
  const [photoshoots, setPhotoshoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhotoshoots = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await makeApiCall(photoshootAPI.getAllPhotoshoots);
      
      if (result.success) {
        let photoshootsData = [];
        
        if (Array.isArray(result.data)) {
          photoshootsData = result.data;
        } else if (result.data && Array.isArray(result.data.data)) {
          photoshootsData = result.data.data;
        } else if (result.data && result.data.photoshoots) {
          photoshootsData = result.data.photoshoots;
        }
        
        setPhotoshoots(photoshootsData);
      } else {
        throw new Error(result.message || 'Failed to fetch photoshoots');
      }
    } catch (err) {
      setError(err.message || 'Failed to load photoshoot data. Please try again.');
      setPhotoshoots([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotoshoots();
  };

  useEffect(() => {
    fetchPhotoshoots();
  }, []);

  const handleBookNow = React.useCallback((photoshoot) => {
    let isMounted = true;
  
    const showAlert = async () => {
      try {
        setTimeout(() => {
          if (isMounted) {
            Alert.alert(
              'Book Photoshoot',
              `Are you sure you want to book "${photoshoot.description}" for Rs:${photoshoot.memberCharges}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Confirm', 
                  onPress: () => navigation.navigate('shootsBooking', { photoshoot })
                }
              ],
              { cancelable: true }
            );
          }
        }, 100);
      } catch (error) {
        navigation.navigate('shootsBooking', { photoshoot });
      }
    };
    
    showAlert();
    
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D2B48C" />
          <Text style={styles.loadingText}>Loading photoshoots...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
  <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* 🔥 FIXED — Header ImageBackground placed correctly */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => navigation.navigate('start')}
          >
            <Icon name="arrowleft" size={30} color="#000" />
          </TouchableOpacity>

          <Text style={styles.notchTitle}>PhotoShoots</Text>

          <TouchableOpacity style={styles.iconWrapper}>
            <BellIcon name="bell" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D2B48C']}
            tintColor="#D2B48C"
          />
        }
      >
        {/* 🔹 IMAGE SWIPER BELOW NOTCH */}
<View style={styles.sliderContainer}>
  <Swiper
    autoplay
    autoplayTimeout={3}
    loop
    showsPagination
    activeDotColor="#A3834C"
  >
    <Image
      source={require('../assets/psc_home.jpeg')}
      style={styles.sliderImage}
    />
    <Image
      source={require('../assets/psc2.jpeg')}
      style={styles.sliderImage}
    />
    <Image
      source={require('../assets/psc3.jpeg')}
      style={styles.sliderImage}
    />
  </Swiper>
</View>

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="exclamationcircleo" size={24} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPhotoshoots}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {photoshoots.length > 0 ? (
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>Available Packages</Text>

            {photoshoots.map((photoshoot, index) => (
              <PhotoshootCard
                key={photoshoot.id || index}
                photoshoot={photoshoot}
                onBookNow={handleBookNow}
              />
            ))}
          </View>
        ) : !error && (
          <View style={styles.emptyContainer}>
            <Icon name="camerao" size={64} color="#D2B48C" />
            <Text style={styles.emptyText}>No photoshoot packages available</Text>
            <Text style={styles.emptySubtext}>Please check back later</Text>
          </View>
        )}
  <View style={styles.sectionBox}>
          <Text style={styles.sectionHeading}>RULES & REGULATIONS FOR PHOTOSHOOTS</Text>

          {/* Booking and Scheduling */}
          <Text style={styles.subHeading}>Booking and Scheduling</Text>
          <Text style={styles.sectionText}>
            Reserve photoshoot slots in advance from booking office. Payment is made in advance and in cash. Photoshoot duration should not exceed 2 hours.
          </Text>

          {/* Location Guidelines */}
          <Text style={styles.subHeading}>Location Guidelines</Text>
          <Text style={styles.sectionText}>
            Use designated areas for photoshoots. Acquire necessary permissions for specific locations.
          </Text>

          {/* Respectful Behavior */}
          <Text style={styles.subHeading}>Respectful Behavior</Text>
          <Text style={styles.sectionText}>
            Uphold a culture of respect towards Club Members and strive to minimize any disruptions to their engagement. Respect member's privacy preferences and culture of KPK. Maintain professionalism during shoots.
          </Text>

          {/* Attire and Poses */}
          <Text style={styles.subHeading}>Attire and Poses</Text>
          <Text style={styles.sectionText}>
            Please ensure that your attire and poses adhere to the established standards of the club, reflecting the cultural values of Peshawar.
          </Text>

          {/* Safety Measures */}
          <Text style={styles.subHeading}>Safety Measures</Text>
          <Text style={styles.sectionText}>
            Prioritize safety during shoots. It is imperative to exercise diligence in handling club assets. Any incurred damages necessitate financial responsibility on the part of the client, in accordance with the club's by-laws.
          </Text>

          {/* Attendance and Punctuality */}
          <Text style={styles.subHeading}>Attendance and Punctuality</Text>
          <Text style={styles.sectionText}>
            Arrive on time for photoshoots. Notify in advance if unable to attend a scheduled session.
          </Text>

          {/* Cancellation */}
          <Text style={styles.subHeading}>Cancellation of Photoshoot</Text>
          <Text style={styles.sectionText}>
            In the event of an emergency or the need for cancellation, payments will not be refunded in any case.
          </Text>

          {/* Club Guidelines */}
          <Text style={styles.subHeading}>Adherence to Club Guidelines</Text>
          <Text style={styles.sectionText}>
            Adherence to all club guidelines and rules is imperative. In the event of non-compliance, the club reserves the right to cancel your booking, and payment shall not be subject to reimbursement.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Stylesheet (unchanged except indentation) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },

  notch: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    backgroundColor: "#D2B48C",
  },
  notchImage: { resizeMode: "cover" },
  notchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  notchTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },

  scrollContent: { paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },

  packagesSection: { paddingHorizontal: 15, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  photoshootCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#D2B48C',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
moreAboutContainer: {
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginTop: 25,
    elevation: 3,
  },

  moreAboutTitle: {
    fontSize: 20,
    color: "#000",
    textAlign: "center",
  },

  moreAboutHighlight: {
    color: "#C8A66A",
  },
 sectionBox: {
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },

  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 15,
    color: "#000",
    textAlign: "center",
  },

  subHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C8A66A",
    marginTop: 14,
    marginBottom: 6,
  },

  sectionText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 22,
    textAlign: "justify",
  },

  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },

  priceBadge: {
    backgroundColor: '#D2B48C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },

  priceText: { fontSize: 14, fontWeight: 'bold' },
  memberText: { fontSize: 10 },

  description: { fontSize: 18, color: 'black', marginBottom: 12, fontWeight: 'bold' },

  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  pricingItem: { alignItems: 'center' },
  pricingLabel: { fontSize: 12, color: '#666' },
  pricingValue: { fontSize: 14, fontWeight: 'bold' },

  bookButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: { fontSize: 16, fontWeight: 'bold' },

  rulesContent: { paddingHorizontal: 20, marginTop: 25 },
  rulesHeader: { fontSize: 12, fontWeight: 'bold', marginBottom: 20 },

  ruleSection: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },

  ruleTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: "#C8A66A", },
  ruleText: { fontSize: 14, paddingLeft: 10 },

  errorContainer: {
    backgroundColor: '#ffe6e6',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  errorText: { color: '#d63031', textAlign: 'center', marginVertical: 8 },

  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 10 },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 5 },
});

export default shoots;

// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
// import BellIcon from 'react-native-vector-icons/Feather';
// import { photoshootAPI } from '../config/apis';

// // --- Component for the individual rule section ---
// const RuleSection = ({ title, children }) => (
//   <View style={styles.ruleSection}>
//     <Text style={styles.ruleTitle}>{title}</Text>
//     {children}
//   </View>
// );

// // --- Photoshoot Card Component ---
// const PhotoshootCard = ({ photoshoot, onBookNow }) => (
//   <View style={styles.photoshootCard}>
//     <View style={styles.cardHeader}>
//       <Text style={styles.cardTitle}>Photoshoot Package</Text>
//       <View style={styles.priceBadge}>
//         <Text style={styles.priceText}>₹{photoshoot.memberCharges}</Text>
//         <Text style={styles.memberText}>Member</Text>
//       </View>
//     </View>
    
//     <Text style={styles.description}>{photoshoot.description}</Text>
    
//     <View style={styles.pricingContainer}>
//       <View style={styles.pricingItem}>
//         <Text style={styles.pricingLabel}>Member Charges</Text>
//         <Text style={styles.pricingValue}>₹{photoshoot.memberCharges}</Text>
//       </View>
//       <View style={styles.pricingItem}>
//         <Text style={styles.pricingLabel}>Guest Charges</Text>
//         <Text style={styles.pricingValue}>₹{photoshoot.guestCharges}</Text>
//       </View>
//     </View>
    
//     <TouchableOpacity 
//       style={styles.bookButton}
//       onPress={() => onBookNow(photoshoot)}
//     >
//       <Text style={styles.bookButtonText}>Book This Package</Text>
//     </TouchableOpacity>
//   </View>
// );

// const shoots = ({ navigation }) => {
//   const [photoshoots, setPhotoshoots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchPhotoshoots = async () => {
//     try {
//       setError(null);
//       const response = await photoshootAPI.getAllPhotoshoots();
//       if (response.data && Array.isArray(response.data)) {
//         setPhotoshoots(response.data);
//       } else {
//         setPhotoshoots([]);
//       }
//     } catch (err) {
//       console.error('Error fetching photoshoots:', err);
//       setError('Failed to load photoshoot data. Please try again.');
//       setPhotoshoots([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchPhotoshoots();
//   };

//   useEffect(() => {
//     fetchPhotoshoots();
//   }, []);

//   const handleBookNow = (photoshoot) => {
//     Alert.alert(
//       'Book Photoshoot',
//       `Are you sure you want to book "${photoshoot.description}" for ₹${photoshoot.memberCharges}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Confirm', 
//           onPress: () => navigation.navigate('shootsBooking', { photoshoot })
//         }
//       ]
//     );
//   };

//   const handleBackPress = () => {
//     navigation.goBack();
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#D2B48C" />
//           <Text style={styles.loadingText}>Loading photoshoots...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#D2B48C" />
      
//       {/* Header Section */}
//       <View style={styles.headerBackground}>
//         <View style={styles.headerBar}>
//           <TouchableOpacity onPress={handleBackPress}>
//             <Icon name="arrowleft" size={24} color="black" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Photo Shoot</Text>
//           <TouchableOpacity>
//             <BellIcon name="bell" size={20} color="black" />
//           </TouchableOpacity>
//         </View>
        
//         {/* Stats Overview */}
//         <View style={styles.statsContainer}>
//           <View style={styles.statItem}>
//             <Text style={styles.statNumber}>{photoshoots.length}</Text>
//             <Text style={styles.statLabel}>Packages</Text>
//           </View>
//           <View style={styles.statItem}>
//             <Text style={styles.statNumber}>
//               ₹{photoshoots.reduce((min, shoot) => Math.min(min, shoot.memberCharges), photoshoots[0]?.memberCharges || 0)}
//             </Text>
//             <Text style={styles.statLabel}>Starting From</Text>
//           </View>
//         </View>
//       </View>

//       <ScrollView 
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#D2B48C']}
//             tintColor="#D2B48C"
//           />
//         }
//       >
//         {/* Error Message */}
//         {error && (
//           <View style={styles.errorContainer}>
//             <Icon name="exclamationcircleo" size={24} color="#ff6b6b" />
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchPhotoshoots}>
//               <Text style={styles.retryText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Photoshoot Packages Section */}
//         {photoshoots.length > 0 && (
//           <View style={styles.packagesSection}>
//             <Text style={styles.sectionTitle}>Available Packages</Text>
//             {photoshoots.map((photoshoot) => (
//               <PhotoshootCard
//                 key={photoshoot.id}
//                 photoshoot={photoshoot}
//                 onBookNow={handleBookNow}
//               />
//             ))}
//           </View>
//         )}

//         {/* No Data Message */}
//         {photoshoots.length === 0 && !error && (
//           <View style={styles.emptyContainer}>
//             <Icon name="camerao" size={64} color="#D2B48C" />
//             <Text style={styles.emptyText}>No photoshoot packages available</Text>
//             <Text style={styles.emptySubtext}>Please check back later</Text>
//           </View>
//         )}

//         {/* Rules & Regulations Content */}
//         <View style={styles.rulesContent}>
//           <Text style={styles.rulesHeader}>
//             RULES & REGULATIONS FOR PHOTOSHOOTS
//           </Text>

//           <RuleSection title="Booking and Scheduling">
//             <Text style={styles.ruleText}>
//               • Reserve Photoshoot slots in advance from booking office. Payment is made in advance and in cash. Photoshoot duration should not exceed 2 hours.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Location Guidelines">
//             <Text style={styles.ruleText}>
//               • Use designated areas for photoshoots. Acquire necessary permissions for specific locations.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Respectful Behavior">
//             <Text style={styles.ruleText}>
//               • Uphold a culture of respect towards Club Members and strive to minimize any disruptions to their engagement. Respect member's privacy, preferences and culture of KPK. Maintain professionalism during shoots.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Attire and Poses">
//             <Text style={styles.ruleText}>
//               • Please ensure that your attire and poses adhere to the established standards of the club, reflecting the cultural values of Peshawar.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Safety Measures">
//             <Text style={styles.ruleText}>
//               • Prioritize safety during shoots. It is imperative to exercise diligence in handling club assets. Any incurred damages necessitate financial responsibility on the part of the client, in accordance with the club's by-laws.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Attendance and Punctuality">
//             <Text style={styles.ruleText}>
//               • Arrive on time for photoshoots. Notify in advance if unable to attend a scheduled session.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Cancellation of Photoshoot">
//             <Text style={styles.ruleText}>
//               • In the event of an emergency or the need for cancellation, payments will not be refunded in any case.
//             </Text>
//           </RuleSection>

//           <RuleSection title="Adherence to Club Guidelines">
//             <Text style={styles.ruleText}>
//               • Adherence to all club guidelines and rules is imperative. In the event of non-compliance, the club reserves the right to cancel your booking, and payment shall not be subject to reimbursement.
//             </Text>
//           </RuleSection>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // --- Enhanced Stylesheet ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   // Header Styles
//   headerBackground: {
//     backgroundColor: '#D2B48C',
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   headerBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   // Stats Overview
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   // Packages Section
//   packagesSection: {
//     paddingHorizontal: 15,
//     marginTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 15,
//   },
//   // Photoshoot Card
//   photoshootCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     borderLeftWidth: 4,
//     borderLeftColor: '#D2B48C',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     flex: 1,
//   },
//   priceBadge: {
//     backgroundColor: '#D2B48C',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   priceText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   memberText: {
//     fontSize: 10,
//     color: '#000',
//   },
//   description: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   pricingContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   pricingItem: {
//     alignItems: 'center',
//   },
//   pricingLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   pricingValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   bookButton: {
//     backgroundColor: '#D2B48C',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   bookButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   // Rules Content Styles
//   rulesContent: {
//     paddingHorizontal: 20,
//     marginTop: 25,
//   },
//   rulesHeader: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#555',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   ruleSection: {
//     marginBottom: 20,
//     backgroundColor: '#f9f9f9',
//     padding: 15,
//     borderRadius: 8,
//   },
//   ruleTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 8,
//   },
//   ruleText: {
//     fontSize: 14,
//     lineHeight: 22,
//     color: '#333',
//     paddingLeft: 10,
//   },
//   // Error Styles
//   errorContainer: {
//     backgroundColor: '#ffe6e6',
//     margin: 15,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     borderLeftWidth: 4,
//     borderLeftColor: '#ff6b6b',
//   },
//   errorText: {
//     color: '#d63031',
//     textAlign: 'center',
//     marginVertical: 8,
//   },
//   retryButton: {
//     backgroundColor: '#ff6b6b',
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   retryText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   // Empty State
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#999',
//     marginTop: 5,
//     textAlign: 'center',
//   },
// });

// export default shoots;