// // // // import React from "react";
// // // // import {
// // // //   View,
// // // //   Text,
// // // //   StyleSheet,
// // // //   ScrollView,
// // // //   TouchableOpacity,
// // // //   Image, 
// // // // } from "react-native";
// // // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// // // // const roomCategories = [

// // // //   { name: "Suite", screen: "suite" }, 
// // // //   { name: "Deluxe", screen: "deluxe" },
// // // //   { name: "Studio", screen: "studio" },
// // // // ];


// // // // const features = [
// // // //   { icon: "currency-usd", label: "Best Rate" },
// // // //   { icon: "wifi", label: "WiFi" },
// // // //   { icon: "washing-machine", label: "Laundry" },
// // // //   { icon: "thermometer", label: "Temperature" },
// // // //   { icon: "key", label: "Keyless Entry" },
// // // //   { icon: "account-check-outline", label: "24/7 Reception" },
// // // //   { icon: "parking", label: "Parking" },
// // // //   { icon: "credit-card-outline", label: "E-Payment" },
// // // //   { icon: "room-service-outline", label: "Room Service" },
// // // //   { icon: "atm", label: "ATM" },
// // // //   { icon: "account-group", label: "Club Facilities" }, 
// // // // ];


// // // // export default function Home({ navigation }) {
// // // //   const activeIndex = 1; 

// // // //   return (
// // // //     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>


// // // //       <View style={styles.header}>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // // //           <Icon name="arrow-left" size={24} color="#fff" />
// // // //         </TouchableOpacity>
// // // //         <Text style={styles.headerTitle}>Guest Room</Text>
// // // //         <TouchableOpacity>
// // // //           <Icon name="bell-outline" size={24} color="#fff" />
// // // //         </TouchableOpacity>
// // // //       </View>


// // // //       <View style={styles.section}>
// // // //         <Text style={styles.sectionTitle}>Enjoy Your Stay With Us</Text>
// // // //         <Text style={styles.sectionDesc}>
// // // //           Our guest rooms include Suites, Deluxe and Studio rooms. These are
// // // //           fully furnished rooms for short or long stay.
// // // //         </Text>
// // // //       </View>


// // // //       <Text style={styles.subHeading}>Room Categories</Text>
// // // //       <View style={styles.categoryContainer}>
// // // //         {roomCategories.map((cat, index) => (
// // // //           <TouchableOpacity
// // // //             key={index}
// // // //             style={[
// // // //               styles.categoryBtn,
// // // //               index === activeIndex && styles.categoryBtnActive,
// // // //             ]}

// // // //             onPress={() => navigation.navigate(cat.screen)}
// // // //           >
// // // //             <Text
// // // //               style={[
// // // //                 styles.categoryText,
// // // //                 index === activeIndex && styles.categoryTextActive,
// // // //               ]}
// // // //             >
// // // //               {cat.name}
// // // //             </Text>
// // // //           </TouchableOpacity>
// // // //         ))}
// // // //       </View>


// // // //       <View style={styles.featuresSection}>
// // // //         <Text style={styles.featureTitle}>WHY OUR GUEST ROOMS</Text>
// // // //         <Text style={styles.featureSubtitle}>
// // // //           All club amenities available on check in.
// // // //         </Text>
// // // //         <View style={styles.featuresGrid}>
// // // //           {features.map((item, index) => (
// // // //             <View key={index} style={styles.featureItem}>
// // // //               <Icon name={item.icon} size={26} color="#a3875c" />
// // // //               <Text style={styles.featureText}>{item.label}</Text>
// // // //             </View>
// // // //           ))}
// // // //         </View>
// // // //       </View>


// // // //       <View style={styles.policySection}>
// // // //         <Text style={styles.policyTitle}>Guest Room Policy</Text>

// // // //         <Text style={styles.policySub}>Timings</Text>
// // // //         <Text style={styles.bullet}>• Check in - 1400 hours</Text>
// // // //         <Text style={styles.bullet}>• Check out - 1200 Noon</Text>

// // // //         <Text style={styles.policySub}>You are requested to please</Text>
// // // //         <Text style={styles.bullet}>• Half day rent will be charged if late checkout.</Text>
// // // //         <Text style={styles.bullet}>• Clear bills before check out.</Text>
// // // //         <Text style={styles.bullet}>• Return key card during checkout.</Text>
// // // //         <Text style={styles.bullet}>
// // // //           • Switch off electrical appliances before leaving.
// // // //         </Text>
// // // //         <Text style={styles.bullet}>• Report issues to reception.</Text>

// // // //         <Text style={styles.policySub}>Don'ts</Text>
// // // //         <Text style={styles.bullet}>• No private music systems or irons.</Text>
// // // //         <Text style={styles.bullet}>
// // // //           • Pets are not allowed inside the club.
// // // //         </Text>
// // // //         <Text style={styles.bullet}>
// // // //           • More than 3 adults per room not allowed.
// // // //         </Text>

// // // //         <Text style={styles.policySub}>Misc</Text>
// // // //         <Text style={styles.bullet}>• Guests responsible for all breakage.</Text>
// // // //         <Text style={styles.bullet}>
// // // //           • Extra bedding on demand (₹400/night).
// // // //         </Text>
// // // //         <Text style={styles.bullet}>
// // // //           • Club not responsible for loss of valuables.
// // // //         </Text>
// // // //         <Text style={styles.bullet}>
// // // //           • Laundry and cleaning services available on payment.
// // // //         </Text>
// // // //       </View>
// // // //     </ScrollView>
// // // //   );
// // // // }


// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, backgroundColor: "#fff" },

// // // //   header: {
// // // //     backgroundColor: "#b48a64",
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     justifyContent: "space-between",
// // // //     paddingHorizontal: 20,
// // // //     paddingVertical: 15,
// // // //     borderBottomLeftRadius: 20,
// // // //     borderBottomRightRadius: 20,
// // // //   },
// // // //   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

// // // //   section: { padding: 20, alignItems: "center" },
// // // //   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
// // // //   sectionDesc: {
// // // //     textAlign: "center",
// // // //     color: "#555",
// // // //     backgroundColor: "#f9f3eb",
// // // //     padding: 12,
// // // //     borderRadius: 10,
// // // //   },

// // // //   subHeading: {
// // // //     fontSize: 16,
// // // //     fontWeight: "bold",
// // // //     marginLeft: 20,
// // // //     marginTop: 10,
// // // //   },

// // // //   categoryContainer: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-around",
// // // //     marginVertical: 10,
// // // //     marginHorizontal: 20,
// // // //   },
// // // //   categoryBtn: {
// // // //     backgroundColor: "#d8c7aa",
// // // //     paddingVertical: 10,
// // // //     borderRadius: 10,
// // // //     width: 100,
// // // //     alignItems: "center",
// // // //   },
// // // //   categoryBtnActive: { backgroundColor: "#b48a64" },
// // // //   categoryText: { fontSize: 16, color: "#444" },
// // // //   categoryTextActive: { color: "#fff", fontWeight: "bold" },

// // // //   featuresSection: {
// // // //     backgroundColor: "#fff",
// // // //     marginHorizontal: 15,
// // // //     borderRadius: 15,
// // // //     padding: 20,
// // // //     marginTop: 10,
// // // //     shadowColor: "#000",
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 5,
// // // //     elevation: 3,
// // // //   },
// // // //   featureTitle: { fontSize: 16, fontWeight: "bold", color: "#b48a64" },
// // // //   featureSubtitle: { color: "#666", marginBottom: 15 },
// // // //   featuresGrid: {
// // // //     flexDirection: "row",
// // // //     flexWrap: "wrap",
// // // //     justifyContent: "space-between",
// // // //   },
// // // //   featureItem: {
// // // //     width: "30%",
// // // //     alignItems: "center",
// // // //     marginBottom: 20,
// // // //   },
// // // //   featureText: { fontSize: 13, color: "#555", marginTop: 5, textAlign: "center" },

// // // //   policySection: {
// // // //     backgroundColor: "#fff8f2",
// // // //     margin: 15,
// // // //     borderRadius: 15,
// // // //     padding: 20,
// // // //   },
// // // //   policyTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: "bold",
// // // //     marginBottom: 10,
// // // //     textAlign: "center",
// // // //   },
// // // //   policySub: {
// // // //     fontWeight: "bold",
// // // //     color: "#b48a64",
// // // //     marginTop: 15,
// // // //     marginBottom: 5,
// // // //   },
// // // //   bullet: {
// // // //     color: "#444",
// // // //     fontSize: 14,
// // // //     marginLeft: 10,
// // // //     marginBottom: 5,
// // // //   },
// // // // });

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   ScrollView,
// // //   TouchableOpacity,
// // //   Alert,
// // // } from "react-native";
// // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// // // const roomCategories = [
// // //   { name: "Suite", screen: "suite" }, 
// // //   { name: "Deluxe", screen: "deluxe" },
// // //   { name: "Studio", screen: "studio" },
// // // ];

