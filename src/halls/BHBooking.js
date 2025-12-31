// import React, { useState, useEffect } from 'react';
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
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { getUserData, banquetAPI } from '../../config/apis';
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

// const BHBooking = ({ route, navigation }) => {
//   const { venue } = route.params || {};
//   const { user, isAuthenticated } = useAuth();

//   // State variables
//   const [selectedDate, setSelectedDate] = useState('');
//   const [eventTypeOpen, setEventTypeOpen] = useState(false);
//   const [selectedEventType, setSelectedEventType] = useState(null);
//   const [numberOfGuests, setNumberOfGuests] = useState('');
//   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
//   const [specialRequests, setSpecialRequests] = useState('');

//   // Admin Reservation States
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [reserveFrom, setReserveFrom] = useState('');
//   const [reserveTo, setReserveTo] = useState('');
//   const [timeSlot, setTimeSlot] = useState(null);
//   const [reserveModalVisible, setReserveModalVisible] = useState(false);
//   const [unreserveModalVisible, setUnreserveModalVisible] = useState(false);
//   const [calendarModalVisible, setCalendarModalVisible] = useState(false);
//   const [calendarType, setCalendarType] = useState('from');
//   const [loading, setLoading] = useState(false);

//   // Member Booking States
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [reservationCompleted, setReservationCompleted] = useState(false);

//   // Extract membership number from user object for display only
//   const extractMembershipNo = () => {
//     if (!user) return null;

//     const possibleFields = [
//       'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
//       'membershipID', 'memberNo', 'memberNumber', 'membershipId',
//       'id', 'userId', 'user_id', 'userID'
//     ];

//     for (const field of possibleFields) {
//       if (user[field]) {
//         return user[field].toString();
//       }
//     }

//     if (user.data && typeof user.data === 'object') {
//       for (const field of possibleFields) {
//         if (user.data[field]) {
//           return user.data[field].toString();
//         }
//       }
//     }

//     return null;
//   };

//   const membershipNo = extractMembershipNo();
//   const userName = user?.name || user?.username || user?.fullName;
//   const userRole = user?.role || user?.userRole;

//   useEffect(() => {
//     checkUserStatus();

//     if (venue) {
//       setNumberOfGuests(venue.capacity?.toString() || '');
//     }

//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     setSelectedDate(formattedDate);
//   }, [venue]);

//   const checkUserStatus = async () => {
//     try {
//       const userData = await getUserData();
//       setUserData(userData);

//       const currentUser = user || userData;

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

//     } catch (error) {
//       console.error('Error checking user status:', error);
//       setIsAdmin(false);
//     }
//   };

//   // Admin Reservation Functions
//   const openCalendar = (type) => {
//     setCalendarType(type);
//     setCalendarModalVisible(true);
//   };

//   const handleDateSelect = (date) => {
//     const selectedDate = date.dateString;
//     if (calendarType === 'from') {
//       setReserveFrom(selectedDate);
//     } else {
//       setReserveTo(selectedDate);
//     }
//     setCalendarModalVisible(false);
//   };

//   const validateReservation = () => {
//     if (!reserveFrom || !reserveTo) {
//       Alert.alert('Error', 'Please select reservation dates');
//       return false;
//     }
//     if (!timeSlot) {
//       Alert.alert('Error', 'Please select a time slot');
//       return false;
//     }

//     const fromDate = new Date(reserveFrom);
//     const toDate = new Date(reserveTo);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (fromDate < today) {
//       Alert.alert('Error', 'Reservation start date cannot be in the past');
//       return false;
//     }

//     if (fromDate >= toDate) {
//       Alert.alert('Error', 'Reservation end date must be after start date');
//       return false;
//     }

//     return true;
//   };

//   const handleAdminReserve = async () => {
//     if (!validateReservation()) return;

//     try {
//       setLoading(true);
//       const payload = {
//         hallIds: [venue.id.toString()],
//         reserve: true,
//         timeSlot: timeSlot,
//         reserveFrom: reserveFrom,
//         reserveTo: reserveTo,
//       };

//       const response = await banquetAPI.reserveHalls(payload);

//       // Disable reserve button after successful reservation
//       setReservationCompleted(true);

//       Alert.alert(
//         'Success', 
//         response.data?.message || 'Hall reserved successfully',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setReserveModalVisible(false);
//               setReserveFrom('');
//               setReserveTo('');
//               setTimeSlot(null);
//               // Re-enable button after modal closes
//               setTimeout(() => setReservationCompleted(false), 1000);
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Reservation error:', error);
//       Alert.alert(
//         'Error', 
//         error.response?.data?.message || 'Failed to reserve hall'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminUnreserve = async () => {
//     if (!reserveFrom || !reserveTo || !timeSlot) {
//       Alert.alert('Error', 'Please select dates and time slot to unreserve');
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         hallIds: [venue.id.toString()],
//         reserve: false,
//         timeSlot: timeSlot,
//         reserveFrom: reserveFrom,
//         reserveTo: reserveTo,
//       };

//       const response = await banquetAPI.reserveHalls(payload);

