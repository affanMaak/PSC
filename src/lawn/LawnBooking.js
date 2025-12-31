// // import React, { useState, useEffect } from 'react';
// // import {
// //   StyleSheet,
// //   Text,
// //   View,
// //   TouchableOpacity,
// //   TextInput,
// //   ScrollView,
// //   SafeAreaView,
// //   Alert,
// //   StatusBar,
// //   ImageBackground,
// //   Modal,
// //   ActivityIndicator,
// //   Platform,
// // } from 'react-native';
// // import { Calendar } from 'react-native-calendars';
// // import Icon from 'react-native-vector-icons/AntDesign';
// // import Feather from 'react-native-vector-icons/Feather';
// // import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// // import DropDownPicker from 'react-native-dropdown-picker';
// // import { getUserData, lawnAPI, getAuthToken, base_url } from '../../config/apis';
// // import { useAuth } from '../auth/contexts/AuthContext';

// // const eventTypeOptions = [
// //   { label: 'Wedding Reception', value: 'wedding' },
// //   { label: 'Birthday Party', value: 'birthday' },
// //   { label: 'Corporate Event', value: 'corporate' },
// //   { label: 'Anniversary', value: 'anniversary' },
// //   { label: 'Family Gathering', value: 'family' },
// //   { label: 'Other Event', value: 'other' },
// // ];

// // const timeSlotOptions = [
// //   { label: 'Morning (8:00 AM - 2:00 PM)', value: 'MORNING' },
// //   { label: 'Evening (2:00 PM - 8:00 PM)', value: 'EVENING' },
// //   { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
// // ];

// // const LawnBooking = ({ route, navigation }) => {
// //   const { venue, categoryId } = route.params || {};
// //   const { user, isAuthenticated } = useAuth();

// //   // State variables
// //   const [selectedDate, setSelectedDate] = useState('');
// //   const [eventTypeOpen, setEventTypeOpen] = useState(false);
// //   const [selectedEventType, setSelectedEventType] = useState(null);
// //   const [numberOfGuests, setNumberOfGuests] = useState('');
// //   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
// //   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
// //   const [specialRequests, setSpecialRequests] = useState('');
// //   const [pricingType, setPricingType] = useState('member');

// //   // Member Booking States
// //   const [showBookingModal, setShowBookingModal] = useState(false);
// //   const [bookingLoading, setBookingLoading] = useState(false);
// //   const [userData, setUserData] = useState(null);
// //   const [isAdmin, setIsAdmin] = useState(false);

// //   // Extract membership number from user object
// //   const extractMembershipNo = () => {
// //     if (!user) return null;

// //     const possibleFields = [
// //       'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
// //       'membershipID', 'memberNo', 'memberNumber', 'membershipId',
// //       'id', 'userId', 'user_id', 'userID'
// //     ];

// //     for (const field of possibleFields) {
// //       if (user[field]) {
// //         return user[field].toString();
// //       }
// //     }

// //     if (user.data && typeof user.data === 'object') {
// //       for (const field of possibleFields) {
// //         if (user.data[field]) {
// //           return user.data[field].toString();
// //         }
// //       }
// //     }

// //     return null;
// //   };

// //   const membershipNo = extractMembershipNo();
// //   const userName = user?.name || user?.username || user?.fullName;

// //   useEffect(() => {
// //     console.log('🎯 LawnBooking mounted with params:', {
// //       venue: venue,
// //       venueId: venue?.id,
// //       venueDescription: venue?.description
// //     });

// //     checkUserStatus();

// //     if (venue) {
// //       setNumberOfGuests(venue.minGuests?.toString() || '50');
// //     }

// //     const today = new Date();
// //     const formattedDate = today.toISOString().split('T')[0];
// //     setSelectedDate(formattedDate);
// //   }, [venue]);

// //   const checkUserStatus = async () => {
// //     try {
// //       const userData = await getUserData();
// //       setUserData(userData);

// //       const currentUser = user || userData;

// //       if (!currentUser) {
// //         setIsAdmin(false);
// //         return;
// //       }

// //       const extractedUserRole =
// //         currentUser.role ||
// //         currentUser.Role ||
// //         currentUser.userRole ||
// //         currentUser.user_role;

// //       const isAdminUser = extractedUserRole && (
// //         extractedUserRole.toLowerCase() === 'admin' ||
// //         extractedUserRole.toLowerCase() === 'super_admin' ||
// //         extractedUserRole.toLowerCase() === 'superadmin'
// //       );

// //       setIsAdmin(isAdminUser);
// //       console.log('👤 User status:', {
// //         isAdmin: isAdminUser,
// //         role: extractedUserRole,
// //         userName: userName
// //       });

// //     } catch (error) {
// //       console.error('Error checking user status:', error);
// //       setIsAdmin(false);
// //     }
// //   };

// //   const validateMemberBooking = () => {
// //     console.log('🔍 Validating booking...');
// //     console.log('📝 Form data:', {
// //       selectedDate,
// //       selectedEventType,
// //       selectedTimeSlot,
// //       numberOfGuests,
// //       isAuthenticated,
// //       pricingType,
// //       venue: venue?.id
// //     });

// //     if (!isAuthenticated) {
// //       Alert.alert(
// //         'Authentication Required',
// //         'Please log in with a valid member account to book lawns.',
// //         [{ text: 'OK', style: 'cancel' }]
// //       );
// //       return false;
// //     }

// //     if (!selectedDate) {
// //       Alert.alert('Error', 'Please select a booking date');
// //       return false;
// //     }
// //     if (!selectedEventType) {
// //       Alert.alert('Error', 'Please select an event type');
// //       return false;
// //     }
// //     if (!selectedTimeSlot) {
// //       Alert.alert('Error', 'Please select a time slot');
// //       return false;
// //     }
// //     if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
// //       Alert.alert('Error', 'Please enter number of guests');
// //       return false;
// //     }

// //     const bookingDate = new Date(selectedDate);
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);

// //     if (bookingDate < today) {
// //       Alert.alert('Error', 'Booking date cannot be in the past');
// //       return false;
// //     }

// //     // Check guest count against lawn capacity
// //     if (venue) {
// //       const guests = parseInt(numberOfGuests);
// //       if (venue.minGuests && guests < venue.minGuests) {
// //         Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
// //         return false;
// //       }
// //       if (venue.maxGuests && guests > venue.maxGuests) {
// //         Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
// //         return false;
// //       }
// //     }

// //     console.log('✅ Validation passed');
// //     return true;
// //   };

// //   const handleMemberBooking = async () => {
// //     console.log('🚀 Starting lawn booking process...');

// //     if (!validateMemberBooking()) return;

// //     try {
// //       setBookingLoading(true);

// //       // Check auth token
// //       const token = await getAuthToken();
// //       console.log('🔑 Auth token status:', token ? 'Present' : 'Missing');
// //       console.log('🌐 Base URL:', base_url);

// //       const payload = {
// //         bookingDate: selectedDate,
// //         eventTime: selectedTimeSlot,
// //         eventType: selectedEventType,
// //         numberOfGuests: parseInt(numberOfGuests),
// //         specialRequest: specialRequests,
// //         pricingType: pricingType,
// //         membership_no: membershipNo || user?.id || 'MEMBER001', // Fallback for testing
// //       };

// //       console.log('📤 Sending lawn booking payload:', {
// //         lawnId: venue.id,
// //         payload: payload,
// //         fullUrl: `${base_url}/lawn/generate/invoice/lawn?lawnId=${venue.id}`
// //       });

// //       // Generate invoice for lawn booking
// //       const response = await lawnAPI.generateInvoiceLawn(venue.id, payload);

// //       console.log('✅ Invoice response:', response.data);

// //       if (response.data?.ResponseCode === '00') {
// //         Alert.alert(
// //           'Invoice Generated Successfully!',
// //           'Your lawn booking invoice has been created. Please complete the payment to confirm your reservation.',
// //           [
// //             {
// //               text: 'Proceed to Payment',
// //               onPress: () => {
// //                 // Navigate to payment/voucher screen
// //                 navigation.navigate('Voucher', {
// //                   invoiceData: response.data,
// //                   bookingType: 'LAWN',
// //                   venue: venue,
// //                   bookingDetails: {
// //                     ...payload,
// //                     lawnName: venue.description,
// //                     totalAmount: response.data.Data?.Amount,
// //                     bookingSummary: response.data.Data?.BookingSummary
// //                   }
// //                 });
// //               }
// //             },
// //             {
// //               text: 'View Details',
// //               onPress: () => {
// //                 setShowBookingModal(false);
// //               }
// //             }
// //           ]
// //         );
// //       } else {
// //         throw new Error(response.data?.ResponseMessage || 'Failed to generate invoice');
// //       }

// //     } catch (error) {
// //       console.error('❌ Lawn booking error:', {
// //         message: error.message,
// //         status: error.response?.status,
// //         statusText: error.response?.statusText,
// //         data: error.response?.data,
// //         url: error.config?.url,
// //         method: error.config?.method,
// //       });

// //       let errorMessage = 'Failed to process booking. Please try again.';

// //       if (error.response?.status === 401) {
// //         errorMessage = 'Authentication failed. Please log in again.';
// //         // Optionally navigate to login
// //         // navigation.navigate('Login');
// //       } else if (error.response?.status === 400) {
// //         errorMessage = error.response.data?.message || 'Invalid booking data provided.';
// //       } else if (error.response?.status === 404) {
// //         errorMessage = `Lawn not found or endpoint unavailable (404). Please check:\n\n• Backend server is running\n• Endpoint: POST /lawn/generate/invoice/lawn\n• Lawn ID: ${venue?.id} exists\n\nServer: ${base_url}`;
// //         console.log('🔍 Check if backend is running on:', base_url);
// //         console.log('🔍 Check if endpoint exists: POST /lawn/generate/invoice/lawn');
// //       } else if (error.response?.status === 409) {
// //         errorMessage = error.response.data?.message || 'Lawn not available for selected date and time.';
// //       } else if (error.message?.includes('Network Error')) {
// //         errorMessage = `Network error. Cannot connect to server at ${base_url}. Please check:\n\n• Internet connection\n• Backend server is running\n• CORS configuration\n\nPlatform: ${Platform.OS}`;
// //       } else if (error.message?.includes('timeout')) {
// //         errorMessage = 'Request timeout. Please try again.';
// //       } else if (error.message) {
// //         errorMessage = error.message;
// //       }

// //       Alert.alert('Booking Failed', errorMessage);
// //     } finally {
// //       setBookingLoading(false);
// //       setShowBookingModal(false);
// //     }
// //   };

// //   const formatDateForDisplay = (dateString) => {
// //     if (!dateString) return '';
// //     const [year, month, day] = dateString.split('-');
// //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// //     return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
// //   };

// //   const calculateTotalAmount = () => {
// //     if (!venue) return 'Rs. 0/-';
// //     const price = pricingType === 'member' ? venue.memberCharges : venue.guestCharges;
// //     return `Rs. ${price?.toLocaleString() || '0'}/-`;
// //   };

// //   const renderMemberBookingForm = () => {
// //     return (
// //       <>
// //         <View style={styles.memberInfoCard}>
// //           <View style={styles.memberInfoHeader}>
// //             <Text style={styles.memberInfoTitle}>Member Information</Text>
// //             <TouchableOpacity onPress={checkUserStatus} style={styles.refreshButton}>
// //               <Feather name="refresh-cw" size={16} color="#2E7D32" />
// //             </TouchableOpacity>
// //           </View>

// //           <View style={styles.memberInfoDisplay}>
// //             <View style={styles.infoRow}>
// //               <Text style={styles.infoLabel}>Name:</Text>
// //               <Text style={styles.infoValue}>
// //                 {userName || 'Member'}
// //               </Text>
// //             </View>
// //             <View style={styles.infoRow}>
// //               <Text style={styles.infoLabel}>Membership No:</Text>
// //               <Text style={styles.infoValue}>
// //                 {membershipNo || 'Auto-detected from login'}
// //               </Text>
// //             </View>
// //             <View style={styles.infoRow}>
// //               <Text style={styles.infoLabel}>Status:</Text>
// //               <Text style={[styles.infoValue, styles.sessionStatus]}>
// //                 {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
// //               </Text>
// //             </View>
// //           </View>

// //           {!isAuthenticated && (
// //             <View style={styles.warningBox}>
// //               <MaterialIcons name="error" size={16} color="#DC3545" />
// //               <Text style={styles.warningText}>
// //                 Please log in with a member account to book lawns.
// //               </Text>
// //             </View>
// //           )}
// //         </View>

