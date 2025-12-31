// // // // import React, { useState, useEffect, useCallback } from 'react';
// // // // import {
// // // //   View,
// // // //   Text,
// // // //   StyleSheet,
// // // //   ScrollView,
// // // //   TouchableOpacity,
// // // //   Modal,
// // // //   RefreshControl,
// // // //   ActivityIndicator,
// // // //   SafeAreaView,
// // // //   Alert,
// // // //   Dimensions,
// // // // } from 'react-native';
// // // // import { Calendar } from 'react-native-calendars';
// // // // import { useAuth } from '../auth/contexts/AuthContext';
// // // // import api from '../../config/apiService';
// // // // import axios from 'axios';
// // // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // // import { Platform } from 'react-native';

// // // // const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // // // // Simple date utility functions to replace date-fns
// // // // const dateUtils = {
// // // //   format: (date, formatStr) => {
// // // //     const d = new Date(date);
// // // //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// // // //     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// // // //     if (formatStr === 'MMM d') {
// // // //       return `${months[d.getMonth()]} ${d.getDate()}`;
// // // //     } else if (formatStr === 'EEE') {
// // // //       return days[d.getDay()];
// // // //     } else if (formatStr === 'MMM d, yyyy') {
// // // //       return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// // // //     } else if (formatStr === 'MMMM d, yyyy') {
// // // //       const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
// // // //                          'July', 'August', 'September', 'October', 'November', 'December'];
// // // //       return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// // // //     } else if (formatStr === 'yyyy-MM-dd') {
// // // //       return d.toISOString().split('T')[0];
// // // //     }
// // // //     return d.toString();
// // // //   },

// // // //   parseISO: (dateString) => {
// // // //     return new Date(dateString);
// // // //   },

// // // //   isSameDay: (date1, date2) => {
// // // //     const d1 = new Date(date1);
// // // //     const d2 = new Date(date2);
// // // //     return d1.getFullYear() === d2.getFullYear() &&
// // // //            d1.getMonth() === d2.getMonth() &&
// // // //            d1.getDate() === d2.getDate();
// // // //   },

// // // //   addDays: (date, days) => {
// // // //     const result = new Date(date);
// // // //     result.setDate(result.getDate() + days);
// // // //     return result;
// // // //   },

// // // //   differenceInDays: (date1, date2) => {
// // // //     const d1 = new Date(date1);
// // // //     const d2 = new Date(date2);
// // // //     const diffTime = Math.abs(d2 - d1);
// // // //     return Math.floor(diffTime / (1000 * 60 * 60 * 24));
// // // //   },

// // // //   startOfDay: (date) => {
// // // //     const result = new Date(date);
// // // //     result.setHours(0, 0, 0, 0);
// // // //     return result;
// // // //   },

// // // //   eachDayOfInterval: (interval) => {
// // // //     const days = [];
// // // //     let current = new Date(interval.start);
// // // //     const end = new Date(interval.end);

// // // //     while (current <= end) {
// // // //       days.push(new Date(current));
// // // //       current.setDate(current.getDate() + 1);
// // // //     }

// // // //     return days;
// // // //   },
// // // // };

// // // // const calender = ({ navigation }) => {
// // // //   const [currentDate, setCurrentDate] = useState(new Date());
// // // //   const [selectedFacilityType, setSelectedFacilityType] = useState('ROOMS');
// // // //   const [selectedRoomType, setSelectedRoomType] = useState('ALL');
// // // //   const [selectedRoom, setSelectedRoom] = useState(null);
// // // //   const [selectedPeriod, setSelectedPeriod] = useState(null);
// // // //   const [daysToShow, setDaysToShow] = useState(30);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [refreshing, setRefreshing] = useState(false);
// // // //   const [viewMode, setViewMode] = useState('month');

// // // //   const [rooms, setRooms] = useState([]);
// // // //   const [halls, setHalls] = useState([]);
// // // //   const [lawns, setLawns] = useState([]);
// // // //   const [photoshoots, setPhotoshoots] = useState([]);

// // // //   const { user } = useAuth();

// // // //   // Fetch data function
// // // // const fetchData = useCallback(async () => {
// // // //   if (!user) return;

// // // //   try {
// // // //     setLoading(true);

// // // //     // Get token from AsyncStorage
// // // //     const token = await AsyncStorage.getItem('access_token');

// // // //     // Create headers
// // // //     const headers = {
// // // //       'Content-Type': 'application/json',
// // // //       ...(token && { Authorization: `Bearer ${token}` }),
// // // //     };

// // // //     // Define base URL
// // // //     const baseURL = Platform.OS === 'android' ? 'http://193.203.169.122:8080/api' : 'http://localhost:3000';

// // // //     // Fetch data based on selected facility type
// // // //     if (selectedFacilityType === 'ROOMS') {
// // // //       try {
// // // //         const response = await axios.get(`${baseURL}/room/calendar`, { headers });
// // // //         setRooms(response.data || []);
// // // //       } catch (error) {
// // // //         console.error('Error fetching rooms:', error);
// // // //         setRooms([]);
// // // //       }
// // // //     }

// // // //     if (selectedFacilityType === 'HALLS') {
// // // //       try {
// // // //         const response = await axios.get(`${baseURL}/hall/get/halls`, { headers });
// // // //         setHalls(response.data || []);
// // // //       } catch (error) {
// // // //         console.error('Error fetching halls:', error);
// // // //         setHalls([]);
// // // //       }
// // // //     }

// // // //     if (selectedFacilityType === 'LAWNS') {
// // // //       try {
// // // //         const response = await axios.get(`${baseURL}/lawn/get/lawns`, { headers });
// // // //         setLawns(response.data || []);
// // // //       } catch (error) {
// // // //         console.error('Error fetching lawns:', error);
// // // //         setLawns([]);
// // // //       }
// // // //     }

// // // //     if (selectedFacilityType === 'PHOTOSHOOTS') {
// // // //       try {
// // // //         const response = await axios.get(`${baseURL}/photoShoot/get/photoShoots`, { headers });
// // // //         setPhotoshoots(response.data || []);
// // // //       } catch (error) {
// // // //         console.error('Error fetching photoshoots:', error);
// // // //         setPhotoshoots([]);
// // // //       }
// // // //     }

// // // //   } catch (error) {
// // // //     console.error('Error fetching calendar data:', error);
// // // //     Alert.alert('Error', 'Failed to load calendar data');
// // // //   } finally {
// // // //     setLoading(false);
// // // //     setRefreshing(false);
// // // //   }
// // // // }, [user, selectedFacilityType]);

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, [fetchData]);

// // // //   const onRefresh = useCallback(() => {
// // // //     setRefreshing(true);
// // // //     fetchData();
// // // //   }, [fetchData]);

// // // //   // Get current facility data
// // // //   const getCurrentFacilities = () => {
// // // //     switch (selectedFacilityType) {
// // // //       case 'ROOMS':
// // // //         return rooms;
// // // //       case 'HALLS':
// // // //         return halls;
// // // //       case 'LAWNS':
// // // //         return lawns;
// // // //       case 'PHOTOSHOOTS':
// // // //         return photoshoots;
// // // //       default:
// // // //         return [];
// // // //     }
// // // //   };

// // // //   // Filter rooms based on selection
// // // //   const filteredRooms = rooms.filter(room => {
// // // //     const typeMatch = selectedRoomType === 'ALL' || room.roomType?.type === selectedRoomType;
// // // //     const roomMatch = !selectedRoom || room.id.toString() === selectedRoom;
// // // //     return typeMatch && roomMatch;
// // // //   });

// // // //   // Get facilities to display
// // // //   const getFacilitiesForDisplay = () => {
// // // //     if (selectedFacilityType === 'ROOMS') {
// // // //       return filteredRooms;
// // // //     }
// // // //     return getCurrentFacilities();
// // // //   };

// // // //   // Generate marked dates for calender view
// // // //   const generateMarkedDates = () => {
// // // //     const facilities = getFacilitiesForDisplay();
// // // //     const markedDates = {};

// // // //     facilities.forEach(facility => {
// // // //       // Process bookings
// // // //       if (facility.bookings && facility.bookings.length > 0) {
// // // //         facility.bookings.forEach(booking => {
// // // //           const startDate = dateUtils.parseISO(booking.checkIn || booking.bookingDate || booking.createdAt);
// // // //           const endDate = dateUtils.parseISO(booking.checkOut || booking.bookingDate || booking.createdAt);

// // // //           if (booking.bookingDate || booking.createdAt) {
// // // //             const dateString = dateUtils.format(startDate, 'yyyy-MM-dd');
// // // //             if (!markedDates[dateString]) {
// // // //               markedDates[dateString] = {
// // // //                 dots: [],
// // // //                 selected: false,
// // // //               };
// // // //             }
// // // //             markedDates[dateString].dots.push({
// // // //               key: `booking-${facility.id}-${booking.id}`,
// // // //               color: '#3B82F6',
// // // //             });
// // // //           } else {
// // // //             let currentDate = new Date(startDate);
// // // //             while (currentDate <= endDate) {
// // // //               const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// // // //               if (!markedDates[dateString]) {
// // // //                 markedDates[dateString] = {
// // // //                   dots: [],
// // // //                   selected: false,
// // // //                 };
// // // //               }
// // // //               markedDates[dateString].dots.push({
// // // //                 key: `booking-${facility.id}-${booking.id}`,
// // // //                 color: '#3B82F6',
// // // //               });
// // // //               currentDate.setDate(currentDate.getDate() + 1);
// // // //             }
// // // //           }
// // // //         });
// // // //       }

// // // //       // Process reservations
// // // //       if (facility.reservations && facility.reservations.length > 0) {
// // // //         facility.reservations.forEach(reservation => {
// // // //           const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
// // // //           const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

// // // //           let currentDate = new Date(startDate);
// // // //           while (currentDate <= endDate) {
// // // //             const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// // // //             if (!markedDates[dateString]) {
// // // //               markedDates[dateString] = {
// // // //                 dots: [],
// // // //                 selected: false,
// // // //               };
// // // //             }
// // // //             markedDates[dateString].dots.push({
// // // //               key: `reservation-${facility.id}-${reservation.id}`,
// // // //               color: '#F59E0B',
// // // //             });
// // // //             currentDate.setDate(currentDate.getDate() + 1);
// // // //           }
// // // //         });
// // // //       }

// // // //       // Process out of order periods
// // // //       if (facility.outOfOrders && facility.outOfOrders.length > 0) {
// // // //         facility.outOfOrders.forEach(outOfOrder => {
// // // //           const startDate = dateUtils.parseISO(outOfOrder.startDate);
// // // //           const endDate = dateUtils.parseISO(outOfOrder.endDate);

// // // //           let currentDate = new Date(startDate);
// // // //           while (currentDate <= endDate) {
// // // //             const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// // // //             if (!markedDates[dateString]) {
// // // //               markedDates[dateString] = {
// // // //                 dots: [],
// // // //                 selected: false,
// // // //               };
// // // //             }
// // // //             markedDates[dateString].dots.push({
// // // //               key: `outoforder-${facility.id}-${outOfOrder.id}`,
// // // //               color: '#EF4444',
// // // //             });
// // // //             currentDate.setDate(currentDate.getDate() + 1);
// // // //           }
// // // //         });
// // // //       }
// // // //     });

// // // //     return markedDates;
// // // //   };

// // // //   // Get facility type display name
// // // //   const getFacilityTypeName = (type) => {
// // // //     switch (type) {
// // // //       case 'ROOMS':
// // // //         return 'Rooms';
// // // //       case 'HALLS':
// // // //         return 'Halls';
// // // //       case 'LAWNS':
// // // //         return 'Lawns';
// // // //       case 'PHOTOSHOOTS':
// // // //         return 'Photoshoots';
// // // //       default:
// // // //         return 'Rooms';
// // // //     }
// // // //   };

// // // //   // Get facility name
// // // //   const getFacilityName = (facility) => {
// // // //     if (selectedFacilityType === 'ROOMS') {
// // // //       return `Room ${facility.roomNumber || facility.roomNo || facility.id}`;
// // // //     }
// // // //     return facility.name || facility.title || `Facility ${facility.id}`;
// // // //   };

// // // //   // Calendar View Component
// // // //   const renderCalendarView = () => {
// // // //     const markedDates = generateMarkedDates();

// // // //     return (
// // // //       <View style={styles.calendarContainer}>
// // // //         <Calendar
// // // //           current={dateUtils.format(currentDate, 'yyyy-MM-dd')}
// // // //           onDayPress={(day) => {
// // // //             const facilities = getFacilitiesForDisplay();
// // // //             const selectedDate = dateUtils.parseISO(day.dateString);

// // // //             const periodsOnDate = [];

// // // //             facilities.forEach(facility => {
// // // //               // Check bookings
// // // //               if (facility.bookings) {
// // // //                 facility.bookings.forEach(booking => {
// // // //                   const startDate = dateUtils.parseISO(booking.checkIn || booking.bookingDate || booking.createdAt);
// // // //                   const endDate = dateUtils.parseISO(booking.checkOut || booking.bookingDate || booking.createdAt);

// // // //                   if (dateUtils.isSameDay(selectedDate, startDate) || 
// // // //                       (booking.checkOut && dateUtils.isSameDay(selectedDate, endDate))) {
// // // //                     periodsOnDate.push({
// // // //                       facility,
// // // //                       type: 'booking',
// // // //                       data: booking,
// // // //                     });
// // // //                   }
// // // //                 });
// // // //               }

// // // //               // Check reservations
// // // //               if (facility.reservations) {
// // // //                 facility.reservations.forEach(reservation => {
// // // //                   const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
// // // //                   const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

// // // //                   if (selectedDate >= startDate && selectedDate <= endDate) {
// // // //                     periodsOnDate.push({
// // // //                       facility,
// // // //                       type: 'reservation',
// // // //                       data: reservation,
// // // //                     });
// // // //                   }
// // // //                 });
// // // //               }

// // // //               // Check out of orders
// // // //               if (facility.outOfOrders) {
// // // //                 facility.outOfOrders.forEach(outOfOrder => {
// // // //                   const startDate = dateUtils.parseISO(outOfOrder.startDate);
// // // //                   const endDate = dateUtils.parseISO(outOfOrder.endDate);

// // // //                   if (selectedDate >= startDate && selectedDate <= endDate) {
// // // //                     periodsOnDate.push({
// // // //                       facility,
// // // //                       type: 'outOfOrder',
// // // //                       data: outOfOrder,
// // // //                     });
// // // //                   }
// // // //                 });
// // // //               }
// // // //             });

// // // //             if (periodsOnDate.length > 0) {
// // // //               setSelectedPeriod({
// // // //                 date: selectedDate,
// // // //                 periods: periodsOnDate,
// // // //               });
// // // //             }
// // // //           }}
// // // //           markedDates={markedDates}
// // // //           markingType="multi-dot"
// // // //           theme={{
// // // //             backgroundColor: '#ffffff',
// // // //             calendarBackground: '#ffffff',
// // // //             textSectionTitleColor: '#6B7280',
// // // //             selectedDayBackgroundColor: '#3B82F6',
// // // //             selectedDayTextColor: '#ffffff',
// // // //             todayTextColor: '#3B82F6',
// // // //             dayTextColor: '#374151',
// // // //             textDisabledColor: '#D1D5DB',
// // // //             dotColor: '#3B82F6',
// // // //             selectedDotColor: '#ffffff',
// // // //             arrowColor: '#3B82F6',
// // // //             monthTextColor: '#111827',
// // // //             textDayFontFamily: 'System',
// // // //             textMonthFontFamily: 'System',
// // // //             textDayHeaderFontFamily: 'System',
// // // //             textDayFontSize: 16,
// // // //             textMonthFontSize: 18,
// // // //             textDayHeaderFontSize: 14,
// // // //           }}
// // // //           style={styles.calender}
// // // //         />
// // // //       </View>
// // // //     );
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <View style={styles.loadingContainer}>
// // // //         <ActivityIndicator size="large" color="#3B82F6" />
// // // //         <Text style={styles.loadingText}>Loading calender data...</Text>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   const facilities = getFacilitiesForDisplay();
// // // //   const roomTypes = [...new Set(rooms.map(room => room.roomType?.type).filter(Boolean))];

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <ScrollView
// // // //         refreshControl={
// // // //           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
// // // //         }
// // // //         style={styles.scrollView}
// // // //       >
// // // //         {/* Header */}
// // // //         <View style={styles.header}>
// // // //           <Text style={styles.headerTitle}>Facility Calendar</Text>
// // // //           <Text style={styles.headerSubtitle}>
// // // //             View bookings, reservations, and maintenance schedules
// // // //           </Text>
// // // //         </View>

// // // //         {/* Filters */}
// // // //         <View style={styles.filtersContainer}>
// // // //           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
// // // //             {/* Facility Type Filter */}
// // // //             <View style={styles.filterSection}>
// // // //               <Text style={styles.filterLabel}>Facility Type</Text>
// // // //               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
// // // //                 {['ROOMS', 'HALLS', 'LAWNS', 'PHOTOSHOOTS'].map((type) => (
// // // //                   <TouchableOpacity
// // // //                     key={type}
// // // //                     style={[
// // // //                       styles.filterButton,
// // // //                       selectedFacilityType === type && styles.filterButtonActive,
// // // //                     ]}
// // // //                     onPress={() => {
// // // //                       setSelectedFacilityType(type);
// // // //                       setSelectedRoomType('ALL');
// // // //                       setSelectedRoom(null);
// // // //                     }}
// // // //                   >
// // // //                     <Text
// // // //                       style={[
// // // //                         styles.filterButtonText,
// // // //                         selectedFacilityType === type && styles.filterButtonTextActive,
// // // //                       ]}
// // // //                     >
// // // //                       {getFacilityTypeName(type)}
// // // //                     </Text>
// // // //                   </TouchableOpacity>
// // // //                 ))}
// // // //               </ScrollView>
// // // //             </View>

// // // //             {/* Room-specific filters */}
// // // //             {selectedFacilityType === 'ROOMS' && roomTypes.length > 0 && (
// // // //               <View style={styles.filterSection}>
// // // //                 <Text style={styles.filterLabel}>Room Type</Text>
// // // //                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
// // // //                   <TouchableOpacity
// // // //                     style={[
// // // //                       styles.filterButton,
// // // //                       selectedRoomType === 'ALL' && styles.filterButtonActive,
// // // //                     ]}
// // // //                     onPress={() => setSelectedRoomType('ALL')}
// // // //                   >
// // // //                     <Text
// // // //                       style={[
// // // //                         styles.filterButtonText,
// // // //                         selectedRoomType === 'ALL' && styles.filterButtonTextActive,
// // // //                       ]}
// // // //                     >
// // // //                       All Types
// // // //                     </Text>
// // // //                   </TouchableOpacity>
// // // //                   {roomTypes.map((type) => (
// // // //                     <TouchableOpacity
// // // //                       key={type}
// // // //                       style={[
// // // //                         styles.filterButton,
// // // //                         selectedRoomType === type && styles.filterButtonActive,
// // // //                       ]}
// // // //                       onPress={() => setSelectedRoomType(type)}
// // // //                     >
// // // //                       <Text
// // // //                         style={[
// // // //                           styles.filterButtonText,
// // // //                           selectedRoomType === type && styles.filterButtonTextActive,
// // // //                         ]}
// // // //                       >
// // // //                         {type}
// // // //                       </Text>
// // // //                     </TouchableOpacity>
// // // //                   ))}
// // // //                 </ScrollView>
// // // //               </View>
// // // //             )}
// // // //           </ScrollView>
// // // //         </View>

// // // //         {/* Legend */}
// // // //         <View style={styles.legendContainer}>
// // // //           <Text style={styles.legendTitle}>Legend</Text>
// // // //           <View style={styles.legendItems}>
// // // //             <View style={styles.legendItem}>
// // // //               <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
// // // //               <Text style={styles.legendText}>Bookings</Text>
// // // //             </View>
// // // //             <View style={styles.legendItem}>
// // // //               <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
// // // //               <Text style={styles.legendText}>Reservations</Text>
// // // //             </View>
// // // //             <View style={styles.legendItem}>
// // // //               <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
// // // //               <Text style={styles.legendText}>Out of Service</Text>
// // // //             </View>
// // // //           </View>
// // // //         </View>

// // // //         {/* Calendar View */}
// // // //         {facilities.length === 0 ? (
// // // //           <View style={styles.emptyContainer}>
// // // //             <Text style={styles.emptyText}>📅</Text>
// // // //             <Text style={styles.emptyText}>
// // // //               No {getFacilityTypeName(selectedFacilityType).toLowerCase()} found
// // // //             </Text>
// // // //             <Text style={styles.emptySubtext}>
// // // //               Try adjusting your filters
// // // //             </Text>
// // // //           </View>
// // // //         ) : (
// // // //           renderCalendarView()
// // // //         )}

// // // //         {/* Statistics */}
// // // //         <View style={styles.statsContainer}>
// // // //           <Text style={styles.statsTitle}>Current Status</Text>
// // // //           <View style={styles.statsGrid}>
// // // //             <View style={styles.statCard}>
// // // //               <Text style={styles.statNumber}>{facilities.length}</Text>
// // // //               <Text style={styles.statLabel}>Total</Text>
// // // //             </View>
// // // //             <View style={styles.statCard}>
// // // //               <Text style={styles.statNumber}>
// // // //                 {facilities.filter(f => f.isBooked).length}
// // // //               </Text>
// // // //               <Text style={styles.statLabel}>Booked</Text>
// // // //             </View>
// // // //             <View style={styles.statCard}>
// // // //               <Text style={styles.statNumber}>
// // // //                 {facilities.filter(f => f.isOutOfOrder).length}
// // // //               </Text>
// // // //               <Text style={styles.statLabel}>Out of Service</Text>
// // // //             </View>
// // // //             <View style={styles.statCard}>
// // // //               <Text style={styles.statNumber}>
// // // //                 {facilities.filter(f => !f.isBooked && !f.isOutOfOrder && !f.isReserved).length}
// // // //               </Text>
// // // //               <Text style={styles.statLabel}>Available</Text>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </ScrollView>

// // // //       {/* Period Details Modal */}
// // // //       <Modal
// // // //         visible={!!selectedPeriod}
// // // //         transparent
// // // //         animationType="slide"
// // // //         onRequestClose={() => setSelectedPeriod(null)}
// // // //       >
// // // //         <View style={styles.modalOverlay}>
// // // //           <View style={styles.modalContainer}>
// // // //             <View style={styles.modalHeader}>
// // // //               <Text style={styles.modalTitle}>
// // // //                 {selectedPeriod?.date 
// // // //                   ? dateUtils.format(selectedPeriod.date, 'MMMM d, yyyy')
// // // //                   : 'Booking Details'}
// // // //               </Text>
// // // //               <TouchableOpacity
// // // //                 style={styles.modalCloseButton}
// // // //                 onPress={() => setSelectedPeriod(null)}
// // // //               >
// // // //                 <Text style={styles.modalCloseText}>✕</Text>
// // // //               </TouchableOpacity>
// // // //             </View>

// // // //             <ScrollView style={styles.modalContent}>
// // // //               {selectedPeriod?.periods ? (
// // // //                 selectedPeriod.periods.map((period, index) => (
// // // //                   <View key={index} style={styles.periodCard}>
// // // //                     <View style={styles.periodCardHeader}>
// // // //                       <Text style={styles.periodFacilityName}>
// // // //                         {getFacilityName(period.facility)}
// // // //                       </Text>
// // // //                       <View
// // // //                         style={[
// // // //                           styles.periodBadge,
// // // //                           {
// // // //                             backgroundColor:
// // // //                               period.type === 'booking'
// // // //                                 ? '#DBEAFE'
// // // //                                 : period.type === 'reservation'
// // // //                                 ? '#FEF3C7'
// // // //                                 : '#FEE2E2',
// // // //                           },
// // // //                         ]}
// // // //                       >
// // // //                         <Text
// // // //                           style={[
// // // //                             styles.periodBadgeText,
// // // //                             {
// // // //                               color:
// // // //                                 period.type === 'booking'
// // // //                                   ? '#1E40AF'
// // // //                                   : period.type === 'reservation'
// // // //                                   ? '#92400E'
// // // //                                   : '#991B1B',
// // // //                             },
// // // //                           ]}
// // // //                         >
// // // //                           {period.type.toUpperCase()}
// // // //                         </Text>
// // // //                       </View>
// // // //                     </View>

// // // //                     {period.type === 'booking' && (
// // // //                       <>
// // // //                         {period.data.memberName && (
// // // //                           <Text style={styles.periodDetail}>
// // // //                             Guest: {period.data.memberName}
// // // //                           </Text>
// // // //                         )}
// // // //                         {period.data.guestName && (
// // // //                           <Text style={styles.periodDetail}>
// // // //                             Guest: {period.data.guestName}
// // // //                           </Text>
// // // //                         )}
// // // //                         {(period.data.checkIn || period.data.bookingDate) && (
// // // //                           <Text style={styles.periodDetail}>
// // // //                             Date: {dateUtils.format(
// // // //                               dateUtils.parseISO(period.data.checkIn || period.data.bookingDate),
// // // //                               'MMM d, yyyy'
// // // //                             )}
// // // //                             {period.data.checkOut && ` to ${dateUtils.format(
// // // //                               dateUtils.parseISO(period.data.checkOut),
// // // //                               'MMM d, yyyy'
// // // //                             )}`}
// // // //                           </Text>
// // // //                         )}
// // // //                         {period.data.totalPrice && (
// // // //                           <Text style={styles.periodDetail}>
// // // //                             Amount: PKR {parseInt(period.data.totalPrice).toLocaleString()}
// // // //                           </Text>
// // // //                         )}
// // // //                         {period.data.paymentStatus && (
// // // //                           <View style={styles.paymentStatusContainer}>
// // // //                             <Text style={styles.periodDetail}>Payment: </Text>
// // // //                             <View
// // // //                               style={[
// // // //                                 styles.paymentBadge,
// // // //                                 {
// // // //                                   backgroundColor:
// // // //                                     period.data.paymentStatus === 'PAID'
// // // //                                       ? '#D1FAE5'
// // // //                                       : period.data.paymentStatus === 'UNPAID'
// // // //                                       ? '#FEE2E2'
// // // //                                       : '#FEF3C7',
// // // //                                 },
// // // //                               ]}
// // // //                             >
// // // //                               <Text
// // // //                                 style={[
// // // //                                   styles.paymentBadgeText,
// // // //                                   {
// // // //                                     color:
// // // //                                       period.data.paymentStatus === 'PAID'
// // // //                                         ? '#065F46'
// // // //                                         : period.data.paymentStatus === 'UNPAID'
// // // //                                         ? '#991B1B'
// // // //                                         : '#92400E',
// // // //                                   },
// // // //                                 ]}
// // // //                               >
// // // //                                 {period.data.paymentStatus}
// // // //                               </Text>
// // // //                             </View>
// // // //                           </View>
// // // //                         )}
// // // //                       </>
// // // //                     )}

// // // //                     {period.type === 'reservation' && (
// // // //                       <>
// // // //                         <Text style={styles.periodDetail}>
// // // //                           Reserved by: {period.data.admin?.name || 'Admin'}
// // // //                         </Text>
// // // //                         <Text style={styles.periodDetail}>
// // // //                           Period: {dateUtils.format(
// // // //                             dateUtils.parseISO(period.data.reservedFrom || period.data.startDate),
// // // //                             'MMM d, yyyy'
// // // //                           )} - {dateUtils.format(
// // // //                             dateUtils.parseISO(period.data.reservedTo || period.data.endDate),
// // // //                             'MMM d, yyyy'
// // // //                           )}
// // // //                         </Text>
// // // //                       </>
// // // //                     )}

// // // //                     {period.type === 'outOfOrder' && (
// // // //                       <>
// // // //                         <Text style={styles.periodDetail}>
// // // //                           Reason: {period.data.reason || 'Maintenance'}
// // // //                         </Text>
// // // //                         <Text style={styles.periodDetail}>
// // // //                           Period: {dateUtils.format(
// // // //                             dateUtils.parseISO(period.data.startDate),
// // // //                             'MMM d, yyyy'
// // // //                           )} - {dateUtils.format(
// // // //                             dateUtils.parseISO(period.data.endDate),
// // // //                             'MMM d, yyyy'
// // // //                           )}
// // // //                         </Text>
// // // //                       </>
// // // //                     )}
// // // //                   </View>
// // // //                 ))
// // // //               ) : null}
// // // //             </ScrollView>