//       Alert.alert(
//         'Success', 
//         response.data?.message || 'Hall unreserved successfully',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setUnreserveModalVisible(false);
//               setReserveFrom('');
//               setReserveTo('');
//               setTimeSlot(null);
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Unreservation error:', error);
//       Alert.alert(
//         'Error', 
//         error.response?.data?.message || 'Failed to unreserve hall'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // FIXED: Member Booking with correct API call structure
//   const validateMemberBooking = () => {
//     if (!isAuthenticated) {
//       Alert.alert(
//         'Authentication Required',
//         'Please log in with a valid member account to book halls.',
//         [{ text: 'OK', style: 'cancel' }]
//       );
//       return false;
//     }

//     if (!selectedDate) {
//       Alert.alert('Error', 'Please select a booking date');
//       return false;
//     }
//     if (!selectedEventType) {
//       Alert.alert('Error', 'Please select an event type');
//       return false;
//     }
//     if (!selectedTimeSlot) {
//       Alert.alert('Error', 'Please select a time slot');
//       return false;
//     }
//     if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
//       Alert.alert('Error', 'Please enter number of guests');
//       return false;
//     }

//     const bookingDate = new Date(selectedDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (bookingDate < today) {
//       Alert.alert('Error', 'Booking date cannot be in the past');
//       return false;
//     }

//     return true;
//   };

//   const handleMemberBooking = async () => {
//     if (!validateMemberBooking()) return;

//     try {
//       setBookingLoading(true);

//       // FIXED: Correct payload structure for the backend
//       const payload = {
//         bookingDate: selectedDate,
//         eventTime: selectedTimeSlot,
//         eventType: selectedEventType,
//         numberOfGuests: parseInt(numberOfGuests),
//         specialRequest: specialRequests,
//         pricingType: 'member', // This tells backend to use member pricing
//         // add guest details........................................
//         // Note: memberId is NOT included here - it comes from JWT token in Authorization header
//       };

//       console.log('📤 Sending booking payload:', {
//         hallId: venue.id,
//         payload: payload
//       });

//       // FIXED: Call the API with hallId as query parameter and payload as body
//       const response = await banquetAPI.memberBookingHall(venue.id, payload);

//       if (response.data.ResponseCode === '00') {
//         Alert.alert(
//           'Invoice Generated Successfully!',
//           'Your hall booking invoice has been created. Please complete the payment to confirm your reservation.',
//           [
//             {
//               text: 'Proceed to Payment',
//               onPress: () => {
//                 // Navigate to payment screen with invoice data
//                 navigation.navigate('Payment', {
//                   invoiceData: response.data,
//                   bookingType: 'HALL',
//                   venue: venue,
//                   bookingDetails: {
//                     ...payload,
//                     hallName: venue.name,
//                     totalAmount: response.data.Data?.Amount
//                   }
//                 });
//               }
//             },
//             {
//               text: 'View Details',
//               onPress: () => {
//                 setShowBookingModal(false);
//                 // Optionally show invoice details
//               }
//             }
//           ]
//         );
//       } else {
//         throw new Error(response.data.ResponseMessage || 'Failed to generate invoice');
//       }

//     } catch (error) {
//       console.error('❌ Member booking error:', error);

//       let errorMessage = 'Failed to process booking. Please try again.';

//       if (error.response?.status === 401) {
//         errorMessage = 'Authentication failed. Please log in again.';
//       } else if (error.response?.status === 400) {
//         if (error.response.data?.message?.includes('member') || error.response.data?.message?.includes('Member')) {
//           errorMessage = 'Member authentication failed. Please ensure you are logged in with a valid member account.';
//         } else {
//           errorMessage = error.response.data?.message || 'Invalid booking data provided.';
//         }
//       } else if (error.response?.status === 409) {
//         errorMessage = error.response.data?.message || 'Hall not available for selected date and time.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Hall not found or service unavailable.';
//       } else if (error.message?.includes('Network Error')) {
//         errorMessage = 'Network error. Please check your internet connection.';
//       } else if (error.message?.includes('timeout')) {
//         errorMessage = 'Request timeout. Please try again.';
//       }

//       Alert.alert('Booking Failed', errorMessage);
//     } finally {
//       setBookingLoading(false);
//       setShowBookingModal(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Select Date';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-');
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
//   };

//   const calculateTotalAmount = () => {
//     if (!venue) return '0';
//     const price = venue.memberPrice || venue.chargesMembers || 0;
//     return `Rs. ${price.toLocaleString()}/-`;
//   };

//   // Admin Reservation Form
//   const renderAdminReservationForm = () => {
//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <MaterialIcons name="admin-panel-settings" size={22} color="#DC3545" />
//           <Text style={styles.sectionTitle}>Admin Reservation</Text>
//         </View>

//         <View style={styles.dateSection}>
//           <Text style={styles.sectionLabel}>Reservation Period</Text>
//           <View style={styles.dateInputs}>
//             <TouchableOpacity 
//               style={styles.dateInput}
//               onPress={() => openCalendar('from')}
//             >
//               <Feather name="calendar" size={16} color="#B8860B" />
//               <Text style={styles.dateInputText}>
//                 From: {formatDate(reserveFrom)}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={styles.dateInput}
//               onPress={() => openCalendar('to')}
//             >
//               <Feather name="calendar" size={16} color="#B8860B" />
//               <Text style={styles.dateInputText}>
//                 To: {formatDate(reserveTo)}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.dropdownSection}>
//           <Text style={styles.sectionLabel}>Time Slot</Text>
//           <DropDownPicker
//             open={timeSlotOpen}
//             value={timeSlot}
//             items={timeSlotOptions}
//             setOpen={setTimeSlotOpen}
//             setValue={setTimeSlot}
//             placeholder="Select Time Slot"
//             style={styles.dropdown}
//             dropDownContainerStyle={styles.dropdownContainer}
//             zIndex={3000}
//             zIndexInverse={1000}
//           />
//         </View>