// //         <View style={styles.sectionCard}>
// //           <View style={styles.sectionHeader}>
// //             <MaterialIcons name="event" size={22} color="#2E7D32" />
// //             <Text style={styles.sectionTitle}>Select Date</Text>
// //           </View>
// //           <Calendar
// //             current={selectedDate}
// //             minDate={new Date().toISOString().split('T')[0]}
// //             onDayPress={(day) => setSelectedDate(day.dateString)}
// //             markedDates={{
// //               [selectedDate]: {
// //                 selected: true,
// //                 selectedColor: '#2E7D32',
// //                 selectedTextColor: '#FFF',
// //               },
// //             }}
// //             theme={{
// //               calendarBackground: '#FFF',
// //               textSectionTitleColor: '#2E7D32',
// //               selectedDayBackgroundColor: '#2E7D32',
// //               selectedDayTextColor: '#FFF',
// //               todayTextColor: '#2E7D32',
// //               dayTextColor: '#2D3748',
// //               textDisabledColor: '#CBD5E0',
// //               dotColor: '#2E7D32',
// //               selectedDotColor: '#FFF',
// //               arrowColor: '#2E7D32',
// //               monthTextColor: '#2D3748',
// //               textDayFontSize: 14,
// //               textMonthFontSize: 16,
// //               textDayHeaderFontSize: 14,
// //             }}
// //             style={styles.calendar}
// //           />
// //           {selectedDate && (
// //             <View style={styles.selectedDateContainer}>
// //               <Feather name="calendar" size={16} color="#2E7D32" />
// //               <Text style={styles.selectedDateText}>
// //                 Selected: {formatDateForDisplay(selectedDate)}
// //               </Text>
// //             </View>
// //           )}
// //         </View>

// //         <View style={styles.sectionCard}>
// //           <View style={styles.sectionHeader}>
// //             <MaterialIcons name="event-available" size={22} color="#2E7D32" />
// //             <Text style={styles.sectionTitle}>Event Details</Text>
// //           </View>

// //           <View style={styles.inputGroup}>
// //             <Feather name="users" size={20} color="#2E7D32" style={styles.inputIcon} />
// //             <TextInput
// //               style={styles.input}
// //               onChangeText={setNumberOfGuests}
// //               value={numberOfGuests}
// //               placeholder="Number of Guests"
// //               placeholderTextColor="#A0AEC0"
// //               keyboardType="numeric"
// //             />
// //           </View>

// //           <View style={styles.dropdownSection}>
// //             <Text style={styles.sectionLabel}>Event Type</Text>
// //             <DropDownPicker
// //               open={eventTypeOpen}
// //               value={selectedEventType}
// //               items={eventTypeOptions}
// //               setOpen={setEventTypeOpen}
// //               setValue={setSelectedEventType}
// //               placeholder="Select Event Type"
// //               style={styles.dropdown}
// //               dropDownContainerStyle={styles.dropdownContainer}
// //               zIndex={4000}
// //               zIndexInverse={1000}
// //             />
// //           </View>

// //           <View style={styles.dropdownSection}>
// //             <Text style={styles.sectionLabel}>Time Slot</Text>
// //             <DropDownPicker
// //               open={timeSlotOpen}
// //               value={selectedTimeSlot}
// //               items={timeSlotOptions}
// //               setOpen={setTimeSlotOpen}
// //               setValue={setSelectedTimeSlot}
// //               placeholder="Select Time Slot"
// //               style={styles.dropdown}
// //               dropDownContainerStyle={styles.dropdownContainer}
// //               zIndex={3000}
// //               zIndexInverse={2000}
// //             />
// //           </View>

// //           <View style={styles.pricingTypeSection}>
// //             <Text style={styles.sectionLabel}>Pricing Type</Text>
// //             <View style={styles.pricingTypeButtons}>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.pricingTypeButton,
// //                   pricingType === 'member' && styles.pricingTypeButtonActive
// //                 ]}
// //                 onPress={() => setPricingType('member')}
// //               >
// //                 <Text style={[
// //                   styles.pricingTypeButtonText,
// //                   pricingType === 'member' && styles.pricingTypeButtonTextActive
// //                 ]}>
// //                   Member Pricing
// //                 </Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.pricingTypeButton,
// //                   pricingType === 'guest' && styles.pricingTypeButtonActive
// //                 ]}
// //                 onPress={() => setPricingType('guest')}
// //               >
// //                 <Text style={[
// //                   styles.pricingTypeButtonText,
// //                   pricingType === 'guest' && styles.pricingTypeButtonTextActive
// //                 ]}>
// //                   Guest Pricing
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>

// //         <View style={styles.sectionCard}>
// //           <View style={styles.sectionHeader}>
// //             <MaterialIcons name="edit" size={22} color="#2E7D32" />
// //             <Text style={styles.sectionTitle}>Special Requests</Text>
// //           </View>
// //           <View style={styles.inputGroup}>
// //             <Feather name="edit-3" size={20} color="#2E7D32" style={styles.inputIcon} />
// //             <TextInput
// //               style={[styles.input, styles.textArea]}
// //               onChangeText={setSpecialRequests}
// //               value={specialRequests}
// //               placeholder="Any special requirements or requests..."
// //               placeholderTextColor="#A0AEC0"
// //               multiline
// //               numberOfLines={4}
// //               textAlignVertical="top"
// //             />
// //           </View>
// //         </View>

// //         <View style={styles.totalCard}>
// //           <Text style={styles.totalLabel}>Total Amount</Text>
// //           <Text style={styles.totalAmount}>{calculateTotalAmount()}</Text>
// //           <Text style={styles.totalNote}>
// //             * {pricingType === 'member' ? 'Member' : 'Guest'} pricing applied
// //           </Text>
// //         </View>

// //         <TouchableOpacity
// //           style={[
// //             styles.submitButton,
// //             (!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !isAuthenticated) &&
// //             styles.submitButtonDisabled
// //           ]}
// //           onPress={() => setShowBookingModal(true)}
// //           disabled={!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !isAuthenticated}
// //         >
// //           <Text style={styles.submitButtonText}>Book Now</Text>
// //           <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
// //         </TouchableOpacity>

// //         {/* Debug Info - Remove in production
// //         <View style={styles.debugContainer}>
// //           <Text style={styles.debugTitle}>Debug Info</Text>
// //           <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
// //           <Text style={styles.debugText}>Base URL: {base_url}</Text>
// //           <Text style={styles.debugText}>Lawn ID: {venue?.id}</Text>
// //           <Text style={styles.debugText}>Auth Status: {isAuthenticated ? '✅' : '❌'}</Text>
// //           <TouchableOpacity
// //             style={styles.debugButton}
// //             onPress={async () => {
// //               const token = await getAuthToken();
// //               Alert.alert(
// //                 'Debug Info',
// //                 `Platform: ${Platform.OS}\nBase URL: ${base_url}\nEndpoint: /lawn/generate/invoice/lawn\nLawn ID: ${venue?.id}\nAuth Token: ${token ? 'Present' : 'Missing'}\nUser: ${userName || 'Not logged in'}`
// //               );
// //             }}
// //           >
// //             <Text style={styles.debugButtonText}>Show Debug Info</Text>
// //           </TouchableOpacity>
// //         </View> */}
// //       </>
// //     );
// //   };

// //   const renderVenueInfo = () => {
// //     if (!venue) return null;

// //     return (
// //       <View style={styles.venueInfoCard}>
// //         <Text style={styles.venueInfoTitle}>Booking Summary</Text>
// //         <View style={styles.venueDetails}>
// //           <Text style={styles.venueName}>{venue.description || 'Lawn'} (ID: {venue.id})</Text>
// //           <View style={styles.venueStats}>
// //             <Text style={styles.venueStat}>
// //               Capacity: {venue.minGuests || 0} - {venue.maxGuests || 0} guests
// //             </Text>
// //             <Text style={styles.venueStat}>
// //               Member Price: Rs. {venue.memberCharges?.toLocaleString() || '0'}/-
// //             </Text>
// //             <Text style={styles.venueStat}>
// //               Guest Price: Rs. {venue.guestCharges?.toLocaleString() || '0'}/-
// //             </Text>
// //           </View>

// //           {!isAdmin && (
// //             <View style={styles.memberInfo}>
// //               <Text style={styles.memberInfoText}>
// //                 👤 Booking as: {userName || 'Member'}
// //               </Text>
// //               {/* <Text style={styles.memberInfoText}>
// //                 🔐 Authentication: {isAuthenticated ? 'Verified' : 'Required'}
// //               </Text> */}
// //             </View>
// //           )}
// //         </View>
// //       </View>
// //     );
// //   };

// //   return (
// //     <>
// //       <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
// //       <SafeAreaView style={styles.container}>
// //         <ImageBackground
// //           source={require('../../assets/notch.jpg')}
// //           style={styles.headerBackground}
// //           imageStyle={styles.headerImage}
// //         >
// //           <View style={styles.header}>
// //             <TouchableOpacity
// //               style={styles.backButton}
// //               onPress={() => navigation.goBack()}
// //             >
// //               <Icon name="arrowleft" size={24} color="#FFF" />
// //             </TouchableOpacity>
// //             <View style={styles.headerTitleContainer}>
// //               <Text style={styles.headerTitle}>
// //                 Book Lawn
// //               </Text>
// //               <Text style={styles.headerSubtitle}>
// //                 {venue?.description || 'Select Lawn'} (ID: {venue?.id})
// //               </Text>
// //             </View>
// //             <View style={styles.placeholder} />
// //           </View>
// //         </ImageBackground>

// //         <ScrollView
// //           style={styles.scrollView}
// //           contentContainerStyle={styles.scrollContent}
// //           showsVerticalScrollIndicator={false}
// //         >
// //           {renderVenueInfo()}
// //           {renderMemberBookingForm()}
// //           <View style={styles.footerSpacer} />
// //         </ScrollView>

// //         {/* Member Booking Confirmation Modal */}
// //         <Modal
// //           visible={showBookingModal}
// //           animationType="slide"
// //           transparent={true}
// //         >
// //           <View style={styles.modalOverlay}>
// //             <View style={styles.modalContainer}>
// //               <View style={styles.modalHeader}>
// //                 <Text style={styles.modalTitle}>Confirm Lawn Booking</Text>
// //                 <TouchableOpacity onPress={() => setShowBookingModal(false)}>
// //                   <Icon name="close" size={24} color="#666" />
// //                 </TouchableOpacity>
// //               </View>

// //               <ScrollView style={styles.modalContent}>
// //                 <View style={styles.bookingSummary}>
// //                   <Text style={styles.summaryTitle}>Booking Details</Text>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Lawn:</Text>
// //                     <Text style={styles.summaryValue}>{venue?.description || 'Lawn'} (ID: {venue?.id})</Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Date:</Text>
// //                     <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Event Type:</Text>
// //                     <Text style={styles.summaryValue}>
// //                       {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}
// //                     </Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Time Slot:</Text>
// //                     <Text style={styles.summaryValue}>
// //                       {timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label || selectedTimeSlot}
// //                     </Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Guests:</Text>
// //                     <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Pricing Type:</Text>
// //                     <Text style={styles.summaryValue}>
// //                       {pricingType === 'member' ? 'Member Rate' : 'Guest Rate'}
// //                     </Text>
// //                   </View>

// //                   <View style={styles.summaryRow}>
// //                     <Text style={styles.summaryLabel}>Total Amount:</Text>
// //                     <Text style={styles.summaryValue}>{calculateTotalAmount()}</Text>
// //                   </View>
// //                 </View>

// //                 <View style={styles.infoBox}>
// //                   <MaterialIcons name="info" size={16} color="#2E7D32" />
// //                   <Text style={styles.infoText}>
// //                     You'll be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.
// //                   </Text>
// //                 </View>
// //               </ScrollView>