// // // //             <View style={styles.modalFooter}>
// // // //               <TouchableOpacity
// // // //                 style={styles.modalButton}
// // // //                 onPress={() => setSelectedPeriod(null)}
// // // //               >
// // // //                 <Text style={styles.modalButtonText}>Close</Text>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>
// // // //     </SafeAreaView>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: '#F9FAFB',
// // // //   },
// // // //   scrollView: {
// // // //     flex: 1,
// // // //   },
// // // //   loadingContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#F9FAFB',
// // // //   },
// // // //   loadingText: {
// // // //     marginTop: 12,
// // // //     fontSize: 16,
// // // //     color: '#6B7280',
// // // //   },
// // // //   header: {
// // // //     padding: 20,
// // // //     backgroundColor: '#FFFFFF',
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: '#E5E7EB',
// // // //   },
// // // //   headerTitle: {
// // // //     fontSize: 24,
// // // //     fontWeight: 'bold',
// // // //     color: '#111827',
// // // //   },
// // // //   headerSubtitle: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //     marginTop: 4,
// // // //   },
// // // //   filtersContainer: {
// // // //     backgroundColor: '#FFFFFF',
// // // //     padding: 16,
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: '#E5E7EB',
// // // //   },
// // // //   filterSection: {
// // // //     marginBottom: 12,
// // // //   },
// // // //   filterLabel: {
// // // //     fontSize: 14,
// // // //     fontWeight: '600',
// // // //     color: '#374151',
// // // //     marginBottom: 8,
// // // //   },
// // // //   filterButtons: {
// // // //     flexDirection: 'row',
// // // //   },
// // // //   filterButton: {
// // // //     paddingHorizontal: 16,
// // // //     paddingVertical: 8,
// // // //     borderRadius: 20,
// // // //     backgroundColor: '#F3F4F6',
// // // //     marginRight: 8,
// // // //     minHeight: 36,
// // // //     justifyContent: 'center',
// // // //   },
// // // //   filterButtonActive: {
// // // //     backgroundColor: '#3B82F6',
// // // //   },
// // // //   filterButtonText: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //   },
// // // //   filterButtonTextActive: {
// // // //     color: '#FFFFFF',
// // // //     fontWeight: '600',
// // // //   },
// // // //   legendContainer: {
// // // //     backgroundColor: '#FFFFFF',
// // // //     padding: 16,
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: '#E5E7EB',
// // // //   },
// // // //   legendTitle: {
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //     color: '#374151',
// // // //     marginBottom: 12,
// // // //   },
// // // //   legendItems: {
// // // //     flexDirection: 'row',
// // // //     flexWrap: 'wrap',
// // // //     gap: 16,
// // // //   },
// // // //   legendItem: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //   },
// // // //   legendDot: {
// // // //     width: 12,
// // // //     height: 12,
// // // //     borderRadius: 6,
// // // //   },
// // // //   legendText: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //   },
// // // //   calendarContainer: {
// // // //     backgroundColor: '#FFFFFF',
// // // //     margin: 16,
// // // //     borderRadius: 12,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 4,
// // // //     elevation: 3,
// // // //   },
// // // //   calender: {
// // // //     borderRadius: 12,
// // // //   },
// // // //   emptyContainer: {
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //     padding: 40,
// // // //     backgroundColor: '#FFFFFF',
// // // //     margin: 16,
// // // //     borderRadius: 12,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 4,
// // // //     elevation: 3,
// // // //   },
// // // //   emptyText: {
// // // //     fontSize: 18,
// // // //     color: '#374151',
// // // //     fontWeight: '600',
// // // //     marginTop: 16,
// // // //   },
// // // //   emptySubtext: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //     marginTop: 4,
// // // //   },
// // // //   statsContainer: {
// // // //     backgroundColor: '#FFFFFF',
// // // //     padding: 16,
// // // //     margin: 16,
// // // //     marginBottom: 32,
// // // //     borderRadius: 12,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.1,
// // // //     shadowRadius: 4,
// // // //     elevation: 3,
// // // //   },
// // // //   statsTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: '600',
// // // //     color: '#111827',
// // // //     marginBottom: 16,
// // // //   },
// // // //   statsGrid: {
// // // //     flexDirection: 'row',
// // // //     flexWrap: 'wrap',
// // // //     gap: 12,
// // // //   },
// // // //   statCard: {
// // // //     flex: 1,
// // // //     minWidth: '45%',
// // // //     padding: 16,
// // // //     backgroundColor: '#F9FAFB',
// // // //     borderRadius: 8,
// // // //     alignItems: 'center',
// // // //   },
// // // //   statNumber: {
// // // //     fontSize: 24,
// // // //     fontWeight: 'bold',
// // // //     color: '#111827',
// // // //   },
// // // //   statLabel: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //     marginTop: 4,
// // // //   },
// // // //   modalOverlay: {
// // // //     flex: 1,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // //     justifyContent: 'flex-end',
// // // //   },
// // // //   modalContainer: {
// // // //     backgroundColor: '#FFFFFF',
// // // //     borderTopLeftRadius: 20,
// // // //     borderTopRightRadius: 20,
// // // //     maxHeight: '80%',
// // // //   },
// // // //   modalHeader: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     padding: 20,
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: '#E5E7EB',
// // // //   },
// // // //   modalTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: '600',
// // // //     color: '#111827',
// // // //   },
// // // //   modalCloseButton: {
// // // //     padding: 4,
// // // //   },
// // // //   modalCloseText: {
// // // //     fontSize: 20,
// // // //     color: '#6B7280',
// // // //   },
// // // //   modalContent: {
// // // //     padding: 20,
// // // //     maxHeight: 400,
// // // //   },
// // // //   modalFooter: {
// // // //     padding: 20,
// // // //     borderTopWidth: 1,
// // // //     borderTopColor: '#E5E7EB',
// // // //   },
// // // //   modalButton: {
// // // //     backgroundColor: '#3B82F6',
// // // //     padding: 16,
// // // //     borderRadius: 8,
// // // //     alignItems: 'center',
// // // //   },
// // // //   modalButtonText: {
// // // //     color: '#FFFFFF',
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //   },
// // // //   periodCard: {
// // // //     padding: 16,
// // // //     backgroundColor: '#F9FAFB',
// // // //     borderRadius: 8,
// // // //     marginBottom: 12,
// // // //   },
// // // //   periodCardHeader: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     marginBottom: 12,
// // // //   },
// // // //   periodFacilityName: {
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //     color: '#111827',
// // // //     flex: 1,
// // // //   },
// // // //   periodBadge: {
// // // //     paddingHorizontal: 8,
// // // //     paddingVertical: 4,
// // // //     borderRadius: 12,
// // // //   },
// // // //   periodBadgeText: {
// // // //     fontSize: 12,
// // // //     fontWeight: '600',
// // // //   },
// // // //   periodDetail: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //     marginBottom: 8,
// // // //   },
// // // //   paymentStatusContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //     marginTop: 8,
// // // //   },
// // // //   paymentBadge: {
// // // //     paddingHorizontal: 8,
// // // //     paddingVertical: 4,
// // // //     borderRadius: 12,
// // // //   },
// // // //   paymentBadgeText: {
// // // //     fontSize: 12,
// // // //     fontWeight: '600',
// // // //   },
// // // // });

// // // // export default calender;

// // // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   ScrollView,
// // //   TouchableOpacity,
// // //   Modal,
// // //   RefreshControl,
// // //   ActivityIndicator,
// // //   SafeAreaView,
// // //   Alert,
// // //   Dimensions,
// // //   Platform,
// // //   TextInput,
// // //   FlatList
// // // } from 'react-native';
// // // import { Calendar } from 'react-native-calendars';
// // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // import axios from 'axios';
// // // import { useAuth } from '../auth/contexts/AuthContext';
// // // import Icon from 'react-native-vector-icons/MaterialIcons';

// // // const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // // // Date Utilities
// // // const dateUtils = {
// // //   format: (date, formatStr) => {
// // //     const d = new Date(date);
// // //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// // //     const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// // //     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// // //     if (formatStr === 'MMM d') {
// // //       return `${months[d.getMonth()]} ${d.getDate()}`;
// // //     } else if (formatStr === 'EEE') {
// // //       return days[d.getDay()];
// // //     } else if (formatStr === 'MMM d, yyyy') {
// // //       return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// // //     } else if (formatStr === 'MMMM d, yyyy') {
// // //       return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// // //     } else if (formatStr === 'yyyy-MM-dd') {
// // //       return d.toISOString().split('T')[0];
// // //     } else if (formatStr === 'MMM') {
// // //       return months[d.getMonth()];
// // //     } else if (formatStr === 'yyyy') {
// // //       return d.getFullYear().toString();
// // //     }
// // //     return d.toString();
// // //   },

// // //   parseISO: (dateString) => {
// // //     return new Date(dateString);
// // //   },

// // //   isSameDay: (date1, date2) => {
// // //     const d1 = new Date(date1);
// // //     const d2 = new Date(date2);
// // //     return d1.getFullYear() === d2.getFullYear() &&
// // //       d1.getMonth() === d2.getMonth() &&
// // //       d1.getDate() === d2.getDate();
// // //   },

// // //   addDays: (date, days) => {
// // //     const result = new Date(date);
// // //     result.setDate(result.getDate() + days);
// // //     return result;
// // //   },

// // //   differenceInDays: (date1, date2) => {
// // //     const d1 = new Date(date1);
// // //     const d2 = new Date(date2);
// // //     const diffTime = Math.abs(d2 - d1);
// // //     return Math.floor(diffTime / (1000 * 60 * 60 * 24));
// // //   },

// // //   startOfDay: (date) => {
// // //     const result = new Date(date);
// // //     result.setHours(0, 0, 0, 0);
// // //     return result;
// // //   },

// // //   startOfWeek: (date) => {
// // //     const result = new Date(date);
// // //     const day = result.getDay();
// // //     const diff = result.getDate() - day + (day === 0 ? -6 : 1);
// // //     result.setDate(diff);
// // //     result.setHours(0, 0, 0, 0);
// // //     return result;
// // //   },

// // //   endOfWeek: (date) => {
// // //     const result = dateUtils.startOfWeek(date);
// // //     result.setDate(result.getDate() + 6);
// // //     result.setHours(23, 59, 59, 999);
// // //     return result;
// // //   },

// // //   startOfMonth: (date) => {
// // //     const result = new Date(date);
// // //     result.setDate(1);
// // //     result.setHours(0, 0, 0, 0);
// // //     return result;
// // //   },

// // //   endOfMonth: (date) => {
// // //     const result = new Date(date);
// // //     result.setMonth(result.getMonth() + 1, 0);
// // //     result.setHours(23, 59, 59, 999);
// // //     return result;
// // //   },

// // //   eachDayOfInterval: (interval) => {
// // //     const days = [];
// // //     let current = new Date(interval.start);
// // //     const end = new Date(interval.end);

// // //     while (current <= end) {
// // //       days.push(new Date(current));
// // //       current.setDate(current.getDate() + 1);
// // //     }

// // //     return days;
// // //   },
// // // };

// // // const calender = ({ navigation }) => {
// // //   const [currentDate, setCurrentDate] = useState(new Date());
// // //   const [selectedFacilityType, setSelectedFacilityType] = useState('ROOMS');
// // //   const [selectedRoomType, setSelectedRoomType] = useState('ALL');
// // //   const [selectedRoom, setSelectedRoom] = useState(null);
// // //   const [selectedPeriod, setSelectedPeriod] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [refreshing, setRefreshing] = useState(false);

// // //   const [rooms, setRooms] = useState([]);
// // //   const [halls, setHalls] = useState([]);
// // //   const [lawns, setLawns] = useState([]);
// // //   const [photoshoots, setPhotoshoots] = useState([]);

// // //   const { user } = useAuth();

// // //   // New states for search and filters
// // //   const [searchQuery, setSearchQuery] = useState('');
// // //   const [selectedDate, setSelectedDate] = useState(dateUtils.format(new Date(), 'yyyy-MM-dd'));
// // //   const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
// // //   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
// // //   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
// // //   const [showFacilityFilter, setShowFacilityFilter] = useState(false);
// // //   const [dateFilter, setDateFilter] = useState('none'); // 'none', 'week', 'month', 'custom'
// // //   const [customDateRange, setCustomDateRange] = useState({
// // //     start: null,
// // //     end: null
// // //   });

// // //   // Fetch data function
// // //   const fetchData = useCallback(async () => {
// // //     if (!user) return;

// // //     try {
// // //       setLoading(true);

// // //       // Get token from AsyncStorage
// // //       const token = await AsyncStorage.getItem('access_token');

// // //       // Create headers
// // //       const headers = {
// // //         'Content-Type': 'application/json',
// // //         ...(token && { Authorization: `Bearer ${token}` }),
// // //       };

// // //       // Define base URL
// // //       const baseURL = Platform.OS === 'android' ? 'http://193.203.169.122:8080/api' : 'http://localhost:3000';

// // //       // Fetch data based on selected facility type
// // //       if (selectedFacilityType === 'ROOMS') {
// // //         try {
// // //           const response = await axios.get(`${baseURL}/room/calendar`, { headers });
// // //           setRooms(response.data || []);
// // //         } catch (error) {
// // //           console.error('Error fetching rooms:', error);
// // //           setRooms([]);
// // //         }
// // //       }

// // //       if (selectedFacilityType === 'HALLS') {
// // //         try {
// // //           const response = await axios.get(`${baseURL}/hall/get/halls`, { headers });
// // //           setHalls(response.data || []);
// // //         } catch (error) {
// // //           console.error('Error fetching halls:', error);
// // //           setHalls([]);
// // //         }
// // //       }

// // //       if (selectedFacilityType === 'LAWNS') {
// // //         try {
// // //           const response = await axios.get(`${baseURL}/lawn/get/lawns`, { headers });
// // //           setLawns(response.data || []);
// // //         } catch (error) {
// // //           console.error('Error fetching lawns:', error);
// // //           setLawns([]);
// // //         }
// // //       }

// // //       if (selectedFacilityType === 'PHOTOSHOOTS') {
// // //         try {
// // //           const response = await axios.get(`${baseURL}/photoShoot/get/photoShoots`, { headers });
// // //           setPhotoshoots(response.data || []);
// // //         } catch (error) {
// // //           console.error('Error fetching photoshoots:', error);
// // //           setPhotoshoots([]);
// // //         }
// // //       }

// // //     } catch (error) {
// // //       console.error('Error fetching calendar data:', error);
// // //       Alert.alert('Error', 'Failed to load calendar data');
// // //     } finally {
// // //       setLoading(false);
// // //       setRefreshing(false);
// // //     }
// // //   }, [user, selectedFacilityType]);

// // //   useEffect(() => {
// // //     fetchData();
// // //   }, [fetchData]);

// // //   const onRefresh = useCallback(() => {
// // //     setRefreshing(true);
// // //     fetchData();
// // //   }, [fetchData]);

// // //   // Get current facility data
// // //   const getCurrentFacilities = () => {
// // //     switch (selectedFacilityType) {
// // //       case 'ROOMS':
// // //         return rooms;
// // //       case 'HALLS':
// // //         return halls;
// // //       case 'LAWNS':
// // //         return lawns;
// // //       case 'PHOTOSHOOTS':
// // //         return photoshoots;
// // //       default:
// // //         return [];
// // //     }
// // //   };

// // //   // Filter facilities based on various criteria
// // //   const getFilteredFacilities = () => {
// // //     let facilities = getCurrentFacilities();

// // //     // Apply room type filter for ROOMS
// // //     if (selectedFacilityType === 'ROOMS' && selectedRoomType !== 'ALL') {
// // //       facilities = facilities.filter(room => room.roomType?.type === selectedRoomType);
// // //     }

// // //     // Apply specific room filter
// // //     if (selectedFacilityType === 'ROOMS' && selectedRoom) {
// // //       facilities = facilities.filter(room => room.id.toString() === selectedRoom);
// // //     }

// // //     // Apply search filter
// // //     if (searchQuery.trim() !== '') {
// // //       const query = searchQuery.toLowerCase();
// // //       facilities = facilities.filter(facility => {
// // //         if (selectedFacilityType === 'ROOMS') {
// // //           return (
// // //             (facility.roomNumber && facility.roomNumber.toLowerCase().includes(query)) ||
// // //             (facility.roomNo && facility.roomNo.toString().includes(query)) ||
// // //             (facility.name && facility.name.toLowerCase().includes(query)) ||
// // //             (facility.roomType?.type && facility.roomType.type.toLowerCase().includes(query))
// // //           );
// // //         }
// // //         return (
// // //           (facility.name && facility.name.toLowerCase().includes(query)) ||
// // //           (facility.title && facility.title.toLowerCase().includes(query)) ||
// // //           (facility.location && facility.location.toLowerCase().includes(query))
// // //         );
// // //       });
// // //     }

// // //     return facilities;
// // //   };

// // //   // Get facility status for a specific date
// // //   const getFacilityStatus = useCallback((facility, date) => {
// // //     const selectedDateObj = dateUtils.parseISO(date);

// // //     // Check bookings
// // //     if (facility.bookings && facility.bookings.length > 0) {
// // //       for (const booking of facility.bookings) {
// // //         const startDate = dateUtils.parseISO(
// // //           booking.checkIn || booking.bookingDate || booking.date ||
// // //           booking.shootDate || booking.eventDate || booking.createdAt
// // //         );
// // //         const endDate = dateUtils.parseISO(
// // //           booking.checkOut || booking.bookingDate || booking.date ||
// // //           booking.shootDate || booking.eventDate || booking.createdAt
// // //         );

// // //         // For single day events
// // //         if (!booking.checkIn && !booking.checkOut) {
// // //           if (dateUtils.isSameDay(selectedDateObj, startDate)) {
// // //             return {
// // //               status: 'booked',
// // //               type: 'booking',
// // //               data: booking,
// // //               color: booking.paymentStatus === 'CANCELLED' ? '#6B7280' : '#3B82F6'
// // //             };
// // //           }
// // //         } else {
// // //           // For date ranges
// // //           if (selectedDateObj >= dateUtils.startOfDay(startDate) && 
// // //               selectedDateObj <= dateUtils.startOfDay(endDate)) {
// // //             return {
// // //               status: booking.paymentStatus === 'CANCELLED' ? 'cancelled' : 'booked',
// // //               type: 'booking',
// // //               data: booking,
// // //               color: booking.paymentStatus === 'CANCELLED' ? '#6B7280' : '#3B82F6'
// // //             };
// // //           }
// // //         }
// // //       }
// // //     }

// // //     // Check reservations
// // //     if (facility.reservations && facility.reservations.length > 0) {
// // //       for (const reservation of facility.reservations) {
// // //         const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
// // //         const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

// // //         if (selectedDateObj >= startDate && selectedDateObj <= endDate) {
// // //           return {
// // //             status: 'reserved',
// // //             type: 'reservation',
// // //             data: reservation,
// // //             color: '#F59E0B'
// // //           };
// // //         }
// // //       }
// // //     }

// // //     // Check out of orders
// // //     if (facility.outOfOrders && facility.outOfOrders.length > 0) {
// // //       for (const outOfOrder of facility.outOfOrders) {
// // //         const startDate = dateUtils.parseISO(outOfOrder.startDate);
// // //         const endDate = dateUtils.parseISO(outOfOrder.endDate);

// // //         if (selectedDateObj >= startDate && selectedDateObj <= endDate) {
// // //           return {
// // //             status: 'outOfOrder',
// // //             type: 'outOfOrder',
// // //             data: outOfOrder,
// // //             color: '#EF4444'
// // //           };
// // //         }
// // //       }
// // //     }

// // //     return {
// // //       status: 'available',
// // //       type: 'available',
// // //       data: null,
// // //       color: '#10B981'
// // //     };
// // //   }, []);

// // //   // Generate marked dates for calendar with different colors
// // //   const getMarkedDates = useMemo(() => {
// // //     const facilities = getFilteredFacilities();
// // //     const marks = {};
// // //     const today = dateUtils.format(new Date(), 'yyyy-MM-dd');

// // //     // First, set today and selectedDate without overwriting dots
// // //     marks[today] = {
// // //       ...marks[today],
// // //       customStyles: {
// // //         container: {
// // //           backgroundColor: '#F3F4F6',
// // //           borderRadius: 8,
// // //         },
// // //         text: {
// // //           color: '#3B82F6',
// // //           fontWeight: 'bold',
// // //         }
// // //       }
// // //     };

// // //     // Add selected date styling
// // //     if (selectedDate) {
// // //       marks[selectedDate] = {
// // //         ...marks[selectedDate],
// // //         selected: true,
// // //         selectedColor: '#D9A46C',
// // //         customStyles: {
// // //           container: {
// // //             backgroundColor: '#D9A46C',
// // //             borderRadius: 8,
// // //           },
// // //           text: {
// // //             color: '#FFFFFF',
// // //             fontWeight: 'bold',
// // //           }
// // //         }
// // //       };
// // //     }

// // //     // Add marks for each facility's status on each date
// // //     facilities.forEach(facility => {
// // //       // Check for date range filters
// // //       const startDateFilter = dateFilter === 'week' ? dateUtils.startOfWeek(dateUtils.parseISO(selectedDate)) :
// // //                             dateFilter === 'month' ? dateUtils.startOfMonth(dateUtils.parseISO(selectedDate)) :
// // //                             customDateRange.start;

// // //       const endDateFilter = dateFilter === 'week' ? dateUtils.endOfWeek(dateUtils.parseISO(selectedDate)) :
// // //                           dateFilter === 'month' ? dateUtils.endOfMonth(dateUtils.parseISO(selectedDate)) :
// // //                           customDateRange.end;

// // //       // Process bookings
// // //       if (facility.bookings && facility.bookings.length > 0) {
// // //         facility.bookings.forEach(booking => {
// // //           const startDate = dateUtils.parseISO(
// // //             booking.checkIn || booking.bookingDate || booking.date ||
// // //             booking.shootDate || booking.eventDate || booking.createdAt
// // //           );
// // //           const endDate = dateUtils.parseISO(
// // //             booking.checkOut || booking.bookingDate || booking.date ||
// // //             booking.shootDate || booking.eventDate || booking.createdAt
// // //           );

// // //           // Skip if outside filter range
// // //           if (startDateFilter && endDateFilter) {
// // //             if (endDate < startDateFilter || startDate > endDateFilter) {
// // //               return;
// // //             }
// // //           }

// // //           // For single day events
// // //           if (!booking.checkIn && !booking.checkOut) {
// // //             const dateString = dateUtils.format(startDate, 'yyyy-MM-dd');
// // //             if (!marks[dateString]) marks[dateString] = { dots: [] };
// // //             else if (!marks[dateString].dots) marks[dateString].dots = [];

// // //             const color = booking.paymentStatus === 'CANCELLED' ? '#6B7280' : '#3B82F6';
// // //             if (!marks[dateString].dots.some(dot => dot.key === `${facility.id}-booking-${booking.id}`)) {
// // //               marks[dateString].dots.push({
// // //                 key: `${facility.id}-booking-${booking.id}`,
// // //                 color,
// // //                 selectedDotColor: color
// // //               });
// // //             }
// // //           } else {
// // //             // For date ranges
// // //             let currentDate = new Date(startDate);
// // //             while (currentDate <= endDate) {
// // //               const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// // //               if (!marks[dateString]) marks[dateString] = { dots: [] };
// // //               else if (!marks[dateString].dots) marks[dateString].dots = [];

// // //               const color = booking.paymentStatus === 'CANCELLED' ? '#6B7280' : '#3B82F6';
// // //               if (!marks[dateString].dots.some(dot => dot.key === `${facility.id}-booking-${booking.id}`)) {
// // //                 marks[dateString].dots.push({
// // //                   key: `${facility.id}-booking-${booking.id}`,
// // //                   color,
// // //                   selectedDotColor: color
// // //                 });
// // //               }
// // //               currentDate.setDate(currentDate.getDate() + 1);
// // //             }
// // //           }
// // //         });
// // //       }

// // //       // Process reservations
// // //       if (facility.reservations && facility.reservations.length > 0) {
// // //         facility.reservations.forEach(reservation => {
// // //           const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
// // //           const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

// // //           // Skip if outside filter range
// // //           if (startDateFilter && endDateFilter) {
// // //             if (endDate < startDateFilter || startDate > endDateFilter) {
// // //               return;
// // //             }
// // //           }

// // //           let currentDate = new Date(startDate);
// // //           while (currentDate <= endDate) {
// // //             const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// // //             if (!marks[dateString]) marks[dateString] = { dots: [] };
// // //             else if (!marks[dateString].dots) marks[dateString].dots = [];

// // //             if (!marks[dateString].dots.some(dot => dot.key === `${facility.id}-reservation-${reservation.id}`)) {
// // //               marks[dateString].dots.push({
// // //                 key: `${facility.id}-reservation-${reservation.id}`,
// // //                 color: '#F59E0B',
// // //                 selectedDotColor: '#F59E0B'
// // //               });
// // //             }
// // //             currentDate.setDate(currentDate.getDate() + 1);
// // //           }
// // //         });
// // //       }

// // //       // Process out of orders
// // //       if (facility.outOfOrders && facility.outOfOrders.length > 0) {
// // //         facility.outOfOrders.forEach(outOfOrder => {
// // //           const startDate = dateUtils.parseISO(outOfOrder.startDate);
// // //           const endDate = dateUtils.parseISO(outOfOrder.endDate);

// // //           // Skip if outside filter range
// // //           if (startDateFilter && endDateFilter) {
// // //             if (endDate < startDateFilter || startDate > endDateFilter) {
// // //               return;
// // //             }
// // //           }

// // //           let currentDate = new Date(startDate);
// // //           while (currentDate <= endDate) {
// // //             const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// // //             if (!marks[dateString]) marks[dateString] = { dots: [] };
// // //             else if (!marks[dateString].dots) marks[dateString].dots = [];

// // //             if (!marks[dateString].dots.some(dot => dot.key === `${facility.id}-outoforder-${outOfOrder.id}`)) {
// // //               marks[dateString].dots.push({
// // //                 key: `${facility.id}-outoforder-${outOfOrder.id}`,
// // //                 color: '#EF4444',
// // //                 selectedDotColor: '#EF4444'
// // //               });
// // //             }
// // //             currentDate.setDate(currentDate.getDate() + 1);
// // //           }
// // //         });
// // //       }
// // //     });

// // //     return marks;
// // //   }, [selectedFacilityType, rooms, halls, lawns, photoshoots, selectedRoomType, selectedRoom, searchQuery, selectedDate, dateFilter, customDateRange]);

// // //   // Get events for a specific date
// // //   const getEventsForDate = useCallback((date) => {
// // //     const facilities = getFilteredFacilities();
// // //     const selectedDateObj = dateUtils.parseISO(date.dateString || date);
// // //     const periodsOnDate = [];

// // //     facilities.forEach(facility => {
// // //       const status = getFacilityStatus(facility, date.dateString || date);
// // //       if (status.status !== 'available') {
// // //         periodsOnDate.push({
// // //           facility,
// // //           type: status.type,
// // //           data: status.data,
// // //           isCancelled: status.status === 'cancelled',
// // //           isConfirmed: status.data?.status === 'CONFIRMED',
// // //           color: status.color
// // //         });
// // //       }
// // //     });

// // //     return periodsOnDate;
// // //   }, [getFacilityStatus, getFilteredFacilities]);

// // //   // Get week days for week view
// // //   const getWeekDays = useMemo(() => {
// // //     const startOfWeek = dateUtils.startOfWeek(dateUtils.parseISO(selectedDate));
// // //     const days = [];

// // //     for (let i = 0; i < 7; i++) {
// // //       const date = new Date(startOfWeek);
// // //       date.setDate(startOfWeek.getDate() + i);
// // //       days.push(date);
// // //     }
// // //     return days;
// // //   }, [selectedDate]);

// // //   // Render facility list for selected date
// // //   const renderFacilityList = () => {
// // //     const facilities = getFilteredFacilities();

// // //     if (facilities.length === 0) {
// // //       return (
// // //         <View style={styles.emptyState}>
// // //           <Icon name="search-off" size={48} color="#CBD5E1" />
// // //           <Text style={styles.emptyStateText}>
// // //             No {selectedFacilityType.toLowerCase()} found matching your search
// // //           </Text>
// // //         </View>
// // //       );
// // //     }

// // //     return facilities.map(facility => {
// // //       const status = getFacilityStatus(facility, selectedDate);

// // //       return (
// // //         <TouchableOpacity
// // //           key={facility.id}
// // //           style={[
// // //             styles.facilityListItem,
// // //             status.status !== 'available' && styles.facilityListItemActive
// // //           ]}
// // //           onPress={() => {
// // //             if (status.status !== 'available') {
// // //               setSelectedPeriod({
// // //                 date: dateUtils.parseISO(selectedDate),
// // //                 periods: [{
// // //                   facility,
// // //                   type: status.type,
// // //                   data: status.data,
// // //                   isCancelled: status.status === 'cancelled',
// // //                   color: status.color
// // //                 }]
// // //               });
// // //             }
// // //           }}
// // //         >
// // //           <View style={styles.facilityListContent}>
// // //             <View style={styles.facilityHeader}>
// // //               <Text style={styles.facilityListName}>
// // //                 {getFacilityName(facility)}
// // //               </Text>
// // //               {selectedFacilityType === 'ROOMS' && facility.roomType?.type && (
// // //                 <Text style={styles.facilityListType}>{facility.roomType.type}</Text>
// // //               )}
// // //             </View>

