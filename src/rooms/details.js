// // // // // screens/RoomDetailsScreen.js
// // // // import React, { useState, useEffect } from 'react';
// // // // import {
// // // //   View,
// // // //   Text,
// // // //   StyleSheet,
// // // //   ScrollView,
// // // //   TouchableOpacity,
// // // //   ActivityIndicator,
// // // //   FlatList,
// // // //   Alert,
// // // //   StatusBar,
// // // //   Image,
// // // //   Dimensions,
// // // //   Modal,
// // // //   TextInput
// // // // } from 'react-native';
// // // // import Icon from 'react-native-vector-icons/MaterialIcons';
// // // // import DateTimePicker from '@react-native-community/datetimepicker';
// // // // import { roomService } from '../services/roomService';
// // // // import { bookingService } from '../services/bookingService';
// // // // import { useAuth } from '../contexts/AuthContext';

// // // // const { width: screenWidth } = Dimensions.get('window');

// // // // export default function details({ navigation, route }) {
// // // //   const { user, isAuthenticated } = useAuth();

// // // //   // Enhanced user data extraction with better debugging
// // // //   const userRole = user?.role;
// // // //   const userName = user?.name;

// // // //   // More robust extraction with multiple fallbacks
// // // //   const membershipNo = user?.membershipNo || user?.membership_no || user?.membershipNumber;
// // // //   const adminId = user?.id || user?.adminId || user?.userId || user?.adminID;

// // // //   const [rooms, setRooms] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [selectedRoom, setSelectedRoom] = useState(null);
// // // //   const [selectedRooms, setSelectedRooms] = useState([]);
// // // //   const [roomType, setRoomType] = useState(route.params?.roomType);
// // // //   const [imageIndex, setImageIndex] = useState(0);
// // // //   const [loadingRooms, setLoadingRooms] = useState(false);
// // // //   const [showBookingModal, setShowBookingModal] = useState(false);
// // // //   const [showReservationModal, setShowReservationModal] = useState(false);

// // // //   // Enhanced debug logging
// // // //   useEffect(() => {
// // // //     console.log('🔍 Auth Context Debug:');
// // // //     console.log('   - isAuthenticated:', isAuthenticated);
// // // //     console.log('   - Full user object:', user);
// // // //     console.log('   - User role:', userRole);
// // // //     console.log('   - Membership No:', membershipNo);
// // // //     console.log('   - Admin ID:', adminId);
// // // //     console.log('   - User name:', userName);

// // // //     if (!isAuthenticated || !user) {
// // // //       Alert.alert(
// // // //         'Authentication Required',
// // // //         'Please login to access room details.',
// // // //         [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
// // // //       );
// // // //       return;
// // // //     }

// // // //     fetchRooms();
// // // //   }, [isAuthenticated, user]);

// // // //   const isAdminUser = () => {
// // // //     return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
// // // //   };

// // // //   const isMemberUser = () => {
// // // //     return userRole === 'MEMBER';
// // // //   };

// // // //   // Enhanced user identifier for debugging
// // // //   const getUserIdentifier = () => {
// // // //     if (isMemberUser()) {
// // // //       return `Member - Name: ${userName}, Membership: ${membershipNo || 'Not found'}`;
// // // //     } else if (isAdminUser()) {
// // // //       return `Admin - Name: ${userName}, ID: ${adminId || 'Not found'}`;
// // // //     }
// // // //     return `Unknown - Role: ${userRole}, Name: ${userName}`;
// // // //   };

// // // //   const fetchRooms = async () => {
// // // //     try {
// // // //       setLoadingRooms(true);
// // // //       const roomData = await roomService.getAvailableRooms(roomType.id);
// // // //       console.log("Fetched available rooms:", roomData);
// // // //       setRooms(roomData);
// // // //     } catch (error) {
// // // //       console.error('Error fetching rooms:', error);
// // // //       Alert.alert('Error', 'Failed to load available rooms. Please try again.');
// // // //     } finally {
// // // //       setLoadingRooms(false);
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleRoomSelect = (room) => {
// // // //     if (isAdminUser()) {
// // // //       if (selectedRooms.find(r => r.id === room.id)) {
// // // //         setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
// // // //       } else {
// // // //         setSelectedRooms([...selectedRooms, room]);
// // // //       }
// // // //     } else {
// // // //       setSelectedRoom(room);
// // // //     }
// // // //   };

// // // //   const handleBookNow = () => {
// // // //     if (!selectedRoom) {
// // // //       Alert.alert('Please Select', 'Please select a room to continue');
// // // //       return;
// // // //     }
// // // //     setShowBookingModal(true);
// // // //   };

// // // //   const handleReserveRooms = () => {
// // // //     if (selectedRooms.length === 0) {
// // // //       Alert.alert('Please Select', 'Please select at least one room to reserve');
// // // //       return;
// // // //     }
// // // //     setShowReservationModal(true);
// // // //   };

// // // //   // Enhanced booking function with better error handling
// // // //   const handleConfirmBooking = async (bookingData) => {
// // // //     try {
// // // //       console.log('🔍 Starting booking process...');
// // // //       console.log('   - Membership number available:', !!membershipNo);
// // // //       console.log('   - Membership number value:', membershipNo);
// // // //       console.log('   - User role:', userRole);
// // // //       console.log('   - Selected room:', selectedRoom);

// // // //       // Enhanced validation with specific messages
// // // //       if (!membershipNo) {
// // // //         Alert.alert(
// // // //           'Membership Number Required', 
// // // //           `We couldn't find your membership number.\n\nPlease check your profile or contact support.\n\nDebug Info:\n- User Role: ${userRole}\n- User Name: ${userName}\n- Available Fields: ${Object.keys(user || {}).join(', ')}`,
// // // //           [{ text: 'OK' }]
// // // //         );
// // // //         return;
// // // //       }

// // // //       if (!selectedRoom) {
// // // //         Alert.alert('Error', 'Please select a room to book');
// // // //         return;
// // // //       }

// // // //       const payload = {
// // // //         membership_no: membershipNo,
// // // //         roomTypeId: roomType.id,
// // // //         checkIn: bookingData.checkIn,
// // // //         checkOut: bookingData.checkOut,
// // // //         numberOfRooms: 1,
// // // //         numberOfAdults: bookingData.numberOfAdults || 1,
// // // //         numberOfChildren: bookingData.numberOfChildren || 0,
// // // //         pricingType: 'MEMBER',
// // // //         specialRequest: bookingData.specialRequest || '',
// // // //         totalPrice: bookingData.totalPrice,
// // // //         selectedRoomIds: [selectedRoom.id],
// // // //         paymentStatus: 'PAID',
// // // //         paidAmount: bookingData.totalPrice,
// // // //         pendingAmount: 0,
// // // //         paymentMode: 'ONLINE',
// // // //       };

// // // //       console.log('📝 Final booking payload:', payload);

// // // //       const result = await bookingService.memberBookingRoom(payload);

// // // //       Alert.alert(
// // // //         'Booking Successful!',
// // // //         `Room ${selectedRoom.roomNumber} has been booked successfully from ${bookingData.checkIn} to ${bookingData.checkOut}.`,
// // // //         [{ 
// // // //           text: 'OK', 
// // // //           onPress: () => {
// // // //             setShowBookingModal(false);
// // // //             navigation.goBack();
// // // //           }
// // // //         }]
// // // //       );

// // // //     } catch (error) {
// // // //       console.error('❌ Booking error in component:', error);
// // // //       Alert.alert(
// // // //         'Booking Failed', 
// // // //         error.message || 'Failed to book room. Please try again.'
// // // //       );
// // // //     }
// // // //   };

// // // //   // Enhanced reservation function with better error handling
// // // //   const handleConfirmReservation = async (reservationData) => {
// // // //     try {
// // // //       console.log('🔍 Starting reservation process...');
// // // //       console.log('   - Admin ID available:', !!adminId);
// // // //       console.log('   - Admin ID value:', adminId);
// // // //       console.log('   - User role:', userRole);
// // // //       console.log('   - Selected rooms count:', selectedRooms.length);

// // // //       const roomIds = selectedRooms.map(room => room.id);

// // // //       if (!adminId) {
// // // //         Alert.alert(
// // // //           'Admin ID Required',
// // // //           `We couldn't find your admin ID.\n\nPlease login again or contact system administrator.\n\nDebug Info:\n- User Role: ${userRole}\n- User Name: ${userName}\n- Available Fields: ${Object.keys(user || {}).join(', ')}`,
// // // //           [{ text: 'OK' }]
// // // //         );
// // // //         return;
// // // //       }

// // // //       const payload = {
// // // //         roomIds: roomIds,
// // // //         reserve: true,
// // // //         reserveFrom: reservationData.reserveFrom,
// // // //         reserveTo: reservationData.reserveTo,
// // // //         adminId: adminId,
// // // //       };

// // // //       console.log('📤 Sending reservation payload:', payload);

// // // //       await roomService.reserveRooms(payload);

// // // //       Alert.alert(
// // // //         'Reservation Successful!',
// // // //         `${selectedRooms.length} room(s) have been reserved successfully.`,
// // // //         [{ 
// // // //           text: 'OK', 
// // // //           onPress: () => {
// // // //             setShowReservationModal(false);
// // // //             setSelectedRooms([]);
// // // //             fetchRooms();
// // // //           }
// // // //         }]
// // // //       );
// // // //     } catch (error) {
// // // //       console.error('❌ Reservation error:', error);
// // // //       Alert.alert(
// // // //         'Reservation Failed', 
// // // //         error.message || 'Failed to reserve rooms. Please try again.'
// // // //       );
// // // //     }
// // // //   };

// // // //   // Function to format price display
// // // //   const formatPrice = (price) => {
// // // //     if (!price && price !== 0) return 'N/A';
// // // //     return `$${parseFloat(price).toFixed(2)}`;
// // // //   };

// // // //   // Render room images carousel
// // // //   const renderImages = () => {
// // // //     const images = roomType.images || [];

// // // //     if (images.length === 0) {
// // // //       return (
// // // //         <View style={styles.noImageContainer}>
// // // //           <Icon name="image" size={60} color="#ccc" />
// // // //           <Text style={styles.noImageText}>No images available</Text>
// // // //         </View>
// // // //       );
// // // //     }

// // // //     return (
// // // //       <View style={styles.imageSection}>
// // // //         <Image 
// // // //           source={{ uri: images[imageIndex]?.url }} 
// // // //           style={styles.mainImage}
// // // //           resizeMode="cover"
// // // //         />

// // // //         {images.length > 1 && (
// // // //           <View style={styles.imageIndicators}>
// // // //             {images.map((_, index) => (
// // // //               <TouchableOpacity
// // // //                 key={index}
// // // //                 style={[
// // // //                   styles.imageIndicator,
// // // //                   index === imageIndex && styles.imageIndicatorActive
// // // //                 ]}
// // // //                 onPress={() => setImageIndex(index)}
// // // //               />
// // // //             ))}
// // // //           </View>
// // // //         )}

// // // //         {images.length > 1 && (
// // // //           <View style={styles.imageNavigation}>
// // // //             <TouchableOpacity 
// // // //               style={styles.navButton}
// // // //               onPress={() => setImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
// // // //             >
// // // //               <Icon name="chevron-left" size={24} color="#fff" />
// // // //             </TouchableOpacity>
// // // //             <TouchableOpacity 
// // // //               style={styles.navButton}
// // // //               onPress={() => setImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
// // // //             >
// // // //               <Icon name="chevron-right" size={24} color="#fff" />
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         )}
// // // //       </View>
// // // //     );
// // // //   };

// // // //   const renderRoomItem = ({ item }) => {
// // // //     const isSelected = isAdminUser() 
// // // //       ? selectedRooms.find(r => r.id === item.id)
// // // //       : selectedRoom?.id === item.id;

// // // //     return (
// // // //       <TouchableOpacity
// // // //         style={[
// // // //           styles.roomItem,
// // // //           isSelected && styles.roomItemSelected,
// // // //         ]}
// // // //         onPress={() => handleRoomSelect(item)}
// // // //       >
// // // //         <View style={styles.roomInfo}>
// // // //           <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
// // // //           <Text style={styles.roomDescription}>
// // // //             {item.description || 'Comfortable and well-equipped room'}
// // // //           </Text>
// // // //           <View style={styles.statusContainer}>
// // // //             <View
// // // //               style={[
// // // //                 styles.statusIndicator,
// // // //                 item.isActive ? styles.active : styles.inactive,
// // // //               ]}
// // // //             />
// // // //             <Text style={styles.statusText}>
// // // //               {item.isActive ? 'Available' : 'Unavailable'}
// // // //             </Text>
// // // //           </View>
// // // //           {item.isOutOfOrder && (
// // // //             <View style={styles.outOfOrderContainer}>
// // // //               <Icon name="warning" size={14} color="#ff9800" />
// // // //               <Text style={styles.outOfOrderText}>Out of Order</Text>
// // // //             </View>
// // // //           )}
// // // //         </View>
// // // //         <Icon
// // // //           name={
// // // //             isSelected ? 'check-circle' : 'radio-button-unchecked'
// // // //           }
// // // //           size={24}
// // // //           color="#b48a64"
// // // //         />
// // // //       </TouchableOpacity>
// // // //     );
// // // //   };

// // // //   if (!isAuthenticated || !user) {
// // // //     return (
// // // //       <View style={styles.container}>
// // // //         <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
// // // //         <View style={styles.header}>
// // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // //             <Icon name="arrow-back" size={24} color="#000" />
// // // //           </TouchableOpacity>
// // // //           <Text style={styles.headerTitle}>Authentication Required</Text>
// // // //           <View style={{ width: 24 }} />
// // // //         </View>
// // // //         <View style={styles.accessDeniedContainer}>
// // // //           <Icon name="block" size={60} color="#ff6b6b" />
// // // //           <Text style={styles.accessDeniedTitle}>Please Login</Text>
// // // //           <Text style={styles.accessDeniedText}>
// // // //             You need to be logged in to view room details.
// // // //           </Text>
// // // //           <TouchableOpacity 
// // // //             style={styles.backButton} 
// // // //             onPress={() => navigation.navigate('LoginScr')}
// // // //           >
// // // //             <Text style={styles.backButtonText}>Go to Login</Text>
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />

// // // //       {/* Header */}
// // // //       <View style={styles.header}>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // // //           <Icon name="arrow-back" size={24} color="#000" />
// // // //         </TouchableOpacity>
// // // //         <Text style={styles.headerTitle}>{roomType.name}</Text>
// // // //         <View style={{ width: 24 }} />
// // // //       </View>

// // // //       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
// // // //         {/* Image Carousel */}
// // // //         {renderImages()}

// // // //         {/* Room Type Info */}
// // // //         <View style={styles.roomTypeInfo}>
// // // //           <Text style={styles.roomTypeName}>{roomType.name}</Text>

// // // //           {/* Enhanced User Info with Debug */}
// // // //           <View style={styles.userInfo}>
// // // //             <Text style={styles.userInfoText}>
// // // //               Logged in as: {userName} ({userRole})
// // // //               {isMemberUser() && ` - Membership: ${membershipNo || 'Not found'}`}
// // // //               {isAdminUser() && ` - Admin ID: ${adminId || 'Not found'}`}
// // // //             </Text>
// // // //             {/* Debug info - you can remove this in production */}
// // // //             <Text style={styles.debugText}>
// // // //               Debug: {getUserIdentifier()}
// // // //             </Text>
// // // //           </View>

// // // //           {/* Pricing Information */}
// // // //           <View style={styles.pricingSection}>
// // // //             <Text style={styles.pricingTitle}>Pricing Information</Text>

// // // //             <View style={styles.priceContainer}>
// // // //               <View style={styles.priceRow}>
// // // //                 <View style={styles.priceLabelContainer}>
// // // //                   <Icon name="person" size={16} color="#666" />
// // // //                   <Text style={styles.priceLabel}>Member Price:</Text>
// // // //                 </View>
// // // //                 <Text style={styles.priceValue}>
// // // //                   {formatPrice(roomType.priceMember)}
// // // //                 </Text>
// // // //               </View>

// // // //               <View style={styles.priceRow}>
// // // //                 <View style={styles.priceLabelContainer}>
// // // //                   <Icon name="person-outline" size={16} color="#666" />
// // // //                   <Text style={styles.priceLabel}>Guest Price:</Text>
// // // //                 </View>
// // // //                 <Text style={styles.priceValue}>
// // // //                   {formatPrice(roomType.priceGuest)}
// // // //                 </Text>
// // // //               </View>

// // // //               {/* Per night indicator */}
// // // //               <Text style={styles.perNightText}>per night</Text>
// // // //             </View>

// // // //             {/* Price difference indicator */}
// // // //             {(roomType.priceMember && roomType.priceGuest) && 
// // // //              roomType.priceMember !== roomType.priceGuest && (
// // // //               <View style={styles.savingsContainer}>
// // // //                 <Icon name="savings" size={14} color="#4CAF50" />
// // // //                 <Text style={styles.savingsText}>
// // // //                   Members save {formatPrice(roomType.priceGuest - roomType.priceMember)} per night!
// // // //                 </Text>
// // // //               </View>
// // // //             )}
// // // //           </View>

// // // //           <View style={styles.roomCount}>
// // // //             <Icon name="meeting-room" size={16} color="#666" />
// // // //             <Text style={styles.roomCountText}>
// // // //               {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
// // // //             </Text>
// // // //             {isAdminUser() && selectedRooms.length > 0 && (
// // // //               <Text style={styles.selectedCountText}>
// // // //                 • {selectedRooms.length} selected
// // // //               </Text>
// // // //             )}
// // // //           </View>
// // // //         </View>

// // // //         {/* Available Rooms */}
// // // //         <View style={styles.roomsSection}>
// // // //           <Text style={styles.sectionTitle}>
// // // //             {isAdminUser() ? 'Select Rooms to Reserve' : 'Available Rooms'}
// // // //           </Text>

// // // //           {loadingRooms ? (
// // // //             <View style={styles.loadingContainer}>
// // // //               <ActivityIndicator size="large" color="#b48a64" />
// // // //               <Text style={styles.loadingText}>Loading available rooms...</Text>
// // // //             </View>
// // // //           ) : rooms.length > 0 ? (
// // // //             <FlatList
// // // //               data={rooms}
// // // //               renderItem={renderRoomItem}
// // // //               keyExtractor={(item) => item.id.toString()}
// // // //               scrollEnabled={false}
// // // //               showsVerticalScrollIndicator={false}
// // // //             />
// // // //           ) : (
// // // //             <View style={styles.noRoomsContainer}>
// // // //               <Icon name="meeting-room" size={50} color="#ccc" />
// // // //               <Text style={styles.noRoomsText}>No rooms available</Text>
// // // //               <Text style={styles.noRoomsSubtext}>
// // // //                 There are no available rooms for {roomType.name} at the moment.
// // // //               </Text>
// // // //               <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
// // // //                 <Text style={styles.retryText}>Refresh</Text>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           )}
// // // //         </View>

// // // //         {/* Spacer for bottom button */}
// // // //         <View style={{ height: 100 }} />
// // // //       </ScrollView>

// // // //       {/* Action Button - Fixed at bottom */}
// // // //       {rooms.length > 0 && !loadingRooms && (
// // // //         <View style={styles.footer}>
// // // //           {isAdminUser() ? (
// // // //             // Admin users see reservation options
// // // //             <View style={styles.adminActions}>
// // // //               <TouchableOpacity
// // // //                 style={[
// // // //                   styles.actionButton,
// // // //                   styles.reserveButton,
// // // //                   selectedRooms.length === 0 && styles.buttonDisabled,
// // // //                 ]}
// // // //                 onPress={handleReserveRooms}
// // // //                 disabled={selectedRooms.length === 0}
// // // //               >
// // // //                 <Text style={styles.actionButtonText}>
// // // //                   Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // // //                 </Text>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           ) : (
// // // //             // Regular users see booking options
// // // //             <TouchableOpacity
// // // //               style={[
// // // //                 styles.actionButton,
// // // //                 styles.bookButton,
// // // //                 !selectedRoom && styles.buttonDisabled,
// // // //               ]}
// // // //               onPress={handleBookNow}
// // // //               disabled={!selectedRoom}
// // // //             >
// // // //               <View style={styles.bookButtonContent}>
// // // //                 <Text style={styles.actionButtonText}>
// // // //                   {selectedRoom 
// // // //                     ? `Book Room ${selectedRoom.roomNumber}` 
// // // //                     : 'Select a Room'
// // // //                   }
// // // //                 </Text>
// // // //                 {selectedRoom && roomType.priceMember && (
// // // //                   <Text style={styles.bookButtonSubtext}>
// // // //                     {formatPrice(roomType.priceMember)} per night
// // // //                   </Text>
// // // //                 )}
// // // //               </View>
// // // //             </TouchableOpacity>
// // // //           )}
// // // //         </View>
// // // //       )}

// // // //       {/* Booking Modal for Members */}
// // // //       <BookingModal
// // // //         visible={showBookingModal}
// // // //         onClose={() => setShowBookingModal(false)}
// // // //         onConfirm={handleConfirmBooking}
// // // //         room={selectedRoom}
// // // //         roomType={roomType}
// // // //         user={user}
// // // //       />

// // // //       {/* Reservation Modal for Admins */}
// // // //       <ReservationModal
// // // //         visible={showReservationModal}
// // // //         onClose={() => setShowReservationModal(false)}
// // // //         onConfirm={handleConfirmReservation}
// // // //         selectedRooms={selectedRooms}
// // // //         roomType={roomType}
// // // //       />
// // // //     </View>
// // // //   );
// // // // }

// // // // // Booking Modal Component for Members
// // // // const BookingModal = ({ visible, onClose, onConfirm, room, roomType, user }) => {
// // // //   const [checkIn, setCheckIn] = useState(new Date());
// // // //   const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000)); // Tomorrow
// // // //   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
// // // //   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
// // // //   const [numberOfAdults, setNumberOfAdults] = useState('1');
// // // //   const [numberOfChildren, setNumberOfChildren] = useState('0');
// // // //   const [specialRequest, setSpecialRequest] = useState('');
// // // //   const [loading, setLoading] = useState(false);

// // // //   const calculateTotalPrice = () => {
// // // //     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
// // // //     const price = roomType.priceMember || roomType.priceGuest || 0;
// // // //     return nights * price;
// // // //   };

// // // //   const handleConfirm = async () => {
// // // //     // Validate dates
// // // //     if (!checkIn || !checkOut) {
// // // //       Alert.alert('Error', 'Please select check-in and check-out dates');
// // // //       return;
// // // //     }

// // // //     if (checkIn >= checkOut) {
// // // //       Alert.alert('Error', 'Check-out date must be after check-in date');
// // // //       return;
// // // //     }

// // // //     // Validate guest numbers
// // // //     const adults = parseInt(numberOfAdults) || 1;
// // // //     const children = parseInt(numberOfChildren) || 0;

// // // //     if (adults < 1) {
// // // //       Alert.alert('Error', 'At least one adult is required');
// // // //       return;
// // // //     }