// // // const features = [
// // //   { icon: "currency-usd", label: "Best Rate" },
// // //   { icon: "wifi", label: "WiFi" },
// // //   { icon: "washing-machine", label: "Laundry" },
// // //   { icon: "thermometer", label: "Temperature" },
// // //   { icon: "key", label: "Keyless Entry" },
// // //   { icon: "account-check-outline", label: "24/7 Reception" },
// // //   { icon: "parking", label: "Parking" },
// // //   { icon: "credit-card-outline", label: "E-Payment" },
// // //   { icon: "room-service-outline", label: "Room Service" },
// // //   { icon: "atm", label: "ATM" },
// // //   { icon: "account-group", label: "Club Facilities" }, 
// // // ];

// // // export default function home({ navigation, route }) {
// // //   // Get parameters with fallbacks
// // //   const userRole = route.params?.userRole;
// // //   const userName = route.params?.userName;
// // //   const userEmail = route.params?.userEmail;

// // //   const [showWelcome, setShowWelcome] = useState(true);
// // //   const activeIndex = 1;

// // //   // Debug: Log the received parameters
// // //   useEffect(() => {
// // //     console.log("🏠 Home screen mounted");
// // //     console.log("📨 Received params:", { userRole, userName, userEmail });
// // //     console.log("📋 Full route.params:", route.params);
// // //   }, []);

// // //   // Show welcome alert based on user role
// // //   useEffect(() => {
// // //     console.log("🔔 Welcome effect running, userRole:", userRole, "showWelcome:", showWelcome);

// // //     if (userRole && showWelcome) {
// // //       let welcomeMessage = '';
// // //       let alertTitle = 'Welcome';

// // //       switch (userRole) {
// // //         case 'SUPER_ADMIN':
// // //           welcomeMessage = `Hello Super Admin ${userName || ''}! 👑\n\nYou have full administrative privileges.`;
// // //           alertTitle = 'Super Admin Access';
// // //           break;
// // //         case 'ADMIN':
// // //           welcomeMessage = `Hello Admin ${userName || ''}! ⚙️\n\nYou have administrative access.`;
// // //           alertTitle = 'Admin Access';
// // //           break;
// // //         case 'MEMBER':
// // //           welcomeMessage = `Welcome ${userName || ''}! 👤\n\nEnjoy your member benefits.`;
// // //           alertTitle = 'Member Access';
// // //           break;
// // //         default:
// // //           welcomeMessage = `Welcome ${userName || 'User'}!`;
// // //       }

// // //       console.log("🎯 Showing alert:", alertTitle);

// // //       // Show alert after a short delay
// // //       const timer = setTimeout(() => {
// // //         Alert.alert(
// // //           alertTitle, 
// // //           welcomeMessage, 
// // //           [
// // //             { 
// // //               text: 'Get Started', 
// // //               onPress: () => {
// // //                 console.log("✅ User dismissed welcome alert");
// // //                 setShowWelcome(false);
// // //               }
// // //             }
// // //           ]
// // //         );
// // //       }, 1000);

// // //       return () => clearTimeout(timer);
// // //     } else if (!userRole) {
// // //       console.log("❌ No userRole found, cannot show welcome message");
// // //     }
// // //   }, [userRole, userName, showWelcome]);

// // //   const getRoleDisplayName = () => {
// // //     switch (userRole) {
// // //       case 'SUPER_ADMIN': return 'Super Admin';
// // //       case 'ADMIN': return 'Admin';
// // //       case 'MEMBER': return 'Member';
// // //       default: return 'Guest';
// // //     }
// // //   };

// // //   const getRoleIcon = () => {
// // //     switch (userRole) {
// // //       case 'SUPER_ADMIN': return 'crown';
// // //       case 'ADMIN': return 'shield-account';
// // //       case 'MEMBER': return 'account';
// // //       default: return 'account';
// // //     }
// // //   };

// // //   return (
// // //     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
// // //       {/* Header with User Info */}
// // //       <View style={styles.header}>
// // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // //           <Icon name="arrow-left" size={24} color="#fff" />
// // //         </TouchableOpacity>

// // //         <View style={styles.headerInfo}>
// // //           <Text style={styles.headerTitle}>Guest Room</Text>
// // //           {userRole ? (
// // //             <View style={styles.roleContainer}>
// // //               <Icon name={getRoleIcon()} size={16} color="#fff" />
// // //               <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
// // //             </View>
// // //           ) : (
// // //             <Text style={styles.noRole}>No Role Detected</Text>
// // //           )}
// // //         </View>

// // //         <TouchableOpacity>
// // //           <Icon name="bell-outline" size={24} color="#fff" />
// // //         </TouchableOpacity>
// // //       </View>

// // //       {/* Debug Info Section */}
// // //       <View style={styles.debugSection}>
// // //         <Text style={styles.debugTitle}>Debug Information:</Text>
// // //         <Text style={styles.debugText}>User Role: {userRole || 'NOT SET'}</Text>
// // //         <Text style={styles.debugText}>User Name: {userName || 'NOT SET'}</Text>
// // //         <Text style={styles.debugText}>User Email: {userEmail || 'NOT SET'}</Text>
// // //       </View>

// // //       {/* Rest of your content */}
// // //       <View style={styles.section}>
// // //         <Text style={styles.sectionTitle}>Enjoy Your Stay With Us</Text>
// // //         <Text style={styles.sectionDesc}>
// // //           Our guest rooms include Suites, Deluxe and Studio rooms. These are
// // //           fully furnished rooms for short or long stay.
// // //         </Text>
// // //       </View>

// // //       <Text style={styles.subHeading}>Room Categories</Text>
// // //       <View style={styles.categoryContainer}>
// // //         {roomCategories.map((cat, index) => (
// // //           <TouchableOpacity
// // //             key={index}
// // //             style={[
// // //               styles.categoryBtn,
// // //               index === activeIndex && styles.categoryBtnActive,
// // //             ]}
// // //             onPress={() => navigation.navigate(cat.screen)}
// // //           >
// // //             <Text
// // //               style={[
// // //                 styles.categoryText,
// // //                 index === activeIndex && styles.categoryTextActive,
// // //               ]}
// // //             >
// // //               {cat.name}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         ))}
// // //       </View>

// // //       <View style={styles.featuresSection}>
// // //         <Text style={styles.featureTitle}>WHY OUR GUEST ROOMS</Text>
// // //         <Text style={styles.featureSubtitle}>
// // //           All club amenities available on check in.
// // //         </Text>
// // //         <View style={styles.featuresGrid}>
// // //           {features.map((item, index) => (
// // //             <View key={index} style={styles.featureItem}>
// // //               <Icon name={item.icon} size={26} color="#a3875c" />
// // //               <Text style={styles.featureText}>{item.label}</Text>
// // //             </View>
// // //           ))}
// // //         </View>
// // //       </View>

// // //       <View style={styles.policySection}>
// // //         <Text style={styles.policyTitle}>Guest Room Policy</Text>

// // //         <Text style={styles.policySub}>Timings</Text>
// // //         <Text style={styles.bullet}>• Check in - 1400 hours</Text>
// // //         <Text style={styles.bullet}>• Check out - 1200 Noon</Text>

// // //         <Text style={styles.policySub}>You are requested to please</Text>
// // //         <Text style={styles.bullet}>• Half day rent will be charged if late checkout.</Text>
// // //         <Text style={styles.bullet}>• Clear bills before check out.</Text>
// // //         <Text style={styles.bullet}>• Return key card during checkout.</Text>
// // //         <Text style={styles.bullet}>
// // //           • Switch off electrical appliances before leaving.
// // //         </Text>
// // //         <Text style={styles.bullet}>• Report issues to reception.</Text>

// // //         <Text style={styles.policySub}>Don'ts</Text>
// // //         <Text style={styles.bullet}>• No private music systems or irons.</Text>
// // //         <Text style={styles.bullet}>
// // //           • Pets are not allowed inside the club.
// // //         </Text>
// // //         <Text style={styles.bullet}>
// // //           • More than 3 adults per room not allowed.
// // //         </Text>