// // //             {selectedFacilityType === 'ROOMS' && facility.roomNumber && (
// // //               <Text style={styles.facilityDetail}>Room No: {facility.roomNumber}</Text>
// // //             )}

// // //             {selectedFacilityType === 'ROOMS' && facility.floor && (
// // //               <Text style={styles.facilityDetail}>Floor: {facility.floor}</Text>
// // //             )}

// // //             {facility.capacity && (
// // //               <Text style={styles.facilityDetail}>Capacity: {facility.capacity} people</Text>
// // //             )}
// // //           </View>

// // //           <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
// // //             <View style={[styles.statusDot, { backgroundColor: status.color }]} />
// // //             <Text style={[styles.statusText, { color: status.color }]}>
// // //               {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
// // //             </Text>
// // //           </View>
// // //         </TouchableOpacity>
// // //       );
// // //     });
// // //   };

// // //   // Custom Day Component
// // //   const DayComponent = ({ date, state, marking }) => {
// // //     const isSelected = date.dateString === selectedDate;
// // //     const isToday = dateUtils.isSameDay(new Date(), date.dateString);
// // //     const hasEvents = marking?.dots?.length > 0;

// // //     return (
// // //       <TouchableOpacity 
// // //         style={styles.dayWrapper} 
// // //         onPress={() => {
// // //           setSelectedDate(date.dateString);
// // //           const events = getEventsForDate(date);
// // //           if (events.length > 0) {
// // //             setSelectedPeriod({
// // //               date: dateUtils.parseISO(date.dateString),
// // //               periods: events,
// // //             });
// // //           }
// // //         }}
// // //         disabled={state === 'disabled'}
// // //       >
// // //         <View style={[
// // //           styles.dayCircle,
// // //           isToday && !isSelected && styles.todayOutline,
// // //           isSelected && styles.selectedDayCircle,
// // //           hasEvents && styles.hasEventsDay,
// // //           state === 'disabled' && styles.disabledDay
// // //         ]}>
// // //           <Text style={[
// // //             styles.dayText,
// // //             state === 'disabled' && styles.disabledText,
// // //             isSelected && styles.selectedDayText,
// // //             isToday && !isSelected && styles.todayText
// // //           ]}>
// // //             {date.day}
// // //           </Text>

// // //           {/* Status dots */}
// // //           {hasEvents && (
// // //             <View style={styles.dotsContainer}>
// // //               {marking.dots.slice(0, 3).map((dot, index) => (
// // //                 <View 
// // //                   key={dot.key || index}
// // //                   style={[styles.dot, { backgroundColor: dot.color }]} 
// // //                 />
// // //               ))}
// // //               {marking.dots.length > 3 && (
// // //                 <Text style={styles.moreDotsText}>+{marking.dots.length - 3}</Text>
// // //               )}
// // //             </View>
// // //           )}
// // //         </View>
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   // Get facility type display name
// // //   const getFacilityTypeName = (type) => {
// // //     switch (type) {
// // //       case 'ROOMS':
// // //         return 'Rooms';
// // //       case 'HALLS':
// // //         return 'Halls';
// // //       case 'LAWNS':
// // //         return 'Lawns';
// // //       case 'PHOTOSHOOTS':
// // //         return 'Photoshoots';
// // //       default:
// // //         return 'Rooms';
// // //     }
// // //   };

// // //   // Get facility name
// // //   const getFacilityName = (facility) => {
// // //     if (selectedFacilityType === 'ROOMS') {
// // //       return `Room ${facility.roomNumber || facility.roomNo || facility.id}`;
// // //     }
// // //     return facility.name || facility.title || `Facility ${facility.id}`;
// // //   };

// // //   // Filter Modal Component
// // //   const FilterModal = () => (
// // //     <Modal
// // //       visible={showFacilityFilter}
// // //       transparent
// // //       animationType="slide"
// // //       onRequestClose={() => setShowFacilityFilter(false)}
// // //     >
// // //       <View style={styles.filterModalOverlay}>
// // //         <View style={styles.filterModalContainer}>
// // //           <View style={styles.filterModalHeader}>
// // //             <Text style={styles.filterModalTitle}>Filter Facilities</Text>
// // //             <TouchableOpacity onPress={() => setShowFacilityFilter(false)}>
// // //               <Icon name="close" size={24} color="#64748B" />
// // //             </TouchableOpacity>
// // //           </View>

// // //           <ScrollView style={styles.filterModalContent}>
// // //             {selectedFacilityType === 'ROOMS' && (
// // //               <>
// // //                 <Text style={styles.filterSectionTitle}>Room Type</Text>
// // //                 <View style={styles.filterButtons}>
// // //                   {['ALL', ...new Set(rooms.map(room => room.roomType?.type).filter(Boolean))].map(type => (
// // //                     <TouchableOpacity
// // //                       key={type}
// // //                       style={[
// // //                         styles.filterButton,
// // //                         selectedRoomType === type && styles.filterButtonActive
// // //                       ]}
// // //                       onPress={() => {
// // //                         setSelectedRoomType(type);
// // //                         setSelectedRoom(null);
// // //                       }}
// // //                     >
// // //                       <Text style={[
// // //                         styles.filterButtonText,
// // //                         selectedRoomType === type && styles.filterButtonTextActive
// // //                       ]}>
// // //                         {type === 'ALL' ? 'All Types' : type}
// // //                       </Text>
// // //                     </TouchableOpacity>
// // //                   ))}
// // //                 </View>

// // //                 <Text style={styles.filterSectionTitle}>Specific Room</Text>
// // //                 <View style={styles.filterButtons}>
// // //                   <TouchableOpacity
// // //                     style={[
// // //                       styles.filterButton,
// // //                       !selectedRoom && styles.filterButtonActive
// // //                     ]}
// // //                     onPress={() => setSelectedRoom(null)}
// // //                   >
// // //                     <Text style={[
// // //                       styles.filterButtonText,
// // //                       !selectedRoom && styles.filterButtonTextActive
// // //                     ]}>
// // //                       All Rooms
// // //                     </Text>
// // //                   </TouchableOpacity>

// // //                   {rooms
// // //                     .filter(room => selectedRoomType === 'ALL' || room.roomType?.type === selectedRoomType)
// // //                     .map(room => (
// // //                       <TouchableOpacity
// // //                         key={room.id}
// // //                         style={[
// // //                           styles.filterButton,
// // //                           selectedRoom === room.id.toString() && styles.filterButtonActive
// // //                         ]}
// // //                         onPress={() => setSelectedRoom(selectedRoom === room.id.toString() ? null : room.id.toString())}
// // //                       >
// // //                         <Text style={[
// // //                           styles.filterButtonText,
// // //                           selectedRoom === room.id.toString() && styles.filterButtonTextActive
// // //                         ]}>
// // //                           {room.roomNumber || room.roomNo || `Room ${room.id}`}
// // //                         </Text>
// // //                       </TouchableOpacity>
// // //                     ))}
// // //                 </View>
// // //               </>
// // //             )}

// // //             <Text style={styles.filterSectionTitle}>Date Filter</Text>
// // //             <View style={styles.dateFilterContainer}>
// // //               <TouchableOpacity 
// // //                 style={[
// // //                   styles.dateFilterButton,
// // //                   dateFilter === 'none' && styles.dateFilterButtonActive
// // //                 ]}
// // //                 onPress={() => setDateFilter('none')}
// // //               >
// // //                 <Icon name="calendar-today" size={20} color={dateFilter === 'none' ? '#FFFFFF' : '#64748B'} />
// // //                 <Text style={[
// // //                   styles.dateFilterButtonText,
// // //                   dateFilter === 'none' && styles.dateFilterButtonTextActive
// // //                 ]}>
// // //                   All Dates
// // //                 </Text>
// // //               </TouchableOpacity>

// // //               <TouchableOpacity 
// // //                 style={[
// // //                   styles.dateFilterButton,
// // //                   dateFilter === 'week' && styles.dateFilterButtonActive
// // //                 ]}
// // //                 onPress={() => setDateFilter('week')}
// // //               >
// // //                 <Icon name="view-week" size={20} color={dateFilter === 'week' ? '#FFFFFF' : '#64748B'} />
// // //                 <Text style={[
// // //                   styles.dateFilterButtonText,
// // //                   dateFilter === 'week' && styles.dateFilterButtonTextActive
// // //                 ]}>
// // //                   This Week
// // //                 </Text>
// // //               </TouchableOpacity>

// // //               <TouchableOpacity 
// // //                 style={[
// // //                   styles.dateFilterButton,
// // //                   dateFilter === 'month' && styles.dateFilterButtonActive
// // //                 ]}
// // //                 onPress={() => setDateFilter('month')}
// // //               >
// // //                 <Icon name="date-range" size={20} color={dateFilter === 'month' ? '#FFFFFF' : '#64748B'} />
// // //                 <Text style={[
// // //                   styles.dateFilterButtonText,
// // //                   dateFilter === 'month' && styles.dateFilterButtonTextActive
// // //                 ]}>
// // //                   This Month
// // //                 </Text>
// // //               </TouchableOpacity>
// // //             </View>

// // //             {dateFilter === 'week' && (
// // //               <Text style={styles.dateFilterInfo}>
// // //                 Showing: {dateUtils.format(dateUtils.startOfWeek(dateUtils.parseISO(selectedDate)), 'MMM d')} - {dateUtils.format(dateUtils.endOfWeek(dateUtils.parseISO(selectedDate)), 'MMM d')}
// // //               </Text>
// // //             )}

// // //             {dateFilter === 'month' && (
// // //               <Text style={styles.dateFilterInfo}>
// // //                 Showing: {dateUtils.format(dateUtils.startOfMonth(dateUtils.parseISO(selectedDate)), 'MMM d')} - {dateUtils.format(dateUtils.endOfMonth(dateUtils.parseISO(selectedDate)), 'MMM d')}
// // //               </Text>
// // //             )}
// // //           </ScrollView>

// // //           <View style={styles.filterModalFooter}>
// // //             <TouchableOpacity 
// // //               style={styles.clearButton}
// // //               onPress={() => {
// // //                 setSelectedRoomType('ALL');
// // //                 setSelectedRoom(null);
// // //                 setDateFilter('none');
// // //                 setSearchQuery('');
// // //               }}
// // //             >
// // //               <Text style={styles.clearButtonText}>Clear All</Text>
// // //             </TouchableOpacity>
// // //             <TouchableOpacity 
// // //               style={styles.applyButton}
// // //               onPress={() => setShowFacilityFilter(false)}
// // //             >
// // //               <Text style={styles.applyButtonText}>Apply Filters</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );

// // //   if (loading && !refreshing) {
// // //     return (
// // //       <View style={styles.loadingContainer}>
// // //         <ActivityIndicator size="large" color="#D9A46C" />
// // //         <Text style={styles.loadingText}>Loading calendar data...</Text>
// // //       </View>
// // //     );
// // //   }

// // //   const facilities = getFilteredFacilities();

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <ScrollView
// // //         refreshControl={
// // //           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D9A46C']} />
// // //         }
// // //         style={styles.scrollView}
// // //         showsVerticalScrollIndicator={false}
// // //       >
// // //         {/* Header */}
// // //         <View style={styles.header}>
// // //           <TouchableOpacity
// // //             style={styles.backButton}
// // //             onPress={() => navigation.navigate('Home')}
// // //           >
// // //             <Icon name="arrow-back" size={24} color="#D9A46C" />
// // //             <Text style={styles.backText}>Back</Text>
// // //           </TouchableOpacity>
// // //           <Text style={styles.headerTitle}>Facility Calendar</Text>
// // //           <View style={styles.headerRight} />
// // //         </View>

// // //         {/* Search Bar */}
// // //         <View style={styles.searchContainer}>
// // //           <View style={styles.searchInputContainer}>
// // //             <Icon name="search" size={20} color="#64748B" />
// // //             <TextInput
// // //               style={styles.searchInput}
// // //               placeholder={`Search ${getFacilityTypeName(selectedFacilityType).toLowerCase()}...`}
// // //               value={searchQuery}
// // //               onChangeText={setSearchQuery}
// // //               placeholderTextColor="#94A3B8"
// // //             />
// // //             {searchQuery.length > 0 && (
// // //               <TouchableOpacity onPress={() => setSearchQuery('')}>
// // //                 <Icon name="close" size={20} color="#64748B" />
// // //               </TouchableOpacity>
// // //             )}
// // //           </View>
// // //           <TouchableOpacity 
// // //             style={styles.filterButtonMain}
// // //             onPress={() => setShowFacilityFilter(true)}
// // //           >
// // //             <Icon name="filter-list" size={22} color="#64748B" />
// // //             {(selectedRoomType !== 'ALL' || selectedRoom || dateFilter !== 'none') && (
// // //               <View style={styles.filterBadge} />
// // //             )}
// // //           </TouchableOpacity>
// // //         </View>

// // //         {/* View Mode Toggle */}
// // //         <View style={styles.viewModeContainer}>
// // //           {['month', 'week'].map(mode => (
// // //             <TouchableOpacity
// // //               key={mode}
// // //               style={[
// // //                 styles.viewModeButton,
// // //                 viewMode === mode && styles.viewModeButtonActive
// // //               ]}
// // //               onPress={() => setViewMode(mode)}
// // //             >
// // //               <Icon 
// // //                 name={mode === 'month' ? 'calendar-month' : 'view-week'} 
// // //                 size={20} 
// // //                 color={viewMode === mode ? '#FFFFFF' : '#64748B'} 
// // //               />
// // //               <Text style={[
// // //                 styles.viewModeButtonText,
// // //                 viewMode === mode && styles.viewModeButtonTextActive
// // //               ]}>
// // //                 {mode.charAt(0).toUpperCase() + mode.slice(1)}
// // //               </Text>
// // //             </TouchableOpacity>
// // //           ))}
// // //         </View>

// // //         {/* Facility Type Filter */}
// // //         <View style={styles.facilityTypeContainer}>
// // //           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilityTypeButtons}>
// // //             {['ROOMS', 'HALLS', 'LAWNS', 'PHOTOSHOOTS'].map((type) => (
// // //               <TouchableOpacity
// // //                 key={type}
// // //                 style={[
// // //                   styles.facilityTypeButton,
// // //                   selectedFacilityType === type && styles.facilityTypeButtonActive,
// // //                 ]}
// // //                 onPress={() => {
// // //                   setSelectedFacilityType(type);
// // //                   setSelectedRoomType('ALL');
// // //                   setSelectedRoom(null);
// // //                   setSearchQuery('');
// // //                 }}
// // //               >
// // //                 <Icon 
// // //                   name={
// // //                     type === 'ROOMS' ? 'meeting-room' :
// // //                     type === 'HALLS' ? 'event' :
// // //                     type === 'LAWNS' ? 'grass' : 'photo-camera'
// // //                   } 
// // //                   size={18} 
// // //                   color={selectedFacilityType === type ? '#FFFFFF' : '#64748B'} 
// // //                   style={styles.facilityTypeIcon}
// // //                 />
// // //                 <Text
// // //                   style={[
// // //                     styles.facilityTypeButtonText,
// // //                     selectedFacilityType === type && styles.facilityTypeButtonTextActive,
// // //                   ]}
// // //                 >
// // //                   {getFacilityTypeName(type)}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //             ))}
// // //           </ScrollView>
// // //         </View>

// // //         {/* Active Filters Info */}
// // //         {(selectedRoomType !== 'ALL' || selectedRoom || dateFilter !== 'none') && (
// // //           <View style={styles.activeFiltersContainer}>
// // //             <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
// // //             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
// // //               <View style={styles.activeFilters}>
// // //                 {selectedRoomType !== 'ALL' && (
// // //                   <View style={styles.activeFilterTag}>
// // //                     <Text style={styles.activeFilterText}>Type: {selectedRoomType}</Text>
// // //                     <TouchableOpacity onPress={() => setSelectedRoomType('ALL')}>
// // //                       <Icon name="close" size={14} color="#64748B" />
// // //                     </TouchableOpacity>
// // //                   </View>
// // //                 )}
// // //                 {selectedRoom && (
// // //                   <View style={styles.activeFilterTag}>
// // //                     <Text style={styles.activeFilterText}>
// // //                       Room: {rooms.find(r => r.id.toString() === selectedRoom)?.roomNumber || selectedRoom}
// // //                     </Text>
// // //                     <TouchableOpacity onPress={() => setSelectedRoom(null)}>
// // //                       <Icon name="close" size={14} color="#64748B" />
// // //                     </TouchableOpacity>
// // //                   </View>
// // //                 )}
// // //                 {dateFilter !== 'none' && (
// // //                   <View style={styles.activeFilterTag}>
// // //                     <Text style={styles.activeFilterText}>
// // //                       {dateFilter === 'week' ? 'This Week' : 'This Month'}
// // //                     </Text>
// // //                     <TouchableOpacity onPress={() => setDateFilter('none')}>
// // //                       <Icon name="close" size={14} color="#64748B" />
// // //                     </TouchableOpacity>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             </ScrollView>
// // //           </View>
// // //         )}

// // //         {/* Statistics */}
// // //         <View style={styles.statsWrapper}>
// // //           <View style={styles.statCardPrimary}>
// // //             <View style={styles.statCardPrimaryHeader}>
// // //               <Text style={styles.statCardPrimaryTitle}>Total {getFacilityTypeName(selectedFacilityType)}</Text>
// // //               <View style={styles.statCardBadge}>
// // //                 <Text style={styles.statCardBadgeText}>
// // //                   {facilities.length > 0 ? Math.round((facilities.filter(f => !f.isBooked && !f.isOutOfOrder).length / facilities.length) * 100) : 0}%
// // //                 </Text>
// // //               </View>
// // //             </View>
// // //             <View style={styles.statCardPrimaryContent}>
// // //               <Text style={styles.statCardPrimaryNumber}>{facilities.length}</Text>
// // //               <Text style={styles.statCardPrimarySubtitle}>{getFacilityTypeName(selectedFacilityType).toLowerCase()}</Text>
// // //             </View>
// // //             <View style={styles.progressBarContainer}>
// // //               <View style={[styles.progressBar, { width: `${facilities.length > 0 ? Math.round((facilities.filter(f => !f.isBooked && !f.isOutOfOrder).length / facilities.length) * 100) : 0}%` }]} />
// // //             </View>
// // //           </View>

// // //           <View style={styles.statsRow}>
// // //             <View style={styles.statCardSecondary}>
// // //               <Text style={styles.statCardSecondaryTitle}>Booked</Text>
// // //               <Text style={styles.statCardSecondarySubtitle}>Currently occupied</Text>
// // //               <Text style={[styles.statCardSecondaryNumber, styles.bookedNumber]}>
// // //                 {facilities.filter(f => f.isBooked).length}
// // //               </Text>
// // //             </View>

// // //             <View style={styles.statCardSecondary}>
// // //               <Text style={styles.statCardSecondaryTitle}>Available</Text>
// // //               <Text style={styles.statCardSecondarySubtitle}>Ready to book</Text>
// // //               <Text style={[styles.statCardSecondaryNumber, styles.availableNumber]}>
// // //                 {facilities.filter(f => !f.isBooked && !f.isOutOfOrder && !f.isReserved).length}
// // //               </Text>
// // //             </View>
// // //           </View>
// // //         </View>

// // //         {/* Calendar View */}
// // //         {viewMode === 'month' && (
// // //           <View style={styles.calendarCard}>
// // //             <View style={styles.calendarHeader}>
// // //               <TouchableOpacity onPress={() => {
// // //                 const prevMonth = new Date(selectedDate);
// // //                 prevMonth.setMonth(prevMonth.getMonth() - 1);
// // //                 setSelectedDate(dateUtils.format(prevMonth, 'yyyy-MM-dd'));
// // //               }}>
// // //                 <Icon name="chevron-left" size={24} color="#64748B" />
// // //               </TouchableOpacity>
// // //               <Text style={styles.calendarTitle}>
// // //                 {dateUtils.format(dateUtils.parseISO(selectedDate), 'MMMM yyyy')}
// // //               </Text>
// // //               <TouchableOpacity onPress={() => {
// // //                 const nextMonth = new Date(selectedDate);
// // //                 nextMonth.setMonth(nextMonth.getMonth() + 1);
// // //                 setSelectedDate(dateUtils.format(nextMonth, 'yyyy-MM-dd'));
// // //               }}>
// // //                 <Icon name="chevron-right" size={24} color="#64748B" />
// // //               </TouchableOpacity>
// // //             </View>
// // //             <Calendar
// // //               current={selectedDate}
// // //               dayComponent={DayComponent}
// // //               markedDates={getMarkedDates}
// // //               onMonthChange={(month) => {
// // //                 setSelectedMonth(month.month - 1);
// // //                 setSelectedYear(month.year);
// // //               }}
// // //               theme={{
// // //                 calendarBackground: '#ffffff',
// // //                 textSectionTitleColor: '#6B7280',
// // //                 selectedDayBackgroundColor: '#D9A46C',
// // //                 selectedDayTextColor: '#ffffff',
// // //                 todayTextColor: '#3B82F6',
// // //                 dayTextColor: '#374151',
// // //                 textDisabledColor: '#D1D5DB',
// // //                 arrowColor: '#D9A46C',
// // //                 monthTextColor: '#111827',
// // //                 textDayFontFamily: 'System',
// // //                 textMonthFontFamily: 'System',
// // //                 textDayHeaderFontFamily: 'System',
// // //                 textDayFontSize: 16,
// // //                 textMonthFontSize: 18,
// // //                 textDayHeaderFontSize: 14,
// // //                 'stylesheet.calendar.header': {
// // //                   week: {
// // //                     marginTop: 5,
// // //                     marginBottom: 5,
// // //                     flexDirection: 'row',
// // //                     justifyContent: 'space-around',
// // //                   },
// // //                 },
// // //               }}
// // //               style={styles.calendar}
// // //             />
// // //           </View>
// // //         )}

// // //         {/* Week View */}
// // //         {viewMode === 'week' && (
// // //           <View style={styles.weekViewContainer}>
// // //             <View style={styles.weekHeader}>
// // //               <TouchableOpacity onPress={() => {
// // //                 const prevWeek = new Date(selectedDate);
// // //                 prevWeek.setDate(prevWeek.getDate() - 7);
// // //                 setSelectedDate(dateUtils.format(prevWeek, 'yyyy-MM-dd'));
// // //               }}>
// // //                 <Icon name="chevron-left" size={24} color="#64748B" />
// // //               </TouchableOpacity>
// // //               <Text style={styles.weekTitle}>
// // //                 Week of {dateUtils.format(getWeekDays[0], 'MMM d')} - {dateUtils.format(getWeekDays[6], 'MMM d')}
// // //               </Text>
// // //               <TouchableOpacity onPress={() => {
// // //                 const nextWeek = new Date(selectedDate);
// // //                 nextWeek.setDate(nextWeek.getDate() + 7);
// // //                 setSelectedDate(dateUtils.format(nextWeek, 'yyyy-MM-dd'));
// // //               }}>
// // //                 <Icon name="chevron-right" size={24} color="#64748B" />
// // //               </TouchableOpacity>
// // //             </View>
// // //             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
// // //               <View style={styles.weekDaysContainer}>
// // //                 {getWeekDays.map(day => {
// // //                   const dateStr = dateUtils.format(day, 'yyyy-MM-dd');
// // //                   const isSelected = dateStr === selectedDate;
// // //                   const isToday = dateUtils.isSameDay(new Date(), day);
// // //                   const dayMarkings = getMarkedDates[dateStr];

// // //                   return (
// // //                     <TouchableOpacity
// // //                       key={dateStr}
// // //                       style={[styles.weekDayCard, isSelected && styles.weekDayCardSelected]}
// // //                       onPress={() => setSelectedDate(dateStr)}
// // //                     >
// // //                       <Text style={styles.weekDayName}>
// // //                         {dateUtils.format(day, 'EEE')}
// // //                       </Text>
// // //                       <View style={[
// // //                         styles.weekDayNumberContainer,
// // //                         isToday && !isSelected && styles.weekDayTodayContainer,
// // //                         isSelected && styles.weekDaySelectedContainer
// // //                       ]}>
// // //                         <Text style={[
// // //                           styles.weekDayNumber,
// // //                           isSelected && styles.weekDayNumberSelected
// // //                         ]}>
// // //                           {day.getDate()}
// // //                         </Text>
// // //                       </View>
// // //                       {dayMarkings?.dots && dayMarkings.dots.length > 0 && (
// // //                         <View style={styles.weekDayDots}>
// // //                           {dayMarkings.dots.slice(0, 2).map((dot, index) => (
// // //                             <View 
// // //                               key={index}
// // //                               style={[styles.weekDayDot, { backgroundColor: dot.color }]} 
// // //                             />
// // //                           ))}
// // //                           {dayMarkings.dots.length > 2 && (
// // //                             <Text style={styles.weekDayMoreDots}>+{dayMarkings.dots.length - 2}</Text>
// // //                           )}
// // //                         </View>
// // //                       )}
// // //                     </TouchableOpacity>
// // //                   );
// // //                 })}
// // //               </View>
// // //             </ScrollView>
// // //           </View>
// // //         )}

// // //         {/* Selected Date Facilities List */}
// // //         <View style={styles.facilityListContainer}>
// // //           <View style={styles.facilityListHeader}>
// // //             <View>
// // //               <Text style={styles.facilityListTitle}>
// // //                 {getFacilityTypeName(selectedFacilityType)} Status
// // //               </Text>
// // //               <Text style={styles.facilityListSubtitle}>
// // //                 {dateUtils.format(dateUtils.parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
// // //               </Text>
// // //             </View>
// // //             <View style={styles.facilityListStats}>
// // //               <View style={styles.statItem}>
// // //                 <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
// // //                 <Text style={styles.statText}>Booked</Text>
// // //               </View>
// // //               <View style={styles.statItem}>
// // //                 <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
// // //                 <Text style={styles.statText}>Reserved</Text>
// // //               </View>
// // //               <View style={styles.statItem}>
// // //                 <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
// // //                 <Text style={styles.statText}>Out of Order</Text>
// // //               </View>
// // //             </View>
// // //           </View>
// // //           {renderFacilityList()}
// // //         </View>
// // //       </ScrollView>

// // //       {/* Filter Modal */}
// // //       <FilterModal />

// // //       {/* Period Details Modal */}
// // //       <Modal
// // //         visible={!!selectedPeriod}
// // //         transparent
// // //         animationType="slide"
// // //         onRequestClose={() => setSelectedPeriod(null)}
// // //       >
// // //         <View style={styles.modalOverlay}>
// // //           <View style={styles.modalContainer}>
// // //             <View style={styles.modalHeader}>
// // //               <View style={styles.modalHeaderLeft}>
// // //                 <TouchableOpacity
// // //                   style={styles.modalBackButton}
// // //                   onPress={() => setSelectedPeriod(null)}
// // //                 >
// // //                   <Icon name="arrow-back" size={24} color="#64748B" />
// // //                 </TouchableOpacity>
// // //                 <Text style={styles.modalTitle}>
// // //                   {selectedPeriod?.date
// // //                     ? dateUtils.format(selectedPeriod.date, 'MMMM d, yyyy')
// // //                     : 'Booking Details'}
// // //                 </Text>
// // //               </View>
// // //               <TouchableOpacity
// // //                 style={styles.modalCloseButton}
// // //                 onPress={() => setSelectedPeriod(null)}
// // //               >
// // //                 <Icon name="close" size={24} color="#64748B" />
// // //               </TouchableOpacity>
// // //             </View>

// // //             <ScrollView style={styles.modalContent}>
// // //               {selectedPeriod?.periods ? (
// // //                 selectedPeriod.periods.map((period, index) => (
// // //                   <View key={index} style={styles.periodCard}>
// // //                     <View style={styles.periodCardHeader}>
// // //                       <View style={styles.periodCardHeaderLeft}>
// // //                         <Text style={styles.periodFacilityName}>
// // //                           {getFacilityName(period.facility)}
// // //                         </Text>
// // //                         {selectedFacilityType === 'ROOMS' && period.facility.roomType?.type && (
// // //                           <Text style={styles.periodFacilityType}>
// // //                             {period.facility.roomType.type}
// // //                           </Text>
// // //                         )}
// // //                       </View>
// // //                       <View
// // //                         style={[
// // //                           styles.periodBadge,
// // //                           {
// // //                             backgroundColor: period.color ? `${period.color}15` : '#F2F0EC',
// // //                             borderColor: period.color || '#D9A46C',
// // //                           },
// // //                         ]}
// // //                       >
// // //                         <View style={[styles.periodBadgeDot, { backgroundColor: period.color || '#D9A46C' }]} />
// // //                         <Text
// // //                           style={[
// // //                             styles.periodBadgeText,
// // //                             { color: period.color || '#D9A46C' },
// // //                           ]}
// // //                         >
// // //                           {period.isCancelled ? 'CANCELLED' : 
// // //                            period.isConfirmed ? 'CONFIRMED' : 
// // //                            period.type.toUpperCase()}
// // //                         </Text>
// // //                       </View>
// // //                     </View>