// //               <View style={styles.modalFooter}>
// //                 <TouchableOpacity
// //                   style={styles.cancelButton}
// //                   onPress={() => setShowBookingModal(false)}
// //                 >
// //                   <Text style={styles.cancelButtonText}>Cancel</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity
// //                   style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
// //                   onPress={handleMemberBooking}
// //                   disabled={bookingLoading}
// //                 >
// //                   {bookingLoading ? (
// //                     <ActivityIndicator size="small" color="#FFF" />
// //                   ) : (
// //                     <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// //                   )}
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         </Modal>
// //       </SafeAreaView>
// //     </>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F7FAFC',
// //   },
// //   headerBackground: {
// //     paddingTop: 50,
// //     paddingBottom: 20,
// //     paddingHorizontal: 20,
// //     borderBottomLeftRadius: 25,
// //     borderBottomRightRadius: 25,
// //     overflow: 'hidden',
// //   },
// //   headerImage: {
// //     opacity: 0.9,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //   },
// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.3)',
// //     borderRadius: 20,
// //   },
// //   headerTitleContainer: {
// //     flex: 1,
// //     alignItems: 'center',
// //   },
// //   headerTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#FFF',
// //     textShadowColor: 'rgba(0,0,0,0.5)',
// //     textShadowOffset: { width: 1, height: 1 },
// //     textShadowRadius: 3,
// //   },
// //   headerSubtitle: {
// //     fontSize: 14,
// //     color: '#FFF',
// //     marginTop: 4,
// //     textShadowColor: 'rgba(0,0,0,0.5)',
// //     textShadowOffset: { width: 1, height: 1 },
// //     textShadowRadius: 2,
// //   },
// //   placeholder: {
// //     width: 40,
// //   },
// //   scrollView: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     paddingVertical: 15,
// //   },

// //   // Venue Info
// //   venueInfoCard: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 20,
// //     borderRadius: 16,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#2E7D32',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   venueInfoTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#2E7D32',
// //     marginBottom: 10,
// //   },
// //   venueName: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#2D3748',
// //     marginBottom: 10,
// //   },
// //   venueStats: {
// //     gap: 5,
// //     marginBottom: 10,
// //   },
// //   venueStat: {
// //     fontSize: 14,
// //     color: '#4A5568',
// //     fontWeight: '500',
// //   },

// //   // Member Info Card
// //   memberInfoCard: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 15,
// //     borderRadius: 12,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#2E7D32',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   memberInfoHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //   },
// //   memberInfoTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#2D3748',
// //   },

// //   memberInfo: {
// //     marginTop: 10,
// //     padding: 10,
// //     backgroundColor: '#e8f5e8',
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#4CAF50',
// //   },
// //   memberInfoText: {
// //     fontSize: 14,
// //     color: '#2E7D32',
// //     fontWeight: '600',
// //   },

// //   // Section Cards
// //   sectionCard: {
// //     backgroundColor: '#FFF',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 20,
// //     borderRadius: 16,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   sectionHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#2D3748',
// //     marginLeft: 10,
// //   },
// //   sectionLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 10,
// //   },

// //   // Member Info Display
// //   memberInfoDisplay: {
// //     backgroundColor: '#F8F9FA',
// //     padding: 15,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#E9ECEF',
// //   },
// //   infoRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 8,
// //   },
// //   infoLabel: {
// //     fontSize: 14,
// //     color: '#6C757D',
// //     fontWeight: '600',
// //   },
// //   infoValue: {
// //     fontSize: 14,
// //     color: '#495057',
// //     fontWeight: '500',
// //   },

// //   // Calendar
// //   calendar: {
// //     borderRadius: 12,
// //     overflow: 'hidden',
// //   },
// //   selectedDateContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginTop: 15,
// //     padding: 12,
// //     backgroundColor: '#F0FFF4',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#9AE6B4',
// //   },
// //   selectedDateText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#2D3748',
// //     marginLeft: 8,
// //   },

// //   // Inputs
// //   inputGroup: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#F7FAFC',
// //     borderRadius: 12,
// //     paddingHorizontal: 15,
// //     marginBottom: 15,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   inputIcon: {
// //     marginRight: 12,
// //   },
// //   input: {
// //     flex: 1,
// //     height: 50,
// //     fontSize: 16,
// //     color: '#2D3748',
// //   },
// //   textArea: {
// //     height: 80,
// //     paddingVertical: 12,
// //   },

// //   // Dropdown
// //   dropdownSection: {
// //     marginBottom: 20,
// //   },
// //   dropdown: {
// //     backgroundColor: '#F7FAFC',
// //     borderColor: '#E2E8F0',
// //     borderWidth: 1,
// //     borderRadius: 12,
// //   },
// //   dropdownContainer: {
// //     backgroundColor: '#F7FAFC',
// //     borderColor: '#E2E8F0',
// //     borderRadius: 12,
// //   },

// //   // Pricing Type Section
// //   pricingTypeSection: {
// //     marginBottom: 10,
// //   },
// //   pricingTypeButtons: {
// //     flexDirection: 'row',
// //     gap: 10,
// //   },
// //   pricingTypeButton: {
// //     flex: 1,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //     backgroundColor: '#F7FAFC',
// //   },
// //   pricingTypeButtonActive: {
// //     backgroundColor: '#2E7D32',
// //     borderColor: '#2E7D32',
// //   },
// //   pricingTypeButtonText: {
// //     fontSize: 14,
// //     color: '#4A5568',
// //     fontWeight: '600',
// //   },
// //   pricingTypeButtonTextActive: {
// //     color: '#FFF',
// //   },

// //   // Button Disabled State
// //   buttonDisabled: {
// //     backgroundColor: '#CBD5E0',
// //     opacity: 0.6,
// //   },

// //   // Total Amount
// //   totalCard: {
// //     backgroundColor: '#2D3748',
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     padding: 20,
// //     borderRadius: 16,
// //     alignItems: 'center',
// //   },
// //   totalLabel: {
// //     fontSize: 16,
// //     color: '#CBD5E0',
// //     marginBottom: 8,
// //   },
// //   totalAmount: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: '#FFF',
// //     marginBottom: 8,
// //   },
// //   totalNote: {
// //     fontSize: 12,
// //     color: '#A0AEC0',
// //     fontStyle: 'italic',
// //   },

// //   // Submit Button
// //   submitButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#2E7D32',
// //     marginHorizontal: 15,
// //     paddingVertical: 18,
// //     borderRadius: 12,
// //     shadowColor: '#2E7D32',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     elevation: 6,
// //   },
// //   submitButtonDisabled: {
// //     backgroundColor: '#CBD5E0',
// //     shadowColor: 'transparent',
// //   },
// //   submitButtonText: {
// //     color: '#FFF',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     marginRight: 8,
// //   },

// //   // Footer Spacer
// //   footerSpacer: {
// //     height: 30,
// //   },

// //   // Modal Styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContainer: {
// //     backgroundColor: '#FFF',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: '80%',
// //     padding: 20,
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //   },
// //   modalContent: {
// //     flex: 1,
// //   },

// //   // Booking Summary
// //   bookingSummary: {
// //     backgroundColor: '#F8F9FA',
// //     padding: 15,
// //     borderRadius: 8,
// //     marginBottom: 20,
// //   },
// //   summaryTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 15,
// //     textAlign: 'center',
// //   },
// //   summaryRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //     paddingVertical: 5,
// //   },
// //   summaryLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //     fontWeight: '600',
// //   },
// //   summaryValue: {
// //     fontSize: 14,
// //     color: '#333',
// //     fontWeight: '500',
// //     textAlign: 'right',
// //     flex: 1,
// //     marginLeft: 10,
// //   },

// //   // Info Box
// //   infoBox: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     backgroundColor: '#FFF8E1',
// //     padding: 12,
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#2E7D32',
// //   },
// //   infoText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: '#8D6E63',
// //     marginLeft: 8,
// //     lineHeight: 16,
// //   },

// //   // Warning Box
// //   warningBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FFE6E6',
// //     padding: 12,
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#DC3545',
// //     marginTop: 10,
// //   },
// //   warningText: {
// //     fontSize: 12,
// //     color: '#DC3545',
// //     marginLeft: 8,
// //     flex: 1,
// //   },

// //   // Modal Actions
// //   modalActions: {
// //     flexDirection: 'row',
// //     gap: 10,
// //   },
// //   modalButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   cancelButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#6c757d',
// //   },
// //   confirmButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#2E7D32',
// //   },
// //   cancelButtonText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   confirmButtonText: {
// //     color: '#FFF',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },

// //   // Modal Footer
// //   modalFooter: {
// //     flexDirection: 'row',
// //     gap: 10,
// //     marginTop: 20,
// //   },

// //   // Session Status
// //   sessionStatus: {
// //     color: '#28a745',
// //     fontWeight: 'bold',
// //   },

// //   // Refresh Button
// //   refreshButton: {
// //     padding: 5,
// //   },

// //   // Debug Container
// //   debugContainer: {
// //     backgroundColor: '#f8f9fa',
// //     padding: 15,
// //     borderRadius: 8,
// //     marginHorizontal: 15,
// //     marginTop: 10,
// //     borderWidth: 1,
// //     borderColor: '#dee2e6',
// //   },
// //   debugTitle: {
// //     fontSize: 14,
// //     fontWeight: 'bold',
// //     color: '#495057',
// //     marginBottom: 8,
// //   },
// //   debugText: {
// //     fontSize: 12,
// //     color: '#6c757d',
// //     marginBottom: 4,
// //     fontFamily: 'monospace',
// //   },
// //   debugButton: {
// //     backgroundColor: '#6c757d',
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //     borderRadius: 6,
// //     alignSelf: 'flex-start',
// //     marginTop: 8,
// //   },
// //   debugButtonText: {
// //     color: '#fff',
// //     fontSize: 12,
// //     fontWeight: '500',
// //   },
// // });

// // export default LawnBooking;


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   SafeAreaView,
//   Alert,
//   StatusBar,
//   ImageBackground,
//   Modal,
//   ActivityIndicator,
//   Platform,
//   Switch,
//   KeyboardAvoidingView,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { getUserData, lawnAPI, getAuthToken, base_url } from '../../config/apis';
// import { useAuth } from '../auth/contexts/AuthContext';

// const eventTypeOptions = [
//   { label: 'Wedding Reception', value: 'wedding' },
//   { label: 'Birthday Party', value: 'birthday' },
//   { label: 'Corporate Event', value: 'corporate' },
//   { label: 'Anniversary', value: 'anniversary' },
//   { label: 'Family Gathering', value: 'family' },
//   { label: 'Other Event', value: 'other' },
// ];

// const timeSlotOptions = [
//   { label: 'Morning (8:00 AM - 2:00 PM)', value: 'MORNING' },
//   { label: 'Evening (2:00 PM - 8:00 PM)', value: 'EVENING' },
//   { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
// ];

// const LawnBooking = ({ route, navigation }) => {
//   const { venue } = route.params || {};
//   const { user, isAuthenticated } = useAuth();

//   // Refs for dropdown z-index management
//   const scrollViewRef = useRef(null);

//   // State variables
//   const [selectedDate, setSelectedDate] = useState('');
//   const [eventTypeOpen, setEventTypeOpen] = useState(false);
//   const [selectedEventType, setSelectedEventType] = useState(null);
//   const [numberOfGuests, setNumberOfGuests] = useState('');
//   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
//   const [specialRequests, setSpecialRequests] = useState('');

//   // Guest Booking States
//   const [isGuest, setIsGuest] = useState(true); // Guest selected by default
//   const [guestName, setGuestName] = useState('');
//   const [guestContact, setGuestContact] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [userData, setUserData] = useState(null);

//   // Admin Reservation States
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Booking Modal State
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   // Extract membership number from user object
//   const extractMembershipNo = () => {
//     const targets = [user, userData];
//     const possibleFields = [
//       'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
//       'membershipID', 'memberNo', 'memberNumber', 'membershipId',
//       'id', 'userId', 'user_id', 'userID'
//     ];

//     for (const target of targets) {
//       if (!target) continue;

//       for (const field of possibleFields) {
//         if (target[field]) {
//           return target[field].toString();
//         }
//       }

//       if (target.data && typeof target.data === 'object') {
//         for (const field of possibleFields) {
//           if (target.data[field]) {
//             return target.data[field].toString();
//           }
//         }
//       }
//     }

//     return null;
//   };

//   const membershipNo = extractMembershipNo();
//   const userName = user?.name || user?.username || user?.fullName || userData?.name || userData?.username || userData?.fullName;

//   useEffect(() => {
//     console.log('🎯 LawnBooking mounted with params:', {
//       venue: venue,
//       venueId: venue?.id,
//       venueDescription: venue?.description
//     });

//     checkUserStatus();

//     if (venue) {
//       setNumberOfGuests(venue.minGuests?.toString() || '50');
//     }

//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     setSelectedDate(formattedDate);
//   }, [venue]);

//   const checkUserStatus = async () => {
//     try {
//       const fetchedUserData = await getUserData();
//       setUserData(fetchedUserData);

//       const currentUser = user || fetchedUserData;

//       if (!currentUser) {
//         setIsAdmin(false);
//         return;
//       }

//       const extractedUserRole =
//         currentUser.role ||
//         currentUser.Role ||
//         currentUser.userRole ||
//         currentUser.user_role;