// // // //     if (adults + children > 6) {
// // // //       Alert.alert('Error', 'Maximum 6 guests per room allowed');
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     try {
// // // //       const bookingData = {
// // // //         checkIn: checkIn.toISOString().split('T')[0], // Format as YYYY-MM-DD
// // // //         checkOut: checkOut.toISOString().split('T')[0],
// // // //         numberOfAdults: adults,
// // // //         numberOfChildren: children,
// // // //         specialRequest: specialRequest,
// // // //         totalPrice: calculateTotalPrice(),
// // // //       };

// // // //       await onConfirm(bookingData);
// // // //     } catch (error) {
// // // //       // Error is handled in parent component
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <Modal visible={visible} animationType="slide" transparent>
// // // //       <View style={styles.modalOverlay}>
// // // //         <View style={styles.modalContainer}>
// // // //           <View style={styles.modalHeader}>
// // // //             <Text style={styles.modalTitle}>Book Room {room?.roomNumber}</Text>
// // // //             <TouchableOpacity onPress={onClose}>
// // // //               <Icon name="close" size={24} color="#666" />
// // // //             </TouchableOpacity>
// // // //           </View>

// // // //           <ScrollView style={styles.modalContent}>
// // // //             {/* Dates */}
// // // //             <View style={styles.formGroup}>
// // // //               <Text style={styles.label}>Check-in Date</Text>
// // // //               <TouchableOpacity 
// // // //                 style={styles.dateInput}
// // // //                 onPress={() => setShowCheckInPicker(true)}
// // // //               >
// // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // //                 <Text style={styles.dateText}>
// // // //                   {checkIn.toLocaleDateString()}
// // // //                 </Text>
// // // //               </TouchableOpacity>
// // // //               {showCheckInPicker && (
// // // //                 <DateTimePicker
// // // //                   value={checkIn}
// // // //                   mode="date"
// // // //                   display="default"
// // // //                   onChange={(event, date) => {
// // // //                     setShowCheckInPicker(false);
// // // //                     if (date) setCheckIn(date);
// // // //                   }}
// // // //                 />
// // // //               )}
// // // //             </View>

// // // //             <View style={styles.formGroup}>
// // // //               <Text style={styles.label}>Check-out Date</Text>
// // // //               <TouchableOpacity 
// // // //                 style={styles.dateInput}
// // // //                 onPress={() => setShowCheckOutPicker(true)}
// // // //               >
// // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // //                 <Text style={styles.dateText}>
// // // //                   {checkOut.toLocaleDateString()}
// // // //                 </Text>
// // // //               </TouchableOpacity>
// // // //               {showCheckOutPicker && (
// // // //                 <DateTimePicker
// // // //                   value={checkOut}
// // // //                   mode="date"
// // // //                   display="default"
// // // //                   onChange={(event, date) => {
// // // //                     setShowCheckOutPicker(false);
// // // //                     if (date) setCheckOut(date);
// // // //                   }}
// // // //                 />
// // // //               )}
// // // //             </View>

// // // //             {/* Guest Information */}
// // // //             <View style={styles.row}>
// // // //               <View style={styles.halfInput}>
// // // //                 <Text style={styles.label}>Adults</Text>
// // // //                 <TextInput
// // // //                   style={styles.input}
// // // //                   value={numberOfAdults}
// // // //                   onChangeText={setNumberOfAdults}
// // // //                   keyboardType="numeric"
// // // //                   placeholder="1"
// // // //                 />
// // // //               </View>
// // // //               <View style={styles.halfInput}>
// // // //                 <Text style={styles.label}>Children</Text>
// // // //                 <TextInput
// // // //                   style={styles.input}
// // // //                   value={numberOfChildren}
// // // //                   onChangeText={setNumberOfChildren}
// // // //                   keyboardType="numeric"
// // // //                   placeholder="0"
// // // //                 />
// // // //               </View>
// // // //             </View>

// // // //             {/* Special Request */}
// // // //             <View style={styles.formGroup}>
// // // //               <Text style={styles.label}>Special Request (Optional)</Text>
// // // //               <TextInput
// // // //                 style={styles.textArea}
// // // //                 value={specialRequest}
// // // //                 onChangeText={setSpecialRequest}
// // // //                 placeholder="Any special requirements..."
// // // //                 multiline
// // // //                 numberOfLines={3}
// // // //               />
// // // //             </View>

// // // //             {/* Price Summary */}
// // // //             <View style={styles.priceSummary}>
// // // //               <Text style={styles.priceLabel}>Total Amount:</Text>
// // // //               <Text style={styles.priceValue}>
// // // //                 ${calculateTotalPrice().toFixed(2)}
// // // //               </Text>
// // // //             </View>
// // // //           </ScrollView>

// // // //           <View style={styles.modalFooter}>
// // // //             <TouchableOpacity 
// // // //               style={styles.cancelButton}
// // // //               onPress={onClose}
// // // //             >
// // // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // // //             </TouchableOpacity>
// // // //             <TouchableOpacity 
// // // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // // //               onPress={handleConfirm}
// // // //               disabled={loading}
// // // //             >
// // // //               {loading ? (
// // // //                 <ActivityIndicator size="small" color="#fff" />
// // // //               ) : (
// // // //                 <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// // // //               )}
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </View>
// // // //     </Modal>
// // // //   );
// // // // };

// // // // // Reservation Modal Component for Admins
// // // // const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms, roomType }) => {
// // // //   const [reserveFrom, setReserveFrom] = useState(new Date());
// // // //   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
// // // //   const [showFromPicker, setShowFromPicker] = useState(false);
// // // //   const [showToPicker, setShowToPicker] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const handleConfirm = async () => {
// // // //     if (!reserveFrom || !reserveTo) {
// // // //       Alert.alert('Error', 'Please select reservation dates');
// // // //       return;
// // // //     }

// // // //     if (reserveFrom >= reserveTo) {
// // // //       Alert.alert('Error', 'Reservation end date must be after start date');
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     try {
// // // //       const reservationData = {
// // // //         reserveFrom: reserveFrom.toISOString().split('T')[0],
// // // //         reserveTo: reserveTo.toISOString().split('T')[0],
// // // //       };

// // // //       await onConfirm(reservationData);
// // // //     } catch (error) {
// // // //       console.error('Reservation error:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <Modal visible={visible} animationType="slide" transparent>
// // // //       <View style={styles.modalOverlay}>
// // // //         <View style={styles.modalContainer}>
// // // //           <View style={styles.modalHeader}>
// // // //             <Text style={styles.modalTitle}>
// // // //               Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // // //             </Text>
// // // //             <TouchableOpacity onPress={onClose}>
// // // //               <Icon name="close" size={24} color="#666" />
// // // //             </TouchableOpacity>
// // // //           </View>

// // // //           <ScrollView style={styles.modalContent}>
// // // //             <Text style={styles.reservationInfo}>
// // // //               You are about to reserve the following rooms:
// // // //             </Text>

// // // //             <View style={styles.roomsList}>
// // // //               {selectedRooms.map(room => (
// // // //                 <Text key={room.id} style={styles.roomItemText}>
// // // //                   • Room {room.roomNumber}
// // // //                 </Text>
// // // //               ))}
// // // //             </View>

// // // //             {/* Dates */}
// // // //             <View style={styles.formGroup}>
// // // //               <Text style={styles.label}>Reserve From</Text>
// // // //               <TouchableOpacity 
// // // //                 style={styles.dateInput}
// // // //                 onPress={() => setShowFromPicker(true)}
// // // //               >
// // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // //                 <Text style={styles.dateText}>
// // // //                   {reserveFrom.toLocaleDateString()}
// // // //                 </Text>
// // // //               </TouchableOpacity>
// // // //               {showFromPicker && (
// // // //                 <DateTimePicker
// // // //                   value={reserveFrom}
// // // //                   mode="date"
// // // //                   display="default"
// // // //                   onChange={(event, date) => {
// // // //                     setShowFromPicker(false);
// // // //                     if (date) setReserveFrom(date);
// // // //                   }}
// // // //                 />
// // // //               )}
// // // //             </View>

// // // //             <View style={styles.formGroup}>
// // // //               <Text style={styles.label}>Reserve To</Text>
// // // //               <TouchableOpacity 
// // // //                 style={styles.dateInput}
// // // //                 onPress={() => setShowToPicker(true)}
// // // //               >
// // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // //                 <Text style={styles.dateText}>
// // // //                   {reserveTo.toLocaleDateString()}
// // // //                 </Text>
// // // //               </TouchableOpacity>
// // // //               {showToPicker && (
// // // //                 <DateTimePicker
// // // //                   value={reserveTo}
// // // //                   mode="date"
// // // //                   display="default"
// // // //                   onChange={(event, date) => {
// // // //                     setShowToPicker(false);
// // // //                     if (date) setReserveTo(date);
// // // //                   }}
// // // //                 />
// // // //               )}
// // // //             </View>

// // // //             <View style={styles.noteBox}>
// // // //               <Icon name="info" size={16} color="#ff9800" />
// // // //               <Text style={styles.noteText}>
// // // //                 This will prevent members from booking these rooms during the selected period.
// // // //               </Text>
// // // //             </View>
// // // //           </ScrollView>

// // // //           <View style={styles.modalFooter}>
// // // //             <TouchableOpacity 
// // // //               style={styles.cancelButton}
// // // //               onPress={onClose}
// // // //             >
// // // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // // //             </TouchableOpacity>
// // // //             <TouchableOpacity 
// // // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // // //               onPress={handleConfirm}
// // // //               disabled={loading}
// // // //             >
// // // //               {loading ? (
// // // //                 <ActivityIndicator size="small" color="#fff" />
// // // //               ) : (
// // // //                 <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
// // // //               )}
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </View>
// // // //     </Modal>
// // // //   );
// // // // };

// // // // // screens/RoomDetailsScreen.js
// // // // // import React, { useState, useEffect } from 'react';
// // // // // import {
// // // // //   View,
// // // // //   Text,
// // // // //   StyleSheet,
// // // // //   ScrollView,
// // // // //   TouchableOpacity,
// // // // //   ActivityIndicator,
// // // // //   FlatList,
// // // // //   Alert,
// // // // //   StatusBar,
// // // // //   Image,
// // // // //   Dimensions,
// // // // //   Modal,
// // // // //   TextInput
// // // // // } from 'react-native';
// // // // // import Icon from 'react-native-vector-icons/MaterialIcons';
// // // // // import { roomService } from '../services/roomService';
// // // // // import { bookingService } from '../services/bookingService';
// // // // // import { useAuth } from '../contexts/AuthContext';

// // // // // const { width: screenWidth } = Dimensions.get('window');

// // // // // export default function RoomDetails({ navigation, route }) {
// // // // //   const { user, isAuthenticated } = useAuth();
// // // // //   // const userRole = user?.role;
// // // // //   // const userName = user?.name;
// // // // //   // const membershipNo = user?.membershipNo;

// // // // //   // const [rooms, setRooms] = useState([]);
// // // // //   // const [loading, setLoading] = useState(true);
// // // // //   // const [selectedRoom, setSelectedRoom] = useState(null);
// // // // //   // const [selectedRooms, setSelectedRooms] = useState([]);
// // // // //   // const [roomType, setRoomType] = useState(route.params?.roomType);
// // // // //   // const [imageIndex, setImageIndex] = useState(0);
// // // // //   // const [loadingRooms, setLoadingRooms] = useState(false);
// // // // //   // const [showBookingModal, setShowBookingModal] = useState(false);
// // // // //   // const [showReservationModal, setShowReservationModal] = useState(false);

// // // // //   // useEffect(() => {
// // // // //   //   if (!isAuthenticated || !user) {
// // // // //   //     Alert.alert(
// // // // //   //       'Authentication Required',
// // // // //   //       'Please login to access room details.',
// // // // //   //       [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
// // // // //   //     );
// // // // //   //     return;
// // // // //   //   }

// // // // //   //   fetchRooms();
// // // // //   // }, [isAuthenticated, user]);

// // // // //   // Fix: Properly access user properties based on user type
// // // // //   const userRole = user?.role;
// // // // //   const userName = user?.name;

// // // // //   // For MEMBER users, get membership number from the correct property
// // // // //   const membershipNo = user?.membershipNo || user?.membership_no;

// // // // //   // For ADMIN users, get admin ID from the correct property
// // // // //   const adminId = user?.id || user?.adminId || user?.userId;

// // // // //   const [rooms, setRooms] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [selectedRoom, setSelectedRoom] = useState(null);
// // // // //   const [selectedRooms, setSelectedRooms] = useState([]);
// // // // //   const [roomType, setRoomType] = useState(route.params?.roomType);
// // // // //   const [imageIndex, setImageIndex] = useState(0);
// // // // //   const [loadingRooms, setLoadingRooms] = useState(false);
// // // // //   const [showBookingModal, setShowBookingModal] = useState(false);
// // // // //   const [showReservationModal, setShowReservationModal] = useState(false);

// // // // //   // Add debug logging to see what's in the user object
// // // // //   useEffect(() => {
// // // // //     console.log('🔍 User object:', user);
// // // // //     console.log('🔍 User role:', userRole);
// // // // //     console.log('🔍 Membership No:', membershipNo);
// // // // //     console.log('🔍 Admin ID:', adminId);
// // // // //   }, [user]);

// // // // //   const isAdminUser = () => {
// // // // //     return userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
// // // // //   };

// // // // //   const isMemberUser = () => {
// // // // //     return userRole === 'MEMBER';
// // // // //   };

// // // // //   const getUserIdentifier = () => {
// // // // //   if (isMemberUser()) {
// // // // //     return `Member: ${membershipNo || 'No membership number'}`;
// // // // //   } else if (isAdminUser()) {
// // // // //     return `Admin: ${adminId || 'No admin ID'}`;
// // // // //   }
// // // // //   return 'Unknown user type';
// // // // // };

// // // // //   const fetchRooms = async () => {
// // // // //     try {
// // // // //       setLoadingRooms(true);
// // // // //       const roomData = await roomService.getAvailableRooms(roomType.id);
// // // // //       console.log("Fetched available rooms:", roomData);
// // // // //       setRooms(roomData);
// // // // //     } catch (error) {
// // // // //       console.error('Error fetching rooms:', error);
// // // // //       Alert.alert('Error', 'Failed to load available rooms. Please try again.');
// // // // //     } finally {
// // // // //       setLoadingRooms(false);
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const handleRoomSelect = (room) => {
// // // // //     if (isAdminUser()) {
// // // // //       // Admin can select multiple rooms for reservation
// // // // //       if (selectedRooms.find(r => r.id === room.id)) {
// // // // //         setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
// // // // //       } else {
// // // // //         setSelectedRooms([...selectedRooms, room]);
// // // // //       }
// // // // //     } else {
// // // // //       // Members select single room for booking
// // // // //       setSelectedRoom(room);
// // // // //     }
// // // // //   };

// // // // //   const handleBookNow = () => {
// // // // //     if (!selectedRoom) {
// // // // //       Alert.alert('Please Select', 'Please select a room to continue');
// // // // //       return;
// // // // //     }

// // // // //     setShowBookingModal(true);
// // // // //   };

// // // // //   const handleReserveRooms = () => {
// // // // //     if (selectedRooms.length === 0) {
// // // // //       Alert.alert('Please Select', 'Please select at least one room to reserve');
// // // // //       return;
// // // // //     }

// // // // //     setShowReservationModal(true);
// // // // //   };
// // // // //   const handleConfirmBooking = async (bookingData) => {
// // // // //   try {
// // // // //     // Debug: Check what membership number we have
// // // // //     console.log('🔍 Checking membership number:', membershipNo);

// // // // //     // Validate required fields with better error handling
// // // // //     if (!membershipNo) {
// // // // //       Alert.alert(
// // // // //         'Membership Number Required', 
// // // // //         'Membership number not found. Please check your profile or contact support.',
// // // // //         [{ text: 'OK' }]
// // // // //       );
// // // // //       return;
// // // // //     }

// // // // //     // Prepare payload according to backend structure
// // // // //     const payload = {
// // // // //       membership_no: membershipNo,
// // // // //       roomTypeId: roomType.id,
// // // // //       checkIn: bookingData.checkIn,
// // // // //       checkOut: bookingData.checkOut,
// // // // //       numberOfRooms: 1,
// // // // //       numberOfAdults: bookingData.numberOfAdults || 1,
// // // // //       numberOfChildren: bookingData.numberOfChildren || 0,
// // // // //       pricingType: 'MEMBER',
// // // // //       specialRequest: bookingData.specialRequest || '',
// // // // //       totalPrice: bookingData.totalPrice,
// // // // //       selectedRoomIds: [selectedRoom.id],
// // // // //       // These are hardcoded as per your backend requirement
// // // // //       paymentStatus: 'PAID',
// // // // //       paidAmount: bookingData.totalPrice,
// // // // //       pendingAmount: 0,
// // // // //       paymentMode: 'ONLINE',
// // // // //     };

// // // // //     console.log('📝 Final booking payload:', payload);

// // // // //     const result = await bookingService.memberBookingRoom(payload);

// // // // //     Alert.alert(
// // // // //       'Booking Successful!',
// // // // //       `Room ${selectedRoom.roomNumber} has been booked successfully from ${bookingData.checkIn} to ${bookingData.checkOut}.`,
// // // // //       [{ 
// // // // //         text: 'OK', 
// // // // //         onPress: () => {
// // // // //           setShowBookingModal(false);
// // // // //           navigation.goBack();
// // // // //         }
// // // // //       }]
// // // // //     );

// // // // //   } catch (error) {
// // // // //     console.error('❌ Booking error in component:', error);
// // // // //     Alert.alert(
// // // // //       'Booking Failed', 
// // // // //       error.message || 'Failed to book room. Please try again.'
// // // // //     );
// // // // //   }
// // // // // };

// // // // // // const handleConfirmBooking = async (bookingData) => {
// // // // // //   try {
// // // // // //     // Validate required fields
// // // // // //     if (!user?.membershipNo) {
// // // // // //       Alert.alert('Error', 'Membership number not found. Please check your profile.');
// // // // // //       return;
// // // // // //     }

// // // // // //     // Prepare payload according to backend structure
// // // // // //     const payload = {
// // // // // //       membership_no: user.membershipNo, // Note: underscore
// // // // // //       roomTypeId: roomType.id,
// // // // // //       checkIn: bookingData.checkIn,
// // // // // //       checkOut: bookingData.checkOut,
// // // // // //       numberOfRooms: 1, // Fixed to 1 for single room booking
// // // // // //       numberOfAdults: bookingData.numberOfAdults || 1,
// // // // // //       numberOfChildren: bookingData.numberOfChildren || 0,
// // // // // //       pricingType: 'MEMBER', // Fixed value
// // // // // //       specialRequest: bookingData.specialRequest || '', // Note: singular
// // // // // //       totalPrice: bookingData.totalPrice,
// // // // // //       selectedRoomIds: [selectedRoom.id], // Array of room IDs
// // // // // //       // These are hardcoded in backend
// // // // // //       paymentStatus: 'PAID',
// // // // // //       paidAmount: bookingData.totalPrice,
// // // // // //       pendingAmount: 0,
// // // // // //       paymentMode: 'ONLINE',
// // // // // //     };

// // // // // //     console.log('📝 Final booking payload:', payload);

// // // // // //     const result = await bookingService.memberBookingRoom(payload);

// // // // // //     Alert.alert(
// // // // // //       'Booking Successful!',
// // // // // //       `Room ${selectedRoom.roomNumber} has been booked successfully from ${bookingData.checkIn} to ${bookingData.checkOut}.`,
// // // // // //       [{ text: 'OK', onPress: () => {
// // // // // //         setShowBookingModal(false);
// // // // // //         navigation.goBack();
// // // // // //       }}]
// // // // // //     );

// // // // // //   } catch (error) {
// // // // // //     console.error('❌ Booking error in component:', error);
// // // // // //     Alert.alert('Booking Failed', error.message || 'Failed to book room. Please try again.');
// // // // // //   }
// // // // // // };

// // // // // // In RoomDetailsScreen.js - Update the handleConfirmReservation function
// // // // // // const handleConfirmReservation = async (reservationData) => {
// // // // // //   try {
// // // // // //     const roomIds = selectedRooms.map(room => room.id);

// // // // // //     // Get the admin ID from the user context
// // // // // //     const adminId = user?.id; // Make sure your user object has the admin ID

// // // // // //     if (!adminId) {
// // // // // //       Alert.alert('Error', 'Admin ID not found. Please login again.');
// // // // // //       return;
// // // // // //     }

// // // // // //     const payload = {
// // // // // //       roomIds: roomIds,
// // // // // //       reserve: true,
// // // // // //       reserveFrom: reservationData.reserveFrom,
// // // // // //       reserveTo: reservationData.reserveTo,
// // // // // //       adminId: adminId, // Add this line
// // // // // //     };

// // // // // //     console.log('📤 Sending reservation payload:', payload);

// // // // // //     await roomService.reserveRooms(payload);

// // // // // //     Alert.alert(
// // // // // //       'Reservation Successful!',
// // // // // //       `${selectedRooms.length} room(s) have been reserved successfully.`,
// // // // // //       [{ text: 'OK', onPress: () => {
// // // // // //         setShowReservationModal(false);
// // // // // //         fetchRooms(); // Refresh available rooms
// // // // // //       }}]
// // // // // //     );
// // // // // //   } catch (error) {
// // // // // //     console.error('❌ Reservation error:', error);
// // // // // //     Alert.alert('Reservation Failed', error.message || 'Failed to reserve rooms. Please try again.');
// // // // // //   }
// // // // // // };
// // // // // const handleConfirmReservation = async (reservationData) => {
// // // // //   try {
// // // // //     const roomIds = selectedRooms.map(room => room.id);

// // // // //     // Get the admin ID from the user context with better fallbacks
// // // // //     const adminId = user?.id || user?.adminId || user?.userId;

// // // // //     console.log('🔍 Admin ID for reservation:', adminId);

// // // // //     if (!adminId) {
// // // // //       Alert.alert(
// // // // //         'Admin ID Required',
// // // // //         'Admin ID not found. Please login again or contact system administrator.',
// // // // //         [{ text: 'OK' }]
// // // // //       );
// // // // //       return;
// // // // //     }

// // // // //     const payload = {
// // // // //       roomIds: roomIds,
// // // // //       reserve: true,
// // // // //       reserveFrom: reservationData.reserveFrom,
// // // // //       reserveTo: reservationData.reserveTo,
// // // // //       adminId: adminId,
// // // // //     };

// // // // //     console.log('📤 Sending reservation payload:', payload);

// // // // //     await roomService.reserveRooms(payload);

// // // // //     Alert.alert(
// // // // //       'Reservation Successful!',
// // // // //       `${selectedRooms.length} room(s) have been reserved successfully.`,
// // // // //       [{ 
// // // // //         text: 'OK', 
// // // // //         onPress: () => {
// // // // //           setShowReservationModal(false);
// // // // //           setSelectedRooms([]); // Clear selection
// // // // //           fetchRooms(); // Refresh available rooms
// // // // //         }
// // // // //       }]
// // // // //     );
// // // // //   } catch (error) {
// // // // //     console.error('❌ Reservation error:', error);
// // // // //     Alert.alert(
// // // // //       'Reservation Failed', 
// // // // //       error.message || 'Failed to reserve rooms. Please try again.'
// // // // //     );
// // // // //   }
// // // // // };
// // // // //   // Function to format price display
// // // // //   const formatPrice = (price) => {
// // // // //     if (!price && price !== 0) return 'N/A';
// // // // //     return `$${parseFloat(price).toFixed(2)}`;
// // // // //   };

// // // // //   // Render room images carousel
// // // // //   const renderImages = () => {
// // // // //     const images = roomType.images || [];

// // // // //     if (images.length === 0) {
// // // // //       return (
// // // // //         <View style={styles.noImageContainer}>
// // // // //           <Icon name="image" size={60} color="#ccc" />
// // // // //           <Text style={styles.noImageText}>No images available</Text>
// // // // //         </View>
// // // // //       );
// // // // //     }

// // // // //     return (
// // // // //       <View style={styles.imageSection}>
// // // // //         <Image 
// // // // //           source={{ uri: images[imageIndex]?.url }} 
// // // // //           style={styles.mainImage}
// // // // //           resizeMode="cover"
// // // // //         />

// // // // //         {images.length > 1 && (
// // // // //           <View style={styles.imageIndicators}>
// // // // //             {images.map((_, index) => (
// // // // //               <TouchableOpacity
// // // // //                 key={index}
// // // // //                 style={[
// // // // //                   styles.imageIndicator,
// // // // //                   index === imageIndex && styles.imageIndicatorActive
// // // // //                 ]}
// // // // //                 onPress={() => setImageIndex(index)}
// // // // //               />
// // // // //             ))}
// // // // //           </View>
// // // // //         )}

// // // // //         {images.length > 1 && (
// // // // //           <View style={styles.imageNavigation}>
// // // // //             <TouchableOpacity 
// // // // //               style={styles.navButton}
// // // // //               onPress={() => setImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
// // // // //             >
// // // // //               <Icon name="chevron-left" size={24} color="#fff" />
// // // // //             </TouchableOpacity>
// // // // //             <TouchableOpacity 
// // // // //               style={styles.navButton}
// // // // //               onPress={() => setImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
// // // // //             >
// // // // //               <Icon name="chevron-right" size={24} color="#fff" />
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         )}
// // // // //       </View>
// // // // //     );
// // // // //   };

// // // // //   const renderRoomItem = ({ item }) => {
// // // // //     const isSelected = isAdminUser() 
// // // // //       ? selectedRooms.find(r => r.id === item.id)
// // // // //       : selectedRoom?.id === item.id;

// // // // //     return (
// // // // //       <TouchableOpacity
// // // // //         style={[
// // // // //           styles.roomItem,
// // // // //           isSelected && styles.roomItemSelected,
// // // // //         ]}
// // // // //         onPress={() => handleRoomSelect(item)}
// // // // //       >
// // // // //         <View style={styles.roomInfo}>
// // // // //           <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
// // // // //           <Text style={styles.roomDescription}>
// // // // //             {item.description || 'Comfortable and well-equipped room'}
// // // // //           </Text>
// // // // //           <View style={styles.statusContainer}>
// // // // //             <View
// // // // //               style={[
// // // // //                 styles.statusIndicator,
// // // // //                 item.isActive ? styles.active : styles.inactive,
// // // // //               ]}
// // // // //             />
// // // // //             <Text style={styles.statusText}>
// // // // //               {item.isActive ? 'Available' : 'Unavailable'}
// // // // //             </Text>
// // // // //           </View>
// // // // //           {item.isOutOfOrder && (
// // // // //             <View style={styles.outOfOrderContainer}>
// // // // //               <Icon name="warning" size={14} color="#ff9800" />
// // // // //               <Text style={styles.outOfOrderText}>Out of Order</Text>
// // // // //             </View>
// // // // //           )}
// // // // //         </View>
// // // // //         <Icon
// // // // //           name={
// // // // //             isSelected ? 'check-circle' : 'radio-button-unchecked'
// // // // //           }
// // // // //           size={24}
// // // // //           color="#b48a64"
// // // // //         />
// // // // //       </TouchableOpacity>
// // // // //     );
// // // // //   };

// // // // //   if (!isAuthenticated || !user) {
// // // // //     return (
// // // // //       <View style={styles.container}>
// // // // //         <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />
// // // // //         <View style={styles.header}>
// // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // //             <Icon name="arrow-back" size={24} color="#000" />
// // // // //           </TouchableOpacity>
// // // // //           <Text style={styles.headerTitle}>Authentication Required</Text>
// // // // //           <View style={{ width: 24 }} />
// // // // //         </View>
// // // // //         <View style={styles.accessDeniedContainer}>
// // // // //           <Icon name="block" size={60} color="#ff6b6b" />
// // // // //           <Text style={styles.accessDeniedTitle}>Please Login</Text>
// // // // //           <Text style={styles.accessDeniedText}>
// // // // //             You need to be logged in to view room details.
// // // // //           </Text>
// // // // //           <TouchableOpacity 
// // // // //             style={styles.backButton} 
// // // // //             onPress={() => navigation.navigate('LoginScr')}
// // // // //           >
// // // // //             <Text style={styles.backButtonText}>Go to Login</Text>
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </View>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <View style={styles.container}>
// // // // //       <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />

// // // // //       {/* Header */}
// // // // //       <View style={styles.header}>
// // // // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // //           <Icon name="arrow-back" size={24} color="#000" />
// // // // //         </TouchableOpacity>
// // // // //         <Text style={styles.headerTitle}>{roomType.name}</Text>
// // // // //         <View style={{ width: 24 }} />
// // // // //       </View>

// // // // //       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
// // // // //         {/* Image Carousel */}
// // // // //         {renderImages()}

// // // // //         {/* Room Type Info */}
// // // // //         <View style={styles.roomTypeInfo}>
// // // // //           <Text style={styles.roomTypeName}>{roomType.name}</Text>

// // // // //           {/* User Info */}
// // // // //           {/* <View style={styles.userInfo}>
// // // // //             <Text style={styles.userInfoText}>
// // // // //               Logged in as: {userName} ({userRole})
// // // // //               {isMemberUser() && membershipNo && ` - ${membershipNo}`}
// // // // //             </Text>
// // // // //           </View> */}

// // // // // <View style={styles.userInfo}>
// // // // //   <Text style={styles.userInfoText}>
// // // // //     Logged in as: {userName} ({userRole})
// // // // //     {isMemberUser() && membershipNo && ` - Membership: ${membershipNo}`}
// // // // //     {isAdminUser() && adminId && ` - Admin ID: ${adminId}`}
// // // // //   </Text>
// // // // // </View>

// // // // //           {/* Pricing Information */}
// // // // //           <View style={styles.pricingSection}>
// // // // //             <Text style={styles.pricingTitle}>Pricing Information</Text>

// // // // //             <View style={styles.priceContainer}>
// // // // //               <View style={styles.priceRow}>
// // // // //                 <View style={styles.priceLabelContainer}>
// // // // //                   <Icon name="person" size={16} color="#666" />
// // // // //                   <Text style={styles.priceLabel}>Member Price:</Text>
// // // // //                 </View>
// // // // //                 <Text style={styles.priceValue}>
// // // // //                   {formatPrice(roomType.priceMember)}
// // // // //                 </Text>
// // // // //               </View>

// // // // //               <View style={styles.priceRow}>
// // // // //                 <View style={styles.priceLabelContainer}>
// // // // //                   <Icon name="person-outline" size={16} color="#666" />
// // // // //                   <Text style={styles.priceLabel}>Guest Price:</Text>
// // // // //                 </View>
// // // // //                 <Text style={styles.priceValue}>
// // // // //                   {formatPrice(roomType.priceGuest)}
// // // // //                 </Text>
// // // // //               </View>

// // // // //               {/* Per night indicator */}
// // // // //               <Text style={styles.perNightText}>per night</Text>
// // // // //             </View>

// // // // //             {/* Price difference indicator */}
// // // // //             {(roomType.priceMember && roomType.priceGuest) && 
// // // // //              roomType.priceMember !== roomType.priceGuest && (
// // // // //               <View style={styles.savingsContainer}>
// // // // //                 <Icon name="savings" size={14} color="#4CAF50" />
// // // // //                 <Text style={styles.savingsText}>
// // // // //                   Members save {formatPrice(roomType.priceGuest - roomType.priceMember)} per night!
// // // // //                 </Text>
// // // // //               </View>
// // // // //             )}
// // // // //           </View>

// // // // //           <View style={styles.roomCount}>
// // // // //             <Icon name="meeting-room" size={16} color="#666" />
// // // // //             <Text style={styles.roomCountText}>
// // // // //               {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
// // // // //             </Text>
// // // // //             {isAdminUser() && selectedRooms.length > 0 && (
// // // // //               <Text style={styles.selectedCountText}>
// // // // //                 • {selectedRooms.length} selected
// // // // //               </Text>
// // // // //             )}
// // // // //           </View>
// // // // //         </View>

// // // // //         {/* Available Rooms */}
// // // // //         <View style={styles.roomsSection}>
// // // // //           <Text style={styles.sectionTitle}>
// // // // //             {isAdminUser() ? 'Select Rooms to Reserve' : 'Available Rooms'}
// // // // //           </Text>

// // // // //           {loadingRooms ? (
// // // // //             <View style={styles.loadingContainer}>
// // // // //               <ActivityIndicator size="large" color="#b48a64" />
// // // // //               <Text style={styles.loadingText}>Loading available rooms...</Text>
// // // // //             </View>
// // // // //           ) : rooms.length > 0 ? (
// // // // //             <FlatList
// // // // //               data={rooms}
// // // // //               renderItem={renderRoomItem}
// // // // //               keyExtractor={(item) => item.id.toString()}
// // // // //               scrollEnabled={false}
// // // // //               showsVerticalScrollIndicator={false}
// // // // //             />
// // // // //           ) : (
// // // // //             <View style={styles.noRoomsContainer}>
// // // // //               <Icon name="meeting-room" size={50} color="#ccc" />
// // // // //               <Text style={styles.noRoomsText}>No rooms available</Text>
// // // // //               <Text style={styles.noRoomsSubtext}>
// // // // //                 There are no available rooms for {roomType.name} at the moment.
// // // // //               </Text>
// // // // //               <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
// // // // //                 <Text style={styles.retryText}>Refresh</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           )}
// // // // //         </View>

// // // // //         {/* Spacer for bottom button */}
// // // // //         <View style={{ height: 100 }} />
// // // // //       </ScrollView>

// // // // //       {/* Action Button - Fixed at bottom */}
// // // // //       {rooms.length > 0 && !loadingRooms && (
// // // // //         <View style={styles.footer}>
// // // // //           {isAdminUser() ? (
// // // // //             // Admin users see reservation options
// // // // //             <View style={styles.adminActions}>
// // // // //               <TouchableOpacity
// // // // //                 style={[
// // // // //                   styles.actionButton,
// // // // //                   styles.reserveButton,
// // // // //                   selectedRooms.length === 0 && styles.buttonDisabled,
// // // // //                 ]}
// // // // //                 onPress={handleReserveRooms}
// // // // //                 disabled={selectedRooms.length === 0}
// // // // //               >
// // // // //                 <Text style={styles.actionButtonText}>
// // // // //                   Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // // // //                 </Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           ) : (
// // // // //             // Regular users see booking options
// // // // //             <TouchableOpacity
// // // // //               style={[
// // // // //                 styles.actionButton,
// // // // //                 styles.bookButton,
// // // // //                 !selectedRoom && styles.buttonDisabled,
// // // // //               ]}
// // // // //               onPress={handleBookNow}
// // // // //               disabled={!selectedRoom}
// // // // //             >
// // // // //               <View style={styles.bookButtonContent}>
// // // // //                 <Text style={styles.actionButtonText}>
// // // // //                   {selectedRoom 
// // // // //                     ? `Book Room ${selectedRoom.roomNumber}` 
// // // // //                     : 'Select a Room'
// // // // //                   }
// // // // //                 </Text>
// // // // //                 {selectedRoom && roomType.priceMember && (
// // // // //                   <Text style={styles.bookButtonSubtext}>
// // // // //                     {formatPrice(roomType.priceMember)} per night
// // // // //                   </Text>
// // // // //                 )}
// // // // //               </View>
// // // // //             </TouchableOpacity>
// // // // //           )}
// // // // //         </View>
// // // // //       )}

// // // // //       {/* Booking Modal for Members */}
// // // // //       <BookingModal
// // // // //         visible={showBookingModal}
// // // // //         onClose={() => setShowBookingModal(false)}
// // // // //         onConfirm={handleConfirmBooking}
// // // // //         room={selectedRoom}
// // // // //         roomType={roomType}
// // // // //         user={user}
// // // // //       />

// // // // //       {/* Reservation Modal for Admins */}
// // // // //       <ReservationModal
// // // // //         visible={showReservationModal}
// // // // //         onClose={() => setShowReservationModal(false)}
// // // // //         onConfirm={handleConfirmReservation}
// // // // //         selectedRooms={selectedRooms}
// // // // //         roomType={roomType}
// // // // //       />
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // // Booking Modal Component for Members
// // // // // const BookingModal = ({ visible, onClose, onConfirm, room, roomType, user }) => {
// // // // //   const [checkIn, setCheckIn] = useState(new Date());
// // // // //   const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000)); // Tomorrow
// // // // //   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
// // // // //   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
// // // // //   const [numberOfAdults, setNumberOfAdults] = useState('1');
// // // // //   const [numberOfChildren, setNumberOfChildren] = useState('0');
// // // // //   const [specialRequest, setSpecialRequest] = useState('');
// // // // //   const [loading, setLoading] = useState(false);

// // // // //   const calculateTotalPrice = () => {
// // // // //     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
// // // // //     const price = roomType.priceMember || roomType.priceGuest || 0;
// // // // //     return nights * price;
// // // // //   };

// // // // //   // In the BookingModal component - Add validation
// // // // // const handleConfirm = async () => {
// // // // //   // Validate dates
// // // // //   if (!checkIn || !checkOut) {
// // // // //     Alert.alert('Error', 'Please select check-in and check-out dates');
// // // // //     return;
// // // // //   }

// // // // //   if (checkIn >= checkOut) {
// // // // //     Alert.alert('Error', 'Check-out date must be after check-in date');
// // // // //     return;
// // // // //   }

// // // // //   // Validate guest numbers
// // // // //   const adults = parseInt(numberOfAdults) || 1;
// // // // //   const children = parseInt(numberOfChildren) || 0;

// // // // //   if (adults < 1) {
// // // // //     Alert.alert('Error', 'At least one adult is required');
// // // // //     return;
// // // // //   }

// // // // //   if (adults + children > 6) {
// // // // //     Alert.alert('Error', 'Maximum 6 guests per room allowed');
// // // // //     return;
// // // // //   }

// // // // //   setLoading(true);
// // // // //   try {
// // // // //     const bookingData = {
// // // // //       checkIn: checkIn.toISOString().split('T')[0], // Format as YYYY-MM-DD
// // // // //       checkOut: checkOut.toISOString().split('T')[0],
// // // // //       numberOfAdults: adults,
// // // // //       numberOfChildren: children,
// // // // //       specialRequest: specialRequest,
// // // // //       totalPrice: calculateTotalPrice(),
// // // // //     };

// // // // //     await onConfirm(bookingData);
// // // // //   } catch (error) {
// // // // //     // Error is handled in parent component
// // // // //   } finally {
// // // // //     setLoading(false);
// // // // //   }
// // // // // };
// // // // //   // const handleConfirm = async () => {
// // // // //   //   if (!checkIn || !checkOut) {
// // // // //   //     Alert.alert('Error', 'Please select check-in and check-out dates');
// // // // //   //     return;
// // // // //   //   }

// // // // //   //   if (checkIn >= checkOut) {
// // // // //   //     Alert.alert('Error', 'Check-out date must be after check-in date');
// // // // //   //     return;
// // // // //   //   }

// // // // //   //   setLoading(true);
// // // // //   //   try {
// // // // //   //     const bookingData = {
// // // // //   //       checkIn: checkIn.toISOString().split('T')[0],
// // // // //   //       checkOut: checkOut.toISOString().split('T')[0],
// // // // //   //       numberOfAdults: parseInt(numberOfAdults) || 1,
// // // // //   //       numberOfChildren: parseInt(numberOfChildren) || 0,
// // // // //   //       specialRequest,
// // // // //   //       totalPrice: calculateTotalPrice(),
// // // // //   //     };

// // // // //   //     await onConfirm(bookingData);
// // // // //   //   } catch (error) {
// // // // //   //     console.error('Booking error:', error);
// // // // //   //   } finally {
// // // // //   //     setLoading(false);
// // // // //   //   }
// // // // //   // };

// // // // //   return (
// // // // //     <Modal visible={visible} animationType="slide" transparent>
// // // // //       <View style={styles.modalOverlay}>
// // // // //         <View style={styles.modalContainer}>
// // // // //           <View style={styles.modalHeader}>
// // // // //             <Text style={styles.modalTitle}>Book Room {room?.roomNumber}</Text>
// // // // //             <TouchableOpacity onPress={onClose}>
// // // // //               <Icon name="close" size={24} color="#666" />
// // // // //             </TouchableOpacity>
// // // // //           </View>

// // // // //           <ScrollView style={styles.modalContent}>
// // // // //             {/* Dates */}
// // // // //             <View style={styles.formGroup}>
// // // // //               <Text style={styles.label}>Check-in Date</Text>
// // // // //               <TouchableOpacity 
// // // // //                 style={styles.dateInput}
// // // // //                 onPress={() => setShowCheckInPicker(true)}
// // // // //               >
// // // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // // //                 <Text style={styles.dateText}>
// // // // //                   {checkIn.toLocaleDateString()}
// // // // //                 </Text>
// // // // //               </TouchableOpacity>
// // // // //               {showCheckInPicker && (
// // // // //                 <DateTimePicker
// // // // //                   value={checkIn}
// // // // //                   mode="date"
// // // // //                   display="default"
// // // // //                   onChange={(event, date) => {
// // // // //                     setShowCheckInPicker(false);
// // // // //                     if (date) setCheckIn(date);
// // // // //                   }}
// // // // //                 />
// // // // //               )}
// // // // //             </View>

// // // // //             <View style={styles.formGroup}>
// // // // //               <Text style={styles.label}>Check-out Date</Text>
// // // // //               <TouchableOpacity 
// // // // //                 style={styles.dateInput}
// // // // //                 onPress={() => setShowCheckOutPicker(true)}
// // // // //               >
// // // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // // //                 <Text style={styles.dateText}>
// // // // //                   {checkOut.toLocaleDateString()}
// // // // //                 </Text>
// // // // //               </TouchableOpacity>
// // // // //               {showCheckOutPicker && (
// // // // //                 <DateTimePicker
// // // // //                   value={checkOut}
// // // // //                   mode="date"
// // // // //                   display="default"
// // // // //                   onChange={(event, date) => {
// // // // //                     setShowCheckOutPicker(false);
// // // // //                     if (date) setCheckOut(date);
// // // // //                   }}
// // // // //                 />
// // // // //               )}
// // // // //             </View>

// // // // //             {/* Guest Information */}
// // // // //             <View style={styles.row}>
// // // // //               <View style={styles.halfInput}>
// // // // //                 <Text style={styles.label}>Adults</Text>
// // // // //                 <TextInput
// // // // //                   style={styles.input}
// // // // //                   value={numberOfAdults}
// // // // //                   onChangeText={setNumberOfAdults}
// // // // //                   keyboardType="numeric"
// // // // //                   placeholder="1"
// // // // //                 />
// // // // //               </View>
// // // // //               <View style={styles.halfInput}>
// // // // //                 <Text style={styles.label}>Children</Text>
// // // // //                 <TextInput
// // // // //                   style={styles.input}
// // // // //                   value={numberOfChildren}
// // // // //                   onChangeText={setNumberOfChildren}
// // // // //                   keyboardType="numeric"
// // // // //                   placeholder="0"
// // // // //                 />
// // // // //               </View>
// // // // //             </View>

// // // // //             {/* Special Request */}
// // // // //             <View style={styles.formGroup}>
// // // // //               <Text style={styles.label}>Special Request (Optional)</Text>
// // // // //               <TextInput
// // // // //                 style={styles.textArea}
// // // // //                 value={specialRequest}
// // // // //                 onChangeText={setSpecialRequest}
// // // // //                 placeholder="Any special requirements..."
// // // // //                 multiline
// // // // //                 numberOfLines={3}
// // // // //               />
// // // // //             </View>

// // // // //             {/* Price Summary */}
// // // // //             <View style={styles.priceSummary}>
// // // // //               <Text style={styles.priceLabel}>Total Amount:</Text>
// // // // //               <Text style={styles.priceValue}>
// // // // //                 ${calculateTotalPrice().toFixed(2)}
// // // // //               </Text>
// // // // //             </View>
// // // // //           </ScrollView>

// // // // //           <View style={styles.modalFooter}>
// // // // //             <TouchableOpacity 
// // // // //               style={styles.cancelButton}
// // // // //               onPress={onClose}
// // // // //             >
// // // // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // // // //             </TouchableOpacity>
// // // // //             <TouchableOpacity 
// // // // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // // // //               onPress={handleConfirm}
// // // // //               disabled={loading}
// // // // //             >
// // // // //               {loading ? (
// // // // //                 <ActivityIndicator size="small" color="#fff" />
// // // // //               ) : (
// // // // //                 <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// // // // //               )}
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </View>
// // // // //     </Modal>
// // // // //   );
// // // // // };

// // // // // // Reservation Modal Component for Admins
// // // // // const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms, roomType }) => {
// // // // //   const [reserveFrom, setReserveFrom] = useState(new Date());
// // // // //   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
// // // // //   const [showFromPicker, setShowFromPicker] = useState(false);
// // // // //   const [showToPicker, setShowToPicker] = useState(false);
// // // // //   const [loading, setLoading] = useState(false);

// // // // //   const handleConfirm = async () => {
// // // // //     if (!reserveFrom || !reserveTo) {
// // // // //       Alert.alert('Error', 'Please select reservation dates');
// // // // //       return;
// // // // //     }

// // // // //     if (reserveFrom >= reserveTo) {
// // // // //       Alert.alert('Error', 'Reservation end date must be after start date');
// // // // //       return;
// // // // //     }

// // // // //     setLoading(true);
// // // // //     try {
// // // // //       const reservationData = {
// // // // //         reserveFrom: reserveFrom.toISOString().split('T')[0],
// // // // //         reserveTo: reserveTo.toISOString().split('T')[0],
// // // // //       };

// // // // //       await onConfirm(reservationData);
// // // // //     } catch (error) {
// // // // //       console.error('Reservation error:', error);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <Modal visible={visible} animationType="slide" transparent>
// // // // //       <View style={styles.modalOverlay}>
// // // // //         <View style={styles.modalContainer}>
// // // // //           <View style={styles.modalHeader}>
// // // // //             <Text style={styles.modalTitle}>
// // // // //               Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // // // //             </Text>
// // // // //             <TouchableOpacity onPress={onClose}>
// // // // //               <Icon name="close" size={24} color="#666" />
// // // // //             </TouchableOpacity>
// // // // //           </View>

// // // // //           <ScrollView style={styles.modalContent}>
// // // // //             <Text style={styles.reservationInfo}>
// // // // //               You are about to reserve the following rooms:
// // // // //             </Text>

// // // // //             <View style={styles.roomsList}>
// // // // //               {selectedRooms.map(room => (
// // // // //                 <Text key={room.id} style={styles.roomItemText}>
// // // // //                   • Room {room.roomNumber}
// // // // //                 </Text>
// // // // //               ))}
// // // // //             </View>

// // // // //             {/* Dates */}
// // // // //             <View style={styles.formGroup}>
// // // // //               <Text style={styles.label}>Reserve From</Text>
// // // // //               <TouchableOpacity 
// // // // //                 style={styles.dateInput}
// // // // //                 onPress={() => setShowFromPicker(true)}
// // // // //               >
// // // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // // //                 <Text style={styles.dateText}>
// // // // //                   {reserveFrom.toLocaleDateString()}
// // // // //                 </Text>
// // // // //               </TouchableOpacity>
// // // // //               {showFromPicker && (
// // // // //                 <DateTimePicker
// // // // //                   value={reserveFrom}
// // // // //                   mode="date"
// // // // //                   display="default"
// // // // //                   onChange={(event, date) => {
// // // // //                     setShowFromPicker(false);
// // // // //                     if (date) setReserveFrom(date);
// // // // //                   }}
// // // // //                 />
// // // // //               )}
// // // // //             </View>

// // // // //             <View style={styles.formGroup}>
// // // // //               <Text style={styles.label}>Reserve To</Text>
// // // // //               <TouchableOpacity 
// // // // //                 style={styles.dateInput}
// // // // //                 onPress={() => setShowToPicker(true)}
// // // // //               >
// // // // //                 <Icon name="calendar-today" size={20} color="#666" />
// // // // //                 <Text style={styles.dateText}>
// // // // //                   {reserveTo.toLocaleDateString()}
// // // // //                 </Text>
// // // // //               </TouchableOpacity>
// // // // //               {showToPicker && (
// // // // //                 <DateTimePicker
// // // // //                   value={reserveTo}
// // // // //                   mode="date"
// // // // //                   display="default"
// // // // //                   onChange={(event, date) => {
// // // // //                     setShowToPicker(false);
// // // // //                     if (date) setReserveTo(date);
// // // // //                   }}
// // // // //                 />
// // // // //               )}
// // // // //             </View>

// // // // //             <View style={styles.noteBox}>
// // // // //               <Icon name="info" size={16} color="#ff9800" />
// // // // //               <Text style={styles.noteText}>
// // // // //                 This will prevent members from booking these rooms during the selected period.
// // // // //               </Text>
// // // // //             </View>
// // // // //           </ScrollView>

// // // // //           <View style={styles.modalFooter}>
// // // // //             <TouchableOpacity 
// // // // //               style={styles.cancelButton}
// // // // //               onPress={onClose}
// // // // //             >
// // // // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // // // //             </TouchableOpacity>
// // // // //             <TouchableOpacity 
// // // // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // // // //               onPress={handleConfirm}
// // // // //               disabled={loading}
// // // // //             >
// // // // //               {loading ? (
// // // // //                 <ActivityIndicator size="small" color="#fff" />
// // // // //               ) : (
// // // // //                 <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
// // // // //               )}
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </View>
// // // // //     </Modal>
// // // // //   );
// // // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: { 
// // // //     flex: 1, 
// // // //     backgroundColor: '#f9f3eb' 
// // // //   },
// // // //   header: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'space-between',
// // // //     paddingHorizontal: 20,
// // // //     paddingVertical: 15,
// // // //     backgroundColor: '#dbc9a5',
// // // //     borderBottomLeftRadius: 20,
// // // //     borderBottomRightRadius: 20,
// // // //     paddingTop: 40,
// // // //   },
// // // //   headerTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#000',
// // // //   },
// // // //   content: { 
// // // //     flex: 1, 
// // // //   },
// // // //   // Image Section Styles
// // // //   imageSection: {
// // // //     position: 'relative',
// // // //     height: 250,
// // // //   },
// // // //   mainImage: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   noImageContainer: {
// // // //     height: 200,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#f5f5f5',
// // // //   },
// // // //   noImageText: {
// // // //     color: '#999',
// // // //     marginTop: 10,
// // // //   },
// // // //   imageIndicators: {
// // // //     position: 'absolute',
// // // //     bottom: 15,
// // // //     left: 0,
// // // //     right: 0,
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'center',
// // // //   },
// // // //   imageIndicator: {
// // // //     width: 8,
// // // //     height: 8,
// // // //     borderRadius: 4,
// // // //     backgroundColor: 'rgba(255,255,255,0.5)',
// // // //     marginHorizontal: 4,
// // // //   },
// // // //   imageIndicatorActive: {
// // // //     backgroundColor: '#fff',
// // // //   },
// // // //   imageNavigation: {
// // // //     position: 'absolute',
// // // //     top: 0,
// // // //     bottom: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'space-between',
// // // //     paddingHorizontal: 10,
// // // //   },
// // // //   navButton: {
// // // //     backgroundColor: 'rgba(0,0,0,0.3)',
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   // Room Type Info Styles
// // // //   roomTypeInfo: {
// // // //     backgroundColor: '#fff',
// // // //     padding: 20,
// // // //     margin: 15,
// // // //     borderRadius: 15,
// // // //     shadowColor: '#000',
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 5,
// // // //     elevation: 3,
// // // //   },
// // // //   roomTypeName: {
// // // //     fontSize: 24,
// // // //     fontWeight: 'bold',
// // // //     color: '#a0855c',
// // // //     marginBottom: 10,
// // // //   },
// // // //   userInfo: {
// // // //     backgroundColor: '#f0f8ff',
// // // //     padding: 8,
// // // //     borderRadius: 6,
// // // //     marginBottom: 15,
// // // //     borderLeftWidth: 3,
// // // //     borderLeftColor: '#b48a64',
// // // //   },
// // // //   userInfoText: {
// // // //     fontSize: 12,
// // // //     color: '#666',
// // // //     fontStyle: 'italic',
// // // //   },
// // // //   // Pricing Section Styles
// // // //   pricingSection: {
// // // //     marginBottom: 15,
// // // //   },
// // // //   pricingTitle: {
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold',
// // // //     color: '#333',
// // // //     marginBottom: 10,
// // // //   },
// // // //   priceContainer: {
// // // //     backgroundColor: '#f8f9fa',
// // // //     padding: 15,
// // // //     borderRadius: 10,
// // // //     borderWidth: 1,
// // // //     borderColor: '#e9ecef',
// // // //   },
// // // //   priceRow: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     marginBottom: 8,
// // // //   },
// // // //   priceLabelContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //   },
// // // //   priceLabel: { 
// // // //     fontSize: 16, 
// // // //     color: '#666',
// // // //     fontWeight: '500',
// // // //     marginLeft: 6,
// // // //   },
// // // //   priceValue: { 
// // // //     fontSize: 16, 
// // // //     fontWeight: 'bold', 
// // // //     color: '#2c5530' 
// // // //   },
// // // //   perNightText: {
// // // //     fontSize: 12,
// // // //     color: '#888',
// // // //     textAlign: 'right',
// // // //     marginTop: 4,
// // // //     fontStyle: 'italic',
// // // //   },
// // // //   savingsContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#e8f5e8',
// // // //     padding: 8,
// // // //     borderRadius: 6,
// // // //     marginTop: 10,
// // // //     alignSelf: 'flex-start',
// // // //   },
// // // //   savingsText: {
// // // //     fontSize: 12,
// // // //     color: '#2e7d32',
// // // //     fontWeight: '500',
// // // //     marginLeft: 4,
// // // //   },
// // // //   roomCount: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     marginTop: 10,
// // // //     paddingTop: 10,
// // // //     borderTopWidth: 1,
// // // //     borderTopColor: '#eee',
// // // //   },
// // // //   roomCountText: {
// // // //     fontSize: 14,
// // // //     color: '#666',
// // // //     marginLeft: 6,
// // // //   },
// // // //   selectedCountText: {
// // // //     fontSize: 14,
// // // //     color: '#b48a64',
// // // //     fontWeight: 'bold',
// // // //     marginLeft: 10,
// // // //   },
// // // //   // Rooms Section Styles
// // // //   roomsSection: { 
// // // //     margin: 15,
// // // //     marginTop: 0,
// // // //   },
// // // //   sectionTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#333',
// // // //     marginBottom: 15,
// // // //   },
// // // //   // Room Item Styles
// // // //   roomItem: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#fff',
// // // //     padding: 15,
// // // //     borderRadius: 10,
// // // //     marginBottom: 10,
// // // //     shadowColor: '#000',
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 3,
// // // //     elevation: 2,
// // // //   },
// // // //   roomItemSelected: {
// // // //     borderColor: '#b48a64',
// // // //     borderWidth: 2,
// // // //     backgroundColor: '#fffaf5',
// // // //   },
// // // //   roomInfo: { 
// // // //     flex: 1 
// // // //   },
// // // //   roomNumber: {
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold',
// // // //     color: '#333',
// // // //   },
// // // //   roomDescription: {
// // // //     fontSize: 14,
// // // //     color: '#666',
// // // //     marginVertical: 5,
// // // //     lineHeight: 18,
// // // //   },
// // // //   statusContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     marginTop: 5,
// // // //   },
// // // //   statusIndicator: {
// // // //     width: 8,
// // // //     height: 8,
// // // //     borderRadius: 4,
// // // //     marginRight: 5,
// // // //   },
// // // //   active: { 
// // // //     backgroundColor: '#4CAF50' 
// // // //   },
// // // //   inactive: { 
// // // //     backgroundColor: '#f44336' 
// // // //   },
// // // //   statusText: {
// // // //     fontSize: 12,
// // // //     color: '#666',
// // // //   },
// // // //   outOfOrderContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     marginTop: 5,
// // // //     backgroundColor: '#fff3e0',
// // // //     paddingHorizontal: 8,
// // // //     paddingVertical: 4,
// // // //     borderRadius: 4,
// // // //     alignSelf: 'flex-start',
// // // //   },
// // // //   outOfOrderText: {
// // // //     fontSize: 11,
// // // //     color: '#e65100',
// // // //     marginLeft: 4,
// // // //     fontWeight: '500',
// // // //   },
// // // //   // Loading and Empty States
// // // //   loadingContainer: {
// // // //     alignItems: 'center',
// // // //     padding: 40,
// // // //   },
// // // //   loadingText: {
// // // //     marginTop: 10,
// // // //     color: '#666',
// // // //   },
// // // //   noRoomsContainer: {
// // // //     alignItems: 'center',
// // // //     padding: 40,
// // // //     backgroundColor: '#fff',
// // // //     borderRadius: 15,
// // // //     marginTop: 10,
// // // //   },
// // // //   noRoomsText: {
// // // //     fontSize: 18,
// // // //     color: '#666',
// // // //     marginTop: 10,
// // // //     fontWeight: 'bold',
// // // //   },
// // // //   noRoomsSubtext: {
// // // //     fontSize: 14,
// // // //     color: '#888',
// // // //     textAlign: 'center',
// // // //     marginTop: 5,
// // // //     lineHeight: 20,
// // // //   },
// // // //   // Button Styles
// // // //   retryButton: {
// // // //     backgroundColor: '#b48a64',
// // // //     paddingHorizontal: 20,
// // // //     paddingVertical: 10,
// // // //     borderRadius: 8,
// // // //     marginTop: 15,
// // // //   },
// // // //   retryText: {
// // // //     color: '#fff',
// // // //     fontWeight: 'bold',
// // // //   },
// // // //   // Footer Actions
// // // //   footer: {
// // // //     position: 'absolute',
// // // //     bottom: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //     backgroundColor: '#fff',
// // // //     padding: 20,
// // // //     borderTopWidth: 1,
// // // //     borderTopColor: '#eee',
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: -2 },
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 3,
// // // //     elevation: 5,
// // // //   },
// // // //   adminActions: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //   },
// // // //   actionButton: {
// // // //     padding: 16,
// // // //     borderRadius: 10,
// // // //     alignItems: 'center',
// // // //     flex: 1,
// // // //   },
// // // //   bookButton: {
// // // //     backgroundColor: '#a0855c',
// // // //   },
// // // //   reserveButton: {
// // // //     backgroundColor: '#b48a64',
// // // //   },
// // // //   buttonDisabled: {
// // // //     backgroundColor: '#ccc',
// // // //   },
// // // //   actionButtonText: {
// // // //     color: '#fff',
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold',
// // // //   },
// // // //   bookButtonContent: {
// // // //     alignItems: 'center',
// // // //   },
// // // //   bookButtonSubtext: {
// // // //     color: '#fff',
// // // //     fontSize: 12,
// // // //     marginTop: 4,
// // // //     opacity: 0.9,
// // // //   },
// // // //   // Modal Styles
// // // //   modalOverlay: {
// // // //     flex: 1,
// // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     padding: 20,
// // // //   },
// // // //   modalContainer: {
// // // //     width: '100%',
// // // //     maxWidth: 400,
// // // //     backgroundColor: '#fff',
// // // //     borderRadius: 15,
// // // //     maxHeight: '80%',
// // // //   },
// // // //   modalHeader: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     padding: 20,
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: '#eee',
// // // //   },
// // // //   modalTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#333',
// // // //   },
// // // //   modalContent: {
// // // //     padding: 20,
// // // //   },
// // // //   modalFooter: {
// // // //     flexDirection: 'row',
// // // //     padding: 20,
// // // //     borderTopWidth: 1,
// // // //     borderTopColor: '#eee',
// // // //     gap: 10,
// // // //   },
// // // //   // Form Styles
// // // //   formGroup: {
// // // //     marginBottom: 16,
// // // //   },
// // // //   label: {
// // // //     fontSize: 14,
// // // //     fontWeight: '600',
// // // //     color: '#333',
// // // //     marginBottom: 6,
// // // //   },
// // // //   input: {
// // // //     backgroundColor: '#f8f9fa',
// // // //     borderWidth: 1,
// // // //     borderColor: '#ddd',
// // // //     borderRadius: 8,
// // // //     padding: 12,
// // // //     fontSize: 16,
// // // //     color: '#333',
// // // //   },
// // // //   textArea: {
// // // //     backgroundColor: '#f8f9fa',
// // // //     borderWidth: 1,
// // // //     borderColor: '#ddd',
// // // //     borderRadius: 8,
// // // //     padding: 12,
// // // //     fontSize: 16,
// // // //     color: '#333',
// // // //     minHeight: 80,
// // // //     textAlignVertical: 'top',
// // // //   },
// // // //   dateInput: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#f8f9fa',
// // // //     borderWidth: 1,
// // // //     borderColor: '#ddd',
// // // //     borderRadius: 8,
// // // //     padding: 12,
// // // //   },
// // // //   dateText: {
// // // //     fontSize: 16,
// // // //     color: '#333',
// // // //     marginLeft: 8,
// // // //   },
// // // //   row: {
// // // //     flexDirection: 'row',
// // // //     gap: 10,
// // // //   },
// // // //   halfInput: {
// // // //     flex: 1,
// // // //   },
// // // //   priceSummary: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#f8f9fa',
// // // //     padding: 15,
// // // //     borderRadius: 8,
// // // //     marginTop: 10,
// // // //   },
// // // //   priceLabel: {
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //     color: '#333',
// // // //   },
// // // //   priceValue: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#2e7d32',
// // // //   },
// // // //   cancelButton: {
// // // //     flex: 1,
// // // //     padding: 12,
// // // //     borderRadius: 8,
// // // //     borderWidth: 1,
// // // //     borderColor: '#ddd',
// // // //     alignItems: 'center',
// // // //   },
// // // //   cancelButtonText: {
// // // //     color: '#666',
// // // //     fontWeight: '600',
// // // //   },
// // // //   confirmButton: {
// // // //     flex: 2,
// // // //     padding: 12,
// // // //     borderRadius: 8,
// // // //     backgroundColor: '#b48a64',
// // // //     alignItems: 'center',
// // // //   },
// // // //   confirmButtonText: {
// // // //     color: '#fff',
// // // //     fontWeight: 'bold',
// // // //     fontSize: 16,
// // // //   },
// // // //   // Reservation specific styles
// // // //   reservationInfo: {
// // // //     fontSize: 14,
// // // //     color: '#666',
// // // //     marginBottom: 15,
// // // //     lineHeight: 20,
// // // //   },
// // // //   roomsList: {
// // // //     backgroundColor: '#f8f9fa',
// // // //     padding: 15,
// // // //     borderRadius: 8,
// // // //     marginBottom: 15,
// // // //   },
// // // //   roomItemText: {
// // // //     fontSize: 14,
// // // //     color: '#333',
// // // //     marginBottom: 5,
// // // //   },
// // // //   noteBox: {
// // // //     flexDirection: 'row',
// // // //     backgroundColor: '#fff3e0',
// // // //     padding: 12,
// // // //     borderRadius: 8,
// // // //     marginTop: 10,
// // // //   },
// // // //   noteText: {
// // // //     fontSize: 12,
// // // //     color: '#e65100',
// // // //     marginLeft: 8,
// // // //     flex: 1,
// // // //     lineHeight: 16,
// // // //   },
// // // //   // Access Denied Styles
// // // //   accessDeniedContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     padding: 30,
// // // //     backgroundColor: '#f9f3eb',
// // // //   },
// // // //   accessDeniedTitle: {
// // // //     fontSize: 20,
// // // //     fontWeight: 'bold',
// // // //     color: '#d32f2f',
// // // //     marginTop: 15,
// // // //     marginBottom: 10,
// // // //     textAlign: 'center',
// // // //   },
// // // //   accessDeniedText: {
// // // //     fontSize: 16,
// // // //     color: '#666',
// // // //     textAlign: 'center',
// // // //     lineHeight: 22,
// // // //     marginBottom: 25,
// // // //   },
// // // //   backButton: {
// // // //     backgroundColor: '#b48a64',
// // // //     paddingHorizontal: 25,
// // // //     paddingVertical: 12,
// // // //     borderRadius: 8,
// // // //   },
// // // //   backButtonText: {
// // // //     color: '#fff',
// // // //     fontWeight: 'bold',
// // // //     fontSize: 16,
// // // //   },
// // // // });