// // //                     {period.type === 'booking' && period.data && (
// // //                       <>
// // //                         {period.data.memberName && (
// // //                           <View style={styles.detailRow}>
// // //                             <Icon name="person" size={16} color="#64748B" />
// // //                             <Text style={styles.periodDetail}>
// // //                               Guest: {period.data.memberName}
// // //                             </Text>
// // //                           </View>
// // //                         )}
// // //                         {period.data.guestName && (
// // //                           <View style={styles.detailRow}>
// // //                             <Icon name="person" size={16} color="#64748B" />
// // //                             <Text style={styles.periodDetail}>
// // //                               Guest: {period.data.guestName}
// // //                             </Text>
// // //                           </View>
// // //                         )}
// // //                         {(period.data.checkIn || period.data.bookingDate) && (
// // //                           <View style={styles.detailRow}>
// // //                             <Icon name="calendar-today" size={16} color="#64748B" />
// // //                             <Text style={styles.periodDetail}>
// // //                               {dateUtils.format(
// // //                                 dateUtils.parseISO(period.data.checkIn || period.data.bookingDate),
// // //                                 'MMM d, yyyy'
// // //                               )}
// // //                               {period.data.checkOut && ` to ${dateUtils.format(
// // //                                 dateUtils.parseISO(period.data.checkOut),
// // //                                 'MMM d, yyyy'
// // //                               )}`}
// // //                             </Text>
// // //                           </View>
// // //                         )}
// // //                         {period.data.totalPrice && (
// // //                           <View style={styles.detailRow}>
// // //                             <Icon name="attach-money" size={16} color="#64748B" />
// // //                             <Text style={styles.periodDetail}>
// // //                               Amount: PKR {parseInt(period.data.totalPrice).toLocaleString()}
// // //                             </Text>
// // //                           </View>
// // //                         )}
// // //                         {period.data.paymentStatus && (
// // //                           <View style={[styles.detailRow, styles.paymentStatusContainer]}>
// // //                             <Icon name="payment" size={16} color="#64748B" />
// // //                             <Text style={styles.periodDetail}>Payment: </Text>
// // //                             <View
// // //                               style={[
// // //                                 styles.paymentBadge,
// // //                                 {
// // //                                   backgroundColor:
// // //                                     period.data.paymentStatus === 'PAID'
// // //                                       ? '#D1FAE5'
// // //                                       : period.data.paymentStatus === 'UNPAID'
// // //                                         ? '#FEE2E2'
// // //                                         : '#FEF3C7',
// // //                                 },
// // //                               ]}
// // //                             >
// // //                               <Text
// // //                                 style={[
// // //                                   styles.paymentBadgeText,
// // //                                   {
// // //                                     color:
// // //                                       period.data.paymentStatus === 'PAID'
// // //                                         ? '#065F46'
// // //                                         : period.data.paymentStatus === 'UNPAID'
// // //                                           ? '#991B1B'
// // //                                           : '#92400E',
// // //                                   },
// // //                                 ]}
// // //                               >
// // //                                 {period.data.paymentStatus}
// // //                               </Text>
// // //                             </View>
// // //                           </View>
// // //                         )}
// // //                       </>
// // //                     )}

// // //                     {period.type === 'reservation' && period.data && (
// // //                       <>
// // //                         <View style={styles.detailRow}>
// // //                           <Icon name="person" size={16} color="#64748B" />
// // //                           <Text style={styles.periodDetail}>
// // //                             Reserved by: {period.data.admin?.name || 'Admin'}
// // //                           </Text>
// // //                         </View>
// // //                         <View style={styles.detailRow}>
// // //                           <Icon name="date-range" size={16} color="#64748B" />
// // //                           <Text style={styles.periodDetail}>
// // //                             {dateUtils.format(
// // //                               dateUtils.parseISO(period.data.reservedFrom || period.data.startDate),
// // //                               'MMM d, yyyy'
// // //                             )} - {dateUtils.format(
// // //                               dateUtils.parseISO(period.data.reservedTo || period.data.endDate),
// // //                               'MMM d, yyyy'
// // //                             )}
// // //                           </Text>
// // //                         </View>
// // //                       </>
// // //                     )}

// // //                     {period.type === 'outOfOrder' && period.data && (
// // //                       <>
// // //                         <View style={styles.detailRow}>
// // //                           <Icon name="warning" size={16} color="#64748B" />
// // //                           <Text style={styles.periodDetail}>
// // //                             Reason: {period.data.reason || 'Maintenance'}
// // //                           </Text>
// // //                         </View>
// // //                         <View style={styles.detailRow}>
// // //                           <Icon name="date-range" size={16} color="#64748B" />
// // //                           <Text style={styles.periodDetail}>
// // //                             {dateUtils.format(
// // //                               dateUtils.parseISO(period.data.startDate),
// // //                               'MMM d, yyyy'
// // //                             )} - {dateUtils.format(
// // //                               dateUtils.parseISO(period.data.endDate),
// // //                               'MMM d, yyyy'
// // //                             )}
// // //                           </Text>
// // //                         </View>
// // //                       </>
// // //                     )}
// // //                   </View>
// // //                 ))
// // //               ) : null}
// // //             </ScrollView>

// // //             <View style={styles.modalFooter}>
// // //               <TouchableOpacity
// // //                 style={styles.modalButton}
// // //                 onPress={() => setSelectedPeriod(null)}
// // //               >
// // //                 <Text style={styles.modalButtonText}>Close</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>
// // //     </SafeAreaView>
// // //   );
// // // };