//         <View style={styles.adminActionButtons}>
//           <TouchableOpacity 
//             style={[
//               styles.adminButton, 
//               styles.reserveButton,
//               (reservationCompleted || !reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
//             ]}
//             onPress={() => setReserveModalVisible(true)}
//             disabled={reservationCompleted || !reserveFrom || !reserveTo || !timeSlot}
//           >
//             <Text style={styles.adminButtonText}>
//               {reservationCompleted ? 'Reserved ✓' : 'Reserve Hall'}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[
//               styles.adminButton, 
//               styles.unreserveButton,
//               (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
//             ]}
//             onPress={() => setUnreserveModalVisible(true)}
//             disabled={!reserveFrom || !reserveTo || !timeSlot}
//           >
//             <Text style={styles.adminButtonText}>Unreserve Hall</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Member Booking Form
//   const renderMemberBookingForm = () => {
//     return (
//       <>
//         <View style={styles.memberInfoCard}>
//           <View style={styles.memberInfoHeader}>
//             <Text style={styles.memberInfoTitle}>Member Information</Text>
//             <TouchableOpacity onPress={checkUserStatus} style={styles.refreshButton}>
//               <Feather name="refresh-cw" size={16} color="#B8860B" />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.memberInfoDisplay}>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Name:</Text>
//               <Text style={styles.infoValue}>
//                 {userName || 'Member'}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Membership No:</Text>
//               <Text style={styles.infoValue}>
//                 {membershipNo || 'Auto-detected from login'}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Status:</Text>
//               <Text style={[styles.infoValue, styles.sessionStatus]}>
//                 {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
//               </Text>
//             </View>
//           </View>

//           {!isAuthenticated && (
//             <View style={styles.warningBox}>
//               <MaterialIcons name="error" size={16} color="#DC3545" />
//               <Text style={styles.warningText}>
//                 Please log in with a member account to book halls.
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Select Date</Text>
//           </View>
//           <Calendar
//             current={selectedDate}
//             minDate={new Date().toISOString().split('T')[0]}
//             onDayPress={(day) => setSelectedDate(day.dateString)}
//             markedDates={{
//               [selectedDate]: {
//                 selected: true,
//                 selectedColor: '#B8860B',
//                 selectedTextColor: '#FFF',
//               },
//             }}
//             theme={{
//               calendarBackground: '#FFF',
//               textSectionTitleColor: '#B8860B',
//               selectedDayBackgroundColor: '#B8860B',
//               selectedDayTextColor: '#FFF',
//               todayTextColor: '#B8860B',
//               dayTextColor: '#2D3748',
//               textDisabledColor: '#CBD5E0',
//               dotColor: '#B8860B',
//               selectedDotColor: '#FFF',
//               arrowColor: '#B8860B',
//               monthTextColor: '#2D3748',
//               textDayFontSize: 14,
//               textMonthFontSize: 16,
//               textDayHeaderFontSize: 14,
//             }}
//             style={styles.calendar}
//           />
//           {selectedDate && (
//             <View style={styles.selectedDateContainer}>
//               <Feather name="calendar" size={16} color="#B8860B" />
//               <Text style={styles.selectedDateText}>
//                 Selected: {formatDateForDisplay(selectedDate)}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event-available" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Event Details</Text>
//           </View>

//           <View style={styles.inputGroup}>
//             <Feather name="users" size={20} color="#B8860B" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               onChangeText={setNumberOfGuests}
//               value={numberOfGuests}
//               placeholder="Number of Guests"
//               placeholderTextColor="#A0AEC0"
//               keyboardType="numeric"
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
//               zIndex={4000}
//               zIndexInverse={1000}
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
//               zIndex={3000}
//               zIndexInverse={2000}
//             />
//           </View>
//         </View>

//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="edit" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Special Requests</Text>
//           </View>
//           <View style={styles.inputGroup}>
//             <Feather name="edit-3" size={20} color="#B8860B" style={styles.inputIcon} />
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               onChangeText={setSpecialRequests}
//               value={specialRequests}
//               placeholder="Any special requirements or requests..."
//               placeholderTextColor="#A0AEC0"
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />
//           </View>
//         </View>

//         <View style={styles.totalCard}>
//           <Text style={styles.totalLabel}>Total Amount</Text>
//           <Text style={styles.totalAmount}>{calculateTotalAmount()}</Text>
//           <Text style={styles.totalNote}>* Member pricing applied</Text>
//         </View>

//         <TouchableOpacity 
//           style={[
//             styles.submitButton,
//             (!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !isAuthenticated) && 
//             styles.submitButtonDisabled
//           ]}
//           onPress={() => setShowBookingModal(true)}
//           disabled={!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !isAuthenticated}
//         >
//           <Text style={styles.submitButtonText}>Book Now</Text>
//           <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
//         </TouchableOpacity>
//       </>
//     );
//   };