// // // //ok working booking trying voucher
// // // // screens/RoomDetailsScreen.js
// // // import React, { useState, useEffect } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   ScrollView,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   FlatList,
// // //   Alert,
// // //   StatusBar,
// // //   Image,
// // //   Dimensions,
// // //   Modal,
// // //   TextInput
// // // } from 'react-native';
// // // import Icon from 'react-native-vector-icons/MaterialIcons';
// // // import DateTimePicker from '@react-native-community/datetimepicker';
// // // import { roomService } from '../services/roomService';
// // // import { bookingService } from '../services/bookingService';
// // // import { useAuth } from '../contexts/AuthContext';

// // // const { width: screenWidth } = Dimensions.get('window');

// // // export default function details({ navigation, route }) {
// // //   const { user, isAuthenticated } = useAuth();

// // //   // Enhanced debugging - log everything
// // //   console.log('🚀 RoomDetails - User object:', JSON.stringify(user, null, 2));
// // //   console.log('🚀 RoomDetails - isAuthenticated:', isAuthenticated);

// // //   // Direct extraction with multiple fallbacks
// // //   const userRole = user?.role;
// // //   const userName = user?.name;

// // //   // Try every possible field name for membership number and admin ID
// // //   const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
// // //   const adminId = user?.adminId || user?.adminID || user?.admin_id || user?.id;

// // //   console.log('🔍 Extracted values:', {
// // //     userRole,
// // //     userName,
// // //     membershipNo,
// // //     adminId,
// // //     allUserKeys: user ? Object.keys(user) : 'No user'
// // //   });

// // //   const [rooms, setRooms] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedRoom, setSelectedRoom] = useState(null);
// // //   const [selectedRooms, setSelectedRooms] = useState([]);
// // //   const [roomType, setRoomType] = useState(route.params?.roomType);
// // //   const [imageIndex, setImageIndex] = useState(0);
// // //   const [loadingRooms, setLoadingRooms] = useState(false);
// // //   const [showBookingModal, setShowBookingModal] = useState(false);
// // //   const [showReservationModal, setShowReservationModal] = useState(false);

// // //   useEffect(() => {
// // //     console.log('🎯 useEffect triggered - Auth status:', isAuthenticated);

// // //     if (!isAuthenticated || !user) {
// // //       Alert.alert(
// // //         'Authentication Required',
// // //         'Please login to access room details.',
// // //         [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
// // //       );
// // //       return;
// // //     }

// // //     fetchRooms();
// // //   }, [isAuthenticated, user]);

// // //   const isAdminUser = () => {
// // //     const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
// // //     console.log('👮 isAdminUser check:', { userRole, isAdmin });
// // //     return isAdmin;
// // //   };

// // //   const isMemberUser = () => {
// // //     const isMember = userRole === 'MEMBER';
// // //     console.log('👤 isMemberUser check:', { userRole, isMember });
// // //     return isMember;
// // //   };

