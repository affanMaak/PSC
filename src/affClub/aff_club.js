// // // //ATIF ERROR THEK KREGA REQUESTED DATA WALA USKE BAAD YEH CODE HOGA 
// // // import React, { useState, useEffect } from 'react';
// // // import {
// // //   SafeAreaView,
// // //   StyleSheet,
// // //   Text,
// // //   View,
// // //   StatusBar,
// // //   ScrollView,
// // //   TouchableOpacity,
// // //   ImageBackground,
// // //   Modal,
// // //   TextInput,
// // //   Alert,
// // //   ActivityIndicator,
// // //   Platform,
// // // } from 'react-native';
// // // import DateTimePicker from '@react-native-community/datetimepicker';
// // // import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../config/apis';

// // // const aff_club = () => {
// // //   const [modalVisible, setModalVisible] = useState(false);
// // //   const [selectedClub, setSelectedClub] = useState(null);
// // //   const [clubs, setClubs] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [clubsLoading, setClubsLoading] = useState(true);
// // //   const [showDatePicker, setShowDatePicker] = useState(false);

// // //   // Form state
// // //   const [visitDate, setVisitDate] = useState(new Date());
// // //   const [guestCount, setGuestCount] = useState('');
// // //   const [purpose, setPurpose] = useState('');
// // //   const [memberId, setMemberId] = useState('');
// // //   const [userProfile, setUserProfile] = useState(null);

// // //   useEffect(() => {
// // //     fetchUserProfile();
// // //     fetchAffiliatedClubs();
// // //   }, []);

// // //   const fetchUserProfile = async () => {
// // //     try {
// // //       const profile = await getUserData();
// // //       setUserProfile(profile);
// // //       // Extract member ID from profile - adjust based on your API response structure
// // //       setMemberId(profile.membershipNumber || profile.memberId || profile.id || '');
// // //     } catch (error) {
// // //       console.log('Error fetching user profile:', error);
// // //       Alert.alert('Error', 'Failed to load user information');
// // //     }
// // //   };

// // //   const fetchAffiliatedClubs = async () => {
// // //     try {
// // //       setClubsLoading(true);
// // //       const clubsData = await getAffiliatedClubs();
// // //       // Filter only active clubs if needed
// // //       const activeClubs = clubsData.filter(club => club.isActive !== false);
// // //       setClubs(activeClubs);
// // //     } catch (error) {
// // //       console.log('Error fetching clubs:', error);
// // //       Alert.alert('Error', 'Failed to load clubs. Please try again.');
// // //     } finally {
// // //       setClubsLoading(false);
// // //     }
// // //   };

// // //   const openVisitModal = (club) => {
// // //     setSelectedClub(club);
// // //     // Reset form fields
// // //     setVisitDate(new Date());
// // //     setGuestCount('');
// // //     setPurpose('');
// // //     setModalVisible(true);
// // //   };

// // //   const handleDateChange = (event, selectedDate) => {
// // //     setShowDatePicker(Platform.OS === 'ios');
// // //     if (selectedDate) {
// // //       setVisitDate(selectedDate);
// // //     }
// // //   };

// // //   const formatDate = (date) => {
// // //     return date.toLocaleDateString('en-US', {
// // //       year: 'numeric',
// // //       month: 'long',
// // //       day: 'numeric',
// // //     });
// // //   };

// // //   const handleSendVisitRequest = async () => {
// // //     // Validation
// // //     if (!memberId.trim()) {
// // //       Alert.alert('Error', 'Member ID is required');
// // //       return;
// // //     }

// // //     if (!visitDate) {
// // //       Alert.alert('Error', 'Please select a visit date');
// // //       return;
// // //     }

// // //     if (guestCount && (parseInt(guestCount) < 0 || parseInt(guestCount) > 10)) {
// // //       Alert.alert('Error', 'Guest count must be between 0 and 10');
// // //       return;
// // //     }

// // //     setLoading(true);

// // //     try {
// // //       const requestData = {
// // //         affiliatedClubId: selectedClub.id,
// // //         membershipNo: memberId,
// // //         requestedDate: visitDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
// // //         guestCount: guestCount ? parseInt(guestCount) : 0,
// // //         purpose: purpose || undefined,
// // //       };

// // //       const response = await createAffiliatedClubRequest(requestData);

// // //       Alert.alert(
// // //         'Success', 
// // //         'Visit request submitted successfully!',
// // //         [
// // //           {
// // //             text: 'OK',
// // //             onPress: () => {
// // //               setModalVisible(false);
// // //               // Clear form
// // //               setGuestCount('');
// // //               setPurpose('');
// // //             }
// // //           }
// // //         ]
// // //       );