// // //         <Text style={styles.policySub}>Misc</Text>
// // //         <Text style={styles.bullet}>• Guests responsible for all breakage.</Text>
// // //         <Text style={styles.bullet}>
// // //           • Extra bedding on demand (₹400/night).
// // //         </Text>
// // //         <Text style={styles.bullet}>
// // //           • Club not responsible for loss of valuables.
// // //         </Text>
// // //         <Text style={styles.bullet}>
// // //           • Laundry and cleaning services available on payment.
// // //         </Text>
// // //       </View>
// // //     </ScrollView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: "#fff" },
// // //   header: {
// // //     backgroundColor: "#b48a64",
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     justifyContent: "space-between",
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 15,
// // //     borderBottomLeftRadius: 20,
// // //     borderBottomRightRadius: 20,
// // //   },
// // //   headerInfo: {
// // //     alignItems: 'center',
// // //   },
// // //   headerTitle: { 
// // //     color: "#fff", 
// // //     fontSize: 18, 
// // //     fontWeight: "bold",
// // //     marginBottom: 2,
// // //   },
// // //   roleContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   userRole: {
// // //     color: "#fff", 
// // //     fontSize: 12,
// // //     marginLeft: 4,
// // //   },
// // //   noRole: {
// // //     color: "#ff6b6b", 
// // //     fontSize: 12,
// // //     fontStyle: 'italic',
// // //   },
// // //   debugSection: {
// // //     backgroundColor: '#f8f9fa',
// // //     padding: 10,
// // //     margin: 10,
// // //     borderRadius: 8,
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#dc3545',
// // //   },
// // //   debugTitle: {
// // //     fontWeight: 'bold',
// // //     color: '#dc3545',
// // //     marginBottom: 5,
// // //   },
// // //   debugText: {
// // //     fontSize: 12,
// // //     color: '#666',
// // //   },
// // //   section: { padding: 20, alignItems: "center" },
// // //   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
// // //   sectionDesc: {
// // //     textAlign: "center",
// // //     color: "#555",
// // //     backgroundColor: "#f9f3eb",
// // //     padding: 12,
// // //     borderRadius: 10,
// // //   },
// // //   subHeading: {
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //     marginLeft: 20,
// // //     marginTop: 10,
// // //   },
// // //   categoryContainer: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-around",
// // //     marginVertical: 10,
// // //     marginHorizontal: 20,
// // //   },
// // //   categoryBtn: {
// // //     backgroundColor: "#d8c7aa",
// // //     paddingVertical: 10,
// // //     borderRadius: 10,
// // //     width: 100,
// // //     alignItems: "center",
// // //   },
// // //   categoryBtnActive: { backgroundColor: "#b48a64" },
// // //   categoryText: { fontSize: 16, color: "#444" },
// // //   categoryTextActive: { color: "#fff", fontWeight: "bold" },
// // //   featuresSection: {
// // //     backgroundColor: "#fff",
// // //     marginHorizontal: 15,
// // //     borderRadius: 15,
// // //     padding: 20,
// // //     marginTop: 10,
// // //     shadowColor: "#000",
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 5,
// // //     elevation: 3,
// // //   },
// // //   featureTitle: { fontSize: 16, fontWeight: "bold", color: "#b48a64" },
// // //   featureSubtitle: { color: "#666", marginBottom: 15 },
// // //   featuresGrid: {
// // //     flexDirection: "row",
// // //     flexWrap: "wrap",
// // //     justifyContent: "space-between",
// // //   },
// // //   featureItem: {
// // //     width: "30%",
// // //     alignItems: "center",
// // //     marginBottom: 20,
// // //   },
// // //   featureText: { fontSize: 13, color: "#555", marginTop: 5, textAlign: "center" },
// // //   policySection: {
// // //     backgroundColor: "#fff8f2",
// // //     margin: 15,
// // //     borderRadius: 15,
// // //     padding: 20,
// // //   },
// // //   policyTitle: {
// // //     fontSize: 18,
// // //     fontWeight: "bold",
// // //     marginBottom: 10,
// // //     textAlign: "center",
// // //   },
// // //   policySub: {
// // //     fontWeight: "bold",
// // //     color: "#b48a64",
// // //     marginTop: 15,
// // //     marginBottom: 5,
// // //   },
// // //   bullet: {
// // //     color: "#444",
// // //     fontSize: 14,
// // //     marginLeft: 10,
// // //     marginBottom: 5,
// // //   },
// // // });

// // // screens/Home.js
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   Alert,
// //   ActivityIndicator,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // import { roomService } from '../services/roomService';

// // const features = [
// //   { icon: "currency-usd", label: "Best Rate" },
// //   { icon: "wifi", label: "WiFi" },
// //   { icon: "washing-machine", label: "Laundry" },
// //   { icon: "thermometer", label: "Temperature" },
// //   { icon: "key", label: "Keyless Entry" },
// //   { icon: "account-check-outline", label: "24/7 Reception" },
// //   { icon: "parking", label: "Parking" },
// //   { icon: "credit-card-outline", label: "E-Payment" },
// //   { icon: "room-service-outline", label: "Room Service" },
// //   { icon: "atm", label: "ATM" },
// //   { icon: "account-group", label: "Club Facilities" }, 
// // ];

// // export default function Home({ navigation, route }) {
// //   const userRole = route.params?.userRole;
// //   const userName = route.params?.userName;
// //   const userEmail = route.params?.userEmail;

// //   const [showWelcome, setShowWelcome] = useState(true);
// //   const [roomTypes, setRoomTypes] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [activeCategory, setActiveCategory] = useState(0);

// //   // Check if user is admin and fetch room types accordingly
// //   useEffect(() => {
// //     if (isAdminUser()) {
// //       fetchRoomTypes();
// //     }
// //   }, []);

// //   // Check if user has admin privileges
// //   const isAdminUser = () => {
// //     return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
// //   };

// //   // Check if user is member
// //   const isMemberUser = () => {
// //     return userRole === 'MEMBER';
// //   };

// //   // Fetch room types from backend (admin only)
// //   const fetchRoomTypes = async () => {
// //     if (!isAdminUser()) {
// //       setError('Access denied. Admin privileges required.');
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setError(null);
// //       const types = await roomService.getRoomTypes();
// //       console.log("Fetched room types:", types);

// //       // Transform the data to match your existing structure
// //       const transformedTypes = types.map(type => ({
// //         id: type.id,
// //         name: type.type,
// //         screen: type.type.toLowerCase(),
// //         priceMember: type.priceMember,
// //         priceGuest: type.priceGuest,
// //       }));

// //       setRoomTypes(transformedTypes);
// //       if (transformedTypes.length > 0) {
// //         setActiveCategory(0);
// //       }
// //     } catch (err) {
// //       console.error('Error fetching room types:', err);
// //       setError(err.message);

// //       // Handle authentication errors
// //       if (err.message.includes('Authentication failed') || err.message.includes('No authentication token')) {
// //         Alert.alert(
// //           'Authentication Required',
// //           'Please login again to continue.',
// //           [
// //             {
// //               text: 'OK',
// //               onPress: () => navigation.navigate('LoginScr')
// //             }
// //           ]
// //         );
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Welcome effect based on user role
// //   useEffect(() => {
// //     if (userRole && showWelcome) {
// //       let welcomeMessage = '';
// //       let alertTitle = 'Welcome';

// //       switch (userRole) {
// //         case 'SUPER_ADMIN':
// //           welcomeMessage = `Hello Super Admin ${userName || ''}! 👑\n\nYou have full administrative privileges including room management.`;
// //           alertTitle = 'Super Admin Access';
// //           break;
// //         case 'ADMIN':
// //           welcomeMessage = `Hello Admin ${userName || ''}! ⚙️\n\nYou have administrative access to view and manage rooms.`;
// //           alertTitle = 'Admin Access';
// //           break;
// //         case 'MEMBER':
// //           welcomeMessage = `Welcome ${userName || ''}! 👤\n\nFor room bookings, please contact the administration.`;
// //           alertTitle = 'Member Access';
// //           break;
// //         default:
// //           welcomeMessage = `Welcome ${userName || 'User'}!`;
// //       }

// //       // Show alert after a short delay
// //       const timer = setTimeout(() => {
// //         Alert.alert(
// //           alertTitle, 
// //           welcomeMessage, 
// //           [
// //             { 
// //               text: 'Get Started', 
// //               onPress: () => {
// //                 console.log("✅ User dismissed welcome alert");
// //                 setShowWelcome(false);
// //               }
// //             }
// //           ]
// //         );
// //       }, 1000);