//   const renderVenueInfo = () => {
//     if (!venue) return null;

//     return (
//       <View style={styles.venueInfoCard}>
//         <Text style={styles.venueInfoTitle}>Booking Summary</Text>
//         <View style={styles.venueDetails}>
//           <Text style={styles.venueName}>{venue.name || venue.title}</Text>
//           <Text style={styles.venueDescription}>{venue.description}</Text>
//           <View style={styles.venueStats}>
//             <Text style={styles.venueStat}>Capacity: {venue.capacity} people</Text>
//             <Text style={styles.venueStat}>Member Price: Rs. {(venue.memberPrice || venue.chargesMembers || 0).toLocaleString()}/-</Text>
//           </View>

//           {!isAdmin && (
//             <View style={styles.memberInfo}>
//               <Text style={styles.memberInfoText}>
//                 👤 Booking as: {userName || 'Member'}
//               </Text>
//               <Text style={styles.memberInfoText}>
//                 🔐 Authentication: {isAuthenticated ? 'Verified' : 'Required'}
//               </Text>
//             </View>
//           )}
//           {isAdmin && (
//             <View style={styles.adminInfo}>
//               <Text style={styles.adminInfoText}>
//                 ⚙️ Admin Mode: Hall Reservation
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="#B8860B" />
//       <SafeAreaView style={styles.container}>
//         <ImageBackground
//           source={require('../../assets/psc_home.jpeg')}
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
//                 {isAdmin ? 'Admin Reservation' : 'Book Hall'}
//               </Text>
//               <Text style={styles.headerSubtitle}>
//                 {venue?.name || venue?.title || 'Select Hall'}
//               </Text>
//             </View>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <ScrollView 
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {renderVenueInfo()}
//           {isAdmin ? renderAdminReservationForm() : renderMemberBookingForm()}
//           <View style={styles.footerSpacer} />
//         </ScrollView>

//         {/* Member Booking Confirmation Modal */}
//         {!isAdmin && (
//           <Modal
//             visible={showBookingModal}
//             animationType="slide"
//             transparent={true}
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContainer}>
//                 <View style={styles.modalHeader}>
//                   <Text style={styles.modalTitle}>Confirm Booking</Text>
//                   <TouchableOpacity onPress={() => setShowBookingModal(false)}>
//                     <Icon name="close" size={24} color="#666" />
//                   </TouchableOpacity>
//                 </View>

//                 <ScrollView style={styles.modalContent}>
//                   <View style={styles.bookingSummary}>
//                     <Text style={styles.summaryTitle}>Booking Details</Text>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Hall:</Text>
//                       <Text style={styles.summaryValue}>{venue?.name || venue?.title}</Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Date:</Text>
//                       <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Event Type:</Text>
//                       <Text style={styles.summaryValue}>
//                         {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}
//                       </Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Time Slot:</Text>
//                       <Text style={styles.summaryValue}>
//                         {timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label || selectedTimeSlot}
//                       </Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Guests:</Text>
//                       <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
//                     </View>

//                     <View style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>Total Amount:</Text>
//                       <Text style={styles.summaryValue}>{calculateTotalAmount()}</Text>
//                     </View>
//                   </View>

//                   <View style={styles.infoBox}>
//                     <MaterialIcons name="info" size={16} color="#B8860B" />
//                     <Text style={styles.infoText}>
//                       You'll be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.
//                     </Text>
//                   </View>
//                 </ScrollView>

//                 <View style={styles.modalFooter}>
//                   <TouchableOpacity 
//                     style={styles.cancelButton}
//                     onPress={() => setShowBookingModal(false)}
//                   >
//                     <Text style={styles.cancelButtonText}>Cancel</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
//                     onPress={handleMemberBooking}
//                     disabled={bookingLoading}
//                   >
//                     {bookingLoading ? (
//                       <ActivityIndicator size="small" color="#FFF" />
//                     ) : (
//                       <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Modal>
//         )}

//         {/* Admin Reservation Modal */}
//         <Modal
//           visible={reserveModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Confirm Reservation</Text>

//               <View style={styles.reservationDetails}>
//                 <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
//                 <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
//                 <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
//                 <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
//               </View>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setReserveModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.confirmButton, reservationCompleted && styles.buttonDisabled]}
//                   onPress={handleAdminReserve}
//                   disabled={loading || reservationCompleted}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>
//                       {reservationCompleted ? 'Reserved ✓' : 'Confirm Reserve'}
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Admin Unreserve Modal */}
//         <Modal
//           visible={unreserveModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Confirm Unreserve</Text>

//               <View style={styles.reservationDetails}>
//                 <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
//                 <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
//                 <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
//                 <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
//               </View>

//               <Text style={styles.warningText}>
//                 This will remove the reservation for the specified period.
//               </Text>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setUnreserveModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.unreserveConfirmButton]}
//                   onPress={handleAdminUnreserve}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Unreserve</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Calendar Modal */}
//         <Modal
//           visible={calendarModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.calendarModalContent}>
//               <Text style={styles.calendarTitle}>
//                 Select {calendarType === 'from' ? 'Start' : 'End'} Date
//               </Text>