// // // // Styles remain the same as in the previous code
// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#F2F0EC',
// // //   },
// // //   scrollView: {
// // //     flex: 1,
// // //   },
// // //   loadingContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#F2F0EC',
// // //   },
// // //   loadingText: {
// // //     marginTop: 16,
// // //     fontSize: 16,
// // //     color: '#64748B',
// // //     fontWeight: '500',
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     backgroundColor: '#F2F0EC',
// // //     paddingTop: 16,
// // //     paddingBottom: 16,
// // //     paddingHorizontal: 16,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#E5E7EB',
// // //   },
// // //   backButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingVertical: 8,
// // //     paddingRight: 12,
// // //   },
// // //   backText: {
// // //     fontSize: 16,
// // //     color: '#D9A46C',
// // //     fontWeight: '500',
// // //     marginLeft: 4,
// // //   },
// // //   headerTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '600',
// // //     color: '#111827',
// // //     textAlign: 'center',
// // //     flex: 1,
// // //   },
// // //   headerRight: {
// // //     width: 60,
// // //   },
// // //   // Search Styles
// // //   searchContainer: {
// // //     flexDirection: 'row',
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 12,
// // //     gap: 12,
// // //   },
// // //   searchInputContainer: {
// // //     flex: 1,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FFFFFF',
// // //     borderRadius: 12,
// // //     paddingHorizontal: 16,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.05,
// // //     shadowRadius: 3,
// // //     elevation: 2,
// // //   },
// // //   searchInput: {
// // //     flex: 1,
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 12,
// // //     fontSize: 16,
// // //     color: '#1E293B',
// // //   },
// // //   filterButtonMain: {
// // //     width: 52,
// // //     height: 52,
// // //     backgroundColor: '#FFFFFF',
// // //     borderRadius: 12,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.05,
// // //     shadowRadius: 3,
// // //     elevation: 2,
// // //     position: 'relative',
// // //   },
// // //   filterBadge: {
// // //     position: 'absolute',
// // //     top: 8,
// // //     right: 8,
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     backgroundColor: '#D9A46C',
// // //   },
// // //   // View Mode Styles
// // //   viewModeContainer: {
// // //     flexDirection: 'row',
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 8,
// // //     gap: 8,
// // //   },
// // //   viewModeButton: {
// // //     flex: 1,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     gap: 8,
// // //     paddingVertical: 12,
// // //     backgroundColor: '#FFFFFF',
// // //     borderRadius: 10,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.05,
// // //     shadowRadius: 3,
// // //     elevation: 2,
// // //   },
// // //   viewModeButtonActive: {
// // //     backgroundColor: '#D9A46C',
// // //     borderColor: '#D9A46C',
// // //   },
// // //   viewModeButtonText: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: '#64748B',
// // //   },
// // //   viewModeButtonTextActive: {
// // //     color: '#FFFFFF',
// // //   },
// // //   // Facility Type Filter
// // //   facilityTypeContainer: {
// // //     marginHorizontal: 16,
// // //     marginTop: 8,
// // //   },
// // //   facilityTypeButtons: {
// // //     flexDirection: 'row',
// // //   },
// // //   facilityTypeButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 12,
// // //     borderRadius: 12,
// // //     backgroundColor: '#FFFFFF',
// // //     marginRight: 10,
// // //     minHeight: 44,
// // //     justifyContent: 'center',
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.05,
// // //     shadowRadius: 3,
// // //     elevation: 2,
// // //   },
// // //   facilityTypeButtonActive: {
// // //     backgroundColor: '#BCA382',
// // //     borderColor: '#BCA382',
// // //   },
// // //   facilityTypeIcon: {
// // //     marginRight: 8,
// // //   },
// // //   facilityTypeButtonText: {
// // //     fontSize: 14,
// // //     color: '#64748B',
// // //     fontWeight: '600',
// // //   },
// // //   facilityTypeButtonTextActive: {
// // //     color: '#FFFFFF',
// // //     fontWeight: '700',
// // //   },
// // //   // Active Filters
// // //   activeFiltersContainer: {
// // //     marginHorizontal: 16,
// // //     marginTop: 12,
// // //     padding: 12,
// // //     backgroundColor: '#FFFFFF',
// // //     borderRadius: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   activeFiltersTitle: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     color: '#64748B',
// // //     marginBottom: 8,
// // //     textTransform: 'uppercase',
// // //     letterSpacing: 0.5,
// // //   },
// // //   activeFilters: {
// // //     flexDirection: 'row',
// // //     gap: 8,
// // //   },
// // //   activeFilterTag: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#F1F5F9',
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 6,
// // //     borderRadius: 16,
// // //     gap: 6,
// // //   },
// // //   activeFilterText: {
// // //     fontSize: 12,
// // //     color: '#475569',
// // //     fontWeight: '500',
// // //   },
// // //   // Stats Styles
// // //   statsWrapper: {
// // //     marginHorizontal: 16,
// // //     marginTop: 16,
// // //     gap: 12,
// // //   },
// // //   statCardPrimary: {
// // //     backgroundColor: '#2A241E',
// // //     borderRadius: 20,
// // //     padding: 20,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 8 },
// // //     shadowOpacity: 0.25,
// // //     shadowRadius: 16,
// // //     elevation: 8,
// // //   },
// // //   statCardPrimaryHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     marginBottom: 16,
// // //   },
// // //   statCardPrimaryTitle: {
// // //     fontSize: 14,
// // //     color: '#94A3B8',
// // //     fontWeight: '500',
// // //   },
// // //   statCardBadge: {
// // //     backgroundColor: '#3D352D',
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 6,
// // //     borderRadius: 8,
// // //     borderWidth: 1,
// // //     borderColor: '#D9A46C',
// // //   },
// // //   statCardBadgeText: {
// // //     fontSize: 14,
// // //     color: '#D9A46C',
// // //     fontWeight: '700',
// // //   },
// // //   statCardPrimaryContent: {
// // //     flexDirection: 'row',
// // //     alignItems: 'baseline',
// // //     marginBottom: 16,
// // //   },
// // //   statCardPrimaryNumber: {
// // //     fontSize: 52,
// // //     fontWeight: 'bold',
// // //     color: '#FFFFFF',
// // //     marginRight: 8,
// // //   },
// // //   statCardPrimarySubtitle: {
// // //     fontSize: 18,
// // //     color: '#94A3B8',
// // //     fontWeight: '500',
// // //   },
// // //   progressBarContainer: {
// // //     height: 6,
// // //     backgroundColor: '#334155',
// // //     borderRadius: 3,
// // //     overflow: 'hidden',
// // //   },
// // //   progressBar: {
// // //     height: '100%',
// // //     backgroundColor: '#D9A46C',
// // //     borderRadius: 3,
// // //   },
// // //   statsRow: {
// // //     flexDirection: 'row',
// // //     gap: 12,
// // //   },
// // //   statCardSecondary: {
// // //     flex: 1,
// // //     backgroundColor: '#2A241E',
// // //     borderRadius: 20,
// // //     padding: 18,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 6 },
// // //     shadowOpacity: 0.2,
// // //     shadowRadius: 12,
// // //     elevation: 6,
// // //   },
// // //   statCardSecondaryTitle: {
// // //     fontSize: 16,
// // //     color: '#FFFFFF',
// // //     fontWeight: '600',
// // //     marginBottom: 4,
// // //   },
// // //   statCardSecondarySubtitle: {
// // //     fontSize: 12,
// // //     color: '#64748B',
// // //     fontWeight: '500',
// // //     marginBottom: 16,
// // //   },
// // //   statCardSecondaryNumber: {
// // //     fontSize: 36,
// // //     fontWeight: 'bold',
// // //     color: '#FFFFFF',
// // //   },
// // //   bookedNumber: {
// // //     color: '#D9A46C',
// // //   },
// // //   availableNumber: {
// // //     color: '#34D399',
// // //   },
// // //   // Calendar Styles
// // //   calendarCard: {
// // //     backgroundColor: '#FFFFFF',
// // //     marginHorizontal: 16,
// // //     marginTop: 16,
// // //     borderRadius: 20,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 6 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 16,
// // //     elevation: 6,
// // //     overflow: 'hidden',
// // //     paddingBottom: 10,
// // //   },
// // //   calendarHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 16,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#E5E7EB',
// // //   },
// // //   calendarTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '600',
// // //     color: '#111827',
// // //   },
// // //   calendar: {
// // //     borderRadius: 20,
// // //   },
// // //   // Week View Styles
// // //   weekViewContainer: {
// // //     backgroundColor: '#FFFFFF',
// // //     marginHorizontal: 16,
// // //     marginTop: 16,
// // //     borderRadius: 20,
// // //     padding: 16,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 6 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 16,
// // //     elevation: 6,
// // //   },
// // //   weekHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     marginBottom: 16,
// // //   },
// // //   weekTitle: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#1E293B',
// // //   },
// // //   weekDaysContainer: {
// // //     flexDirection: 'row',
// // //     gap: 8,
// // //   },
// // //   weekDayCard: {
// // //     width: 60,
// // //     paddingVertical: 12,
// // //     alignItems: 'center',
// // //     backgroundColor: '#F8FAFC',
// // //     borderRadius: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   weekDayCardSelected: {
// // //     backgroundColor: '#D9A46C',
// // //     borderColor: '#D9A46C',
// // //   },
// // //   weekDayName: {
// // //     fontSize: 12,
// // //     color: '#64748B',
// // //     fontWeight: '500',
// // //     marginBottom: 8,
// // //   },
// // //   weekDayNumberContainer: {
// // //     width: 32,
// // //     height: 32,
// // //     borderRadius: 16,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     marginBottom: 8,
// // //   },
// // //   weekDayTodayContainer: {
// // //     backgroundColor: '#3B82F6',
// // //   },
// // //   weekDaySelectedContainer: {
// // //     backgroundColor: '#FFFFFF',
// // //   },
// // //   weekDayNumber: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#1E293B',
// // //   },
// // //   weekDayNumberSelected: {
// // //     color: '#D9A46C',
// // //   },
// // //   weekDayDots: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 2,
// // //   },
// // //   weekDayDot: {
// // //     width: 6,
// // //     height: 6,
// // //     borderRadius: 3,
// // //   },
// // //   weekDayMoreDots: {
// // //     fontSize: 10,
// // //     color: '#64748B',
// // //     marginLeft: 2,
// // //   },
// // //   // Custom Day Component Styles
// // //   dayWrapper: { 
// // //     width: 45, 
// // //     height: 45, 
// // //     alignItems: 'center', 
// // //     justifyContent: 'center' 
// // //   },
// // //   dayCircle: { 
// // //     width: 38, 
// // //     height: 38, 
// // //     borderRadius: 19, 
// // //     alignItems: 'center', 
// // //     justifyContent: 'center',
// // //     position: 'relative',
// // //   },
// // //   todayOutline: { 
// // //     borderWidth: 2, 
// // //     borderColor: '#3B82F6' 
// // //   },
// // //   selectedDayCircle: { 
// // //     backgroundColor: '#D9A46C' 
// // //   },
// // //   hasEventsDay: { 
// // //     borderWidth: 1, 
// // //     borderColor: '#E5E7EB' 
// // //   },
// // //   disabledDay: {
// // //     opacity: 0.5,
// // //   },
// // //   dayText: { 
// // //     fontSize: 15, 
// // //     color: '#374151',
// // //     fontWeight: '500',
// // //   },
// // //   selectedDayText: { 
// // //     color: '#FFFFFF',
// // //     fontWeight: 'bold',
// // //   },
// // //   todayText: {
// // //     color: '#3B82F6',
// // //     fontWeight: 'bold',
// // //   },
// // //   disabledText: {
// // //     color: '#D1D5DB',
// // //   },
// // //   dotsContainer: {
// // //     position: 'absolute',
// // //     bottom: 2,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     width: '100%',
// // //   },
// // //   dot: {
// // //     width: 4,
// // //     height: 4,
// // //     borderRadius: 2,
// // //     marginHorizontal: 1,
// // //   },
// // //   moreDotsText: {
// // //     fontSize: 8,
// // //     color: '#6B7280',
// // //     marginLeft: 2,
// // //   },
// // //   // Facility List Styles
// // //   facilityListContainer: {
// // //     backgroundColor: '#FFFFFF',
// // //     marginHorizontal: 16,
// // //     marginTop: 16,
// // //     marginBottom: 24,
// // //     borderRadius: 20,
// // //     padding: 20,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 6 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 16,
// // //     elevation: 6,
// // //   },
// // //   facilityListHeader: {
// // //     marginBottom: 20,
// // //   },
// // //   facilityListTitle: {
// // //     fontSize: 20,
// // //     fontWeight: '700',
// // //     color: '#1E293B',
// // //     marginBottom: 4,
// // //   },
// // //   facilityListSubtitle: {
// // //     fontSize: 14,
// // //     color: '#64748B',
// // //     marginBottom: 16,
// // //   },
// // //   facilityListStats: {
// // //     flexDirection: 'row',
// // //     gap: 16,
// // //     marginTop: 12,
// // //   },
// // //   statItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 6,
// // //   },
// // //   statDot: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //   },
// // //   statText: {
// // //     fontSize: 12,
// // //     color: '#64748B',
// // //   },
// // //   facilityListItem: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     paddingVertical: 16,
// // //     paddingHorizontal: 16,
// // //     backgroundColor: '#F8FAFC',
// // //     borderRadius: 12,
// // //     marginBottom: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   facilityListItemActive: {
// // //     borderColor: '#CBD5E1',
// // //   },
// // //   facilityListContent: {
// // //     flex: 1,
// // //   },
// // //   facilityHeader: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginBottom: 8,
// // //     gap: 8,
// // //   },
// // //   facilityListName: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#1E293B',
// // //   },
// // //   facilityListType: {
// // //     fontSize: 12,
// // //     color: '#64748B',
// // //     backgroundColor: '#F1F5F9',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 2,
// // //     borderRadius: 10,
// // //   },
// // //   facilityDetail: {
// // //     fontSize: 14,
// // //     color: '#64748B',
// // //     marginBottom: 4,
// // //   },
// // //   statusBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 6,
// // //     borderRadius: 20,
// // //     gap: 6,
// // //     borderWidth: 1,
// // //     borderColor: 'transparent',
// // //   },
// // //   statusDot: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //   },
// // //   statusText: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     textTransform: 'uppercase',
// // //   },
// // //   emptyState: {
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     paddingVertical: 40,
// // //   },
// // //   emptyStateText: {
// // //     fontSize: 16,
// // //     color: '#64748B',
// // //     textAlign: 'center',
// // //     marginTop: 12,
// // //   },
// // //   // Filter Modal Styles
// // //   filterModalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(15, 23, 42, 0.6)',
// // //     justifyContent: 'flex-end',
// // //   },
// // //   filterModalContainer: {
// // //     backgroundColor: '#FFFFFF',
// // //     borderTopLeftRadius: 28,
// // //     borderTopRightRadius: 28,
// // //     maxHeight: '80%',
// // //   },
// // //   filterModalHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     paddingVertical: 20,
// // //     paddingHorizontal: 24,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#E2E8F0',
// // //   },
// // //   filterModalTitle: {
// // //     fontSize: 20,
// // //     fontWeight: '700',
// // //     color: '#1E293B',
// // //   },
// // //   filterModalContent: {
// // //     padding: 24,
// // //     maxHeight: 500,
// // //   },
// // //   filterSectionTitle: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#1E293B',
// // //     marginBottom: 12,
// // //   },
// // //   filterButtons: {
// // //     flexDirection: 'row',
// // //     flexWrap: 'wrap',
// // //     gap: 8,
// // //     marginBottom: 20,
// // //   },
// // //   filterButton: {
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 10,
// // //     backgroundColor: '#F1F5F9',
// // //     borderRadius: 20,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   filterButtonActive: {
// // //     backgroundColor: '#D9A46C',
// // //     borderColor: '#D9A46C',
// // //   },
// // //   filterButtonText: {
// // //     fontSize: 14,
// // //     color: '#64748B',
// // //     fontWeight: '500',
// // //   },
// // //   filterButtonTextActive: {
// // //     color: '#FFFFFF',
// // //     fontWeight: '600',
// // //   },
// // //   dateFilterContainer: {
// // //     flexDirection: 'row',
// // //     gap: 8,
// // //     marginBottom: 12,
// // //   },
// // //   dateFilterButton: {
// // //     flex: 1,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     gap: 8,
// // //     paddingVertical: 12,
// // //     backgroundColor: '#F1F5F9',
// // //     borderRadius: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   dateFilterButtonActive: {
// // //     backgroundColor: '#D9A46C',
// // //     borderColor: '#D9A46C',
// // //   },
// // //   dateFilterButtonText: {
// // //     fontSize: 14,
// // //     color: '#64748B',
// // //     fontWeight: '500',
// // //   },
// // //   dateFilterButtonTextActive: {
// // //     color: '#FFFFFF',
// // //     fontWeight: '600',
// // //   },
// // //   dateFilterInfo: {
// // //     fontSize: 14,
// // //     color: '#475569',
// // //     textAlign: 'center',
// // //     marginTop: 8,
// // //     fontStyle: 'italic',
// // //   },
// // //   filterModalFooter: {
// // //     flexDirection: 'row',
// // //     gap: 12,
// // //     padding: 20,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#E2E8F0',
// // //   },
// // //   clearButton: {
// // //     flex: 1,
// // //     backgroundColor: '#F1F5F9',
// // //     paddingVertical: 16,
// // //     borderRadius: 14,
// // //     alignItems: 'center',
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   clearButtonText: {
// // //     color: '#64748B',
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //   },
// // //   applyButton: {
// // //     flex: 2,
// // //     backgroundColor: '#D9A46C',
// // //     paddingVertical: 16,
// // //     borderRadius: 14,
// // //     alignItems: 'center',
// // //     shadowColor: '#D9A46C',
// // //     shadowOffset: { width: 0, height: 4 },
// // //     shadowOpacity: 0.3,
// // //     shadowRadius: 8,
// // //     elevation: 4,
// // //   },
// // //   applyButtonText: {
// // //     color: '#FFFFFF',
// // //     fontSize: 16,
// // //     fontWeight: '700',
// // //   },
// // //   // Modal Styles
// // //   modalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(15, 23, 42, 0.6)',
// // //     justifyContent: 'flex-end',
// // //   },
// // //   modalContainer: {
// // //     backgroundColor: '#FFFFFF',
// // //     borderTopLeftRadius: 28,
// // //     borderTopRightRadius: 28,
// // //     maxHeight: '85%',
// // //   },
// // //   modalHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     paddingVertical: 18,
// // //     paddingHorizontal: 24,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#E2E8F0',
// // //   },
// // //   modalHeaderLeft: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     flex: 1,
// // //   },
// // //   modalBackButton: {
// // //     marginRight: 12,
// // //   },
// // //   modalTitle: {
// // //     fontSize: 20,
// // //     fontWeight: '700',
// // //     color: '#1E293B',
// // //     flex: 1,
// // //   },
// // //   modalCloseButton: {
// // //     width: 36,
// // //     height: 36,
// // //     borderRadius: 18,
// // //     backgroundColor: '#F1F5F9',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   modalContent: {
// // //     padding: 24,
// // //     maxHeight: 400,
// // //   },
// // //   modalFooter: {
// // //     padding: 20,
// // //     paddingBottom: 34,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#E2E8F0',
// // //   },
// // //   modalButton: {
// // //     backgroundColor: '#BCA382',
// // //     paddingVertical: 16,
// // //     borderRadius: 14,
// // //     alignItems: 'center',
// // //     shadowColor: '#BCA382',
// // //     shadowOffset: { width: 0, height: 4 },
// // //     shadowOpacity: 0.3,
// // //     shadowRadius: 8,
// // //     elevation: 4,
// // //   },
// // //   modalButtonText: {
// // //     color: '#FFFFFF',
// // //     fontSize: 16,
// // //     fontWeight: '700',
// // //   },
// // //   periodCard: {
// // //     padding: 18,
// // //     backgroundColor: '#F8FAFC',
// // //     borderRadius: 14,
// // //     marginBottom: 14,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   periodCardHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'flex-start',
// // //     marginBottom: 14,
// // //   },
// // //   periodCardHeaderLeft: {
// // //     flex: 1,
// // //   },
// // //   periodFacilityName: {
// // //     fontSize: 17,
// // //     fontWeight: '700',
// // //     color: '#1E293B',
// // //     marginBottom: 4,
// // //   },
// // //   periodFacilityType: {
// // //     fontSize: 12,
// // //     color: '#64748B',
// // //     backgroundColor: '#F1F5F9',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 2,
// // //     borderRadius: 10,
// // //     alignSelf: 'flex-start',
// // //   },
// // //   periodBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 6,
// // //     borderRadius: 20,
// // //     borderWidth: 1,
// // //     gap: 6,
// // //   },
// // //   periodBadgeDot: {
// // //     width: 6,
// // //     height: 6,
// // //     borderRadius: 3,
// // //   },
// // //   periodBadgeText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //     letterSpacing: 0.3,
// // //   },
// // //   detailRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 8,
// // //     marginBottom: 8,
// // //   },
// // //   periodDetail: {
// // //     fontSize: 14,
// // //     color: '#64748B',
// // //     lineHeight: 20,
// // //   },
// // //   paymentStatusContainer: {
// // //     gap: 10,
// // //     marginTop: 10,
// // //     paddingTop: 10,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#E2E8F0',
// // //   },
// // //   paymentBadge: {
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 6,
// // //     borderRadius: 20,
// // //   },
// // //   paymentBadgeText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //     letterSpacing: 0.3,
// // //   },
// // // });

// // // export default calender;

// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   Modal,
// //   RefreshControl,
// //   ActivityIndicator,
// //   SafeAreaView,
// //   Alert,
// //   Dimensions,
// //   Platform
// // } from 'react-native';
// // import { Calendar } from 'react-native-calendars';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import axios from 'axios';
// // import { useAuth } from '../auth/contexts/AuthContext';

// // const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // // Date Utilities
// // const dateUtils = {
// //   format: (date, formatStr) => {
// //     const d = new Date(date);
// //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// //     const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// //     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// //     if (formatStr === 'MMM d') {
// //       return `${months[d.getMonth()]} ${d.getDate()}`;
// //     } else if (formatStr === 'EEE') {
// //       return days[d.getDay()];
// //     } else if (formatStr === 'MMM d, yyyy') {
// //       return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// //     } else if (formatStr === 'MMMM d, yyyy') {
// //       return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
// //     } else if (formatStr === 'yyyy-MM-dd') {
// //       return d.toISOString().split('T')[0];
// //     }
// //     return d.toString();
// //   },

// //   parseISO: (dateString) => {
// //     return new Date(dateString);
// //   },

// //   isSameDay: (date1, date2) => {
// //     const d1 = new Date(date1);
// //     const d2 = new Date(date2);
// //     return d1.getFullYear() === d2.getFullYear() &&
// //       d1.getMonth() === d2.getMonth() &&
// //       d1.getDate() === d2.getDate();
// //   },

// //   addDays: (date, days) => {
// //     const result = new Date(date);
// //     result.setDate(result.getDate() + days);
// //     return result;
// //   },

// //   differenceInDays: (date1, date2) => {
// //     const d1 = new Date(date1);
// //     const d2 = new Date(date2);
// //     const diffTime = Math.abs(d2 - d1);
// //     return Math.floor(diffTime / (1000 * 60 * 60 * 24));
// //   },

// //   startOfDay: (date) => {
// //     const result = new Date(date);
// //     result.setHours(0, 0, 0, 0);
// //     return result;
// //   },

// //   eachDayOfInterval: (interval) => {
// //     const days = [];
// //     let current = new Date(interval.start);
// //     const end = new Date(interval.end);

// //     while (current <= end) {
// //       days.push(new Date(current));
// //       current.setDate(current.getDate() + 1);
// //     }

// //     return days;
// //   },
// // };

// // const calender = ({ navigation }) => {
// //   const [currentDate, setCurrentDate] = useState(new Date());
// //   const [selectedFacilityType, setSelectedFacilityType] = useState('ROOMS');
// //   const [selectedRoomType, setSelectedRoomType] = useState('ALL');
// //   const [selectedRoom, setSelectedRoom] = useState(null);
// //   const [selectedPeriod, setSelectedPeriod] = useState(null);
// //   const [daysToShow, setDaysToShow] = useState(30);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [viewMode, setViewMode] = useState('month');

// //   const [rooms, setRooms] = useState([]);
// //   const [halls, setHalls] = useState([]);
// //   const [lawns, setLawns] = useState([]);
// //   const [photoshoots, setPhotoshoots] = useState([]);

// //   const { user } = useAuth();

// //   // Fetch data function
// //   const fetchData = useCallback(async () => {
// //     if (!user) return;

// //     try {
// //       setLoading(true);

// //       // Get token from AsyncStorage
// //       const token = await AsyncStorage.getItem('access_token');

// //       // Create headers
// //       const headers = {
// //         'Content-Type': 'application/json',
// //         ...(token && { Authorization: `Bearer ${token}` }),
// //       };

// //       // Define base URL
// //       const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

// //       // Fetch data based on selected facility type
// //       if (selectedFacilityType === 'ROOMS') {
// //         try {
// //           const response = await axios.get(`${baseURL}/room/calendar`, { headers });
// //           setRooms(response.data || []);
// //         } catch (error) {
// //           console.error('Error fetching rooms:', error);
// //           setRooms([]);
// //         }
// //       }

// //       if (selectedFacilityType === 'HALLS') {
// //         try {
// //           const response = await axios.get(`${baseURL}/hall/get/halls`, { headers });
// //           setHalls(response.data || []);
// //         } catch (error) {
// //           console.error('Error fetching halls:', error);
// //           setHalls([]);
// //         }
// //       }

// //       if (selectedFacilityType === 'LAWNS') {
// //         try {
// //           const response = await axios.get(`${baseURL}/lawn/get/lawns`, { headers });
// //           setLawns(response.data || []);
// //         } catch (error) {
// //           console.error('Error fetching lawns:', error);
// //           setLawns([]);
// //         }
// //       }

// //       if (selectedFacilityType === 'PHOTOSHOOTS') {
// //         try {
// //           const response = await axios.get(`${baseURL}/photoShoot/get/photoShoots`, { headers });
// //           setPhotoshoots(response.data || []);
// //         } catch (error) {
// //           console.error('Error fetching photoshoots:', error);
// //           setPhotoshoots([]);
// //         }
// //       }

// //     } catch (error) {
// //       console.error('Error fetching calendar data:', error);
// //       Alert.alert('Error', 'Failed to load calendar data');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, [user, selectedFacilityType]);

// //   useEffect(() => {
// //     fetchData();
// //   }, [fetchData]);

// //   const onRefresh = useCallback(() => {
// //     setRefreshing(true);
// //     fetchData();
// //   }, [fetchData]);

// //   // Get current facility data
// //   const getCurrentFacilities = () => {
// //     switch (selectedFacilityType) {
// //       case 'ROOMS':
// //         return rooms;
// //       case 'HALLS':
// //         return halls;
// //       case 'LAWNS':
// //         return lawns;
// //       case 'PHOTOSHOOTS':
// //         return photoshoots;
// //       default:
// //         return [];
// //     }
// //   };

// //   // Filter rooms based on selection
// //   const filteredRooms = rooms.filter(room => {
// //     const typeMatch = selectedRoomType === 'ALL' || room.roomType?.type === selectedRoomType;
// //     const roomMatch = !selectedRoom || room.id.toString() === selectedRoom;
// //     return typeMatch && roomMatch;
// //   });

// //   // Get facilities to display
// //   const getFacilitiesForDisplay = () => {
// //     if (selectedFacilityType === 'ROOMS') {
// //       return filteredRooms;
// //     }
// //     return getCurrentFacilities();
// //   };

// //   // Generate marked dates for calendar view with count
// //   const markedDates = useMemo(() => {
// //     const facilities = getFacilitiesForDisplay();
// //     const marks = {};

// //     facilities.forEach(facility => {
// //       // Process bookings
// //       if (facility.bookings && facility.bookings.length > 0) {
// //         facility.bookings.forEach(booking => {
// //           const startDate = dateUtils.parseISO(
// //             booking.checkIn || booking.bookingDate || booking.date ||
// //             booking.shootDate || booking.eventDate || booking.createdAt
// //           );
// //           const endDate = dateUtils.parseISO(
// //             booking.checkOut || booking.bookingDate || booking.date ||
// //             booking.shootDate || booking.eventDate || booking.createdAt
// //           );

// //           // For single-day events (photoshoots, halls, lawns)
// //           if (!booking.checkIn && !booking.checkOut) {
// //             const dateString = dateUtils.format(startDate, 'yyyy-MM-dd');
// //             if (!marks[dateString]) marks[dateString] = { count: 0 };
// //             marks[dateString].count += 1;
// //           } else {
// //             // For date range bookings (rooms with checkIn/checkOut)
// //             let currentDate = new Date(startDate);
// //             while (currentDate <= endDate) {
// //               const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// //               if (!marks[dateString]) marks[dateString] = { count: 0 };
// //               marks[dateString].count += 1;
// //               currentDate.setDate(currentDate.getDate() + 1);
// //             }
// //           }
// //         });
// //       }

// //       // Process reservations
// //       if (facility.reservations && facility.reservations.length > 0) {
// //         facility.reservations.forEach(reservation => {
// //           const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
// //           const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

// //           let currentDate = new Date(startDate);
// //           while (currentDate <= endDate) {
// //             const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// //             if (!marks[dateString]) marks[dateString] = { count: 0 };
// //             marks[dateString].count += 1;
// //             currentDate.setDate(currentDate.getDate() + 1);
// //           }
// //         });
// //       }

// //       // Process out of order periods
// //       if (facility.outOfOrders && facility.outOfOrders.length > 0) {
// //         facility.outOfOrders.forEach(outOfOrder => {
// //           const startDate = dateUtils.parseISO(outOfOrder.startDate);
// //           const endDate = dateUtils.parseISO(outOfOrder.endDate);

// //           let currentDate = new Date(startDate);
// //           while (currentDate <= endDate) {
// //             const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
// //             if (!marks[dateString]) marks[dateString] = { count: 0 };
// //             marks[dateString].count += 1;
// //             currentDate.setDate(currentDate.getDate() + 1);
// //           }
// //         });
// //       }
// //     });

// //     return marks;
// //   }, [selectedFacilityType, rooms, halls, lawns, photoshoots, selectedRoomType, selectedRoom]);

// //   // Get events for a specific date
// //   const getEventsForDate = (date) => {
// //     const facilities = getFacilitiesForDisplay();
// //     const selectedDate = dateUtils.parseISO(date.dateString || date);
// //     const periodsOnDate = [];

// //     facilities.forEach(facility => {
// //       // Check bookings
// //       if (facility.bookings) {
// //         facility.bookings.forEach(booking => {
// //           const startDate = dateUtils.parseISO(
// //             booking.checkIn || booking.bookingDate || booking.date ||
// //             booking.shootDate || booking.eventDate || booking.createdAt
// //           );
// //           const endDate = dateUtils.parseISO(
// //             booking.checkOut || booking.bookingDate || booking.date ||
// //             booking.shootDate || booking.eventDate || booking.createdAt
// //           );

// //           // Check if selected date falls within the booking period
// //           const isWithinRange = selectedDate >= dateUtils.startOfDay(startDate) &&
// //             selectedDate <= dateUtils.startOfDay(endDate);
// //           const isSameAsStart = dateUtils.isSameDay(selectedDate, startDate);
// //           const isSameAsEnd = dateUtils.isSameDay(selectedDate, endDate);

// //           if (isWithinRange || isSameAsStart || isSameAsEnd) {
// //             periodsOnDate.push({
// //               facility,
// //               type: 'booking',
// //               data: booking,
// //               isCancelled: booking.paymentStatus === 'CANCELLED',
// //               isConfirmed: booking.status === 'CONFIRMED',
// //             });
// //           }
// //         });
// //       }

// //       // Check reservations
// //       if (facility.reservations) {
// //         facility.reservations.forEach(reservation => {
// //           const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
// //           const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

// //           if (selectedDate >= startDate && selectedDate <= endDate) {
// //             periodsOnDate.push({
// //               facility,
// //               type: 'reservation',
// //               data: reservation,
// //             });
// //           }
// //         });
// //       }

// //       // Check out of orders
// //       if (facility.outOfOrders) {
// //         facility.outOfOrders.forEach(outOfOrder => {
// //           const startDate = dateUtils.parseISO(outOfOrder.startDate);
// //           const endDate = dateUtils.parseISO(outOfOrder.endDate);

// //           if (selectedDate >= startDate && selectedDate <= endDate) {
// //             periodsOnDate.push({
// //               facility,
// //               type: 'outOfOrder',
// //               data: outOfOrder,
// //             });
// //           }
// //         });
// //       }
// //     });

// //     return periodsOnDate;
// //   };

// //   // Custom Day Component
// //   const DayComponent = ({ date, state, marking }) => {
// //     const isToday = dateUtils.isSameDay(new Date(), date.dateString);
// //     const count = marking?.count || 0;
// //     const isSelected = count > 1; // Blue circle for multiple bookings

// //     return (
// //       <TouchableOpacity 
// //         style={styles.dayWrapper} 
// //         onPress={() => {
// //           const events = getEventsForDate(date);
// //           if (events.length > 0) {
// //             setSelectedPeriod({
// //               date: dateUtils.parseISO(date.dateString),
// //               periods: events,
// //             });
// //           }
// //         }}
// //       >
// //         <View style={[
// //           styles.dayCircle,
// //           isToday && styles.todayOutline,
// //           isSelected && styles.selectedDayCircle
// //         ]}>
// //           <Text style={[
// //             styles.dayText,
// //             state === 'disabled' && { color: '#D1D5DB' },
// //             isSelected && { color: '#FFF', fontWeight: 'bold' }
// //           ]}>
// //             {date.day}
// //           </Text>

// //           {count > 0 && (
// //             <View style={[styles.badge, isSelected && styles.badgeWhite]}>
// //               <Text style={[styles.badgeText, isSelected && { color: '#3B82F6' }]}>
// //                 {count}
// //               </Text>
// //             </View>
// //           )}
// //         </View>
// //       </TouchableOpacity>
// //     );
// //   };

// //   // Get facility type display name
// //   const getFacilityTypeName = (type) => {
// //     switch (type) {
// //       case 'ROOMS':
// //         return 'Rooms';
// //       case 'HALLS':
// //         return 'Halls';
// //       case 'LAWNS':
// //         return 'Lawns';
// //       case 'PHOTOSHOOTS':
// //         return 'Photoshoots';
// //       default:
// //         return 'Rooms';
// //     }
// //   };

// //   // Get facility name
// //   const getFacilityName = (facility) => {
// //     if (selectedFacilityType === 'ROOMS') {
// //       return `Room ${facility.roomNumber || facility.roomNo || facility.id}`;
// //     }
// //     return facility.name || facility.title || `Facility ${facility.id}`;
// //   };

// //   if (loading && !refreshing) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#D9A46C" />
// //         <Text style={styles.loadingText}>Loading calendar data...</Text>
// //       </View>
// //     );
// //   }

// //   const facilities = getFacilitiesForDisplay();
// //   const roomTypes = [...new Set(rooms.map(room => room.roomType?.type).filter(Boolean))];

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <ScrollView
// //         refreshControl={
// //           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D9A46C']} />
// //         }
// //         style={styles.scrollView}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {/* Header */}
// //         <View style={styles.header}>
// //           <TouchableOpacity
// //             style={styles.backButton}
// //             onPress={() => navigation.navigate('Home')}
// //           >
// //             <Text style={styles.backIcon}>‹</Text>
// //             <Text style={styles.backText}>back</Text>
// //           </TouchableOpacity>
// //           <Text style={styles.headerTitle}>Facility Calendar</Text>
// //           <View style={styles.headerRight} />
// //         </View>

// //         {/* Facility Type Filter */}
// //         <View style={styles.facilityTypeContainer}>
// //           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilityTypeButtons}>
// //             {['ROOMS', 'HALLS', 'LAWNS', 'PHOTOSHOOTS'].map((type) => (
// //               <TouchableOpacity
// //                 key={type}
// //                 style={[
// //                   styles.facilityTypeButton,
// //                   selectedFacilityType === type && styles.facilityTypeButtonActive,
// //                 ]}
// //                 onPress={() => {
// //                   setSelectedFacilityType(type);
// //                   setSelectedRoomType('ALL');
// //                   setSelectedRoom(null);
// //                 }}
// //               >
// //                 <Text
// //                   style={[
// //                     styles.facilityTypeButtonText,
// //                     selectedFacilityType === type && styles.facilityTypeButtonTextActive,
// //                   ]}
// //                 >
// //                   {getFacilityTypeName(type)}
// //                 </Text>
// //               </TouchableOpacity>
// //             ))}
// //           </ScrollView>
// //         </View>

// //         {/* Room-specific filters */}
// //         {selectedFacilityType === 'ROOMS' && roomTypes.length > 0 && (
// //           <View style={styles.roomTypeContainer}>
// //             <Text style={styles.roomTypeLabel}>Room Type</Text>
// //             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomTypeButtons}>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.roomTypeButton,
// //                   selectedRoomType === 'ALL' && styles.roomTypeButtonActive,
// //                 ]}
// //                 onPress={() => setSelectedRoomType('ALL')}
// //               >
// //                 <Text
// //                   style={[
// //                     styles.roomTypeButtonText,
// //                     selectedRoomType === 'ALL' && styles.roomTypeButtonTextActive,
// //                   ]}
// //                 >
// //                   All Types
// //                 </Text>
// //               </TouchableOpacity>
// //               {roomTypes.map((type) => (
// //                 <TouchableOpacity
// //                   key={type}
// //                   style={[
// //                     styles.roomTypeButton,
// //                     selectedRoomType === type && styles.roomTypeButtonActive,
// //                   ]}
// //                   onPress={() => setSelectedRoomType(type)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.roomTypeButtonText,
// //                       selectedRoomType === type && styles.roomTypeButtonTextActive,
// //                     ]}
// //                   >
// //                     {type}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>
// //           </View>
// //         )}

// //         {/* Statistics - Current Status */}
// //         <View style={styles.statsWrapper}>
// //           {/* Top Card - Total */}
// //           <View style={styles.statCardPrimary}>
// //             <View style={styles.statCardPrimaryHeader}>
// //               <Text style={styles.statCardPrimaryTitle}>Total {getFacilityTypeName(selectedFacilityType)}</Text>
// //               <View style={styles.statCardBadge}>
// //                 <Text style={styles.statCardBadgeText}>
// //                   {facilities.length > 0 ? Math.round((facilities.filter(f => !f.isBooked && !f.isOutOfOrder).length / facilities.length) * 100) : 0}%
// //                 </Text>
// //               </View>
// //             </View>
// //             <View style={styles.statCardPrimaryContent}>
// //               <Text style={styles.statCardPrimaryNumber}>{facilities.length}</Text>
// //               <Text style={styles.statCardPrimarySubtitle}>{getFacilityTypeName(selectedFacilityType).toLowerCase()}</Text>
// //             </View>
// //             <View style={styles.progressBarContainer}>
// //               <View style={[styles.progressBar, { width: `${facilities.length > 0 ? Math.round((facilities.filter(f => !f.isBooked && !f.isOutOfOrder).length / facilities.length) * 100) : 0}%` }]} />
// //             </View>
// //           </View>

// //           {/* Middle Row - Booked & Available */}
// //           <View style={styles.statsRow}>
// //             {/* Booked Card */}
// //             <View style={styles.statCardSecondary}>
// //               <Text style={styles.statCardSecondaryTitle}>Booked</Text>
// //               <Text style={styles.statCardSecondarySubtitle}>Rooms occupied</Text>
// //               <Text style={[styles.statCardSecondaryNumber, styles.bookedNumber]}>
// //                 {facilities.filter(f => f.isBooked).length}
// //               </Text>
// //             </View>

// //             {/* Available Card */}
// //             <View style={styles.statCardSecondary}>
// //               <Text style={styles.statCardSecondaryTitle}>Available</Text>
// //               <Text style={styles.statCardSecondarySubtitle}>Ready to book</Text>
// //               <Text style={[styles.statCardSecondaryNumber, styles.availableNumber]}>
// //                 {facilities.filter(f => !f.isBooked && !f.isOutOfOrder && !f.isReserved).length}
// //               </Text>
// //             </View>
// //           </View>
// //           </View>


// //         {/* Legend */}
// //         <View style={styles.legendContainer}>
// //           <Text style={styles.legendTitle}>Legend</Text>
// //           <View style={styles.legendItems}>
// //             <View style={styles.legendItem}>
// //               <View style={[styles.legendDot, styles.legendDotBooking]} />
// //               <Text style={styles.legendText}>Bookings</Text>
// //             </View>
// //             <View style={styles.legendItem}>
// //               <View style={[styles.legendDot, styles.legendDotReservation]} />
// //               <Text style={styles.legendText}>Reservations</Text>
// //             </View>
// //             <View style={styles.legendItem}>
// //               <View style={[styles.legendDot, styles.legendDotOutOfService]} />
// //               <Text style={styles.legendText}>Out of Service</Text>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Calendar View */}
// //         <View style={styles.calendarCard}>
// //           <Calendar
// //             current={dateUtils.format(new Date(), 'yyyy-MM-dd')}
// //             dayComponent={DayComponent}
// //             markedDates={markedDates}
// //             theme={{
// //               calendarBackground: '#ffffff',
// //               textSectionTitleColor: '#6B7280',
// //               selectedDayBackgroundColor: '#D9A46C',
// //               selectedDayTextColor: '#ffffff',
// //               todayTextColor: '#D9A46C',
// //               dayTextColor: '#374151',
// //               textDisabledColor: '#D1D5DB',
// //               arrowColor: '#D9A46C',
// //               monthTextColor: '#111827',
// //               textDayFontFamily: 'System',
// //               textMonthFontFamily: 'System',
// //               textDayHeaderFontFamily: 'System',
// //               textDayFontSize: 16,
// //               textMonthFontSize: 18,
// //               textDayHeaderFontSize: 14,
// //             }}
// //             style={styles.calendar}
// //           />
// //         </View>
// //       </ScrollView>

// //       {/* Period Details Modal */}
// //       <Modal
// //         visible={!!selectedPeriod}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={() => setSelectedPeriod(null)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContainer}>
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>
// //                 {selectedPeriod?.date
// //                   ? dateUtils.format(selectedPeriod.date, 'MMMM d, yyyy')
// //                   : 'Booking Details'}
// //               </Text>
// //               <TouchableOpacity
// //                 style={styles.modalCloseButton}
// //                 onPress={() => setSelectedPeriod(null)}
// //               >
// //                 <Text style={styles.modalCloseText}>✕</Text>
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView style={styles.modalContent}>
// //               {selectedPeriod?.periods ? (
// //                 selectedPeriod.periods.map((period, index) => (
// //                   <View key={index} style={styles.periodCard}>
// //                     <View style={styles.periodCardHeader}>
// //                       <Text style={styles.periodFacilityName}>
// //                         {getFacilityName(period.facility)}
// //                       </Text>
// //                       <View
// //                         style={[
// //                           styles.periodBadge,
// //                           {
// //                             backgroundColor:
// //                               period.type === 'booking'
// //                                 ? period.isCancelled 
// //                                   ? '#FEE2E2'
// //                                   : period.isConfirmed
// //                                     ? '#F2F0EC'
// //                                     : '#F2F0EC'
// //                                 : period.type === 'reservation'
// //                                   ? '#FEF3C7'
// //                                   : '#FEE2E2',
// //                           },
// //                         ]}
// //                       >
// //                         <Text
// //                           style={[
// //                             styles.periodBadgeText,
// //                             {
// //                               color:
// //                                 period.type === 'booking'
// //                                   ? period.isCancelled
// //                                     ? '#991B1B'
// //                                     : period.isConfirmed
// //                                       ? '#92400E'
// //                                       : '#D9A46C'
// //                                   : period.type === 'reservation'
// //                                     ? '#92400E'
// //                                     : '#991B1B',
// //                             },
// //                           ]}
// //                         >
// //                           {period.isCancelled ? 'CANCELLED' : 
// //                            period.isConfirmed ? 'CONFIRMED' : 
// //                            period.type.toUpperCase()}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     {period.type === 'booking' && (
// //                       <>
// //                         {period.data.memberName && (
// //                           <Text style={styles.periodDetail}>
// //                             Guest: {period.data.memberName}
// //                           </Text>
// //                         )}
// //                         {period.data.guestName && (
// //                           <Text style={styles.periodDetail}>
// //                             Guest: {period.data.guestName}
// //                           </Text>
// //                         )}
// //                         {(period.data.checkIn || period.data.bookingDate) && (
// //                           <Text style={styles.periodDetail}>
// //                             Date: {dateUtils.format(
// //                               dateUtils.parseISO(period.data.checkIn || period.data.bookingDate),
// //                               'MMM d, yyyy'
// //                             )}
// //                             {period.data.checkOut && ` to ${dateUtils.format(
// //                               dateUtils.parseISO(period.data.checkOut),
// //                               'MMM d, yyyy'
// //                             )}`}
// //                           </Text>
// //                         )}
// //                         {period.data.totalPrice && (
// //                           <Text style={styles.periodDetail}>
// //                             Amount: PKR {parseInt(period.data.totalPrice).toLocaleString()}
// //                           </Text>
// //                         )}
// //                         {period.data.paymentStatus && (
// //                           <View style={styles.paymentStatusContainer}>
// //                             <Text style={styles.periodDetail}>Payment: </Text>
// //                             <View
// //                               style={[
// //                                 styles.paymentBadge,
// //                                 {
// //                                   backgroundColor:
// //                                     period.data.paymentStatus === 'PAID'
// //                                       ? '#D1FAE5'
// //                                       : period.data.paymentStatus === 'UNPAID'
// //                                         ? '#FEE2E2'
// //                                         : '#FEF3C7',
// //                                 },
// //                               ]}
// //                             >
// //                               <Text
// //                                 style={[
// //                                   styles.paymentBadgeText,
// //                                   {
// //                                     color:
// //                                       period.data.paymentStatus === 'PAID'
// //                                         ? '#065F46'
// //                                         : period.data.paymentStatus === 'UNPAID'
// //                                           ? '#991B1B'
// //                                           : '#92400E',
// //                                   },
// //                                 ]}
// //                               >
// //                                 {period.data.paymentStatus}
// //                               </Text>
// //                             </View>
// //                           </View>
// //                         )}
// //                       </>
// //                     )}

// //                     {period.type === 'reservation' && (
// //                       <>
// //                         <Text style={styles.periodDetail}>
// //                           Reserved by: {period.data.admin?.name || 'Admin'}
// //                         </Text>
// //                         <Text style={styles.periodDetail}>
// //                           Period: {dateUtils.format(
// //                             dateUtils.parseISO(period.data.reservedFrom || period.data.startDate),
// //                             'MMM d, yyyy'
// //                           )} - {dateUtils.format(
// //                             dateUtils.parseISO(period.data.reservedTo || period.data.endDate),
// //                             'MMM d, yyyy'
// //                           )}
// //                         </Text>
// //                       </>
// //                     )}

// //                     {period.type === 'outOfOrder' && (
// //                       <>
// //                         <Text style={styles.periodDetail}>
// //                           Reason: {period.data.reason || 'Maintenance'}
// //                         </Text>
// //                         <Text style={styles.periodDetail}>
// //                           Period: {dateUtils.format(
// //                             dateUtils.parseISO(period.data.startDate),
// //                             'MMM d, yyyy'
// //                           )} - {dateUtils.format(
// //                             dateUtils.parseISO(period.data.endDate),
// //                             'MMM d, yyyy'
// //                           )}
// //                         </Text>
// //                       </>
// //                     )}
// //                   </View>
// //                 ))
// //               ) : null}
// //             </ScrollView>

// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalButton}
// //                 onPress={() => setSelectedPeriod(null)}
// //               >
// //                 <Text style={styles.modalButtonText}>Close</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F2F0EC',
// //   },
// //   scrollView: {
// //     flex: 1,
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#F2F0EC',
// //   },
// //   loadingText: {
// //     marginTop: 16,
// //     fontSize: 16,
// //     color: '#64748B',
// //     fontWeight: '500',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     backgroundColor: '#F2F0EC',
// //     paddingTop: 16,
// //     paddingBottom: 16,
// //     paddingHorizontal: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#E5E7EB',
// //   },
// //   backButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 8,
// //     paddingRight: 12,
// //   },
// //   backIcon: {
// //     fontSize: 28,
// //     color: '#D9A46C',
// //     fontWeight: '300',
// //     marginRight: 2,
// //   },
// //   backText: {
// //     fontSize: 16,
// //     color: '#D9A46C',
// //     fontWeight: '400',
// //   },
// //   headerTitle: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //     color: '#111827',
// //     textAlign: 'center',
// //     flex: 1,
// //   },
// //   headerRight: {
// //     width: 60,
// //   },
// //   // Facility Type Filter Styles
// //   facilityTypeContainer: {
// //     marginHorizontal: 16,
// //     marginTop: 16,
// //   },
// //   facilityTypeButtons: {
// //     flexDirection: 'row',
// //   },
// //   facilityTypeButton: {
// //     paddingHorizontal: 20,
// //     paddingVertical: 12,
// //     borderRadius: 12,
// //     backgroundColor: '#FFFFFF',
// //     marginRight: 10,
// //     minHeight: 44,
// //     justifyContent: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //     shadowColor: '#1E3A5F',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 4,
// //     elevation: 2,
// //   },
// //   facilityTypeButtonActive: {
// //     backgroundColor: '#BCA382',
// //     borderColor: '#BCA382',
// //   },
// //   facilityTypeButtonText: {
// //     fontSize: 14,
// //     color: '#64748B',
// //     fontWeight: '600',
// //   },
// //   facilityTypeButtonTextActive: {
// //     color: '#FFFFFF',
// //     fontWeight: '700',
// //   },
// //   // Dark-themed Stats Styles
// //   statsWrapper: {
// //     marginHorizontal: 16,
// //     marginTop: 16,
// //     gap: 12,
// //   },
// //   statCardPrimary: {
// //     backgroundColor: '#2A241E',
// //     borderRadius: 20,
// //     padding: 20,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 16,
// //     elevation: 8,
// //   },
// //   statCardPrimaryHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   statCardPrimaryTitle: {
// //     fontSize: 14,
// //     color: '#94A3B8',
// //     fontWeight: '500',
// //   },
// //   statCardBadge: {
// //     backgroundColor: '#3D352D',
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#D9A46C',
// //   },
// //   statCardBadgeText: {
// //     fontSize: 14,
// //     color: '#D9A46C',
// //     fontWeight: '700',
// //   },
// //   statCardPrimaryContent: {
// //     flexDirection: 'row',
// //     alignItems: 'baseline',
// //     marginBottom: 16,
// //   },
// //   statCardPrimaryNumber: {
// //     fontSize: 52,
// //     fontWeight: 'bold',
// //     color: '#FFFFFF',
// //     marginRight: 8,
// //   },
// //   statCardPrimarySubtitle: {
// //     fontSize: 18,
// //     color: '#94A3B8',
// //     fontWeight: '500',
// //   },
// //   progressBarContainer: {
// //     height: 6,
// //     backgroundColor: '#334155',
// //     borderRadius: 3,
// //     overflow: 'hidden',
// //   },
// //   progressBar: {
// //     height: '100%',
// //     backgroundColor: '#D9A46C',
// //     borderRadius: 3,
// //   },
// //   statsRow: {
// //     flexDirection: 'row',
// //     gap: 12,
// //   },
// //   statCardSecondary: {
// //     flex: 1,
// //     backgroundColor: '#2A241E',
// //     borderRadius: 20,
// //     padding: 18,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 12,
// //     elevation: 6,
// //   },
// //   statCardSecondaryTitle: {
// //     fontSize: 16,
// //     color: '#FFFFFF',
// //     fontWeight: '600',
// //     marginBottom: 4,
// //   },
// //   statCardSecondarySubtitle: {
// //     fontSize: 12,
// //     color: '#64748B',
// //     fontWeight: '500',
// //     marginBottom: 16,
// //   },
// //   statCardSecondaryNumber: {
// //     fontSize: 36,
// //     fontWeight: 'bold',
// //     color: '#FFFFFF',
// //   },
// //   bookedNumber: {
// //     color: '#D9A46C',
// //   },
// //   availableNumber: {
// //     color: '#34D399',
// //   },
// //   statCardTertiary: {
// //     backgroundColor: '#2A241E',
// //     borderRadius: 20,
// //     padding: 18,
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 12,
// //     elevation: 6,
// //   },
// //   statCardTertiaryLeft: {
// //     flex: 1,
// //   },
// //   statCardTertiaryTitle: {
// //     fontSize: 16,
// //     color: '#FFFFFF',
// //     fontWeight: '600',
// //     marginBottom: 4,
// //   },
// //   statCardTertiarySubtitle: {
// //     fontSize: 12,
// //     color: '#64748B',
// //     fontWeight: '500',
// //     marginBottom: 12,
// //   },
// //   outOfServiceProgressContainer: {
// //     height: 8,
// //     backgroundColor: '#334155',
// //     borderRadius: 4,
// //     overflow: 'hidden',
// //     width: '100%',
// //   },
// //   outOfServiceProgressBar: {
// //     height: '100%',
// //     backgroundColor: '#F59E0B',
// //     borderRadius: 4,
// //     minWidth: 0,
// //   },
// //   statCardTertiaryRight: {
// //     alignItems: 'center',
// //     marginLeft: 16,
// //   },
// //   statCardTertiaryNumber: {
// //     fontSize: 42,
// //     fontWeight: 'bold',
// //     color: '#FFFFFF',
// //   },
// //   outOfServiceNumber: {
// //     color: '#FBBF24',
// //   },
// //   statCardTertiaryIndicator: {
// //     fontSize: 16,
// //     marginTop: 4,
// //   },
// //   // Room Type Filter Styles
// //   roomTypeContainer: {
// //     marginHorizontal: 16,
// //     marginTop: 16,
// //     backgroundColor: '#FFFFFF',
// //     padding: 16,
// //     borderRadius: 16,
// //     shadowColor: '#1E3A5F',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.06,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   roomTypeLabel: {
// //     fontSize: 13,
// //     fontWeight: '700',
// //     color: '#475569',
// //     marginBottom: 12,
// //     textTransform: 'uppercase',
// //     letterSpacing: 0.5,
// //   },
// //   roomTypeButtons: {
// //     flexDirection: 'row',
// //   },
// //   roomTypeButton: {
// //     paddingHorizontal: 16,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#F1F5F9',
// //     marginRight: 10,
// //     minHeight: 38,
// //     justifyContent: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   roomTypeButtonActive: {
// //     backgroundColor: '#D9A46C',
// //     borderColor: '#D9A46C',
// //   },
// //   roomTypeButtonText: {
// //     fontSize: 13,
// //     color: '#64748B',
// //     fontWeight: '600',
// //   },
// //   roomTypeButtonTextActive: {
// //     color: '#FFFFFF',
// //     fontWeight: '700',
// //   },
// //   legendContainer: {
// //     backgroundColor: '#FFFFFF',
// //     marginHorizontal: 16,
// //     marginTop: 16,
// //     padding: 16,
// //     borderRadius: 16,
// //     shadowColor: '#1E3A5F',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.06,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   legendTitle: {
// //     fontSize: 16,
// //     fontWeight: '700',
// //     color: '#2A241E',
// //     marginBottom: 14,
// //   },
// //   legendItems: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     gap: 20,
// //   },
// //   legendItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 10,
// //   },
// //   legendDot: {
// //     width: 14,
// //     height: 14,
// //     borderRadius: 7,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 4,
// //     elevation: 2,
// //   },
// //   legendDotBooking: {
// //     backgroundColor: '#002f79ff',
// //   },
// //   legendDotReservation: {
// //     backgroundColor: '#F59E0B',
// //   },
// //   legendDotOutOfService: {
// //     backgroundColor: '#EF4444',
// //   },
// //   legendText: {
// //     fontSize: 14,
// //     color: '#475569',
// //     fontWeight: '500',
// //   },
// //   // Calendar Styles
// //   calendarCard: {
// //     backgroundColor: '#FFFFFF',
// //     marginHorizontal: 16,
// //     marginTop: 16,
// //     marginBottom: 24,
// //     borderRadius: 20,
// //     shadowColor: '#1E3A5F',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 16,
// //     elevation: 6,
// //     overflow: 'hidden',
// //     paddingBottom: 10,
// //   },
// //   calendar: {
// //     borderRadius: 20,
// //   },
// //   // Custom Day Styles
// //   dayWrapper: { 
// //     width: 45, 
// //     height: 45, 
// //     alignItems: 'center', 
// //     justifyContent: 'center' 
// //   },
// //   dayCircle: { 
// //     width: 38, 
// //     height: 38, 
// //     borderRadius: 19, 
// //     alignItems: 'center', 
// //     justifyContent: 'center' 
// //   },
// //   todayOutline: { 
// //     borderWidth: 1.5, 
// //     borderColor: '#3B82F6' 
// //   },
// //   selectedDayCircle: { 
// //     backgroundColor: '#3B82F6' 
// //   },
// //   dayText: { 
// //     fontSize: 15, 
// //     color: '#374151' 
// //   },
// //   // Badge Styles
// //   badge: {
// //     position: 'absolute',
// //     top: -4,
// //     right: -4,
// //     backgroundColor: '#3B82F6',
// //     width: 18,
// //     height: 18,
// //     borderRadius: 9,
// //     borderWidth: 2,
// //     borderColor: '#FFF',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   badgeWhite: { 
// //     backgroundColor: '#FFF' 
// //   },
// //   badgeText: { 
// //     color: '#FFF', 
// //     fontSize: 9, 
// //     fontWeight: 'bold' 
// //   },
// //   // Modal Styles
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(15, 23, 42, 0.6)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContainer: {
// //     backgroundColor: '#FFFFFF',
// //     borderTopLeftRadius: 28,
// //     borderTopRightRadius: 28,
// //     maxHeight: '85%',
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingVertical: 18,
// //     paddingHorizontal: 24,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#E2E8F0',
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: '700',
// //     color: '#1E293B',
// //   },
// //   modalCloseButton: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     backgroundColor: '#F1F5F9',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   modalCloseText: {
// //     fontSize: 18,
// //     color: '#64748B',
// //     fontWeight: '600',
// //   },
// //   modalContent: {
// //     padding: 24,
// //     maxHeight: 400,
// //   },
// //   modalFooter: {
// //     padding: 20,
// //     paddingBottom: 34,
// //     borderTopWidth: 1,
// //     borderTopColor: '#E2E8F0',
// //   },
// //   modalButton: {
// //     backgroundColor: '#BCA382',
// //     paddingVertical: 16,
// //     borderRadius: 14,
// //     alignItems: 'center',
// //     shadowColor: '#BCA382',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   modalButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 16,
// //     fontWeight: '700',
// //   },
// //   periodCard: {
// //     padding: 18,
// //     backgroundColor: '#F8FAFC',
// //     borderRadius: 14,
// //     marginBottom: 14,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   periodCardHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 14,
// //   },
// //   periodFacilityName: {
// //     fontSize: 17,
// //     fontWeight: '700',
// //     color: '#1E293B',
// //     flex: 1,
// //   },
// //   periodBadge: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 20,
// //   },
// //   periodBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //     letterSpacing: 0.3,
// //   },
// //   periodDetail: {
// //     fontSize: 14,
// //     color: '#64748B',
// //     marginBottom: 8,
// //     lineHeight: 20,
// //   },
// //   paymentStatusContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 10,
// //     marginTop: 10,
// //     paddingTop: 10,
// //     borderTopWidth: 1,
// //     borderTopColor: '#E2E8F0',
// //   },
// //   paymentBadge: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 20,
// //   },
// //   paymentBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //     letterSpacing: 0.3,
// //   },
// // });

// // export default calender;

// // screens/calendar/calender.js
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   RefreshControl,
//   ActivityIndicator,
//   SafeAreaView,
//   Alert,
//   Dimensions,
//   Platform,
//   StatusBar,
//   TextInput,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import { useAuth } from '../auth/contexts/AuthContext';
// import { calendarAPI } from '../../config/apis';
// import DateTimePicker from '@react-native-community/datetimepicker';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Date Utilities
// const dateUtils = {
//   format: (date, formatStr) => {
//     if (!date) return '';
//     const d = new Date(date);
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//     if (formatStr === 'MMM d') {
//       return `${months[d.getMonth()]} ${d.getDate()}`;
//     } else if (formatStr === 'EEE') {
//       return days[d.getDay()];
//     } else if (formatStr === 'MMM d, yyyy') {
//       return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
//     } else if (formatStr === 'MMMM d, yyyy') {
//       return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
//     } else if (formatStr === 'EEEE, MMMM d, yyyy') {
//       return `${fullDays[d.getDay()]}, ${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
//     } else if (formatStr === 'yyyy-MM-dd') {
//       const year = d.getFullYear();
//       const month = String(d.getMonth() + 1).padStart(2, '0');
//       const day = String(d.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     } else if (formatStr === 'MMMM yyyy') {
//       return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`;
//     } else if (formatStr === 'MM/yyyy') {
//       const month = String(d.getMonth() + 1).padStart(2, '0');
//       return `${month}/${d.getFullYear()}`;
//     } else if (formatStr === 'dd') {
//       return d.getDate().toString();
//     }
//     return d.toString();
//   },

//   parseISO: (dateString) => {
//     if (!dateString) return new Date();
//     if (dateString.includes('T')) {
//       return new Date(dateString);
//     }
//     return new Date(dateString + 'T00:00:00');
//   },

//   isSameDay: (date1, date2) => {
//     if (!date1 || !date2) return false;
//     const d1 = new Date(date1);
//     const d2 = new Date(date2);
//     return d1.getFullYear() === d2.getFullYear() &&
//       d1.getMonth() === d2.getMonth() &&
//       d1.getDate() === d2.getDate();
//   },

//   startOfMonth: (date) => {
//     const result = new Date(date);
//     result.setDate(1);
//     result.setHours(0, 0, 0, 0);
//     return result;
//   },

//   endOfMonth: (date) => {
//     const result = new Date(date);
//     result.setMonth(result.getMonth() + 1);
//     result.setDate(0);
//     result.setHours(23, 59, 59, 999);
//     return result;
//   },

//   isSameMonth: (date1, date2) => {
//     const d1 = new Date(date1);
//     const d2 = new Date(date2);
//     return d1.getFullYear() === d2.getFullYear() &&
//       d1.getMonth() === d2.getMonth();
//   },

//   startOfDay: (date) => {
//     const result = new Date(date);
//     result.setHours(0, 0, 0, 0);
//     return result;
//   },

//   addDays: (date, days) => {
//     const result = new Date(date);
//     result.setDate(result.getDate() + days);
//     return result;
//   },

//   differenceInDays: (date1, date2) => {
//     const d1 = new Date(date1);
//     const d2 = new Date(date2);
//     const diffTime = Math.abs(d2 - d1);
//     return Math.floor(diffTime / (1000 * 60 * 60 * 24));
//   },
// };

// const calender = ({ navigation }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedFacilityType, setSelectedFacilityType] = useState('ROOMS');
//   const [selectedRoomType, setSelectedRoomType] = useState('ALL');
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [selectedPeriod, setSelectedPeriod] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   // New filter states
//   const [searchByMonth, setSearchByMonth] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState(new Date());
//   const [showMonthPicker, setShowMonthPicker] = useState(false);
//   const [searchByRoomMonth, setSearchByRoomMonth] = useState(false);
//   const [selectedRoomNumber, setSelectedRoomNumber] = useState('');

//   // Data states
//   const [rooms, setRooms] = useState([]);
//   const [halls, setHalls] = useState([]);
//   const [lawns, setLawns] = useState([]);
//   const [photoshoots, setPhotoshoots] = useState([]);

//   const { user } = useAuth();

//   // Build API params based on filters
//   const getApiParams = useCallback(() => {
//     const params = {};

//     if (searchByMonth && selectedMonth) {
//       const startOfMonth = dateUtils.startOfMonth(selectedMonth);
//       const endOfMonth = dateUtils.endOfMonth(selectedMonth);
//       params.startDate = dateUtils.format(startOfMonth, 'yyyy-MM-dd');
//       params.endDate = dateUtils.format(endOfMonth, 'yyyy-MM-dd');
//     }

//     if (searchByRoomMonth && selectedRoomNumber) {
//       params.roomNumber = selectedRoomNumber;
//     }

//     return params;
//   }, [searchByMonth, selectedMonth, searchByRoomMonth, selectedRoomNumber]);

//   // Fetch data function
//   const fetchData = useCallback(async () => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const params = getApiParams();

//       // Fetch data based on selected facility type
//       switch (selectedFacilityType) {
//         case 'ROOMS':
//           const roomsData = await calendarAPI.getCalendarRooms(params);
//           setRooms(roomsData || []);
//           break;

//         case 'HALLS':
//           const hallsData = await calendarAPI.getHalls(params);
//           setHalls(hallsData || []);
//           break;

//         case 'LAWNS':
//           const lawnsData = await calendarAPI.getLawns(params);
//           setLawns(lawnsData || []);
//           break;

//         case 'PHOTOSHOOTS':
//           const photoshootsData = await calendarAPI.getPhotoshoots(params);
//           setPhotoshoots(photoshootsData || []);
//           break;

//         default:
//           break;
//       }

//     } catch (error) {
//       console.error('Error fetching calendar data:', error);
//       setError(error.message || 'Failed to load calendar data');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [user, selectedFacilityType, getApiParams]);

//   // Initial load
//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // Refresh function
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchData();
//   }, [fetchData]);

//   // Get current facility data
//   const getCurrentFacilities = () => {
//     switch (selectedFacilityType) {
//       case 'ROOMS':
//         return rooms;
//       case 'HALLS':
//         return halls;
//       case 'LAWNS':
//         return lawns;
//       case 'PHOTOSHOOTS':
//         return photoshoots;
//       default:
//         return [];
//     }
//   };

//   // Filter rooms based on selection
//   const filteredRooms = useMemo(() => {
//     return rooms.filter(room => {
//       const typeMatch = selectedRoomType === 'ALL' || room.roomType?.type === selectedRoomType;
//       const roomMatch = !selectedRoom || room.id?.toString() === selectedRoom;
//       return typeMatch && roomMatch;
//     });
//   }, [rooms, selectedRoomType, selectedRoom]);

//   // Get facilities to display
//   const getFacilitiesForDisplay = useMemo(() => {
//     if (selectedFacilityType === 'ROOMS') {
//       return filteredRooms;
//     }
//     return getCurrentFacilities();
//   }, [selectedFacilityType, filteredRooms]);

//   // Generate marked dates for calendar view
//   const markedDates = useMemo(() => {
//     const facilities = getFacilitiesForDisplay;
//     const marks = {};

//     if (!facilities || facilities.length === 0) return marks;

//     facilities.forEach(facility => {
//       // Process bookings
//       if (facility.bookings && Array.isArray(facility.bookings)) {
//         facility.bookings.forEach(booking => {
//           if (!booking) return;

//           try {
//             const startDate = dateUtils.parseISO(
//               booking.checkIn || booking.bookingDate || booking.date ||
//               booking.shootDate || booking.eventDate || booking.startDate || booking.createdAt
//             );

//             // For rooms with checkIn/checkOut
//             if (booking.checkIn && booking.checkOut) {
//               const endDate = dateUtils.parseISO(booking.checkOut);

//               if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
//                 let currentDate = new Date(startDate);
//                 while (currentDate <= endDate) {
//                   const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
//                   if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
//                   marks[dateString].count += 1;
//                   currentDate.setDate(currentDate.getDate() + 1);
//                 }
//               }
//             } else {
//               // For single day events
//               if (!isNaN(startDate.getTime())) {
//                 const dateString = dateUtils.format(startDate, 'yyyy-MM-dd');
//                 if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
//                 marks[dateString].count += 1;
//               }
//             }
//           } catch (err) {
//             console.error('Error processing booking:', err);
//           }
//         });
//       }

//       // Process reservations
//       if (facility.reservations && Array.isArray(facility.reservations)) {
//         facility.reservations.forEach(reservation => {
//           if (!reservation) return;

//           try {
//             const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
//             const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

//             if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
//               let currentDate = new Date(startDate);
//               while (currentDate <= endDate) {
//                 const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
//                 if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
//                 marks[dateString].count += 1;
//                 currentDate.setDate(currentDate.getDate() + 1);
//               }
//             }
//           } catch (err) {
//             console.error('Error processing reservation:', err);
//           }
//         });
//       }

//       // Process out of order periods
//       if (facility.outOfOrders && Array.isArray(facility.outOfOrders)) {
//         facility.outOfOrders.forEach(outOfOrder => {
//           if (!outOfOrder) return;

//           try {
//             const startDate = dateUtils.parseISO(outOfOrder.startDate);
//             const endDate = dateUtils.parseISO(outOfOrder.endDate);

//             if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
//               let currentDate = new Date(startDate);
//               while (currentDate <= endDate) {
//                 const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
//                 if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
//                 marks[dateString].count += 1;
//                 currentDate.setDate(currentDate.getDate() + 1);
//               }
//             }
//           } catch (err) {
//             console.error('Error processing outOfOrder:', err);
//           }
//         });
//       }
//     });

//     // Add custom styles to marked dates (blue theme)
//     Object.keys(marks).forEach(date => {
//       const count = marks[date].count;
//       marks[date].selected = count > 0;
//       marks[date].selectedColor = '#002f79ff'; // Blue color for bookings
//       marks[date].selectedTextColor = '#FFFFFF';
//       marks[date].dots = [
//         {
//           key: 'booking',
//           color: '#002f79ff',
//           selectedDotColor: '#FFFFFF'
//         }
//       ];
//     });

//     return marks;
//   }, [getFacilitiesForDisplay]);

//   // Get events for a specific date
//   const getEventsForDate = useCallback((dateString) => {
//     const facilities = getFacilitiesForDisplay;
//     const selectedDate = dateUtils.parseISO(dateString);
//     const periodsOnDate = [];

//     if (!facilities || facilities.length === 0) return periodsOnDate;

//     facilities.forEach(facility => {
//       // Check bookings
//       if (facility.bookings && Array.isArray(facility.bookings)) {
//         facility.bookings.forEach(booking => {
//           try {
//             const startDate = dateUtils.parseISO(
//               booking.checkIn || booking.bookingDate || booking.date ||
//               booking.shootDate || booking.eventDate || booking.startDate || booking.createdAt
//             );

//             if (booking.checkIn && booking.checkOut) {
//               const endDate = dateUtils.parseISO(booking.checkOut);
//               if (selectedDate >= startDate && selectedDate <= endDate) {
//                 periodsOnDate.push({
//                   facility,
//                   type: 'booking',
//                   data: booking,
//                   isCancelled: booking.paymentStatus === 'CANCELLED' || booking.status === 'CANCELLED',
//                   isConfirmed: booking.status === 'CONFIRMED' || booking.paymentStatus === 'PAID',
//                 });
//               }
//             } else if (dateUtils.isSameDay(selectedDate, startDate)) {
//               periodsOnDate.push({
//                 facility,
//                 type: 'booking',
//                 data: booking,
//                 isCancelled: booking.paymentStatus === 'CANCELLED' || booking.status === 'CANCELLED',
//                 isConfirmed: booking.status === 'CONFIRMED' || booking.paymentStatus === 'PAID',
//               });
//             }
//           } catch (err) {
//             console.error('Error processing booking for date:', err);
//           }
//         });
//       }

//       // Check reservations
//       if (facility.reservations && Array.isArray(facility.reservations)) {
//         facility.reservations.forEach(reservation => {
//           try {
//             const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
//             const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

//             if (selectedDate >= startDate && selectedDate <= endDate) {
//               periodsOnDate.push({
//                 facility,
//                 type: 'reservation',
//                 data: reservation,
//               });
//             }
//           } catch (err) {
//             console.error('Error processing reservation for date:', err);
//           }
//         });
//       }

//       // Check out of order periods
//       if (facility.outOfOrders && Array.isArray(facility.outOfOrders)) {
//         facility.outOfOrders.forEach(outOfOrder => {
//           try {
//             const startDate = dateUtils.parseISO(outOfOrder.startDate);
//             const endDate = dateUtils.parseISO(outOfOrder.endDate);

//             if (selectedDate >= startDate && selectedDate <= endDate) {
//               periodsOnDate.push({
//                 facility,
//                 type: 'outOfOrder',
//                 data: outOfOrder,
//               });
//             }
//           } catch (err) {
//             console.error('Error processing outOfOrder for date:', err);
//           }
//         });
//       }
//     });

//     return periodsOnDate;
//   }, [getFacilitiesForDisplay]);

//   // Custom Day Component
//   const DayComponent = ({ date, state, marking }) => {
//     const isToday = dateUtils.isSameDay(new Date(), date.dateString);
//     const count = marking?.count || 0;
//     const hasEvents = count > 0;

//     return (
//       <TouchableOpacity 
//         style={styles.dayWrapper}
//         onPress={() => {
//           const events = getEventsForDate(date.dateString);
//           if (events.length > 0) {
//             setSelectedPeriod({
//               date: dateUtils.parseISO(date.dateString),
//               periods: events,
//             });
//           }
//         }}
//         activeOpacity={0.7}
//       >
//         <View style={[
//           styles.dayContainer,
//           isToday && styles.todayContainer,
//           hasEvents && styles.hasEventsContainer,
//           marking?.selected && { backgroundColor: '#002f79ff' } // Blue for selected days
//         ]}>
//           <Text style={[
//             styles.dayText,
//             state === 'disabled' && styles.disabledDayText,
//             isToday && styles.todayText,
//             marking?.selected && styles.selectedDayText
//           ]}>
//             {date.day}
//           </Text>

//           {count > 0 && (
//             <View style={[
//               styles.eventBadge,
//               count > 3 && styles.eventBadgeHigh,
//               count > 1 && count <= 3 && styles.eventBadgeMedium
//             ]}>
//               <Text style={styles.eventBadgeText}>
//                 {count > 9 ? '9+' : count}
//               </Text>
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // Get facility type display name
//   const getFacilityTypeName = (type) => {
//     const names = {
//       'ROOMS': 'Rooms',
//       'HALLS': 'Halls',
//       'LAWNS': 'Lawns',
//       'PHOTOSHOOTS': 'Photoshoots',
//     };
//     return names[type] || 'Rooms';
//   };

//   // Get facility name
//   const getFacilityName = (facility) => {
//     if (!facility) return 'Unknown Facility';

//     if (selectedFacilityType === 'ROOMS') {
//       return `Room ${facility.roomNumber || facility.roomNo || facility.roomName || facility.id || 'N/A'}`;
//     }
//     return facility.name || facility.title || `Facility ${facility.id || 'N/A'}`;
//   };

//   // Calculate statistics
//   const calculateStatistics = useMemo(() => {
//     const facilities = getFacilitiesForDisplay;
//     const total = facilities.length;
//     const booked = facilities.filter(f => f.isBooked || f.status === 'BOOKED').length;
//     const available = facilities.filter(f => !f.isBooked && !f.isOutOfOrder && !f.isReserved).length;
//     const outOfService = facilities.filter(f => f.isOutOfOrder || f.status === 'MAINTENANCE').length;

//     return {
//       total,
//       booked,
//       available,
//       outOfService,
//       occupancyRate: total > 0 ? Math.round((booked / total) * 100) : 0,
//       availabilityRate: total > 0 ? Math.round((available / total) * 100) : 0,
//     };
//   }, [getFacilitiesForDisplay]);

//   // Get unique room types
//   const roomTypes = useMemo(() => {
//     const types = [...new Set(rooms.map(room => room.roomType?.type).filter(Boolean))];
//     return types;
//   }, [rooms]);

//   // Get unique room numbers for search filter
//   const roomNumbers = useMemo(() => {
//     const numbers = [...new Set(rooms.map(room => room.roomNumber || room.roomNo).filter(Boolean))];
//     return numbers.sort((a, b) => a - b);
//   }, [rooms]);

//   // Handle month picker change
//   const onMonthChange = (event, selectedDate) => {
//     setShowMonthPicker(false);
//     if (selectedDate) {
//       setSelectedMonth(selectedDate);
//     }
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearchByMonth(false);
//     setSearchByRoomMonth(false);
//     setSelectedRoomNumber('');
//     setSelectedMonth(new Date());
//     setSelectedRoomType('ALL');
//     setSelectedRoom(null);
//   };

//   // Loading state
//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#D9A46C" />
//         <Text style={styles.loadingText}>Loading calendar data...</Text>
//       </View>
//     );
//   }

//   const stats = calculateStatistics;
//   const facilities = getFacilitiesForDisplay;

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F2F0EC" />

//       <ScrollView
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={onRefresh} 
//             colors={['#D9A46C']}
//             tintColor="#D9A46C"
//           />
//         }
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         {/* <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.backIcon}>‹</Text>
//             <Text style={styles.backText}>Back</Text>
//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>Facility Calendar</Text>

//           <TouchableOpacity
//             style={styles.refreshButton}
//             onPress={onRefresh}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.refreshIcon}>↻</Text>
//           </TouchableOpacity>
//         </View> */}

//         {/* Error Banner */}
//         {error && (
//           <View style={styles.errorBanner}>
//             <Text style={styles.errorBannerText}>
//               {error.includes('404') ? 'Endpoint not found. Please check API configuration.' : error}
//             </Text>
//           </View>
//         )}

//         {/* Search Filters */}
//         <View style={styles.filtersContainer}>
//           <Text style={styles.sectionTitle}>Search Filters</Text>

//           {/* Search by Month */}
//           <View style={styles.filterRow}>
//             <TouchableOpacity
//               style={[
//                 styles.filterToggle,
//                 searchByMonth && styles.filterToggleActive
//               ]}
//               onPress={() => {
//                 setSearchByMonth(!searchByMonth);
//                 if (!searchByMonth) {
//                   setSearchByRoomMonth(false);
//                 }
//               }}
//               activeOpacity={0.7}
//             >
//               <Text style={[
//                 styles.filterToggleText,
//                 searchByMonth && styles.filterToggleTextActive
//               ]}>
//                 Search by Month
//               </Text>
//             </TouchableOpacity>

//             {searchByMonth && (
//               <TouchableOpacity
//                 style={styles.monthPickerButton}
//                 onPress={() => setShowMonthPicker(true)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.monthPickerButtonText}>
//                   {dateUtils.format(selectedMonth, 'MMMM yyyy')}
//                 </Text>
//                 <Text style={styles.monthPickerButtonIcon}>▼</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Search by Room + Month */}
//           <View style={styles.filterRow}>
//             <TouchableOpacity
//               style={[
//                 styles.filterToggle,
//                 searchByRoomMonth && styles.filterToggleActive
//               ]}
//               onPress={() => {
//                 setSearchByRoomMonth(!searchByRoomMonth);
//                 if (!searchByRoomMonth) {
//                   setSearchByMonth(false);
//                 }
//               }}
//               activeOpacity={0.7}
//             >
//               <Text style={[
//                 styles.filterToggleText,
//                 searchByRoomMonth && styles.filterToggleTextActive
//               ]}>
//                 Search by Room + Month
//               </Text>
//             </TouchableOpacity>

//             {searchByRoomMonth && (
//               <View style={styles.roomMonthContainer}>
//                 <TextInput
//                   style={styles.roomNumberInput}
//                   placeholder="Enter room number"
//                   value={selectedRoomNumber}
//                   onChangeText={setSelectedRoomNumber}
//                   keyboardType="numeric"
//                 />
//                 <TouchableOpacity
//                   style={styles.monthPickerButton}
//                   onPress={() => setShowMonthPicker(true)}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.monthPickerButtonText}>
//                     {dateUtils.format(selectedMonth, 'MM/yyyy')}
//                   </Text>
//                   <Text style={styles.monthPickerButtonIcon}>▼</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* Reset Filters */}
//           {(searchByMonth || searchByRoomMonth || selectedRoomNumber || selectedRoomType !== 'ALL') && (
//             <TouchableOpacity
//               style={styles.resetButton}
//               onPress={resetFilters}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.resetButtonText}>Reset Filters</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Month Picker Modal */}
//         {showMonthPicker && (
//           <Modal
//             transparent={true}
//             animationType="slide"
//             visible={showMonthPicker}
//             onRequestClose={() => setShowMonthPicker(false)}
//           >
//             <View style={styles.monthPickerOverlay}>
//               <View style={styles.monthPickerContainer}>
//                 <View style={styles.monthPickerHeader}>
//                   <Text style={styles.monthPickerTitle}>Select Month</Text>
//                   <TouchableOpacity
//                     style={styles.monthPickerCloseButton}
//                     onPress={() => setShowMonthPicker(false)}
//                   >
//                     <Text style={styles.monthPickerCloseText}>✕</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <DateTimePicker
//                   value={selectedMonth}
//                   mode="date"
//                   display="spinner"
//                   onChange={onMonthChange}
//                   style={styles.dateTimePicker}
//                 />
//                 <View style={styles.monthPickerFooter}>
//                   <TouchableOpacity
//                     style={styles.monthPickerDoneButton}
//                     onPress={() => setShowMonthPicker(false)}
//                   >
//                     <Text style={styles.monthPickerDoneText}>Done</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Modal>
//         )}

//         {/* Facility Type Filter */}
//         <View style={styles.facilityTypeContainer}>
//           <Text style={styles.sectionTitle}>Select Facility Type</Text>
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false} 
//             contentContainerStyle={styles.facilityTypeButtonsContainer}
//           >
//             {['ROOMS', 'HALLS', 'LAWNS', 'PHOTOSHOOTS'].map((type) => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   styles.facilityTypeButton,
//                   selectedFacilityType === type && styles.facilityTypeButtonActive,
//                 ]}
//                 onPress={() => {
//                   setSelectedFacilityType(type);
//                   setSelectedRoomType('ALL');
//                   setSelectedRoom(null);
//                   setSelectedRoomNumber('');
//                 }}
//                 activeOpacity={0.7}
//               >
//                 <Text
//                   style={[
//                     styles.facilityTypeButtonText,
//                     selectedFacilityType === type && styles.facilityTypeButtonTextActive,
//                   ]}
//                 >
//                   {getFacilityTypeName(type)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Room-specific filters */}
//         {selectedFacilityType === 'ROOMS' && roomTypes.length > 0 && (
//           <View style={styles.roomTypeContainer}>
//             <Text style={styles.sectionTitle}>Filter by Room Type</Text>
//             <ScrollView 
//               horizontal 
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.roomTypeButtonsContainer}
//             >
//               <TouchableOpacity
//                 style={[
//                   styles.roomTypeButton,
//                   selectedRoomType === 'ALL' && styles.roomTypeButtonActive,
//                 ]}
//                 onPress={() => setSelectedRoomType('ALL')}
//                 activeOpacity={0.7}
//               >
//                 <Text
//                   style={[
//                     styles.roomTypeButtonText,
//                     selectedRoomType === 'ALL' && styles.roomTypeButtonTextActive,
//                   ]}
//                 >
//                   All Types
//                 </Text>
//               </TouchableOpacity>
//               {roomTypes.map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   style={[
//                     styles.roomTypeButton,
//                     selectedRoomType === type && styles.roomTypeButtonActive,
//                   ]}
//                   onPress={() => setSelectedRoomType(type)}
//                   activeOpacity={0.7}
//                 >
//                   <Text
//                     style={[
//                       styles.roomTypeButtonText,
//                       selectedRoomType === type && styles.roomTypeButtonTextActive,
//                     ]}
//                   >
//                     {type}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {/* Statistics */}
//         <View style={styles.statsWrapper}>
//           {/* Top Card - Total */}
//           <View style={styles.statCardPrimary}>
//             <View style={styles.statCardPrimaryHeader}>
//               <Text style={styles.statCardPrimaryTitle}>Total {getFacilityTypeName(selectedFacilityType)}</Text>
//               <View style={styles.statCardBadge}>
//                 <Text style={styles.statCardBadgeText}>
//                   {stats.occupancyRate}%
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.statCardPrimaryContent}>
//               <Text style={styles.statCardPrimaryNumber}>{stats.total}</Text>
//               <Text style={styles.statCardPrimarySubtitle}>{getFacilityTypeName(selectedFacilityType).toLowerCase()}</Text>
//             </View>
//             <View style={styles.progressBarContainer}>
//               <View style={[styles.progressBar, { width: `${stats.occupancyRate}%` }]} />
//             </View>
//           </View>