//       const isAdminUser = extractedUserRole && (
//         extractedUserRole.toLowerCase() === 'admin' ||
//         extractedUserRole.toLowerCase() === 'super_admin' ||
//         extractedUserRole.toLowerCase() === 'superadmin'
//       );

//       setIsAdmin(isAdminUser);
//       console.log('👤 User status:', {
//         isAdmin: isAdminUser,
//         role: extractedUserRole,
//         userName: userName
//       });

//     } catch (error) {
//       console.error('Error checking user status:', error);
//       setIsAdmin(false);
//     }
//   };

//   // ... (keep the imports and initial code the same until the handleGenerateInvoice function)

//   const handleGenerateInvoice = async () => {
//     // Validation (same as before)
//     if (!selectedDate) {
//       Alert.alert('Error', 'Please select a booking date');
//       return;
//     }
//     if (!selectedEventType) {
//       Alert.alert('Error', 'Please select an event type');
//       return;
//     }
//     if (!selectedTimeSlot) {
//       Alert.alert('Error', 'Please select a time slot');
//       return;
//     }
//     if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
//       Alert.alert('Error', 'Please enter number of guests');
//       return;
//     }

//     // Guest validation
//     if (isGuest) {
//       if (!guestName.trim()) {
//         Alert.alert('Error', 'Please enter guest name');
//         return;
//       }
//       if (!guestContact.trim() || guestContact.length < 10) {
//         Alert.alert('Error', 'Please enter a valid phone number');
//         return;
//       }
//     }

//     // Member validation
//     if (!isGuest && !isAuthenticated) {
//       Alert.alert(
//         'Authentication Required',
//         'Please login to book a lawn.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Go to Login',
//             onPress: () => navigation.reset({
//               index: 0,
//               routes: [{ name: 'LoginScr' }],
//             })
//           }
//         ]
//       );
//       return;
//     }

//     // Check guest count against lawn capacity
//     if (venue) {
//       const guests = parseInt(numberOfGuests);
//       if (venue.minGuests && guests < venue.minGuests) {
//         Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
//         return;
//       }
//       if (venue.maxGuests && guests > venue.maxGuests) {
//         Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
//         return;
//       }
//     }

//     setBookingLoading(true);
//     // In the handleGenerateInvoice function, replace the booking creation part:

//     try {
//       // Prepare booking data
//       const totalPrice = isGuest ? venue.guestCharges : venue.memberCharges;

//       // First, generate the invoice
//       const invoicePayload = {
//         bookingDate: selectedDate,
//         eventTime: selectedTimeSlot,
//         eventType: selectedEventType,
//         numberOfGuests: parseInt(numberOfGuests),
//         specialRequest: specialRequests || '',
//         pricingType: isGuest ? 'guest' : 'member',
//         membership_no: !isGuest ? membershipNo : null,
//         guestName: isGuest ? guestName : null,
//         guestContact: isGuest ? guestContact : null,
//       };

//       console.log('🧾 Generating invoice with:', invoicePayload);

//       const invoiceResponse = await lawnAPI.generateInvoiceLawn(venue.id, invoicePayload);

//       console.log('✅ Invoice response:', invoiceResponse.data);

//       if (invoiceResponse.data.ResponseCode === '00') {
//         // Now create the booking - FIX: Use direct fetch with correct endpoint
//         const bookingPayload = {
//           consumerInfo: {
//             membership_no: !isGuest ? membershipNo : 'GUEST',
//           },
//           bookingData: {
//             lawnId: venue.id.toString(), // Convert to string
//             bookingDate: selectedDate,
//             eventTime: selectedTimeSlot,
//             eventType: selectedEventType,
//             numberOfGuests: parseInt(numberOfGuests),
//             specialRequest: specialRequests || '',
//             pricingType: isGuest ? 'guest' : 'member',
//             totalPrice: totalPrice.toString(), // Convert to string
//             paidBy: isGuest ? 'GUEST' : 'MEMBER',
//             guestName: isGuest ? guestName : '',
//             guestContact: isGuest ? guestContact : '',
//           }
//         };

//         console.log('📤 Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

//         try {
//           // Try to create booking with direct fetch (like in your working example)
//           const bookingResponse = await fetch('http://localhost:3000/booking/member/booking/lawn', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${await getAuthToken()}`,
//             },
//             body: JSON.stringify(bookingPayload),
//           });

//           let bookingData;
//           if (bookingResponse.ok) {
//             bookingData = await bookingResponse.json();
//             console.log('✅ Booking created successfully:', bookingData);
//           } else {
//             // If booking fails, we'll still show the invoice
//             console.warn('⚠️ Booking creation failed, but invoice was generated');
//             bookingData = {
//               success: false,
//               message: 'Booking creation failed, but invoice was generated',
//             };
//           }

//           // Always navigate to voucher with invoice data
//           const invoiceNumber = invoiceResponse.data.Data?.InvoiceNumber ||
//             invoiceResponse.data.InvoiceNumber ||
//             `INV-LAWN-${Date.now()}`;

//           navigation.navigate('Voucher', {
//             invoiceData: invoiceResponse.data.Data || invoiceResponse.data,
//             invoiceNumber: invoiceNumber,
//             bookingType: 'LAWN',
//             venue: venue,
//             bookingDetails: {
//               ...invoicePayload,
//               lawnName: venue.description,
//               totalAmount: invoiceResponse.data.Data?.Amount || invoiceResponse.data.Amount,
//               bookingSummary: invoiceResponse.data.Data?.BookingSummary,
//               bookingId: bookingData?.booking?.id || bookingData?.bookingId,
//               invoiceNumber: invoiceNumber
//             },
//             bookingId: bookingData?.booking?.id || bookingData?.bookingId,
//             isGuest: isGuest,
//             memberDetails: !isGuest ? {
//               memberName: userName,
//               membershipNo: membershipNo
//             } : null,
//             guestDetails: isGuest ? {
//               guestName,
//               guestContact
//             } : null,
//             bookingSuccess: bookingResponse.ok,
//             bookingError: !bookingResponse.ok ? 'Booking creation failed, but invoice was generated' : null
//           });

//         } catch (bookingError) {
//           console.error('❌ Booking creation error:', bookingError);
//           // Still navigate to voucher even if booking fails
//           const invoiceNumber = invoiceResponse.data.Data?.InvoiceNumber ||
//             invoiceResponse.data.InvoiceNumber ||
//             `INV-LAWN-${Date.now()}`;

//           navigation.navigate('Voucher', {
//             invoiceData: invoiceResponse.data.Data || invoiceResponse.data,
//             invoiceNumber: invoiceNumber,
//             bookingType: 'LAWN',
//             venue: venue,
//             bookingDetails: {
//               ...invoicePayload,
//               lawnName: venue.description,
//               totalAmount: invoiceResponse.data.Data?.Amount || invoiceResponse.data.Amount,
//               bookingSummary: invoiceResponse.data.Data?.BookingSummary,
//               invoiceNumber: invoiceNumber
//             },
//             isGuest: isGuest,
//             memberDetails: !isGuest ? {
//               memberName: userName,
//               membershipNo: membershipNo
//             } : null,
//             guestDetails: isGuest ? {
//               guestName,
//               guestContact
//             } : null,
//             bookingSuccess: false,
//             bookingError: bookingError.message
//           });
//         }
//       } else {
//         throw new Error(invoiceResponse.data.ResponseMessage || 'Failed to generate invoice');
//       }

//     } catch (error) {
//       setBookingLoading(false);
//       setShowBookingModal(false);

//       console.error('❌ Error in handleGenerateInvoice:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });

//       let errorMessage = 'Failed to process booking. Please try again.';

//       if (error.response?.status === 400) {
//         const serverMsg = error.response.data?.message;
//         errorMessage = serverMsg || 'Invalid booking data provided.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Booking endpoint not found. Please check backend configuration.';
//       } else if (error.response?.status === 500) {
//         const serverError = error.response.data;
//         if (serverError && typeof serverError === 'object') {
//           errorMessage = `Server Error: ${serverError.message || serverError.error || 'Internal server error'}`;
//         }
//       }

//       Alert.alert('Booking Failed', errorMessage);
//     } finally {
//       setBookingLoading(false);
//     }
//   };
//   //   try {
//   //     // Prepare booking data
//   //     const totalPrice = isGuest ? venue.guestCharges : venue.memberCharges;

//   //     // First, generate the invoice
//   //     const invoicePayload = {
//   //       bookingDate: selectedDate,
//   //       eventTime: selectedTimeSlot,
//   //       eventType: selectedEventType,
//   //       numberOfGuests: parseInt(numberOfGuests),
//   //       specialRequest: specialRequests || '',
//   //       pricingType: isGuest ? 'guest' : 'member',
//   //       membership_no: !isGuest ? membershipNo : null,
//   //       guestName: isGuest ? guestName : null,
//   //       guestContact: isGuest ? guestContact : null,
//   //     };

//   //     console.log('🧾 Generating invoice with:', invoicePayload);

//   //     const invoiceResponse = await lawnAPI.generateInvoiceLawn(venue.id, invoicePayload);

//   //     console.log('✅ Invoice response:', invoiceResponse.data);

//   //     if (invoiceResponse.data.ResponseCode === '00') {
//   //       // Now create the booking with the correct payload structure
//   //       // Based on your backend, it expects consumerInfo and bookingData
//   //       const bookingPayload = {
//   //         consumerInfo: {
//   //           membership_no: !isGuest ? membershipNo : 'GUEST',
//   //         },
//   //         bookingData: {
//   //           lawnId: venue.id.toString(), // Convert to string
//   //           bookingDate: selectedDate,
//   //           eventTime: selectedTimeSlot,
//   //           eventType: selectedEventType,
//   //           numberOfGuests: parseInt(numberOfGuests),
//   //           specialRequest: specialRequests || '',
//   //           pricingType: isGuest ? 'guest' : 'member',
//   //           totalPrice: totalPrice.toString(), // Convert to string
//   //           paidBy: isGuest ? 'GUEST' : 'MEMBER',
//   //           guestName: isGuest ? guestName : '',
//   //           guestContact: isGuest ? guestContact : '',
//   //         }
//   //       };

//   //       console.log('📤 Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

//   //       try {
//   //         // Call the member booking endpoint
//   //         const bookingResponse = await lawnAPI.createLawnBooking(bookingPayload);

//   //         console.log('✅ Booking created successfully:', bookingResponse.data);

//   //         // Navigate to voucher with all data
//   //         navigation.navigate('Voucher', {
//   //           invoiceData: invoiceResponse.data.Data || invoiceResponse.data,
//   //           invoiceNumber: invoiceResponse.data.Data?.InvoiceNumber,
//   //           bookingType: 'LAWN',
//   //           venue: venue,
//   //           bookingDetails: {
//   //             ...invoicePayload,
//   //             lawnName: venue.description,
//   //             totalAmount: invoiceResponse.data.Data?.Amount || invoiceResponse.data.Amount,
//   //             bookingSummary: invoiceResponse.data.Data?.BookingSummary,
//   //             bookingId: bookingResponse.data?.booking?.id || bookingResponse.data?.bookingId,
//   //             invoiceNumber: invoiceResponse.data.Data?.InvoiceNumber
//   //           },
//   //           bookingId: bookingResponse.data?.booking?.id || bookingResponse.data?.bookingId,
//   //           isGuest: isGuest,
//   //           memberDetails: !isGuest ? {
//   //             memberName: userName,
//   //             membershipNo: membershipNo
//   //           } : null,
//   //           guestDetails: isGuest ? {
//   //             guestName,
//   //             guestContact
//   //           } : null,
//   //           invoicePayload: invoicePayload
//   //         });

//   //       } catch (bookingError) {
//   //         console.error('❌ Booking creation error:', bookingError);
//   //         // Still navigate to voucher even if booking fails
//   //         Alert.alert(
//   //           'Invoice Generated!',
//   //           'Invoice generated successfully but booking creation failed. Please contact support.',
//   //           [
//   //             {
//   //               text: 'View Invoice',
//   //               onPress: () => {
//   //                 navigation.navigate('Voucher', {
//   //                   invoiceData: invoiceResponse.data.Data || invoiceResponse.data,
//   //                   invoiceNumber: invoiceResponse.data.Data?.InvoiceNumber,
//   //                   bookingType: 'LAWN',
//   //                   venue: venue,
//   //                   bookingDetails: {
//   //                     ...invoicePayload,
//   //                     lawnName: venue.description,
//   //                     totalAmount: invoiceResponse.data.Data?.Amount || invoiceResponse.data.Amount,
//   //                     bookingSummary: invoiceResponse.data.Data?.BookingSummary,
//   //                     invoiceNumber: invoiceResponse.data.Data?.InvoiceNumber
//   //                   },
//   //                   isGuest: isGuest,
//   //                   memberDetails: !isGuest ? {
//   //                     memberName: userName,
//   //                     membershipNo: membershipNo
//   //                   } : null,
//   //                   guestDetails: isGuest ? {
//   //                     guestName,
//   //                     guestContact
//   //                   } : null,
//   //                   invoicePayload: invoicePayload,
//   //                   error: 'Booking creation failed: ' + bookingError.message
//   //                 });
//   //               }
//   //             },
//   //             { text: 'OK' }
//   //           ]
//   //         );
//   //       }
//   //     } else {
//   //       throw new Error(invoiceResponse.data.ResponseMessage || 'Failed to generate invoice');
//   //     }