//               <Calendar
//                 onDayPress={handleDateSelect}
//                 markedDates={{
//                   [reserveFrom]: { selected: true, selectedColor: '#007AFF' },
//                   [reserveTo]: { selected: true, selectedColor: '#007AFF' }
//                 }}
//                 minDate={new Date().toISOString().split('T')[0]}
//                 theme={{
//                   todayTextColor: '#007AFF',
//                   arrowColor: '#007AFF',
//                   selectedDayBackgroundColor: '#007AFF',
//                   selectedDayTextColor: '#FFF',
//                 }}
//               />

//               <TouchableOpacity 
//                 style={styles.closeCalendarButton}
//                 onPress={() => setCalendarModalVisible(false)}
//               >
//                 <Text style={styles.closeCalendarText}>Close</Text>
//               </TouchableOpacity>
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
//   headerBackground: {
//     paddingTop: 50,
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

//   // Venue Info
//   venueInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   venueInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#B8860B',
//     marginBottom: 10,
//   },
//   venueName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 5,
//   },
//   venueDescription: {
//     fontSize: 14,
//     color: '#718096',
//     marginBottom: 10,
//     lineHeight: 20,
//   },
//   venueStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   venueStat: {
//     fontSize: 14,
//     color: '#4A5568',
//     fontWeight: '500',
//   },

//   // Member Info Card
//   memberInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
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

//   memberInfo: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#e8f5e8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   memberInfoText: {
//     fontSize: 14,
//     color: '#2E7D32',
//     fontWeight: '600',
//   },
//   adminInfo: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#fff3cd',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffc107',
//   },
//   adminInfoText: {
//     fontSize: 14,
//     color: '#856404',
//     fontWeight: '600',
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

//   // Member Info Display
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

//   // Calendar
//   calendar: {
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   selectedDateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#F0FFF4',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#9AE6B4',
//   },
//   selectedDateText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2D3748',
//     marginLeft: 8,
//   },

//   // Inputs
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
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: '#2D3748',
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
//   },

//   // Admin Reservation Styles
//   dateSection: {
//     marginBottom: 20,
//   },
//   dateInputs: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   dateInput: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#F9F9F9',
//     gap: 8,
//   },
//   dateInputText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   adminActionButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   adminButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   reserveButton: {
//     backgroundColor: '#28a745',
//   },
//   unreserveButton: {
//     backgroundColor: '#dc3545',
//   },
//   adminButtonText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
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
//     backgroundColor: '#B8860B',
//     marginHorizontal: 15,
//     paddingVertical: 18,
//     borderRadius: 12,
//     shadowColor: '#B8860B',
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
//   calendarModalContent: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
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
//   calendarTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalContent: {
//     flex: 1,
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

//   // Reservation Details
//   reservationDetails: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 5,
//   },

//   // Info Box
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#FFF8E1',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
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

//   // Modal Actions
//   modalActions: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   modalButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#6c757d',
//   },
//   confirmButton: {
//     backgroundColor: '#B8860B',
//   },
//   unreserveConfirmButton: {
//     backgroundColor: '#dc3545',
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

//   // Calendar Close Button
//   closeCalendarButton: {
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#007AFF',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   closeCalendarText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },

//   // Modal Footer
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 20,
//   },

//   // Session Status
//   sessionStatus: {
//     color: '#28a745',
//     fontWeight: 'bold',
//   },
// });

// export default BHBooking;

import React, { useState, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getUserData, banquetAPI } from '../../config/apis';
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