//           {/* Middle Row - Booked & Available */}
//           <View style={styles.statsRow}>
//             {/* Booked Card */}
//             <View style={styles.statCardSecondary}>
//               <Text style={styles.statCardSecondaryTitle}>Booked</Text>
//               <Text style={styles.statCardSecondarySubtitle}>Rooms occupied</Text>
//               <Text style={[styles.statCardSecondaryNumber, styles.bookedNumber]}>
//                 {stats.booked}
//               </Text>
//             </View>

//             {/* Available Card */}
//             <View style={styles.statCardSecondary}>
//               <Text style={styles.statCardSecondaryTitle}>Available</Text>
//               <Text style={styles.statCardSecondarySubtitle}>Ready to book</Text>
//               <Text style={[styles.statCardSecondaryNumber, styles.availableNumber]}>
//                 {stats.available}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Legend */}
//         <View style={styles.legendContainer}>
//           <Text style={styles.legendTitle}>Legend</Text>
//           <View style={styles.legendItems}>
//             <View style={styles.legendItem}>
//               <View style={[styles.legendDot, styles.legendDotBooking]} />
//               <Text style={styles.legendText}>Bookings</Text>
//             </View>
//             <View style={styles.legendItem}>
//               <View style={[styles.legendDot, styles.legendDotReservation]} />
//               <Text style={styles.legendText}>Reservations</Text>
//             </View>
//             <View style={styles.legendItem}>
//               <View style={[styles.legendDot, styles.legendDotOutOfService]} />
//               <Text style={styles.legendText}>Out of Service</Text>
//             </View>
//           </View>
//         </View>