//   //   } catch (error) {
//   //     setBookingLoading(false);
//   //     setShowBookingModal(false);

//   //     console.error('❌ Error in handleGenerateInvoice:', {
//   //       message: error.message,
//   //       response: error.response?.data,
//   //       status: error.response?.status
//   //     });

//   //     let errorMessage = 'Failed to process booking. Please try again.';

//   //     if (error.response?.status === 400) {
//   //       const serverMsg = error.response.data?.message;
//   //       errorMessage = serverMsg || 'Invalid booking data provided.';
//   //     } else if (error.response?.status === 404) {
//   //       errorMessage = 'Booking endpoint not found. Please check backend configuration.';
//   //     } else if (error.response?.status === 500) {
//   //       const serverError = error.response.data;
//   //       if (serverError && typeof serverError === 'object') {
//   //         errorMessage = `Server Error: ${serverError.message || serverError.error || 'Internal server error'}`;
//   //       }
//   //     }

//   //     Alert.alert('Booking Failed', errorMessage);
//   //   } finally {
//   //     setBookingLoading(false);
//   //   }
//   // };

//   // ... (keep the rest of the code the same)

//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-');
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
//   };

//   const calculateTotalAmount = () => {
//     if (!venue) return 'Rs. 0/-';
//     const price = isGuest ? venue.guestCharges : venue.memberCharges;
//     return `Rs. ${price?.toLocaleString() || '0'}/-`;
//   };

//   const renderCalendar = () => (
//     <View style={styles.calendarWrapper}>
//       <Calendar
//         current={selectedDate}
//         minDate={new Date().toISOString().split('T')[0]}
//         onDayPress={(day) => setSelectedDate(day.dateString)}
//         markedDates={{
//           [selectedDate]: {
//             selected: true,
//             selectedColor: '#b48a64',
//             selectedTextColor: '#FFF',
//           },
//         }}
//         theme={{
//           calendarBackground: '#FFF',
//           textSectionTitleColor: '#b48a64',
//           selectedDayBackgroundColor: '#b48a64',
//           selectedDayTextColor: '#FFF',
//           todayTextColor: '#b48a64',
//           dayTextColor: '#2D3748',
//           textDisabledColor: '#CBD5E0',
//           dotColor: '#b48a64',
//           selectedDotColor: '#FFF',
//           arrowColor: '#b48a64',
//           monthTextColor: '#2D3748',
//           textDayFontSize: 14,
//           textMonthFontSize: 16,
//           textDayHeaderFontSize: 14,
//         }}
//         style={styles.calendar}
//       />
//     </View>
//   );

//   const renderMemberBookingForm = () => {
//     return (
//       <>
//         {/* Member Info Card (only if authenticated and not guest) */}
//         {/* {!isGuest && isAuthenticated && (
//           <View style={styles.memberInfoCard}>
//             <View style={styles.memberInfoHeader}>
//               <Text style={styles.memberInfoTitle}>Member Information</Text>
//             </View>

//             <View style={styles.memberInfoDisplay}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Name:</Text>
//                 <Text style={styles.infoValue}>
//                   {userName || 'Member'}
//                 </Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Membership No:</Text>
//                 <Text style={styles.infoValue}>
//                   {membershipNo || 'Auto-detected from login'}
//                 </Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Status:</Text>
//                 <Text style={[styles.infoValue, styles.sessionStatus]}>
//                   {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )} */}

//         {/* Authentication Warning for Member Booking */}
//         {!isGuest && !isAuthenticated && (
//           <View style={styles.warningBox}>
//             <MaterialIcons name="error" size={16} color="#DC3545" />
//             <Text style={styles.warningText}>
//               Please log in with a member account to book lawns as a member.
//             </Text>
//           </View>
//         )}

//         {/* Package Info Card - COMMENTED OUT: This is now displayed in the Lawn Summary card above */}
//         {/* <View style={styles.packageCard}>
//           <Text style={styles.packageTitle}>{venue?.description || 'Lawn'}</Text>
//           <View style={styles.priceContainer}>
//             <View style={styles.priceColumn}>
//               <Text style={styles.priceLabel}>Member Price</Text>
//               <Text style={styles.priceValue}>Rs. {venue.memberCharges?.toLocaleString() || '0'}/-</Text>
//             </View>
//             <View style={styles.priceColumn}>
//               <Text style={styles.priceLabel}>Guest Price</Text>
//               <Text style={styles.priceValue}>Rs. {venue.guestCharges?.toLocaleString() || '0'}/-</Text>
//             </View>
//           </View>
//         </View> */}

//         {/* Booking Type Toggle */}
//         <View style={styles.toggleContainer}>
//           <Text style={styles.toggleLabel}>Booking Type:</Text>
//           <View style={styles.toggleRow}>
//             <Text style={[styles.toggleOption, !isGuest && styles.toggleActive]}>
//               Member
//             </Text>
//             <Switch
//               value={isGuest}
//               onValueChange={setIsGuest}
//               trackColor={{ false: '#b48a64', true: '#b48a64' }}
//               thumbColor={isGuest ? '#fff' : '#fff'}
//             />
//             <Text style={[styles.toggleOption, isGuest && styles.toggleActive]}>
//               Guest
//             </Text>
//           </View>
//         </View>

//         {/* Guest Details (Conditional) */}
//         {isGuest && (
//           <View style={styles.guestContainer}>
//             <Text style={styles.sectionTitle}>Guest Details</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Guest Name *"
//               value={guestName}
//               onChangeText={setGuestName}
//               placeholderTextColor="#999"
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Guest Contact Number *"
//               value={guestContact}
//               onChangeText={setGuestContact}
//               keyboardType="phone-pad"
//               placeholderTextColor="#999"
//               maxLength={15}
//             />
//           </View>
//         )}

//         {/* Calendar Section */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event" size={22} color="#b48a64" />
//             <Text style={styles.sectionTitle}>Select Date</Text>
//           </View>
//           {renderCalendar()}
//           {selectedDate && (
//             <View style={styles.selectedDateContainer}>
//               <Feather name="calendar" size={16} color="#b48a64" />
//               <Text style={styles.selectedDateText}>
//                 Selected: {formatDateForDisplay(selectedDate)}
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Event Details */}
//         <View style={[styles.sectionCard, { zIndex: (eventTypeOpen || timeSlotOpen) ? 10 : 1 }]}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event-available" size={22} color="#b48a64" />
//             <Text style={styles.sectionTitle}>Event Details</Text>
//           </View>

//           <View style={styles.inputGroup}>
//             <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               onChangeText={setNumberOfGuests}
//               value={numberOfGuests}
//               placeholder="Number of Guests"
//               placeholderTextColor="#A0AEC0"
//               keyboardType="numeric"
//               returnKeyType="done"
//             />
//           </View>

//           <View style={styles.dropdownSection}>
//             <Text style={styles.sectionLabel}>Event Type</Text>
//             <DropDownPicker
//               open={eventTypeOpen}
//               value={selectedEventType}
//               items={eventTypeOptions}
//               setOpen={setEventTypeOpen}
//               setValue={setSelectedEventType}
//               placeholder="Select Event Type"
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               listMode="SCROLLVIEW"
//               scrollViewProps={{
//                 nestedScrollEnabled: true,
//               }}
//               zIndex={4000}
//               zIndexInverse={1000}
//               onOpen={() => {
//                 setTimeSlotOpen(false);
//                 scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//               }}
//             />
//           </View>

//           <View style={styles.dropdownSection}>
//             <Text style={styles.sectionLabel}>Time Slot</Text>
//             <DropDownPicker
//               open={timeSlotOpen}
//               value={selectedTimeSlot}
//               items={timeSlotOptions}
//               setOpen={setTimeSlotOpen}
//               setValue={setSelectedTimeSlot}
//               placeholder="Select Time Slot"
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               listMode="SCROLLVIEW"
//               scrollViewProps={{
//                 nestedScrollEnabled: true,
//               }}
//               zIndex={3000}
//               zIndexInverse={2000}
//               onOpen={() => {
//                 setEventTypeOpen(false);
//                 scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//               }}
//             />
//           </View>
//         </View>

//         {/* Special Requests */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="edit" size={22} color="#b48a64" />
//             <Text style={styles.sectionTitle}>Special Requests</Text>
//           </View>
//           <View style={styles.inputGroup}>
//             <Feather name="edit-3" size={20} color="#b48a64" style={styles.inputIcon} />
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               onChangeText={setSpecialRequests}
//               value={specialRequests}
//               placeholder="Any special requirements or requests..."
//               placeholderTextColor="#A0AEC0"
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//               returnKeyType="done"
//             />
//           </View>
//         </View>

//         {/* Total Amount */}
//         <View style={styles.totalCard}>
//           <Text style={styles.totalLabel}>Total Amount</Text>
//           <Text style={styles.totalAmount}>{calculateTotalAmount()}</Text>
//           <Text style={styles.totalNote}>
//             * {isGuest ? 'Guest' : 'Member'} pricing applied
//           </Text>
//         </View>

//         {/* Book Now Button */}
//         <TouchableOpacity
//           style={[
//             styles.submitButton,
//             (!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot) &&
//             styles.submitButtonDisabled,
//             (!isGuest && !isAuthenticated) && styles.submitButtonDisabled,
//             (isGuest && (!guestName || !guestContact)) && styles.submitButtonDisabled
//           ]}
//           onPress={() => setShowBookingModal(true)}
//           disabled={
//             !selectedDate ||
//             !numberOfGuests ||
//             !selectedEventType ||
//             !selectedTimeSlot ||
//             (!isGuest && !isAuthenticated) ||
//             (isGuest && (!guestName || !guestContact))
//           }
//         >
//           <Text style={styles.submitButtonText}>
//             {isGuest ? 'Book as Guest' : 'Book as Member'}
//           </Text>
//           <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
//         </TouchableOpacity>
//       </>
//     );
//   };

//   const renderVenueInfo = () => {
//     if (!venue) return null;

//     // Truncate description till "Catering"
//     const truncateDescription = (description) => {
//       if (!description) return 'Lawn';
//       const cateringIndex = description.toLowerCase().indexOf('catering');
//       if (cateringIndex !== -1) {
//         return description.substring(0, cateringIndex + 8).trim(); // +8 for "catering" length
//       }
//       // If no "catering" found, limit to 50 characters
//       return description.length > 50 ? description.substring(0, 50) + '...' : description;
//     };

//     // Get additional info after "Catering"
//     const getAdditionalInfo = (description) => {
//       if (!description) return '';
//       const cateringIndex = description.toLowerCase().indexOf('catering');
//       if (cateringIndex !== -1) {
//         const additionalPart = description.substring(cateringIndex + 8).trim();
//         return additionalPart.startsWith(',') || additionalPart.startsWith('.')
//           ? additionalPart.substring(1).trim()
//           : additionalPart;
//       }
//       return '';
//     };

//     const mainTitle = truncateDescription(venue.description);
//     const additionalInfo = getAdditionalInfo(venue.description);

//     return (
//       <View style={styles.summaryCard}>
//         {/* Header */}
//         <View style={styles.summaryHeader}>
//           <Text style={styles.summaryHeaderTitle}>Lawn Summary</Text>
//         </View>

//         {/* Content Section */}
//         <View style={styles.summaryContent}>
//           {/* Title - Bold, smaller font */}
//           <Text style={styles.summaryMainTitle}>{mainTitle}</Text>

//           {/* Additional Info - Normal font, smaller */}
//           {additionalInfo ? (
//             <Text style={styles.summaryAdditionalInfo}>{additionalInfo}</Text>
//           ) : null}