const BHBooking = ({ route, navigation }) => {
  const { venue } = route.params || {};
  const { user, isAuthenticated } = useAuth();

  // State variables
  const [selectedDate, setSelectedDate] = useState('');
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [timeSlotOpen, setTimeSlotOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  // Guest Booking States
  const [isGuest, setIsGuest] = useState(true); // Guest selected by default
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin Reservation States
  const [isAdmin, setIsAdmin] = useState(false);
  const [reserveFrom, setReserveFrom] = useState('');
  const [reserveTo, setReserveTo] = useState('');
  const [timeSlot, setTimeSlot] = useState(null);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [unreserveModalVisible, setUnreserveModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [calendarType, setCalendarType] = useState('from');

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Extract membership number from user object
  const extractMembershipNo = () => {
    if (!user) return null;

    const possibleFields = [
      'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
      'membershipID', 'memberNo', 'memberNumber', 'membershipId'
    ];

    for (const field of possibleFields) {
      if (user[field]) {
        return user[field].toString();
      }
    }

    if (user.data && typeof user.data === 'object') {
      for (const field of possibleFields) {
        if (user.data[field]) {
          return user.data[field].toString();
        }
      }
    }

    return null;
  };

  const membershipNo = extractMembershipNo();
  const userName = user?.name || user?.username || user?.fullName;

  useEffect(() => {
    checkUserStatus();

    if (venue) {
      setNumberOfGuests(venue.capacity?.toString() || '');
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  }, [venue]);

  const checkUserStatus = async () => {
    try {
      const userData = await getUserData();

      const currentUser = user || userData;

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

    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
    }
  };

  // Admin Reservation Functions
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
    if (!timeSlot) {
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
        hallIds: [venue.id.toString()],
        reserve: true,
        timeSlot: timeSlot,
        reserveFrom: reserveFrom,
        reserveTo: reserveTo,
      };

      const response = await banquetAPI.reserveHalls(payload);

      Alert.alert(
        'Success',
        response.data?.message || 'Hall reserved successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setReserveModalVisible(false);
              setReserveFrom('');
              setReserveTo('');
              setTimeSlot(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reserve hall'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUnreserve = async () => {
    if (!reserveFrom || !reserveTo || !timeSlot) {
      Alert.alert('Error', 'Please select dates and time slot to unreserve');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        hallIds: [venue.id.toString()],
        reserve: false,
        timeSlot: timeSlot,
        reserveFrom: reserveFrom,
        reserveTo: reserveTo,
      };

      const response = await banquetAPI.reserveHalls(payload);

      Alert.alert(
        'Success',
        response.data?.message || 'Hall unreserved successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setUnreserveModalVisible(false);
              setReserveFrom('');
              setReserveTo('');
              setTimeSlot(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Unreservation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to unreserve hall'
      );
    } finally {
      setLoading(false);
    }
  };

  // Member/Guest Booking function
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
        'Please login to book a hall.',
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

    const bookingDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      Alert.alert('Error', 'Booking date cannot be in the past');
      return;
    }

    setBookingLoading(true);

    try {
      // Prepare booking data
      const bookingData = {
        bookingDate: selectedDate,
        eventTime: selectedTimeSlot,
        eventType: selectedEventType,
        numberOfGuests: parseInt(numberOfGuests),
        specialRequest: specialRequests || '',
        pricingType: isGuest ? 'guest' : 'member',
      };

      // Add guest details if it's a guest booking
      if (isGuest) {
        bookingData.guestName = guestName;
        bookingData.guestContact = guestContact;
      } else {
        // For member booking, include membership number
        bookingData.membership_no = membershipNo;
      }

      console.log('🧾 Generating hall invoice with data:', {
        hallId: venue.id,
        bookingData,
        isGuest
      });

      // Use the API call
      const response = await banquetAPI.memberBookingHall(venue.id, bookingData);

      setBookingLoading(false);
      setShowBookingModal(false);

      if (response.data.ResponseCode === '00') {
        Alert.alert(
          'Invoice Generated Successfully!',
          'Your hall booking invoice has been created. Please complete the payment to confirm your reservation.',
          [
            {
              text: 'Proceed to Payment',
              onPress: () => {
                // Navigate to invoice screen
                navigation.navigate('HallInvoiceScreen', {
                  invoiceData: response.data.Data || response.data,
                  bookingData: {
                    ...bookingData,
                    hallId: venue.id,
                    hallName: venue.name,
                    hallDescription: venue.description,
                    totalAmount: response.data.Data?.Amount || response.data.Amount,
                  },
                  venue: venue,
                  isGuest: isGuest,
                  memberDetails: !isGuest ? {
                    memberName: userName,
                    membershipNo: membershipNo
                  } : null,
                  guestDetails: isGuest ? {
                    guestName,
                    guestContact
                  } : null
                });
              }
            },
            {
              text: 'View Details',
              onPress: () => {
                // Optionally show invoice details
              }
            }
          ]
        );
      } else {
        throw new Error(response.data.ResponseMessage || 'Failed to generate invoice');
      }

    } catch (error) {
      setBookingLoading(false);
      console.error('❌ Hall booking error:', error);

      let errorMessage = 'Failed to process booking. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid booking data provided.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data?.message || 'Hall not available for selected date and time.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Hall not found or service unavailable.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      }

      Alert.alert('Booking Failed', errorMessage);
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
    if (!venue) return '0';
    const price = isGuest ?
      (venue.guestPrice || venue.chargesGuests || venue.memberPrice * 1.2 || 0) :
      (venue.memberPrice || venue.chargesMembers || 0);
    return `Rs. ${price.toLocaleString()}/-`;
  };

  // Admin Reservation Form
  const renderAdminReservationForm = () => {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="admin-panel-settings" size={22} color="#DC3545" />
          <Text style={styles.sectionTitle}>Admin Reservation</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>Reservation Period</Text>
          <View style={styles.dateInputs}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openCalendar('from')}
            >
              <Feather name="calendar" size={16} color="#B8860B" />
              <Text style={styles.dateInputText}>
                From: {formatDate(reserveFrom)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => openCalendar('to')}
            >
              <Feather name="calendar" size={16} color="#B8860B" />
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
            value={timeSlot}
            items={timeSlotOptions}
            setOpen={setTimeSlotOpen}
            setValue={setTimeSlot}
            placeholder="Select Time Slot"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <View style={styles.adminActionButtons}>
          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.reserveButton,
              (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
            ]}
            onPress={() => setReserveModalVisible(true)}
            disabled={!reserveFrom || !reserveTo || !timeSlot}
          >
            <Text style={styles.adminButtonText}>Reserve Hall</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.adminButton,
              styles.unreserveButton,
              (!reserveFrom || !reserveTo || !timeSlot) && styles.buttonDisabled
            ]}
            onPress={() => setUnreserveModalVisible(true)}
            disabled={!reserveFrom || !reserveTo || !timeSlot}
          >
            <Text style={styles.adminButtonText}>Unreserve Hall</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Member/Guest Booking Form
  const renderMemberBookingForm = () => {
    const guestPrice = venue.guestPrice || venue.chargesGuests || venue.memberPrice * 1.2 || venue.memberPrice;
    const memberPrice = venue.memberPrice || venue.chargesMembers || 0;

    return (
      <>
        {/* Member Info Card (only if authenticated and not guest) */}
        {/* {!isGuest && isAuthenticated && (
          // <View style={styles.memberInfoCard}>
          //   <View style={styles.memberInfoHeader}>
          //     <Text style={styles.memberInfoTitle}>Member Information</Text>
          //   </View>

          //   <View style={styles.memberInfoDisplay}>
          //     <View style={styles.infoRow}>
          //       <Text style={styles.infoLabel}>Name:</Text>
          //       <Text style={styles.infoValue}>
          //         {userName || 'Member'}
          //       </Text>
          //     </View>
          //     <View style={styles.infoRow}>
          //       <Text style={styles.infoLabel}>Membership No:</Text>
          //       <Text style={styles.infoValue}>
          //         {membershipNo || 'Auto-detected from login'}
          //       </Text>
          //     </View>
          //     <View style={styles.infoRow}>
          //       <Text style={styles.infoLabel}>Status:</Text>
          //       <Text style={[styles.infoValue, styles.sessionStatus]}>
          //         {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          //       </Text>
          //     </View>
          //   </View>
          // </View>
        )} */}

        {/* Authentication Warning for Member Booking */}
        {!isGuest && !isAuthenticated && (
          <View style={styles.warningBox}>
            <MaterialIcons name="error" size={16} color="#DC3545" />
            <Text style={styles.warningText}>
              Please log in with a member account to book halls as a member.
            </Text>
          </View>
        )}

        {/* Package Info Card */}
        <View style={styles.packageCard}>
          <Text style={styles.packageTitle}>{venue?.name || 'Banquet Hall'}</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Member Price</Text>
              <Text style={styles.priceValue}>Rs. {memberPrice.toLocaleString()}/-</Text>
            </View>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Guest Price</Text>
              <Text style={styles.priceValue}>Rs. {guestPrice.toLocaleString()}/-</Text>
            </View>
          </View>
        </View>

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
              trackColor={{ false: '#D2B48C', true: '#B8860B' }}
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
            <View style={styles.guestHeader}>
              <MaterialIcons name="person-outline" size={22} color="#B8860B" />
              <Text style={styles.guestTitle}>Guest Details</Text>
            </View>

            <View style={styles.guestInputGroup}>
              <View style={styles.guestInputWrapper}>
                <MaterialIcons name="person" size={20} color="#B8860B" style={styles.guestInputIcon} />
                <TextInput
                  style={styles.guestInput}
                  placeholder="Guest Full Name *"
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.guestInputGroup}>
              <View style={styles.guestInputWrapper}>
                <MaterialIcons name="phone" size={20} color="#B8860B" style={styles.guestInputIcon} />
                <TextInput
                  style={styles.guestInput}
                  placeholder="Guest Contact Number *"
                  value={guestContact}
                  onChangeText={setGuestContact}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  maxLength={15}
                />
              </View>
            </View>

            <View style={styles.guestInfoNote}>
              <MaterialIcons name="info-outline" size={16} color="#B8860B" />
              <Text style={styles.guestInfoText}>
                Guest pricing will be applied. Guest details are required for booking.
              </Text>
            </View>
          </View>
        )}

        {/* Calendar Section */}
        <View style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.selectedDate}>
            {selectedDate ? formatDateForDisplay(selectedDate) : 'Select a date'}
          </Text>

          <Calendar
            current={selectedDate || new Date().toISOString().split('T')[0]}
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#B8860B',
                selectedTextColor: 'white',
              },
            }}
            theme={{
              calendarBackground: '#fff',
              textSectionTitleColor: '#000',
              selectedDayBackgroundColor: '#B8860B',
              selectedDayTextColor: '#fff',
              todayTextColor: '#B8860B',
              dayTextColor: '#000',
              textDisabledColor: '#d9e1e8',
              arrowColor: '#B8860B',
              monthTextColor: '#000',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Event Details */}
        <View style={[styles.sectionCard, { zIndex: (eventTypeOpen || timeSlotOpen) ? 10 : 1 }]}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <Feather name="users" size={20} color="#B8860B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              onChangeText={setNumberOfGuests}
              value={numberOfGuests}
              placeholder="Number of Guests"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
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
            />
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.specialRequestContainer}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <View style={styles.inputGroup}>
            <Feather name="edit-3" size={20} color="#B8860B" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              onChangeText={setSpecialRequests}
              value={specialRequests}
              placeholder="Any special requirements or requests..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
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
            styles[isGuest ? 'guestSubmitButton' : 'memberSubmitButton'],
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

  const renderVenueInfo = () => {
    if (!venue) return null;

    const guestPrice = venue.guestPrice || venue.chargesGuests || venue.memberPrice * 1.2 || venue.memberPrice;
    const memberPrice = venue.memberPrice || venue.chargesMembers || 0;

    return (
      <View style={styles.venueInfoCard}>
        <Text style={styles.venueInfoTitle}>Booking Summary</Text>
        <View style={styles.venueDetails}>
          <Text style={styles.venueName}>{venue.name || venue.title}</Text>
          <Text style={styles.venueDescription}>{venue.description}</Text>
          <View style={styles.venueStats}>
            <Text style={styles.venueStat}>Capacity: {venue.capacity} people</Text>
            <View style={styles.priceComparison}>
              <Text style={styles.memberPriceText}>
                Member Price: Rs. {memberPrice.toLocaleString()}/-
              </Text>
              <Text style={styles.guestPriceText}>
                Guest Price: Rs. {guestPrice.toLocaleString()}/-
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
                {isAdmin ? 'Admin Reservation' : 'Book Hall'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {venue?.name || venue?.title || 'Select Hall'}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderVenueInfo()}
          {isAdmin ? renderAdminReservationForm() : renderMemberBookingForm()}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Booking Confirmation Modal */}
        {!isAdmin && (
          <Modal
            visible={showBookingModal}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirm Booking</Text>
                  <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
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
                      <Text style={styles.summaryLabel}>Hall:</Text>
                      <Text style={styles.summaryValue}>{venue?.name || venue?.title}</Text>
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
                    <MaterialIcons name="info" size={16} color="#B8860B" />
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
        )}

        {/* Admin Reservation Modal */}
        <Modal
          visible={reserveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Reservation</Text>

              <View style={styles.reservationDetails}>
                <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
                <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
                <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
                <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setReserveModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleAdminReserve}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Reserve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Admin Unreserve Modal */}
        <Modal
          visible={unreserveModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Unreserve</Text>

              <View style={styles.reservationDetails}>
                <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
                <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
                <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
                <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
              </View>

              <Text style={styles.warningText}>
                This will remove the reservation for the specified period.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setUnreserveModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.unreserveConfirmButton]}
                  onPress={handleAdminUnreserve}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Unreserve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Calendar Modal */}
        <Modal
          visible={calendarModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarModalContent}>
              <Text style={styles.calendarTitle}>
                Select {calendarType === 'from' ? 'Start' : 'End'} Date
              </Text>

              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [reserveFrom]: { selected: true, selectedColor: '#007AFF' },
                  [reserveTo]: { selected: true, selectedColor: '#007AFF' }
                }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  todayTextColor: '#007AFF',
                  arrowColor: '#007AFF',
                  selectedDayBackgroundColor: '#007AFF',
                  selectedDayTextColor: '#FFF',
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
    backgroundColor: '#FEF9F3',
  },
  headerBackground: {
    paddingTop: 50,
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

  // Venue Info
  venueInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  venueInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 10,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  venueDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 10,
    lineHeight: 20,
  },
  venueStats: {
    marginBottom: 10,
  },
  venueStat: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    marginBottom: 5,
  },
  priceComparison: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  memberPriceText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 5,
  },
  guestPriceText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },

  // Member Info Card
  memberInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },

  memberInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  memberInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  adminInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  adminInfoText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
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

  // Booking Type Toggle
  toggleContainer: {
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
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  toggleOption: {
    fontSize: 16,
    color: '#666',
  },
  toggleActive: {
    color: '#B8860B',
    fontWeight: 'bold',
  },

  // Guest Container
  guestContainer: {
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
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 10,
  },
  guestInputGroup: {
    marginBottom: 15,
  },
  guestInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2D9CC',
    paddingHorizontal: 15,
    height: 55,
  },
  guestInputIcon: {
    marginRight: 12,
  },
  guestInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    height: '100%',
  },
  guestInfoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FDF8F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  guestInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#8B7355',
    marginLeft: 8,
    lineHeight: 18,
  },

  // Package Card
  packageCard: {
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
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },

  // Member Info Display
  memberInfoDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },

  // Calendar
  calendarCard: {
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
  selectedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9AE6B4',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },

  // Inputs
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
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
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
  },

  // Admin Reservation Styles
  dateSection: {
    marginBottom: 20,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
    // spacing handled by parent and child margins
  },
  dateInputText: {
    fontSize: 14,
    color: '#333',
  },
  adminActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adminButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reserveButton: {
    backgroundColor: '#28a745',
  },
  unreserveButton: {
    backgroundColor: '#dc3545',
  },
  adminButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
    backgroundColor: '#B8860B',
    marginHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  memberSubmitButton: {
    backgroundColor: '#b48a64',
  },
  guestSubmitButton: {
    backgroundColor: '#b48a64',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  calendarModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalContent: {
    flexGrow: 1,
  },

  // Booking Summary
  bookingSummary: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: '40%',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    textAlign: 'right',
    width: '60%',
    flexWrap: 'wrap',
  },

  // Reservation Details
  reservationDetails: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
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
    marginHorizontal: 15,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 12,
    color: '#DC3545',
    marginLeft: 8,
    flex: 1,
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#b48a64',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  unreserveConfirmButton: {
    backgroundColor: '#dc3545',
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

  // Calendar Close Button
  closeCalendarButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#B8860B',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeCalendarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 12,
  },

  // Session Status
  sessionStatus: {
    color: '#28a745',
    fontWeight: 'bold',
  },

  // Special Request Container
  specialRequestContainer: {
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
});

export default BHBooking;