// //       return () => clearTimeout(timer);
// //     }
// //   }, [userRole, userName, showWelcome]);

// //   const getRoleDisplayName = () => {
// //     switch (userRole) {
// //       case 'SUPER_ADMIN': return 'Super Admin';
// //       case 'ADMIN': return 'Admin';
// //       case 'MEMBER': return 'Member';
// //       default: return 'Guest';
// //     }
// //   };

// //   const getRoleIcon = () => {
// //     switch (userRole) {
// //       case 'SUPER_ADMIN': return 'crown';
// //       case 'ADMIN': return 'shield-account';
// //       case 'MEMBER': return 'account';
// //       default: return 'account';
// //     }
// //   };

// //   const handleCategoryPress = (category, index) => {
// //     if (!isAdminUser()) {
// //       Alert.alert(
// //         'Access Denied',
// //         'Room management is only available for administrators.',
// //         [{ text: 'OK' }]
// //       );
// //       return;
// //     }

// //     setActiveCategory(index);
// //     navigation.navigate('details', { 
// //       roomType: category,
// //       userRole,
// //       userName 
// //     });
// //   };

// //   // Render different content based on user role
// //   const renderRoleSpecificContent = () => {
// //     if (!userRole) {
// //       return (
// //         <View style={styles.accessDeniedContainer}>
// //           <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
// //           <Text style={styles.accessDeniedTitle}>Access Denied</Text>
// //           <Text style={styles.accessDeniedText}>
// //             Please login to access room information.
// //           </Text>
// //           <TouchableOpacity 
// //             style={styles.loginButton} 
// //             onPress={() => navigation.navigate('LoginScr')}
// //           >
// //             <Text style={styles.loginButtonText}>Go to Login</Text>
// //           </TouchableOpacity>
// //         </View>
// //       );
// //     }

// //     if (isMemberUser()) {
// //       return (
// //         <View style={styles.memberContainer}>
// //           <Icon name="information-outline" size={50} color="#4CAF50" />
// //           <Text style={styles.memberTitle}>Member Access</Text>
// //           <Text style={styles.memberText}>
// //             For room bookings and availability, please contact the club administration or visit the reception desk.
// //           </Text>
// //           <View style={styles.contactInfo}>
// //             <Text style={styles.contactTitle}>Contact Information:</Text>
// //             <Text style={styles.contactItem}>📞 Reception: +92-XXX-XXXXXXX</Text>
// //             <Text style={styles.contactItem}>📧 Email: reception@club.com</Text>
// //             <Text style={styles.contactItem}>🕒 Hours: 24/7</Text>
// //           </View>
// //         </View>
// //       );
// //     }

// //     if (isAdminUser()) {
// //       // Admin users see the room management interface
// //       if (loading) {
// //         return (
// //           <View style={styles.loadingContainer}>
// //             <ActivityIndicator size="large" color="#b48a64" />
// //             <Text style={styles.loadingText}>Loading room types...</Text>
// //           </View>
// //         );
// //       }

// //       if (error) {
// //         return (
// //           <View style={styles.errorContainer}>
// //             <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
// //             <Text style={styles.errorText}>{error}</Text>
// //             <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
// //               <Text style={styles.retryText}>Retry</Text>
// //             </TouchableOpacity>
// //           </View>
// //         );
// //       }

// //       return (
// //         <>
// //           <Text style={styles.subHeading}>Room Categories</Text>

// //           {roomTypes.length > 0 ? (
// //             <View style={styles.categoryContainer}>
// //               {roomTypes.map((category, index) => (
// //                 <TouchableOpacity
// //                   key={category.id}
// //                   style={[
// //                     styles.categoryBtn,
// //                     index === activeCategory && styles.categoryBtnActive,
// //                   ]}
// //                   onPress={() => handleCategoryPress(category, index)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.categoryText,
// //                       index === activeCategory && styles.categoryTextActive,
// //                     ]}
// //                   >
// //                     {category.name}
// //                   </Text>
// //                   {category.priceMember && (
// //                     <Text style={styles.priceText}>
// //                       ${category.priceMember} (Member)
// //                     </Text>
// //                   )}
// //                 </TouchableOpacity>
// //               ))}
// //             </View>
// //           ) : (
// //             <View style={styles.noDataContainer}>
// //               <Text style={styles.noDataText}>No room types available</Text>
// //               <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
// //                 <Text style={styles.retryText}>Refresh</Text>
// //               </TouchableOpacity>
// //             </View>
// //           )}
// //         </>
// //       );
// //     }

// //     // Default fallback
// //     return (
// //       <View style={styles.accessDeniedContainer}>
// //         <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
// //         <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
// //         <Text style={styles.accessDeniedText}>
// //           Your current role does not have access to room management.
// //         </Text>
// //       </View>
// //     );
// //   };

// //   return (
// //     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
// //       {/* Header with User Info */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-left" size={24} color="#fff" />
// //         </TouchableOpacity>

// //         <View style={styles.headerInfo}>
// //           <Text style={styles.headerTitle}>Guest Room</Text>
// //           {userRole ? (
// //             <View style={styles.roleContainer}>
// //               <Icon name={getRoleIcon()} size={16} color="#fff" />
// //               <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
// //               {isAdminUser() && (
// //                 <Icon name="shield-check" size={14} color="#4CAF50" style={styles.adminBadge} />
// //               )}
// //             </View>
// //           ) : (
// //             <Text style={styles.noRole}>No Role Detected</Text>
// //           )}
// //         </View>

// //         <TouchableOpacity>
// //           <Icon name="bell-outline" size={24} color="#fff" />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Debug Info Section */}
// //       {isAdminUser() && (
// //         <View style={styles.debugSection}>
// //           <Text style={styles.debugTitle}>Admin Access:</Text>
// //           <Text style={styles.debugText}>Role: {userRole}</Text>
// //           <Text style={styles.debugText}>Status: {loading ? 'Loading...' : roomTypes.length + ' room types loaded'}</Text>
// //         </View>
// //       )}

// //       {/* Main Content Section */}
// //       <View style={styles.section}>
// //         <Text style={styles.sectionTitle}>Enjoy Your Stay With Us</Text>
// //         <Text style={styles.sectionDesc}>
// //           {isAdminUser() 
// //             ? "Manage room types and availability for club members and guests."
// //             : isMemberUser()
// //             ? "Experience our premium guest rooms with exclusive member benefits."
// //             : "Our guest rooms offer premium accommodations for your comfort."
// //           }
// //         </Text>
// //       </View>

// //       {/* Role-specific content */}
// //       {renderRoleSpecificContent()}

// //       {/* Features Section (Visible to all) */}
// //       <View style={styles.featuresSection}>
// //         <Text style={styles.featureTitle}>WHY OUR GUEST ROOMS</Text>
// //         <Text style={styles.featureSubtitle}>
// //           All club amenities available on check in.
// //         </Text>
// //         <View style={styles.featuresGrid}>
// //           {features.map((item, index) => (
// //             <View key={index} style={styles.featureItem}>
// //               <Icon name={item.icon} size={26} color="#a3875c" />
// //               <Text style={styles.featureText}>{item.label}</Text>
// //             </View>
// //           ))}
// //         </View>
// //       </View>

// //       {/* Policy Section (Visible to all) */}
// //       <View style={styles.policySection}>
// //         <Text style={styles.policyTitle}>Guest Room Policy</Text>

// //         <Text style={styles.policySub}>Timings</Text>
// //         <Text style={styles.bullet}>• Check in - 1400 hours</Text>
// //         <Text style={styles.bullet}>• Check out - 1200 Noon</Text>

// //         <Text style={styles.policySub}>You are requested to please</Text>
// //         <Text style={styles.bullet}>• Half day rent will be charged if late checkout.</Text>
// //         <Text style={styles.bullet}>• Clear bills before check out.</Text>
// //         <Text style={styles.bullet}>• Return key card during checkout.</Text>
// //         <Text style={styles.bullet}>
// //           • Switch off electrical appliances before leaving.
// //         </Text>
// //         <Text style={styles.bullet}>• Report issues to reception.</Text>

// //         <Text style={styles.policySub}>Don'ts</Text>
// //         <Text style={styles.bullet}>• No private music systems or irons.</Text>
// //         <Text style={styles.bullet}>
// //           • Pets are not allowed inside the club.
// //         </Text>
// //         <Text style={styles.bullet}>
// //           • More than 3 adults per room not allowed.
// //         </Text>