//           {/* Capacity & Guests Row */}
//           <View style={styles.summaryStatsRow}>
//             <View style={styles.summaryStatItem}>
//               <Text style={styles.summaryStatLabel}>Capacity</Text>
//               <Text style={styles.summaryStatValue}>
//                 {venue.minGuests || 0} - {venue.maxGuests || 0} Guests
//               </Text>
//             </View>
//           </View>

//           {/* Divider */}
//           <View style={styles.summaryDivider} />

//           {/* Pricing Row */}
//           <View style={styles.summaryPricingRow}>
//             <View style={styles.summaryPriceItem}>
//               <Text style={styles.summaryPriceLabel}>Member</Text>
//               <Text style={styles.summaryPriceValueMember}>
//                 PKR {venue.memberCharges?.toLocaleString() || '0'}
//               </Text>
//             </View>
//             <View style={styles.summaryPriceItem}>
//               <Text style={styles.summaryPriceLabel}>Guest</Text>
//               <Text style={styles.summaryPriceValueGuest}>
//                 PKR {venue.guestCharges?.toLocaleString() || '0'}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="black" />
//       <SafeAreaView style={styles.container}>
//         <ImageBackground
//           source={require('../../assets/notch.jpg')}
//           style={styles.headerBackground}
//           imageStyle={styles.headerImage}
//         >
//           <View style={styles.header}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrowleft" size={24} color="#FFF" />
//             </TouchableOpacity>
//             <View style={styles.headerTitleContainer}>
//               <Text style={styles.headerTitle}>
//                 Book Lawn
//               </Text>
//               <Text style={styles.headerSubtitle}>
//                 (ID: {venue?.id})
//               </Text>
//             </View>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <KeyboardAvoidingView
//           style={styles.keyboardAvoid}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//         >
//           <ScrollView
//             ref={scrollViewRef}
//             style={styles.scrollView}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//             nestedScrollEnabled={true}
//           >
//             {renderVenueInfo()}
//             {renderMemberBookingForm()}
//             <View style={styles.footerSpacer} />
//           </ScrollView>
//         </KeyboardAvoidingView>

//         {/* Booking Confirmation Modal */}
//         <Modal
//           visible={showBookingModal}
//           animationType="slide"
//           transparent={true}
//           onRequestClose={() => setShowBookingModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Confirm Lawn Booking</Text>
//                 <TouchableOpacity onPress={() => setShowBookingModal(false)}>
//                   <Icon name="close" size={24} color="#666" />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView style={styles.modalContent} nestedScrollEnabled={true}>
//                 <View style={styles.bookingSummary}>
//                   <Text style={styles.summaryTitle}>Booking Details</Text>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Booking Type:</Text>
//                     <Text style={styles.summaryValue}>
//                       {isGuest ? 'Guest Booking' : 'Member Booking'}
//                     </Text>
//                   </View>

//                   {isGuest && (
//                     <>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Guest Name:</Text>
//                         <Text style={styles.summaryValue}>{guestName}</Text>
//                       </View>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Contact:</Text>
//                         <Text style={styles.summaryValue}>{guestContact}</Text>
//                       </View>
//                     </>
//                   )}

//                   {!isGuest && (
//                     <>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Member Name:</Text>
//                         <Text style={styles.summaryValue}>{userName || 'Member'}</Text>
//                       </View>
//                       <View style={styles.summaryRow}>
//                         <Text style={styles.summaryLabel}>Membership No:</Text>
//                         <Text style={styles.summaryValue}>{membershipNo || 'Auto-detected'}</Text>
//                       </View>
//                     </>
//                   )}

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Lawn:</Text>
//                     <Text style={styles.summaryValue}>{venue?.description || 'Lawn'} (ID: {venue?.id})</Text>
//                   </View>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Date:</Text>
//                     <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
//                   </View>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Event Type:</Text>
//                     <Text style={styles.summaryValue}>
//                       {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}
//                     </Text>
//                   </View>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Time Slot:</Text>
//                     <Text style={styles.summaryValue}>
//                       {timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label || selectedTimeSlot}
//                     </Text>
//                   </View>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Guests:</Text>
//                     <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
//                   </View>

//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Total Amount:</Text>
//                     <Text style={styles.summaryValue}>{calculateTotalAmount()}</Text>
//                   </View>

//                   {specialRequests && (
//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Special Requests:</Text>
//                       <Text style={styles.summaryValue}>{specialRequests}</Text>
//                     </View>
//                   )}
//                 </View>

//                 <View style={styles.infoBox}>
//                   <MaterialIcons name="info" size={16} color="#2E7D32" />
//                   <Text style={styles.infoText}>
//                     {isGuest
//                       ? 'You will be redirected to payment after confirmation. Please ensure your contact details are correct.'
//                       : 'You will be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.'}
//                   </Text>
//                 </View>
//               </ScrollView>