// // //   const fetchRooms = async () => {
// // //     try {
// // //       setLoadingRooms(true);
// // //       console.log('🔄 Fetching rooms for roomType:', roomType.id);
// // //       const roomData = await roomService.getAvailableRooms(roomType.id);
// // //       console.log("✅ Fetched available rooms:", roomData);
// // //       setRooms(roomData);
// // //     } catch (error) {
// // //       console.error('❌ Error fetching rooms:', error);
// // //       Alert.alert('Error', 'Failed to load available rooms. Please try again.');
// // //     } finally {
// // //       setLoadingRooms(false);
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleRoomSelect = (room) => {
// // //     console.log('🛏️ Room selected:', room.roomNumber);
// // //     if (isAdminUser()) {
// // //       if (selectedRooms.find(r => r.id === room.id)) {
// // //         setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
// // //       } else {
// // //         setSelectedRooms([...selectedRooms, room]);
// // //       }
// // //     } else {
// // //       setSelectedRoom(room);
// // //     }
// // //   };

// // //   const handleBookNow = () => {
// // //     console.log('📖 Book Now clicked');
// // //     if (!selectedRoom) {
// // //       Alert.alert('Please Select', 'Please select a room to continue');
// // //       return;
// // //     }
// // //     setShowBookingModal(true);
// // //   };

// // //   const handleReserveRooms = () => {
// // //     console.log('🔒 Reserve Rooms clicked');
// // //     if (selectedRooms.length === 0) {
// // //       Alert.alert('Please Select', 'Please select at least one room to reserve');
// // //       return;
// // //     }
// // //     setShowReservationModal(true);
// // //   };

// // //   // Enhanced booking function
// // //   const handleConfirmBooking = async (bookingData) => {
// // //     try {
// // //       console.log('🎫 Starting booking process...');
// // //       console.log('   - User role:', userRole);
// // //       console.log('   - Membership number attempts:', {
// // //         membershipNo,
// // //         userMembershipNo: user?.membershipNo,
// // //         userMembership_no: user?.membership_no,
// // //         userMembership_No: user?.Membership_No,
// // //         userId: user?.id
// // //       });

// // //       // Check if we have ANY identifier that could work as membership number
// // //       const possibleMembershipNo = membershipNo || user?.id;

// // //       if (!possibleMembershipNo) {
// // //         Alert.alert(
// // //           'Membership Number Required', 
// // //           `We couldn't find your membership number.\n\nAvailable user data:\n${JSON.stringify(user, null, 2)}`,
// // //           [{ text: 'OK' }]
// // //         );
// // //         return;
// // //       }

// // //       if (!selectedRoom) {
// // //         Alert.alert('Error', 'Please select a room to book');
// // //         return;
// // //       }

// // //       console.log('✅ Using membership number:', possibleMembershipNo);

// // //       const payload = {
// // //         membership_no: possibleMembershipNo,
// // //         roomTypeId: roomType.id,
// // //         checkIn: bookingData.checkIn,
// // //         checkOut: bookingData.checkOut,
// // //         numberOfRooms: 1,
// // //         numberOfAdults: bookingData.numberOfAdults || 1,
// // //         numberOfChildren: bookingData.numberOfChildren || 0,
// // //         pricingType: 'MEMBER',
// // //         specialRequest: bookingData.specialRequest || '',
// // //         totalPrice: bookingData.totalPrice,
// // //         selectedRoomIds: [selectedRoom.id],
// // //         paymentStatus: 'PAID',
// // //         paidAmount: bookingData.totalPrice,
// // //         pendingAmount: 0,
// // //         paymentMode: 'ONLINE',
// // //       };

// // //       console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

// // //       const result = await bookingService.memberBookingRoom(payload);

// // //       Alert.alert(
// // //         'Booking Successful!',
// // //         `Room ${selectedRoom.roomNumber} has been booked successfully from ${bookingData.checkIn} to ${bookingData.checkOut}.`,
// // //         [{ 
// // //           text: 'OK', 
// // //           onPress: () => {
// // //             setShowBookingModal(false);
// // //             navigation.goBack();
// // //           }
// // //         }]
// // //       );

// // //     } catch (error) {
// // //       console.error('💥 Booking error in component:', error);
// // //       Alert.alert(
// // //         'Booking Failed', 
// // //         error.message || 'Failed to book room. Please try again.'
// // //       );
// // //     }
// // //   };

// // //   // Enhanced reservation function
// // //   // const handleConfirmReservation = async (reservationData) => {
// // //   //   try {
// // //   //     console.log('🔐 Starting reservation process...');
// // //   //     console.log('   - User role:', userRole);
// // //   //     console.log('   - Admin ID attempts:', {
// // //   //       adminId,
// // //   //       userAdminId: user?.adminId,
// // //   //       userAdminID: user?.adminID,
// // //   //       userAdmin_id: user?.admin_id,
// // //   //       userId: user?.id
// // //   //     });

// // //   //     const roomIds = selectedRooms.map(room => room.id);

// // //   //     // Check if we have ANY identifier that could work as admin ID
// // //   //     const possibleAdminId = adminId || user?.id;

// // //   //     if (!possibleAdminId) {
// // //   //       Alert.alert(
// // //   //         'Admin ID Required',
// // //   //         `We couldn't find your admin ID.\n\nAvailable user data:\n${JSON.stringify(user, null, 2)}`,
// // //   //         [{ text: 'OK' }]
// // //   //       );
// // //   //       return;
// // //   //     }

// // //   //     console.log('✅ Using admin ID:', possibleAdminId);

// // //   //     const payload = {
// // //   //       roomIds: roomIds,
// // //   //       reserve: true,
// // //   //       reserveFrom: reservationData.reserveFrom,
// // //   //       reserveTo: reservationData.reserveTo,
// // //   //       adminId: possibleAdminId,
// // //   //     };

// // //   //     console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));

// // //   //     await roomService.reserveRooms(payload);

// // //   //     Alert.alert(
// // //   //       'Reservation Successful!',
// // //   //       `${selectedRooms.length} room(s) have been reserved successfully.`,
// // //   //       [{ 
// // //   //         text: 'OK', 
// // //   //         onPress: () => {
// // //   //           setShowReservationModal(false);
// // //   //           setSelectedRooms([]);
// // //   //           fetchRooms();
// // //   //         }
// // //   //       }]
// // //   //     );
// // //   //   } catch (error) {
// // //   //     console.error('💥 Reservation error:', error);
// // //   //     Alert.alert(
// // //   //       'Reservation Failed', 
// // //   //       error.message || 'Failed to reserve rooms. Please try again.'
// // //   //     );
// // //   //   }
// // //   // };
// // //   // Enhanced reservation function - Remove adminId from payload
// // // const handleConfirmReservation = async (reservationData) => {
// // //   try {
// // //     console.log('🔐 Starting reservation process...');
// // //     console.log('   - User role:', userRole);

// // //     const roomIds = selectedRooms.map(room => room.id);

// // //     // The backend gets adminId from JWT token, so don't send it in payload
// // //     const payload = {
// // //       roomIds: roomIds,
// // //       reserve: true,
// // //       reserveFrom: reservationData.reserveFrom,
// // //       reserveTo: reservationData.reserveTo,
// // //       // Remove adminId from payload - backend gets it from JWT token
// // //     };

// // //     console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
// // //     console.log('👤 Admin ID will come from JWT token');

// // //     await roomService.reserveRooms(payload);

// // //     Alert.alert(
// // //       'Reservation Successful!',
// // //       `${selectedRooms.length} room(s) have been reserved successfully.`,
// // //       [{ 
// // //         text: 'OK', 
// // //         onPress: () => {
// // //           setShowReservationModal(false);
// // //           setSelectedRooms([]);
// // //           fetchRooms();
// // //         }
// // //       }]
// // //     );
// // //   } catch (error) {
// // //     console.error('💥 Reservation error:', error);
// // //     Alert.alert(
// // //       'Reservation Failed', 
// // //       error.message || 'Failed to reserve rooms. Please try again.'
// // //     );
// // //   }
// // // };

// // //   const formatPrice = (price) => {
// // //     if (!price && price !== 0) return 'N/A';
// // //     return `$${parseFloat(price).toFixed(2)}`;
// // //   };

// // //   const renderImages = () => {
// // //     const images = roomType.images || [];

// // //     if (images.length === 0) {
// // //       return (
// // //         <View style={styles.noImageContainer}>
// // //           <Icon name="image" size={60} color="#ccc" />
// // //           <Text style={styles.noImageText}>No images available</Text>
// // //         </View>
// // //       );
// // //     }

// // //     return (
// // //       <View style={styles.imageSection}>
// // //         <Image 
// // //           source={{ uri: images[imageIndex]?.url }} 
// // //           style={styles.mainImage}
// // //           resizeMode="cover"
// // //         />

// // //         {images.length > 1 && (
// // //           <View style={styles.imageIndicators}>
// // //             {images.map((_, index) => (
// // //               <TouchableOpacity
// // //                 key={index}
// // //                 style={[
// // //                   styles.imageIndicator,
// // //                   index === imageIndex && styles.imageIndicatorActive
// // //                 ]}
// // //                 onPress={() => setImageIndex(index)}
// // //               />
// // //             ))}
// // //           </View>
// // //         )}
// // //       </View>
// // //     );
// // //   };

// // //   const renderRoomItem = ({ item }) => {
// // //     const isSelected = isAdminUser() 
// // //       ? selectedRooms.find(r => r.id === item.id)
// // //       : selectedRoom?.id === item.id;

// // //     return (
// // //       <TouchableOpacity
// // //         style={[
// // //           styles.roomItem,
// // //           isSelected && styles.roomItemSelected,
// // //         ]}
// // //         onPress={() => handleRoomSelect(item)}
// // //       >
// // //         <View style={styles.roomInfo}>
// // //           <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
// // //           <Text style={styles.roomDescription}>
// // //             {item.description || 'Comfortable and well-equipped room'}
// // //           </Text>
// // //           <View style={styles.statusContainer}>
// // //             <View
// // //               style={[
// // //                 styles.statusIndicator,
// // //                 item.isActive ? styles.active : styles.inactive,
// // //               ]}
// // //             />
// // //             <Text style={styles.statusText}>
// // //               {item.isActive ? 'Available' : 'Unavailable'}
// // //             </Text>
// // //           </View>
// // //         </View>
// // //         <Icon
// // //           name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
// // //           size={24}
// // //           color="#b48a64"
// // //         />
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   if (!isAuthenticated || !user) {
// // //     return (
// // //       <View style={styles.container}>
// // //         <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />
// // //         <View style={styles.header}>
// // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // //             <Icon name="arrow-back" size={24} color="#000" />
// // //           </TouchableOpacity>
// // //           <Text style={styles.headerTitle}>Authentication Required</Text>
// // //           <View style={{ width: 24 }} />
// // //         </View>
// // //         <View style={styles.accessDeniedContainer}>
// // //           <Icon name="block" size={60} color="#ff6b6b" />
// // //           <Text style={styles.accessDeniedTitle}>Please Login</Text>
// // //           <Text style={styles.accessDeniedText}>
// // //             You need to be logged in to view room details.
// // //           </Text>
// // //           <TouchableOpacity 
// // //             style={styles.backButton} 
// // //             onPress={() => navigation.navigate('LoginScr')}
// // //           >
// // //             <Text style={styles.backButtonText}>Go to Login</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />

// // //       <View style={styles.header}>
// // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // //           <Icon name="arrow-back" size={24} color="#000" />
// // //         </TouchableOpacity>
// // //         <Text style={styles.headerTitle}>{roomType.name}</Text>
// // //         <View style={{ width: 24 }} />
// // //       </View>

// // //       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
// // //         {renderImages()}

// // //         <View style={styles.roomTypeInfo}>
// // //           <Text style={styles.roomTypeName}>{roomType.name}</Text>

// // //           {/* Enhanced Debug Info */}
// // //           <View style={styles.debugSection}>
// // //             <Text style={styles.debugTitle}>Debug Information:</Text>
// // //             <Text style={styles.debugText}>Role: {userRole}</Text>
// // //             <Text style={styles.debugText}>Name: {userName}</Text>
// // //             <Text style={styles.debugText}>Membership No: {membershipNo || 'NOT FOUND'}</Text>
// // //             <Text style={styles.debugText}>Admin ID: {adminId || 'NOT FOUND'}</Text>
// // //             <Text style={styles.debugText}>User ID: {user?.id}</Text>
// // //             <Text style={styles.smallDebugText}>
// // //               All keys: {user ? Object.keys(user).join(', ') : 'No user'}
// // //             </Text>
// // //           </View>

// // //           <View style={styles.pricingSection}>
// // //             <Text style={styles.pricingTitle}>Pricing Information</Text>

// // //             <View style={styles.priceContainer}>
// // //               <View style={styles.priceRow}>
// // //                 <View style={styles.priceLabelContainer}>
// // //                   <Icon name="person" size={16} color="#666" />
// // //                   <Text style={styles.priceLabel}>Member Price:</Text>
// // //                 </View>
// // //                 <Text style={styles.priceValue}>
// // //                   {formatPrice(roomType.priceMember)}
// // //                 </Text>
// // //               </View>

// // //               <View style={styles.priceRow}>
// // //                 <View style={styles.priceLabelContainer}>
// // //                   <Icon name="person-outline" size={16} color="#666" />
// // //                   <Text style={styles.priceLabel}>Guest Price:</Text>
// // //                 </View>
// // //                 <Text style={styles.priceValue}>
// // //                   {formatPrice(roomType.priceGuest)}
// // //                 </Text>
// // //               </View>

// // //               <Text style={styles.perNightText}>per night</Text>
// // //             </View>
// // //           </View>

// // //           <View style={styles.roomCount}>
// // //             <Icon name="meeting-room" size={16} color="#666" />
// // //             <Text style={styles.roomCountText}>
// // //               {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
// // //             </Text>
// // //             {isAdminUser() && selectedRooms.length > 0 && (
// // //               <Text style={styles.selectedCountText}>
// // //                 • {selectedRooms.length} selected
// // //               </Text>
// // //             )}
// // //           </View>
// // //         </View>

// // //         <View style={styles.roomsSection}>
// // //           <Text style={styles.sectionTitle}>
// // //             {isAdminUser() ? 'Select Rooms to Reserve' : 'Available Rooms'}
// // //           </Text>

// // //           {loadingRooms ? (
// // //             <View style={styles.loadingContainer}>
// // //               <ActivityIndicator size="large" color="#b48a64" />
// // //               <Text style={styles.loadingText}>Loading available rooms...</Text>
// // //             </View>
// // //           ) : rooms.length > 0 ? (
// // //             <FlatList
// // //               data={rooms}
// // //               renderItem={renderRoomItem}
// // //               keyExtractor={(item) => item.id.toString()}
// // //               scrollEnabled={false}
// // //               showsVerticalScrollIndicator={false}
// // //             />
// // //           ) : (
// // //             <View style={styles.noRoomsContainer}>
// // //               <Icon name="meeting-room" size={50} color="#ccc" />
// // //               <Text style={styles.noRoomsText}>No rooms available</Text>
// // //               <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
// // //                 <Text style={styles.retryText}>Refresh</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           )}
// // //         </View>

// // //         <View style={{ height: 100 }} />
// // //       </ScrollView>

// // //       {rooms.length > 0 && !loadingRooms && (
// // //         <View style={styles.footer}>
// // //           {isAdminUser() ? (
// // //             <View style={styles.adminActions}>
// // //               <TouchableOpacity
// // //                 style={[
// // //                   styles.actionButton,
// // //                   styles.reserveButton,
// // //                   selectedRooms.length === 0 && styles.buttonDisabled,
// // //                 ]}
// // //                 onPress={handleReserveRooms}
// // //                 disabled={selectedRooms.length === 0}
// // //               >
// // //                 <Text style={styles.actionButtonText}>
// // //                   Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           ) : (
// // //             <TouchableOpacity
// // //               style={[
// // //                 styles.actionButton,
// // //                 styles.bookButton,
// // //                 !selectedRoom && styles.buttonDisabled,
// // //               ]}
// // //               onPress={handleBookNow}
// // //               disabled={!selectedRoom}
// // //             >
// // //               <Text style={styles.actionButtonText}>
// // //                 {selectedRoom 
// // //                   ? `Book Room ${selectedRoom.roomNumber}` 
// // //                   : 'Select a Room'
// // //                 }
// // //               </Text>
// // //             </TouchableOpacity>
// // //           )}
// // //         </View>
// // //       )}

// // //       <BookingModal
// // //         visible={showBookingModal}
// // //         onClose={() => setShowBookingModal(false)}
// // //         onConfirm={handleConfirmBooking}
// // //         room={selectedRoom}
// // //         roomType={roomType}
// // //       />

// // //       <ReservationModal
// // //         visible={showReservationModal}
// // //         onClose={() => setShowReservationModal(false)}
// // //         onConfirm={handleConfirmReservation}
// // //         selectedRooms={selectedRooms}
// // //       />
// // //     </View>
// // //   );
// // // }

// // // // Booking Modal Component
// // // const BookingModal = ({ visible, onClose, onConfirm, room, roomType }) => {
// // //   const [checkIn, setCheckIn] = useState(new Date());
// // //   const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
// // //   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
// // //   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
// // //   const [numberOfAdults, setNumberOfAdults] = useState('1');
// // //   const [numberOfChildren, setNumberOfChildren] = useState('0');
// // //   const [specialRequest, setSpecialRequest] = useState('');
// // //   const [loading, setLoading] = useState(false);

// // //   const calculateTotalPrice = () => {
// // //     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
// // //     const price = roomType.priceMember || roomType.priceGuest || 0;
// // //     return nights * price;
// // //   };

// // //   const handleConfirm = async () => {
// // //     if (!checkIn || !checkOut) {
// // //       Alert.alert('Error', 'Please select check-in and check-out dates');
// // //       return;
// // //     }

// // //     if (checkIn >= checkOut) {
// // //       Alert.alert('Error', 'Check-out date must be after check-in date');
// // //       return;
// // //     }

// // //     const adults = parseInt(numberOfAdults) || 1;
// // //     const children = parseInt(numberOfChildren) || 0;

// // //     if (adults < 1) {
// // //       Alert.alert('Error', 'At least one adult is required');
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const bookingData = {
// // //         checkIn: checkIn.toISOString().split('T')[0],
// // //         checkOut: checkOut.toISOString().split('T')[0],
// // //         numberOfAdults: adults,
// // //         numberOfChildren: children,
// // //         specialRequest: specialRequest,
// // //         totalPrice: calculateTotalPrice(),
// // //       };

// // //       await onConfirm(bookingData);
// // //     } catch (error) {
// // //       // Error handled in parent
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <Modal visible={visible} animationType="slide" transparent>
// // //       <View style={styles.modalOverlay}>
// // //         <View style={styles.modalContainer}>
// // //           <View style={styles.modalHeader}>
// // //             <Text style={styles.modalTitle}>Book Room {room?.roomNumber}</Text>
// // //             <TouchableOpacity onPress={onClose}>
// // //               <Icon name="close" size={24} color="#666" />
// // //             </TouchableOpacity>
// // //           </View>

// // //           <ScrollView style={styles.modalContent}>
// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Check-in Date</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowCheckInPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {checkIn.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showCheckInPicker && (
// // //                 <DateTimePicker
// // //                   value={checkIn}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowCheckInPicker(false);
// // //                     if (date) setCheckIn(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Check-out Date</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowCheckOutPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {checkOut.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showCheckOutPicker && (
// // //                 <DateTimePicker
// // //                   value={checkOut}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowCheckOutPicker(false);
// // //                     if (date) setCheckOut(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>

// // //             <View style={styles.row}>
// // //               <View style={styles.halfInput}>
// // //                 <Text style={styles.label}>Adults</Text>
// // //                 <TextInput
// // //                   style={styles.input}
// // //                   value={numberOfAdults}
// // //                   onChangeText={setNumberOfAdults}
// // //                   keyboardType="numeric"
// // //                 />
// // //               </View>
// // //               <View style={styles.halfInput}>
// // //                 <Text style={styles.label}>Children</Text>
// // //                 <TextInput
// // //                   style={styles.input}
// // //                   value={numberOfChildren}
// // //                   onChangeText={setNumberOfChildren}
// // //                   keyboardType="numeric"
// // //                 />
// // //               </View>
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Special Request (Optional)</Text>
// // //               <TextInput
// // //                 style={styles.textArea}
// // //                 value={specialRequest}
// // //                 onChangeText={setSpecialRequest}
// // //                 placeholder="Any special requirements..."
// // //                 multiline
// // //                 numberOfLines={3}
// // //               />
// // //             </View>

// // //             <View style={styles.priceSummary}>
// // //               <Text style={styles.priceLabel}>Total Amount:</Text>
// // //               <Text style={styles.priceValue}>
// // //                 ${calculateTotalPrice().toFixed(2)}
// // //               </Text>
// // //             </View>
// // //           </ScrollView>

// // //           <View style={styles.modalFooter}>
// // //             <TouchableOpacity 
// // //               style={styles.cancelButton}
// // //               onPress={onClose}
// // //             >
// // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // //             </TouchableOpacity>
// // //             <TouchableOpacity 
// // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // //               onPress={handleConfirm}
// // //               disabled={loading}
// // //             >
// // //               {loading ? (
// // //                 <ActivityIndicator size="small" color="#fff" />
// // //               ) : (
// // //                 <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };

// // // // Reservation Modal Component
// // // const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms }) => {
// // //   const [reserveFrom, setReserveFrom] = useState(new Date());
// // //   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
// // //   const [showFromPicker, setShowFromPicker] = useState(false);
// // //   const [showToPicker, setShowToPicker] = useState(false);
// // //   const [loading, setLoading] = useState(false);

// // //   const handleConfirm = async () => {
// // //     if (!reserveFrom || !reserveTo) {
// // //       Alert.alert('Error', 'Please select reservation dates');
// // //       return;
// // //     }

// // //     if (reserveFrom >= reserveTo) {
// // //       Alert.alert('Error', 'Reservation end date must be after start date');
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const reservationData = {
// // //         reserveFrom: reserveFrom.toISOString().split('T')[0],
// // //         reserveTo: reserveTo.toISOString().split('T')[0],
// // //       };

// // //       await onConfirm(reservationData);
// // //     } catch (error) {
// // //       console.error('Reservation error:', error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <Modal visible={visible} animationType="slide" transparent>
// // //       <View style={styles.modalOverlay}>
// // //         <View style={styles.modalContainer}>
// // //           <View style={styles.modalHeader}>
// // //             <Text style={styles.modalTitle}>
// // //               Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // //             </Text>
// // //             <TouchableOpacity onPress={onClose}>
// // //               <Icon name="close" size={24} color="#666" />
// // //             </TouchableOpacity>
// // //           </View>

// // //           <ScrollView style={styles.modalContent}>
// // //             <Text style={styles.reservationInfo}>
// // //               You are about to reserve the following rooms:
// // //             </Text>

// // //             <View style={styles.roomsList}>
// // //               {selectedRooms.map(room => (
// // //                 <Text key={room.id} style={styles.roomItemText}>
// // //                   • Room {room.roomNumber}
// // //                 </Text>
// // //               ))}
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Reserve From</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowFromPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {reserveFrom.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showFromPicker && (
// // //                 <DateTimePicker
// // //                   value={reserveFrom}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowFromPicker(false);
// // //                     if (date) setReserveFrom(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Reserve To</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowToPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {reserveTo.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showToPicker && (
// // //                 <DateTimePicker
// // //                   value={reserveTo}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowToPicker(false);
// // //                     if (date) setReserveTo(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>
// // //           </ScrollView>

// // //           <View style={styles.modalFooter}>
// // //             <TouchableOpacity 
// // //               style={styles.cancelButton}
// // //               onPress={onClose}
// // //             >
// // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // //             </TouchableOpacity>
// // //             <TouchableOpacity 
// // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // //               onPress={handleConfirm}
// // //               disabled={loading}
// // //             >
// // //               {loading ? (
// // //                 <ActivityIndicator size="small" color="#fff" />
// // //               ) : (
// // //                 <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: '#f9f3eb' },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 15,
// // //     backgroundColor: '#dbc9a5',
// // //     borderBottomLeftRadius: 20,
// // //     borderBottomRightRadius: 20,
// // //     paddingTop: 40,
// // //   },
// // //   headerTitle: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#000',
// // //   },
// // //   content: { flex: 1 },
// // //   imageSection: {
// // //     position: 'relative',
// // //     height: 250,
// // //   },
// // //   mainImage: {
// // //     width: '100%',
// // //     height: '100%',
// // //   },
// // //   noImageContainer: {
// // //     height: 200,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#f5f5f5',
// // //   },
// // //   noImageText: {
// // //     color: '#999',
// // //     marginTop: 10,
// // //   },
// // //   imageIndicators: {
// // //     position: 'absolute',
// // //     bottom: 15,
// // //     left: 0,
// // //     right: 0,
// // //     flexDirection: 'row',
// // //     justifyContent: 'center',
// // //   },
// // //   imageIndicator: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     backgroundColor: 'rgba(255,255,255,0.5)',
// // //     marginHorizontal: 4,
// // //   },
// // //   imageIndicatorActive: {
// // //     backgroundColor: '#fff',
// // //   },
// // //   roomTypeInfo: {
// // //     backgroundColor: '#fff',
// // //     padding: 20,
// // //     margin: 15,
// // //     borderRadius: 15,
// // //     shadowColor: '#000',
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 5,
// // //     elevation: 3,
// // //   },
// // //   roomTypeName: {
// // //     fontSize: 24,
// // //     fontWeight: 'bold',
// // //     color: '#a0855c',
// // //     marginBottom: 10,
// // //   },
// // //   debugSection: {
// // //     backgroundColor: '#fff3cd',
// // //     padding: 12,
// // //     borderRadius: 8,
// // //     marginBottom: 15,
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#ffc107',
// // //   },
// // //   debugTitle: {
// // //     fontSize: 14,
// // //     fontWeight: 'bold',
// // //     color: '#856404',
// // //     marginBottom: 5,
// // //   },
// // //   debugText: {
// // //     fontSize: 12,
// // //     color: '#856404',
// // //     marginBottom: 2,
// // //   },
// // //   smallDebugText: {
// // //     fontSize: 10,
// // //     color: '#856404',
// // //     fontStyle: 'italic',
// // //     marginTop: 4,
// // //   },
// // //   pricingSection: {
// // //     marginBottom: 15,
// // //   },
// // //   pricingTitle: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 10,
// // //   },
// // //   priceContainer: {
// // //     backgroundColor: '#f8f9fa',
// // //     padding: 15,
// // //     borderRadius: 10,
// // //     borderWidth: 1,
// // //     borderColor: '#e9ecef',
// // //   },
// // //   priceRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     marginBottom: 8,
// // //   },
// // //   priceLabelContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   priceLabel: { 
// // //     fontSize: 16, 
// // //     color: '#666',
// // //     fontWeight: '500',
// // //     marginLeft: 6,
// // //   },
// // //   priceValue: { 
// // //     fontSize: 16, 
// // //     fontWeight: 'bold', 
// // //     color: '#2c5530' 
// // //   },
// // //   perNightText: {
// // //     fontSize: 12,
// // //     color: '#888',
// // //     textAlign: 'right',
// // //     marginTop: 4,
// // //     fontStyle: 'italic',
// // //   },
// // //   roomCount: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginTop: 10,
// // //     paddingTop: 10,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#eee',
// // //   },
// // //   roomCountText: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginLeft: 6,
// // //   },
// // //   selectedCountText: {
// // //     fontSize: 14,
// // //     color: '#b48a64',
// // //     fontWeight: 'bold',
// // //     marginLeft: 10,
// // //   },
// // //   roomsSection: { 
// // //     margin: 15,
// // //     marginTop: 0,
// // //   },
// // //   sectionTitle: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 15,
// // //   },
// // //   roomItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#fff',
// // //     padding: 15,
// // //     borderRadius: 10,
// // //     marginBottom: 10,
// // //     shadowColor: '#000',
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3,
// // //     elevation: 2,
// // //   },
// // //   roomItemSelected: {
// // //     borderColor: '#b48a64',
// // //     borderWidth: 2,
// // //     backgroundColor: '#fffaf5',
// // //   },
// // //   roomInfo: { flex: 1 },
// // //   roomNumber: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   roomDescription: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginVertical: 5,
// // //     lineHeight: 18,
// // //   },
// // //   statusContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginTop: 5,
// // //   },
// // //   statusIndicator: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     marginRight: 5,
// // //   },
// // //   active: { backgroundColor: '#4CAF50' },
// // //   inactive: { backgroundColor: '#f44336' },
// // //   statusText: {
// // //     fontSize: 12,
// // //     color: '#666',
// // //   },
// // //   loadingContainer: {
// // //     alignItems: 'center',
// // //     padding: 40,
// // //   },
// // //   loadingText: {
// // //     marginTop: 10,
// // //     color: '#666',
// // //   },
// // //   noRoomsContainer: {
// // //     alignItems: 'center',
// // //     padding: 40,
// // //     backgroundColor: '#fff',
// // //     borderRadius: 15,
// // //     marginTop: 10,
// // //   },
// // //   noRoomsText: {
// // //     fontSize: 18,
// // //     color: '#666',
// // //     marginTop: 10,
// // //     fontWeight: 'bold',
// // //   },
// // //   retryButton: {
// // //     backgroundColor: '#b48a64',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 10,
// // //     borderRadius: 8,
// // //     marginTop: 15,
// // //   },
// // //   retryText: {
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //   },
// // //   footer: {
// // //     position: 'absolute',
// // //     bottom: 0,
// // //     left: 0,
// // //     right: 0,
// // //     backgroundColor: '#fff',
// // //     padding: 20,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#eee',
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: -2 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3,
// // //     elevation: 5,
// // //   },
// // //   adminActions: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //   },
// // //   actionButton: {
// // //     padding: 16,
// // //     borderRadius: 10,
// // //     alignItems: 'center',
// // //     flex: 1,
// // //   },
// // //   bookButton: {
// // //     backgroundColor: '#a0855c',
// // //   },
// // //   reserveButton: {
// // //     backgroundColor: '#b48a64',
// // //   },
// // //   buttonDisabled: {
// // //     backgroundColor: '#ccc',
// // //   },
// // //   actionButtonText: {
// // //     color: '#fff',
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //   },
// // //   modalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     padding: 20,
// // //   },
// // //   modalContainer: {
// // //     width: '100%',
// // //     maxWidth: 400,
// // //     backgroundColor: '#fff',
// // //     borderRadius: 15,
// // //     maxHeight: '80%',
// // //   },
// // //   modalHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     padding: 20,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#eee',
// // //   },
// // //   modalTitle: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   modalContent: {
// // //     padding: 20,
// // //   },
// // //   modalFooter: {
// // //     flexDirection: 'row',
// // //     padding: 20,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#eee',
// // //     gap: 10,
// // //   },
// // //   formGroup: {
// // //     marginBottom: 16,
// // //   },
// // //   label: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 6,
// // //   },
// // //   input: {
// // //     backgroundColor: '#f8f9fa',
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     padding: 12,
// // //     fontSize: 16,
// // //     color: '#333',
// // //   },
// // //   textArea: {
// // //     backgroundColor: '#f8f9fa',
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     padding: 12,
// // //     fontSize: 16,
// // //     color: '#333',
// // //     minHeight: 80,
// // //     textAlignVertical: 'top',
// // //   },
// // //   dateInput: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#f8f9fa',
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     padding: 12,
// // //   },
// // //   dateText: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //     marginLeft: 8,
// // //   },
// // //   row: {
// // //     flexDirection: 'row',
// // //     gap: 10,
// // //   },
// // //   halfInput: {
// // //     flex: 1,
// // //   },
// // //   priceSummary: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     backgroundColor: '#f8f9fa',
// // //     padding: 15,
// // //     borderRadius: 8,
// // //     marginTop: 10,
// // //   },
// // //   priceLabel: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //   },
// // //   priceValue: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#2e7d32',
// // //   },
// // //   cancelButton: {
// // //     flex: 1,
// // //     padding: 12,
// // //     borderRadius: 8,
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     alignItems: 'center',
// // //   },
// // //   cancelButtonText: {
// // //     color: '#666',
// // //     fontWeight: '600',
// // //   },
// // //   confirmButton: {
// // //     flex: 2,
// // //     padding: 12,
// // //     borderRadius: 8,
// // //     backgroundColor: '#b48a64',
// // //     alignItems: 'center',
// // //   },
// // //   confirmButtonText: {
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //     fontSize: 16,
// // //   },
// // //   reservationInfo: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginBottom: 15,
// // //     lineHeight: 20,
// // //   },
// // //   roomsList: {
// // //     backgroundColor: '#f8f9fa',
// // //     padding: 15,
// // //     borderRadius: 8,
// // //     marginBottom: 15,
// // //   },
// // //   roomItemText: {
// // //     fontSize: 14,
// // //     color: '#333',
// // //     marginBottom: 5,
// // //   },
// // //   accessDeniedContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     padding: 30,
// // //     backgroundColor: '#f9f3eb',
// // //   },
// // //   accessDeniedTitle: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     color: '#d32f2f',
// // //     marginTop: 15,
// // //     marginBottom: 10,
// // //     textAlign: 'center',
// // //   },
// // //   accessDeniedText: {
// // //     fontSize: 16,
// // //     color: '#666',
// // //     textAlign: 'center',
// // //     lineHeight: 22,
// // //     marginBottom: 25,
// // //   },
// // //   backButton: {
// // //     backgroundColor: '#b48a64',
// // //     paddingHorizontal: 25,
// // //     paddingVertical: 12,
// // //     borderRadius: 8,
// // //   },
// // //   backButtonText: {
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //     fontSize: 16,
// // //   },
// // // });

// // // screens/details.js
// // // import React, { useState, useEffect } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   ScrollView,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   FlatList,
// // //   Alert,
// // //   StatusBar,
// // //   Image,
// // //   Dimensions,
// // //   Modal,
// // //   TextInput,
// // //   RefreshControl
// // // } from 'react-native';
// // // import Icon from 'react-native-vector-icons/MaterialIcons';
// // // import DateTimePicker from '@react-native-community/datetimepicker';
// // // import { roomService } from '../../services/roomService';
// // // import { bookingService } from '../../services/bookingService';
// // // import { useAuth } from '../auth/contexts/AuthContext';

// // // const { width: screenWidth } = Dimensions.get('window');

// // // export default function details({ navigation, route }) {
// // //   const { user, isAuthenticated } = useAuth();

// // //   // Enhanced debugging - log everything
// // //   console.log('🚀 RoomDetails - User object:', JSON.stringify(user, null, 2));
// // //   console.log('🚀 RoomDetails - isAuthenticated:', isAuthenticated);

// // //   // Direct extraction with multiple fallbacks
// // //   const userRole = user?.role;
// // //   const userName = user?.name;

// // //   // Try every possible field name for membership number and admin ID
// // //   const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
// // //   const adminId = user?.adminId || user?.adminID || user?.admin_id || user?.id;

// // //   console.log('🔍 Extracted values:', {
// // //     userRole,
// // //     userName,
// // //     membershipNo,
// // //     adminId,
// // //     allUserKeys: user ? Object.keys(user) : 'No user'
// // //   });

// // //   const [rooms, setRooms] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedRoom, setSelectedRoom] = useState(null);
// // //   const [selectedRooms, setSelectedRooms] = useState([]);
// // //   const [roomType, setRoomType] = useState(route.params?.roomType);
// // //   const [imageIndex, setImageIndex] = useState(0);
// // //   const [loadingRooms, setLoadingRooms] = useState(false);
// // //   const [showBookingModal, setShowBookingModal] = useState(false);
// // //   const [showReservationModal, setShowReservationModal] = useState(false);
// // //   const [refreshing, setRefreshing] = useState(false);

// // //   useEffect(() => {
// // //     console.log('🎯 useEffect triggered - Auth status:', isAuthenticated);

// // //     if (!isAuthenticated || !user) {
// // //       Alert.alert(
// // //         'Authentication Required',
// // //         'Please login to access room details.',
// // //         [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
// // //       );
// // //       return;
// // //     }

// // //     fetchRooms();
// // //   }, [isAuthenticated, user]);

// // //   const isAdminUser = () => {
// // //     const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
// // //     console.log('👮 isAdminUser check:', { userRole, isAdmin });
// // //     return isAdmin;
// // //   };

// // //   const isMemberUser = () => {
// // //     const isMember = userRole === 'MEMBER';
// // //     console.log('👤 isMemberUser check:', { userRole, isMember });
// // //     return isMember;
// // //   };

// // //   const fetchRooms = async () => {
// // //   try {
// // //     setLoadingRooms(true);
// // //     console.log('🔄 Fetching rooms for roomType:', roomType.id);
// // //     console.log('👤 Current user role:', userRole);

// // //     // Pass user role to roomService
// // //     const roomData = await roomService.getAvailableRooms(roomType.id, userRole);

// // //     console.log("✅ Fetched available rooms:", roomData);
// // //     setRooms(roomData);
// // //   } catch (error) {
// // //     console.error('❌ Error fetching rooms:', error);

// // //     // Enhanced error handling
// // //     if (error.response?.status === 403) {
// // //       Alert.alert(
// // //         'Access Denied', 
// // //         'You do not have permission to view available rooms. Please contact administrator.'
// // //       );
// // //     } else if (error.response?.status === 401) {
// // //       Alert.alert(
// // //         'Authentication Error',
// // //         'Please login again to continue.'
// // //       );
// // //       navigation.navigate('LoginScr');
// // //     } else {
// // //       Alert.alert('Error', 'Failed to load available rooms. Please try again.');
// // //     }
// // //   } finally {
// // //     setLoadingRooms(false);
// // //     setLoading(false);
// // //     setRefreshing(false);
// // //   }
// // // };

// // //   const handleRoomSelect = (room) => {
// // //     console.log('🛏️ Room selected:', room.roomNumber);
// // //     if (isAdminUser()) {
// // //       if (selectedRooms.find(r => r.id === room.id)) {
// // //         setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
// // //       } else {
// // //         setSelectedRooms([...selectedRooms, room]);
// // //       }
// // //     } else {
// // //       setSelectedRoom(room);
// // //     }
// // //   };

// // //   const handleBookNow = () => {
// // //     console.log('📖 Book Now clicked');
// // //     if (!selectedRoom) {
// // //       Alert.alert('Please Select', 'Please select a room to continue');
// // //       return;
// // //     }
// // //     setShowBookingModal(true);
// // //   };

// // //   const handleReserveRooms = () => {
// // //     console.log('🔒 Reserve Rooms clicked');
// // //     if (selectedRooms.length === 0) {
// // //       Alert.alert('Please Select', 'Please select at least one room to reserve');
// // //       return;
// // //     }
// // //     setShowReservationModal(true);
// // //   };

// // //   const handleConfirmBooking = async (bookingData) => {
// // //   try {
// // //     console.log('🎫 Starting booking process...');

// // //     // Check if we have ANY identifier that could work as membership number
// // //     const possibleMembershipNo = membershipNo || user?.id;

// // //     if (!possibleMembershipNo) {
// // //       Alert.alert(
// // //         'Membership Number Required', 
// // //         `We couldn't find your membership number.`,
// // //         [{ text: 'OK' }]
// // //       );
// // //       return;
// // //     }

// // //     if (!selectedRoom) {
// // //       Alert.alert('Error', 'Please select a room to book');
// // //       return;
// // //     }

// // //     console.log('✅ Using membership number:', possibleMembershipNo);

// // //     // CORRECTED PAYLOAD STRUCTURE - matches backend expectation
// // //     // const payload = {
// // //     //   consumerInfo: {
// // //     //     membership_no: possibleMembershipNo,
// // //     //   },
// // //     //   bookingData: {
// // //     //     roomTypeId: roomType.id,
// // //     //     checkIn: bookingData.checkIn,
// // //     //     checkOut: bookingData.checkOut,
// // //     //     numberOfRooms: 1,
// // //     //     numberOfAdults: bookingData.numberOfAdults || 1,
// // //     //     numberOfChildren: bookingData.numberOfChildren || 0,
// // //     //     pricingType: 'MEMBER',
// // //     //     specialRequest: bookingData.specialRequest || '',
// // //     //     totalPrice: bookingData.totalPrice,
// // //     //     selectedRoomIds: [selectedRoom.id],
// // //     //     // Remove payment fields from here - backend handles them
// // //     //   }
// // //     // };
// // //     const payload = {
// // //       from: bookingData.checkIn,
// // //       to: bookingData.checkOut,
// // //       numberOfRooms: 1,
// // //       numberOfAdults: bookingData.numberOfAdults || 1,
// // //       numberOfChildren: bookingData.numberOfChildren || 0,
// // //       pricingType: 'MEMBER',
// // //       specialRequest: bookingData.specialRequest || '',
// // //     }

// // //     console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));
// // //     console.log(selectedRoom)
// // //     const result = await bookingService.memberBookingRoom(selectedRoom?.roomTypeId, payload);
// // //     console.log('✅ Booking response received:', result);
// // //     // Extract booking ID from response
// // //     let bookingId;
// // //     let numericBookingId = null;

// // //     if (result.bookings && Array.isArray(result.bookings) && result.bookings.length > 0) {
// // //       bookingId = result.bookings[0].id;
// // //       numericBookingId = result.bookings[0].id;
// // //     } else if (result.id) {
// // //       bookingId = result.id;
// // //       numericBookingId = result.id;
// // //     } else if (result.bookingId) {
// // //       bookingId = result.bookingId;
// // //       numericBookingId = result.bookingId;
// // //     } else {
// // //       bookingId = payload.bookingData.selectedRoomIds?.[0] || `temp-${Date.now()}`;
// // //     }

// // //     console.log('✅ Booking successful! Response:', result);

// // //     // Navigate to voucher screen
// // //     navigation.navigate('voucher', {
// // //       bookingId: bookingId,
// // //       numericBookingId: numericBookingId,
// // //       bookingData: {
// // //         ...bookingData,
// // //         totalPrice: bookingData.totalPrice,
// // //         numberOfAdults: bookingData.numberOfAdults || 1,
// // //         numberOfChildren: bookingData.numberOfChildren || 0,
// // //         checkIn: bookingData.checkIn,
// // //         checkOut: bookingData.checkOut,
// // //         specialRequest: bookingData.specialRequest || ''
// // //       },
// // //       roomType: roomType,
// // //       selectedRoom: selectedRoom,
// // //       bookingResponse: result
// // //     });

// // //   } catch (error) {
// // //     console.error('💥 Booking error in component:', error);

// // //     let errorMessage = error.message || 'Failed to book room. Please try again.';

// // //     if (error.message?.includes('Network Error')) {
// // //       errorMessage = 'Network error. Please check your internet connection and try again.';
// // //     } else if (error.message?.includes('timeout')) {
// // //       errorMessage = 'Request timeout. Please try again.';
// // //     } else if (error.response?.status === 409) {
// // //       errorMessage = 'Room not available for selected dates. Please choose different dates.';
// // //     } else if (error.response?.status === 400) {
// // //       errorMessage = 'Invalid booking data. Please check your information and try again.';
// // //     } else if (error.response?.status === 500) {
// // //       errorMessage = 'Server error. Please try again later.';
// // //     }

// // //     Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
// // //   }
// // // };


// // //   // Enhanced reservation function
// // //   const handleConfirmReservation = async (reservationData) => {
// // //     try {
// // //       console.log('🔐 Starting reservation process...');
// // //       console.log('   - User role:', userRole);

// // //       const roomIds = selectedRooms.map(room => room.id);

// // //       // The backend gets adminId from JWT token, so don't send it in payload
// // //       const payload = {
// // //         roomIds: roomIds,
// // //         reserve: true,
// // //         reserveFrom: reservationData.reserveFrom,
// // //         reserveTo: reservationData.reserveTo,
// // //         // Remove adminId from payload - backend gets it from JWT token
// // //       };

// // //       console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
// // //       console.log('👤 Admin ID will come from JWT token');

// // //       await roomService.reserveRooms(payload);

// // //       Alert.alert(
// // //         'Reservation Successful!',
// // //         `${selectedRooms.length} room(s) have been reserved successfully.`,
// // //         [{ 
// // //           text: 'OK', 
// // //           onPress: () => {
// // //             setShowReservationModal(false);
// // //             setSelectedRooms([]);
// // //             fetchRooms();
// // //           }
// // //         }]
// // //       );
// // //     } catch (error) {
// // //       console.error('💥 Reservation error:', error);
// // //       Alert.alert(
// // //         'Reservation Failed', 
// // //         error.message || 'Failed to reserve rooms. Please try again.'
// // //       );
// // //     }
// // //   };

// // //   const onRefresh = () => {
// // //     setRefreshing(true);
// // //     fetchRooms();
// // //   };

// // //   const formatPrice = (price) => {
// // //     if (!price && price !== 0) return 'N/A';
// // //     return `$${parseFloat(price).toFixed(2)}`;
// // //   };

// // //   const renderImages = () => {
// // //     const images = roomType.images || [];

// // //     if (images.length === 0) {
// // //       return (
// // //         <View style={styles.noImageContainer}>
// // //           <Icon name="image" size={60} color="#ccc" />
// // //           <Text style={styles.noImageText}>No images available</Text>
// // //         </View>
// // //       );
// // //     }

// // //     return (
// // //       <View style={styles.imageSection}>
// // //         <Image 
// // //           source={{ uri: images[imageIndex]?.url }} 
// // //           style={styles.mainImage}
// // //           resizeMode="cover"
// // //         />

// // //         {images.length > 1 && (
// // //           <View style={styles.imageIndicators}>
// // //             {images.map((_, index) => (
// // //               <TouchableOpacity
// // //                 key={index}
// // //                 style={[
// // //                   styles.imageIndicator,
// // //                   index === imageIndex && styles.imageIndicatorActive
// // //                 ]}
// // //                 onPress={() => setImageIndex(index)}
// // //               />
// // //             ))}
// // //           </View>
// // //         )}
// // //       </View>
// // //     );
// // //   };

// // //   const renderRoomItem = ({ item }) => {
// // //     const isSelected = isAdminUser() 
// // //       ? selectedRooms.find(r => r.id === item.id)
// // //       : selectedRoom?.id === item.id;

// // //     return (
// // //       <TouchableOpacity
// // //         style={[
// // //           styles.roomItem,
// // //           isSelected && styles.roomItemSelected,
// // //         ]}
// // //         onPress={() => handleRoomSelect(item)}
// // //       >
// // //         <View style={styles.roomInfo}>
// // //           <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
// // //           <Text style={styles.roomDescription}>
// // //             {item.description || 'Comfortable and well-equipped room'}
// // //           </Text>
// // //           <View style={styles.statusContainer}>
// // //             <View
// // //               style={[
// // //                 styles.statusIndicator,
// // //                 item.isActive ? styles.active : styles.inactive,
// // //               ]}
// // //             />
// // //             <Text style={styles.statusText}>
// // //               {item.isActive ? 'Available' : 'Unavailable'}
// // //             </Text>
// // //           </View>
// // //         </View>
// // //         <Icon
// // //           name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
// // //           size={24}
// // //           color="#b48a64"
// // //         />
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   if (!isAuthenticated || !user) {
// // //     return (
// // //       <View style={styles.container}>
// // //         <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />
// // //         <View style={styles.header}>
// // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // //             <Icon name="arrow-back" size={24} color="#000" />
// // //           </TouchableOpacity>
// // //           <Text style={styles.headerTitle}>Authentication Required</Text>
// // //           <View style={{ width: 24 }} />
// // //         </View>
// // //         <View style={styles.accessDeniedContainer}>
// // //           <Icon name="block" size={60} color="#ff6b6b" />
// // //           <Text style={styles.accessDeniedTitle}>Please Login</Text>
// // //           <Text style={styles.accessDeniedText}>
// // //             You need to be logged in to view room details.
// // //           </Text>
// // //           <TouchableOpacity 
// // //             style={styles.backButton} 
// // //             onPress={() => navigation.navigate('LoginScr')}
// // //           >
// // //             <Text style={styles.backButtonText}>Go to Login</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />

// // //       <View style={styles.header}>
// // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // //           <Icon name="arrow-back" size={24} color="#000" />
// // //         </TouchableOpacity>
// // //         <Text style={styles.headerTitle}>{roomType.name}</Text>
// // //         <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
// // //           <Icon name="refresh" size={24} color={refreshing ? '#ccc' : '#000'} />
// // //         </TouchableOpacity>
// // //       </View>

// // //       <ScrollView 
// // //         style={styles.content} 
// // //         showsVerticalScrollIndicator={false}
// // //         refreshControl={
// // //           <RefreshControl
// // //             refreshing={refreshing}
// // //             onRefresh={onRefresh}
// // //             colors={['#b48a64']}
// // //           />
// // //         }
// // //       >
// // //         {renderImages()}

// // //         <View style={styles.roomTypeInfo}>
// // //           <Text style={styles.roomTypeName}>{roomType.name}</Text>

// // //           {/* Enhanced Debug Info - Only show in development */}
// // //           {__DEV__ && (
// // //             <View style={styles.debugSection}>
// // //               <Text style={styles.debugTitle}>Debug Information:</Text>
// // //               <Text style={styles.debugText}>Role: {userRole}</Text>
// // //               <Text style={styles.debugText}>Name: {userName}</Text>
// // //               <Text style={styles.debugText}>Membership No: {membershipNo || 'NOT FOUND'}</Text>
// // //               <Text style={styles.debugText}>Admin ID: {adminId || 'NOT FOUND'}</Text>
// // //               <Text style={styles.debugText}>User ID: {user?.id}</Text>
// // //               <Text style={styles.smallDebugText}>
// // //                 All keys: {user ? Object.keys(user).join(', ') : 'No user'}
// // //               </Text>
// // //             </View>
// // //           )}

// // //           <View style={styles.pricingSection}>
// // //             <Text style={styles.pricingTitle}>Pricing Information</Text>

// // //             <View style={styles.priceContainer}>
// // //               <View style={styles.priceRow}>
// // //                 <View style={styles.priceLabelContainer}>
// // //                   <Icon name="person" size={16} color="#666" />
// // //                   <Text style={styles.priceLabel}>Member Price:</Text>
// // //                 </View>
// // //                 <Text style={styles.priceValue}>
// // //                   {formatPrice(roomType.priceMember)}
// // //                 </Text>
// // //               </View>

// // //               <View style={styles.priceRow}>
// // //                 <View style={styles.priceLabelContainer}>
// // //                   <Icon name="person-outline" size={16} color="#666" />
// // //                   <Text style={styles.priceLabel}>Guest Price:</Text>
// // //                 </View>
// // //                 <Text style={styles.priceValue}>
// // //                   {formatPrice(roomType.priceGuest)}
// // //                 </Text>
// // //               </View>

// // //               <Text style={styles.perNightText}>per night</Text>
// // //             </View>
// // //           </View>

// // //           <View style={styles.roomCount}>
// // //             <Icon name="meeting-room" size={16} color="#666" />
// // //             <Text style={styles.roomCountText}>
// // //               {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
// // //             </Text>
// // //             {isAdminUser() && selectedRooms.length > 0 && (
// // //               <Text style={styles.selectedCountText}>
// // //                 • {selectedRooms.length} selected
// // //               </Text>
// // //             )}
// // //           </View>
// // //         </View>

// // //         <View style={styles.roomsSection}>
// // //           <Text style={styles.sectionTitle}>
// // //             {isAdminUser() ? 'Select Rooms to Reserve' : 'Available Rooms'}
// // //           </Text>

// // //           {loadingRooms ? (
// // //             <View style={styles.loadingContainer}>
// // //               <ActivityIndicator size="large" color="#b48a64" />
// // //               <Text style={styles.loadingText}>Loading available rooms...</Text>
// // //             </View>
// // //           ) : rooms.length > 0 ? (
// // //             <FlatList
// // //               data={rooms}
// // //               renderItem={renderRoomItem}
// // //               keyExtractor={(item) => item.id.toString()}
// // //               scrollEnabled={false}
// // //               showsVerticalScrollIndicator={false}
// // //             />
// // //           ) : (
// // //             <View style={styles.noRoomsContainer}>
// // //               <Icon name="meeting-room" size={50} color="#ccc" />
// // //               <Text style={styles.noRoomsText}>No rooms available</Text>
// // //               <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
// // //                 <Text style={styles.retryText}>Refresh</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           )}
// // //         </View>

// // //         <View style={{ height: 100 }} />
// // //       </ScrollView>

// // //       {rooms.length > 0 && !loadingRooms && (
// // //         <View style={styles.footer}>
// // //           {isAdminUser() ? (
// // //             <View style={styles.adminActions}>
// // //               <TouchableOpacity
// // //                 style={[
// // //                   styles.actionButton,
// // //                   styles.reserveButton,
// // //                   selectedRooms.length === 0 && styles.buttonDisabled,
// // //                 ]}
// // //                 onPress={handleReserveRooms}
// // //                 disabled={selectedRooms.length === 0}
// // //               >
// // //                 <Text style={styles.actionButtonText}>
// // //                   Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           ) : (
// // //             <TouchableOpacity
// // //               style={[
// // //                 styles.actionButton,
// // //                 styles.bookButton,
// // //                 !selectedRoom && styles.buttonDisabled,
// // //               ]}
// // //               onPress={handleBookNow}
// // //               disabled={!selectedRoom}
// // //             >
// // //               <Text style={styles.actionButtonText}>
// // //                 {selectedRoom 
// // //                   ? `Book Room ${selectedRoom.roomNumber}` 
// // //                   : 'Select a Room'
// // //                 }
// // //               </Text>
// // //             </TouchableOpacity>
// // //           )}
// // //         </View>
// // //       )}

// // //       <BookingModal
// // //         visible={showBookingModal}
// // //         onClose={() => setShowBookingModal(false)}
// // //         onConfirm={handleConfirmBooking}
// // //         room={selectedRoom}
// // //         roomType={roomType}
// // //         navigation={navigation}
// // //       />

// // //       <ReservationModal
// // //         visible={showReservationModal}
// // //         onClose={() => setShowReservationModal(false)}
// // //         onConfirm={handleConfirmReservation}
// // //         selectedRooms={selectedRooms}
// // //       />
// // //     </View>
// // //   );
// // // }

// // // // Booking Modal Component with Voucher Navigation
// // // const BookingModal = ({ visible, onClose, onConfirm, room, roomType, navigation }) => {
// // //   const [checkIn, setCheckIn] = useState(new Date());
// // //   const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
// // //   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
// // //   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
// // //   const [numberOfAdults, setNumberOfAdults] = useState('1');
// // //   const [numberOfChildren, setNumberOfChildren] = useState('0');
// // //   const [specialRequest, setSpecialRequest] = useState('');
// // //   const [loading, setLoading] = useState(false);

// // //   const calculateTotalPrice = () => {
// // //     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
// // //     const price = roomType.priceMember || roomType.priceGuest || 0;
// // //     return nights * price;
// // //   };

// // //   const handleConfirm = async () => {
// // //     if (!checkIn || !checkOut) {
// // //       Alert.alert('Error', 'Please select check-in and check-out dates');
// // //       return;
// // //     }

// // //     if (checkIn >= checkOut) {
// // //       Alert.alert('Error', 'Check-out date must be after check-in date');
// // //       return;
// // //     }

// // //     const adults = parseInt(numberOfAdults) || 1;
// // //     const children = parseInt(numberOfChildren) || 0;

// // //     if (adults < 1) {
// // //       Alert.alert('Error', 'At least one adult is required');
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const bookingData = {
// // //         checkIn: checkIn.toISOString().split('T')[0],
// // //         checkOut: checkOut.toISOString().split('T')[0],
// // //         numberOfAdults: adults,
// // //         numberOfChildren: children,
// // //         specialRequest: specialRequest,
// // //         totalPrice: calculateTotalPrice(),
// // //       };

// // //       await onConfirm(bookingData);
// // //     } catch (error) {
// // //       // Error handled in parent
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <Modal visible={visible} animationType="slide" transparent>
// // //       <View style={styles.modalOverlay}>
// // //         <View style={styles.modalContainer}>
// // //           <View style={styles.modalHeader}>
// // //             <Text style={styles.modalTitle}>Book Room {room?.roomNumber}</Text>
// // //             <TouchableOpacity onPress={onClose}>
// // //               <Icon name="close" size={24} color="#666" />
// // //             </TouchableOpacity>
// // //           </View>

// // //           <ScrollView style={styles.modalContent}>
// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Check-in Date</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowCheckInPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {checkIn.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showCheckInPicker && (
// // //                 <DateTimePicker
// // //                   value={checkIn}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowCheckInPicker(false);
// // //                     if (date) setCheckIn(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Check-out Date</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowCheckOutPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {checkOut.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showCheckOutPicker && (
// // //                 <DateTimePicker
// // //                   value={checkOut}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowCheckOutPicker(false);
// // //                     if (date) setCheckOut(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>

// // //             <View style={styles.row}>
// // //               <View style={styles.halfInput}>
// // //                 <Text style={styles.label}>Adults</Text>
// // //                 <TextInput
// // //                   style={styles.input}
// // //                   value={numberOfAdults}
// // //                   onChangeText={setNumberOfAdults}
// // //                   keyboardType="numeric"
// // //                 />
// // //               </View>
// // //               <View style={styles.halfInput}>
// // //                 <Text style={styles.label}>Children</Text>
// // //                 <TextInput
// // //                   style={styles.input}
// // //                   value={numberOfChildren}
// // //                   onChangeText={setNumberOfChildren}
// // //                   keyboardType="numeric"
// // //                 />
// // //               </View>
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Special Request (Optional)</Text>
// // //               <TextInput
// // //                 style={styles.textArea}
// // //                 value={specialRequest}
// // //                 onChangeText={setSpecialRequest}
// // //                 placeholder="Any special requirements..."
// // //                 multiline
// // //                 numberOfLines={3}
// // //               />
// // //             </View>

// // //             <View style={styles.priceSummary}>
// // //               <Text style={styles.priceLabel}>Total Amount:</Text>
// // //               <Text style={styles.priceValue}>
// // //                 ${calculateTotalPrice().toFixed(2)}
// // //               </Text>
// // //             </View>

// // //             {/* Booking Information */}
// // //             <View style={styles.infoBox}>
// // //               <Icon name="info" size={16} color="#b48a64" />
// // //               <Text style={styles.infoText}>
// // //                 After successful booking, you'll be redirected to your voucher where you can view and share your booking details.
// // //               </Text>
// // //             </View>
// // //           </ScrollView>

// // //           <View style={styles.modalFooter}>
// // //             <TouchableOpacity 
// // //               style={styles.cancelButton}
// // //               onPress={onClose}
// // //             >
// // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // //             </TouchableOpacity>
// // //             <TouchableOpacity 
// // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // //               onPress={handleConfirm}
// // //               disabled={loading}
// // //             >
// // //               {loading ? (
// // //                 <ActivityIndicator size="small" color="#fff" />
// // //               ) : (
// // //                 <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };

// // // // Reservation Modal Component
// // // const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms }) => {
// // //   const [reserveFrom, setReserveFrom] = useState(new Date());
// // //   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
// // //   const [showFromPicker, setShowFromPicker] = useState(false);
// // //   const [showToPicker, setShowToPicker] = useState(false);
// // //   const [loading, setLoading] = useState(false);

// // //   const handleConfirm = async () => {
// // //     if (!reserveFrom || !reserveTo) {
// // //       Alert.alert('Error', 'Please select reservation dates');
// // //       return;
// // //     }

// // //     if (reserveFrom >= reserveTo) {
// // //       Alert.alert('Error', 'Reservation end date must be after start date');
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const reservationData = {
// // //         reserveFrom: reserveFrom.toISOString().split('T')[0],
// // //         reserveTo: reserveTo.toISOString().split('T')[0],
// // //       };

// // //       await onConfirm(reservationData);
// // //     } catch (error) {
// // //       console.error('Reservation error:', error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <Modal visible={visible} animationType="slide" transparent>
// // //       <View style={styles.modalOverlay}>
// // //         <View style={styles.modalContainer}>
// // //           <View style={styles.modalHeader}>
// // //             <Text style={styles.modalTitle}>
// // //               Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// // //             </Text>
// // //             <TouchableOpacity onPress={onClose}>
// // //               <Icon name="close" size={24} color="#666" />
// // //             </TouchableOpacity>
// // //           </View>

// // //           <ScrollView style={styles.modalContent}>
// // //             <Text style={styles.reservationInfo}>
// // //               You are about to reserve the following rooms:
// // //             </Text>

// // //             <View style={styles.roomsList}>
// // //               {selectedRooms.map(room => (
// // //                 <Text key={room.id} style={styles.roomItemText}>
// // //                   • Room {room.roomNumber}
// // //                 </Text>
// // //               ))}
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Reserve From</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowFromPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {reserveFrom.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showFromPicker && (
// // //                 <DateTimePicker
// // //                   value={reserveFrom}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowFromPicker(false);
// // //                     if (date) setReserveFrom(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>

// // //             <View style={styles.formGroup}>
// // //               <Text style={styles.label}>Reserve To</Text>
// // //               <TouchableOpacity 
// // //                 style={styles.dateInput}
// // //                 onPress={() => setShowToPicker(true)}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color="#666" />
// // //                 <Text style={styles.dateText}>
// // //                   {reserveTo.toLocaleDateString()}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //               {showToPicker && (
// // //                 <DateTimePicker
// // //                   value={reserveTo}
// // //                   mode="date"
// // //                   display="default"
// // //                   onChange={(event, date) => {
// // //                     setShowToPicker(false);
// // //                     if (date) setReserveTo(date);
// // //                   }}
// // //                 />
// // //               )}
// // //             </View>
// // //           </ScrollView>

// // //           <View style={styles.modalFooter}>
// // //             <TouchableOpacity 
// // //               style={styles.cancelButton}
// // //               onPress={onClose}
// // //             >
// // //               <Text style={styles.cancelButtonText}>Cancel</Text>
// // //             </TouchableOpacity>
// // //             <TouchableOpacity 
// // //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// // //               onPress={handleConfirm}
// // //               disabled={loading}
// // //             >
// // //               {loading ? (
// // //                 <ActivityIndicator size="small" color="#fff" />
// // //               ) : (
// // //                 <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: '#f9f3eb' },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 15,
// // //     backgroundColor: '#dbc9a5',
// // //     borderBottomLeftRadius: 20,
// // //     borderBottomRightRadius: 20,
// // //     paddingTop: 40,
// // //   },
// // //   headerTitle: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#000',
// // //   },
// // //   content: { flex: 1 },
// // //   imageSection: {
// // //     position: 'relative',
// // //   },
// // //   mainImage: {
// // //     width: '100%',
// // //     height: 250,
// // //   },
// // //   imageIndicators: {
// // //     position: 'absolute',
// // //     bottom: 10,
// // //     left: 0,
// // //     right: 0,
// // //     flexDirection: 'row',
// // //     justifyContent: 'center',
// // //   },
// // //   imageIndicator: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     backgroundColor: 'rgba(255,255,255,0.5)',
// // //     marginHorizontal: 4,
// // //   },
// // //   imageIndicatorActive: {
// // //     backgroundColor: '#fff',
// // //     width: 20,
// // //   },
// // //   noImageContainer: {
// // //     height: 200,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#f0f0f0',
// // //   },
// // //   noImageText: {
// // //     marginTop: 10,
// // //     color: '#666',
// // //     fontSize: 16,
// // //   },
// // //   roomTypeInfo: {
// // //     padding: 20,
// // //   },
// // //   roomTypeName: {
// // //     fontSize: 24,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 10,
// // //   },
// // //   debugSection: {
// // //     backgroundColor: '#f8f9fa',
// // //     padding: 12,
// // //     borderRadius: 8,
// // //     marginBottom: 15,
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#6c757d',
// // //   },
// // //   debugTitle: {
// // //     fontSize: 12,
// // //     fontWeight: 'bold',
// // //     color: '#6c757d',
// // //     marginBottom: 5,
// // //   },
// // //   debugText: {
// // //     fontSize: 10,
// // //     color: '#6c757d',
// // //     marginBottom: 2,
// // //   },
// // //   smallDebugText: {
// // //     fontSize: 8,
// // //     color: '#6c757d',
// // //     fontStyle: 'italic',
// // //   },
// // //   pricingSection: {
// // //     marginBottom: 15,
// // //   },
// // //   pricingTitle: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 10,
// // //   },
// // //   priceContainer: {
// // //     backgroundColor: '#fff',
// // //     padding: 15,
// // //     borderRadius: 10,
// // //     borderWidth: 1,
// // //     borderColor: '#e9ecef',
// // //   },
// // //   priceRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     marginBottom: 8,
// // //   },
// // //   priceLabelContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   priceLabel: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginLeft: 8,
// // //   },
// // //   priceValue: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#b48a64',
// // //   },
// // //   perNightText: {
// // //     fontSize: 12,
// // //     color: '#888',
// // //     textAlign: 'right',
// // //     marginTop: 5,
// // //   },
// // //   roomCount: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   roomCountText: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginLeft: 8,
// // //   },
// // //   selectedCountText: {
// // //     fontSize: 14,
// // //     color: '#b48a64',
// // //     fontWeight: 'bold',
// // //     marginLeft: 10,
// // //   },
// // //   roomsSection: {
// // //     padding: 20,
// // //     paddingTop: 0,
// // //   },
// // //   sectionTitle: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 15,
// // //   },
// // //   loadingContainer: {
// // //     padding: 40,
// // //     alignItems: 'center',
// // //   },
// // //   loadingText: {
// // //     marginTop: 10,
// // //     color: '#666',
// // //   },
// // //   roomItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#fff',
// // //     padding: 15,
// // //     borderRadius: 10,
// // //     marginBottom: 10,
// // //     borderWidth: 1,
// // //     borderColor: '#e9ecef',
// // //   },
// // //   roomItemSelected: {
// // //     borderColor: '#b48a64',
// // //     backgroundColor: '#fdf6f0',
// // //   },
// // //   roomInfo: {
// // //     flex: 1,
// // //   },
// // //   roomNumber: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 4,
// // //   },
// // //   roomDescription: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginBottom: 8,
// // //   },
// // //   statusContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   statusIndicator: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     marginRight: 6,
// // //   },
// // //   active: {
// // //     backgroundColor: '#28a745',
// // //   },
// // //   inactive: {
// // //     backgroundColor: '#dc3545',
// // //   },
// // //   statusText: {
// // //     fontSize: 12,
// // //     color: '#666',
// // //   },
// // //   noRoomsContainer: {
// // //     alignItems: 'center',
// // //     padding: 40,
// // //   },
// // //   noRoomsText: {
// // //     fontSize: 16,
// // //     color: '#666',
// // //     marginTop: 10,
// // //     marginBottom: 20,
// // //   },
// // //   retryButton: {
// // //     backgroundColor: '#b48a64',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 10,
// // //     borderRadius: 8,
// // //   },
// // //   retryText: {
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //   },
// // //   footer: {
// // //     position: 'absolute',
// // //     bottom: 0,
// // //     left: 0,
// // //     right: 0,
// // //     backgroundColor: '#fff',
// // //     padding: 20,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#e9ecef',
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: -2 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3,
// // //     elevation: 5,
// // //   },
// // //   adminActions: {
// // //     flexDirection: 'row',
// // //   },
// // //   actionButton: {
// // //     flex: 1,
// // //     padding: 15,
// // //     borderRadius: 10,
// // //     alignItems: 'center',
// // //   },
// // //   bookButton: {
// // //     backgroundColor: '#b48a64',
// // //   },
// // //   reserveButton: {
// // //     backgroundColor: '#28a745',
// // //   },
// // //   buttonDisabled: {
// // //     backgroundColor: '#ccc',
// // //     opacity: 0.6,
// // //   },
// // //   actionButtonText: {
// // //     color: '#fff',
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //   },
// // //   accessDeniedContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     padding: 40,
// // //   },
// // //   accessDeniedTitle: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginTop: 15,
// // //     marginBottom: 10,
// // //   },
// // //   accessDeniedText: {
// // //     fontSize: 16,
// // //     color: '#666',
// // //     textAlign: 'center',
// // //     marginBottom: 20,
// // //     lineHeight: 22,
// // //   },
// // //   backButton: {
// // //     backgroundColor: '#b48a64',
// // //     paddingHorizontal: 25,
// // //     paddingVertical: 12,
// // //     borderRadius: 8,
// // //   },
// // //   backButtonText: {
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //     fontSize: 16,
// // //   },
// // //   // Modal Styles
// // //   modalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // //     justifyContent: 'flex-end',
// // //   },
// // //   modalContainer: {
// // //     backgroundColor: '#fff',
// // //     borderTopLeftRadius: 20,
// // //     borderTopRightRadius: 20,
// // //     maxHeight: '90%',
// // //   },
// // //   modalHeader: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     padding: 20,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#e9ecef',
// // //   },
// // //   modalTitle: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   modalContent: {
// // //     padding: 20,
// // //   },
// // //   formGroup: {
// // //     marginBottom: 20,
// // //   },
// // //   label: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 8,
// // //   },
// // //   dateInput: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     padding: 12,
// // //     backgroundColor: '#f9f9f9',
// // //   },
// // //   dateText: {
// // //     marginLeft: 10,
// // //     fontSize: 14,
// // //     color: '#333',
// // //   },
// // //   row: {
// // //     flexDirection: 'row',
// // //     gap: 10,
// // //   },
// // //   halfInput: {
// // //     flex: 1,
// // //   },
// // //   input: {
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     padding: 12,
// // //     fontSize: 14,
// // //     backgroundColor: '#f9f9f9',
// // //   },
// // //   textArea: {
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 8,
// // //     padding: 12,
// // //     fontSize: 14,
// // //     backgroundColor: '#f9f9f9',
// // //     minHeight: 80,
// // //     textAlignVertical: 'top',
// // //   },
// // //   priceSummary: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     padding: 15,
// // //     backgroundColor: '#f8f9fa',
// // //     borderRadius: 8,
// // //     marginBottom: 20,
// // //   },
// // //   priceLabel: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //   },
// // //   priceValue: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: '#b48a64',
// // //   },
// // //   infoBox: {
// // //     flexDirection: 'row',
// // //     alignItems: 'flex-start',
// // //     backgroundColor: '#f0f7ff',
// // //     padding: 12,
// // //     borderRadius: 8,
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#b48a64',
// // //   },
// // //   infoText: {
// // //     flex: 1,
// // //     fontSize: 12,
// // //     color: '#1565c0',
// // //     marginLeft: 8,
// // //     lineHeight: 16,
// // //   },
// // //   modalFooter: {
// // //     flexDirection: 'row',
// // //     gap: 10,
// // //     padding: 20,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#e9ecef',
// // //   },
// // //   cancelButton: {
// // //     flex: 1,
// // //     padding: 15,
// // //     borderRadius: 8,
// // //     borderWidth: 1,
// // //     borderColor: '#b48a64',
// // //     alignItems: 'center',
// // //     backgroundColor: 'transparent',
// // //   },
// // //   cancelButtonText: {
// // //     color: '#b48a64',
// // //     fontWeight: 'bold',
// // //     fontSize: 16,
// // //   },
// // //   confirmButton: {
// // //     flex: 1,
// // //     padding: 15,
// // //     borderRadius: 8,
// // //     alignItems: 'center',
// // //     backgroundColor: '#b48a64',
// // //   },
// // //   confirmButtonText: {
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //     fontSize: 16,
// // //   },
// // //   reservationInfo: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginBottom: 15,
// // //     lineHeight: 20,
// // //   },
// // //   roomsList: {
// // //     backgroundColor: '#f8f9fa',
// // //     padding: 15,
// // //     borderRadius: 8,
// // //     marginBottom: 20,
// // //   },
// // //   roomItemText: {
// // //     fontSize: 14,
// // //     color: '#333',
// // //     marginBottom: 5,
// // //   },
// // // });


// // // screens/details.js
// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   FlatList,
// //   Alert,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Modal,
// //   TextInput,
// //   RefreshControl
// // } from 'react-native';
// // import Icon from 'react-native-vector-icons/MaterialIcons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { roomService } from '../../services/roomService';
// // import { bookingService } from '../../services/bookingService';
// // import { useAuth } from '../auth/contexts/AuthContext';

// // const { width: screenWidth } = Dimensions.get('window');

// // export default function details({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();

// //   console.log('🚀 RoomDetails - User object:', JSON.stringify(user, null, 2));
// //   console.log('🚀 RoomDetails - isAuthenticated:', isAuthenticated);

// //   const userRole = user?.role;
// //   const userName = user?.name;
// //   const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
// //   const adminId = user?.adminId || user?.adminID || user?.admin_id || user?.id;

// //   console.log('🔍 Extracted values:', {
// //     userRole,
// //     userName,
// //     membershipNo,
// //     adminId,
// //     allUserKeys: user ? Object.keys(user) : 'No user'
// //   });

// //   const [rooms, setRooms] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedRoom, setSelectedRoom] = useState(null);
// //   const [selectedRooms, setSelectedRooms] = useState([]);
// //   const [roomType, setRoomType] = useState(route.params?.roomType);
// //   const [imageIndex, setImageIndex] = useState(0);
// //   const [loadingRooms, setLoadingRooms] = useState(false);
// //   const [showBookingModal, setShowBookingModal] = useState(false);
// //   const [showReservationModal, setShowReservationModal] = useState(false);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [availabilityChecked, setAvailabilityChecked] = useState(false);
// //   const [isAvailable, setIsAvailable] = useState(false);

// //   useEffect(() => {
// //     console.log('🎯 useEffect triggered - Auth status:', isAuthenticated);

// //     if (!isAuthenticated || !user) {
// //       Alert.alert(
// //         'Authentication Required',
// //         'Please login to access room details.',
// //         [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
// //       );
// //       return;
// //     }

// //     // For members, check availability immediately
// //     if (isMemberUser()) {
// //       checkRoomTypeAvailability();
// //     } else {
// //       fetchRooms();
// //     }
// //   }, [isAuthenticated, user]);

// //   const isAdminUser = () => {
// //     const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
// //     console.log('👮 isAdminUser check:', { userRole, isAdmin });
// //     return isAdmin;
// //   };

// //   const isMemberUser = () => {
// //     const isMember = userRole === 'MEMBER';
// //     console.log('👤 isMemberUser check:', { userRole, isMember });
// //     return isMember;
// //   };

// //   // Check room type availability for members
// //   const checkRoomTypeAvailability = async () => {
// //     try {
// //       setLoadingRooms(true);
// //       console.log('🔍 Checking availability for room type:', roomType.id);

// //       // Use today and tomorrow as default dates for availability check
// //       const today = new Date().toISOString().split('T')[0];
// //       const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// //       const availabilityData = await roomService.getMemberRoomsForDate(today, tomorrow, roomType.id);

// //       console.log("✅ Availability check result:", availabilityData);

// //       // If we get available rooms or a positive response, mark as available
// //       if (availabilityData && 
// //           (availabilityData.available === true || 
// //            (Array.isArray(availabilityData) && availabilityData.length > 0) ||
// //            availabilityData.message === 'Rooms are available')) {
// //         setIsAvailable(true);
// //       } else {
// //         setIsAvailable(false);
// //         Alert.alert(
// //           'Not Available', 
// //           'Sorry, this room type is not available for the selected dates. Please try different dates or contact support.'
// //         );
// //       }

// //       setAvailabilityChecked(true);
// //     } catch (error) {
// //       console.error('❌ Error checking availability:', error);
// //       setIsAvailable(false);
// //       Alert.alert(
// //         'Availability Check Failed',
// //         'Unable to check room availability. Please try again.'
// //       );
// //     } finally {
// //       setLoadingRooms(false);
// //       setLoading(false);
// //     }
// //   };

// //   const fetchRooms = async () => {
// //     try {
// //       setLoadingRooms(true);
// //       console.log('🔄 Fetching rooms for roomType:', roomType.id);
// //       console.log('👤 Current user role:', userRole);

// //       const roomData = await roomService.getAvailableRooms(roomType.id, userRole);

// //       console.log("✅ Fetched available rooms:", roomData);
// //       setRooms(roomData);
// //     } catch (error) {
// //       console.error('❌ Error fetching rooms:', error);

// //       if (error.response?.status === 403) {
// //         Alert.alert(
// //           'Access Denied', 
// //           'You do not have permission to view available rooms. Please contact administrator.'
// //         );
// //       } else if (error.response?.status === 401) {
// //         Alert.alert(
// //           'Authentication Error',
// //           'Please login again to continue.'
// //         );
// //         navigation.navigate('LoginScr');
// //       } else {
// //         Alert.alert('Error', 'Failed to load available rooms. Please try again.');
// //       }
// //     } finally {
// //       setLoadingRooms(false);
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   const handleRoomSelect = (room) => {
// //     console.log('🛏️ Room selected:', room.roomNumber);
// //     if (isAdminUser()) {
// //       if (selectedRooms.find(r => r.id === room.id)) {
// //         setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
// //       } else {
// //         setSelectedRooms([...selectedRooms, room]);
// //       }
// //     } else {
// //       setSelectedRoom(room);
// //     }
// //   };

// //   const handleBookNow = () => {
// //     console.log('📖 Book Now clicked');

// //     if (isMemberUser()) {
// //       // For members, directly open booking modal without room selection
// //       setShowBookingModal(true);
// //     } else {
// //       // For admins, require room selection
// //       if (!selectedRoom) {
// //         Alert.alert('Please Select', 'Please select a room to continue');
// //         return;
// //       }
// //       setShowBookingModal(true);
// //     }
// //   };

// //   const handleReserveRooms = () => {
// //     console.log('🔒 Reserve Rooms clicked');
// //     if (selectedRooms.length === 0) {
// //       Alert.alert('Please Select', 'Please select at least one room to reserve');
// //       return;
// //     }
// //     setShowReservationModal(true);
// //   };

// //   const handleConfirmBooking = async (bookingData) => {
// //     try {
// //       console.log('🎫 Starting booking process...');

// //       const possibleMembershipNo = membershipNo || user?.id;

// //       if (!possibleMembershipNo) {
// //         Alert.alert(
// //           'Membership Number Required', 
// //           `We couldn't find your membership number.`,
// //           [{ text: 'OK' }]
// //         );
// //         return;
// //       }

// //       console.log('✅ Using membership number:', possibleMembershipNo);

// //       // For members, we don't need selected room IDs - backend will assign available rooms
// //       const payload = {
// //         from: bookingData.checkIn,
// //         to: bookingData.checkOut,
// //         numberOfRooms: bookingData.numberOfRooms || 1, // Add number of rooms
// //         numberOfAdults: bookingData.numberOfAdults || 1,
// //         numberOfChildren: bookingData.numberOfChildren || 0,
// //         pricingType: 'MEMBER',
// //         specialRequest: bookingData.specialRequest || '',
// //       };

// //       console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

// //       const result = await bookingService.memberBookingRoom(roomType.id, payload);
// //       console.log('✅ Booking response received:', result);

// //       // Extract booking ID from response
// //       let bookingId;
// //       let numericBookingId = null;

// //       if (result.bookings && Array.isArray(result.bookings) && result.bookings.length > 0) {
// //         bookingId = result.bookings[0].id;
// //         numericBookingId = result.bookings[0].id;
// //       } else if (result.id) {
// //         bookingId = result.id;
// //         numericBookingId = result.id;
// //       } else if (result.bookingId) {
// //         bookingId = result.bookingId;
// //         numericBookingId = result.bookingId;
// //       } else {
// //         bookingId = `temp-${Date.now()}`;
// //       }

// //       console.log('✅ Booking successful! Response:', result);

// //       // Navigate to voucher screen
// //       navigation.navigate('voucher', {
// //         bookingId: bookingId,
// //         numericBookingId: numericBookingId,
// //         bookingData: {
// //           ...bookingData,
// //           totalPrice: bookingData.totalPrice,
// //           numberOfAdults: bookingData.numberOfAdults || 1,
// //           numberOfChildren: bookingData.numberOfChildren || 0,
// //           numberOfRooms: bookingData.numberOfRooms || 1,
// //           checkIn: bookingData.checkIn,
// //           checkOut: bookingData.checkOut,
// //           specialRequest: bookingData.specialRequest || ''
// //         },
// //         roomType: roomType,
// //         selectedRoom: selectedRoom,
// //         bookingResponse: result
// //       });

// //     } catch (error) {
// //       console.error('💥 Booking error in component:', error);

// //       let errorMessage = error.message || 'Failed to book room. Please try again.';

// //       if (error.message?.includes('Network Error')) {
// //         errorMessage = 'Network error. Please check your internet connection and try again.';
// //       } else if (error.message?.includes('timeout')) {
// //         errorMessage = 'Request timeout. Please try again.';
// //       } else if (error.response?.status === 409) {
// //         errorMessage = 'Room not available for selected dates. Please choose different dates.';
// //       } else if (error.response?.status === 400) {
// //         errorMessage = 'Invalid booking data. Please check your information and try again.';
// //       } else if (error.response?.status === 500) {
// //         errorMessage = 'Server error. Please try again later.';
// //       }

// //       Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
// //     }
// //   };

// //   const handleConfirmReservation = async (reservationData) => {
// //     try {
// //       console.log('🔐 Starting reservation process...');
// //       console.log('   - User role:', userRole);

// //       const roomIds = selectedRooms.map(room => room.id);

// //       const payload = {
// //         roomIds: roomIds,
// //         reserve: true,
// //         reserveFrom: reservationData.reserveFrom,
// //         reserveTo: reservationData.reserveTo,
// //       };

// //       console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
// //       console.log('👤 Admin ID will come from JWT token');

// //       await roomService.reserveRooms(payload);

// //       Alert.alert(
// //         'Reservation Successful!',
// //         `${selectedRooms.length} room(s) have been reserved successfully.`,
// //         [{ 
// //           text: 'OK', 
// //           onPress: () => {
// //             setShowReservationModal(false);
// //             setSelectedRooms([]);
// //             fetchRooms();
// //           }
// //         }]
// //       );
// //     } catch (error) {
// //       console.error('💥 Reservation error:', error);
// //       Alert.alert(
// //         'Reservation Failed', 
// //         error.message || 'Failed to reserve rooms. Please try again.'
// //       );
// //     }
// //   };

// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     if (isMemberUser()) {
// //       checkRoomTypeAvailability();
// //     } else {
// //       fetchRooms();
// //     }
// //   };

// //   const formatPrice = (price) => {
// //     if (!price && price !== 0) return 'N/A';
// //     return `${parseFloat(price).toFixed(0)}Rs`;
// //   };

// //   const renderImages = () => {
// //     const images = roomType.images || [];

// //     if (images.length === 0) {
// //       return (
// //         <View style={styles.noImageContainer}>
// //           <Icon name="image" size={60} color="#ccc" />
// //           <Text style={styles.noImageText}>No images available</Text>
// //         </View>
// //       );
// //     }

// //     return (
// //       <View style={styles.imageSection}>
// //         <Image 
// //           source={{ uri: images[imageIndex]?.url }} 
// //           style={styles.mainImage}
// //           resizeMode="cover"
// //         />

// //         {images.length > 1 && (
// //           <View style={styles.imageIndicators}>
// //             {images.map((_, index) => (
// //               <TouchableOpacity
// //                 key={index}
// //                 style={[
// //                   styles.imageIndicator,
// //                   index === imageIndex && styles.imageIndicatorActive
// //                 ]}
// //                 onPress={() => setImageIndex(index)}
// //               />
// //             ))}
// //           </View>
// //         )}
// //       </View>
// //     );
// //   };

// //   const renderRoomItem = ({ item }) => {
// //     const isSelected = isAdminUser() 
// //       ? selectedRooms.find(r => r.id === item.id)
// //       : selectedRoom?.id === item.id;

// //     return (
// //       <TouchableOpacity
// //         style={[
// //           styles.roomItem,
// //           isSelected && styles.roomItemSelected,
// //         ]}
// //         onPress={() => handleRoomSelect(item)}
// //       >
// //         <View style={styles.roomInfo}>
// //           <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
// //           <Text style={styles.roomDescription}>
// //             {item.description || 'Comfortable and well-equipped room'}
// //           </Text>
// //           <View style={styles.statusContainer}>
// //             <View
// //               style={[
// //                 styles.statusIndicator,
// //                 item.isActive ? styles.active : styles.inactive,
// //               ]}
// //             />
// //             <Text style={styles.statusText}>
// //               {item.isActive ? 'Available' : 'Unavailable'}
// //             </Text>
// //           </View>
// //         </View>
// //         <Icon
// //           name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
// //           size={24}
// //           color="#b48a64"
// //         />
// //       </TouchableOpacity>
// //     );
// //   };

// //   // Render member-specific view (no room selection)
// //   const renderMemberView = () => {
// //     return (
// //       <View style={styles.memberSection}>
// //         <Text style={styles.sectionTitle}>Book {roomType.name}</Text>

// //         <View style={styles.availabilityInfo}>
// //           <View style={styles.availabilityHeader}>
// //             <Icon 
// //               name={isAvailable ? "check-circle" : "error"} 
// //               size={24} 
// //               color={isAvailable ? "#28a745" : "#dc3545"} 
// //             />
// //             <Text style={[
// //               styles.availabilityText,
// //               { color: isAvailable ? "#28a745" : "#dc3545" }
// //             ]}>
// //               {isAvailable ? 'Available for Booking' : 'Currently Not Available'}
// //             </Text>
// //           </View>

// //           <Text style={styles.availabilityDescription}>
// //             {isAvailable 
// //               ? 'This room type is available for booking. Click "Book Now" to proceed with your reservation.'
// //               : 'This room type is not available for the default dates. You can still check availability for different dates in the booking form.'
// //             }
// //           </Text>
// //         </View>

// //         <View style={styles.bookingInfo}>
// //           <Text style={styles.bookingInfoTitle}>Booking Information</Text>
// //           <View style={styles.infoItem}>
// //             <Icon name="info" size={16} color="#b48a64" />
// //             <Text style={styles.infoText}>
// //               You can book 1 or more rooms of this type based on availability
// //             </Text>
// //           </View>
// //           <View style={styles.infoItem}>
// //             <Icon name="event-available" size={16} color="#b48a64" />
// //             <Text style={styles.infoText}>
// //               Rooms will be automatically assigned based on availability
// //             </Text>
// //           </View>
// //         </View>
// //       </View>
// //     );
// //   };

// //   // Render admin view with room selection
// //   const renderAdminView = () => {
// //     return (
// //       <View style={styles.roomsSection}>
// //         <Text style={styles.sectionTitle}>Select Rooms to Reserve</Text>

// //         {loadingRooms ? (
// //           <View style={styles.loadingContainer}>
// //             <ActivityIndicator size="large" color="#b48a64" />
// //             <Text style={styles.loadingText}>Loading available rooms...</Text>
// //           </View>
// //         ) : rooms.length > 0 ? (
// //           <FlatList
// //             data={rooms}
// //             renderItem={renderRoomItem}
// //             keyExtractor={(item) => item.id.toString()}
// //             scrollEnabled={false}
// //             showsVerticalScrollIndicator={false}
// //           />
// //         ) : (
// //           <View style={styles.noRoomsContainer}>
// //             <Icon name="meeting-room" size={50} color="#ccc" />
// //             <Text style={styles.noRoomsText}>No rooms available</Text>
// //             <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
// //               <Text style={styles.retryText}>Refresh</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}
// //       </View>
// //     );
// //   };

// //   if (!isAuthenticated || !user) {
// //     return (
// //       <View style={styles.container}>
// //         <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />
// //         <View style={styles.header}>
// //           <TouchableOpacity onPress={() => navigation.goBack()}>
// //             <Icon name="arrow-back" size={24} color="#000" />
// //           </TouchableOpacity>
// //           <Text style={styles.headerTitle}>Authentication Required</Text>
// //           <View style={{ width: 24 }} />
// //         </View>
// //         <View style={styles.accessDeniedContainer}>
// //           <Icon name="block" size={60} color="#ff6b6b" />
// //           <Text style={styles.accessDeniedTitle}>Please Login</Text>
// //           <Text style={styles.accessDeniedText}>
// //             You need to be logged in to view room details.
// //           </Text>
// //           <TouchableOpacity 
// //             style={styles.backButton} 
// //             onPress={() => navigation.navigate('LoginScr')}
// //           >
// //             <Text style={styles.backButtonText}>Go to Login</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />

// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-back" size={24} color="#000" />
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>{roomType.name}</Text>
// //         <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
// //           <Icon name="refresh" size={24} color={refreshing ? '#ccc' : '#000'} />
// //         </TouchableOpacity>
// //       </View>

// //       <ScrollView 
// //         style={styles.content} 
// //         showsVerticalScrollIndicator={false}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={refreshing}
// //             onRefresh={onRefresh}
// //             colors={['#b48a64']}
// //           />
// //         }
// //       >
// //         {renderImages()}

// //         <View style={styles.roomTypeInfo}>
// //           <Text style={styles.roomTypeName}>{roomType.name}</Text>

// //           {/* Enhanced Debug Info - Only show in development */}
// //           {__DEV__ && (
// //             <View style={styles.debugSection}>
// //               <Text style={styles.debugTitle}>Debug Information:</Text>
// //               <Text style={styles.debugText}>Role: {userRole}</Text>
// //               <Text style={styles.debugText}>Name: {userName}</Text>
// //               <Text style={styles.debugText}>Membership No: {membershipNo || 'NOT FOUND'}</Text>
// //               <Text style={styles.debugText}>Admin ID: {adminId || 'NOT FOUND'}</Text>
// //               <Text style={styles.debugText}>User ID: {user?.id}</Text>
// //               <Text style={styles.smallDebugText}>
// //                 All keys: {user ? Object.keys(user).join(', ') : 'No user'}
// //               </Text>
// //             </View>
// //           )}

// //           <View style={styles.pricingSection}>
// //             <Text style={styles.pricingTitle}>Pricing Information</Text>

// //             <View style={styles.priceContainer}>
// //               <View style={styles.priceRow}>
// //                 <View style={styles.priceLabelContainer}>
// //                   <Icon name="person" size={16} color="#666" />
// //                   <Text style={styles.priceLabel}>Member Price:</Text>
// //                 </View>
// //                 <Text style={styles.priceValue}>
// //                   {formatPrice(roomType.priceMember)}
// //                 </Text>
// //               </View>

// //               <View style={styles.priceRow}>
// //                 <View style={styles.priceLabelContainer}>
// //                   <Icon name="person-outline" size={16} color="#666" />
// //                   <Text style={styles.priceLabel}>Guest Price:</Text>
// //                 </View>
// //                 <Text style={styles.priceValue}>
// //                   {formatPrice(roomType.priceGuest)}
// //                 </Text>
// //               </View>

// //               <Text style={styles.perNightText}>per night</Text>
// //             </View>
// //           </View>

// //           {isAdminUser() && (
// //             <View style={styles.roomCount}>
// //               <Icon name="meeting-room" size={16} color="#666" />
// //               <Text style={styles.roomCountText}>
// //                 {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
// //               </Text>
// //               {selectedRooms.length > 0 && (
// //                 <Text style={styles.selectedCountText}>
// //                   • {selectedRooms.length} selected
// //                 </Text>
// //               )}
// //             </View>
// //           )}
// //         </View>

// //         {/* Conditionally render member or admin view */}
// //         {isMemberUser() ? renderMemberView() : renderAdminView()}

// //         <View style={{ height: 100 }} />
// //       </ScrollView>

// //       {/* Footer Actions */}
// //       {!loadingRooms && (
// //         <View style={styles.footer}>
// //           {isAdminUser() ? (
// //             <View style={styles.adminActions}>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.actionButton,
// //                   styles.reserveButton,
// //                   selectedRooms.length === 0 && styles.buttonDisabled,
// //                 ]}
// //                 onPress={handleReserveRooms}
// //                 disabled={selectedRooms.length === 0}
// //               >
// //                 <Text style={styles.actionButtonText}>
// //                   Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           ) : (
// //             <TouchableOpacity
// //               style={[
// //                 styles.actionButton,
// //                 styles.bookButton,
// //                 // For members, button is always enabled (they don't select rooms)
// //               ]}
// //               onPress={handleBookNow}
// //             >
// //               <Text style={styles.actionButtonText}>
// //                 {availabilityChecked 
// //                   ? (isAvailable ? 'Book Now' : 'Check Availability')
// //                   : 'Book Now'
// //                 }
// //               </Text>
// //             </TouchableOpacity>
// //           )}
// //         </View>
// //       )}

// //       <BookingModal
// //         visible={showBookingModal}
// //         onClose={() => setShowBookingModal(false)}
// //         onConfirm={handleConfirmBooking}
// //         room={selectedRoom}
// //         roomType={roomType}
// //         navigation={navigation}
// //         isMember={isMemberUser()}
// //         isAvailable={isAvailable}
// //       />

// //       <ReservationModal
// //         visible={showReservationModal}
// //         onClose={() => setShowReservationModal(false)}
// //         onConfirm={handleConfirmReservation}
// //         selectedRooms={selectedRooms}
// //       />
// //     </View>
// //   );
// // }

// // // Updated Booking Modal Component with Number of Rooms
// // const BookingModal = ({ visible, onClose, onConfirm, room, roomType, navigation, isMember, isAvailable }) => {
// //   const [checkIn, setCheckIn] = useState(new Date());
// //   const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
// //   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
// //   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
// //   const [numberOfAdults, setNumberOfAdults] = useState('1');
// //   const [numberOfChildren, setNumberOfChildren] = useState('0');
// //   const [numberOfRooms, setNumberOfRooms] = useState('1'); // Add number of rooms
// //   const [specialRequest, setSpecialRequest] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [checkingAvailability, setCheckingAvailability] = useState(false);

// //   const calculateTotalPrice = () => {
// //     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
// //     const price = roomType.priceMember || roomType.priceGuest || 0;
// //     const roomsCount = parseInt(numberOfRooms) || 1;
// //     return nights * price * roomsCount;
// //   };

// //   // Check availability for selected dates
// //   const checkAvailability = async () => {
// //     try {
// //       setCheckingAvailability(true);
// //       const fromDate = checkIn.toISOString().split('T')[0];
// //       const toDate = checkOut.toISOString().split('T')[0];

// //       const availabilityData = await roomService.getMemberRoomsForDate(fromDate, toDate, roomType.id);

// //       if (availabilityData && 
// //           (availabilityData.available === true || 
// //            (Array.isArray(availabilityData) && availabilityData.length > 0) ||
// //            availabilityData.message === 'Rooms are available')) {
// //         Alert.alert('Available', 'Rooms are available for the selected dates!');
// //       } else {
// //         Alert.alert('Not Available', 'Sorry, no rooms available for the selected dates. Please try different dates.');
// //       }
// //     } catch (error) {
// //       console.error('Error checking availability:', error);
// //       Alert.alert('Error', 'Failed to check availability. Please try again.');
// //     } finally {
// //       setCheckingAvailability(false);
// //     }
// //   };

// //   const handleConfirm = async () => {
// //     if (!checkIn || !checkOut) {
// //       Alert.alert('Error', 'Please select check-in and check-out dates');
// //       return;
// //     }

// //     if (checkIn >= checkOut) {
// //       Alert.alert('Error', 'Check-out date must be after check-in date');
// //       return;
// //     }

// //     const adults = parseInt(numberOfAdults) || 1;
// //     const children = parseInt(numberOfChildren) || 0;
// //     const roomsCount = parseInt(numberOfRooms) || 1;

// //     if (adults < 1) {
// //       Alert.alert('Error', 'At least one adult is required');
// //       return;
// //     }

// //     if (roomsCount < 1) {
// //       Alert.alert('Error', 'At least one room is required');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const bookingData = {
// //         checkIn: checkIn.toISOString().split('T')[0],
// //         checkOut: checkOut.toISOString().split('T')[0],
// //         numberOfAdults: adults,
// //         numberOfChildren: children,
// //         numberOfRooms: roomsCount, // Include number of rooms
// //         specialRequest: specialRequest,
// //         totalPrice: calculateTotalPrice(),
// //       };

// //       await onConfirm(bookingData);
// //     } catch (error) {
// //       // Error handled in parent
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Modal visible={visible} animationType="slide" transparent>
// //       <View style={styles.modalOverlay}>
// //         <View style={styles.modalContainer}>
// //           <View style={styles.modalHeader}>
// //             <Text style={styles.modalTitle}>
// //               {isMember ? `Book ${roomType.name}` : `Book Room ${room?.roomNumber}`}
// //             </Text>
// //             <TouchableOpacity onPress={onClose}>
// //               <Icon name="close" size={24} color="#666" />
// //             </TouchableOpacity>
// //           </View>

// //           <ScrollView style={styles.modalContent}>
// //             {isMember && (
// //               <View style={styles.availabilityCheckSection}>
// //                 <Text style={styles.availabilityCheckTitle}>Check Availability</Text>
// //                 <TouchableOpacity 
// //                   style={styles.checkAvailabilityButton}
// //                   onPress={checkAvailability}
// //                   disabled={checkingAvailability}
// //                 >
// //                   {checkingAvailability ? (
// //                     <ActivityIndicator size="small" color="#fff" />
// //                   ) : (
// //                     <>
// //                       <Icon name="search" size={16} color="#fff" />
// //                       <Text style={styles.checkAvailabilityText}>Check for Selected Dates</Text>
// //                     </>
// //                   )}
// //                 </TouchableOpacity>
// //               </View>
// //             )}

// //             <View style={styles.formGroup}>
// //               <Text style={styles.label}>Check-in Date</Text>
// //               <TouchableOpacity 
// //                 style={styles.dateInput}
// //                 onPress={() => setShowCheckInPicker(true)}
// //               >
// //                 <Icon name="calendar-today" size={20} color="#666" />
// //                 <Text style={styles.dateText}>
// //                   {checkIn.toLocaleDateString()}
// //                 </Text>
// //               </TouchableOpacity>
// //               {showCheckInPicker && (
// //                 <DateTimePicker
// //                   value={checkIn}
// //                   mode="date"
// //                   display="default"
// //                   onChange={(event, date) => {
// //                     setShowCheckInPicker(false);
// //                     if (date) setCheckIn(date);
// //                   }}
// //                   minimumDate={new Date()}
// //                 />
// //               )}
// //             </View>

// //             <View style={styles.formGroup}>
// //               <Text style={styles.label}>Check-out Date</Text>
// //               <TouchableOpacity 
// //                 style={styles.dateInput}
// //                 onPress={() => setShowCheckOutPicker(true)}
// //               >
// //                 <Icon name="calendar-today" size={20} color="#666" />
// //                 <Text style={styles.dateText}>
// //                   {checkOut.toLocaleDateString()}
// //                 </Text>
// //               </TouchableOpacity>
// //               {showCheckOutPicker && (
// //                 <DateTimePicker
// //                   value={checkOut}
// //                   mode="date"
// //                   display="default"
// //                   onChange={(event, date) => {
// //                     setShowCheckOutPicker(false);
// //                     if (date) setCheckOut(date);
// //                   }}
// //                   minimumDate={new Date(checkIn.getTime() + 86400000)}
// //                 />
// //               )}
// //             </View>

// //             <View style={styles.row}>
// //               <View style={styles.thirdInput}>
// //                 <Text style={styles.label}>Adults</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={numberOfAdults}
// //                   onChangeText={setNumberOfAdults}
// //                   keyboardType="numeric"
// //                 />
// //               </View>
// //               <View style={styles.thirdInput}>
// //                 <Text style={styles.label}>Children</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={numberOfChildren}
// //                   onChangeText={setNumberOfChildren}
// //                   keyboardType="numeric"
// //                 />
// //               </View>
// //               <View style={styles.thirdInput}>
// //                 <Text style={styles.label}>Rooms</Text>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={numberOfRooms}
// //                   onChangeText={setNumberOfRooms}
// //                   keyboardType="numeric"
// //                 />
// //               </View>
// //             </View>

// //             <View style={styles.formGroup}>
// //               <Text style={styles.label}>Special Request (Optional)</Text>
// //               <TextInput
// //                 style={styles.textArea}
// //                 value={specialRequest}
// //                 onChangeText={setSpecialRequest}
// //                 placeholder="Any special requirements..."
// //                 multiline
// //                 numberOfLines={3}
// //               />
// //             </View>

// //             <View style={styles.priceSummary}>
// //               <Text style={styles.priceLabel}>Total Amount:</Text>
// //               <Text style={styles.priceValue}>
// //                 {calculateTotalPrice().toFixed(2)}
// //               </Text>
// //             </View>

// //             <View style={styles.infoBox}>
// //               <Icon name="info" size={16} color="#b48a64" />
// //               <Text style={styles.infoText}>
// //                 {isMember 
// //                   ? `Booking ${numberOfRooms} room(s) of ${roomType.name}. Rooms will be automatically assigned based on availability.`
// //                   : 'After successful booking, you will be redirected to your voucher.'
// //                 }
// //               </Text>
// //             </View>
// //           </ScrollView>

// //           <View style={styles.modalFooter}>
// //             <TouchableOpacity 
// //               style={styles.cancelButton}
// //               onPress={onClose}
// //             >
// //               <Text style={styles.cancelButtonText}>Cancel</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// //               onPress={handleConfirm}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator size="small" color="#fff" />
// //               ) : (
// //                 <Text style={styles.confirmButtonText}>Confirm Booking</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // // Reservation Modal Component (unchanged)
// // const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms }) => {
// //   const [reserveFrom, setReserveFrom] = useState(new Date());
// //   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
// //   const [showFromPicker, setShowFromPicker] = useState(false);
// //   const [showToPicker, setShowToPicker] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const handleConfirm = async () => {
// //     if (!reserveFrom || !reserveTo) {
// //       Alert.alert('Error', 'Please select reservation dates');
// //       return;
// //     }

// //     if (reserveFrom >= reserveTo) {
// //       Alert.alert('Error', 'Reservation end date must be after start date');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const reservationData = {
// //         reserveFrom: reserveFrom.toISOString().split('T')[0],
// //         reserveTo: reserveTo.toISOString().split('T')[0],
// //       };

// //       await onConfirm(reservationData);
// //     } catch (error) {
// //       console.error('Reservation error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Modal visible={visible} animationType="slide" transparent>
// //       <View style={styles.modalOverlay}>
// //         <View style={styles.modalContainer}>
// //           <View style={styles.modalHeader}>
// //             <Text style={styles.modalTitle}>
// //               Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
// //             </Text>
// //             <TouchableOpacity onPress={onClose}>
// //               <Icon name="close" size={24} color="#666" />
// //             </TouchableOpacity>
// //           </View>

// //           <ScrollView style={styles.modalContent}>
// //             <Text style={styles.reservationInfo}>
// //               You are about to reserve the following rooms:
// //             </Text>

// //             <View style={styles.roomsList}>
// //               {selectedRooms.map(room => (
// //                 <Text key={room.id} style={styles.roomItemText}>
// //                   • Room {room.roomNumber}
// //                 </Text>
// //               ))}
// //             </View>

// //             <View style={styles.formGroup}>
// //               <Text style={styles.label}>Reserve From</Text>
// //               <TouchableOpacity 
// //                 style={styles.dateInput}
// //                 onPress={() => setShowFromPicker(true)}
// //               >
// //                 <Icon name="calendar-today" size={20} color="#666" />
// //                 <Text style={styles.dateText}>
// //                   {reserveFrom.toLocaleDateString()}
// //                 </Text>
// //               </TouchableOpacity>
// //               {showFromPicker && (
// //                 <DateTimePicker
// //                   value={reserveFrom}
// //                   mode="date"
// //                   display="default"
// //                   onChange={(event, date) => {
// //                     setShowFromPicker(false);
// //                     if (date) setReserveFrom(date);
// //                   }}
// //                 />
// //               )}
// //             </View>

// //             <View style={styles.formGroup}>
// //               <Text style={styles.label}>Reserve To</Text>
// //               <TouchableOpacity 
// //                 style={styles.dateInput}
// //                 onPress={() => setShowToPicker(true)}
// //               >
// //                 <Icon name="calendar-today" size={20} color="#666" />
// //                 <Text style={styles.dateText}>
// //                   {reserveTo.toLocaleDateString()}
// //                 </Text>
// //               </TouchableOpacity>
// //               {showToPicker && (
// //                 <DateTimePicker
// //                   value={reserveTo}
// //                   mode="date"
// //                   display="default"
// //                   onChange={(event, date) => {
// //                     setShowToPicker(false);
// //                     if (date) setReserveTo(date);
// //                   }}
// //                 />
// //               )}
// //             </View>
// //           </ScrollView>

// //           <View style={styles.modalFooter}>
// //             <TouchableOpacity 
// //               style={styles.cancelButton}
// //               onPress={onClose}
// //             >
// //               <Text style={styles.cancelButtonText}>Cancel</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity 
// //               style={[styles.confirmButton, loading && styles.buttonDisabled]}
// //               onPress={handleConfirm}
// //               disabled={loading}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator size="small" color="#fff" />
// //               ) : (
// //                 <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#f9f3eb' },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 20,
// //     paddingVertical: 15,
// //     backgroundColor: '#dbc9a5',
// //     borderBottomLeftRadius: 20,
// //     borderBottomRightRadius: 20,
// //     paddingTop: 40,
// //   },
// //   headerTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#000',
// //   },
// //   content: { flex: 1 },
// //   imageSection: {
// //     position: 'relative',
// //   },
// //   mainImage: {
// //     width: '100%',
// //     height: 250,
// //   },
// //   imageIndicators: {
// //     position: 'absolute',
// //     bottom: 10,
// //     left: 0,
// //     right: 0,
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //   },
// //   imageIndicator: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     backgroundColor: 'rgba(255,255,255,0.5)',
// //     marginHorizontal: 4,
// //   },
// //   imageIndicatorActive: {
// //     backgroundColor: '#fff',
// //     width: 20,
// //   },
// //   noImageContainer: {
// //     height: 200,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f0f0f0',
// //   },
// //   noImageText: {
// //     marginTop: 10,
// //     color: '#666',
// //     fontSize: 16,
// //   },
// //   roomTypeInfo: {
// //     padding: 20,
// //   },
// //   roomTypeName: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   debugSection: {
// //     backgroundColor: '#f8f9fa',
// //     padding: 12,
// //     borderRadius: 8,
// //     marginBottom: 15,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#6c757d',
// //   },
// //   debugTitle: {
// //     fontSize: 12,
// //     fontWeight: 'bold',
// //     color: '#6c757d',
// //     marginBottom: 5,
// //   },
// //   debugText: {
// //     fontSize: 10,
// //     color: '#6c757d',
// //     marginBottom: 2,
// //   },
// //   smallDebugText: {
// //     fontSize: 8,
// //     color: '#6c757d',
// //     fontStyle: 'italic',
// //   },
// //   pricingSection: {
// //     marginBottom: 15,
// //   },
// //   pricingTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   priceContainer: {
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     borderWidth: 1,
// //     borderColor: '#e9ecef',
// //   },
// //   priceRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 8,
// //   },
// //   priceLabelContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   priceLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginLeft: 8,
// //   },
// //   priceValue: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#b48a64',
// //   },
// //   perNightText: {
// //     fontSize: 12,
// //     color: '#888',
// //     textAlign: 'right',
// //     marginTop: 5,
// //   },
// //   roomCount: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   roomCountText: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginLeft: 8,
// //   },
// //   selectedCountText: {
// //     fontSize: 14,
// //     color: '#b48a64',
// //     fontWeight: 'bold',
// //     marginLeft: 10,
// //   },

// //   // Member Section Styles
// //   memberSection: {
// //     padding: 20,
// //     paddingTop: 0,
// //   },
// //   availabilityInfo: {
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     borderWidth: 1,
// //     borderColor: '#e9ecef',
// //     marginBottom: 15,
// //   },
// //   availabilityHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 8,
// //   },
// //   availabilityText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   availabilityDescription: {
// //     fontSize: 14,
// //     color: '#666',
// //     lineHeight: 20,
// //   },
// //   bookingInfo: {
// //     backgroundColor: '#f8f9fa',
// //     padding: 15,
// //     borderRadius: 10,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#b48a64',
// //   },
// //   bookingInfoTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   infoItem: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     marginBottom: 8,
// //   },
// //   infoText: {
// //     flex: 1,
// //     fontSize: 14,
// //     color: '#666',
// //     marginLeft: 8,
// //     lineHeight: 18,
// //   },

// //   // Rooms Section (Admin)
// //   roomsSection: {
// //     padding: 20,
// //     paddingTop: 0,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 15,
// //   },
// //   loadingContainer: {
// //     padding: 40,
// //     alignItems: 'center',
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     color: '#666',
// //   },
// //   roomItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     padding: 15,
// //     borderRadius: 10,
// //     marginBottom: 10,
// //     borderWidth: 1,
// //     borderColor: '#e9ecef',
// //   },
// //   roomItemSelected: {
// //     borderColor: '#b48a64',
// //     backgroundColor: '#fdf6f0',
// //   },
// //   roomInfo: {
// //     flex: 1,
// //   },
// //   roomNumber: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 4,
// //   },
// //   roomDescription: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginBottom: 8,
// //   },
// //   statusContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   statusIndicator: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     marginRight: 6,
// //   },
// //   active: {
// //     backgroundColor: '#28a745',
// //   },
// //   inactive: {
// //     backgroundColor: '#dc3545',
// //   },
// //   statusText: {
// //     fontSize: 12,
// //     color: '#666',
// //   },
// //   noRoomsContainer: {
// //     alignItems: 'center',
// //     padding: 40,
// //   },
// //   noRoomsText: {
// //     fontSize: 16,
// //     color: '#666',
// //     marginTop: 10,
// //     marginBottom: 20,
// //   },
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
// //   footer: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: '#fff',
// //     padding: 20,
// //     borderTopWidth: 1,
// //     borderTopColor: '#e9ecef',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 3,
// //     elevation: 5,
// //   },
// //   adminActions: {
// //     flexDirection: 'row',
// //   },
// //   actionButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 10,
// //     alignItems: 'center',
// //   },
// //   bookButton: {
// //     backgroundColor: '#b48a64',
// //   },
// //   reserveButton: {
// //     backgroundColor: '#28a745',
// //   },
// //   buttonDisabled: {
// //     backgroundColor: '#ccc',
// //     opacity: 0.6,
// //   },
// //   actionButtonText: {
// //     color: '#fff',
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //   },
// //   accessDeniedContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 40,
// //   },
// //   accessDeniedTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginTop: 15,
// //     marginBottom: 10,
// //   },
// //   accessDeniedText: {
// //     fontSize: 16,
// //     color: '#666',
// //     textAlign: 'center',
// //     marginBottom: 20,
// //     lineHeight: 22,
// //   },
// //   backButton: {
// //     backgroundColor: '#b48a64',
// //     paddingHorizontal: 25,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //   },
// //   backButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },

// //   // Modal Styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContainer: {
// //     backgroundColor: '#fff',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: '90%',
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     padding: 20,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#e9ecef',
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#333',
// //   },
// //   modalContent: {
// //     padding: 20,
// //   },
// //   availabilityCheckSection: {
// //     marginBottom: 20,
// //     padding: 15,
// //     backgroundColor: '#f0f7ff',
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#b48a64',
// //   },
// //   availabilityCheckTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   checkAvailabilityButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#b48a64',
// //     padding: 12,
// //     borderRadius: 8,
// //   },
// //   checkAvailabilityText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //   },
// //   formGroup: {
// //     marginBottom: 20,
// //   },
// //   label: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 8,
// //   },
// //   dateInput: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 8,
// //     padding: 12,
// //     backgroundColor: '#f9f9f9',
// //   },
// //   dateText: {
// //     marginLeft: 10,
// //     fontSize: 14,
// //     color: '#333',
// //   },
// //   row: {
// //     flexDirection: 'row',
// //     gap: 10,
// //   },
// //   thirdInput: {
// //     flex: 1,
// //   },
// //   halfInput: {
// //     flex: 1,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 14,
// //     backgroundColor: '#f9f9f9',
// //   },
// //   textArea: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     borderRadius: 8,
// //     padding: 12,
// //     fontSize: 14,
// //     backgroundColor: '#f9f9f9',
// //     minHeight: 80,
// //     textAlignVertical: 'top',
// //   },
// //   priceSummary: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: 15,
// //     backgroundColor: '#f8f9fa',
// //     borderRadius: 8,
// //     marginBottom: 20,
// //   },
// //   priceLabel: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#333',
// //   },
// //   priceValue: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#b48a64',
// //   },
// //   infoBox: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     backgroundColor: '#f0f7ff',
// //     padding: 12,
// //     borderRadius: 8,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#b48a64',
// //   },
// //   infoText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: '#1565c0',
// //     marginLeft: 8,
// //     lineHeight: 16,
// //   },
// //   modalFooter: {
// //     flexDirection: 'row',
// //     gap: 10,
// //     padding: 20,
// //     borderTopWidth: 1,
// //     borderTopColor: '#e9ecef',
// //   },
// //   cancelButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#b48a64',
// //     alignItems: 'center',
// //     backgroundColor: 'transparent',
// //   },
// //   cancelButtonText: {
// //     color: '#b48a64',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   confirmButton: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     backgroundColor: '#b48a64',
// //   },
// //   confirmButtonText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   reservationInfo: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginBottom: 15,
// //     lineHeight: 20,
// //   },
// //   roomsList: {
// //     backgroundColor: '#f8f9fa',
// //     padding: 15,
// //     borderRadius: 8,
// //     marginBottom: 20,
// //   },
// //   roomItemText: {
// //     fontSize: 14,
// //     color: '#333',
// //     marginBottom: 5,
// //   },
// // });

// //2nd version
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   FlatList,
//   Alert,
//   StatusBar,
//   Image,
//   Dimensions,
//   Modal,
//   TextInput,
//   RefreshControl,
//   Switch
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { roomService } from '../../services/roomService';
// import { bookingService } from '../../services/bookingService';
// import { useAuth } from '../auth/contexts/AuthContext';
// import { ImageBackground } from 'react-native';
// import Swiper from "react-native-swiper";

// const { width: screenWidth } = Dimensions.get('window');

// export default function details({ navigation, route }) {
//   const { user, isAuthenticated } = useAuth();

//   console.log('🚀 RoomDetails - User object:', JSON.stringify(user, null, 2));
//   console.log('🚀 RoomDetails - isAuthenticated:', isAuthenticated);

//   const userRole = user?.role;
//   const userName = user?.name;
//   const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
//   const adminId = user?.adminId || user?.adminID || user?.admin_id || user?.id;

//   console.log('🔍 Extracted values:', {
//     userRole,
//     userName,
//     membershipNo,
//     adminId,
//     allUserKeys: user ? Object.keys(user) : 'No user'
//   });

//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [selectedRooms, setSelectedRooms] = useState([]);
//   const [roomType, setRoomType] = useState(route.params?.roomType);
//   const [imageIndex, setImageIndex] = useState(0);
//   const [loadingRooms, setLoadingRooms] = useState(false);
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [showReservationModal, setShowReservationModal] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [availabilityChecked, setAvailabilityChecked] = useState(false);
//   const [isAvailable, setIsAvailable] = useState(false);

//   useEffect(() => {
//     console.log('🎯 useEffect triggered - Auth status:', isAuthenticated);

//     if (!isAuthenticated || !user) {
//       Alert.alert(
//         'Authentication Required',
//         'Please login to access room details.',
//         [{
//           text: 'OK', onPress: () => navigation.reset({
//             index: 0,
//             routes: [{ name: 'LoginScr' }],
//           })
//         }]
//       );
//       return;
//     }

//     // For members, check availability immediately
//     if (isMemberUser()) {
//       checkRoomTypeAvailability();
//     } else {
//       fetchRooms();
//     }
//   }, [isAuthenticated, user]);

//   const isAdminUser = () => {
//     const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
//     console.log('👮 isAdminUser check:', { userRole, isAdmin });
//     return isAdmin;
//   };

//   const isMemberUser = () => {
//     const isMember = userRole === 'MEMBER';
//     console.log('👤 isMemberUser check:', { userRole, isMember });
//     return isMember;
//   };

//   // Check room type availability for members
//   const checkRoomTypeAvailability = async () => {
//     try {
//       setLoadingRooms(true);
//       console.log('🔍 Checking availability for room type:', roomType.id);

//       const today = new Date().toISOString().split('T')[0];
//       const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

//       const availabilityData = await roomService.getMemberRoomsForDate(today, tomorrow, roomType.id);

//       console.log("✅ Availability check result:", availabilityData);

//       if (availabilityData &&
//         (availabilityData.available === true ||
//           (Array.isArray(availabilityData) && availabilityData.length > 0) ||
//           availabilityData.message === 'Rooms are available')) {
//         setIsAvailable(true);
//       } else {
//         setIsAvailable(false);
//         Alert.alert(
//           'Not Available',
//           'Sorry, this room type is not available for the selected dates. Please try different dates or contact support.'
//         );
//       }

//       setAvailabilityChecked(true);
//     } catch (error) {
//       console.error('❌ Error checking availability:', error);
//       setIsAvailable(false);
//       Alert.alert(
//         'Availability Check Failed',
//         'Unable to check room availability. Please try again.'
//       );
//     } finally {
//       setLoadingRooms(false);
//       setLoading(false);
//     }
//   };

//   const fetchRooms = async () => {
//     try {
//       setLoadingRooms(true);
//       console.log('🔄 Fetching rooms for roomType:', roomType.id);
//       console.log('👤 Current user role:', userRole);

//       const roomData = await roomService.getAvailableRooms(roomType.id, userRole);

//       console.log("✅ Fetched available rooms:", roomData);
//       setRooms(roomData);
//     } catch (error) {
//       console.error('❌ Error fetching rooms:', error);

//       if (error.response?.status === 403) {
//         Alert.alert(
//           'Access Denied',
//           'You do not have permission to view available rooms. Please contact administrator.'
//         );
//       } else if (error.response?.status === 401) {
//         Alert.alert(
//           'Authentication Error',
//           'Please login again to continue.'
//         );
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'LoginScr' }],
//         });
//       } else {
//         Alert.alert('Error', 'Failed to load available rooms. Please try again.');
//       }
//     } finally {
//       setLoadingRooms(false);
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRoomSelect = (room) => {
//     console.log('🛏️ Room selected:', room.roomNumber);
//     if (isAdminUser()) {
//       if (selectedRooms.find(r => r.id === room.id)) {
//         setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
//       } else {
//         setSelectedRooms([...selectedRooms, room]);
//       }
//     } else {
//       setSelectedRoom(room);
//     }
//   };

//   const handleBookNow = () => {
//     console.log('📖 Book Now clicked');
//     console.log('👤 User object:', JSON.stringify(user, null, 2));
//     console.log('📊 User status:', user?.status, user?.Status, user?.memberStatus);

//     // Check if member is deactivated - handle multiple possible field names and casing
//     const userStatus = user?.status || user?.Status || user?.memberStatus || '';
//     if (userStatus.toUpperCase() === 'DEACTIVATED') {
//       Alert.alert(
//         'Account Deactivated',
//         'You cannot book room. Please contact PSC for assistance.',
//         [{ text: 'OK' }]
//       );
//       return;
//     }

//     if (isMemberUser()) {
//       setShowBookingModal(true);
//     } else {
//       if (!selectedRoom) {
//         Alert.alert('Please Select', 'Please select a room to continue');
//         return;
//       }
//       setShowBookingModal(true);
//     }
//   };

//   const handleReserveRooms = () => {
//     console.log('🔒 Reserve Rooms clicked');
//     if (selectedRooms.length === 0) {
//       Alert.alert('Please Select', 'Please select at least one room to reserve');
//       return;
//     }
//     setShowReservationModal(true);
//   };

//   const handleConfirmBooking = async (bookingData) => {
//     try {
//       console.log('🎫 Starting booking process...');

//       // Check if member is deactivated - prevent booking even if modal was opened
//       const userStatus = user?.status || user?.Status || user?.memberStatus || '';
//       if (userStatus.toUpperCase() === 'DEACTIVATED') {
//         Alert.alert(
//           'Account Deactivated',
//           'You cannot book room. Please contact PSC for assistance.',
//           [{ text: 'OK' }]
//         );
//         setShowBookingModal(false);
//         return;
//       }

//       const possibleMembershipNo = membershipNo || user?.id;

//       if (!possibleMembershipNo) {
//         Alert.alert(
//           'Membership Number Required',
//           `We couldn't find your membership number.`,
//           [{ text: 'OK' }]
//         );
//         return;
//       }

//       console.log('✅ Using membership number:', possibleMembershipNo);

//       // Prepare payload according to backend expectations
//       const payload = {
//         membership_no: possibleMembershipNo, // Send membership_no at root level
//         from: bookingData.checkIn,
//         to: bookingData.checkOut,
//         numberOfRooms: bookingData.numberOfRooms || 1,
//         numberOfAdults: bookingData.numberOfAdults || 1,
//         numberOfChildren: bookingData.numberOfChildren || 0,
//         pricingType: bookingData.isGuestBooking ? 'guest' : 'member',
//         specialRequest: bookingData.specialRequest || '',
//         // Note: Don't send totalPrice - backend calculates it
//         // Note: Don't send selectedRoomIds - backend selects available rooms
//         // Note: Don't send roomTypeId - it's in the query parameter
//         // Guest booking fields
//         guestName: bookingData.isGuestBooking ? bookingData.guestName : '',
//         guestContact: bookingData.isGuestBooking ? bookingData.guestContact : '',
//         remarks: bookingData.remarks || '',
//       };

//       console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

//       // Call the booking service with roomType as query parameter
//       const result = await bookingService.memberBookingRoom(roomType.id, payload);
//       console.log('✅ Booking response received:', result);

//       // Extract booking information from response
//       let bookingId;
//       let numericBookingId = null;
//       let invoiceNumber = null;

//       if (result.Data?.InvoiceNumber) {
//         invoiceNumber = result.Data.InvoiceNumber;
//         bookingId = invoiceNumber; // Use invoice number as booking ID
//       } else if (result.Data?.BookingId) {
//         bookingId = result.Data.BookingId;
//         numericBookingId = result.Data.BookingId;
//       } else if (result.bookings && Array.isArray(result.bookings) && result.bookings.length > 0) {
//         bookingId = result.bookings[0].id;
//         numericBookingId = result.bookings[0].id;
//       } else if (result.id) {
//         bookingId = result.id;
//         numericBookingId = result.id;
//       } else if (result.bookingId) {
//         bookingId = result.bookingId;
//         numericBookingId = result.bookingId;
//       } else {
//         bookingId = `temp-${Date.now()}`;
//       }

//       console.log('✅ Booking successful! Response:', result);

//       // Extract room information from response if available
//       let selectedRoomsInfo = [];
//       if (result.Data?.BookingSummary?.SelectedRooms) {
//         selectedRoomsInfo = result.Data.BookingSummary.SelectedRooms;
//       } else if (result.TemporaryData?.roomIds) {
//         // You might need to fetch room details if only IDs are provided
//         selectedRoomsInfo = result.TemporaryData.roomIds.map(id => ({ id }));
//       }

//       // Navigate to voucher screen with all necessary data
//       navigation.navigate('voucher', {
//         bookingId: bookingId,
//         numericBookingId: numericBookingId,
//         invoiceNumber: invoiceNumber,
//         bookingData: {
//           ...bookingData,
//           // Use backend calculated total price if available
//           totalPrice: result.Data?.Amount || result.Data?.totalPrice || bookingData.totalPrice,
//           numberOfAdults: bookingData.numberOfAdults || 1,
//           numberOfChildren: bookingData.numberOfChildren || 0,
//           numberOfRooms: bookingData.numberOfRooms || 1,
//           checkIn: bookingData.checkIn,
//           checkOut: bookingData.checkOut,
//           specialRequest: bookingData.specialRequest || '',
//           isGuestBooking: bookingData.isGuestBooking || false,
//           guestName: bookingData.guestName || '',
//         },
//         roomType: roomType,
//         selectedRooms: selectedRoomsInfo,
//         bookingResponse: result,
//         invoiceData: result.Data || result // Pass invoice data directly
//       });

//     } catch (error) {
//       console.error('💥 Booking error in component:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         data: error.response?.data
//       });

//       let errorMessage = error.message || 'Failed to book room. Please try again.';

//       // Extract error message from backend response if available
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.ResponseMessage) {
//         errorMessage = error.response.data.ResponseMessage;
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       }

//       // Handle specific HTTP status codes
//       if (error.message?.includes('Network Error')) {
//         errorMessage = 'Network error. Please check your internet connection and try again.';
//       } else if (error.message?.includes('timeout')) {
//         errorMessage = 'Request timeout. Please try again.';
//       } else if (error.response?.status === 409) {
//         errorMessage = errorMessage || 'Room not available for selected dates. Please choose different dates.';
//       } else if (error.response?.status === 400) {
//         errorMessage = errorMessage || 'Invalid booking data. Please check your information and try again.';
//       } else if (error.response?.status === 500) {
//         errorMessage = errorMessage || 'Server error. Please try again later.';
//         // Log server errors for debugging
//         console.error('Server error details:', error.response?.data);
//       }

//       Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
//     }
//   };

//   const handleConfirmReservation = async (reservationData) => {
//     try {
//       console.log('🔐 Starting reservation process...');
//       console.log('   - User role:', userRole);

//       const roomIds = selectedRooms.map(room => room.id);
//       const payload = {
//         roomIds: roomIds,
//         reserve: true,
//         reserveFrom: reservationData.reserveFrom,
//         reserveTo: reservationData.reserveTo,
//       };

//       console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
//       console.log('👤 Admin ID will come from JWT token');

//       await roomService.reserveRooms(payload);

//       Alert.alert(
//         'Reservation Successful!',
//         `${selectedRooms.length} room(s) have been reserved successfully.`,
//         [{
//           text: 'OK',
//           onPress: () => {
//             setShowReservationModal(false);
//             setSelectedRooms([]);
//             fetchRooms();
//           }
//         }]
//       );
//     } catch (error) {
//       console.error('💥 Reservation error:', error);
//       Alert.alert(
//         'Reservation Failed',
//         error.message || 'Failed to reserve rooms. Please try again.'
//       );
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     if (isMemberUser()) {
//       checkRoomTypeAvailability();
//     } else {
//       fetchRooms();
//     }
//   };

//   const formatPrice = (price) => {
//     if (!price && price !== 0) return 'N/A';
//     return `${parseFloat(price).toFixed(0)}Rs`;
//   };

//   // Room-specific features data
//   const roomFeatures = {
//     'Suite': {
//       description: 'Suite room comprise of:',
//       features: [
//         'Two rooms',
//         'Double bed',
//         'TV lounge',
//         'Sofa set',
//         'Refrigerator',
//         'Side table',
//         'Dining table',
//         'Washroom with toiletries',
//       ],
//     },
//     'Deluxe': {
//       description: 'Deluxe room comprise of:',
//       features: [
//         'Single room',
//         'Double bed',
//         'TV',
//         'Sofa set',
//         'Refrigerator',
//         'Side table',
//         'Dining Table',
//         'Washroom with toiletries',
//       ],
//     },
//     'Studio': {
//       description: 'Studio room comprise of:',
//       features: [
//         'Single room',
//         'Two single beds',
//         'TV',
//         'Sofa set',
//         'Refrigerator',
//         'Side table',
//         'Dining Table',
//         'Washroom with toiletries',
//       ],
//     },
//   };

//   // Get features for current room type
//   const getRoomFeatures = () => {
//     const roomTypeName = roomType.name;
//     // Check if room type name contains any of the keys
//     for (const key of Object.keys(roomFeatures)) {
//       if (roomTypeName.toLowerCase().includes(key.toLowerCase())) {
//         return roomFeatures[key];
//       }
//     }
//     return null;
//   };

//   // Render features section
//   const renderFeaturesSection = () => {
//     const features = getRoomFeatures();
//     if (!features) return null;

//     return (
//       <View style={styles.featuresSection}>
//         <Text style={styles.featuresSectionTitle}>Features</Text>
//         <Text style={styles.featuresDescription}>{features.description}</Text>
//         <View style={styles.featuresList}>
//           {features.features.map((feature, index) => (
//             <View key={index} style={styles.featureItem}>
//               <View style={styles.featureBullet} />
//               <Text style={styles.featureItemText}>{feature}</Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     );
//   };

//   const renderImages = () => {
//     const images = roomType.images || [];

//     if (images.length === 0) {
//       return (
//         <View style={styles.noImageContainer}>
//           <Icon name="image" size={60} color="#ccc" />
//           <Text style={styles.noImageText}>No images available</Text>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.sliderContainer}>
//         <Swiper
//           autoplay
//           autoplayTimeout={4}
//           loop
//           showsPagination
//           activeDotColor="#A3834C"
//         >
//           {images.map((img, index) => (
//             <Image
//               key={index}
//               source={{ uri: img.url }}
//               style={styles.sliderImage}
//             />
//           ))}
//         </Swiper>
//       </View>
//     );
//   };
//   const renderRoomItem = ({ item }) => {
//     const isSelected = isAdminUser()
//       ? selectedRooms.find(r => r.id === item.id)
//       : selectedRoom?.id === item.id;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.roomItem,
//           isSelected && styles.roomItemSelected,
//         ]}
//         onPress={() => handleRoomSelect(item)}
//       >
//         <View style={styles.roomInfo}>
//           <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
//           <Text style={styles.roomDescription}>
//             {item.description || 'Comfortable and well-equipped room'}
//           </Text>
//           <View style={styles.statusContainer}>
//             <View
//               style={[
//                 styles.statusIndicator,
//                 item.isActive ? styles.active : styles.inactive,
//               ]}
//             />
//             <Text style={styles.statusText}>
//               {item.isActive ? 'Available' : 'Unavailable'}
//             </Text>
//           </View>
//         </View>
//         <Icon
//           name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
//           size={24}
//           color="#b48a64"
//         />
//       </TouchableOpacity>
//     );
//   };

//   // Render member-specific view
//   const renderMemberView = () => {
//     return (
//       <View style={styles.memberSection}>
//         <Text style={styles.sectionTitle}>Book {roomType.name}</Text>

//         <View style={styles.availabilityInfo}>
//           <View style={styles.availabilityHeader}>
//             <Icon
//               name={isAvailable ? "check-circle" : "error"}
//               size={24}
//               color={isAvailable ? "#28a745" : "#dc3545"}
//             />
//             <Text style={[
//               styles.availabilityText,
//               { color: isAvailable ? "#28a745" : "#dc3545" }
//             ]}>
//               {isAvailable ? 'Available for Booking' : 'Currently Not Available'}
//             </Text>
//           </View>

//           <Text style={styles.availabilityDescription}>
//             {isAvailable
//               ? 'This room type is available for booking. Click "Book Now" to proceed with your reservation.'
//               : 'This room type is not available for the default dates. You can still check availability for different dates in the booking form.'
//             }
//           </Text>
//         </View>

//         <View style={styles.bookingInfo}>
//           <Text style={styles.bookingInfoTitle}>Booking Options</Text>
//           <View style={styles.infoItem}>
//             <Icon name="person" size={16} color="#b48a64" />
//             <Text style={styles.infoText}>
//               Book for yourself at member price: {formatPrice(roomType.priceMember)}
//             </Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Icon name="person-outline" size={16} color="#b48a64" />
//             <Text style={styles.infoText}>
//               Book for guest at guest price: {formatPrice(roomType.priceGuest)}
//             </Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // Render admin view with room selection
//   const renderAdminView = () => {
//     return (
//       <View style={styles.roomsSection}>
//         <Text style={styles.sectionTitle}>Select Rooms to Reserve</Text>

//         {loadingRooms ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#b48a64" />
//             <Text style={styles.loadingText}>Loading available rooms...</Text>
//           </View>
//         ) : rooms.length > 0 ? (
//           <FlatList
//             data={rooms}
//             renderItem={renderRoomItem}
//             keyExtractor={(item) => item.id.toString()}
//             scrollEnabled={false}
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <View style={styles.noRoomsContainer}>
//             <Icon name="meeting-room" size={50} color="#ccc" />
//             <Text style={styles.noRoomsText}>No rooms available</Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
//               <Text style={styles.retryText}>Refresh</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (!isAuthenticated || !user) {
//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="#dbc9a5" />
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={24} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Authentication Required</Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <View style={styles.accessDeniedContainer}>
//           <Icon name="block" size={60} color="#ff6b6b" />
//           <Text style={styles.accessDeniedTitle}>Please Login</Text>
//           <Text style={styles.accessDeniedText}>
//             You need to be logged in to view room details.
//           </Text>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.reset({
//               index: 0,
//               routes: [{ name: 'LoginScr' }],
//             })}
//           >
//             <Text style={styles.backButtonText}>Go to Login</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="black" />
//       {/* <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{roomType.name}</Text>
//         <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
//           <Icon name="refresh" size={24} color={refreshing ? '#ccc' : '#000'} />
//         </TouchableOpacity>
//       </View> */}
//       <ImageBackground
//         source={require("../../assets/notch.jpg")}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchRow}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
//             <Icon name="arrow-back" size={28} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.notchTitle}>{roomType.name}</Text>

//           <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.iconWrapper}>
//             <Icon name="refresh" size={24} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#b48a64']}
//           />
//         }
//       >
//         {renderImages()}

//         {/* Room Features Section */}
//         {renderFeaturesSection()}

//         <View style={styles.roomTypeInfo}>
//           <Text style={styles.roomTypeName}>{roomType.name}</Text>

//           Enhanced Debug Info - Only show in development
//           {/* {__DEV__ && (
//             <View style={styles.debugSection}>
//               <Text style={styles.debugTitle}>Debug Information:</Text>
//               <Text style={styles.debugText}>Role: {userRole}</Text>
//               <Text style={styles.debugText}>Name: {userName}</Text>
//               <Text style={styles.debugText}>Membership No: {membershipNo || 'NOT FOUND'}</Text>
//               <Text style={styles.debugText}>Admin ID: {adminId || 'NOT FOUND'}</Text>
//               <Text style={styles.debugText}>User ID: {user?.id}</Text>
//               <Text style={styles.smallDebugText}>
//                 All keys: {user ? Object.keys(user).join(', ') : 'No user'}
//               </Text>
//             </View>
//           )} */}

//           <View style={styles.pricingSection}>
//             <Text style={styles.pricingTitle}>Pricing Information</Text>

//             <View style={styles.priceContainer}>
//               <View style={styles.priceRow}>
//                 <View style={styles.priceLabelContainer}>
//                   <Icon name="person" size={16} color="#666" />
//                   <Text style={styles.priceLabel}>Member Price:</Text>
//                 </View>
//                 <Text style={styles.priceValue}>
//                   {formatPrice(roomType.priceMember)}
//                 </Text>
//               </View>

//               <View style={styles.priceRow}>
//                 <View style={styles.priceLabelContainer}>
//                   <Icon name="person-outline" size={16} color="#666" />
//                   <Text style={styles.priceLabel}>Guest Price:</Text>
//                 </View>
//                 <Text style={styles.priceValue}>
//                   {formatPrice(roomType.priceGuest)}
//                 </Text>
//               </View>

//               <Text style={styles.perNightText}>per night</Text>
//             </View>
//           </View>

//           {isAdminUser() && (
//             <View style={styles.roomCount}>
//               <Icon name="meeting-room" size={16} color="#666" />
//               <Text style={styles.roomCountText}>
//                 {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
//               </Text>
//               {selectedRooms.length > 0 && (
//                 <Text style={styles.selectedCountText}>
//                   • {selectedRooms.length} selected
//                 </Text>
//               )}
//             </View>
//           )}
//         </View>

//         {/* Conditionally render member or admin view */}
//         {isMemberUser() ? renderMemberView() : renderAdminView()}

//         <View style={{ height: 100 }} />
//       </ScrollView>

//       {/* Footer Actions */}
//       {!loadingRooms && (
//         <View style={styles.footer}>
//           {isAdminUser() ? (
//             <View style={styles.adminActions}>
//               <TouchableOpacity
//                 style={[
//                   styles.actionButton,
//                   styles.reserveButton,
//                   selectedRooms.length === 0 && styles.buttonDisabled,
//                 ]}
//                 onPress={handleReserveRooms}
//                 disabled={selectedRooms.length === 0}
//               >
//                 <Text style={styles.actionButtonText}>
//                   Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <TouchableOpacity
//               style={[
//                 styles.actionButton,
//                 styles.bookButton,
//               ]}
//               onPress={handleBookNow}
//             >
//               <Text style={styles.actionButtonText}>
//                 {availabilityChecked
//                   ? (isAvailable ? 'Book Now' : 'Check Availability')
//                   : 'Book Now'
//                 }
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}

//       <BookingModal
//         visible={showBookingModal}
//         onClose={() => setShowBookingModal(false)}
//         onConfirm={handleConfirmBooking}
//         room={selectedRoom}
//         roomType={roomType}
//         navigation={navigation}
//         isMember={isMemberUser()}
//         isAvailable={isAvailable}
//       />

//       <ReservationModal
//         visible={showReservationModal}
//         onClose={() => setShowReservationModal(false)}
//         onConfirm={handleConfirmReservation}
//         selectedRooms={selectedRooms}
//       />
//     </View>
//   );
// }

// // Updated Booking Modal Component with Guest Booking
// const BookingModal = ({ visible, onClose, onConfirm, room, roomType, navigation, isMember, isAvailable }) => {
//   const [checkIn, setCheckIn] = useState(new Date());
//   const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
//   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
//   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
//   const [numberOfAdults, setNumberOfAdults] = useState('1');
//   const [numberOfChildren, setNumberOfChildren] = useState('0');
//   const [numberOfRooms, setNumberOfRooms] = useState('1');
//   const [specialRequest, setSpecialRequest] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [checkingAvailability, setCheckingAvailability] = useState(false);

//   // Guest booking fields (using existing schema fields)
//   const [isGuestBooking, setIsGuestBooking] = useState(false);
//   const [guestName, setGuestName] = useState('');
//   const [guestContact, setGuestContact] = useState('');
//   const [remarks, setRemarks] = useState('');

//   const calculateTotalPrice = () => {
//     const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
//     const price = isGuestBooking ? roomType.priceGuest : roomType.priceMember;
//     const roomsCount = parseInt(numberOfRooms) || 1;
//     return nights * price * roomsCount;
//   };

//   // Check availability for selected dates
//   const checkAvailability = async () => {
//     try {
//       setCheckingAvailability(true);
//       const fromDate = checkIn.toISOString().split('T')[0];
//       const toDate = checkOut.toISOString().split('T')[0];

//       const availabilityData = await roomService.getMemberRoomsForDate(fromDate, toDate, roomType.id);

//       if (availabilityData &&
//         (availabilityData.available === true ||
//           (Array.isArray(availabilityData) && availabilityData.length > 0) ||
//           availabilityData.message === 'Rooms are available')) {
//         Alert.alert('Available', 'Rooms are available for the selected dates!');
//       } else {
//         Alert.alert('Not Available', 'Sorry, no rooms available for the selected dates. Please try different dates.');
//       }
//     } catch (error) {
//       console.error('Error checking availability:', error);
//       Alert.alert('Error', 'Failed to check availability. Please try again.');
//     } finally {
//       setCheckingAvailability(false);
//     }
//   };

//   const handleConfirm = async () => {
//     if (!checkIn || !checkOut) {
//       Alert.alert('Error', 'Please select check-in and check-out dates');
//       return;
//     }

//     if (checkIn >= checkOut) {
//       Alert.alert('Error', 'Check-out date must be after check-in date');
//       return;
//     }

//     const adults = parseInt(numberOfAdults) || 1;
//     const children = parseInt(numberOfChildren) || 0;
//     const roomsCount = parseInt(numberOfRooms) || 1;

//     if (adults < 1) {
//       Alert.alert('Error', 'At least one adult is required');
//       return;
//     }

//     if (roomsCount < 1) {
//       Alert.alert('Error', 'At least one room is required');
//       return;
//     }

//     // Validate guest booking fields
//     if (isGuestBooking) {
//       if (!guestName || guestName.trim() === '') {
//         Alert.alert('Error', 'Please enter guest name');
//         return;
//       }
//       if (!guestContact || guestContact.trim() === '') {
//         Alert.alert('Error', 'Please enter guest contact number');
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const bookingData = {
//         checkIn: checkIn.toISOString().split('T')[0],
//         checkOut: checkOut.toISOString().split('T')[0],
//         numberOfAdults: adults,
//         numberOfChildren: children,
//         numberOfRooms: roomsCount,
//         specialRequest: specialRequest,
//         totalPrice: calculateTotalPrice(),
//         isGuestBooking: isGuestBooking,
//         guestName: guestName,
//         guestContact: guestContact,
//         remarks: remarks,
//       };

//       await onConfirm(bookingData);
//     } catch (error) {
//       console.error('Booking modal error:', error);
//       // Error is handled in parent
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>
//               {isGuestBooking ? `Book for Guest` : `Book ${roomType.name}`}
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <Icon name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalContent}>
//             {/* {isMember && (
//               <View style={styles.availabilityCheckSection}>
//                 <Text style={styles.availabilityCheckTitle}>Check Availability</Text>
//                 <TouchableOpacity
//                   style={styles.checkAvailabilityButton}
//                   onPress={checkAvailability}
//                   disabled={checkingAvailability}
//                 >
//                   {checkingAvailability ? (
//                     <ActivityIndicator size="small" color="#fff" />
//                   ) : (
//                     <>
//                       <Icon name="search" size={16} color="#fff" />
//                       <Text style={styles.checkAvailabilityText}>Check for Selected Dates</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             )} */}

//             {/* Member/Guest Booking Toggle - Only for members */}
//             {isMember && (
//               <>
//                 <View style={styles.bookingTypeContainer}>
//                   <TouchableOpacity
//                     style={[styles.bookingTypeButton, !isGuestBooking && styles.bookingTypeButtonActive]}
//                     onPress={() => setIsGuestBooking(false)}
//                   >
//                     <Text style={[styles.bookingTypeButtonText, !isGuestBooking && styles.bookingTypeButtonTextActive]}>
//                       Member Booking
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.bookingTypeButton, isGuestBooking && styles.bookingTypeButtonActive]}
//                     onPress={() => setIsGuestBooking(true)}
//                   >
//                     <Text style={[styles.bookingTypeButtonText, isGuestBooking && styles.bookingTypeButtonTextActive]}>
//                       Guest Booking
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Price Description based on selection */}
//                 <View style={styles.priceDescriptionContainer}>
//                   <Icon name="info-outline" size={16} color="#666" />
//                   <Text style={styles.priceDescriptionText}>
//                     {isGuestBooking
//                       ? `Guest price: ${roomType.priceGuest}Rs per night`
//                       : `Member price: ${roomType.priceMember}Rs per night`
//                     }
//                   </Text>
//                 </View>
//               </>
//             )}

//             {/* Guest Details Fields - Only show when guest booking is selected */}
//             {isMember && isGuestBooking && (
//               <View style={styles.guestDetailsSection}>
//                 <Text style={styles.sectionSubtitle}>Guest Information</Text>

//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>Guest Name *</Text>
//                   <TextInput
//                     style={styles.input}
//                     value={guestName}
//                     onChangeText={setGuestName}
//                     placeholder="Enter guest full name"
//                   />
//                 </View>

//                 <View style={styles.formGroup}>
//                   <Text style={styles.label}>Guest Contact Number *</Text>
//                   <TextInput
//                     style={styles.input}
//                     value={guestContact}
//                     onChangeText={setGuestContact}
//                     placeholder="Enter guest phone number"
//                     keyboardType="phone-pad"
//                   />
//                 </View>
//               </View>
//             )}

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Check-in Date</Text>
//               <TouchableOpacity
//                 style={styles.dateInput}
//                 onPress={() => setShowCheckInPicker(true)}
//               >
//                 <Icon name="calendar-today" size={20} color="#666" />
//                 <Text style={styles.dateText}>
//                   {checkIn.toLocaleDateString()}
//                 </Text>
//               </TouchableOpacity>
//               {showCheckInPicker && (
//                 <DateTimePicker
//                   value={checkIn}
//                   mode="date"
//                   display="default"
//                   onChange={(event, date) => {
//                     setShowCheckInPicker(false);
//                     if (date) setCheckIn(date);
//                   }}
//                   minimumDate={new Date()}
//                 />
//               )}
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Check-out Date</Text>
//               <TouchableOpacity
//                 style={styles.dateInput}
//                 onPress={() => setShowCheckOutPicker(true)}
//               >
//                 <Icon name="calendar-today" size={20} color="#666" />
//                 <Text style={styles.dateText}>
//                   {checkOut.toLocaleDateString()}
//                 </Text>
//               </TouchableOpacity>
//               {showCheckOutPicker && (
//                 <DateTimePicker
//                   value={checkOut}
//                   mode="date"
//                   display="default"
//                   onChange={(event, date) => {
//                     setShowCheckOutPicker(false);
//                     if (date) setCheckOut(date);
//                   }}
//                   minimumDate={new Date(checkIn.getTime() + 86400000)}
//                 />
//               )}
//             </View>

//             <View style={styles.row}>
//               <View style={styles.thirdInput}>
//                 <Text style={styles.label}>Adults</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={numberOfAdults}
//                   onChangeText={setNumberOfAdults}
//                   keyboardType="numeric"
//                 />
//               </View>
//               <View style={styles.thirdInput}>
//                 <Text style={styles.label}>Children</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={numberOfChildren}
//                   onChangeText={setNumberOfChildren}
//                   keyboardType="numeric"
//                 />
//               </View>
//               <View style={styles.thirdInput}>
//                 <Text style={styles.label}>Rooms</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={numberOfRooms}
//                   onChangeText={setNumberOfRooms}
//                   keyboardType="numeric"
//                 />
//               </View>
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Special Request (Optional)</Text>
//               <TextInput
//                 style={styles.textArea}
//                 value={specialRequest}
//                 onChangeText={setSpecialRequest}
//                 placeholder="Any special requirements..."
//                 multiline
//                 numberOfLines={3}
//               />
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Remarks (Optional)</Text>
//               <TextInput
//                 style={styles.textArea}
//                 value={remarks}
//                 onChangeText={setRemarks}
//                 placeholder="Any additional remarks..."
//                 multiline
//                 numberOfLines={2}
//               />
//             </View>

//             <View style={styles.priceSummary}>
//               <View>
//                 <Text style={styles.priceLabel}>Total Amount:</Text>
//                 <Text style={styles.priceSubtitle}>
//                   {isGuestBooking ? 'Guest Price' : 'Member Price'}
//                 </Text>
//               </View>
//               <View style={styles.priceValueContainer}>
//                 <Text style={styles.priceValue}>
//                   {calculateTotalPrice().toFixed(2)}Rs
//                 </Text>
//                 <Text style={styles.priceBreakdown}>
//                   {parseInt(numberOfRooms) || 1} room(s) × {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} night(s) × {isGuestBooking ? roomType.priceGuest : roomType.priceMember}Rs
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.infoBox}>
//               <Icon name="info" size={16} color="#b48a64" />
//               <Text style={styles.infoText}>
//                 {isGuestBooking
//                   ? `Booking ${numberOfRooms} room(s) for your guest. The guest will need to provide ID at check-in.`
//                   : `Booking ${numberOfRooms} room(s) of ${roomType.name}. Rooms will be automatically assigned based on availability.`
//                 }
//               </Text>
//             </View>
//           </ScrollView>

//           <View style={styles.modalFooter}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={onClose}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.confirmButton, loading && styles.buttonDisabled]}
//               onPress={handleConfirm}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.confirmButtonText}>
//                   {isGuestBooking ? 'Book for Guest' : 'Confirm Booking'}
//                 </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // Reservation Modal Component (unchanged)
// const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms }) => {
//   const [reserveFrom, setReserveFrom] = useState(new Date());
//   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleConfirm = async () => {
//     if (!reserveFrom || !reserveTo) {
//       Alert.alert('Error', 'Please select reservation dates');
//       return;
//     }

//     if (reserveFrom >= reserveTo) {
//       Alert.alert('Error', 'Reservation end date must be after start date');
//       return;
//     }

//     setLoading(true);
//     try {
//       const reservationData = {
//         reserveFrom: reserveFrom.toISOString().split('T')[0],
//         reserveTo: reserveTo.toISOString().split('T')[0],
//       };

//       await onConfirm(reservationData);
//     } catch (error) {
//       console.error('Reservation error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>
//               Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <Icon name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalContent}>
//             <Text style={styles.reservationInfo}>
//               You are about to reserve the following rooms:
//             </Text>

//             <View style={styles.roomsList}>
//               {selectedRooms.map(room => (
//                 <Text key={room.id} style={styles.roomItemText}>
//                   • Room {room.roomNumber}
//                 </Text>
//               ))}
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Reserve From</Text>
//               <TouchableOpacity
//                 style={styles.dateInput}
//                 onPress={() => setShowFromPicker(true)}
//               >
//                 <Icon name="calendar-today" size={20} color="#666" />
//                 <Text style={styles.dateText}>
//                   {reserveFrom.toLocaleDateString()}
//                 </Text>
//               </TouchableOpacity>
//               {showFromPicker && (
//                 <DateTimePicker
//                   value={reserveFrom}
//                   mode="date"
//                   display="default"
//                   onChange={(event, date) => {
//                     setShowFromPicker(false);
//                     if (date) setReserveFrom(date);
//                   }}
//                 />
//               )}
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>Reserve To</Text>
//               <TouchableOpacity
//                 style={styles.dateInput}
//                 onPress={() => setShowToPicker(true)}
//               >
//                 <Icon name="calendar-today" size={20} color="#666" />
//                 <Text style={styles.dateText}>
//                   {reserveTo.toLocaleDateString()}
//                 </Text>
//               </TouchableOpacity>
//               {showToPicker && (
//                 <DateTimePicker
//                   value={reserveTo}
//                   mode="date"
//                   display="default"
//                   onChange={(event, date) => {
//                     setShowToPicker(false);
//                     if (date) setReserveTo(date);
//                   }}
//                 />
//               )}
//             </View>
//           </ScrollView>

//           <View style={styles.modalFooter}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={onClose}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.confirmButton, loading && styles.buttonDisabled]}
//               onPress={handleConfirm}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#FEF9F3' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#dbc9a5',
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     paddingTop: 40,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   content: { flex: 1 },
//   imageSection: {
//     position: 'relative',
//   },
//   mainImage: {
//     width: '100%',
//     height: 250,
//   },
//   imageIndicators: {
//     position: 'absolute',
//     bottom: 10,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   imageIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'rgba(255,255,255,0.5)',
//     marginHorizontal: 4,
//   },
//   imageIndicatorActive: {
//     backgroundColor: '#fff',
//     width: 20,
//   },
//   notch: {
//     paddingTop: 50,
//     paddingBottom: 25,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     overflow: "hidden",
//     backgroundColor: "#D2B48C",
//   },
//   notchImage: {
//     resizeMode: "cover",
//   },
//   notchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingBottom: 10,
//   },
//   iconWrapper: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   notchTitle: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#000",
//   },
//   noImageContainer: {
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   sliderContainer: {
//     height: 200,
//     width: 390,
//     alignSelf: "center",
//     marginTop: 20,
//     borderRadius: 15,
//     overflow: "hidden",
//     backgroundColor: "#fff",
//     elevation: 8,
//   },
//   sliderImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   noImageContainer: {
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   noImageText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 16,
//   },
//   noImageText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 16,
//   },
//   roomTypeInfo: {
//     padding: 20,
//   },
//   roomTypeName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   debugSection: {
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#6c757d',
//   },
//   debugTitle: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#6c757d',
//     marginBottom: 5,
//   },
//   debugText: {
//     fontSize: 10,
//     color: '#6c757d',
//     marginBottom: 2,
//   },
//   smallDebugText: {
//     fontSize: 8,
//     color: '#6c757d',
//     fontStyle: 'italic',
//   },
//   pricingSection: {
//     marginBottom: 15,
//   },
//   pricingTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   priceContainer: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   priceLabelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   priceValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },
//   perNightText: {
//     fontSize: 12,
//     color: '#888',
//     textAlign: 'right',
//     marginTop: 5,
//   },
//   roomCount: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   roomCountText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   selectedCountText: {
//     fontSize: 14,
//     color: '#b48a64',
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },

//   // Member Section Styles
//   memberSection: {
//     padding: 20,
//     paddingTop: 0,
//   },
//   availabilityInfo: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     marginBottom: 15,
//   },
//   availabilityHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   availabilityText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   availabilityDescription: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
//   bookingInfo: {
//     backgroundColor: '#f8f9fa',
//     padding: 15,
//     borderRadius: 10,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//   },
//   bookingInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//     lineHeight: 18,
//   },

//   // Rooms Section (Admin)
//   roomsSection: {
//     padding: 20,
//     paddingTop: 0,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//   },
//   loadingContainer: {
//     padding: 40,
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//   },
//   roomItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   roomItemSelected: {
//     borderColor: '#b48a64',
//     backgroundColor: '#fdf6f0',
//   },
//   roomInfo: {
//     flex: 1,
//   },
//   roomNumber: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   roomDescription: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 6,
//   },
//   active: {
//     backgroundColor: '#28a745',
//   },
//   inactive: {
//     backgroundColor: '#dc3545',
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   noRoomsContainer: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   noRoomsText: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 10,
//     marginBottom: 20,
//   },
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
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#e9ecef',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   adminActions: {
//     flexDirection: 'row',
//   },
//   actionButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   bookButton: {
//     backgroundColor: '#b48a64',
//   },
//   reserveButton: {
//     backgroundColor: '#28a745',
//   },
//   buttonDisabled: {
//     backgroundColor: '#ccc',
//     opacity: 0.6,
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   accessDeniedContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   accessDeniedTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   accessDeniedText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 22,
//   },
//   backButton: {
//     backgroundColor: '#b48a64',
//     paddingHorizontal: 25,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   backButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: '#FEF9F3',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FEF9F3',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '90%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modalContent: {
//     padding: 20,
//   },
//   availabilityCheckSection: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#f0f7ff',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//   },
//   availabilityCheckTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   checkAvailabilityButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#b48a64',
//     padding: 12,
//     borderRadius: 8,
//   },
//   checkAvailabilityText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },

//   // Guest Booking Toggle
//   guestBookingToggle: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   toggleLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   toggleDescription: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 18,
//   },

//   // Guest Details Section
//   guestDetailsSection: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#f0f7ff',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#d0e7ff',
//   },
//   sectionSubtitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#1565c0',
//     marginBottom: 10,
//   },

//   formGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   dateInput: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#f9f9f9',
//   },
//   dateText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: '#333',
//   },
//   row: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   thirdInput: {
//     flex: 1,
//   },
//   halfInput: {
//     flex: 1,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     backgroundColor: '#f9f9f9',
//   },
//   textArea: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     backgroundColor: '#f9f9f9',
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   priceSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     padding: 15,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   priceLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   priceSubtitle: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   priceValueContainer: {
//     alignItems: 'flex-end',
//   },
//   priceValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#b48a64',
//   },
//   priceBreakdown: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//     textAlign: 'right',
//   },
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#f0f7ff',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#b48a64',
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#1565c0',
//     marginLeft: 8,
//     lineHeight: 16,
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 10,
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#e9ecef',
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#b48a64',
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//   },
//   cancelButtonText: {
//     color: '#b48a64',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   confirmButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     backgroundColor: '#b48a64',
//   },
//   confirmButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   reservationInfo: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 15,
//     lineHeight: 20,
//   },
//   roomsList: {
//     backgroundColor: '#f8f9fa',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   roomItemText: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 5,
//   },

//   // Room Features Section Styles
//   featuresSection: {
//     backgroundColor: '#fff',
//     marginHorizontal: 15,
//     marginTop: 15,
//     borderRadius: 15,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//   },
//   featuresSectionTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#b48a64',
//     marginBottom: 10,
//   },
//   featuresDescription: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 15,
//     fontWeight: '500',
//   },
//   featuresList: {
//     marginTop: 5,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   featureBullet: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#b48a64',
//     marginRight: 12,
//   },
//   featureItemText: {
//     fontSize: 15,
//     color: '#333',
//     flex: 1,
//   },
//   bookingTypeContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#333333',
//     borderRadius: 25,
//     padding: 4,
//     marginBottom: 20,
//     marginHorizontal: 10,
//   },
//   bookingTypeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 21,
//   },
//   bookingTypeButtonActive: {
//     backgroundColor: '#b48a64',
//   },
//   bookingTypeButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
//   bookingTypeButtonTextActive: {
//     color: '#FFFFFF',
//   },
//   priceDescriptionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 15,
//   },
//   priceDescriptionText: {
//     fontSize: 13,
//     color: '#666',
//     marginLeft: 8,
//     fontStyle: 'italic',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  StatusBar,
  Image,
  Dimensions,
  Modal,
  TextInput,
  RefreshControl,
  Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';
import { ImageBackground } from 'react-native';
import Swiper from "react-native-swiper";

const { width: screenWidth } = Dimensions.get('window');

export default function details({ navigation, route }) {
  const { user, isAuthenticated } = useAuth();

  console.log('🚀 RoomDetails - User object:', JSON.stringify(user, null, 2));
  console.log('🚀 RoomDetails - isAuthenticated:', isAuthenticated);

  const userRole = user?.role;
  const userName = user?.name;
  const membershipNo = user?.membershipNo || user?.membership_no || user?.Membership_No || user?.id;
  const adminId = user?.adminId || user?.adminID || user?.admin_id || user?.id;

  console.log('🔍 Extracted values:', {
    userRole,
    userName,
    membershipNo,
    adminId,
    allUserKeys: user ? Object.keys(user) : 'No user'
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomType, setRoomType] = useState(route.params?.roomType);
  const [imageIndex, setImageIndex] = useState(0);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showUnreserveModal, setShowUnreserveModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    console.log('🎯 useEffect triggered - Auth status:', isAuthenticated);

    if (!isAuthenticated || !user) {
      Alert.alert(
        'Authentication Required',
        'Please login to access room details.',
        [{ text: 'OK', onPress: () => navigation.navigate('LoginScr') }]
      );
      return;
    }

    // For members, check availability immediately
    if (isMemberUser()) {
      checkRoomTypeAvailability();
    } else {
      fetchRooms();
    }
  }, [isAuthenticated, user]);

  const isAdminUser = () => {
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    console.log('👮 isAdminUser check:', { userRole, isAdmin });
    return isAdmin;
  };

  const isMemberUser = () => {
    const isMember = userRole === 'MEMBER';
    console.log('👤 isMemberUser check:', { userRole, isMember });
    return isMember;
  };

  // Check room type availability for members
  const checkRoomTypeAvailability = async () => {
    try {
      setLoadingRooms(true);
      console.log('🔍 Checking availability for room type:', roomType.id);

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const availabilityData = await roomService.getMemberRoomsForDate(today, tomorrow, roomType.id);

      console.log("✅ Availability check result:", availabilityData);

      if (availabilityData &&
        (availabilityData.available === true ||
          (Array.isArray(availabilityData) && availabilityData.length > 0) ||
          availabilityData.message === 'Rooms are available')) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        Alert.alert(
          'Not Available',
          'Sorry, this room type is not available for the selected dates. Please try different dates or contact support.'
        );
      }

      setAvailabilityChecked(true);
    } catch (error) {
      console.error('❌ Error checking availability:', error);
      setIsAvailable(false);
      Alert.alert(
        'Availability Check Failed',
        'Unable to check room availability. Please try again.'
      );
    } finally {
      setLoadingRooms(false);
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      console.log('🔄 Fetching rooms for roomType:', roomType.id);
      console.log('👤 Current user role:', userRole);

      const roomData = await roomService.getAvailableRooms(roomType.id, userRole);

      console.log("✅ Fetched available rooms:", roomData);
      setRooms(roomData);
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);

      if (error.response?.status === 403) {
        Alert.alert(
          'Access Denied',
          'You do not have permission to view available rooms. Please contact administrator.'
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'Please login again to continue.'
        );
        navigation.navigate('LoginScr');
      } else {
        Alert.alert('Error', 'Failed to load available rooms. Please try again.');
      }
    } finally {
      setLoadingRooms(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRoomSelect = (room) => {
    console.log('🛏️ Room selected:', room.roomNumber);
    if (isAdminUser()) {
      if (selectedRooms.find(r => r.id === room.id)) {
        setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
      } else {
        setSelectedRooms([...selectedRooms, room]);
      }
    } else {
      setSelectedRoom(room);
    }
  };

  const handleBookNow = () => {
    console.log('📖 Book Now clicked');
    console.log('👤 User object:', JSON.stringify(user, null, 2));
    console.log('📊 User status:', user?.status, user?.Status, user?.memberStatus);

    // Check if member is deactivated - handle multiple possible field names and casing
    const userStatus = user?.status || user?.Status || user?.memberStatus || '';
    if (userStatus.toUpperCase() === 'DEACTIVATED') {
      Alert.alert(
        'Account Deactivated',
        'You cannot book room. Please contact PSC for assistance.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isMemberUser()) {
      setShowBookingModal(true);
    } else {
      if (!selectedRoom) {
        Alert.alert('Please Select', 'Please select a room to continue');
        return;
      }
      setShowBookingModal(true);
    }
  };

  const handleReserveRooms = () => {
    console.log('🔒 Reserve Rooms clicked');
    if (selectedRooms.length === 0) {
      Alert.alert('Please Select', 'Please select at least one room to reserve');
      return;
    }
    setShowReservationModal(true);
  };

  const handleUnreserveRooms = () => {
    console.log('🔓 Unreserve Rooms clicked');
    if (selectedRooms.length === 0) {
      Alert.alert('Please Select', 'Please select at least one room to unreserve');
      return;
    }
    setShowUnreserveModal(true);
  };

  const handleConfirmBooking = async (bookingData) => {
    try {
      console.log('🎫 Starting booking process...');

      // Check if member is deactivated - prevent booking even if modal was opened
      const userStatus = user?.status || user?.Status || user?.memberStatus || '';
      if (userStatus.toUpperCase() === 'DEACTIVATED') {
        Alert.alert(
          'Account Deactivated',
          'You cannot book room. Please contact PSC for assistance.',
          [{ text: 'OK' }]
        );
        setShowBookingModal(false);
        return;
      }

      const possibleMembershipNo = membershipNo || user?.id;

      if (!possibleMembershipNo) {
        Alert.alert(
          'Membership Number Required',
          `We couldn't find your membership number.`,
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Using membership number:', possibleMembershipNo);

      // Prepare payload according to backend expectations
      const payload = {
        membership_no: possibleMembershipNo, // Send membership_no at root level
        from: bookingData.checkIn,
        to: bookingData.checkOut,
        numberOfRooms: bookingData.numberOfRooms || 1,
        numberOfAdults: bookingData.numberOfAdults || 1,
        numberOfChildren: bookingData.numberOfChildren || 0,
        pricingType: bookingData.isGuestBooking ? 'guest' : 'member',
        specialRequest: bookingData.specialRequest || '',
        // Note: Don't send totalPrice - backend calculates it
        // Note: Don't send selectedRoomIds - backend selects available rooms
        // Note: Don't send roomTypeId - it's in the query parameter
        // Guest booking fields
        guestName: bookingData.isGuestBooking ? bookingData.guestName : '',
        guestContact: bookingData.isGuestBooking ? bookingData.guestContact : '',
        remarks: bookingData.remarks || '',
      };

      console.log('📦 Final booking payload:', JSON.stringify(payload, null, 2));

      // Call the booking service with roomType as query parameter
      const result = await bookingService.memberBookingRoom(roomType.id, payload);
      console.log('✅ Booking response received:', result);

      // Extract booking information from response
      let bookingId;
      let numericBookingId = null;
      let invoiceNumber = null;

      if (result.Data?.InvoiceNumber) {
        invoiceNumber = result.Data.InvoiceNumber;
        bookingId = invoiceNumber; // Use invoice number as booking ID
      } else if (result.Data?.BookingId) {
        bookingId = result.Data.BookingId;
        numericBookingId = result.Data.BookingId;
      } else if (result.bookings && Array.isArray(result.bookings) && result.bookings.length > 0) {
        bookingId = result.bookings[0].id;
        numericBookingId = result.bookings[0].id;
      } else if (result.id) {
        bookingId = result.id;
        numericBookingId = result.id;
      } else if (result.bookingId) {
        bookingId = result.bookingId;
        numericBookingId = result.bookingId;
      } else {
        bookingId = `temp-${Date.now()}`;
      }

      console.log('✅ Booking successful! Response:', result);

      // Extract room information from response if available
      let selectedRoomsInfo = [];
      if (result.Data?.BookingSummary?.SelectedRooms) {
        selectedRoomsInfo = result.Data.BookingSummary.SelectedRooms;
      } else if (result.TemporaryData?.roomIds) {
        // You might need to fetch room details if only IDs are provided
        selectedRoomsInfo = result.TemporaryData.roomIds.map(id => ({ id }));
      }

      // Navigate to voucher screen with all necessary data
      navigation.navigate('voucher', {
        bookingId: bookingId,
        numericBookingId: numericBookingId,
        invoiceNumber: invoiceNumber,
        bookingData: {
          ...bookingData,
          // Use backend calculated total price if available
          totalPrice: result.Data?.Amount || result.Data?.totalPrice || bookingData.totalPrice,
          numberOfAdults: bookingData.numberOfAdults || 1,
          numberOfChildren: bookingData.numberOfChildren || 0,
          numberOfRooms: bookingData.numberOfRooms || 1,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          specialRequest: bookingData.specialRequest || '',
          isGuestBooking: bookingData.isGuestBooking || false,
          guestName: bookingData.guestName || '',
        },
        roomType: roomType,
        selectedRooms: selectedRoomsInfo,
        bookingResponse: result,
        invoiceData: result.Data || result // Pass invoice data directly
      });

    } catch (error) {
      console.error('💥 Booking error in component:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data
      });

      let errorMessage = error.message || 'Failed to book room. Please try again.';

      // Extract error message from backend response if available
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.ResponseMessage) {
        errorMessage = error.response.data.ResponseMessage;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Handle specific HTTP status codes
      if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response?.status === 409) {
        errorMessage = errorMessage || 'Room not available for selected dates. Please choose different dates.';
      } else if (error.response?.status === 400) {
        errorMessage = errorMessage || 'Invalid booking data. Please check your information and try again.';
      } else if (error.response?.status === 500) {
        errorMessage = errorMessage || 'Server error. Please try again later.';
        // Log server errors for debugging
        console.error('Server error details:', error.response?.data);
      }

      Alert.alert('Booking Failed', errorMessage, [{ text: 'OK' }]);
    }
  };

  // const handleConfirmReservation = async (reservationData) => {
  //   try {
  //     console.log('🔐 Starting reservation process...');
  //     console.log('   - User role:', userRole);

  //     const roomIds = selectedRooms.map(room => room.id);
  //     const payload = {
  //       roomIds: roomIds,
  //       reserve: true,
  //       reserveFrom: reservationData.reserveFrom,
  //       reserveTo: reservationData.reserveTo,
  //     };

  //     console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
  //     console.log('👤 Admin ID will come from JWT token');

  //     await roomService.reserveRooms(payload);

  //     Alert.alert(
  //       'Reservation Successful!',
  //       `${selectedRooms.length} room(s) have been reserved successfully.`,
  //       [{
  //         text: 'OK',
  //         onPress: () => {
  //           setShowReservationModal(false);
  //           setSelectedRooms([]);
  //           fetchRooms();
  //         }
  //       }]
  //     );
  //   } catch (error) {
  //     console.error('💥 Reservation error:', error);
  //     Alert.alert(
  //       'Reservation Failed',
  //       error.message || 'Failed to reserve rooms. Please try again.'
  //     );
  //   }
  // };

  const handleConfirmReservation = async (reservationData) => {
    try {
      console.log('🔐 Starting reservation process...');
      console.log('   - User role:', userRole);

      const roomIds = selectedRooms.map(room => room.id);
      const payload = {
        roomIds: roomIds,
        reserve: true,
        reserveFrom: reservationData.reserveFrom,
        reserveTo: reservationData.reserveTo,
        remarks: reservationData.remarks, // Added remarks
      };

      console.log('📦 Final reservation payload:', JSON.stringify(payload, null, 2));
      console.log('👤 Admin ID will come from JWT token');

      await roomService.reserveRooms(payload);

      Alert.alert(
        'Reservation Successful!',
        `${selectedRooms.length} room(s) have been reserved successfully.`,
        [{
          text: 'OK',
          onPress: () => {
            setShowReservationModal(false);
            setSelectedRooms([]);
            fetchRooms();
          }
        }]
      );
    } catch (error) {
      console.error('💥 Reservation error:', error);
      Alert.alert(
        'Reservation Failed',
        error.message || 'Failed to reserve rooms. Please try again.'
      );
    }
  };

  const handleConfirmUnreserve = async (unreserveData) => {
    try {
      console.log('🔓 Starting unreservation process...');
      console.log('   - User role:', userRole);

      const roomIds = selectedRooms.map(room => room.id);
      const payload = {
        roomIds: roomIds,
        reserve: false,
        reserveFrom: unreserveData.reserveFrom,
        reserveTo: unreserveData.reserveTo,
        remarks: unreserveData.remarks, // Added remarks
      };

      console.log('📦 Final unreservation payload:', JSON.stringify(payload, null, 2));

      await roomService.reserveRooms(payload);

      Alert.alert(
        'Unreservation Successful!',
        `${selectedRooms.length} room(s) have been unreserved successfully.`,
        [{
          text: 'OK',
          onPress: () => {
            setShowUnreserveModal(false);
            setSelectedRooms([]);
            fetchRooms();
          }
        }]
      );
    } catch (error) {
      console.error('💥 Unreservation error:', error);
      Alert.alert(
        'Unreservation Failed',
        error.message || 'Failed to unreserve rooms. Please try again.'
      );
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    if (isMemberUser()) {
      checkRoomTypeAvailability();
    } else {
      fetchRooms();
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    return `${parseFloat(price).toFixed(0)}Rs`;
  };

  // Room-specific features data
  const roomFeatures = {
    'Suite': {
      description: 'Suite room comprise of:',
      features: [
        'Two rooms',
        'Double bed',
        'TV lounge',
        'Sofa set',
        'Refrigerator',
        'Side table',
        'Dining table',
        'Washroom with toiletries',
      ],
    },
    'Deluxe': {
      description: 'Deluxe room comprise of:',
      features: [
        'Single room',
        'Double bed',
        'TV',
        'Sofa set',
        'Refrigerator',
        'Side table',
        'Dining Table',
        'Washroom with toiletries',
      ],
    },
    'Studio': {
      description: 'Studio room comprise of:',
      features: [
        'Single room',
        'Two single beds',
        'TV',
        'Sofa set',
        'Refrigerator',
        'Side table',
        'Dining Table',
        'Washroom with toiletries',
      ],
    },
  };

  // Get features for current room type
  const getRoomFeatures = () => {
    const roomTypeName = roomType.name;
    // Check if room type name contains any of the keys
    for (const key of Object.keys(roomFeatures)) {
      if (roomTypeName.toLowerCase().includes(key.toLowerCase())) {
        return roomFeatures[key];
      }
    }
    return null;
  };

  // Render features section
  const renderFeaturesSection = () => {
    const features = getRoomFeatures();
    if (!features) return null;

    return (
      <View style={styles.featuresSection}>
        <Text style={styles.featuresSectionTitle}>Features</Text>
        <Text style={styles.featuresDescription}>{features.description}</Text>
        <View style={styles.featuresList}>
          {features.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureBullet} />
              <Text style={styles.featureItemText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderImages = () => {
    const images = roomType.images || [];

    if (images.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Icon name="image" size={60} color="#ccc" />
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      );
    }

    return (
      <View style={styles.sliderContainer}>
        <Swiper
          autoplay
          autoplayTimeout={4}
          loop
          showsPagination
          activeDotColor="#A3834C"
        >
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.url }}
              style={styles.sliderImage}
            />
          ))}
        </Swiper>
      </View>
    );
  };

  const renderRoomItem = ({ item }) => {
    const isSelected = isAdminUser()
      ? selectedRooms.find(r => r.id === item.id)
      : selectedRoom?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.roomItem,
          isSelected && styles.roomItemSelected,
        ]}
        onPress={() => handleRoomSelect(item)}
      >
        <View style={styles.roomInfo}>
          <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
          <Text style={styles.roomDescription}>
            {item.description || 'Comfortable and well-equipped room'}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                item.isActive ? styles.active : styles.inactive,
              ]}
            />
            <Text style={styles.statusText}>
              {item.isActive ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        <Icon
          name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color="#b48a64"
        />
      </TouchableOpacity>
    );
  };

  // Render member-specific view
  const renderMemberView = () => {
    return (
      <View style={styles.memberSection}>
        <Text style={styles.sectionTitle}>Book {roomType.name}</Text>

        <View style={styles.availabilityInfo}>
          <View style={styles.availabilityHeader}>
            <Icon
              name={isAvailable ? "check-circle" : "error"}
              size={24}
              color={isAvailable ? "#28a745" : "#dc3545"}
            />
            <Text style={[
              styles.availabilityText,
              { color: isAvailable ? "#28a745" : "#dc3545" }
            ]}>
              {isAvailable ? 'Available for Booking' : 'Currently Not Available'}
            </Text>
          </View>

          <Text style={styles.availabilityDescription}>
            {isAvailable
              ? 'This room type is available for booking. Click "Book Now" to proceed with your reservation.'
              : 'This room type is not available for the default dates. You can still check availability for different dates in the booking form.'
            }
          </Text>
        </View>

        {/* <View style={styles.bookingInfo}>
          <Text style={styles.bookingInfoTitle}>Booking Options</Text>
          <View style={styles.infoItem}>
            <Icon name="person" size={16} color="#b48a64" />
            <Text style={styles.infoText}>
              Book for yourself at member price: {formatPrice(roomType.priceMember)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="person-outline" size={16} color="#b48a64" />
            <Text style={styles.infoText}>
              Book for guest at guest price: {formatPrice(roomType.priceGuest)}
            </Text>
          </View>
        </View> */}
      </View>
    );
  };

  // Render admin view with room selection
  const renderAdminView = () => {
    return (
      <View style={styles.roomsSection}>
        <Text style={styles.sectionTitle}>Select Rooms to Reserve/Unreserve</Text>

        {loadingRooms ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#b48a64" />
            <Text style={styles.loadingText}>Loading available rooms...</Text>
          </View>
        ) : rooms.length > 0 ? (
          <FlatList
            data={rooms}
            renderItem={renderRoomItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noRoomsContainer}>
            <Icon name="meeting-room" size={50} color="#ccc" />
            <Text style={styles.noRoomsText}>No rooms available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Authentication Required</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.accessDeniedContainer}>
          <Icon name="block" size={60} color="#ff6b6b" />
          <Text style={styles.accessDeniedTitle}>Please Login</Text>
          <Text style={styles.accessDeniedText}>
            You need to be logged in to view room details.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('LoginScr')}
          >
            <Text style={styles.backButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <ImageBackground
        source={require("../../assets/notch.jpg")}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconWrapper}>
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.notchTitle}>{roomType.name}</Text>

          <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.iconWrapper}>
            <Icon name="refresh" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#b48a64']}
          />
        }
      >
        {renderImages()}

        {/* Room Features Section */}
        {renderFeaturesSection()}

        <View style={styles.roomTypeInfo}>
          {/* <Text style={styles.roomTypeName}>{roomType.name}</Text> */}

          {/* Enhanced Debug Info - Only show in development */}
          {/* {__DEV__ && (
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>Debug Information:</Text>
              <Text style={styles.debugText}>Role: {userRole}</Text>
              <Text style={styles.debugText}>Name: {userName}</Text>
              <Text style={styles.debugText}>Membership No: {membershipNo || 'NOT FOUND'}</Text>
              <Text style={styles.debugText}>Admin ID: {adminId || 'NOT FOUND'}</Text>
              <Text style={styles.debugText}>User ID: {user?.id}</Text>
              <Text style={styles.smallDebugText}>
                All keys: {user ? Object.keys(user).join(', ') : 'No user'}
              </Text>
            </View>
          )} */}

          {/* <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Pricing Information</Text>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <View style={styles.priceLabelContainer}>
                  <Icon name="person" size={16} color="#666" />
                  <Text style={styles.priceLabel}>Member Price:</Text>
                </View>
                <Text style={styles.priceValue}>
                  {formatPrice(roomType.priceMember)}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceLabelContainer}>
                  <Icon name="person-outline" size={16} color="#666" />
                  <Text style={styles.priceLabel}>Guest Price:</Text>
                </View>
                <Text style={styles.priceValue}>
                  {formatPrice(roomType.priceGuest)}
                </Text>
              </View>

              <Text style={styles.perNightText}>per night</Text>
            </View>
          </View> */}

          {isAdminUser() && (
            <View style={styles.roomCount}>
              <Icon name="meeting-room" size={16} color="#666" />
              <Text style={styles.roomCountText}>
                {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
              </Text>
              {selectedRooms.length > 0 && (
                <Text style={styles.selectedCountText}>
                  • {selectedRooms.length} selected
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Conditionally render member or admin view */}
        {isMemberUser() ? renderMemberView() : renderAdminView()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      {!loadingRooms && (
        <View style={styles.footer}>
          {isAdminUser() ? (
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.reserveButton,
                  selectedRooms.length === 0 && styles.buttonDisabled,
                ]}
                onPress={handleReserveRooms}
                disabled={selectedRooms.length === 0}
              >
                <Text style={styles.actionButtonText}>
                  Reserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.unreserveButton,
                  selectedRooms.length === 0 && styles.buttonDisabled,
                ]}
                onPress={handleUnreserveRooms}
                disabled={selectedRooms.length === 0}
              >
                <Text style={styles.actionButtonText}>
                  Unreserve {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.bookButton,
              ]}
              onPress={handleBookNow}
            >
              <Text style={styles.actionButtonText}>
                {availabilityChecked
                  ? (isAvailable ? 'Book Now' : 'Check Availability')
                  : 'Book Now'
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        room={selectedRoom}
        roomType={roomType}
        navigation={navigation}
        isMember={isMemberUser()}
        isAvailable={isAvailable}
      />

      <ReservationModal
        visible={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onConfirm={handleConfirmReservation}
        selectedRooms={selectedRooms}
        isReserve={true}
      />

      <ReservationModal
        visible={showUnreserveModal}
        onClose={() => setShowUnreserveModal(false)}
        onConfirm={handleConfirmUnreserve}
        selectedRooms={selectedRooms}
        isReserve={false}
      />
    </View>
  );
}

// Updated Booking Modal Component with Guest Booking DEFAULTED TO TRUE
const BookingModal = ({ visible, onClose, onConfirm, room, roomType, navigation, isMember, isAvailable }) => {
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [numberOfAdults, setNumberOfAdults] = useState('1');
  const [numberOfChildren, setNumberOfChildren] = useState('0');
  const [numberOfRooms, setNumberOfRooms] = useState('1');
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Guest booking fields (using existing schema fields) - DEFAULT TO TRUE
  const [isGuestBooking, setIsGuestBooking] = useState(true); // Changed from false to true
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [remarks, setRemarks] = useState('');

  const calculateTotalPrice = () => {
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const price = isGuestBooking ? roomType.priceGuest : roomType.priceMember;
    const roomsCount = parseInt(numberOfRooms) || 1;
    return nights * price * roomsCount;
  };

  // Check availability for selected dates
  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      const fromDate = checkIn.toISOString().split('T')[0];
      const toDate = checkOut.toISOString().split('T')[0];

      const availabilityData = await roomService.getMemberRoomsForDate(fromDate, toDate, roomType.id);

      if (availabilityData &&
        (availabilityData.available === true ||
          (Array.isArray(availabilityData) && availabilityData.length > 0) ||
          availabilityData.message === 'Rooms are available')) {
        Alert.alert('Available', 'Rooms are available for the selected dates!');
      } else {
        Alert.alert('Not Available', 'Sorry, no rooms available for the selected dates. Please try different dates.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      Alert.alert('Error', 'Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleConfirm = async () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Error', 'Please select check-in and check-out dates');
      return;
    }

    if (checkIn >= checkOut) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    const adults = parseInt(numberOfAdults) || 1;
    const children = parseInt(numberOfChildren) || 0;
    const roomsCount = parseInt(numberOfRooms) || 1;

    if (adults < 1) {
      Alert.alert('Error', 'At least one adult is required');
      return;
    }

    if (roomsCount < 1) {
      Alert.alert('Error', 'At least one room is required');
      return;
    }

    // Validate guest booking fields
    if (isGuestBooking) {
      if (!guestName || guestName.trim() === '') {
        Alert.alert('Error', 'Please enter guest name');
        return;
      }
      if (!guestContact || guestContact.trim() === '') {
        Alert.alert('Error', 'Please enter guest contact number');
        return;
      }
    }

    setLoading(true);
    try {
      const bookingData = {
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        numberOfAdults: adults,
        numberOfChildren: children,
        numberOfRooms: roomsCount,
        specialRequest: specialRequest,
        totalPrice: calculateTotalPrice(),
        isGuestBooking: isGuestBooking,
        guestName: guestName,
        guestContact: guestContact,
        remarks: remarks,
      };

      await onConfirm(bookingData);
    } catch (error) {
      console.error('Booking modal error:', error);
      // Error is handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isGuestBooking ? `Book for Guest` : `Book ${roomType.name}`}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Guest Booking Toggle - Only for members */}
            {isMember && (
              <View style={styles.guestBookingToggle}>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>
                    {isGuestBooking ? 'Booking for Guest' : 'Booking for Self'}
                  </Text>
                  <Switch
                    value={isGuestBooking}
                    onValueChange={setIsGuestBooking}
                    trackColor={{ false: '#ddd', true: '#b48a64' }}
                    thumbColor={isGuestBooking ? '#fff' : '#f4f3f4'}
                  />
                </View>
                <Text style={styles.toggleDescription}>
                  {isGuestBooking
                    ? `You're booking for a guest. Guest price: ${roomType.priceGuest}Rs per night`
                    : `You're booking for yourself. Member price: ${roomType.priceMember}Rs per night`
                  }
                </Text>
              </View>
            )}

            {/* Guest Details Fields - Only show when guest booking is selected */}
            {isMember && isGuestBooking && (
              <View style={styles.guestDetailsSection}>
                <Text style={styles.sectionSubtitle}>Guest Information</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Guest Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={guestName}
                    onChangeText={setGuestName}
                    placeholder="Enter guest full name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Guest Contact Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={guestContact}
                    onChangeText={setGuestContact}
                    placeholder="Enter guest phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Check-in Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowCheckInPicker(true)}
              >
                <Icon name="calendar-today" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {checkIn.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkIn}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowCheckInPicker(false);
                    if (date) setCheckIn(date);
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Check-out Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Icon name="calendar-today" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {checkOut.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOut}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowCheckOutPicker(false);
                    if (date) setCheckOut(date);
                  }}
                  minimumDate={new Date(checkIn.getTime() + 86400000)}
                />
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.thirdInput}>
                <Text style={styles.label}>Adults</Text>
                <TextInput
                  style={styles.input}
                  value={numberOfAdults}
                  onChangeText={setNumberOfAdults}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.thirdInput}>
                <Text style={styles.label}>Children</Text>
                <TextInput
                  style={styles.input}
                  value={numberOfChildren}
                  onChangeText={setNumberOfChildren}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.thirdInput}>
                <Text style={styles.label}>Rooms</Text>
                <TextInput
                  style={styles.input}
                  value={numberOfRooms}
                  onChangeText={setNumberOfRooms}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Special Request (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={specialRequest}
                onChangeText={setSpecialRequest}
                placeholder="Any special requirements..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Any additional remarks..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.priceSummary}>
              <View>
                <Text style={styles.priceLabel}>Total Amount:</Text>
                <Text style={styles.priceSubtitle}>
                  {isGuestBooking ? 'Guest Price' : 'Member Price'}
                </Text>
              </View>
              <View style={styles.priceValueContainer}>
                <Text style={styles.priceValue}>
                  {calculateTotalPrice().toFixed(2)}Rs
                </Text>
                <Text style={styles.priceBreakdown}>
                  {parseInt(numberOfRooms) || 1} room(s) × {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} night(s) × {isGuestBooking ? roomType.priceGuest : roomType.priceMember}Rs
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={16} color="#b48a64" />
              <Text style={styles.infoText}>
                {isGuestBooking
                  ? `Booking ${numberOfRooms} room(s) for your guest. The guest will need to provide ID at check-in.`
                  : `Booking ${numberOfRooms} room(s) of ${roomType.name}. Rooms will be automatically assigned based on availability.`
                }
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {isGuestBooking ? 'Book for Guest' : 'Confirm Booking'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Reservation Modal Component with Remarks
const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms, isReserve = true }) => {
  const [reserveFrom, setReserveFrom] = useState(new Date());
  const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [remarks, setRemarks] = useState(''); // Added remarks state
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reserveFrom || !reserveTo) {
      Alert.alert('Error', 'Please select reservation dates');
      return;
    }

    if (reserveFrom >= reserveTo) {
      Alert.alert('Error', 'Reservation end date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        reserveFrom: reserveFrom.toISOString().split('T')[0],
        reserveTo: reserveTo.toISOString().split('T')[0],
        remarks: remarks, // Added remarks
      };

      await onConfirm(reservationData);
    } catch (error) {
      console.error('Reservation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isReserve ? 'Reserve' : 'Unreserve'} {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.reservationInfo}>
              You are about to {isReserve ? 'reserve' : 'unreserve'} the following rooms:
            </Text>

            <View style={styles.roomsList}>
              {selectedRooms.map(room => (
                <Text key={room.id} style={styles.roomItemText}>
                  • Room {room.roomNumber}
                </Text>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{isReserve ? 'Reserve From' : 'Unreserve From'}</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromPicker(true)}
              >
                <Icon name="calendar-today" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {reserveFrom.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showFromPicker && (
                <DateTimePicker
                  value={reserveFrom}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowFromPicker(false);
                    if (date) setReserveFrom(date);
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{isReserve ? 'Reserve To' : 'Unreserve To'}</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToPicker(true)}
              >
                <Icon name="calendar-today" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {reserveTo.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showToPicker && (
                <DateTimePicker
                  value={reserveTo}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowToPicker(false);
                    if (date) setReserveTo(date);
                  }}
                />
              )}
            </View>

            {/* Add Remarks Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Remarks (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Enter any remarks for this reservation"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={16} color={isReserve ? "#28a745" : "#dc3545"} />
              <Text style={[styles.infoText, { color: isReserve ? "#28a745" : "#dc3545" }]}>
                {isReserve
                  ? 'Reserving rooms will make them unavailable for booking during the selected period.'
                  : 'Unreserving rooms will make them available for booking again.'
                }
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                loading && styles.buttonDisabled,
                !isReserve && styles.unreserveButton
              ]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {isReserve ? 'Confirm Reservation' : 'Confirm Unreservation'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Updated Reservation Modal Component with Reserve/Unreserve Toggle
// const ReservationModal = ({ visible, onClose, onConfirm, selectedRooms, isReserve = true }) => {
//   const [reserveFrom, setReserveFrom] = useState(new Date());
//   const [reserveTo, setReserveTo] = useState(new Date(Date.now() + 86400000));
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleConfirm = async () => {
//     if (!reserveFrom || !reserveTo) {
//       Alert.alert('Error', 'Please select reservation dates');
//       return;
//     }

//     if (reserveFrom >= reserveTo) {
//       Alert.alert('Error', 'Reservation end date must be after start date');
//       return;
//     }

//     setLoading(true);
//     try {
//       const reservationData = {
//         reserveFrom: reserveFrom.toISOString().split('T')[0],
//         reserveTo: reserveTo.toISOString().split('T')[0],
//       };

//       await onConfirm(reservationData);
//     } catch (error) {
//       console.error('Reservation error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>
//               {isReserve ? 'Reserve' : 'Unreserve'} {selectedRooms.length} Room{selectedRooms.length !== 1 ? 's' : ''}
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <Icon name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.modalContent}>
//             <Text style={styles.reservationInfo}>
//               You are about to {isReserve ? 'reserve' : 'unreserve'} the following rooms:
//             </Text>

//             <View style={styles.roomsList}>
//               {selectedRooms.map(room => (
//                 <Text key={room.id} style={styles.roomItemText}>
//                   • Room {room.roomNumber}
//                 </Text>
//               ))}
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>{isReserve ? 'Reserve From' : 'Unreserve From'}</Text>
//               <TouchableOpacity
//                 style={styles.dateInput}
//                 onPress={() => setShowFromPicker(true)}
//               >
//                 <Icon name="calendar-today" size={20} color="#666" />
//                 <Text style={styles.dateText}>
//                   {reserveFrom.toLocaleDateString()}
//                 </Text>
//               </TouchableOpacity>
//               {showFromPicker && (
//                 <DateTimePicker
//                   value={reserveFrom}
//                   mode="date"
//                   display="default"
//                   onChange={(event, date) => {
//                     setShowFromPicker(false);
//                     if (date) setReserveFrom(date);
//                   }}
//                 />
//               )}
//             </View>

//             <View style={styles.formGroup}>
//               <Text style={styles.label}>{isReserve ? 'Reserve To' : 'Unreserve To'}</Text>
//               <TouchableOpacity
//                 style={styles.dateInput}
//                 onPress={() => setShowToPicker(true)}
//               >
//                 <Icon name="calendar-today" size={20} color="#666" />
//                 <Text style={styles.dateText}>
//                   {reserveTo.toLocaleDateString()}
//                 </Text>
//               </TouchableOpacity>
//               {showToPicker && (
//                 <DateTimePicker
//                   value={reserveTo}
//                   mode="date"
//                   display="default"
//                   onChange={(event, date) => {
//                     setShowToPicker(false);
//                     if (date) setReserveTo(date);
//                   }}
//                 />
//               )}
//             </View>

//             <View style={styles.infoBox}>
//               <Icon name="info" size={16} color={isReserve ? "#28a745" : "#dc3545"} />
//               <Text style={[styles.infoText, { color: isReserve ? "#28a745" : "#dc3545" }]}>
//                 {isReserve 
//                   ? 'Reserving rooms will make them unavailable for booking during the selected period.'
//                   : 'Unreserving rooms will make them available for booking again.'
//                 }
//               </Text>
//             </View>
//           </ScrollView>

//           <View style={styles.modalFooter}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={onClose}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.confirmButton, 
//                 loading && styles.buttonDisabled,
//                 !isReserve && styles.unreserveButton
//               ]}
//               onPress={handleConfirm}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.confirmButtonText}>
//                   {isReserve ? 'Confirm Reservation' : 'Confirm Unreservation'}
//                 </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#dbc9a5',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: { flex: 1 },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  notch: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    backgroundColor: "#D2B48C",
  },
  notchImage: {
    resizeMode: "cover",
  },
  notchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
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
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  sliderContainer: {
    height: 200,
    width: 390,
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 8,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  noImageText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  noImageText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  roomTypeInfo: {
    padding: 20,
  },
  roomTypeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  debugSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#6c757d',
    marginBottom: 2,
  },
  smallDebugText: {
    fontSize: 8,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  pricingSection: {
    marginBottom: 15,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b48a64',
  },
  perNightText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 5,
  },
  roomCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#b48a64',
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Member Section Styles
  memberSection: {
    padding: 20,
    paddingTop: 0,
  },
  availabilityInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 15,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  availabilityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bookingInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  bookingInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },

  // Rooms Section (Admin)
  roomsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  roomItemSelected: {
    borderColor: '#b48a64',
    backgroundColor: '#fdf6f0',
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  active: {
    backgroundColor: '#28a745',
  },
  inactive: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  noRoomsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noRoomsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#b48a64',
  },
  reserveButton: {
    backgroundColor: '#28a745',
  },
  unreserveButton: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#b48a64',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FEF9F3',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FEF9F3',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  availabilityCheckSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  availabilityCheckTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  checkAvailabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b48a64',
    padding: 12,
    borderRadius: 8,
  },
  checkAvailabilityText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Guest Booking Toggle
  guestBookingToggle: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },

  // Guest Details Section
  guestDetailsSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0e7ff',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  thirdInput: {
    flex: 1,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  priceValueContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b48a64',
  },
  priceBreakdown: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#b48a64',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1565c0',
    marginLeft: 8,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b48a64',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#b48a64',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#b48a64',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reservationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  roomsList: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  roomItemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },

  // Room Features Section Styles
  featuresSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  featuresSectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#b48a64',
    marginBottom: 10,
  },
  featuresDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontWeight: '500',
  },
  featuresList: {
    marginTop: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b48a64',
    marginRight: 12,
  },
  featureItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
});