//         {/* Calendar View */}
//         <View style={styles.calendarCard}>
//           <Calendar
//             current={dateUtils.format(new Date(), 'yyyy-MM-dd')}
//             dayComponent={DayComponent}
//             markedDates={markedDates}
//             theme={{
//               calendarBackground: '#ffffff',
//               textSectionTitleColor: '#6B7280',
//               selectedDayBackgroundColor: '#002f79ff', // Blue color
//               selectedDayTextColor: '#ffffff',
//               todayTextColor: '#002f79ff', // Blue color for today
//               dayTextColor: '#374151',
//               textDisabledColor: '#D1D5DB',
//               arrowColor: '#002f79ff', // Blue arrows
//               monthTextColor: '#111827',
//               textDayFontFamily: 'System',
//               textMonthFontFamily: 'System',
//               textDayHeaderFontFamily: 'System',
//               textDayFontSize: 16,
//               textMonthFontSize: 18,
//               textDayHeaderFontSize: 14,
//             }}
//             style={styles.calendar}
//           />
//         </View>
//       </ScrollView>

//       {/* Period Details Modal */}
//       <Modal
//         visible={!!selectedPeriod}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setSelectedPeriod(null)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {selectedPeriod?.date
//                   ? dateUtils.format(selectedPeriod.date, 'MMMM d, yyyy')
//                   : 'Booking Details'}
//               </Text>
//               <TouchableOpacity
//                 style={styles.modalCloseButton}
//                 onPress={() => setSelectedPeriod(null)}
//               >
//                 <Text style={styles.modalCloseText}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalContent}>
//               {selectedPeriod?.periods ? (
//                 selectedPeriod.periods.map((period, index) => (
//                   <View key={index} style={styles.periodCard}>
//                     <View style={styles.periodCardHeader}>
//                       <Text style={styles.periodFacilityName}>
//                         {getFacilityName(period.facility)}
//                       </Text>
//                       <View
//                         style={[
//                           styles.periodBadge,
//                           {
//                             backgroundColor:
//                               period.type === 'booking'
//                                 ? period.isCancelled 
//                                   ? '#FEE2E2'
//                                   : period.isConfirmed
//                                     ? '#F2F0EC'
//                                     : '#F2F0EC'
//                                 : period.type === 'reservation'
//                                   ? '#FEF3C7'
//                                   : '#FEE2E2',
//                           },
//                         ]}
//                       >
//                         <Text
//                           style={[
//                             styles.periodBadgeText,
//                             {
//                               color:
//                                 period.type === 'booking'
//                                   ? period.isCancelled
//                                     ? '#991B1B'
//                                     : period.isConfirmed
//                                       ? '#92400E'
//                                       : '#002f79ff' // Blue for booking
//                                   : period.type === 'reservation'
//                                     ? '#92400E'
//                                     : '#991B1B',
//                             },
//                           ]}
//                         >
//                           {period.isCancelled ? 'CANCELLED' : 
//                            period.isConfirmed ? 'CONFIRMED' : 
//                            period.type.toUpperCase()}
//                         </Text>
//                       </View>
//                     </View>

//                     {period.type === 'booking' && (
//                       <>
//                         {period.data.memberName && (
//                           <Text style={styles.periodDetail}>
//                             Guest: {period.data.memberName}
//                           </Text>
//                         )}
//                         {period.data.guestName && (
//                           <Text style={styles.periodDetail}>
//                             Guest: {period.data.guestName}
//                           </Text>
//                         )}
//                         {(period.data.checkIn || period.data.bookingDate) && (
//                           <Text style={styles.periodDetail}>
//                             Date: {dateUtils.format(
//                               dateUtils.parseISO(period.data.checkIn || period.data.bookingDate),
//                               'MMM d, yyyy'
//                             )}
//                             {period.data.checkOut && ` to ${dateUtils.format(
//                               dateUtils.parseISO(period.data.checkOut),
//                               'MMM d, yyyy'
//                             )}`}
//                           </Text>
//                         )}
//                         {period.data.totalPrice && (
//                           <Text style={styles.periodDetail}>
//                             Amount: PKR {parseInt(period.data.totalPrice).toLocaleString()}
//                           </Text>
//                         )}
//                         {period.data.paymentStatus && (
//                           <View style={styles.paymentStatusContainer}>
//                             <Text style={styles.periodDetail}>Payment: </Text>
//                             <View
//                               style={[
//                                 styles.paymentBadge,
//                                 {
//                                   backgroundColor:
//                                     period.data.paymentStatus === 'PAID'
//                                       ? '#D1FAE5'
//                                       : period.data.paymentStatus === 'UNPAID'
//                                         ? '#FEE2E2'
//                                         : '#FEF3C7',
//                                 },
//                               ]}
//                             >
//                               <Text
//                                 style={[
//                                   styles.paymentBadgeText,
//                                   {
//                                     color:
//                                       period.data.paymentStatus === 'PAID'
//                                         ? '#065F46'
//                                         : period.data.paymentStatus === 'UNPAID'
//                                           ? '#991B1B'
//                                           : '#92400E',
//                                   },
//                                 ]}
//                               >
//                                 {period.data.paymentStatus}
//                               </Text>
//                             </View>
//                           </View>
//                         )}
//                       </>
//                     )}

//                     {period.type === 'reservation' && (
//                       <>
//                         <Text style={styles.periodDetail}>
//                           Reserved by: {period.data.admin?.name || 'Admin'}
//                         </Text>
//                         <Text style={styles.periodDetail}>
//                           Period: {dateUtils.format(
//                             dateUtils.parseISO(period.data.reservedFrom || period.data.startDate),
//                             'MMM d, yyyy'
//                           )} - {dateUtils.format(
//                             dateUtils.parseISO(period.data.reservedTo || period.data.endDate),
//                             'MMM d, yyyy'
//                           )}
//                         </Text>
//                       </>
//                     )}