// // //     } catch (error) {
// // //       console.log('Error submitting request:', error);
// // //       Alert.alert(
// // //         'Error',
// // //         error.message || 'Failed to submit visit request. Please try again.'
// // //       );
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const renderClubs = () => {
// // //     if (clubsLoading) {
// // //       return (
// // //         <View style={styles.loadingContainer}>
// // //           <ActivityIndicator size="large" color="#A3834C" />
// // //           <Text style={styles.loadingText}>Loading clubs...</Text>
// // //         </View>
// // //       );
// // //     }

// // //     if (clubs.length === 0) {
// // //       return (
// // //         <View style={styles.emptyContainer}>
// // //           <Text style={styles.emptyText}>No affiliated clubs available</Text>
// // //         </View>
// // //       );
// // //     }

// // //     return clubs.map((club, index) => (
// // //       <View key={club.id || index} style={styles.card}>
// // //         <Text style={styles.clubName}>{club.name}</Text>

// // //         {club.location && (
// // //           <Text style={styles.clubAddress}>• {club.location}</Text>
// // //         )}

// // //         {club.address && (
// // //           <Text style={styles.clubAddress}>• {club.address}</Text>
// // //         )}

// // //         {club.contactNo && (
// // //           <Text style={styles.clubContact}>• {club.contactNo}</Text>
// // //         )}

// // //         {club.description && (
// // //           <Text style={styles.clubDescription}>{club.description}</Text>
// // //         )}

// // //         <TouchableOpacity
// // //           style={styles.visitButton}
// // //           onPress={() => openVisitModal(club)}>
// // //           <Text style={styles.visitButtonText}>Request Visit</Text>
// // //         </TouchableOpacity>
// // //       </View>
// // //     ));
// // //   };

// // //   return (
// // //     <>
// // //       <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
// // //       <View style={styles.container}>
// // //         {/* Header */}
// // //         <ImageBackground
// // //           source={require('../assets/logo.jpeg')}
// // //           style={styles.notch}
// // //           imageStyle={styles.notchImage}>
// // //           <Text style={styles.ctext}>Affiliated Clubs</Text>
// // //         </ImageBackground>

// // //         <SafeAreaView style={styles.safeArea}>
// // //           <ScrollView
// // //             style={styles.scrollView}
// // //             contentContainerStyle={styles.scrollContent}
// // //             showsVerticalScrollIndicator={false}>
// // //             <Text style={styles.mainHeading}>Available Clubs</Text>
// // //             {renderClubs()}
// // //           </ScrollView>
// // //         </SafeAreaView>

// // //         {/* Visit Request Modal */}
// // //         <Modal
// // //           animationType="slide"
// // //           transparent={true}
// // //           visible={modalVisible}
// // //           onRequestClose={() => setModalVisible(false)}>
// // //           <View style={styles.modalOverlay}>
// // //             <ScrollView contentContainerStyle={styles.modalScrollContent}>
// // //               <View style={styles.modalView}>
// // //                 <Text style={styles.modalTitle}>
// // //                   Visit Request - {selectedClub?.name}
// // //                 </Text>

// // //                 {/* Member ID (Auto-filled but editable) */}
// // //                 <View style={styles.inputContainer}>
// // //                   <Text style={styles.inputLabel}>Member ID</Text>
// // //                   <TextInput
// // //                     value={memberId}
// // //                     onChangeText={setMemberId}
// // //                     style={styles.input}
// // //                     placeholderTextColor="#888"
// // //                     editable={true}
// // //                   />
// // //                 </View>

// // //                 {/* Visit Date Picker */}
// // //                 <View style={styles.inputContainer}>
// // //                   <Text style={styles.inputLabel}>Visit Date</Text>
// // //                   <TouchableOpacity
// // //                     style={styles.datePickerButton}
// // //                     onPress={() => setShowDatePicker(true)}>
// // //                     <Text style={styles.dateText}>
// // //                       {formatDate(visitDate)}
// // //                     </Text>
// // //                   </TouchableOpacity>
// // //                 </View>

// // //                 {/* Date Picker */}
// // //                 {showDatePicker && (
// // //                   <DateTimePicker
// // //                     value={visitDate}
// // //                     mode="date"
// // //                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
// // //                     onChange={handleDateChange}
// // //                     minimumDate={new Date()}
// // //                     style={styles.datePicker}
// // //                   />
// // //                 )}

// // //                 {/* Number of Guests */}
// // //                 <View style={styles.inputContainer}>
// // //                   <Text style={styles.inputLabel}>Number of Guests</Text>
// // //                   <TextInput
// // //                     placeholder="0"
// // //                     value={guestCount}
// // //                     onChangeText={(text) => {
// // //                       // Allow only numbers
// // //                       if (text === '' || /^\d+$/.test(text)) {
// // //                         setGuestCount(text);
// // //                       }
// // //                     }}
// // //                     style={styles.input}
// // //                     placeholderTextColor="#888"
// // //                     keyboardType="numeric"
// // //                     maxLength={2}
// // //                   />
// // //                 </View>

// // //                 {/* Purpose/Reason */}
// // //                 <View style={styles.inputContainer}>
// // //                   <Text style={styles.inputLabel}>Purpose/Reason (Optional)</Text>
// // //                   <TextInput
// // //                     placeholder="Enter purpose of visit..."
// // //                     value={purpose}
// // //                     onChangeText={setPurpose}
// // //                     style={[styles.input, styles.textArea]}
// // //                     placeholderTextColor="#888"
// // //                     multiline={true}
// // //                     numberOfLines={4}
// // //                     textAlignVertical="top"
// // //                   />
// // //                 </View>

// // //                 {/* Club Info Summary */}
// // //                 {selectedClub && (
// // //                   <View style={styles.clubInfoSummary}>
// // //                     <Text style={styles.summaryTitle}>Club Information:</Text>
// // //                     <Text style={styles.summaryText}>
// // //                       <Text style={styles.summaryLabel}>Name: </Text>
// // //                       {selectedClub.name}
// // //                     </Text>
// // //                     {selectedClub.location && (
// // //                       <Text style={styles.summaryText}>
// // //                         <Text style={styles.summaryLabel}>Location: </Text>
// // //                         {selectedClub.location}
// // //                       </Text>
// // //                     )}
// // //                     {selectedClub.contactNo && (
// // //                       <Text style={styles.summaryText}>
// // //                         <Text style={styles.summaryLabel}>Contact: </Text>
// // //                         {selectedClub.contactNo}
// // //                       </Text>
// // //                     )}
// // //                   </View>
// // //                 )}

// // //                 {/* Action Buttons */}
// // //                 <View style={styles.modalButtons}>
// // //                   <TouchableOpacity
// // //                     style={[styles.modalBtn, styles.cancelBtn]}
// // //                     onPress={() => setModalVisible(false)}
// // //                     disabled={loading}>
// // //                     <Text style={styles.modalBtnText}>Cancel</Text>
// // //                   </TouchableOpacity>

// // //                   <TouchableOpacity
// // //                     style={[styles.modalBtn, styles.sendBtn]}
// // //                     onPress={handleSendVisitRequest}
// // //                     disabled={loading}>
// // //                     {loading ? (
// // //                       <ActivityIndicator size="small" color="#fff" />
// // //                     ) : (
// // //                       <Text style={styles.modalBtnText}>Submit Request</Text>
// // //                     )}
// // //                   </TouchableOpacity>
// // //                 </View>
// // //               </View>
// // //             </ScrollView>
// // //           </View>
// // //         </Modal>
// // //       </View>
// // //     </>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: { 
// // //     flex: 1, 
// // //     backgroundColor: '#F5F5F5' 
// // //   },
// // //   notch: {
// // //     paddingTop: 60,
// // //     paddingBottom: 20,
// // //     borderBottomEndRadius: 30,
// // //     borderBottomStartRadius: 30,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   notchImage: { 
// // //     resizeMode: 'cover' 
// // //   },
// // //   ctext: { 
// // //     fontSize: 25, 
// // //     fontWeight: 'bold', 
// // //     color: '#000000' 
// // //   },
// // //   safeArea: { 
// // //     flex: 1 
// // //   },
// // //   scrollView: { 
// // //     flex: 1 
// // //   },
// // //   scrollContent: { 
// // //     paddingVertical: 20, 
// // //     paddingHorizontal: 20 
// // //   },
// // //   mainHeading: {
// // //     textAlign: 'center',
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     marginBottom: 20,
// // //     color: '#000',
// // //   },
// // //   loadingContainer: {
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     padding: 40,
// // //   },
// // //   loadingText: {
// // //     marginTop: 10,
// // //     color: '#666',
// // //     fontSize: 16,
// // //   },
// // //   emptyContainer: {
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     padding: 40,
// // //   },
// // //   emptyText: {
// // //     fontSize: 16,
// // //     color: '#666',
// // //     textAlign: 'center',
// // //   },
// // //   card: {
// // //     backgroundColor: '#f1e3dcff',
// // //     borderRadius: 15,
// // //     padding: 20,
// // //     marginBottom: 15,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3.84,
// // //     elevation: 5,
// // //   },
// // //   clubName: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#A3834C',
// // //     marginBottom: 8,
// // //   },
// // //   clubAddress: { 
// // //     fontSize: 14, 
// // //     color: '#333', 
// // //     marginBottom: 4 
// // //   },
// // //   clubContact: { 
// // //     fontSize: 14, 
// // //     color: '#333', 
// // //     marginBottom: 4 
// // //   },
// // //   clubDescription: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     fontStyle: 'italic',
// // //     marginTop: 8,
// // //     marginBottom: 12,
// // //   },
// // //   visitButton: {
// // //     marginTop: 10,
// // //     alignSelf: 'flex-start',
// // //     backgroundColor: '#A3834C',
// // //     paddingVertical: 10,
// // //     paddingHorizontal: 20,
// // //     borderRadius: 10,
// // //   },
// // //   visitButtonText: { 
// // //     color: '#fff', 
// // //     fontWeight: 'bold', 
// // //     fontSize: 16 
// // //   },
// // //   // Modal styles
// // //   modalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // //     justifyContent: 'center',
// // //   },
// // //   modalScrollContent: {
// // //     flexGrow: 1,
// // //     justifyContent: 'center',
// // //     padding: 20,
// // //   },
// // //   modalView: {
// // //     backgroundColor: '#fff',
// // //     borderRadius: 15,
// // //     padding: 20,
// // //     elevation: 10,
// // //   },
// // //   modalTitle: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     color: '#A3834C',
// // //     marginBottom: 20,
// // //     textAlign: 'center',
// // //   },
// // //   inputContainer: {
// // //     marginBottom: 15,
// // //   },
// // //   inputLabel: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 5,
// // //   },
// // //   input: {
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 10,
// // //     padding: 12,
// // //     fontSize: 16,
// // //     backgroundColor: '#f9f9f9',
// // //   },
// // //   textArea: {
// // //     minHeight: 100,
// // //     textAlignVertical: 'top',
// // //   },
// // //   datePickerButton: {
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 10,
// // //     padding: 12,
// // //     backgroundColor: '#f9f9f9',
// // //   },
// // //   dateText: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //   },
// // //   datePicker: {
// // //     marginVertical: 10,
// // //   },
// // //   clubInfoSummary: {
// // //     backgroundColor: '#f8f9fa',
// // //     borderRadius: 10,
// // //     padding: 15,
// // //     marginVertical: 15,
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#A3834C',
// // //   },
// // //   summaryTitle: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 8,
// // //   },
// // //   summaryText: {
// // //     fontSize: 14,
// // //     color: '#555',
// // //     marginBottom: 4,
// // //   },
// // //   summaryLabel: {
// // //     fontWeight: '600',
// // //   },
// // //   modalButtons: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     marginTop: 10,
// // //   },
// // //   modalBtn: {
// // //     flex: 1,
// // //     marginHorizontal: 5,
// // //     borderRadius: 10,
// // //     paddingVertical: 12,
// // //     alignItems: 'center',
// // //   },
// // //   cancelBtn: { 
// // //     backgroundColor: '#6c757d' 
// // //   },
// // //   sendBtn: { 
// // //     backgroundColor: '#A3834C' 
// // //   },
// // //   modalBtnText: { 
// // //     color: '#fff', 
// // //     fontWeight: 'bold', 
// // //     fontSize: 16 
// // //   },
// // // });

// // // export default aff_club;

// // import React, { useState, useEffect } from 'react';
// // import {
// //   SafeAreaView,
// //   StyleSheet,
// //   Text,
// //   View,
// //   StatusBar,
// //   ScrollView,
// //   TouchableOpacity,
// //   ImageBackground,
// //   Modal,
// //   TextInput,
// //   Alert,
// //   ActivityIndicator,
// // } from 'react-native';
// // import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../../config/apis';

// // const aff_club = () => {
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [selectedClub, setSelectedClub] = useState(null);
// //   const [clubs, setClubs] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [clubsLoading, setClubsLoading] = useState(true);

// //   // Form state (removed visitDate and showDatePicker)
// //   const [guestCount, setGuestCount] = useState('');
// //   const [purpose, setPurpose] = useState('');
// //   const [memberId, setMemberId] = useState('');
// //   const [userProfile, setUserProfile] = useState(null);

// //   useEffect(() => {
// //     fetchUserProfile();
// //     fetchAffiliatedClubs();
// //   }, []);

// //   const fetchUserProfile = async () => {
// //     try {
// //       const profile = await getUserData();
// //       setUserProfile(profile);
// //       // Extract member ID from profile - adjust based on your API response structure
// //       setMemberId(profile.membershipNumber || profile.memberId || profile.id || '');
// //     } catch (error) {
// //       console.log('Error fetching user profile:', error);
// //       Alert.alert('Error', 'Failed to load user information');
// //     }
// //   };

// //   const fetchAffiliatedClubs = async () => {
// //     try {
// //       setClubsLoading(true);
// //       const clubsData = await getAffiliatedClubs();
// //       // Filter only active clubs if needed
// //       const activeClubs = clubsData.filter(club => club.isActive !== false);
// //       setClubs(activeClubs);
// //     } catch (error) {
// //       console.log('Error fetching clubs:', error);
// //       Alert.alert('Error', 'Failed to load clubs. Please try again.');
// //     } finally {
// //       setClubsLoading(false);
// //     }
// //   };

// //   const openVisitModal = (club) => {
// //     setSelectedClub(club);
// //     // Reset form fields (removed visitDate)
// //     setGuestCount('');
// //     setPurpose('');
// //     setModalVisible(true);
// //   };

// //   const handleSendVisitRequest = async () => {
// //     // Validation
// //     if (!memberId.trim()) {
// //       Alert.alert('Error', 'Member ID is required');
// //       return;
// //     }

// //     // Removed visitDate validation

// //     if (guestCount && (parseInt(guestCount) < 0 || parseInt(guestCount) > 10)) {
// //       Alert.alert('Error', 'Guest count must be between 0 and 10');
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const requestData = {
// //         affiliatedClubId: selectedClub.id,
// //         membershipNo: memberId,
// //         // Removed requestedDate field
// //         guestCount: guestCount ? parseInt(guestCount) : 0,
// //         purpose: purpose || undefined,
// //       };

// //       const response = await createAffiliatedClubRequest(requestData);

// //       Alert.alert(
// //         'Success',
// //         'Visit request submitted successfully!',
// //         [
// //           {
// //             text: 'OK',
// //             onPress: () => {
// //               setModalVisible(false);
// //               // Clear form
// //               setGuestCount('');
// //               setPurpose('');
// //             }
// //           }
// //         ]
// //       );

// //     } catch (error) {
// //       console.log('Error submitting request:', error);
// //       Alert.alert(
// //         'Error',
// //         error.message || 'Failed to submit visit request. Please try again.'
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const renderClubs = () => {
// //     if (clubsLoading) {
// //       return (
// //         <View style={styles.loadingContainer}>
// //           <ActivityIndicator size="large" color="#A3834C" />
// //           <Text style={styles.loadingText}>Loading clubs...</Text>
// //         </View>
// //       );
// //     }

// //     if (clubs.length === 0) {
// //       return (
// //         <View style={styles.emptyContainer}>
// //           <Text style={styles.emptyText}>No affiliated clubs available</Text>
// //         </View>
// //       );
// //     }

// //     return clubs.map((club, index) => (
// //       <View key={club.id || index} style={styles.card}>
// //         <Text style={styles.clubName}>{club.name}</Text>

// //         {club.location && (
// //           <Text style={styles.clubAddress}>• {club.location}</Text>
// //         )}

// //         {club.address && (
// //           <Text style={styles.clubAddress}>• {club.address}</Text>
// //         )}

// //         {club.contactNo && (
// //           <Text style={styles.clubContact}>• {club.contactNo}</Text>
// //         )}

// //         {club.description && (
// //           <Text style={styles.clubDescription}>{club.description}</Text>
// //         )}

// //         <TouchableOpacity
// //           style={styles.visitButton}
// //           onPress={() => openVisitModal(club)}>
// //           <Text style={styles.visitButtonText}>Request Visit</Text>
// //         </TouchableOpacity>
// //       </View>
// //     ));
// //   };

// //   return (
// //     <>
// //       <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
// //       <View style={styles.container}>
// //         {/* Header */}
// //         <ImageBackground
// //           source={require('../../assets/logo.jpeg')}
// //           style={styles.notch}
// //           imageStyle={styles.notchImage}>
// //           <Text style={styles.ctext}>Affiliated Clubs</Text>
// //         </ImageBackground>

// //         <SafeAreaView style={styles.safeArea}>
// //           <ScrollView
// //             style={styles.scrollView}
// //             contentContainerStyle={styles.scrollContent}
// //             showsVerticalScrollIndicator={false}>
// //             <Text style={styles.mainHeading}>Available Clubs</Text>
// //             {renderClubs()}
// //           </ScrollView>
// //         </SafeAreaView>

// //         {/* Visit Request Modal */}
// //         <Modal
// //           animationType="slide"
// //           transparent={true}
// //           visible={modalVisible}
// //           onRequestClose={() => setModalVisible(false)}>
// //           <View style={styles.modalOverlay}>
// //             <ScrollView contentContainerStyle={styles.modalScrollContent}>
// //               <View style={styles.modalView}>
// //                 <Text style={styles.modalTitle}>
// //                   Visit Request - {selectedClub?.name}
// //                 </Text>

// //                 {/* Member ID (Auto-filled but editable) */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Member ID</Text>
// //                   <TextInput
// //                     value={memberId}
// //                     onChangeText={setMemberId}
// //                     style={styles.input}
// //                     placeholderTextColor="#888"
// //                     editable={true}
// //                   />
// //                 </View>

// //                 {/* Removed Visit Date Picker section */}

// //                 {/* Number of Guests */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Number of Guests</Text>
// //                   <TextInput
// //                     placeholder="0"
// //                     value={guestCount}
// //                     onChangeText={(text) => {
// //                       // Allow only numbers
// //                       if (text === '' || /^\d+$/.test(text)) {
// //                         setGuestCount(text);
// //                       }
// //                     }}
// //                     style={styles.input}
// //                     placeholderTextColor="#888"
// //                     keyboardType="numeric"
// //                     maxLength={2}
// //                   />
// //                 </View>

// //                 {/* Purpose/Reason */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Purpose/Reason (Optional)</Text>
// //                   <TextInput
// //                     placeholder="Enter purpose of visit..."
// //                     value={purpose}
// //                     onChangeText={setPurpose}
// //                     style={[styles.input, styles.textArea]}
// //                     placeholderTextColor="#888"
// //                     multiline={true}
// //                     numberOfLines={4}
// //                     textAlignVertical="top"
// //                   />
// //                 </View>

// //                 {/* Club Info Summary */}
// //                 {selectedClub && (
// //                   <View style={styles.clubInfoSummary}>
// //                     <Text style={styles.summaryTitle}>Club Information:</Text>
// //                     <Text style={styles.summaryText}>
// //                       <Text style={styles.summaryLabel}>Name: </Text>
// //                       {selectedClub.name}
// //                     </Text>
// //                     {selectedClub.location && (
// //                       <Text style={styles.summaryText}>
// //                         <Text style={styles.summaryLabel}>Location: </Text>
// //                         {selectedClub.location}
// //                       </Text>
// //                     )}
// //                     {selectedClub.contactNo && (
// //                       <Text style={styles.summaryText}>
// //                         <Text style={styles.summaryLabel}>Contact: </Text>
// //                         {selectedClub.contactNo}
// //                       </Text>
// //                     )}
// //                   </View>
// //                 )}

// //                 {/* Action Buttons */}
// //                 <View style={styles.modalButtons}>
// //                   <TouchableOpacity
// //                     style={[styles.modalBtn, styles.cancelBtn]}
// //                     onPress={() => setModalVisible(false)}
// //                     disabled={loading}>
// //                     <Text style={styles.modalBtnText}>Cancel</Text>
// //                   </TouchableOpacity>

// //                   <TouchableOpacity
// //                     style={[styles.modalBtn, styles.sendBtn]}
// //                     onPress={handleSendVisitRequest}
// //                     disabled={loading}>
// //                     {loading ? (
// //                       <ActivityIndicator size="small" color="#fff" />
// //                     ) : (
// //                       <Text style={styles.modalBtnText}>Submit Request</Text>
// //                     )}
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             </ScrollView>
// //           </View>
// //         </Modal>
// //       </View>
// //     </>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#FEF9F3'
// //   },
// //   notch: {
// //     paddingTop: 60,
// //     paddingBottom: 20,
// //     borderBottomEndRadius: 30,
// //     borderBottomStartRadius: 30,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   notchImage: {
// //     resizeMode: 'cover'
// //   },
// //   ctext: {
// //     fontSize: 25,
// //     fontWeight: 'bold',
// //     color: '#000000'
// //   },
// //   safeArea: {
// //     flex: 1
// //   },
// //   scrollView: {
// //     flex: 1
// //   },
// //   scrollContent: {
// //     paddingVertical: 20,
// //     paddingHorizontal: 20
// //   },
// //   mainHeading: {
// //     textAlign: 'center',
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     marginBottom: 20,
// //     color: '#000',
// //   },
// //   loadingContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: 40,
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     color: '#666',
// //     fontSize: 16,
// //   },
// //   emptyContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: 40,
// //   },
// //   emptyText: {
// //     fontSize: 16,
// //     color: '#666',
// //     textAlign: 'center',
// //   },
// //   card: {
// //     backgroundColor: '#f1e3dcff',
// //     borderRadius: 15,
// //     padding: 20,
// //     marginBottom: 15,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 3.84,
// //     elevation: 5,
// //   },
// //   clubName: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#A3834C',
// //     marginBottom: 8,
// //   },
// //   clubAddress: {
// //     fontSize: 14,
// //     color: '#333',
// //     marginBottom: 4
// //   },
// //   clubContact: {
// //     fontSize: 14,
// //     color: '#333',
// //     marginBottom: 4
// //   },
// //   clubDescription: {
// //     fontSize: 14,
// //     color: '#666',
// //     fontStyle: 'italic',
// //     marginTop: 8,
// //     marginBottom: 12,
// //   },
// //   visitButton: {
// //     marginTop: 10,
// //     alignSelf: 'flex-start',
// //     backgroundColor: '#A3834C',
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //     borderRadius: 10,
// //   },
// //   visitButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16
// //   },
// //   // Modal styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'center',
// //   },
// //   modalScrollContent: {
// //     flexGrow: 1,
// //     justifyContent: 'center',
// //     padding: 20,
// //   },
// //   modalView: {
// //     backgroundColor: '#fff',
// //     borderRadius: 15,
// //     padding: 20,
// //     elevation: 10,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#A3834C',
// //     marginBottom: 20,
// //     textAlign: 'center',
// //   },
// //   inputContainer: {
// //     marginBottom: 15,
// //   },
// //   inputLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 5,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 10,
// //     padding: 12,
// //     fontSize: 16,
// //     backgroundColor: '#f9f9f9',
// //   },
// //   textArea: {
// //     minHeight: 100,
// //     textAlignVertical: 'top',
// //   },
// //   clubInfoSummary: {
// //     backgroundColor: '#f8f9fa',
// //     borderRadius: 10,
// //     padding: 15,
// //     marginVertical: 15,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#A3834C',
// //   },
// //   summaryTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 8,
// //   },
// //   summaryText: {
// //     fontSize: 14,
// //     color: '#555',
// //     marginBottom: 4,
// //   },
// //   summaryLabel: {
// //     fontWeight: '600',
// //   },
// //   modalButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 10,
// //   },
// //   modalBtn: {
// //     flex: 1,
// //     marginHorizontal: 5,
// //     borderRadius: 10,
// //     paddingVertical: 12,
// //     alignItems: 'center',
// //   },
// //   cancelBtn: {
// //     backgroundColor: '#6c757d'
// //   },
// //   sendBtn: {
// //     backgroundColor: '#A3834C'
// //   },
// //   modalBtnText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16
// //   },
// // });

// // export default aff_club;


// //2nd version
// // import React, { useState, useEffect } from 'react';
// // import {
// //   SafeAreaView,
// //   StyleSheet,
// //   Text,
// //   View,
// //   StatusBar,
// //   ScrollView,
// //   ImageBackground,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   RefreshControl,
// //   Image,
// //   Modal,
// //   TextInput,
// //   Alert,
// //   Platform,
// // } from 'react-native';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { useNavigation } from '@react-navigation/native';
// // import Icon from 'react-native-vector-icons/MaterialIcons';
// // import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../../config/apis';

// // const aff_club = () => {
// //   const navigation = useNavigation();
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [selectedClub, setSelectedClub] = useState(null);
// //   const [clubs, setClubs] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [clubsLoading, setClubsLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [showDatePicker, setShowDatePicker] = useState(false);
// //   const [searchQuery, setSearchQuery] = useState('');

// //   // Form state
// //   const [visitDate, setVisitDate] = useState(new Date());
// //   const [guestCount, setGuestCount] = useState('');
// //   const [purpose, setPurpose] = useState('');
// //   const [memberId, setMemberId] = useState('');
// //   const [userProfile, setUserProfile] = useState(null);

// //   useEffect(() => {
// //     fetchUserProfile();
// //     fetchAffiliatedClubs();
// //   }, []);

// //   const fetchUserProfile = async () => {
// //     try {
// //       const profile = await getUserData();
// //       setUserProfile(profile);
// //       setMemberId(profile.membershipNumber || profile.memberId || profile.id || '');
// //     } catch (error) {
// //       console.log('Error fetching user profile:', error);
// //       Alert.alert('Error', 'Failed to load user information');
// //     }
// //   };

// //   const fetchAffiliatedClubs = async () => {
// //     try {
// //       setClubsLoading(true);
// //       const clubsData = await getAffiliatedClubs();
// //       const activeClubs = clubsData.filter(club => club.isActive !== false);
// //       setClubs(activeClubs);
// //     } catch (error) {
// //       console.log('Error fetching clubs:', error);
// //       Alert.alert('Error', 'Failed to load clubs. Please try again.');
// //     } finally {
// //       setClubsLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     fetchAffiliatedClubs();
// //   };

// //   const openVisitModal = (club) => {
// //     setSelectedClub(club);
// //     setVisitDate(new Date());
// //     setGuestCount('');
// //     setPurpose('');
// //     setShowDatePicker(false);
// //     setModalVisible(true);
// //   };

// //   const handleDateChange = (event, selectedDate) => {
// //     setShowDatePicker(Platform.OS === 'ios');
// //     if (selectedDate) {
// //       setVisitDate(selectedDate);
// //     }
// //   };

// //   const formatDate = (date) => {
// //     return date.toLocaleDateString('en-US', {
// //       year: 'numeric',
// //       month: 'long',
// //       day: 'numeric',
// //     });
// //   };

// //   const handleSendVisitRequest = async () => {
// //     if (!memberId.trim()) {
// //       Alert.alert('Error', 'Member ID is required');
// //       return;
// //     }

// //     if (!visitDate) {
// //       Alert.alert('Error', 'Please select a visit date');
// //       return;
// //     }

// //     if (guestCount && (parseInt(guestCount) < 0 || parseInt(guestCount) > 10)) {
// //       Alert.alert('Error', 'Guest count must be between 0 and 10');
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const requestData = {
// //         affiliatedClubId: selectedClub.id,
// //         membershipNo: memberId,
// //         requestedDate: visitDate.toISOString().split('T')[0],
// //         guestCount: guestCount ? parseInt(guestCount) : 0,
// //         purpose: purpose || undefined,
// //       };

// //       console.log('Sending request:', requestData);

// //       const response = await createAffiliatedClubRequest(requestData);

// //       Alert.alert(
// //         'Success',
// //         'Visit request submitted successfully!',
// //         [
// //           {
// //             text: 'OK',
// //             onPress: () => {
// //               setModalVisible(false);
// //               setGuestCount('');
// //               setPurpose('');
// //             }
// //           }
// //         ]
// //       );

// //     } catch (error) {
// //       console.log('Error submitting request:', error);
// //       Alert.alert(
// //         'Error',
// //         error.message || 'Failed to submit visit request. Please try again.'
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Filter clubs based on search query
// //   const filteredClubs = clubs.filter((club) => {
// //     const query = searchQuery.toLowerCase();
// //     const nameMatch = club.name?.toLowerCase().includes(query);
// //     const locationMatch = club.location?.toLowerCase().includes(query);
// //     const addressMatch = club.address?.toLowerCase().includes(query);
// //     const contactMatch = club.contactNo?.toLowerCase().includes(query);

// //     return nameMatch || locationMatch || addressMatch || contactMatch;
// //   });

// //   const clearSearch = () => {
// //     setSearchQuery('');
// //   };

// //   const renderClubCards = () => {
// //     if (clubsLoading) {
// //       return (
// //         <View style={styles.loadingContainer}>
// //           <ActivityIndicator size="large" color="#A3834C" />
// //           <Text style={styles.loadingText}>Loading clubs...</Text>
// //         </View>
// //       );
// //     }

// //     if (clubs.length === 0) {
// //       return (
// //         <View style={styles.noDataContainer}>
// //           <Text style={styles.noDataText}>No affiliated clubs available</Text>
// //           <Text style={styles.noDataSubText}>
// //             There are currently no clubs in the system
// //           </Text>
// //           <TouchableOpacity
// //             style={styles.retryButton}
// //             onPress={fetchAffiliatedClubs}
// //           >
// //             <Text style={styles.retryButtonText}>Try Again</Text>
// //           </TouchableOpacity>
// //         </View>
// //       );
// //     }

// //     if (filteredClubs.length === 0) {
// //       return (
// //         <View style={styles.noResultsContainer}>
// //           <Icon name="search-off" size={50} color="#ccc" />
// //           <Text style={styles.noResultsText}>No clubs found</Text>
// //           <Text style={styles.noResultsSubtext}>
// //             Try searching with different keywords
// //           </Text>
// //         </View>
// //       );
// //     }

// //     return filteredClubs.map((club, index) => {
// //       const clubImage = club.image
// //         ? { uri: club.image }
// //         : require('../../assets/psc_home.jpeg');

// //       return (
// //         <View key={club.id || index} style={styles.card}>
// //           {/* Club Image */}
// //           <View style={styles.imageContainer}>
// //             <Image
// //               source={clubImage}
// //               style={styles.clubImage}
// //               resizeMode="cover"
// //             />
// //             <View style={styles.imageOverlay} />
// //           </View>

// //           {/* Club Details */}
// //           <View style={styles.detailsContainer}>
// //             <Text style={styles.clubName}>{club.name}</Text>

// //             {(club.location || club.address) && (
// //               <View style={styles.infoRow}>
// //                 <Icon name="location-on" size={18} color="#A3834C" />
// //                 <Text style={styles.clubAddress}>{club.location || club.address}</Text>
// //               </View>
// //             )}

// //             {club.contactNo && (
// //               <View style={styles.contactContainer}>
// //                 <Icon name="phone" size={18} color="#A3834C" />
// //                 <View style={styles.contactNumbers}>
// //                   <Text style={styles.clubContact}>{club.contactNo}</Text>
// //                 </View>
// //               </View>
// //             )}

// //             {club.description && (
// //               <Text style={styles.clubDescription} numberOfLines={2}>
// //                 {club.description}
// //               </Text>
// //             )}

// //             <TouchableOpacity
// //               style={styles.visitButton}
// //               onPress={() => openVisitModal(club)}>
// //               <Text style={styles.visitButtonText}>Visit Club</Text>
// //               <Icon name="arrow-forward" size={18} color="#fff" />
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       );
// //     });
// //   };

// //   return (
// //     <>
// //       <StatusBar barStyle="dark-content" />
// //       <View style={styles.container}>
// //         {/* Header */}
// //         <ImageBackground
// //           source={require('../../assets/notch.jpg')}
// //           style={styles.notch}
// //           imageStyle={styles.notchImage}>
// //           <View style={styles.notchContent}>
// //             <TouchableOpacity
// //               style={styles.backButton}
// //               onPress={() => navigation.navigate('Home')}>
// //               <Icon name="arrow-back" size={28} color="#000000" />
// //             </TouchableOpacity>
// //             <Text style={styles.ctext}>Affiliated Clubs</Text>
// //           </View>
// //         </ImageBackground>

// //         <SafeAreaView style={styles.safeArea}>
// //           {/* Search Bar */}
// //           <View style={styles.searchContainer}>
// //             <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
// //             <TextInput
// //               style={styles.searchInput}
// //               placeholder="Search clubs by name, location..."
// //               placeholderTextColor="#888"
// //               value={searchQuery}
// //               onChangeText={setSearchQuery}
// //             />
// //             {searchQuery.length > 0 && (
// //               <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
// //                 <Icon name="close" size={18} color="#888" />
// //               </TouchableOpacity>
// //             )}
// //           </View>

// //           {/* Results Count */}
// //           {searchQuery.length > 0 && (
// //             <View style={styles.resultsContainer}>
// //               <Text style={styles.resultsText}>
// //                 {filteredClubs.length} {filteredClubs.length === 1 ? 'club' : 'clubs'} found
// //               </Text>
// //             </View>
// //           )}

// //           <ScrollView
// //             style={styles.scrollView}
// //             contentContainerStyle={styles.scrollContent}
// //             showsVerticalScrollIndicator={false}
// //             refreshControl={
// //               <RefreshControl
// //                 refreshing={refreshing}
// //                 onRefresh={onRefresh}
// //                 colors={['#A3834C']}
// //                 tintColor="#A3834C"
// //               />
// //             }
// //           >
// //             {renderClubCards()}
// //           </ScrollView>
// //         </SafeAreaView>

// //         {/* Visit Request Modal - Keep your existing modal */}
// //         <Modal
// //           animationType="slide"
// //           transparent={true}
// //           visible={modalVisible}
// //           onRequestClose={() => setModalVisible(false)}
// //         >
// //           <View style={styles.modalOverlay}>
// //             <ScrollView contentContainerStyle={styles.modalScrollContent}>
// //               <View style={styles.modalView}>
// //                 <Text style={styles.modalTitle}>
// //                   Visit Request - {selectedClub?.name}
// //                 </Text>

// //                 {/* Member ID */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Member ID</Text>
// //                   <TextInput
// //                     value={memberId}
// //                     style={styles.input}
// //                     placeholderTextColor="#888"
// //                     editable={false}
// //                     selectable={false}
// //                   />
// //                 </View>

// //                 {/* Visit Date Picker */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Visit Date</Text>
// //                   <TouchableOpacity
// //                     style={styles.datePickerButton}
// //                     onPress={() => setShowDatePicker(true)}
// //                   >
// //                     <Text style={styles.dateText}>
// //                       {formatDate(visitDate)}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 </View>

// //                 {/* Date Picker */}
// //                 {showDatePicker && (
// //                   <DateTimePicker
// //                     value={visitDate}
// //                     mode="date"
// //                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
// //                     onChange={handleDateChange}
// //                     minimumDate={new Date()}
// //                     style={styles.datePicker}
// //                   />
// //                 )}

// //                 {/* Number of Guests */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Number of Guests</Text>
// //                   <TextInput
// //                     placeholder="0"
// //                     value={guestCount}
// //                     onChangeText={(text) => {
// //                       if (text === '' || /^\d+$/.test(text)) {
// //                         setGuestCount(text);
// //                       }
// //                     }}
// //                     style={styles.input}
// //                     placeholderTextColor="#888"
// //                     keyboardType="numeric"
// //                     maxLength={2}
// //                   />
// //                 </View>

// //                 {/* Purpose/Reason */}
// //                 <View style={styles.inputContainer}>
// //                   <Text style={styles.inputLabel}>Purpose/Reason (Optional)</Text>
// //                   <TextInput
// //                     placeholder="Enter purpose of visit..."
// //                     value={purpose}
// //                     onChangeText={setPurpose}
// //                     style={[styles.input, styles.textArea]}
// //                     placeholderTextColor="#888"
// //                     multiline={true}
// //                     numberOfLines={4}
// //                     textAlignVertical="top"
// //                   />
// //                 </View>

// //                 {/* Club Info Summary */}
// //                 {selectedClub && (
// //                   <View style={styles.clubInfoSummary}>
// //                     <Text style={styles.summaryTitle}>Club Information:</Text>
// //                     <Text style={styles.summaryText}>
// //                       <Text style={styles.summaryLabel}>Name: </Text>
// //                       {selectedClub.name}
// //                     </Text>
// //                     {selectedClub.location && (
// //                       <Text style={styles.summaryText}>
// //                         <Text style={styles.summaryLabel}>Location: </Text>
// //                         {selectedClub.location}
// //                       </Text>
// //                     )}
// //                     {selectedClub.contactNo && (
// //                       <Text style={styles.summaryText}>
// //                         <Text style={styles.summaryLabel}>Contact: </Text>
// //                         {selectedClub.contactNo}
// //                       </Text>
// //                     )}
// //                   </View>
// //                 )}

// //                 {/* Action Buttons */}
// //                 <View style={styles.modalButtons}>
// //                   <TouchableOpacity
// //                     style={[styles.modalBtn, styles.cancelBtn]}
// //                     onPress={() => setModalVisible(false)}
// //                     disabled={loading}
// //                   >
// //                     <Text style={styles.modalBtnText}>Cancel</Text>
// //                   </TouchableOpacity>

// //                   <TouchableOpacity
// //                     style={[styles.modalBtn, styles.sendBtn]}
// //                     onPress={handleSendVisitRequest}
// //                     disabled={loading}
// //                   >
// //                     {loading ? (
// //                       <ActivityIndicator size="small" color="#fff" />
// //                     ) : (
// //                       <Text style={styles.modalBtnText}>Submit Request</Text>
// //                     )}
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             </ScrollView>
// //           </View>
// //         </Modal>
// //       </View>
// //     </>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F5F5F5' },
// //   notch: {
// //     paddingTop: 50,
// //     paddingBottom: 40,
// //     borderBottomEndRadius: 40,
// //     borderBottomStartRadius: 30,
// //     alignItems: 'flex-start',
// //     justifyContent: 'center',
// //     paddingLeft: 20,
// //     overflow: 'hidden',
// //     position: 'relative',
// //   },
// //   notchImage: {
// //     resizeMode: 'cover',
// //   },
// //   notchContent: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     width: '100%',
// //     position: 'relative',
// //   },
// //   backButton: {
// //     position: 'absolute',
// //     left: 0,
// //     padding: 5,
// //   },
// //   ctext: {
// //     fontSize: 25,
// //     fontWeight: 'bold',
// //     color: '#000000',
// //   },
// //   safeArea: { flex: 1 },
// //   // Search bar styles
// //   searchContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     marginHorizontal: 15,
// //     marginTop: 10,
// //     marginBottom: 5,
// //     borderRadius: 12,
// //     paddingHorizontal: 12,
// //     paddingVertical: 4,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   searchIcon: {
// //     marginRight: 8,
// //   },
// //   searchInput: {
// //     flex: 1,
// //     fontSize: 14,
// //     color: '#333',
// //     paddingVertical: 8,
// //   },
// //   clearButton: {
// //     padding: 4,
// //   },
// //   resultsContainer: {
// //     paddingHorizontal: 20,
// //     paddingBottom: 5,
// //   },
// //   resultsText: {
// //     fontSize: 12,
// //     color: '#666',
// //     fontStyle: 'italic',
// //   },
// //   scrollView: { flex: 1 },
// //   scrollContent: { paddingVertical: 8, paddingHorizontal: 15 },
// //   // Smaller card styles
// //   card: {
// //     backgroundColor: '#fff',
// //     borderRadius: 15,
// //     marginBottom: 12,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.12,
// //     shadowRadius: 4,
// //     elevation: 4,
// //     overflow: 'hidden',
// //   },
// //   imageContainer: {
// //     width: '100%',
// //     height: 100,
// //     position: 'relative',
// //   },
// //   clubImage: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   imageOverlay: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     height: '40%',
// //     backgroundColor: 'rgba(0,0,0,0.2)',
// //   },
// //   detailsContainer: {
// //     padding: 12,
// //     backgroundColor: '#f1e3dcff',
// //   },
// //   clubName: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#A3834C',
// //     marginBottom: 6,
// //     letterSpacing: 0.3,
// //   },
// //   infoRow: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     marginBottom: 4,
// //   },
// //   clubAddress: {
// //     fontSize: 12,
// //     color: '#333',
// //     marginLeft: 6,
// //     flex: 1,
// //     lineHeight: 16,
// //   },
// //   contactContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     marginBottom: 8,
// //   },
// //   contactNumbers: {
// //     marginLeft: 6,
// //     flex: 1,
// //   },
// //   clubContact: {
// //     fontSize: 12,
// //     color: '#555',
// //     marginBottom: 2,
// //     lineHeight: 16,
// //   },
// //   clubDescription: {
// //     fontSize: 11,
// //     color: '#666',
// //     fontStyle: 'italic',
// //     marginBottom: 8,
// //     lineHeight: 15,
// //   },
// //   visitButton: {
// //     marginTop: 6,
// //     alignSelf: 'stretch',
// //     backgroundColor: '#A3834C',
// //     paddingVertical: 8,
// //     paddingHorizontal: 15,
// //     borderRadius: 8,
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     shadowColor: '#A3834C',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 3,
// //     elevation: 3,
// //   },
// //   visitButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 13,
// //     marginRight: 6,
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingVertical: 40,
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   noDataContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingVertical: 50,
// //   },
// //   noDataText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#666',
// //     marginBottom: 8,
// //   },
// //   noDataSubText: {
// //     fontSize: 13,
// //     color: '#888',
// //     textAlign: 'center',
// //     marginBottom: 15,
// //     paddingHorizontal: 40,
// //   },
// //   noResultsContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingVertical: 50,
// //   },
// //   noResultsText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#999',
// //     marginTop: 12,
// //   },
// //   noResultsSubtext: {
// //     fontSize: 12,
// //     color: '#aaa',
// //     marginTop: 6,
// //   },
// //   retryButton: {
// //     backgroundColor: '#A3834C',
// //     paddingHorizontal: 20,
// //     paddingVertical: 10,
// //     borderRadius: 8,
// //   },
// //   retryButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   // Modal styles (keep your existing modal styles)
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'center',
// //   },
// //   modalScrollContent: {
// //     flexGrow: 1,
// //     justifyContent: 'center',
// //     padding: 20,
// //   },
// //   modalView: {
// //     backgroundColor: '#fff',
// //     borderRadius: 15,
// //     padding: 20,
// //     elevation: 10,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#A3834C',
// //     marginBottom: 20,
// //     textAlign: 'center',
// //   },
// //   inputContainer: {
// //     marginBottom: 15,
// //   },
// //   inputLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 5,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 10,
// //     padding: 12,
// //     fontSize: 16,
// //     backgroundColor: '#f9f9f9',
// //   },
// //   textArea: {
// //     minHeight: 100,
// //     textAlignVertical: 'top',
// //   },
// //   datePickerButton: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 10,
// //     padding: 12,
// //     backgroundColor: '#f9f9f9',
// //   },
// //   dateText: {
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   datePicker: {
// //     marginVertical: 10,
// //   },
// //   clubInfoSummary: {
// //     backgroundColor: '#f8f9fa',
// //     borderRadius: 10,
// //     padding: 15,
// //     marginVertical: 15,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#A3834C',
// //   },
// //   summaryTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 8,
// //   },
// //   summaryText: {
// //     fontSize: 14,
// //     color: '#555',
// //     marginBottom: 4,
// //   },
// //   summaryLabel: {
// //     fontWeight: '600',
// //   },
// //   modalButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 10,
// //   },
// //   modalBtn: {
// //     flex: 1,
// //     marginHorizontal: 5,
// //     borderRadius: 10,
// //     paddingVertical: 12,
// //     alignItems: 'center',
// //   },
// //   cancelBtn: {
// //     backgroundColor: '#6c757d',
// //   },
// //   sendBtn: {
// //     backgroundColor: '#A3834C',
// //   },
// //   modalBtnText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// // });

// // export default aff_club;

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
//   Image,
//   Modal,
//   TextInput,
//   Alert,
//   Platform,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../../config/apis';

// const aff_club = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedClub, setSelectedClub] = useState(null);
//   const [clubs, setClubs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [clubsLoading, setClubsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   // Form state - only these 3 fields are needed as per web portal
//   const [visitDate, setVisitDate] = useState(new Date());
//   const [memberId, setMemberId] = useState('');
//   const [userProfile, setUserProfile] = useState(null);

//   useEffect(() => {
//     fetchUserProfile();
//     fetchAffiliatedClubs();
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       const profile = await getUserData();
//       setUserProfile(profile);
//       // Try to get membership number from different possible fields
//       setMemberId(profile.membershipNumber || profile.membershipNo || profile.Membership_No || profile.memberId || '');
//     } catch (error) {
//       console.log('Error fetching user profile:', error);
//       Alert.alert('Error', 'Failed to load user information');
//     }
//   };

//   const fetchAffiliatedClubs = async () => {
//     try {
//       setClubsLoading(true);
//       const clubsData = await getAffiliatedClubs();
//       const activeClubs = clubsData.filter(club => club.isActive !== false);
//       setClubs(activeClubs);
//     } catch (error) {
//       console.log('Error fetching clubs:', error);
//       Alert.alert('Error', 'Failed to load clubs. Please try again.');
//     } finally {
//       setClubsLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchAffiliatedClubs();
//   };

//   const openVisitModal = (club) => {
//     setSelectedClub(club);
//     setVisitDate(new Date());
//     setShowDatePicker(false);
//     setModalVisible(true);
//   };

//   const handleDateChange = (event, selectedDate) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       setVisitDate(selectedDate);
//     }
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   const handleSendVisitRequest = async () => {
//     if (!memberId || memberId.trim() === '') {
//       Alert.alert('Error', 'Member ID is required');
//       return;
//     }

//     if (!visitDate) {
//       Alert.alert('Error', 'Please select a visit date');
//       return;
//     }

//     // Check if date is not in the past
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const selected = new Date(visitDate);
//     selected.setHours(0, 0, 0, 0);

//     if (selected < today) {
//       Alert.alert('Error', 'Cannot select a past date');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Prepare payload exactly as web portal expects
//       const requestData = {
//         affiliatedClubId: selectedClub.id,
//         membershipNo: memberId,
//         requestedDate: visitDate.toISOString().split('T')[0], // YYYY-MM-DD format
//       };

//       console.log('Sending request:', requestData);

//       const response = await createAffiliatedClubRequest(requestData);

//       Alert.alert(
//         'Success',
//         'Visit request submitted successfully! You will receive a confirmation email.',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setModalVisible(false);
//             }
//           }
//         ]
//       );

//     } catch (error) {
//       console.log('Error submitting request:', error);
//       let errorMessage = 'Failed to submit visit request. Please try again.';

//       if (error.response) {
//         // Handle specific HTTP errors
//         const status = error.response.status;
//         if (status === 404) {
//           errorMessage = 'Member or club not found. Please check your membership number.';
//         } else if (status === 400) {
//           errorMessage = 'Invalid request data. Please check your information.';
//         } else if (status === 500) {
//           errorMessage = 'Server error. Please try again later.';
//         } else {
//           errorMessage = error.response.data?.message || errorMessage;
//         }
//       }

//       Alert.alert('Error', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderClubCards = () => {
//     if (clubsLoading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#A3834C" />
//           <Text style={styles.loadingText}>Loading clubs...</Text>
//         </View>
//       );
//     }

//     if (clubs.length === 0) {
//       return (
//         <View style={styles.noDataContainer}>
//           <Text style={styles.noDataText}>No affiliated clubs available</Text>
//           <Text style={styles.noDataSubText}>
//             There are currently no clubs in the system
//           </Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={fetchAffiliatedClubs}
//           >
//             <Text style={styles.retryButtonText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     return clubs.map((club, index) => {
//       const clubImage = club.image
//         ? { uri: club.image }
//         : require('../../assets/psc_home.jpeg');

//       return (
//         <TouchableOpacity
//           key={club.id || index}
//           style={styles.card}
//           onPress={() => openVisitModal(club)}
//           activeOpacity={0.9}
//         >
//           <ImageBackground
//             source={clubImage}
//             style={styles.cardBackground}
//             imageStyle={styles.cardImage}
//           >
//             <View style={styles.overlay} />
//             <View style={styles.cardContent}>
//               <View style={styles.textContainer}>
//                 <Text style={styles.cardTitle}>{club.name}</Text>

//                 {club.location && (
//                   <Text style={styles.cardDescription}>
//                     📍 {club.location}
//                   </Text>
//                 )}

//                 {club.email && (
//                   <Text style={styles.detailText}>
//                     📧 {club.email}
//                   </Text>
//                 )}

//                 {club.contactNo && (
//                   <Text style={styles.detailText}>
//                     📞 {club.contactNo}
//                   </Text>
//                 )}

//                 {club.description && (
//                   <Text style={styles.cardDescription} numberOfLines={2}>
//                     {club.description}
//                   </Text>
//                 )}

//                 <View style={styles.statusContainer}>
//                   <Text style={[
//                     styles.statusText,
//                     club.isActive ? styles.statusActive : styles.statusInactive
//                   ]}>
//                     {club.isActive ? '✅ Available for Visits' : '❌ Not Available'}
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.arrowContainer}>
//                 <Text style={styles.arrowIcon}>›</Text>
//               </View>
//             </View>
//           </ImageBackground>
//         </TouchableOpacity>
//       );
//     });
//   };

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
//             <Text style={styles.headerText}>Affiliated Clubs</Text>
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
//                 colors={['#A3834C']}
//                 tintColor="#A3834C"
//               />
//             }
//           >
//             <View style={styles.infoContainer}>
//               <Text style={styles.infoText}>
//                 🏢 Showing {clubs.length} affiliated clubs
//               </Text>
//               <Text style={styles.instructionText}>
//                 Tap on a club to request a visit
//               </Text>
//             </View>

//             {renderClubCards()}

//             {/* Instructions Section */}
//             <View style={styles.instructionsCard}>
//               <Text style={styles.instructionsTitle}>How to Request a Visit:</Text>
//               <View style={styles.instructionStep}>
//                 <Text style={styles.stepNumber}>1</Text>
//                 <Text style={styles.stepText}>Select a club from the list above</Text>
//               </View>
//               <View style={styles.instructionStep}>
//                 <Text style={styles.stepNumber}>2</Text>
//                 <Text style={styles.stepText}>Enter your membership number</Text>
//               </View>
//               <View style={styles.instructionStep}>
//                 <Text style={styles.stepNumber}>3</Text>
//                 <Text style={styles.stepText}>Select your desired visit date</Text>
//               </View>
//               <View style={styles.instructionStep}>
//                 <Text style={styles.stepNumber}>4</Text>
//                 <Text style={styles.stepText}>Submit your request</Text>
//               </View>
//               <Text style={styles.noteText}>
//                 Note: You will receive an email confirmation once your request is processed.
//               </Text>
//             </View>
//           </ScrollView>
//         </SafeAreaView>

//         {/* Visit Request Modal - Simplified to match web portal */}
//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <ScrollView contentContainerStyle={styles.modalScrollContent}>
//               <View style={styles.modalView}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>
//                     Visit Request
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.closeButton}
//                     onPress={() => setModalVisible(false)}
//                   >
//                     <Text style={styles.closeButtonText}>×</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Club Info */}
//                 {selectedClub && (
//                   <View style={styles.selectedClubInfo}>
//                     <Text style={styles.selectedClubName}>{selectedClub.name}</Text>
//                     {selectedClub.location && (
//                       <Text style={styles.selectedClubLocation}>📍 {selectedClub.location}</Text>
//                     )}
//                   </View>
//                 )}

//                 {/* Membership Number */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Membership Number *</Text>
//                   <TextInput
//                     value={memberId}
//                     onChangeText={setMemberId}
//                     style={styles.input}
//                     placeholder="Enter your membership number"
//                     placeholderTextColor="#888"
//                     editable={true}
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                   />
//                   {userProfile && (
//                     <Text style={styles.hintText}>
//                       Your profile: {userProfile.firstName || ''} {userProfile.lastName || ''}
//                     </Text>
//                   )}
//                 </View>

//                 {/* Visit Date Picker */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Visit Date *</Text>
//                   <TouchableOpacity
//                     style={styles.datePickerButton}
//                     onPress={() => setShowDatePicker(true)}
//                   >
//                     <Text style={styles.dateText}>
//                       {formatDate(visitDate)}
//                     </Text>
//                     <Text style={styles.calendarIcon}>📅</Text>
//                   </TouchableOpacity>
//                   <Text style={styles.hintText}>
//                     Select your preferred visit date
//                   </Text>
//                 </View>

//                 {/* Date Picker */}
//                 {showDatePicker && (
//                   <DateTimePicker
//                     value={visitDate}
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={handleDateChange}
//                     minimumDate={new Date()}
//                     style={styles.datePicker}
//                   />
//                 )}

//                 {/* Action Buttons */}
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity
//                     style={[styles.modalBtn, styles.cancelBtn]}
//                     onPress={() => setModalVisible(false)}
//                     disabled={loading}
//                   >
//                     <Text style={styles.modalBtnText}>Cancel</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.modalBtn, styles.sendBtn]}
//                     onPress={handleSendVisitRequest}
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <>
//                         <Text style={styles.modalBtnText}>Submit Request</Text>
//                         <Text style={styles.submitIcon}>→</Text>
//                       </>
//                     )}
//                   </TouchableOpacity>
//                 </View>

//                 {/* Terms/Info */}
//                 <Text style={styles.termsText}>
//                   By submitting, you agree that an email will be sent to you and the club for confirmation.
//                 </Text>
//               </View>
//             </ScrollView>
//           </View>
//         </Modal>
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
//     height: 160,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     paddingBottom: 20,
//   },
//   notchImage: {
//     resizeMode: 'cover',
//   },
//   notchContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     paddingHorizontal: 20,
//   },
//   headerText: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
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
//     paddingHorizontal: 15,
//     paddingBottom: 30,
//   },
//   infoContainer: {
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '500',
//   },
//   instructionText: {
//     fontSize: 14,
//     color: '#888',
//     marginTop: 5,
//   },
//   card: {
//     marginBottom: 15,
//     borderRadius: 15,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   cardBackground: {
//     height: 180,
//   },
//   cardImage: {
//     borderRadius: 15,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   cardContent: {
//     flex: 1,
//     padding: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//   },
//   textContainer: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 5,
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   cardDescription: {
//     fontSize: 14,
//     color: '#fff',
//     marginBottom: 5,
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   detailText: {
//     fontSize: 12,
//     color: '#fff',
//     marginBottom: 5,
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   statusContainer: {
//     marginTop: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   statusActive: {
//     color: '#4CAF50',
//     textShadowColor: 'rgba(0, 0, 0, 0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   statusInactive: {
//     color: '#F44336',
//     textShadowColor: 'rgba(0, 0, 0, 0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   arrowContainer: {
//     justifyContent: 'center',
//   },
//   arrowIcon: {
//     fontSize: 30,
//     color: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#666',
//   },
//   noDataContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 50,
//   },
//   noDataText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#666',
//     marginBottom: 10,
//   },
//   noDataSubText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 40,
//   },
//   retryButton: {
//     backgroundColor: '#A3834C',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   instructionsCard: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     marginTop: 10,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   instructionsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//   },
//   instructionStep: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   stepNumber: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#A3834C',
//     color: '#fff',
//     textAlign: 'center',
//     lineHeight: 24,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   stepText: {
//     fontSize: 14,
//     color: '#555',
//     flex: 1,
//   },
//   noteText: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 15,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//   },
//   modalScrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalView: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#A3834C',
//     flex: 1,
//   },
//   closeButton: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   closeButtonText: {
//     fontSize: 20,
//     color: '#666',
//     fontWeight: 'bold',
//   },
//   selectedClubInfo: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: '#A3834C',
//   },
//   selectedClubName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   selectedClubLocation: {
//     fontSize: 14,
//     color: '#666',
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#f9f9f9',
//     color: '#333',
//   },
//   hintText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 5,
//   },
//   datePickerButton: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     backgroundColor: '#f9f9f9',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   dateText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   calendarIcon: {
//     fontSize: 18,
//   },
//   datePicker: {
//     marginVertical: 10,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   modalBtn: {
//     flex: 1,
//     marginHorizontal: 5,
//     borderRadius: 10,
//     paddingVertical: 15,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   cancelBtn: {
//     backgroundColor: '#6c757d',
//   },
//   sendBtn: {
//     backgroundColor: '#A3834C',
//   },
//   modalBtnText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginRight: 5,
//   },
//   submitIcon: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   termsText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 20,
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
// });

// export default aff_club;

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
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../../config/apis';

const aff_club = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [instructionsModalVisible, setInstructionsModalVisible] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state - only these 3 fields are needed as per web portal
  const [visitDate, setVisitDate] = useState(new Date());
  const [memberId, setMemberId] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchAffiliatedClubs();
    // Show instructions modal on first visit
    setInstructionsModalVisible(true);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserData();
      setUserProfile(profile);
      // Try to get membership number from different possible fields
      setMemberId(profile.membershipNumber || profile.membershipNo || profile.Membership_No || profile.memberId || '');
    } catch (error) {
      console.log('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user information');
    }
  };

  const fetchAffiliatedClubs = async () => {
    try {
      setClubsLoading(true);
      const clubsData = await getAffiliatedClubs();
      const activeClubs = clubsData.filter(club => club.isActive !== false);
      setClubs(activeClubs);
    } catch (error) {
      console.log('Error fetching clubs:', error);
      Alert.alert('Error', 'Failed to load clubs. Please try again.');
    } finally {
      setClubsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAffiliatedClubs();
  };

  const openVisitModal = (club) => {
    setSelectedClub(club);
    setVisitDate(new Date());
    setShowDatePicker(false);
    // Show instructions modal first, then the visit request modal
    setInstructionsModalVisible(true);
    setModalVisible(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter clubs based on search query
  const filteredClubs = clubs.filter((club) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = club.name?.toLowerCase().includes(query);
    const locationMatch = club.location?.toLowerCase().includes(query);
    const addressMatch = club.address?.toLowerCase().includes(query);
    return nameMatch || locationMatch || addressMatch;
  });

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setVisitDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSendVisitRequest = async () => {
    if (!memberId || memberId.trim() === '') {
      Alert.alert('Error', 'Member ID is required');
      return;
    }

    if (!visitDate) {
      Alert.alert('Error', 'Please select a visit date');
      return;
    }

    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(visitDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      Alert.alert('Error', 'Cannot select a past date');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload exactly as web portal expects
      const requestData = {
        affiliatedClubId: selectedClub.id,
        membershipNo: memberId,
        requestedDate: visitDate.toISOString().split('T')[0], // YYYY-MM-DD format
      };

      console.log('Sending request:', requestData);

      const response = await createAffiliatedClubRequest(requestData);

      Alert.alert(
        'Success',
        'Visit request submitted successfully! You will receive a confirmation email.',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
            }
          }
        ]
      );

    } catch (error) {
      console.log('Error submitting request:', error);
      let errorMessage = 'Failed to submit visit request. Please try again.';

      if (error.response) {
        // Handle specific HTTP errors
        const status = error.response.status;
        if (status === 404) {
          errorMessage = 'Member or club not found. Please check your membership number.';
        } else if (status === 400) {
          errorMessage = 'Invalid request data. Please check your information.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderClubCards = () => {
    if (clubsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A3834C" />
          <Text style={styles.loadingText}>Loading clubs...</Text>
        </View>
      );
    }

    if (clubs.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No affiliated clubs available</Text>
          <Text style={styles.noDataSubText}>
            There are currently no clubs in the system
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAffiliatedClubs}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredClubs.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={50} color="#ccc" />
          <Text style={styles.noResultsText}>No clubs found</Text>
          <Text style={styles.noResultsSubtext}>
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    return filteredClubs.map((club, index) => {
      const clubImage = club.image
        ? { uri: club.image }
        : require('../../assets/psc_home.jpeg');

      return (
        <TouchableOpacity
          key={club.id || index}
          style={styles.card}
          onPress={() => openVisitModal(club)}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={clubImage}
            style={styles.cardBackground}
            imageStyle={styles.cardImage}
          >
            <View style={styles.overlay} />
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{club.name}</Text>

                {club.location && (
                  <Text style={styles.cardDescription}>
                    📍 {club.location}
                  </Text>
                )}

                {/* {club.email && (
                  <Text style={styles.detailText}>
                    📧 {club.email}
                  </Text>
                )}

                {club.contactNo && (
                  <Text style={styles.detailText}>
                    📞 {club.contactNo}
                  </Text>
                )}

                {club.description && (
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {club.description}
                  </Text>
                )} */}

                {/* <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText,
                    club.isActive ? styles.statusActive : styles.statusInactive
                  ]}>
                    {club.isActive ? '✅ Available for Visits' : '❌ Not Available'}
                  </Text>
                </View> */}
              </View>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrowIcon}>›</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="arrow-back" size={28} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Affiliated Clubs</Text>
          </View>
        </ImageBackground>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clubs by name, location..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Results Count */}
        {searchQuery.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {filteredClubs.length} {filteredClubs.length === 1 ? 'club' : 'clubs'} found
            </Text>
          </View>
        )}

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
            <View style={styles.infoContainer}>
              {/* <Text style={styles.infoText}>
                🏢 Showing {clubs.length} affiliated clubs
              </Text> */}
              <Text style={styles.instructionText}>
                Tap on a club to request a visit
              </Text>
            </View>

            {renderClubCards()}
          </ScrollView>
        </SafeAreaView>

        {/* Visit Request Modal - Simplified to match web portal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Visit Request
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Club Info */}
                {selectedClub && (
                  <View style={styles.selectedClubInfo}>
                    <Text style={styles.selectedClubName}>{selectedClub.name}</Text>
                    {selectedClub.location && (
                      <Text style={styles.selectedClubLocation}>📍 {selectedClub.location}</Text>
                    )}
                  </View>
                )}

                {/* Membership Number */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Membership Number *</Text>
                  <TextInput
                    value={memberId}
                    onChangeText={setMemberId}
                    style={styles.input}
                    placeholder="Enter your membership number"
                    placeholderTextColor="#888"
                    editable={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {userProfile && (
                    <Text style={styles.hintText}>
                      Your profile: {userProfile.firstName || ''} {userProfile.lastName || ''}
                    </Text>
                  )}
                </View>

                {/* Visit Date Picker */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Visit Date *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formatDate(visitDate)}
                    </Text>
                    <Text style={styles.calendarIcon}>📅</Text>
                  </TouchableOpacity>
                  <Text style={styles.hintText}>
                    Select your preferred visit date
                  </Text>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={visitDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={styles.datePicker}
                  />
                )}

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                    disabled={loading}
                  >
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, styles.sendBtn]}
                    onPress={handleSendVisitRequest}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.modalBtnText}>Submit Request</Text>
                        <Text style={styles.submitIcon}>→</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Terms/Info */}
                <Text style={styles.termsText}>
                  By submitting, you agree that an email will be sent to you and the club for confirmation.
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Instructions Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={instructionsModalVisible}
          onRequestClose={() => setInstructionsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.instructionsModalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.instructionsTitle}>How to Request a Visit</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setInstructionsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Select a club from the list</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Enter your membership number</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Select your desired visit date</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>Submit your request</Text>
              </View>
              <Text style={styles.noteText}>
                Note: You will receive an email confirmation once your request is processed.
              </Text>

              <TouchableOpacity
                style={styles.gotItButton}
                onPress={() => setInstructionsModalVisible(false)}
              >
                <Text style={styles.gotItButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  notch: {
    paddingTop: 50,
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
  notchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 5,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
  },
  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  infoContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    marginLeft: 80
  },
  card: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBackground: {
    height: 180,
  },
  cardImage: {
    borderRadius: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: {
    flex: 1,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#4CAF50',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusInactive: {
    color: '#F44336',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  arrowContainer: {
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: 30,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#A3834C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A3834C',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A3834C',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  selectedClubInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#A3834C',
  },
  selectedClubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedClubLocation: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 18,
  },
  datePicker: {
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
  },
  sendBtn: {
    backgroundColor: '#A3834C',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  submitIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  // Instructions Modal Styles
  instructionsModalView: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    maxWidth: 400,
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A3834C',
    flex: 1,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A3834C',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    lineHeight: 18,
  },
  gotItButton: {
    backgroundColor: '#A3834C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  gotItButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default aff_club;