//               <View style={styles.modalFooter}>
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={() => setShowBookingModal(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
//                   onPress={handleGenerateInvoice}
//                   disabled={bookingLoading}
//                 >
//                   {bookingLoading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F7FAFC',
//   },
//   keyboardAvoid: {
//     flex: 1,
//   },
//   headerBackground: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 40,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     overflow: 'hidden',
//   },
//   headerImage: {
//     opacity: 0.9,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFF',
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#FFF',
//     marginTop: 4,
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   placeholder: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingVertical: 15,
//   },

//   // Venue Info (kept for backwards compatibility - commented out in renderVenueInfo)
//   venueInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   venueInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#b48a64',
//     marginBottom: 10,
//   },
//   venueName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 10,
//   },
//   venueStats: {
//     gap: 5,
//     marginBottom: 10,
//   },
//   venueStat: {
//     fontSize: 14,
//     color: '#4A5568',
//     fontWeight: '500',
//   },
//   priceComparison: {
//     marginTop: 10,
//     gap: 5,
//   },
//   memberPriceText: {
//     fontSize: 14,
//     color: '#b48a64',
//     fontWeight: '600',
//   },
//   guestPriceText: {
//     fontSize: 14,
//     color: '#DC3545',
//     fontWeight: '600',
//   },

//   // NEW: Summary Card (Hotel-style layout)
//   summaryCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 12,
//     marginBottom: 15,
//     borderRadius: 12,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   summaryHeader: {
//     backgroundColor: '#b48a64',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   summaryHeaderTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFF',
//     letterSpacing: 0.5,
//   },
//   summaryContent: {
//     padding: 16,
//   },
//   summaryMainTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#1a1a2e',
//     marginBottom: 6,
//     lineHeight: 20,
//   },
//   summaryAdditionalInfo: {
//     fontSize: 13,
//     fontWeight: '400',
//     color: '#666',
//     marginBottom: 16,
//     lineHeight: 18,
//   },
//   summaryStatsRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   summaryStatItem: {
//     flex: 1,
//   },
//   summaryStatLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   summaryStatValue: {
//     fontSize: 13,
//     fontWeight: '400',
//     color: '#555',
//   },
//   summaryDivider: {
//     height: 1,
//     backgroundColor: '#E0E0E0',
//     marginBottom: 16,
//   },
//   summaryPricingRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   summaryPriceItem: {
//     flex: 1,
//   },
//   summaryPriceLabel: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   summaryPriceValueMember: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },
//   summaryPriceValueGuest: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#DC3545',
//   },

//   // Package Card
//   packageCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   packageTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   priceColumn: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 10,
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#4A5568',
//     marginBottom: 5,
//   },
//   priceValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },

//   // Toggle Container
//   toggleContainer: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   toggleLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },
//   toggleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   toggleOption: {
//     fontSize: 16,
//     color: '#A0AEC0',
//     fontWeight: '500',
//   },
//   toggleActive: {
//     color: '#b48a64',
//     fontWeight: 'bold',
//   },

//   // Guest Container
//   guestContainer: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },

//   // Member Info Card
//   memberInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   memberInfoHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   memberInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2D3748',
//   },

//   memberInfoDisplay: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E9ECEF',
//   },
//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#6C757D',
//     fontWeight: '600',
//   },
//   infoValue: {
//     fontSize: 14,
//     color: '#495057',
//     fontWeight: '500',
//   },
//   sessionStatus: {
//     color: '#b48a64',
//     fontWeight: 'bold',
//   },

//   // Section Cards
//   sectionCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginLeft: 10,
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },

//   // Calendar
//   calendarWrapper: {
//     height: 350,
//     overflow: 'hidden',
//   },
//   calendar: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     height: '100%',
//   },
//   selectedDateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#fdf8f4',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e3d5c5',
//   },
//   selectedDateText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2D3748',
//     marginLeft: 8,
//   },

//   // Inputs
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: '#2D3748',
//     paddingHorizontal: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     backgroundColor: '#F7FAFC',
//     marginBottom: 10,
//     marginTop: 10,
//   },
//   inputGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F7FAFC',
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   textArea: {
//     height: 80,
//     paddingVertical: 12,
//   },

//   // Dropdown
//   dropdownSection: {
//     marginBottom: 20,
//   },
//   dropdown: {
//     backgroundColor: '#F7FAFC',
//     borderColor: '#E2E8F0',
//     borderWidth: 1,
//     borderRadius: 12,
//   },
//   dropdownContainer: {
//     backgroundColor: '#F7FAFC',
//     borderColor: '#E2E8F0',
//     borderRadius: 12,
//     zIndex: 9999,
//   },

//   // Button Disabled State
//   buttonDisabled: {
//     backgroundColor: '#CBD5E0',
//     opacity: 0.6,
//   },

//   // Total Amount
//   totalCard: {
//     backgroundColor: '#2D3748',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#CBD5E0',
//     marginBottom: 8,
//   },
//   totalAmount: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFF',
//     marginBottom: 8,
//   },
//   totalNote: {
//     fontSize: 12,
//     color: '#A0AEC0',
//     fontStyle: 'italic',
//   },

//   // Submit Button
//   submitButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#b48a64',
//     marginHorizontal: 15,
//     paddingVertical: 18,
//     borderRadius: 12,
//     shadowColor: '#b48a64',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#CBD5E0',
//     shadowColor: 'transparent',
//   },
//   submitButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 8,
//   },

//   // Footer Spacer
//   footerSpacer: {
//     height: 30,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '80%',
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   modalContent: {
//     flex: 1,
//     maxHeight: 400,
//   },

//   // Booking Summary
//   bookingSummary: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     paddingVertical: 5,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '600',
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//     textAlign: 'right',
//     flex: 1,
//     marginLeft: 10,
//   },

//   // Info Box
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#FFF8E1',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#8D6E63',
//     marginLeft: 8,
//     lineHeight: 16,
//   },

//   // Warning Box
//   warningBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFE6E6',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#DC3545',
//     marginTop: 10,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#DC3545',
//     marginLeft: 8,
//     flex: 1,
//   },

//   // Modal Footer
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 20,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     backgroundColor: '#6c757d',
//     alignItems: 'center',
//   },
//   confirmButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     backgroundColor: '#b48a64',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   confirmButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default LawnBooking;



import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  ImageBackground,
  Modal,
  ActivityIndicator,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getUserData, lawnAPI, getAuthToken } from '../../config/apis';
import { useAuth } from '../auth/contexts/AuthContext';

const eventTypeOptions = [
  { label: 'Wedding Reception', value: 'wedding' },
  { label: 'Birthday Party', value: 'birthday' },
  { label: 'Corporate Event', value: 'corporate' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Family Gathering', value: 'family' },
  { label: 'Other Event', value: 'other' },
];

const timeSlotOptions = [
  { label: 'Morning (8:00 AM - 2:00 PM)', value: 'MORNING' },
  { label: 'Evening (2:00 PM - 8:00 PM)', value: 'EVENING' },
  { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
];

const LawnBooking = ({ route, navigation }) => {
  const { venue } = route.params || {};
  const { user, isAuthenticated } = useAuth();

  // Refs for dropdown z-index management
  const scrollViewRef = useRef(null);

  // ==============================
  // COMMON STATE VARIABLES
  // ==============================
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // ==============================
  // ADMIN RESERVATION STATES
  // ==============================
  const [reserveFrom, setReserveFrom] = useState('');
  const [reserveTo, setReserveTo] = useState('');
  const [adminTimeSlot, setAdminTimeSlot] = useState(null);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [unreserveModalVisible, setUnreserveModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarType, setCalendarType] = useState('from');

  // ==============================
  // MEMBER/GUEST BOOKING STATES
  // ==============================
  const [selectedDate, setSelectedDate] = useState('');
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [timeSlotOpen, setTimeSlotOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Extract membership number from user object
  const extractMembershipNo = () => {
    const targets = [user, userData];
    const possibleFields = [
      'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
      'membershipID', 'memberNo', 'memberNumber', 'membershipId',
      'id', 'userId', 'user_id', 'userID'
    ];

    for (const target of targets) {
      if (!target) continue;

      for (const field of possibleFields) {
        if (target[field]) {
          return target[field].toString();
        }
      }

      if (target.data && typeof target.data === 'object') {
        for (const field of possibleFields) {
          if (target.data[field]) {
            return target.data[field].toString();
          }
        }
      }
    }

    return null;
  };

  const membershipNo = extractMembershipNo();
  const userName = user?.name || user?.username || user?.fullName || userData?.name || userData?.username || userData?.fullName;

  useEffect(() => {
    console.log('🎯 LawnBooking mounted with params:', {
      venue: venue,
      venueId: venue?.id,
      venueDescription: venue?.description
    });

    checkUserStatus();

    if (venue) {
      setNumberOfGuests(venue.minGuests?.toString() || '50');
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  }, [venue]);

  const checkUserStatus = async () => {
    try {
      const fetchedUserData = await getUserData();
      setUserData(fetchedUserData);

      const currentUser = user || fetchedUserData;

      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      const extractedUserRole =
        currentUser.role ||
        currentUser.Role ||
        currentUser.userRole ||
        currentUser.user_role;

      const isAdminUser = extractedUserRole && (
        extractedUserRole.toLowerCase() === 'admin' ||
        extractedUserRole.toLowerCase() === 'super_admin' ||
        extractedUserRole.toLowerCase() === 'superadmin'
      );

      setIsAdmin(isAdminUser);
      console.log('👤 User status:', {
        isAdmin: isAdminUser,
        role: extractedUserRole,
        userName: userName
      });

    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
    }
  };

  // ==============================
  // ADMIN RESERVATION FUNCTIONS
  // ==============================
  const openCalendar = (type) => {
    setCalendarType(type);
    setCalendarModalVisible(true);
  };

  const handleDateSelect = (date) => {
    const selectedDate = date.dateString;
    if (calendarType === 'from') {
      setReserveFrom(selectedDate);
    } else {
      setReserveTo(selectedDate);
    }
    setCalendarModalVisible(false);
  };

  const validateReservation = () => {
    if (!reserveFrom || !reserveTo) {
      Alert.alert('Error', 'Please select reservation dates');
      return false;
    }
    if (!adminTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return false;
    }

    const fromDate = new Date(reserveFrom);
    const toDate = new Date(reserveTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      Alert.alert('Error', 'Reservation start date cannot be in the past');
      return false;
    }

    if (fromDate >= toDate) {
      Alert.alert('Error', 'Reservation end date must be after start date');
      return false;
    }

    return true;
  };

  const handleAdminReserve = async () => {
    if (!validateReservation()) return;

    try {
      setLoading(true);
      const payload = {
        lawnIds: [venue.id.toString()],
        reserve: true,
        timeSlot: adminTimeSlot,
        reserveFrom: reserveFrom,
        reserveTo: reserveTo,
      };

      const response = await lawnAPI.reserveLawns(payload);

      Alert.alert(
        'Success',
        response.data?.message || 'Lawn reserved successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setReserveModalVisible(false);
              setReserveFrom('');
              setReserveTo('');
              setAdminTimeSlot(null);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reserve lawn'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUnreserve = async () => {
    if (!reserveFrom || !reserveTo || !adminTimeSlot) {
      Alert.alert('Error', 'Please select dates and time slot to unreserve');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        lawnIds: [venue.id.toString()],
        reserve: false,
        timeSlot: adminTimeSlot,
        reserveFrom: reserveFrom,
        reserveTo: reserveTo,
      };

      const response = await lawnAPI.reserveLawns(payload);

      Alert.alert(
        'Success',
        response.data?.message || 'Lawn unreserved successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setUnreserveModalVisible(false);
              setReserveFrom('');
              setReserveTo('');
              setAdminTimeSlot(null);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to unreserve lawn'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // MEMBER/GUEST BOOKING FUNCTIONS
  // ==============================
  const handleGenerateInvoice = async () => {
    // Validation
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a booking date');
      return;
    }
    if (!selectedEventType) {
      Alert.alert('Error', 'Please select an event type');
      return;
    }
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
      Alert.alert('Error', 'Please enter number of guests');
      return;
    }

    // Guest validation
    if (isGuest) {
      if (!guestName.trim()) {
        Alert.alert('Error', 'Please enter guest name');
        return;
      }
      if (!guestContact.trim() || guestContact.length < 10) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
    }

    // Member validation
    if (!isGuest && !isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please login to book a lawn.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Login',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScr' }],
            })
          }
        ]
      );
      return;
    }

    // Check guest count against lawn capacity
    if (venue) {
      const guests = parseInt(numberOfGuests);
      if (venue.minGuests && guests < venue.minGuests) {
        Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
        return;
      }
      if (venue.maxGuests && guests > venue.maxGuests) {
        Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
        return;
      }
    }

    setBookingLoading(true);

    try {
      // Prepare booking data
      const totalPrice = isGuest ? venue.guestCharges : venue.memberCharges;

      // Generate the invoice
      const invoicePayload = {
        bookingDate: selectedDate,
        eventTime: selectedTimeSlot,
        eventType: selectedEventType,
        numberOfGuests: parseInt(numberOfGuests),
        specialRequest: specialRequests || '',
        pricingType: isGuest ? 'guest' : 'member',
        membership_no: !isGuest ? membershipNo : null,
        guestName: isGuest ? guestName : null,
        guestContact: isGuest ? guestContact : null,
      };

      console.log('🧾 Generating invoice with:', invoicePayload);

      const invoiceResponse = await lawnAPI.generateInvoiceLawn(venue.id, invoicePayload);

      console.log('✅ Invoice response:', invoiceResponse.data);

      if (invoiceResponse.data.ResponseCode === '00') {
        // Create the booking
        const bookingPayload = {
          consumerInfo: {
            membership_no: !isGuest ? membershipNo : 'GUEST',
          },
          bookingData: {
            lawnId: venue.id.toString(),
            bookingDate: selectedDate,
            eventTime: selectedTimeSlot,
            eventType: selectedEventType,
            numberOfGuests: parseInt(numberOfGuests),
            specialRequest: specialRequests || '',
            pricingType: isGuest ? 'guest' : 'member',
            totalPrice: totalPrice.toString(),
            paidBy: isGuest ? 'GUEST' : 'MEMBER',
            guestName: isGuest ? guestName : '',
            guestContact: isGuest ? guestContact : '',
          }
        };

        console.log('📤 Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

        try {
          // Create booking with direct fetch
          const token = await getAuthToken();
          const bookingResponse = await fetch(`${base_url}/booking/member/booking/lawn`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(bookingPayload),
          });

          let bookingData;
          if (bookingResponse.ok) {
            bookingData = await bookingResponse.json();
            console.log('✅ Booking created successfully:', bookingData);
          } else {
            console.warn('⚠️ Booking creation failed, but invoice was generated');
            bookingData = {
              success: false,
              message: 'Booking creation failed, but invoice was generated',
            };
          }

          // Navigate to voucher with invoice data
          const invoiceNumber = invoiceResponse.data.Data?.InvoiceNumber ||
            invoiceResponse.data.InvoiceNumber ||
            `INV-LAWN-${Date.now()}`;

          navigation.navigate('Voucher', {
            invoiceData: invoiceResponse.data.Data || invoiceResponse.data,
            invoiceNumber: invoiceNumber,
            bookingType: 'LAWN',
            venue: venue,
            bookingDetails: {
              ...invoicePayload,
              lawnName: venue.description,
              totalAmount: invoiceResponse.data.Data?.Amount || invoiceResponse.data.Amount,
              bookingSummary: invoiceResponse.data.Data?.BookingSummary,
              bookingId: bookingData?.booking?.id || bookingData?.bookingId,
              invoiceNumber: invoiceNumber
            },
            bookingId: bookingData?.booking?.id || bookingData?.bookingId,
            isGuest: isGuest,
            memberDetails: !isGuest ? {
              memberName: userName,
              membershipNo: membershipNo
            } : null,
            guestDetails: isGuest ? {
              guestName,
              guestContact
            } : null,
            bookingSuccess: bookingResponse.ok,
            bookingError: !bookingResponse.ok ? 'Booking creation failed, but invoice was generated' : null
          });

        } catch (bookingError) {
          console.error('❌ Booking creation error:', bookingError);
          // Still navigate to voucher even if booking fails
          const invoiceNumber = invoiceResponse.data.Data?.InvoiceNumber ||
            invoiceResponse.data.InvoiceNumber ||
            `INV-LAWN-${Date.now()}`;

          navigation.navigate('Voucher', {
            invoiceData: invoiceResponse.data.Data || invoiceResponse.data,
            invoiceNumber: invoiceNumber,
            bookingType: 'LAWN',
            venue: venue,
            bookingDetails: {
              ...invoicePayload,
              lawnName: venue.description,
              totalAmount: invoiceResponse.data.Data?.Amount || invoiceResponse.data.Amount,
              bookingSummary: invoiceResponse.data.Data?.BookingSummary,
              invoiceNumber: invoiceNumber
            },
            isGuest: isGuest,
            memberDetails: !isGuest ? {
              memberName: userName,
              membershipNo: membershipNo
            } : null,
            guestDetails: isGuest ? {
              guestName,
              guestContact
            } : null,
            bookingSuccess: false,
            bookingError: bookingError.message
          });
        }
      } else {
        throw new Error(invoiceResponse.data.ResponseMessage || 'Failed to generate invoice');
      }

    } catch (error) {
      setBookingLoading(false);
      setShowBookingModal(false);

      console.error('❌ Error in handleGenerateInvoice:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Failed to process booking. Please try again.';

      if (error.response?.status === 400) {
        const serverMsg = error.response.data?.message;
        errorMessage = serverMsg || 'Invalid booking data provided.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Booking endpoint not found. Please check backend configuration.';
      } else if (error.response?.status === 500) {
        const serverError = error.response.data;
        if (serverError && typeof serverError === 'object') {
          errorMessage = `Server Error: ${serverError.message || serverError.error || 'Internal server error'}`;
        }
      }

      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
  };

  const calculateTotalAmount = () => {
    if (!venue) return 'Rs. 0/-';
    const price = isGuest ? venue.guestCharges : venue.memberCharges;
    return `Rs. ${price?.toLocaleString() || '0'}/-`;
  };

  // ==============================
  // ADMIN RESERVATION FORM
  // ==============================
  const renderAdminReservationForm = () => {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="admin-panel-settings" size={22} color="#b48a64" />
          <Text style={styles.sectionTitle}>Admin Reservation</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>Reservation Period</Text>
          <View style={styles.dateInputs}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openCalendar('from')}
            >
              <Feather name="calendar" size={16} color="#b48a64" />
              <Text style={styles.dateInputText}>
                From: {formatDate(reserveFrom)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openCalendar('to')}
            >
              <Feather name="calendar" size={16} color="#b48a64" />
              <Text style={styles.dateInputText}>
                To: {formatDate(reserveTo)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dropdownSection}>
          <Text style={styles.sectionLabel}>Time Slot</Text>
          <DropDownPicker
            open={timeSlotOpen}
            value={adminTimeSlot}
            items={timeSlotOptions}
            setOpen={setTimeSlotOpen}
            setValue={setAdminTimeSlot}
            placeholder="Select Time Slot"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            onOpen={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          />
        </View>

        <View style={styles.adminActionButtons}>
          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.reserveButton,
              (!reserveFrom || !reserveTo || !adminTimeSlot) && styles.buttonDisabled
            ]}
            onPress={() => setReserveModalVisible(true)}
            disabled={!reserveFrom || !reserveTo || !adminTimeSlot}
          >
            <Text style={styles.adminButtonText}>Reserve Lawn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.unreserveButton,
              (!reserveFrom || !reserveTo || !adminTimeSlot) && styles.buttonDisabled
            ]}
            onPress={() => setUnreserveModalVisible(true)}
            disabled={!reserveFrom || !reserveTo || !adminTimeSlot}
          >
            <Text style={styles.adminButtonText}>Unreserve Lawn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==============================
  // MEMBER/GUEST BOOKING FORM
  // ==============================
  const renderMemberBookingForm = () => {
    return (
      <>
        {/* Venue Summary Card */}
        {renderVenueInfo()}

        {/* Booking Type Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Booking Type:</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleOption, !isGuest && styles.toggleActive]}>
              Member
            </Text>
            <Switch
              value={isGuest}
              onValueChange={setIsGuest}
              trackColor={{ false: '#b48a64', true: '#b48a64' }}
              thumbColor={isGuest ? '#fff' : '#fff'}
            />
            <Text style={[styles.toggleOption, isGuest && styles.toggleActive]}>
              Guest
            </Text>
          </View>
        </View>

        {/* Guest Details (Conditional) */}
        {isGuest && (
          <View style={styles.guestContainer}>
            <Text style={styles.sectionTitle}>Guest Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Guest Name *"
              value={guestName}
              onChangeText={setGuestName}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Guest Contact Number *"
              value={guestContact}
              onChangeText={setGuestContact}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              maxLength={15}
            />
          </View>
        )}

        {/* Calendar Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={22} color="#b48a64" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          {renderCalendar()}
          {selectedDate && (
            <View style={styles.selectedDateContainer}>
              <Feather name="calendar" size={16} color="#b48a64" />
              <Text style={styles.selectedDateText}>
                Selected: {formatDateForDisplay(selectedDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Event Details */}
        <View style={[styles.sectionCard, { zIndex: (eventTypeOpen || timeSlotOpen) ? 10 : 1 }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event-available" size={22} color="#b48a64" />
            <Text style={styles.sectionTitle}>Event Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Feather name="users" size={20} color="#b48a64" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              onChangeText={setNumberOfGuests}
              value={numberOfGuests}
              placeholder="Number of Guests"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          <View style={styles.dropdownSection}>
            <Text style={styles.sectionLabel}>Event Type</Text>
            <DropDownPicker
              open={eventTypeOpen}
              value={selectedEventType}
              items={eventTypeOptions}
              setOpen={setEventTypeOpen}
              setValue={setSelectedEventType}
              placeholder="Select Event Type"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              zIndex={4000}
              zIndexInverse={1000}
              onOpen={() => {
                setTimeSlotOpen(false);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
            />
          </View>

          <View style={styles.dropdownSection}>
            <Text style={styles.sectionLabel}>Time Slot</Text>
            <DropDownPicker
              open={timeSlotOpen}
              value={selectedTimeSlot}
              items={timeSlotOptions}
              setOpen={setTimeSlotOpen}
              setValue={setSelectedTimeSlot}
              placeholder="Select Time Slot"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              zIndex={3000}
              zIndexInverse={2000}
              onOpen={() => {
                setEventTypeOpen(false);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
            />
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="edit" size={22} color="#b48a64" />
            <Text style={styles.sectionTitle}>Special Requests</Text>
          </View>
          <View style={styles.inputGroup}>
            <Feather name="edit-3" size={20} color="#b48a64" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              onChangeText={setSpecialRequests}
              value={specialRequests}
              placeholder="Any special requirements or requests..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Total Amount */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{calculateTotalAmount()}</Text>
          <Text style={styles.totalNote}>
            * {isGuest ? 'Guest' : 'Member'} pricing applied
          </Text>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot) &&
            styles.submitButtonDisabled,
            (!isGuest && !isAuthenticated) && styles.submitButtonDisabled,
            (isGuest && (!guestName || !guestContact)) && styles.submitButtonDisabled
          ]}
          onPress={() => setShowBookingModal(true)}
          disabled={
            !selectedDate ||
            !numberOfGuests ||
            !selectedEventType ||
            !selectedTimeSlot ||
            (!isGuest && !isAuthenticated) ||
            (isGuest && (!guestName || !guestContact))
          }
        >
          <Text style={styles.submitButtonText}>
            {isGuest ? 'Book as Guest' : 'Book as Member'}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </>
    );
  };

  const renderCalendar = () => (
    <View style={styles.calendarWrapper}>
      <Calendar
        current={selectedDate}
        minDate={new Date().toISOString().split('T')[0]}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#b48a64',
            selectedTextColor: '#FFF',
          },
        }}
        theme={{
          calendarBackground: '#FFF',
          textSectionTitleColor: '#b48a64',
          selectedDayBackgroundColor: '#b48a64',
          selectedDayTextColor: '#FFF',
          todayTextColor: '#b48a64',
          dayTextColor: '#2D3748',
          textDisabledColor: '#CBD5E0',
          dotColor: '#b48a64',
          selectedDotColor: '#FFF',
          arrowColor: '#b48a64',
          monthTextColor: '#2D3748',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
    </View>
  );

  const renderVenueInfo = () => {
    if (!venue) return null;

    const truncateDescription = (description) => {
      if (!description) return 'Lawn';
      const cateringIndex = description.toLowerCase().indexOf('catering');
      if (cateringIndex !== -1) {
        return description.substring(0, cateringIndex + 8).trim();
      }
      return description.length > 50 ? description.substring(0, 50) + '...' : description;
    };

    const getAdditionalInfo = (description) => {
      if (!description) return '';
      const cateringIndex = description.toLowerCase().indexOf('catering');
      if (cateringIndex !== -1) {
        const additionalPart = description.substring(cateringIndex + 8).trim();
        return additionalPart.startsWith(',') || additionalPart.startsWith('.')
          ? additionalPart.substring(1).trim()
          : additionalPart;
      }
      return '';
    };

    const mainTitle = truncateDescription(venue.description);
    const additionalInfo = getAdditionalInfo(venue.description);

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderTitle}>Lawn Summary</Text>
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.summaryMainTitle}>{mainTitle}</Text>

          {additionalInfo ? (
            <Text style={styles.summaryAdditionalInfo}>{additionalInfo}</Text>
          ) : null}

          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Capacity</Text>
              <Text style={styles.summaryStatValue}>
                {venue.minGuests || 0} - {venue.maxGuests || 0} Guests
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryPricingRow}>
            <View style={styles.summaryPriceItem}>
              <Text style={styles.summaryPriceLabel}>Member</Text>
              <Text style={styles.summaryPriceValueMember}>
                PKR {venue.memberCharges?.toLocaleString() || '0'}
              </Text>
            </View>
            <View style={styles.summaryPriceItem}>
              <Text style={styles.summaryPriceLabel}>Guest</Text>
              <Text style={styles.summaryPriceValueGuest}>
                PKR {venue.guestCharges?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../assets/notch.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrowleft" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isAdmin ? 'Admin Reservation' : 'Book Lawn'}
              </Text>
              <Text style={styles.headerSubtitle}>
                (ID: {venue?.id})
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {isAdmin ? renderAdminReservationForm() : renderMemberBookingForm()}
            <View style={styles.footerSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ==============================
            BOOKING CONFIRMATION MODAL (Member/Guest)
        ============================== */}
        <Modal
          visible={showBookingModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Lawn Booking</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} nestedScrollEnabled={true}>
                <View style={styles.bookingSummary}>
                  <Text style={styles.summaryTitle}>Booking Details</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Booking Type:</Text>
                    <Text style={styles.summaryValue}>
                      {isGuest ? 'Guest Booking' : 'Member Booking'}
                    </Text>
                  </View>

                  {isGuest && (
                    <>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Guest Name:</Text>
                        <Text style={styles.summaryValue}>{guestName}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Contact:</Text>
                        <Text style={styles.summaryValue}>{guestContact}</Text>
                      </View>
                    </>
                  )}

                  {!isGuest && (
                    <>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Member Name:</Text>
                        <Text style={styles.summaryValue}>{userName || 'Member'}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Membership No:</Text>
                        <Text style={styles.summaryValue}>{membershipNo || 'Auto-detected'}</Text>
                      </View>
                    </>
                  )}

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Lawn:</Text>
                    <Text style={styles.summaryValue}>{venue?.description || 'Lawn'} (ID: {venue?.id})</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date:</Text>
                    <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Event Type:</Text>
                    <Text style={styles.summaryValue}>
                      {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time Slot:</Text>
                    <Text style={styles.summaryValue}>
                      {timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label || selectedTimeSlot}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Guests:</Text>
                    <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>{calculateTotalAmount()}</Text>
                  </View>

                  {specialRequests && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Special Requests:</Text>
                      <Text style={styles.summaryValue}>{specialRequests}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoBox}>
                  <MaterialIcons name="info" size={16} color="#2E7D32" />
                  <Text style={styles.infoText}>
                    {isGuest
                      ? 'You will be redirected to payment after confirmation. Please ensure your contact details are correct.'
                      : 'You will be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowBookingModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
                  onPress={handleGenerateInvoice}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ==============================
            ADMIN RESERVE MODAL
        ============================== */}
        <Modal
          visible={reserveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Reservation</Text>

              <View style={styles.reservationDetails}>
                <Text style={styles.detailLabel}>Lawn: {venue?.description || 'Lawn'}</Text>
                <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
                <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
                <Text style={styles.detailLabel}>Time Slot: {adminTimeSlot}</Text>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setReserveModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleAdminReserve}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ==============================
            ADMIN UNRESERVE MODAL
        ============================== */}
        <Modal
          visible={unreserveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Unreserve</Text>

              <View style={styles.reservationDetails}>
                <Text style={styles.detailLabel}>Lawn: {venue?.description || 'Lawn'}</Text>
                <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
                <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
                <Text style={styles.detailLabel}>Time Slot: {adminTimeSlot}</Text>
              </View>

              <Text style={styles.warningText}>
                This will remove the reservation for the specified period.
              </Text>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setUnreserveModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalUnreserveButton]}
                  onPress={handleAdminUnreserve}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Unreserve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ==============================
            CALENDAR MODAL (for Admin)
        ============================== */}
        <Modal
          visible={calendarModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContainer}>
              <Text style={styles.calendarModalTitle}>
                Select {calendarType === 'from' ? 'Start' : 'End'} Date
              </Text>

              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [reserveFrom]: { selected: true, selectedColor: '#b48a64' },
                  [reserveTo]: { selected: true, selectedColor: '#b48a64' }
                }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  calendarBackground: '#FFF',
                  textSectionTitleColor: '#b48a64',
                  selectedDayBackgroundColor: '#b48a64',
                  selectedDayTextColor: '#FFF',
                  todayTextColor: '#b48a64',
                  dayTextColor: '#2D3748',
                  textDisabledColor: '#CBD5E0',
                  dotColor: '#b48a64',
                  selectedDotColor: '#FFF',
                  arrowColor: '#b48a64',
                  monthTextColor: '#2D3748',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                }}
              />

              <TouchableOpacity
                style={styles.closeCalendarButton}
                onPress={() => setCalendarModalVisible(false)}
              >
                <Text style={styles.closeCalendarText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerBackground: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerImage: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryHeader: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  summaryContent: {
    padding: 16,
  },
  summaryMainTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
    lineHeight: 20,
  },
  summaryAdditionalInfo: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryStatItem: {
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 13,
    fontWeight: '400',
    color: '#555',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  summaryPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryPriceItem: {
    flex: 1,
  },
  summaryPriceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  summaryPriceValueMember: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b48a64',
  },
  summaryPriceValueGuest: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC3545',
  },

  // Toggle Container
  toggleContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleOption: {
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  toggleActive: {
    color: '#b48a64',
    fontWeight: 'bold',
  },

  // Guest Container
  guestContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  // Calendar
  calendarWrapper: {
    height: 350,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    height: '100%',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fdf8f4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3d5c5',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },

  // Admin Date Section
  dateSection: {
    marginBottom: 20,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 5,
  },
  dateInputText: {
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 10,
  },

  // Inputs
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    marginBottom: 10,
    marginTop: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  textArea: {
    height: 80,
    paddingVertical: 12,
  },

  // Dropdown
  dropdownSection: {
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
  },
  dropdownContainer: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    zIndex: 9999,
  },

  // Admin Action Buttons
  adminActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  adminButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  reserveButton: {
    backgroundColor: '#28a745',
  },
  unreserveButton: {
    backgroundColor: '#dc3545',
  },
  adminButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Button Disabled State
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    opacity: 0.6,
  },

  // Total Amount
  totalCard: {
    backgroundColor: '#2D3748',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#CBD5E0',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  totalNote: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b48a64',
    marginHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#b48a64',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // Footer Spacer
  footerSpacer: {
    height: 30,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContent: {
    flex: 1,
    maxHeight: 400,
  },

  // Reservation Details (Admin)
  reservationDetails: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },

  // Booking Summary
  bookingSummary: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#8D6E63',
    marginLeft: 8,
    lineHeight: 16,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: '#DC3545',
    marginLeft: 8,
    flex: 1,
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
  },
  modalConfirmButton: {
    backgroundColor: '#28a745',
  },
  modalUnreserveButton: {
    backgroundColor: '#dc3545',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#b48a64',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Calendar Modal
  calendarModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeCalendarButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#b48a64',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeCalendarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LawnBooking;