// //         <Text style={styles.policySub}>Misc</Text>
// //         <Text style={styles.bullet}>• Guests responsible for all breakage.</Text>
// //         <Text style={styles.bullet}>
// //           • Extra bedding on demand (₹400/night).
// //         </Text>
// //         <Text style={styles.bullet}>
// //           • Club not responsible for loss of valuables.
// //         </Text>
// //         <Text style={styles.bullet}>
// //           • Laundry and cleaning services available on payment.
// //         </Text>
// //       </View>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#fff" },
// //   header: {
// //     backgroundColor: "#b48a64",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 20,
// //     paddingVertical: 15,
// //     borderBottomLeftRadius: 20,
// //     borderBottomRightRadius: 20,
// //   },
// //   headerInfo: {
// //     alignItems: 'center',
// //   },
// //   headerTitle: { 
// //     color: "#fff", 
// //     fontSize: 18, 
// //     fontWeight: "bold",
// //     marginBottom: 2,
// //   },
// //   roleContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   userRole: {
// //     color: "#fff", 
// //     fontSize: 12,
// //     marginLeft: 4,
// //   },
// //   adminBadge: {
// //     marginLeft: 6,
// //   },
// //   noRole: {
// //     color: "#ff6b6b", 
// //     fontSize: 12,
// //     fontStyle: 'italic',
// //   },
// //   debugSection: {
// //     backgroundColor: '#e8f5e8',
// //     padding: 10,
// //     margin: 10,
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#4CAF50',
// //   },
// //   debugTitle: {
// //     fontWeight: 'bold',
// //     color: '#2E7D32',
// //     marginBottom: 5,
// //   },
// //   debugText: {
// //     fontSize: 12,
// //     color: '#555',
// //   },
// //   section: { padding: 20, alignItems: "center" },
// //   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
// //   sectionDesc: {
// //     textAlign: "center",
// //     color: "#555",
// //     backgroundColor: "#f9f3eb",
// //     padding: 12,
// //     borderRadius: 10,
// //   },
// //   subHeading: {
// //     fontSize: 16,
// //     fontWeight: "bold",
// //     marginLeft: 20,
// //     marginTop: 10,
// //     marginBottom: 10,
// //   },
// //   // Access denied styles
// //   accessDeniedContainer: {
// //     alignItems: 'center',
// //     padding: 30,
// //     margin: 20,
// //     backgroundColor: '#fff8f8',
// //     borderRadius: 15,
// //     borderWidth: 1,
// //     borderColor: '#ffcdd2',
// //   },
// //   accessDeniedTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#d32f2f',
// //     marginTop: 10,
// //     marginBottom: 10,
// //   },
// //   accessDeniedText: {
// //     textAlign: 'center',
// //     color: '#666',
// //     marginBottom: 20,
// //     lineHeight: 20,
// //   },
// //   // Member specific styles
// //   memberContainer: {
// //     alignItems: 'center',
// //     padding: 25,
// //     margin: 15,
// //     backgroundColor: '#f1f8e9',
// //     borderRadius: 15,
// //     borderWidth: 1,
// //     borderColor: '#c5e1a5',
// //   },
// //   memberTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#388e3c',
// //     marginTop: 10,
// //     marginBottom: 10,
// //   },
// //   memberText: {
// //     textAlign: 'center',
// //     color: '#555',
// //     marginBottom: 20,
// //     lineHeight: 20,
// //   },
// //   contactInfo: {
// //     width: '100%',
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     borderWidth: 1,
// //     borderColor: '#e0e0e0',
// //   },
// //   contactTitle: {
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   contactItem: {
// //     color: '#555',
// //     marginBottom: 5,
// //   },
// //   // Loading and error styles
// //   loadingContainer: {
// //     alignItems: 'center',
// //     padding: 40,
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     color: '#666',
// //   },
// //   errorContainer: {
// //     alignItems: 'center',
// //     padding: 30,
// //     margin: 15,
// //     backgroundColor: '#fff8f8',
// //     borderRadius: 15,
// //   },
// //   errorText: {
// //     textAlign: 'center',
// //     color: '#d32f2f',
// //     marginTop: 10,
// //     marginBottom: 20,
// //   },
// //   // Category styles
// //   categoryContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     marginVertical: 10,
// //     marginHorizontal: 20,
// //     flexWrap: 'wrap',
// //   },
// //   categoryBtn: {
// //     backgroundColor: "#d8c7aa",
// //     paddingVertical: 10,
// //     borderRadius: 10,
// //     width: 100,
// //     alignItems: "center",
// //     marginBottom: 10,
// //   },
// //   categoryBtnActive: { backgroundColor: "#b48a64" },
// //   categoryText: { fontSize: 16, color: "#444", fontWeight: "bold" },
// //   categoryTextActive: { color: "#fff", fontWeight: "bold" },
// //   priceText: {
// //     fontSize: 10,
// //     color: "#666",
// //     marginTop: 4,
// //     textAlign: 'center',
// //   },
// //   noDataContainer: {
// //     alignItems: 'center',
// //     padding: 20,
// //   },
// //   noDataText: {
// //     color: '#666',
// //     fontSize: 16,
// //     marginBottom: 15,
// //   },
// //   // Button styles
// //   retryButton: {
// //     backgroundColor: '#b48a64',
// //     paddingHorizontal: 20,
// //     paddingVertical: 10,
// //     borderRadius: 8,
// //   },
// //   retryText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //   },
// //   loginButton: {
// //     backgroundColor: '#b48a64',
// //     paddingHorizontal: 25,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //   },
// //   loginButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   // Features and policy styles (keep your existing ones)
// //   featuresSection: {
// //     backgroundColor: "#fff",
// //     marginHorizontal: 15,
// //     borderRadius: 15,
// //     padding: 20,
// //     marginTop: 10,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.1,
// //     shadowRadius: 5,
// //     elevation: 3,
// //   },
// //   featureTitle: { fontSize: 16, fontWeight: "bold", color: "#b48a64" },
// //   featureSubtitle: { color: "#666", marginBottom: 15 },
// //   featuresGrid: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     justifyContent: "space-between",
// //   },
// //   featureItem: {
// //     width: "30%",
// //     alignItems: "center",
// //     marginBottom: 20,
// //   },
// //   featureText: { fontSize: 13, color: "#555", marginTop: 5, textAlign: "center" },
// //   policySection: {
// //     backgroundColor: "#fff8f2",
// //     margin: 15,
// //     borderRadius: 15,
// //     padding: 20,
// //   },
// //   policyTitle: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     marginBottom: 10,
// //     textAlign: "center",
// //   },
// //   policySub: {
// //     fontWeight: "bold",
// //     color: "#b48a64",
// //     marginTop: 15,
// //     marginBottom: 5,
// //   },
// //   bullet: {
// //     color: "#444",
// //     fontSize: 14,
// //     marginLeft: 10,
// //     marginBottom: 5,
// //   },
// // });

// // screens/Home.js
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { roomService } from '../services/roomService';
// import { useAuth } from '../contexts/AuthContext';

// const features = [
//   { icon: "currency-usd", label: "Best Rate" },
//   { icon: "wifi", label: "WiFi" },
//   { icon: "washing-machine", label: "Laundry" },
//   { icon: "thermometer", label: "Temperature" },
//   { icon: "key", label: "Keyless Entry" },
//   { icon: "account-check-outline", label: "24/7 Reception" },
//   { icon: "parking", label: "Parking" },
//   { icon: "credit-card-outline", label: "E-Payment" },
//   { icon: "room-service-outline", label: "Room Service" },
//   { icon: "atm", label: "ATM" },
//   { icon: "account-group", label: "Club Facilities" }, 
// ];

// export default function home({ navigation }) {
//   const { user, isAuthenticated, logout } = useAuth();

//   // Use user from global auth context
//   const userRole = user?.role;
//   const userName = user?.name;
//   const userEmail = user?.email;

//   const [showWelcome, setShowWelcome] = useState(true);
//   const [roomTypes, setRoomTypes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [activeCategory, setActiveCategory] = useState(0);

//   // Check authentication on mount
//   useEffect(() => {
//     if (!isAuthenticated || !user) {
//       console.log('🚫 No authenticated user found in Home');
//       return;
//     }

//     console.log('🏠 Home mounted with user:', user);

//     if (isAdminUser()) {
//       fetchRoomTypes();
//     }
//   }, [isAuthenticated, user]);

//   // Check if user is admin
//   const isAdminUser = () => {
//     return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
//   };

//   // Check if user is member
//   const isMemberUser = () => {
//     return userRole === 'MEMBER';
//   };

//   // Fetch room types from backend (admin only)
//   const fetchRoomTypes = async () => {
//     if (!isAdminUser()) {
//       setError('Access denied. Admin privileges required.');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       const types = await roomService.getRoomTypes();
//       console.log("Fetched room types:", types);

//       // Transform the data to match your existing structure
//       const transformedTypes = types.map(type => ({
//         id: type.id,
//         name: type.type,
//         screen: type.type.toLowerCase(),
//         priceMember: type.priceMember,
//         priceGuest: type.priceGuest,
//       }));

//       setRoomTypes(transformedTypes);
//       if (transformedTypes.length > 0) {
//         setActiveCategory(0);
//       }
//     } catch (err) {
//       console.error('Error fetching room types:', err);
//       setError(err.message);

//       // Handle authentication errors
//       if (err.message.includes('Authentication failed') || err.message.includes('No authentication token')) {
//         Alert.alert(
//           'Authentication Required',
//           'Please login again to continue.',
//           [
//             {
//               text: 'OK',
//               onPress: () => navigation.navigate('LoginScr')
//             }
//           ]
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Welcome effect based on user role
//   useEffect(() => {
//     if (userRole && showWelcome && isAuthenticated) {
//       let welcomeMessage = '';
//       let alertTitle = 'Welcome';

//       switch (userRole) {
//         case 'SUPER_ADMIN':
//           welcomeMessage = `Hello Super Admin ${userName || ''}! 👑\n\nYou have full administrative privileges including room management.`;
//           alertTitle = 'Super Admin Access';
//           break;
//         case 'ADMIN':
//           welcomeMessage = `Hello Admin ${userName || ''}! ⚙️\n\nYou have administrative access to view and manage rooms.`;
//           alertTitle = 'Admin Access';
//           break;
//         case 'MEMBER':
//           welcomeMessage = `Welcome ${userName || ''}! 👤\n\nFor room bookings, please contact the administration.`;
//           alertTitle = 'Member Access';
//           break;
//         default:
//           welcomeMessage = `Welcome ${userName || 'User'}!`;
//       }

//       // Show alert after a short delay
//       const timer = setTimeout(() => {
//         Alert.alert(
//           alertTitle, 
//           welcomeMessage, 
//           [
//             { 
//               text: 'Get Started', 
//               onPress: () => {
//                 console.log("✅ User dismissed welcome alert");
//                 setShowWelcome(false);
//               }
//             }
//           ]
//         );
//       }, 1000);

//       return () => clearTimeout(timer);
//     }
//   }, [userRole, userName, showWelcome, isAuthenticated]);

//   const getRoleDisplayName = () => {
//     switch (userRole) {
//       case 'SUPER_ADMIN': return 'Super Admin';
//       case 'ADMIN': return 'Admin';
//       case 'MEMBER': return 'Member';
//       default: return 'Guest';
//     }
//   };

//   const getRoleIcon = () => {
//     switch (userRole) {
//       case 'SUPER_ADMIN': return 'crown';
//       case 'ADMIN': return 'shield-account';
//       case 'MEMBER': return 'account';
//       default: return 'account';
//     }
//   };

//   const handleCategoryPress = (category, index) => {
//     if (!isAdminUser()) {
//       Alert.alert(
//         'Access Denied',
//         'Room management is only available for administrators.',
//         [{ text: 'OK' }]
//       );
//       return;
//     }

//     setActiveCategory(index);
//     navigation.navigate('details', { 
//       roomType: category
//     });
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Logout', 
//           style: 'destructive',
//           onPress: async () => {
//             await logout();
//             navigation.navigate('LoginScr');
//           }
//         }
//       ]
//     );
//   };

//   // Render different content based on user role
//   const renderRoleSpecificContent = () => {
//     if (!userRole || !isAuthenticated) {
//       return (
//         <View style={styles.accessDeniedContainer}>
//           <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
//           <Text style={styles.accessDeniedTitle}>Authentication Required</Text>
//           <Text style={styles.accessDeniedText}>
//             Please login to access room information.
//           </Text>
//           <TouchableOpacity 
//             style={styles.loginButton} 
//             onPress={() => navigation.navigate('LoginScr')}
//           >
//             <Text style={styles.loginButtonText}>Go to Login</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     if (isMemberUser()) {
//       return (
//         <View style={styles.memberContainer}>
//           <Icon name="information-outline" size={50} color="#4CAF50" />
//           <Text style={styles.memberTitle}>Member Access</Text>
//           <Text style={styles.memberText}>
//             For room bookings and availability, please contact the club administration or visit the reception desk.
//           </Text>
//           <View style={styles.contactInfo}>
//             <Text style={styles.contactTitle}>Contact Information:</Text>
//             <Text style={styles.contactItem}>📞 Reception: +92-XXX-XXXXXXX</Text>
//             <Text style={styles.contactItem}>📧 Email: reception@club.com</Text>
//             <Text style={styles.contactItem}>🕒 Hours: 24/7</Text>
//           </View>
//         </View>
//       );
//     }

//     if (isAdminUser()) {
//       // Admin users see the room management interface
//       if (loading) {
//         return (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#b48a64" />
//             <Text style={styles.loadingText}>Loading room types...</Text>
//           </View>
//         );
//       }

//       if (error) {
//         return (
//           <View style={styles.errorContainer}>
//             <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
//               <Text style={styles.retryText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       }

//       return (
//         <>
//           <Text style={styles.subHeading}>Room Categories</Text>

//           {roomTypes.length > 0 ? (
//             <View style={styles.categoryContainer}>
//               {roomTypes.map((category, index) => (
//                 <TouchableOpacity
//                   key={category.id}
//                   style={[
//                     styles.categoryBtn,
//                     index === activeCategory && styles.categoryBtnActive,
//                   ]}
//                   onPress={() => handleCategoryPress(category, index)}
//                 >
//                   <Text
//                     style={[
//                       styles.categoryText,
//                       index === activeCategory && styles.categoryTextActive,
//                     ]}
//                   >
//                     {category.name}
//                   </Text>
//                   {category.priceMember && (
//                     <Text style={styles.priceText}>
//                       ${category.priceMember} (Member)
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ) : (
//             <View style={styles.noDataContainer}>
//               <Text style={styles.noDataText}>No room types available</Text>
//               <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
//                 <Text style={styles.retryText}>Refresh</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       );
//     }

//     // Default fallback
//     return (
//       <View style={styles.accessDeniedContainer}>
//         <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
//         <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
//         <Text style={styles.accessDeniedText}>
//           Your current role does not have access to room management.
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* Header with User Info */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={24} color="#fff" />
//         </TouchableOpacity>

//         <View style={styles.headerInfo}>
//           <Text style={styles.headerTitle}>Guest Room</Text>
//           {userRole ? (
//             <View style={styles.roleContainer}>
//               <Icon name={getRoleIcon()} size={16} color="#fff" />
//               <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
//               {isAdminUser() && (
//                 <Icon name="shield-check" size={14} color="#4CAF50" style={styles.adminBadge} />
//               )}
//             </View>
//           ) : (
//             <Text style={styles.noRole}>No Role Detected</Text>
//           )}
//         </View>

//         <TouchableOpacity onPress={handleLogout}>
//           <Icon name="logout" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Debug Info Section */}
//       {isAdminUser() && (
//         <View style={styles.debugSection}>
//           <Text style={styles.debugTitle}>Admin Access:</Text>
//           <Text style={styles.debugText}>Role: {userRole}</Text>
//           <Text style={styles.debugText}>Status: {loading ? 'Loading...' : roomTypes.length + ' room types loaded'}</Text>
//           <Text style={styles.debugText}>Auth: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Text>
//         </View>
//       )}

//       {/* Main Content Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Enjoy Your Stay With Us</Text>
//         <Text style={styles.sectionDesc}>
//           {isAdminUser() 
//             ? "Manage room types and availability for club members and guests."
//             : isMemberUser()
//             ? "Experience our premium guest rooms with exclusive member benefits."
//             : "Our guest rooms offer premium accommodations for your comfort."
//           }
//         </Text>
//       </View>

//       {/* Role-specific content */}
//       {renderRoleSpecificContent()}

//       {/* Features Section (Visible to all) */}
//       <View style={styles.featuresSection}>
//         <Text style={styles.featureTitle}>WHY OUR GUEST ROOMS</Text>
//         <Text style={styles.featureSubtitle}>
//           All club amenities available on check in.
//         </Text>
//         <View style={styles.featuresGrid}>
//           {features.map((item, index) => (
//             <View key={index} style={styles.featureItem}>
//               <Icon name={item.icon} size={26} color="#a3875c" />
//               <Text style={styles.featureText}>{item.label}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Policy Section (Visible to all) */}
//       <View style={styles.policySection}>
//         <Text style={styles.policyTitle}>Guest Room Policy</Text>

//         <Text style={styles.policySub}>Timings</Text>
//         <Text style={styles.bullet}>• Check in - 1400 hours</Text>
//         <Text style={styles.bullet}>• Check out - 1200 Noon</Text>

//         <Text style={styles.policySub}>You are requested to please</Text>
//         <Text style={styles.bullet}>• Half day rent will be charged if late checkout.</Text>
//         <Text style={styles.bullet}>• Clear bills before check out.</Text>
//         <Text style={styles.bullet}>• Return key card during checkout.</Text>
//         <Text style={styles.bullet}>
//           • Switch off electrical appliances before leaving.
//         </Text>
//         <Text style={styles.bullet}>• Report issues to reception.</Text>

//         <Text style={styles.policySub}>Don'ts</Text>
//         <Text style={styles.bullet}>• No private music systems or irons.</Text>
//         <Text style={styles.bullet}>
//           • Pets are not allowed inside the club.
//         </Text>
//         <Text style={styles.bullet}>
//           • More than 3 adults per room not allowed.
//         </Text>

//         <Text style={styles.policySub}>Misc</Text>
//         <Text style={styles.bullet}>• Guests responsible for all breakage.</Text>
//         <Text style={styles.bullet}>
//           • Extra bedding on demand (₹400/night).
//         </Text>
//         <Text style={styles.bullet}>
//           • Club not responsible for loss of valuables.
//         </Text>
//         <Text style={styles.bullet}>
//           • Laundry and cleaning services available on payment.
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     backgroundColor: "#b48a64",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   headerInfo: {
//     alignItems: 'center',
//   },
//   headerTitle: { 
//     color: "#fff", 
//     fontSize: 18, 
//     fontWeight: "bold",
//     marginBottom: 2,
//   },
//   roleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   userRole: {
//     color: "#fff", 
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   adminBadge: {
//     marginLeft: 6,
//   },
//   noRole: {
//     color: "#ff6b6b", 
//     fontSize: 12,
//     fontStyle: 'italic',
//   },
//   debugSection: {
//     backgroundColor: '#e8f5e8',
//     padding: 10,
//     margin: 10,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   debugTitle: {
//     fontWeight: 'bold',
//     color: '#2E7D32',
//     marginBottom: 5,
//   },
//   debugText: {
//     fontSize: 12,
//     color: '#555',
//   },
//   section: { padding: 20, alignItems: "center" },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
//   sectionDesc: {
//     textAlign: "center",
//     color: "#555",
//     backgroundColor: "#f9f3eb",
//     padding: 12,
//     borderRadius: 10,
//   },
//   subHeading: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginLeft: 20,
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   // Access denied styles
//   accessDeniedContainer: {
//     alignItems: 'center',
//     padding: 30,
//     margin: 20,
//     backgroundColor: '#fff8f8',
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#ffcdd2',
//   },
//   accessDeniedTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#d32f2f',
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   accessDeniedText: {
//     textAlign: 'center',
//     color: '#666',
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   // Member specific styles
//   memberContainer: {
//     alignItems: 'center',
//     padding: 25,
//     margin: 15,
//     backgroundColor: '#f1f8e9',
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: '#c5e1a5',
//   },
//   memberTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#388e3c',
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   memberText: {
//     textAlign: 'center',
//     color: '#555',
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   contactInfo: {
//     width: '100%',
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   contactTitle: {
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   contactItem: {
//     color: '#555',
//     marginBottom: 5,
//   },
//   // Loading and error styles
//   loadingContainer: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//   },
//   errorContainer: {
//     alignItems: 'center',
//     padding: 30,
//     margin: 15,
//     backgroundColor: '#fff8f8',
//     borderRadius: 15,
//   },
//   errorText: {
//     textAlign: 'center',
//     color: '#d32f2f',
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   // Category styles
//   categoryContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginVertical: 10,
//     marginHorizontal: 20,
//     flexWrap: 'wrap',
//   },
//   categoryBtn: {
//     backgroundColor: "#d8c7aa",
//     paddingVertical: 10,
//     borderRadius: 10,
//     width: 100,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   categoryBtnActive: { backgroundColor: "#b48a64" },
//   categoryText: { fontSize: 16, color: "#444", fontWeight: "bold" },
//   categoryTextActive: { color: "#fff", fontWeight: "bold" },
//   priceText: {
//     fontSize: 10,
//     color: "#666",
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   noDataContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   noDataText: {
//     color: '#666',
//     fontSize: 16,
//     marginBottom: 15,
//   },
//   // Button styles
//   retryButton: {
//     backgroundColor: '#b48a64',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   loginButton: {
//     backgroundColor: '#b48a64',
//     paddingHorizontal: 25,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   // Features and policy styles
//   featuresSection: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     borderRadius: 15,
//     padding: 20,
//     marginTop: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   featureTitle: { fontSize: 16, fontWeight: "bold", color: "#b48a64" },
//   featureSubtitle: { color: "#666", marginBottom: 15 },
//   featuresGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   featureItem: {
//     width: "30%",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   featureText: { fontSize: 13, color: "#555", marginTop: 5, textAlign: "center" },
//   policySection: {
//     backgroundColor: "#fff8f2",
//     margin: 15,
//     borderRadius: 15,
//     padding: 20,
//   },
//   policyTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   policySub: {
//     fontWeight: "bold",
//     color: "#b48a64",
//     marginTop: 15,
//     marginBottom: 5,
//   },
//   bullet: {
//     color: "#444",
//     fontSize: 14,
//     marginLeft: 10,
//     marginBottom: 5,
//   },
// });

// screens/Home.js

//2nd
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { roomService } from '../../services/roomService';
import { useAuth } from '../auth/contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

const features = [
  { icon: "currency-usd", label: "Best Rate" },
  { icon: "wifi", label: "WiFi" },
  { icon: "washing-machine", label: "Laundry" },
  { icon: "thermometer", label: "Temperature" },
  { icon: "key", label: "Keyless Entry" },
  { icon: "account-check-outline", label: "24/7 Reception" },
  { icon: "parking", label: "Parking" },
  { icon: "credit-card-outline", label: "E-Payment" },
  { icon: "room-service-outline", label: "Room Service" },
  { icon: "atm", label: "ATM" },
  { icon: "account-group", label: "Club Facilities" },
];

export default function home({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();

  const userRole = user?.role;
  const userName = user?.name;

  const [showWelcome, setShowWelcome] = useState(true);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    console.log('🏠 Home Screen - Auth Status:', {
      isAuthenticated,
      userRole,
      userName
    });

    if (isAuthenticated) {
      fetchRoomTypes();
    } else {
      setError('Please login to access room information');
    }
  }, [isAuthenticated]);

  // Check if user is admin
  const isAdminUser = () => {
    return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  };

  // Check if user is member
  const isMemberUser = () => {
    return userRole === 'MEMBER';
  };

  // Fetch room types from backend (available for all authenticated users)
  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching room types for user:', userRole);
      const types = await roomService.getRoomTypes();
      console.log("✅ Fetched room types:", types);

      if (types && Array.isArray(types)) {
        // Transform the data with images
        const transformedTypes = types.map(type => ({
          id: type.id,
          name: type.type,
          screen: 'details', // Navigate to RoomDetailsScreen
          priceMember: type.priceMember,
          priceGuest: type.priceGuest,
          images: type.images || [], // Include images from API
          description: `Premium ${type.type} accommodation`, // You can customize this
          originalData: type
        }));

        setRoomTypes(transformedTypes);
        if (transformedTypes.length > 0) {
          setActiveCategory(0);
        }
      } else {
        setRoomTypes([]);
      }
    } catch (err) {
      console.error('❌ Error fetching room types:', err);
      const errorMessage = err.message || 'Failed to load room types';
      setError(errorMessage);

      if (errorMessage.includes('Authentication failed') ||
        errorMessage.includes('No authentication token') ||
        errorMessage.includes('401')) {
        // Clear auth state and reset navigation stack
        await logout();
        Alert.alert(
          'Session Expired',
          'Please login again to continue.',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScr' }],
              })
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoomTypes();
    setRefreshing(false);
  };

  // Welcome effect based on user role
  useEffect(() => {
    if (userRole && showWelcome && isAuthenticated) {
      let welcomeMessage = '';
      let alertTitle = 'Welcome';

      switch (userRole) {
        case 'SUPER_ADMIN':
          welcomeMessage = `Hello Super Admin ${userName || ''}! 👑\n\nYou have full administrative privileges.`;
          alertTitle = 'Super Admin Access';
          break;
        case 'ADMIN':
          welcomeMessage = `Hello Admin ${userName || ''}! ⚙️\n\nYou have administrative access.`;
          alertTitle = 'Admin Access';
          break;
        case 'MEMBER':
          welcomeMessage = `Welcome ${userName || ''}! 👤\n\nBrowse our available room types.`;
          alertTitle = 'Member Access';
          break;
        default:
          welcomeMessage = `Welcome ${userName || 'User'}!`;
      }

      const timer = setTimeout(() => {
        Alert.alert(
          alertTitle,
          welcomeMessage,
          [
            {
              text: 'Get Started',
              onPress: () => setShowWelcome(false)
            }
          ]
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userRole, userName, showWelcome, isAuthenticated]);

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'MEMBER': return 'Member';
      default: return 'Guest';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'SUPER_ADMIN': return 'crown';
      case 'ADMIN': return 'shield-account';
      case 'MEMBER': return 'account';
      default: return 'account';
    }
  };

  const handleCategoryPress = (category, index) => {
    setActiveCategory(index);
    // Navigate to RoomDetailsScreen with the room type data
    navigation.navigate('details', {
      roomType: category
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScr' }],
            });
          }
        }
      ]
    );
  };

  // Render room card with image
  const renderRoomCard = (category, index) => {
    const hasImages = category.images && category.images.length > 0;
    const firstImage = hasImages ? category.images[0] : null;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.roomCard,
          index === activeCategory && styles.roomCardActive,
        ]}
        onPress={() => handleCategoryPress(category, index)}
      >
        {/* Room Image */}
        <View style={styles.imageContainer}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage.url }}
              style={styles.roomImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Icon name="image-off" size={40} color="#ccc" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
        </View>

        {/* Room Info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {category.name}
          </Text>

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
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color="#b48a64" />
          </View>
        </View>

        {/* Active Indicator */}
        {index === activeCategory && (
          <View style={styles.activeIndicator}>
            <Icon name="check-circle" size={20} color="#b48a64" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render room types for all users
  const renderRoomTypes = () => {
    if (loading && roomTypes.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b48a64" />
          <Text style={styles.loadingText}>Loading room types...</Text>
        </View>
      );
    }

    if (error && roomTypes.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (roomTypes.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name="image-off-outline" size={50} color="#999" />
          <Text style={styles.noDataText}>No room types available</Text>
          <Text style={styles.noDataSubtext}>
            Room types will appear here once added
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRoomTypes}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Room Types</Text>
          <Text style={styles.sectionSubtitle}>
            {roomTypes.length} type{roomTypes.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roomTypesScroll}
          contentContainerStyle={styles.roomTypesContainer}
        >
          {roomTypes.map((category, index) => renderRoomCard(category, index))}
        </ScrollView>
      </>
    );
  };

  // Render content based on authentication
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.accessDeniedContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.accessDeniedTitle}>Authentication Required</Text>
          <Text style={styles.accessDeniedText}>
            Please login to access room information.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScr' }],
            })}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return renderRoomTypes();
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#b48a64']}
          tintColor={'#b48a64'}
        />
      }
    >
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Guest Rooms</Text>
          {userRole ? (
            <View style={styles.roleContainer}>
              <Icon name={getRoleIcon()} size={16} color="#fff" />
              <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
              {isAdminUser() && (
                <Icon name="shield-check" size={14} color="#4CAF50" style={styles.adminBadge} />
              )}
            </View>
          ) : (
            <Text style={styles.noRole}>Not Logged In</Text>
          )}
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View> */}
      {/* Image-based Notch Header */}
      <ImageBackground
        source={require('../../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('start')}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Guest Room</Text>
            {userRole ? (
              <View style={styles.roleContainer}>
                <Icon name={getRoleIcon()} size={14} color="#000" />
                <Text style={styles.userRole}>{getRoleDisplayName()}</Text>
                {isAdminUser() && (
                  <Icon name="shield-check" size={12} color="#4CAF50" style={styles.adminBadge} />
                )}
              </View>
            ) : (
              <Text style={styles.noRole}>Not Logged In</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {/* Add notification handler */ }}
            activeOpacity={0.7}
          >
            <Icon name="bell" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Enjoy Your Stay With Us</Text>
        <Text style={styles.welcomeText}>
          {isAdminUser()
            ? "Manage and browse all available room types for club members and guests."
            : isMemberUser()
              ? "Discover our premium guest rooms with exclusive member benefits and pricing."
              : "Explore our comfortable and well-equipped guest rooms for your perfect stay."
          }
        </Text>
      </View>

      {/* Room Types Section */}
      {renderContent()}

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.featureTitle}>WHY OUR GUEST ROOMS</Text>
        <Text style={styles.featureSubtitle}>
          All club activities available on check in.
        </Text>
        <View style={styles.featuresGrid}>
          {features.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconBox}>
                <Icon name={item.icon} size={32} color="#b8976d" />
              </View>
              <Text style={styles.featureText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Policy Section */}
      <View style={styles.policySection}>
        <Text style={styles.policyTitle}>Guest Room Policy</Text>

        <Text style={styles.policySub}>Timings</Text>
        <Text style={styles.bullet}>• Check in - 1400 hours</Text>
        <Text style={styles.bullet}>• Check out - 1200 Noon</Text>

        <Text style={styles.policySub}>You are requested to please</Text>
        <Text style={styles.bullet}>• Half day rent will be charged if late checkout.</Text>
        <Text style={styles.bullet}>• Clear bills before check out.</Text>
        <Text style={styles.bullet}>• Return key card during checkout.</Text>
        <Text style={styles.bullet}>• Switch off electrical appliances before leaving.</Text>
        <Text style={styles.bullet}>• Report issues to reception.</Text>

        <Text style={styles.policySub}>Don'ts</Text>
        <Text style={styles.bullet}>• No private music systems or irons.</Text>
        <Text style={styles.bullet}>• Pets are not allowed inside the club.</Text>
        <Text style={styles.bullet}>• More than 3 adults per room not allowed.</Text>

        <Text style={styles.policySub}>Misc</Text>
        <Text style={styles.bullet}>• Guests responsible for all breakage.</Text>
        <Text style={styles.bullet}>• Extra bedding on demand.</Text>
        <Text style={styles.bullet}>• Club not responsible for loss of valuables.</Text>
        <Text style={styles.bullet}>• Laundry and cleaning services available on payment.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF9F3"
  },
  header: {
    backgroundColor: "#b48a64",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 140,
  },
  notchImage: {
    resizeMode: 'cover',
  },
  notchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: "#000",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    color: "#000",
    fontSize: 12,
    marginLeft: 4,
  },
  adminBadge: {
    marginLeft: 6,
  },
  noRole: {
    color: "#ff6b6b",
    fontSize: 12,
    fontStyle: 'italic',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    color: "black",
    fontSize: 12,
    marginLeft: 4,
  },
  adminBadge: {
    marginLeft: 6,
  },
  noRole: {
    color: "#ff6b6b",
    fontSize: 12,
    fontStyle: 'italic',
  },
  welcomeSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f3eb",
    margin: 15,
    borderRadius: 15,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: '#333',
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
  // Room Types Scroll
  roomTypesScroll: {
    marginBottom: 20,
  },
  roomTypesContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  // Room Card
  roomCard: {
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
  roomCardActive: {
    borderColor: '#b48a64',
    borderWidth: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  roomImage: {
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
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
  },
  roomInfo: {
    padding: 15,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#f8f3eb',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8d9c3',
  },
  viewDetailsText: {
    color: '#b48a64',
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
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  // Access denied styles
  accessDeniedContainer: {
    alignItems: 'center',
    padding: 30,
    margin: 20,
    backgroundColor: '#fff8f8',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 10,
    marginBottom: 10,
  },
  accessDeniedText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  // Button styles
  retryButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Features and policy styles
  // Features and policy styles
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
    width: 80,
    height: 80,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#b8976d",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
    fontWeight: "500",
  },
  policySection: {
    backgroundColor: "#fff8f2",
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
  },
  policySub: {
    fontWeight: "bold",
    color: "#b48a64",
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