//                     {period.type === 'outOfOrder' && (
//                       <>
//                         <Text style={styles.periodDetail}>
//                           Reason: {period.data.reason || 'Maintenance'}
//                         </Text>
//                         <Text style={styles.periodDetail}>
//                           Period: {dateUtils.format(
//                             dateUtils.parseISO(period.data.startDate),
//                             'MMM d, yyyy'
//                           )} - {dateUtils.format(
//                             dateUtils.parseISO(period.data.endDate),
//                             'MMM d, yyyy'
//                           )}
//                         </Text>
//                       </>
//                     )}
//                   </View>
//                 ))
//               ) : null}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.modalButton}
//                 onPress={() => setSelectedPeriod(null)}
//               >
//                 <Text style={styles.modalButtonText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F0EC',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F2F0EC',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#64748B',
//     fontWeight: '500',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#F2F0EC',
//     paddingTop: 16,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingRight: 12,
//   },
//   backIcon: {
//     fontSize: 28,
//     color: '#D9A46C',
//     fontWeight: '300',
//     marginRight: 2,
//   },
//   backText: {
//     fontSize: 16,
//     color: '#D9A46C',
//     fontWeight: '400',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#111827',
//     textAlign: 'center',
//     flex: 1,
//   },
//   headerRight: {
//     width: 60,
//   },
//   refreshButton: {
//     padding: 8,
//   },
//   refreshIcon: {
//     fontSize: 20,
//     color: '#D9A46C',
//     fontWeight: '600',
//   },
//   // Error Banner
//   errorBanner: {
//     backgroundColor: '#FEE2E2',
//     marginHorizontal: 16,
//     marginTop: 10,
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#FCA5A5',
//   },
//   errorBannerText: {
//     fontSize: 14,
//     color: '#991B1B',
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   // Filters Container
//   filtersContainer: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#1E3A5F',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#2A241E',
//     marginBottom: 12,
//   },
//   filterRow: {
//     marginBottom: 12,
//   },
//   filterToggle: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: '#F1F5F9',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   filterToggleActive: {
//     backgroundColor: '#D9A46C',
//     borderColor: '#D9A46C',
//   },
//   filterToggleText: {
//     fontSize: 14,
//     color: '#64748B',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   filterToggleTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//   },
//   monthPickerButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     marginTop: 8,
//   },
//   monthPickerButtonText: {
//     fontSize: 14,
//     color: '#374151',
//     fontWeight: '500',
//   },
//   monthPickerButtonIcon: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   roomMonthContainer: {
//     marginTop: 8,
//   },
//   roomNumberInput: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     fontSize: 14,
//     color: '#374151',
//     marginBottom: 8,
//   },
//   resetButton: {
//     backgroundColor: '#EF4444',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   resetButtonText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   // Month Picker Modal
//   monthPickerOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   monthPickerContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     width: '90%',
//     maxWidth: 400,
//   },
//   monthPickerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   monthPickerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   monthPickerCloseButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   monthPickerCloseText: {
//     fontSize: 16,
//     color: '#6B7280',
//     fontWeight: '600',
//   },
//   dateTimePicker: {
//     height: 200,
//   },
//   monthPickerFooter: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   monthPickerDoneButton: {
//     backgroundColor: '#D9A46C',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   monthPickerDoneText: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   // Facility Type Filter Styles
//   facilityTypeContainer: {
//     marginHorizontal: 16,
//     marginTop: 16,
//   },
//   facilityTypeButtonsContainer: {
//     flexDirection: 'row',
//     paddingVertical: 4,
//   },
//   facilityTypeButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: '#FFFFFF',
//     marginRight: 10,
//     minHeight: 44,
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     shadowColor: '#1E3A5F',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   facilityTypeButtonActive: {
//     backgroundColor: '#BCA382',
//     borderColor: '#BCA382',
//   },
//   facilityTypeButtonText: {
//     fontSize: 14,
//     color: '#64748B',
//     fontWeight: '600',
//   },
//   facilityTypeButtonTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//   },
//   // Stats Styles
//   statsWrapper: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     gap: 12,
//   },
//   statCardPrimary: {
//     backgroundColor: '#2A241E',
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.25,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   statCardPrimaryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   statCardPrimaryTitle: {
//     fontSize: 14,
//     color: '#94A3B8',
//     fontWeight: '500',
//   },
//   statCardBadge: {
//     backgroundColor: '#3D352D',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#D9A46C',
//   },
//   statCardBadgeText: {
//     fontSize: 14,
//     color: '#D9A46C',
//     fontWeight: '700',
//   },
//   statCardPrimaryContent: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginBottom: 16,
//   },
//   statCardPrimaryNumber: {
//     fontSize: 52,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginRight: 8,
//   },
//   statCardPrimarySubtitle: {
//     fontSize: 18,
//     color: '#94A3B8',
//     fontWeight: '500',
//   },
//   progressBarContainer: {
//     height: 6,
//     backgroundColor: '#334155',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#D9A46C',
//     borderRadius: 3,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   statCardSecondary: {
//     flex: 1,
//     backgroundColor: '#2A241E',
//     borderRadius: 20,
//     padding: 18,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   statCardSecondaryTitle: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   statCardSecondarySubtitle: {
//     fontSize: 12,
//     color: '#64748B',
//     fontWeight: '500',
//     marginBottom: 16,
//   },
//   statCardSecondaryNumber: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   bookedNumber: {
//     color: '#D9A46C',
//   },
//   availableNumber: {
//     color: '#34D399',
//   },
//   // Room Type Filter Styles
//   roomTypeContainer: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#1E3A5F',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   roomTypeButtonsContainer: {
//     flexDirection: 'row',
//     paddingVertical: 4,
//   },
//   roomTypeButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#F1F5F9',
//     marginRight: 10,
//     minHeight: 38,
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   roomTypeButtonActive: {
//     backgroundColor: '#D9A46C',
//     borderColor: '#D9A46C',
//   },
//   roomTypeButtonText: {
//     fontSize: 13,
//     color: '#64748B',
//     fontWeight: '600',
//   },
//   roomTypeButtonTextActive: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//   },
//   legendContainer: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#1E3A5F',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   legendTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#2A241E',
//     marginBottom: 14,
//   },
//   legendItems: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 20,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   legendDot: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   legendDotBooking: {
//     backgroundColor: '#002f79ff',
//   },
//   legendDotReservation: {
//     backgroundColor: '#F59E0B',
//   },
//   legendDotOutOfService: {
//     backgroundColor: '#EF4444',
//   },
//   legendText: {
//     fontSize: 14,
//     color: '#475569',
//     fontWeight: '500',
//   },
//   // Calendar Styles
//   calendarCard: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 16,
//     marginBottom: 24,
//     borderRadius: 20,
//     shadowColor: '#1E3A5F',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.1,
//     shadowRadius: 16,
//     elevation: 6,
//     overflow: 'hidden',
//     paddingBottom: 10,
//   },
//   calendar: {
//     borderRadius: 20,
//   },
//   // Custom Day Styles
//   dayWrapper: { 
//     width: 45, 
//     height: 45, 
//     alignItems: 'center', 
//     justifyContent: 'center' 
//   },
//   dayContainer: { 
//     width: 38, 
//     height: 38, 
//     borderRadius: 19, 
//     alignItems: 'center', 
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   todayContainer: { 
//     borderWidth: 1.5, 
//     borderColor: '#002f79ff' // Blue for today
//   },
//   hasEventsContainer: {
//     // Additional styles for days with events
//   },
//   dayText: { 
//     fontSize: 15, 
//     color: '#374151',
//     fontWeight: '500',
//   },
//   disabledDayText: {
//     color: '#D1D5DB',
//   },
//   todayText: {
//     color: '#002f79ff', // Blue for today
//     fontWeight: '700',
//   },
//   selectedDayText: {
//     color: '#FFFFFF',
//     fontWeight: '700',
//   },
//   // Badge Styles
//   eventBadge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     backgroundColor: '#002f79ff', // Blue badge
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   eventBadgeHigh: {
//     backgroundColor: '#EF4444',
//   },
//   eventBadgeMedium: {
//     backgroundColor: '#F59E0B',
//   },
//   eventBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 8,
//     fontWeight: 'bold',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(15, 23, 42, 0.6)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     maxHeight: '85%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8F0',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1E293B',
//   },
//   modalCloseButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   modalCloseText: {
//     fontSize: 18,
//     color: '#64748B',
//     fontWeight: '600',
//   },
//   modalContent: {
//     padding: 24,
//     maxHeight: 400,
//   },
//   modalFooter: {
//     padding: 20,
//     paddingBottom: 34,
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//   },
//   modalButton: {
//     backgroundColor: '#BCA382',
//     paddingVertical: 16,
//     borderRadius: 14,
//     alignItems: 'center',
//     shadowColor: '#BCA382',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   modalButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   periodCard: {
//     padding: 18,
//     backgroundColor: '#F8FAFC',
//     borderRadius: 14,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   periodCardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   periodFacilityName: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#1E293B',
//     flex: 1,
//   },
//   periodBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   periodBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//     letterSpacing: 0.3,
//   },
//   periodDetail: {
//     fontSize: 14,
//     color: '#64748B',
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   paymentStatusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//   },
//   paymentBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   paymentBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//     letterSpacing: 0.3,
//   },
// });

// export default calender;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../auth/contexts/AuthContext';
import { calendarAPI } from '../../config/apis';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Date Utilities
const dateUtils = {
  format: (date, formatStr) => {
    if (!date) return '';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (formatStr === 'MMM d') {
      return `${months[d.getMonth()]} ${d.getDate()}`;
    } else if (formatStr === 'EEE') {
      return days[d.getDay()];
    } else if (formatStr === 'MMM d, yyyy') {
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } else if (formatStr === 'MMMM d, yyyy') {
      return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } else if (formatStr === 'EEEE, MMMM d, yyyy') {
      return `${fullDays[d.getDay()]}, ${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } else if (formatStr === 'yyyy-MM-dd') {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (formatStr === 'MMMM yyyy') {
      return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`;
    } else if (formatStr === 'MM/yyyy') {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${month}/${d.getFullYear()}`;
    } else if (formatStr === 'dd') {
      return d.getDate().toString();
    }
    return d.toString();
  },

  parseISO: (dateString) => {
    if (!dateString) return new Date();
    if (dateString.includes('T')) {
      return new Date(dateString);
    }
    return new Date(dateString + 'T00:00:00');
  },

  isSameDay: (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  },

  startOfMonth: (date) => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  endOfMonth: (date) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  isSameMonth: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth();
  },

  startOfDay: (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  differenceInDays: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },
};

const calender = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFacilityType, setSelectedFacilityType] = useState('ROOMS');
  const [selectedRoomType, setSelectedRoomType] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // New filter states
  const [searchByMonth, setSearchByMonth] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [searchByRoomMonth, setSearchByRoomMonth] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');

  // Data states
  const [rooms, setRooms] = useState([]);
  const [halls, setHalls] = useState([]);
  const [lawns, setLawns] = useState([]);
  const [photoshoots, setPhotoshoots] = useState([]);

  // Modal states
  const [availableModalVisible, setAvailableModalVisible] = useState(false);
  const [bookedModalVisible, setBookedModalVisible] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookedRooms, setBookedRooms] = useState([]);

  const { user } = useAuth();

  // Build API params based on filters
  const getApiParams = useCallback(() => {
    const params = {};

    if (searchByMonth && selectedMonth) {
      const startOfMonth = dateUtils.startOfMonth(selectedMonth);
      const endOfMonth = dateUtils.endOfMonth(selectedMonth);
      params.startDate = dateUtils.format(startOfMonth, 'yyyy-MM-dd');
      params.endDate = dateUtils.format(endOfMonth, 'yyyy-MM-dd');
    }

    if (searchByRoomMonth && selectedRoomNumber) {
      params.roomNumber = selectedRoomNumber;
    }

    return params;
  }, [searchByMonth, selectedMonth, searchByRoomMonth, selectedRoomNumber]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = getApiParams();

      console.log('Fetching data with params:', params);

      // Fetch data based on selected facility type
      switch (selectedFacilityType) {
        case 'ROOMS':
          const roomsData = await calendarAPI.getCalendarRooms(params);
          console.log('Rooms data fetched:', roomsData?.length || 0, 'rooms');
          setRooms(roomsData || []);
          break;

        case 'HALLS':
          const hallsData = await calendarAPI.getHalls(params);
          console.log('Halls data fetched:', hallsData?.length || 0, 'halls');
          setHalls(hallsData || []);
          break;

        case 'LAWNS':
          const lawnsData = await calendarAPI.getLawns(params);
          console.log('Lawns data fetched:', lawnsData?.length || 0, 'lawns');
          setLawns(lawnsData || []);
          break;

        case 'PHOTOSHOOTS':
          const photoshootsData = await calendarAPI.getPhotoshoots(params);
          console.log('Photoshoots data fetched:', photoshootsData?.length || 0, 'photoshoots');
          setPhotoshoots(photoshootsData || []);
          break;

        default:
          break;
      }

    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError(error.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedFacilityType, getApiParams]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Get current facility data
  const getCurrentFacilities = () => {
    switch (selectedFacilityType) {
      case 'ROOMS':
        return rooms;
      case 'HALLS':
        return halls;
      case 'LAWNS':
        return lawns;
      case 'PHOTOSHOOTS':
        return photoshoots;
      default:
        return [];
    }
  };

  // Filter rooms based on selection
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const typeMatch = selectedRoomType === 'ALL' || room.roomType?.type === selectedRoomType;
      const roomMatch = !selectedRoom || room.id?.toString() === selectedRoom;
      return typeMatch && roomMatch;
    });
  }, [rooms, selectedRoomType, selectedRoom]);

  // Get facilities to display
  const getFacilitiesForDisplay = useMemo(() => {
    if (selectedFacilityType === 'ROOMS') {
      return filteredRooms;
    }
    return getCurrentFacilities();
  }, [selectedFacilityType, filteredRooms]);

  // Function to check if a room is booked for today
  const isRoomBookedToday = useCallback((room) => {
    const today = dateUtils.startOfDay(new Date());
    const todayString = dateUtils.format(today, 'yyyy-MM-dd');

    console.log(`Checking room ${room.roomNumber || room.roomNo || room.id} for today: ${todayString}`);

    // Check bookings
    if (room.bookings && Array.isArray(room.bookings)) {
      console.log(`Room ${room.roomNumber || room.roomNo} has ${room.bookings.length} bookings`);
      for (const booking of room.bookings) {
        // Skip cancelled bookings
        if (booking.paymentStatus === 'CANCELLED' || booking.status === 'CANCELLED') {
          console.log(`Skipping cancelled booking for room ${room.roomNumber || room.roomNo}`);
          continue;
        }

        try {
          const checkIn = booking.checkIn ? dateUtils.parseISO(booking.checkIn) : null;
          const checkOut = booking.checkOut ? dateUtils.parseISO(booking.checkOut) : null;

          if (checkIn && checkOut) {
            const startDate = dateUtils.startOfDay(checkIn);
            const endDate = dateUtils.startOfDay(checkOut);

            if (today >= startDate && today <= endDate) {
              console.log(`Room ${room.roomNumber || room.roomNo} is booked from ${dateUtils.format(startDate, 'yyyy-MM-dd')} to ${dateUtils.format(endDate, 'yyyy-MM-dd')}`);
              return true;
            }
          } else if (checkIn) {
            const checkInDate = dateUtils.startOfDay(checkIn);
            if (dateUtils.isSameDay(today, checkInDate)) {
              console.log(`Room ${room.roomNumber || room.roomNo} is booked for check-in on ${dateUtils.format(checkInDate, 'yyyy-MM-dd')}`);
              return true;
            }
          }
        } catch (err) {
          console.error('Error processing booking:', err);
        }
      }
    }

    // Check reservations
    if (room.reservations && Array.isArray(room.reservations)) {
      console.log(`Room ${room.roomNumber || room.roomNo} has ${room.reservations.length} reservations`);
      for (const reservation of room.reservations) {
        try {
          const reservedFrom = reservation.reservedFrom ? dateUtils.parseISO(reservation.reservedFrom) : null;
          const reservedTo = reservation.reservedTo ? dateUtils.parseISO(reservation.reservedTo) : null;

          if (reservedFrom && reservedTo) {
            const startDate = dateUtils.startOfDay(reservedFrom);
            const endDate = dateUtils.startOfDay(reservedTo);

            if (today >= startDate && today <= endDate) {
              console.log(`Room ${room.roomNumber || room.roomNo} is reserved from ${dateUtils.format(startDate, 'yyyy-MM-dd')} to ${dateUtils.format(endDate, 'yyyy-MM-dd')}`);
              return true;
            }
          }
        } catch (err) {
          console.error('Error processing reservation:', err);
        }
      }
    }

    // Check out of order
    if (room.outOfOrders && Array.isArray(room.outOfOrders)) {
      console.log(`Room ${room.roomNumber || room.roomNo} has ${room.outOfOrders.length} out of orders`);
      for (const outOfOrder of room.outOfOrders) {
        try {
          const startDate = outOfOrder.startDate ? dateUtils.parseISO(outOfOrder.startDate) : null;
          const endDate = outOfOrder.endDate ? dateUtils.parseISO(outOfOrder.endDate) : null;

          if (startDate && endDate) {
            const start = dateUtils.startOfDay(startDate);
            const end = dateUtils.startOfDay(endDate);

            if (today >= start && today <= end) {
              console.log(`Room ${room.roomNumber || room.roomNo} is out of order from ${dateUtils.format(start, 'yyyy-MM-dd')} to ${dateUtils.format(end, 'yyyy-MM-dd')}`);
              return true;
            }
          }
        } catch (err) {
          console.error('Error processing outOfOrder:', err);
        }
      }
    }

    console.log(`Room ${room.roomNumber || room.roomNo} is available`);
    return false;
  }, []);

  // Function to show available rooms modal
  const showAvailableRoomsModal = useCallback(() => {
    console.log('Total rooms:', rooms.length);
    console.log('Checking available rooms for today...');

    const available = rooms.filter(room => {
      const isBooked = isRoomBookedToday(room);
      return !isBooked;
    });

    console.log('Available rooms found:', available.length);
    console.log('Available rooms details:', available.map(r => ({
      roomNumber: r.roomNumber || r.roomNo,
      id: r.id,
      type: r.roomType?.type
    })));

    setAvailableRooms(available);
    setAvailableModalVisible(true);
  }, [rooms, isRoomBookedToday]);

  // Function to show booked rooms modal
  const showBookedRoomsModal = useCallback(() => {
    console.log('Total rooms:', rooms.length);
    console.log('Checking booked rooms for today...');

    const booked = rooms.filter(room => {
      const isBooked = isRoomBookedToday(room);
      return isBooked;
    });

    console.log('Booked rooms found:', booked.length);
    console.log('Booked rooms details:', booked.map(r => ({
      roomNumber: r.roomNumber || r.roomNo,
      id: r.id,
      type: r.roomType?.type
    })));

    setBookedRooms(booked);
    setBookedModalVisible(true);
  }, [rooms, isRoomBookedToday]);

  // Generate marked dates for calendar view
  const markedDates = useMemo(() => {
    const facilities = getFacilitiesForDisplay;
    const marks = {};

    if (!facilities || facilities.length === 0) return marks;

    facilities.forEach(facility => {
      // Process bookings
      if (facility.bookings && Array.isArray(facility.bookings)) {
        facility.bookings.forEach(booking => {
          if (!booking) return;

          try {
            const startDate = dateUtils.parseISO(
              booking.checkIn || booking.bookingDate || booking.date ||
              booking.shootDate || booking.eventDate || booking.startDate || booking.createdAt
            );

            // For rooms with checkIn/checkOut
            if (booking.checkIn && booking.checkOut) {
              const endDate = dateUtils.parseISO(booking.checkOut);

              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                  const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
                  if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
                  marks[dateString].count += 1;
                  currentDate.setDate(currentDate.getDate() + 1);
                }
              }
            } else {
              // For single day events
              if (!isNaN(startDate.getTime())) {
                const dateString = dateUtils.format(startDate, 'yyyy-MM-dd');
                if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
                marks[dateString].count += 1;
              }
            }
          } catch (err) {
            console.error('Error processing booking:', err);
          }
        });
      }

      // Process reservations
      if (facility.reservations && Array.isArray(facility.reservations)) {
        facility.reservations.forEach(reservation => {
          if (!reservation) return;

          try {
            const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
            const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              let currentDate = new Date(startDate);
              while (currentDate <= endDate) {
                const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
                if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
                marks[dateString].count += 1;
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          } catch (err) {
            console.error('Error processing reservation:', err);
          }
        });
      }

      // Process out of order periods
      if (facility.outOfOrders && Array.isArray(facility.outOfOrders)) {
        facility.outOfOrders.forEach(outOfOrder => {
          if (!outOfOrder) return;

          try {
            const startDate = dateUtils.parseISO(outOfOrder.startDate);
            const endDate = dateUtils.parseISO(outOfOrder.endDate);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              let currentDate = new Date(startDate);
              while (currentDate <= endDate) {
                const dateString = dateUtils.format(currentDate, 'yyyy-MM-dd');
                if (!marks[dateString]) marks[dateString] = { periods: [], count: 0 };
                marks[dateString].count += 1;
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          } catch (err) {
            console.error('Error processing outOfOrder:', err);
          }
        });
      }
    });

    // Add custom styles to marked dates (blue theme)
    Object.keys(marks).forEach(date => {
      const count = marks[date].count;
      marks[date].selected = count > 0;
      marks[date].selectedColor = '#002f79ff'; // Blue color for bookings
      marks[date].selectedTextColor = '#FFFFFF';
      marks[date].dots = [
        {
          key: 'booking',
          color: '#002f79ff',
          selectedDotColor: '#FFFFFF'
        }
      ];
    });

    return marks;
  }, [getFacilitiesForDisplay]);

  // Get events for a specific date
  const getEventsForDate = useCallback((dateString) => {
    const facilities = getFacilitiesForDisplay;
    const selectedDate = dateUtils.parseISO(dateString);
    const periodsOnDate = [];

    if (!facilities || facilities.length === 0) return periodsOnDate;

    facilities.forEach(facility => {
      // Check bookings
      if (facility.bookings && Array.isArray(facility.bookings)) {
        facility.bookings.forEach(booking => {
          try {
            const startDate = dateUtils.parseISO(
              booking.checkIn || booking.bookingDate || booking.date ||
              booking.shootDate || booking.eventDate || booking.startDate || booking.createdAt
            );

            if (booking.checkIn && booking.checkOut) {
              const endDate = dateUtils.parseISO(booking.checkOut);
              if (selectedDate >= startDate && selectedDate <= endDate) {
                periodsOnDate.push({
                  facility,
                  type: 'booking',
                  data: booking,
                  isCancelled: booking.paymentStatus === 'CANCELLED' || booking.status === 'CANCELLED',
                  isConfirmed: booking.status === 'CONFIRMED' || booking.paymentStatus === 'PAID',
                });
              }
            } else if (dateUtils.isSameDay(selectedDate, startDate)) {
              periodsOnDate.push({
                facility,
                type: 'booking',
                data: booking,
                isCancelled: booking.paymentStatus === 'CANCELLED' || booking.status === 'CANCELLED',
                isConfirmed: booking.status === 'CONFIRMED' || booking.paymentStatus === 'PAID',
              });
            }
          } catch (err) {
            console.error('Error processing booking for date:', err);
          }
        });
      }

      // Check reservations
      if (facility.reservations && Array.isArray(facility.reservations)) {
        facility.reservations.forEach(reservation => {
          try {
            const startDate = dateUtils.parseISO(reservation.reservedFrom || reservation.startDate);
            const endDate = dateUtils.parseISO(reservation.reservedTo || reservation.endDate);

            if (selectedDate >= startDate && selectedDate <= endDate) {
              periodsOnDate.push({
                facility,
                type: 'reservation',
                data: reservation,
              });
            }
          } catch (err) {
            console.error('Error processing reservation for date:', err);
          }
        });
      }

      // Check out of order periods
      if (facility.outOfOrders && Array.isArray(facility.outOfOrders)) {
        facility.outOfOrders.forEach(outOfOrder => {
          try {
            const startDate = dateUtils.parseISO(outOfOrder.startDate);
            const endDate = dateUtils.parseISO(outOfOrder.endDate);

            if (selectedDate >= startDate && selectedDate <= endDate) {
              periodsOnDate.push({
                facility,
                type: 'outOfOrder',
                data: outOfOrder,
              });
            }
          } catch (err) {
            console.error('Error processing outOfOrder for date:', err);
          }
        });
      }
    });

    return periodsOnDate;
  }, [getFacilitiesForDisplay]);

  // Custom Day Component
  const DayComponent = ({ date, state, marking }) => {
    const isToday = dateUtils.isSameDay(new Date(), date.dateString);
    const count = marking?.count || 0;
    const hasEvents = count > 0;

    return (
      <TouchableOpacity
        style={styles.dayWrapper}
        onPress={() => {
          const events = getEventsForDate(date.dateString);
          if (events.length > 0) {
            setSelectedPeriod({
              date: dateUtils.parseISO(date.dateString),
              periods: events,
            });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={[
          styles.dayContainer,
          isToday && styles.todayContainer,
          hasEvents && styles.hasEventsContainer,
          marking?.selected && { backgroundColor: '#002f79ff' } // Blue for selected days
        ]}>
          <Text style={[
            styles.dayText,
            state === 'disabled' && styles.disabledDayText,
            isToday && styles.todayText,
            marking?.selected && styles.selectedDayText
          ]}>
            {date.day}
          </Text>

          {count > 0 && (
            <View style={[
              styles.eventBadge,
              count > 3 && styles.eventBadgeHigh,
              count > 1 && count <= 3 && styles.eventBadgeMedium
            ]}>
              <Text style={styles.eventBadgeText}>
                {count > 9 ? '9+' : count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Get facility type display name
  const getFacilityTypeName = (type) => {
    const names = {
      'ROOMS': 'Rooms',
      'HALLS': 'Halls',
      'LAWNS': 'Lawns',
      'PHOTOSHOOTS': 'Photoshoots',
    };
    return names[type] || 'Rooms';
  };

  // Get facility name
  const getFacilityName = (facility) => {
    if (!facility) return 'Unknown Facility';

    if (selectedFacilityType === 'ROOMS') {
      return `Room ${facility.roomNumber || facility.roomNo || facility.roomName || facility.id || 'N/A'}`;
    }
    return facility.name || facility.title || `Facility ${facility.id || 'N/A'}`;
  };

  // Calculate statistics
  const calculateStatistics = useMemo(() => {
    const facilities = getFacilitiesForDisplay;
    const total = facilities.length;

    // Calculate based on current day booking status
    let booked = 0;
    let available = 0;
    let outOfService = 0;

    facilities.forEach(facility => {
      if (selectedFacilityType === 'ROOMS') {
        const isBooked = isRoomBookedToday(facility);
        if (isBooked) {
          booked++;
        } else {
          available++;
        }
      } else {
        // For other facilities, use existing logic
        if (facility.isBooked || facility.status === 'BOOKED') {
          booked++;
        } else if (facility.isOutOfOrder || facility.status === 'MAINTENANCE') {
          outOfService++;
        } else {
          available++;
        }
      }
    });

    return {
      total,
      booked,
      available,
      outOfService,
      occupancyRate: total > 0 ? Math.round((booked / total) * 100) : 0,
      availabilityRate: total > 0 ? Math.round((available / total) * 100) : 0,
    };
  }, [getFacilitiesForDisplay, selectedFacilityType, isRoomBookedToday]);

  // Get unique room types
  const roomTypes = useMemo(() => {
    const types = [...new Set(rooms.map(room => room.roomType?.type).filter(Boolean))];
    return types;
  }, [rooms]);

  // Get unique room numbers for search filter
  const roomNumbers = useMemo(() => {
    const numbers = [...new Set(rooms.map(room => room.roomNumber || room.roomNo).filter(Boolean))];
    return numbers.sort((a, b) => a - b);
  }, [rooms]);

  // Handle month picker change
  const onMonthChange = (event, selectedDate) => {
    setShowMonthPicker(false);
    if (selectedDate) {
      setSelectedMonth(selectedDate);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchByMonth(false);
    setSearchByRoomMonth(false);
    setSelectedRoomNumber('');
    setSelectedMonth(new Date());
    setSelectedRoomType('ALL');
    setSelectedRoom(null);
  };

  const renderRoomItem = ({ item, index }) => {
    console.log('Rendering room item:', item.roomNumber || item.roomNo, 'Type:', item.roomType?.type);
    console.log('Item data:', JSON.stringify(item, null, 2));

    return (
      <View style={styles.roomItemContainer}>
        <View style={styles.roomItemHeader}>
          <Text style={styles.roomNumber}>
            Room {item.roomNumber || item.roomNo || 'N/A'}
          </Text>
          <Text style={styles.roomType}>
            {item.roomType?.type || 'Standard'}
          </Text>
        </View>
        <View style={styles.roomDetails}>
          {/* <Text style={styles.roomDetailText}>
          ID: {item.id || 'N/A'} • Floor: {item.floor || 'N/A'}
        </Text>
        <Text style={styles.roomDetailText}>
          Capacity: {item.capacity || 'N/A'}
        </Text> */}
          <Text style={styles.roomDetailText}>
            Status: {item.isBooked ? 'BOOKED' : item.isReserved ? 'RESERVED' : 'AVAILABLE'}
          </Text>
          {item.rate && (
            <Text style={styles.roomRate}>
              Rate: PKR {parseInt(item.rate).toLocaleString()}/night
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D9A46C" />
        <Text style={styles.loadingText}>Loading calendar data...</Text>
      </View>
    );
  }

  const stats = calculateStatistics;
  const facilities = getFacilitiesForDisplay;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F0EC" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D9A46C']}
            tintColor="#D9A46C"
          />
        }
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {error.includes('404') ? 'Endpoint not found. Please check API configuration.' : error}
            </Text>
          </View>
        )}

        {/* Search Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>Search Filters</Text>

          {/* Search by Month */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterToggle,
                searchByMonth && styles.filterToggleActive
              ]}
              onPress={() => {
                setSearchByMonth(!searchByMonth);
                if (!searchByMonth) {
                  setSearchByRoomMonth(false);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterToggleText,
                searchByMonth && styles.filterToggleTextActive
              ]}>
                Search by Month
              </Text>
            </TouchableOpacity>

            {searchByMonth && (
              <TouchableOpacity
                style={styles.monthPickerButton}
                onPress={() => setShowMonthPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthPickerButtonText}>
                  {dateUtils.format(selectedMonth, 'MMMM yyyy')}
                </Text>
                <Text style={styles.monthPickerButtonIcon}>▼</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search by Room + Month */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterToggle,
                searchByRoomMonth && styles.filterToggleActive
              ]}
              onPress={() => {
                setSearchByRoomMonth(!searchByRoomMonth);
                if (!searchByRoomMonth) {
                  setSearchByMonth(false);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterToggleText,
                searchByRoomMonth && styles.filterToggleTextActive
              ]}>
                Search by Room + Month
              </Text>
            </TouchableOpacity>

            {searchByRoomMonth && (
              <View style={styles.roomMonthContainer}>
                <TextInput
                  style={styles.roomNumberInput}
                  placeholder="Enter room number"
                  value={selectedRoomNumber}
                  onChangeText={setSelectedRoomNumber}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.monthPickerButton}
                  onPress={() => setShowMonthPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.monthPickerButtonText}>
                    {dateUtils.format(selectedMonth, 'MM/yyyy')}
                  </Text>
                  <Text style={styles.monthPickerButtonIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Reset Filters */}
          {(searchByMonth || searchByRoomMonth || selectedRoomNumber || selectedRoomType !== 'ALL') && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Month Picker Modal */}
        {showMonthPicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showMonthPicker}
            onRequestClose={() => setShowMonthPicker(false)}
          >
            <View style={styles.monthPickerOverlay}>
              <View style={styles.monthPickerContainer}>
                <View style={styles.monthPickerHeader}>
                  <Text style={styles.monthPickerTitle}>Select Month</Text>
                  <TouchableOpacity
                    style={styles.monthPickerCloseButton}
                    onPress={() => setShowMonthPicker(false)}
                  >
                    <Text style={styles.monthPickerCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedMonth}
                  mode="date"
                  display="spinner"
                  onChange={onMonthChange}
                  style={styles.dateTimePicker}
                />
                <View style={styles.monthPickerFooter}>
                  <TouchableOpacity
                    style={styles.monthPickerDoneButton}
                    onPress={() => setShowMonthPicker(false)}
                  >
                    <Text style={styles.monthPickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Facility Type Filter */}
        <View style={styles.facilityTypeContainer}>
          <Text style={styles.sectionTitle}>Select Facility Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.facilityTypeButtonsContainer}
          >
            {['ROOMS', 'HALLS', 'LAWNS', 'PHOTOSHOOTS'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.facilityTypeButton,
                  selectedFacilityType === type && styles.facilityTypeButtonActive,
                ]}
                onPress={() => {
                  setSelectedFacilityType(type);
                  setSelectedRoomType('ALL');
                  setSelectedRoom(null);
                  setSelectedRoomNumber('');
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.facilityTypeButtonText,
                    selectedFacilityType === type && styles.facilityTypeButtonTextActive,
                  ]}
                >
                  {getFacilityTypeName(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Room-specific filters */}
        {selectedFacilityType === 'ROOMS' && roomTypes.length > 0 && (
          <View style={styles.roomTypeContainer}>
            <Text style={styles.sectionTitle}>Filter by Room Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomTypeButtonsContainer}
            >
              <TouchableOpacity
                style={[
                  styles.roomTypeButton,
                  selectedRoomType === 'ALL' && styles.roomTypeButtonActive,
                ]}
                onPress={() => setSelectedRoomType('ALL')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.roomTypeButtonText,
                    selectedRoomType === 'ALL' && styles.roomTypeButtonTextActive,
                  ]}
                >
                  All Types
                </Text>
              </TouchableOpacity>
              {roomTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.roomTypeButton,
                    selectedRoomType === type && styles.roomTypeButtonActive,
                  ]}
                  onPress={() => setSelectedRoomType(type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.roomTypeButtonText,
                      selectedRoomType === type && styles.roomTypeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Statistics with Available and Booked Buttons */}
        <View style={styles.statsWrapper}>
          {/* Top Card - Total */}
          <View style={styles.statCardPrimary}>
            <View style={styles.statCardPrimaryHeader}>
              <Text style={styles.statCardPrimaryTitle}>Total {getFacilityTypeName(selectedFacilityType)}</Text>
              <View style={styles.statCardBadge}>
                <Text style={styles.statCardBadgeText}>
                  {stats.occupancyRate}%
                </Text>
              </View>
            </View>
            <View style={styles.statCardPrimaryContent}>
              <Text style={styles.statCardPrimaryNumber}>{stats.total}</Text>
              <Text style={styles.statCardPrimarySubtitle}>{getFacilityTypeName(selectedFacilityType).toLowerCase()}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${stats.occupancyRate}%` }]} />
            </View>
          </View>

          {/* Middle Row - Booked & Available */}
          <View style={styles.statsRow}>
            {/* Booked Card */}
            <TouchableOpacity
              style={styles.statCardSecondary}
              onPress={showBookedRoomsModal}
              activeOpacity={0.7}
            >
              <Text style={styles.statCardSecondaryTitle}>Booked</Text>
              <Text style={styles.statCardSecondarySubtitle}>Rooms occupied</Text>
              <Text style={[styles.statCardSecondaryNumber, styles.bookedNumber]}>
                {stats.booked}
              </Text>
            </TouchableOpacity>

            {/* Available Card */}
            <TouchableOpacity
              style={styles.statCardSecondary}
              onPress={showAvailableRoomsModal}
              activeOpacity={0.7}
            >
              <Text style={styles.statCardSecondaryTitle}>Available</Text>
              <Text style={styles.statCardSecondarySubtitle}>Ready to book</Text>
              <Text style={[styles.statCardSecondaryNumber, styles.availableNumber]}>
                {stats.available}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Booking Status</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotBooking]} />
              <Text style={styles.legendText}>Bookings</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotReservation]} />
              <Text style={styles.legendText}>Reservations</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotOutOfService]} />
              <Text style={styles.legendText}>Out of Service</Text>
            </View>
          </View>
        </View>

        {/* Calendar View */}
        <View style={styles.calendarCard}>
          <Calendar
            current={dateUtils.format(new Date(), 'yyyy-MM-dd')}
            dayComponent={DayComponent}
            markedDates={markedDates}
            theme={{
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: '#002f79ff', // Blue color
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#002f79ff', // Blue color for today
              dayTextColor: '#374151',
              textDisabledColor: '#D1D5DB',
              arrowColor: '#002f79ff', // Blue arrows
              monthTextColor: '#111827',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>
      </ScrollView>

      {/* Available Rooms Modal */}
      <Modal
        visible={availableModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAvailableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Rooms</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAvailableModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Rooms available for booking today ({dateUtils.format(new Date(), 'MMMM d, yyyy')})
            </Text>

            {console.log('Available rooms for modal:', availableRooms.length, 'rooms')}

            {/* Wrap FlatList in a View with flex: 1 */}
            <View style={styles.modalContentArea}>
              <FlatList
                data={availableRooms}
                renderItem={renderRoomItem}
                keyExtractor={(item, index) => `available-${item.id || index}`}
                style={styles.roomsList}
                contentContainerStyle={[
                  styles.roomsListContent,
                  availableRooms.length === 0 && styles.emptyListContent
                ]}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListTitle}>No Available Rooms</Text>
                    <Text style={styles.emptyListText}>
                      All rooms are currently booked or out of service
                    </Text>
                  </View>
                }
                ListHeaderComponent={() => (
                  <Text style={styles.listHeader}>
                    Showing {availableRooms.length} available rooms
                  </Text>
                )}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setAvailableModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Do the same for Booked Rooms Modal */}
      <Modal
        visible={bookedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booked Rooms</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setBookedModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Rooms booked for today ({dateUtils.format(new Date(), 'MMMM d, yyyy')})
            </Text>

            {console.log('Booked rooms for modal:', bookedRooms.length, 'rooms')}

            <View style={styles.modalContentArea}>
              <FlatList
                data={bookedRooms}
                renderItem={renderRoomItem}
                keyExtractor={(item, index) => `booked-${item.id || index}`}
                style={styles.roomsList}
                contentContainerStyle={[
                  styles.roomsListContent,
                  bookedRooms.length === 0 && styles.emptyListContent
                ]}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListTitle}>No Booked Rooms</Text>
                    <Text style={styles.emptyListText}>
                      All rooms are currently available
                    </Text>
                  </View>
                }
                ListHeaderComponent={() => (
                  <Text style={styles.listHeader}>
                    Showing {bookedRooms.length} booked rooms
                  </Text>
                )}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setBookedModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Period Details Modal */}
      <Modal
        visible={!!selectedPeriod}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPeriod(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPeriod?.date
                  ? dateUtils.format(selectedPeriod.date, 'MMMM d, yyyy')
                  : 'Booking Details'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedPeriod(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedPeriod?.periods ? (
                selectedPeriod.periods.map((period, index) => (
                  <View key={index} style={styles.periodCard}>
                    <View style={styles.periodCardHeader}>
                      <Text style={styles.periodFacilityName}>
                        {getFacilityName(period.facility)}
                      </Text>
                      <View
                        style={[
                          styles.periodBadge,
                          {
                            backgroundColor:
                              period.type === 'booking'
                                ? period.isCancelled
                                  ? '#FEE2E2'
                                  : period.isConfirmed
                                    ? '#F2F0EC'
                                    : '#F2F0EC'
                                : period.type === 'reservation'
                                  ? '#FEF3C7'
                                  : '#FEE2E2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodBadgeText,
                            {
                              color:
                                period.type === 'booking'
                                  ? period.isCancelled
                                    ? '#991B1B'
                                    : period.isConfirmed
                                      ? '#92400E'
                                      : '#002f79ff' // Blue for booking
                                  : period.type === 'reservation'
                                    ? '#92400E'
                                    : '#991B1B',
                            },
                          ]}
                        >
                          {period.isCancelled ? 'CANCELLED' :
                            period.isConfirmed ? 'CONFIRMED' :
                              period.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {period.type === 'booking' && (
                      <>
                        {period.data.memberName && (
                          <Text style={styles.periodDetail}>
                            Guest: {period.data.memberName}
                          </Text>
                        )}
                        {period.data.guestName && (
                          <Text style={styles.periodDetail}>
                            Guest: {period.data.guestName}
                          </Text>
                        )}
                        {(period.data.checkIn || period.data.bookingDate) && (
                          <Text style={styles.periodDetail}>
                            Date: {dateUtils.format(
                              dateUtils.parseISO(period.data.checkIn || period.data.bookingDate),
                              'MMM d, yyyy'
                            )}
                            {period.data.checkOut && ` to ${dateUtils.format(
                              dateUtils.parseISO(period.data.checkOut),
                              'MMM d, yyyy'
                            )}`}
                          </Text>
                        )}
                        {period.data.totalPrice && (
                          <Text style={styles.periodDetail}>
                            Amount: PKR {parseInt(period.data.totalPrice).toLocaleString()}
                          </Text>
                        )}
                        {period.data.paymentStatus && (
                          <View style={styles.paymentStatusContainer}>
                            <Text style={styles.periodDetail}>Payment: </Text>
                            <View
                              style={[
                                styles.paymentBadge,
                                {
                                  backgroundColor:
                                    period.data.paymentStatus === 'PAID'
                                      ? '#D1FAE5'
                                      : period.data.paymentStatus === 'UNPAID'
                                        ? '#FEE2E2'
                                        : '#FEF3C7',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.paymentBadgeText,
                                  {
                                    color:
                                      period.data.paymentStatus === 'PAID'
                                        ? '#065F46'
                                        : period.data.paymentStatus === 'UNPAID'
                                          ? '#991B1B'
                                          : '#92400E',
                                  },
                                ]}
                              >
                                {period.data.paymentStatus}
                              </Text>
                            </View>
                          </View>
                        )}
                      </>
                    )}

                    {period.type === 'reservation' && (
                      <>
                        <Text style={styles.periodDetail}>
                          Reserved by: {period.data.admin?.name || 'Admin'}
                        </Text>
                        <Text style={styles.periodDetail}>
                          Period: {dateUtils.format(
                            dateUtils.parseISO(period.data.reservedFrom || period.data.startDate),
                            'MMM d, yyyy'
                          )} - {dateUtils.format(
                            dateUtils.parseISO(period.data.reservedTo || period.data.endDate),
                            'MMM d, yyyy'
                          )}
                        </Text>
                      </>
                    )}

                    {period.type === 'outOfOrder' && (
                      <>
                        <Text style={styles.periodDetail}>
                          Reason: {period.data.reason || 'Maintenance'}
                        </Text>
                        <Text style={styles.periodDetail}>
                          Period: {dateUtils.format(
                            dateUtils.parseISO(period.data.startDate),
                            'MMM d, yyyy'
                          )} - {dateUtils.format(
                            dateUtils.parseISO(period.data.endDate),
                            'MMM d, yyyy'
                          )}
                        </Text>
                      </>
                    )}
                  </View>
                ))
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setSelectedPeriod(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0EC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F0EC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F0EC',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 12,
  },
  backIcon: {
    fontSize: 28,
    color: '#D9A46C',
    fontWeight: '300',
    marginRight: 2,
  },
  backText: {
    fontSize: 16,
    color: '#D9A46C',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 60,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 20,
    color: '#D9A46C',
    fontWeight: '600',
  },
  // Error Banner
  errorBanner: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerText: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Filters Container
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A241E',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterToggleActive: {
    backgroundColor: '#D9A46C',
    borderColor: '#D9A46C',
  },
  filterToggleText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  filterToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  monthPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  monthPickerButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  monthPickerButtonIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  roomMonthContainer: {
    marginTop: 8,
  },
  roomNumberInput: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Month Picker Modal
  monthPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  monthPickerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthPickerCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateTimePicker: {
    height: 200,
  },
  monthPickerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  monthPickerDoneButton: {
    backgroundColor: '#D9A46C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  monthPickerDoneText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Facility Type Filter Styles
  facilityTypeContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  facilityTypeButtonsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  facilityTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  facilityTypeButtonActive: {
    backgroundColor: '#BCA382',
    borderColor: '#BCA382',
  },
  facilityTypeButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  facilityTypeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Stats Styles
  statsWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCardPrimary: {
    backgroundColor: '#2A241E',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  statCardPrimaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardPrimaryTitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statCardBadge: {
    backgroundColor: '#3D352D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9A46C',
  },
  statCardBadgeText: {
    fontSize: 14,
    color: '#D9A46C',
    fontWeight: '700',
  },
  statCardPrimaryContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  statCardPrimaryNumber: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  statCardPrimarySubtitle: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D9A46C',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardSecondary: {
    flex: 1,
    backgroundColor: '#2A241E',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statCardSecondaryTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  statCardSecondarySubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 16,
  },
  statCardSecondaryNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bookedNumber: {
    color: '#D9A46C',
  },
  availableNumber: {
    color: '#34D399',
  },
  // Room Type Filter Styles
  roomTypeContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  roomTypeButtonsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  roomTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomTypeButtonActive: {
    backgroundColor: '#D9A46C',
    borderColor: '#D9A46C',
  },
  roomTypeButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  roomTypeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A241E',
    marginBottom: 14,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  legendDotBooking: {
    backgroundColor: '#002f79ff',
  },
  legendDotReservation: {
    backgroundColor: '#F59E0B',
  },
  legendDotOutOfService: {
    backgroundColor: '#EF4444',
  },
  legendText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  // Calendar Styles
  calendarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  calendar: {
    borderRadius: 20,
  },
  // Custom Day Styles
  dayWrapper: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dayContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayContainer: {
    borderWidth: 1.5,
    borderColor: '#002f79ff' // Blue for today
  },
  hasEventsContainer: {
    // Additional styles for days with events
  },
  dayText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  disabledDayText: {
    color: '#D1D5DB',
  },
  todayText: {
    color: '#002f79ff', // Blue for today
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Badge Styles
  eventBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#002f79ff', // Blue badge
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBadgeHigh: {
    backgroundColor: '#EF4444',
  },
  eventBadgeMedium: {
    backgroundColor: '#F59E0B',
  },
  eventBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalContent: {
    padding: 24,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    backgroundColor: '#BCA382',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#BCA382',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Room List Styles
  roomsList: {
    flex: 1,
    width: '100%',
  },
  roomsListContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  roomItemContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  roomType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#BCA382',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomDetails: {
    marginTop: 4,
  },
  roomDetailText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  roomRate: {
    fontSize: 14,
    color: '#2A241E',
    fontWeight: '600',
    marginTop: 6,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyListText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  periodCard: {
    padding: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  periodFacilityName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  periodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  periodDetail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listHeader: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Make room items more visible
  roomItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  roomItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  roomNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },

  roomType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#BCA382',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  roomDetails: {
    marginTop: 4,
  },

  roomDetailText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 20,
  },

  roomRate: {
    fontSize: 15,
    color: '#2A241E',
    fontWeight: '600',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // Make modal container taller
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '90%', // Changed from maxHeight to height
    maxHeight: '90%',
  },

  // Add this to ensure modal content area takes space
  modalContentArea: {
    flex: 1,
  },
});

export default calender;