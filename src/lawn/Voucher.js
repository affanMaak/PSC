// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StatusBar,
//   Share,
//   RefreshControl
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { bookingService } from '../../services/bookingService';
// import { useAuth } from '../auth/contexts/AuthContext';

// export default function Voucher({ navigation, route }) {
//   const { user } = useAuth();
//   const { 
//     invoiceData: initialInvoiceData, 
//     bookingType = 'LAWN', 
//     venue, 
//     bookingDetails 
//   } = route.params || {};

//   const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [shareLoading, setShareLoading] = useState(false);

//   useEffect(() => {
//     if (invoiceData) {
//       console.log('✅ Invoice data loaded:', invoiceData);
//     } else {
//       Alert.alert('Error', 'No invoice data provided');
//       navigation.goBack();
//     }
//   }, [invoiceData]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     // You can add logic to refresh invoice data if needed
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   const handleMakePayment = () => {
//     Alert.alert(
//       'Complete Payment',
//       `Redirect to payment gateway to complete your ${bookingType.toLowerCase()} booking?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Proceed to Payment', 
//           onPress: () => {
//             // Here you would integrate with your payment gateway
//             // For now, simulate payment completion
//             Alert.alert(
//               'Payment Successful',
//               'Your booking has been confirmed!',
//               [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
//             );
//           }
//         }
//       ]
//     );
//   };

//   const handleShareInvoice = async () => {
//     try {
//       setShareLoading(true);

//       if (!invoiceData) {
//         Alert.alert('Error', 'No invoice data to share');
//         return;
//       }

//       const bookingSummary = invoiceData.Data?.BookingSummary || {};
//       const timeSlotMap = {
//         MORNING: 'Morning (8:00 AM - 2:00 PM)',
//         EVENING: 'Evening (2:00 PM - 8:00 PM)',
//         NIGHT: 'Night (8:00 PM - 12:00 AM)',
//       };

//       const shareMessage = `
// ${bookingType === 'LAWN' ? '🏞️ LAWN BOOKING INVOICE' : '🏨 BOOKING INVOICE'}

// 📋 Invoice Number: ${invoiceData.Data?.InvoiceNumber || 'N/A'}
// 💳 Amount: Rs. ${invoiceData.Data?.Amount || '0'}/-
// 📅 Due Date: ${formatDateTime(invoiceData.Data?.DueDate)}

// ${bookingType === 'LAWN' ? '🏞️ Lawn Information:' : '🏠 Room Information:'}
//    • ${bookingType === 'LAWN' ? 'Lawn Name' : 'Room Type'}: ${bookingSummary.LawnName || venue?.description || 'N/A'}
//    ${bookingSummary.Category ? `   • Category: ${bookingSummary.Category}` : ''}
//    ${bookingSummary.Capacity ? `   • Capacity: ${bookingSummary.Capacity}` : ''}
//    ${bookingSummary.BookingDate ? `   • Booking Date: ${formatDate(bookingSummary.BookingDate)}` : ''}
//    ${bookingSummary.TimeSlot ? `   • Time Slot: ${timeSlotMap[bookingSummary.TimeSlot] || bookingSummary.TimeSlot}` : ''}
//    ${bookingSummary.NumberOfGuests ? `   • Guests: ${bookingSummary.NumberOfGuests}` : ''}
//    ${bookingSummary.PricingType ? `   • Pricing Type: ${bookingSummary.PricingType}` : ''}

// 💳 Payment Details:
//    • Total Amount: Rs. ${bookingSummary.TotalAmount || invoiceData.Data?.Amount || '0'}/-
//    • Payment Status: PENDING
//    • Payment Required: YES

// ${invoiceData.Data?.Instructions ? `💡 Instructions: ${invoiceData.Data.Instructions}\n` : ''}
// 📝 Important Information:
//    • Complete payment within 3 minutes to confirm your booking
//    ${bookingType === 'LAWN' ? '   • Time slots are strictly followed' : '   • Check-in: 2:00 PM | Check-out: 12:00 PM'}
//    • Present payment confirmation at reception

// Thank you for your booking!
//       `.trim();

//       await Share.share({
//         message: shareMessage,
//         title: `Invoice - ${invoiceData.Data?.InvoiceNumber || 'Booking'}`
//       });
//     } catch (error) {
//       console.error('Error sharing invoice:', error);
//       Alert.alert('Error', 'Failed to share invoice');
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const getStatusBadge = () => {
//     return { text: 'PAYMENT PENDING', style: styles.statusPending, icon: 'payment' };
//   };

//   const statusInfo = getStatusBadge();

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="#2E7D32" />
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={24} color="#000" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>
//             {bookingType === 'LAWN' ? 'Lawn Booking Invoice' : 'Booking Invoice'}
//           </Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#2E7D32" />
//           <Text style={styles.loadingText}>Loading your invoice...</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#2E7D32" />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           {bookingType === 'LAWN' ? 'Lawn Booking Invoice' : 'Booking Invoice'}
//         </Text>
//         <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
//           <Icon name="refresh" size={24} color={refreshing ? '#ccc' : '#000'} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         style={styles.content} 
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             colors={['#2E7D32']}
//           />
//         }
//       >
//         {invoiceData ? (
//           <View style={styles.invoiceContainer}>
//             {/* Invoice Header */}
//             <View style={styles.invoiceHeader}>
//               <Icon 
//                 name={statusInfo.icon} 
//                 size={40} 
//                 color="#2E7D32" 
//               />
//               <Text style={styles.invoiceTitle}>
//                 {bookingType === 'LAWN' ? 'LAWN BOOKING INVOICE' : 'BOOKING INVOICE'}
//               </Text>
//               <Text style={styles.invoiceSubtitle}>
//                 Complete payment to confirm your reservation
//               </Text>
//             </View>

//             {/* Payment Required Alert */}
//             <View style={styles.paymentAlert}>
//               <Icon name="payment" size={20} color="#856404" />
//               <View style={styles.paymentAlertContent}>
//                 <Text style={styles.paymentAlertTitle}>Payment Required</Text>
//                 <Text style={styles.paymentAlertText}>
//                   Complete payment within 3 minutes to confirm your booking
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.paymentButton}
//                   onPress={handleMakePayment}
//                 >
//                   <Text style={styles.paymentButtonText}>Make Payment Now</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Invoice Details */}
//             <View style={styles.invoiceSection}>
//               <Text style={styles.sectionTitle}>Invoice Details</Text>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Invoice Number:</Text>
//                 <Text style={styles.detailValue}>
//                   {invoiceData.Data?.InvoiceNumber || 'N/A'}
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Status:</Text>
//                 <View style={[styles.statusBadge, statusInfo.style]}>
//                   <Text style={styles.statusText}>{statusInfo.text}</Text>
//                 </View>
//               </View>

//               {invoiceData.Data?.DueDate && (
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Payment Due:</Text>
//                   <Text style={[styles.detailValue, styles.dueDate]}>
//                     {formatDateTime(invoiceData.Data.DueDate)}
//                   </Text>
//                 </View>
//               )}

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Issued At:</Text>
//                 <Text style={styles.detailValue}>
//                   {formatDateTime(new Date())}
//                 </Text>
//               </View>
//             </View>

//             {/* Booking Information */}
//             <View style={styles.invoiceSection}>
//               <Text style={styles.sectionTitle}>
//                 {bookingType === 'LAWN' ? 'Lawn Information' : 'Booking Information'}
//               </Text>

//               {invoiceData.Data?.BookingSummary && (
//                 <>
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>
//                       {bookingType === 'LAWN' ? 'Lawn Name:' : 'Venue:'}
//                     </Text>
//                     <Text style={styles.detailValue}>
//                       {invoiceData.Data.BookingSummary.LawnName}
//                     </Text>
//                   </View>

//                   {invoiceData.Data.BookingSummary.Category && (
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Category:</Text>
//                       <Text style={styles.detailValue}>
//                         {invoiceData.Data.BookingSummary.Category}
//                       </Text>
//                     </View>
//                   )}

//                   {invoiceData.Data.BookingSummary.BookingDate && (
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Booking Date:</Text>
//                       <Text style={styles.detailValue}>
//                         {formatDate(invoiceData.Data.BookingSummary.BookingDate)}
//                       </Text>
//                     </View>
//                   )}

//                   {invoiceData.Data.BookingSummary.TimeSlot && (
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Time Slot:</Text>
//                       <Text style={styles.detailValue}>
//                         {invoiceData.Data.BookingSummary.TimeSlot}
//                       </Text>
//                     </View>
//                   )}

//                   {invoiceData.Data.BookingSummary.NumberOfGuests && (
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Number of Guests:</Text>
//                       <Text style={styles.detailValue}>
//                         {invoiceData.Data.BookingSummary.NumberOfGuests}
//                       </Text>
//                     </View>
//                   )}
//                 </>
//               )}
//             </View>

//             {/* Payment Information */}
//             <View style={styles.invoiceSection}>
//               <Text style={styles.sectionTitle}>Payment Details</Text>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Total Amount:</Text>
//                 <Text style={[styles.detailValue, styles.amount]}>
//                   Rs. {invoiceData.Data?.Amount || '0'}/-
//                 </Text>
//               </View>

//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Payment Status:</Text>
//                 <View style={[styles.statusBadge, styles.pendingBadge]}>
//                   <Text style={styles.statusText}>PENDING</Text>
//                 </View>
//               </View>
//             </View>

//             {/* Payment Instructions */}
//             {invoiceData.Data?.Instructions && (
//               <View style={styles.instructionsSection}>
//                 <Text style={styles.instructionsTitle}>Payment Instructions</Text>
//                 <Text style={styles.instructionsText}>{invoiceData.Data.Instructions}</Text>
//               </View>
//             )}

//             {/* Payment Channels */}
//             {invoiceData.Data?.PaymentChannels && (
//               <View style={styles.paymentChannelsSection}>
//                 <Text style={styles.paymentChannelsTitle}>Available Payment Methods</Text>
//                 <View style={styles.paymentChannelsList}>
//                   {invoiceData.Data.PaymentChannels.map((channel, index) => (
//                     <View key={index} style={styles.paymentChannelItem}>
//                       <Icon name="payment" size={16} color="#2e7d32" />
//                       <Text style={styles.paymentChannelText}>{channel}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             )}

//             {/* General Instructions */}
//             <View style={styles.instructions}>
//               <Text style={styles.instructionsTitle}>Important Information</Text>
//               {bookingType === 'LAWN' ? (
//                 <>
//                   <View style={styles.instructionItem}>
//                     <Icon name="access-time" size={16} color="#2e7d32" />
//                     <Text style={styles.instructionText}>
//                       Time slots are strictly followed: Morning, Evening, Night
//                     </Text>
//                   </View>
//                   <View style={styles.instructionItem}>
//                     <Icon name="warning" size={16} color="#2e7d32" />
//                     <Text style={styles.instructionText}>
//                       Complete payment within 3 minutes to avoid cancellation
//                     </Text>
//                   </View>
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.instructionItem}>
//                     <Icon name="access-time" size={16} color="#2e7d32" />
//                     <Text style={styles.instructionText}>Check-in: 2:00 PM | Check-out: 12:00 PM</Text>
//                   </View>
//                   <View style={styles.instructionItem}>
//                     <Icon name="credit-card" size={16} color="#2e7d32" />
//                     <Text style={styles.instructionText}>Government ID required at check-in</Text>
//                   </View>
//                 </>
//               )}
//             </View>

//             {/* Action Buttons */}
//             <View style={styles.actionButtons}>
//               <TouchableOpacity 
//                 style={styles.secondaryButton}
//                 onPress={handleRefresh}
//                 disabled={refreshing}
//               >
//                 <Icon name="refresh" size={20} color="#2E7D32" />
//                 <Text style={styles.secondaryButtonText}>
//                   {refreshing ? 'Refreshing...' : 'Refresh Invoice'}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={styles.shareButton}
//                 onPress={handleShareInvoice}
//                 disabled={shareLoading}
//               >
//                 <Icon name="share" size={20} color="#fff" />
//                 <Text style={styles.shareButtonText}>
//                   {shareLoading ? 'Sharing...' : 'Share Invoice'}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Make Payment Button */}
//             <TouchableOpacity 
//               style={styles.paymentActionButton}
//               onPress={handleMakePayment}
//             >
//               <Icon name="payment" size={20} color="#fff" />
//               <Text style={styles.paymentActionButtonText}>Complete Payment Now</Text>
//             </TouchableOpacity>

//             <View style={styles.actionButtons}>
//               <TouchableOpacity 
//                 style={styles.primaryButton}
//                 onPress={() => navigation.navigate('Home')}
//               >
//                 <Icon name="home" size={20} color="#fff" />
//                 <Text style={styles.primaryButtonText}>Back to Home</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.noInvoiceContainer}>
//             <Icon name="receipt" size={60} color="#ccc" />
//             <Text style={styles.noInvoiceTitle}>Invoice Not Available</Text>
//             <Text style={styles.noInvoiceText}>
//               Unable to load invoice at this time.
//             </Text>
//             <TouchableOpacity 
//               style={styles.retryButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Text style={styles.retryButtonText}>Go Back</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f9f3eb' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#2E7D32',
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     paddingTop: 40,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFF',
//   },
//   content: { flex: 1 },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 16,
//   },
//   invoiceContainer: {
//     padding: 15,
//   },
//   invoiceHeader: {
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 15,
//     marginBottom: 20,
//   },
//   invoiceTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   invoiceSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//   },
//   paymentAlert: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#fff3cd',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffc107',
//   },
//   paymentAlertContent: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   paymentAlertTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#856404',
//     marginBottom: 5,
//   },
//   paymentAlertText: {
//     fontSize: 14,
//     color: '#856404',
//     lineHeight: 18,
//     marginBottom: 10,
//   },
//   paymentButton: {
//     backgroundColor: '#2E7D32',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//   },
//   paymentButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   invoiceSection: {
//     backgroundColor: '#fff',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 8,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//     flex: 1,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '600',
//     flex: 1,
//     textAlign: 'right',
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//   },
//   dueDate: {
//     color: '#dc3545',
//     fontWeight: 'bold',
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusPending: {
//     backgroundColor: '#fff3cd',
//   },
//   pendingBadge: {
//     backgroundColor: '#fff3cd',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#856404',
//   },
//   instructionsSection: {
//     backgroundColor: '#e7f3ff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#0d6efd',
//   },
//   instructionsTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#0d6efd',
//     marginBottom: 8,
//   },
//   instructionsText: {
//     fontSize: 14,
//     color: '#0d6efd',
//     lineHeight: 20,
//   },
//   paymentChannelsSection: {
//     backgroundColor: '#f0f7ff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   paymentChannelsTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#1565c0',
//     marginBottom: 10,
//   },
//   paymentChannelsList: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   paymentChannelItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   paymentChannelText: {
//     fontSize: 12,
//     color: '#1565c0',
//     marginLeft: 6,
//   },
//   instructions: {
//     backgroundColor: '#f0f7ff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   instructionsTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#1565c0',
//     marginBottom: 10,
//   },
//   instructionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   instructionText: {
//     fontSize: 12,
//     color: '#1565c0',
//     marginLeft: 8,
//     flex: 1,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 15,
//   },
//   secondaryButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#2E7D32',
//     backgroundColor: 'transparent',
//     gap: 8,
//   },
//   secondaryButtonText: {
//     color: '#2E7D32',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   shareButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: '#2196f3',
//     gap: 8,
//   },
//   shareButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   paymentActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#2E7D32',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15,
//     gap: 8,
//   },
//   paymentActionButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   primaryButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: '#2E7D32',
//     gap: 8,
//   },
//   primaryButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   noInvoiceContainer: {
//     alignItems: 'center',
//     padding: 40,
//     marginTop: 50,
//   },
//   noInvoiceTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#666',
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   noInvoiceText: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 5,
//   },
//   retryButton: {
//     backgroundColor: '#2E7D32',
//     paddingHorizontal: 25,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });



import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Share,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { paymentAPI } from '../../config/apis';

const Voucher = ({ route, navigation }) => {
  const {
    invoiceData,
    invoiceNumber,
    bookingType = 'LAWN',
    venue,
    bookingDetails,
    bookingId,
    isGuest,
    memberDetails,
    guestDetails,
    invoicePayload,
    error
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);

  useEffect(() => {
    console.log('🧾 Voucher received data:', {
      invoiceData: invoiceData,
      invoiceNumber: invoiceNumber,
      bookingId: bookingId,
      bookingDetails: bookingDetails,
      error: error
    });

    // Extract invoice details
    if (invoiceData) {
      const details = {
        invoiceNumber: invoiceData.InvoiceNumber || invoiceData.Data?.InvoiceNumber || invoiceNumber,
        amount: invoiceData.Amount || invoiceData.Data?.Amount || bookingDetails?.totalAmount,
        bookingSummary: invoiceData.BookingSummary || invoiceData.Data?.BookingSummary || bookingDetails?.bookingSummary,
        dueDate: invoiceData.DueDate || invoiceData.Data?.DueDate,
      };
      setInvoiceDetails(details);
      console.log('📋 Invoice details extracted:', details);
    }
  }, [invoiceData, invoiceNumber, bookingId]);

  const handleShareInvoice = async () => {
    try {
      const bookingSummary = invoiceDetails?.bookingSummary || bookingDetails || {};
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };

      const message = `
🏞️ LAWN BOOKING INVOICE

Invoice Number: ${invoiceDetails?.invoiceNumber || 'N/A'}
Amount: Rs. ${invoiceDetails?.amount || '0'}/-
Due Date: ${invoiceDetails?.dueDate ? new Date(invoiceDetails.dueDate).toLocaleDateString() : 'N/A'}

📋 Booking Details:
• Lawn Name: ${bookingSummary.LawnName || venue?.description || bookingDetails?.lawnName || 'N/A'}
• Booking Date: ${formatDate(bookingSummary.BookingDate || bookingDetails?.bookingDate)}
• Time Slot: ${timeSlotMap[bookingSummary.TimeSlot || bookingDetails?.eventTime] || 'N/A'}
• Number of Guests: ${bookingSummary.NumberOfGuests || bookingDetails?.numberOfGuests || 'N/A'}
• Event Type: ${bookingSummary.EventType || bookingDetails?.eventType || 'N/A'}
• Pricing Type: ${bookingSummary.PricingType || bookingDetails?.pricingType || 'N/A'}

${isGuest ? `
👤 Guest Information:
• Name: ${guestDetails?.guestName}
• Phone: ${guestDetails?.guestContact}
` : `
👤 Member Information:
• Name: ${memberDetails?.memberName}
• Membership No: ${memberDetails?.membershipNo}
`}

💳 Payment Details:
• Total Amount: Rs. ${invoiceDetails?.amount || '0'}/-
• Payment Status: ${paymentStatus === 'paid' ? 'PAID' : 'PENDING PAYMENT'}
• Booking ID: ${bookingId || 'N/A'}

📞 Contact Club Office for payment details.

Thank you for choosing our lawn services!
      `.trim();

      await Share.share({
        message,
        title: `Lawn Booking Invoice - ${invoiceDetails?.invoiceNumber || 'Booking'}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share invoice');
    }
  };

  const handleMakePayment = () => {
    setShowPaymentMethods(true);
  };

  const handlePaymentMethodSelect = (method) => {
    let paymentInstructions = '';
    let contactNumber = '';

    switch (method) {
      case 'bank':
        paymentInstructions = `
🏦 Bank Transfer Instructions:

Bank Name: ABC Bank
Account Name: PSC Lawn Booking
Account Number: 1234567890
Branch Code: 1234
Reference: ${invoiceDetails?.invoiceNumber || 'INVOICE'}
Booking ID: ${bookingId || 'N/A'}

Please include the invoice number as reference.
        `;
        contactNumber = '091-1234567';
        break;

      case 'cash':
        paymentInstructions = `
💵 Cash Payment Instructions:

Please visit the club office to make cash payment.
Office Hours: 9:00 AM - 6:00 PM
Location: Club Main Building, Ground Floor
Bring this invoice with you.
Invoice Number: ${invoiceDetails?.invoiceNumber}
        `;
        contactNumber = '091-1234567';
        break;

      case 'card':
        paymentInstructions = `
💳 Card Payment Instructions:

Visit the club office for card payment.
We accept Visa, MasterCard, and UnionPay.
A 2% processing fee applies for credit cards.
Please mention Invoice: ${invoiceDetails?.invoiceNumber}
        `;
        contactNumber = '091-1234567';
        break;
    }

    Alert.alert(
      `${getPaymentMethodName(method)} Payment`,
      paymentInstructions,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Office',
          onPress: () => Linking.openURL(`tel:${contactNumber}`),
        },
        {
          text: 'I Have Paid',
          onPress: () => promptForTransactionId(method),
        },
      ]
    );
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'bank': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      default: return method;
    }
  };

  const promptForTransactionId = (method) => {
    Alert.prompt(
      'Payment Confirmation',
      `Please enter your ${getPaymentMethodName(method)} transaction ID or receipt number:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: (transactionId) => verifyPayment(transactionId, method),
        },
      ],
      'plain-text'
    );
  };

  const verifyPayment = async (transactionId, method) => {
    if (!transactionId || transactionId.trim() === '') {
      Alert.alert('Error', 'Please enter a valid transaction ID');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Verifying payment for:', {
        invoiceNumber: invoiceDetails?.invoiceNumber,
        bookingId: bookingId,
        transactionId: transactionId,
        method: method
      });

      // Call your payment verification API
      // const result = await paymentAPI.verifyPayment(...);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoading(false);

      // Simulate successful payment
      setPaymentStatus('paid');
      Alert.alert(
        'Payment Verified!',
        `Your payment has been successfully verified.\n\nInvoice: ${invoiceDetails?.invoiceNumber}\nTransaction: ${transactionId}\n\nYour lawn booking is now confirmed.`,
        [
          {
            text: 'View Booking',
            onPress: () => navigation.navigate('MyBookings'),
          },
          {
            text: 'Print Invoice',
            onPress: () => {
              // Handle print functionality
              Alert.alert('Print', 'Invoice print functionality would go here.');
            },
          },
        ]
      );

    } catch (error) {
      setLoading(false);
      console.error('❌ Payment verification error:', error);
      Alert.alert(
        'Payment Verification',
        'We are verifying your payment. Please check your bookings list in a few minutes.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyBookings'),
          },
        ]
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return '';
    const slotMap = {
      'MORNING': 'Morning (8:00 AM - 2:00 PM)',
      'EVENING': 'Evening (2:00 PM - 8:00 PM)',
      'NIGHT': 'Night (8:00 PM - 12:00 AM)'
    };
    return slotMap[timeSlot] || timeSlot;
  };

  if (!invoiceData && !invoiceNumber) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrowleft" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <Icon name="exclamationcircleo" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>No Invoice Data</Text>
          <Text style={styles.errorText}>
            Invoice data was not received. Please go back and try again.
          </Text>
          {error && (
            <Text style={styles.errorDetail}>
              Error: {error}
            </Text>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawn Booking Invoice</Text>
        <TouchableOpacity onPress={handleShareInvoice} disabled={loading}>
          <Icon name="sharealt" size={24} color={loading ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View>
      {/* Customer Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          {isGuest ? 'Guest Information' : 'Member Information'}
        </Text>

        {isGuest ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>
                {guestDetails?.guestName || 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact:</Text>
              <Text style={styles.detailValue}>
                {guestDetails?.guestContact || 'N/A'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>
                {memberDetails?.memberName || 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Membership No:</Text>
              <Text style={styles.detailValue}>
                {memberDetails?.membershipNo || 'N/A'}
              </Text>
            </View>
          </>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>LAWN BOOKING INVOICE</Text>
          <Text style={styles.invoiceNumber}>
            #{invoiceDetails?.invoiceNumber || 'N/A'}
          </Text>
          <Text style={styles.invoiceStatus}>
            Status: <Text style={paymentStatus === 'paid' ? styles.statusPaid : styles.statusPending}>
              {paymentStatus === 'paid' ? 'PAID' : 'PENDING PAYMENT'}
            </Text>
          </Text>
          {bookingId && (
            <Text style={styles.bookingId}>
              Booking ID: {bookingId}
            </Text>
          )}
        </View>

        {/* Error Alert if booking creation failed */}
        {error && (
          <View style={styles.errorAlertCard}>
            <Icon name="warning" size={20} color="#fff" />
            <Text style={styles.errorAlertText}>
              Booking creation failed. Please contact support with Invoice #{invoiceDetails?.invoiceNumber}
            </Text>
          </View>
        )}



        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>
            Rs. {(invoiceDetails?.amount || 0).toLocaleString()}/-
          </Text>
        </View>
        {/* Payment Required Alert */}
        {paymentStatus !== 'paid' && (
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Icon name="clockcircle" size={20} color="#856404" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Payment Required</Text>
              <Text style={styles.alertText}>
                Complete payment to confirm your booking
              </Text>
              {invoiceDetails?.dueDate && (
                <Text style={styles.dueDate}>
                  Due by: {formatDate(invoiceDetails.dueDate)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Lawn Booking Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lawn Booking Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Lawn Name:</Text>
            <Text style={styles.detailValue}>
              {venue?.description || bookingDetails?.lawnName || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking Date:</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingDetails?.bookingDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Slot:</Text>
            <Text style={styles.detailValue}>
              {formatTimeSlot(bookingDetails?.eventTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event Type:</Text>
            <Text style={styles.detailValue}>
              {bookingDetails?.eventType || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number of Guests:</Text>
            <Text style={styles.detailValue}>
              {bookingDetails?.numberOfGuests || 0} people
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rate Type:</Text>
            <Text style={styles.detailValue}>
              {isGuest ? 'Guest Rate' : 'Member Rate'}
            </Text>
          </View>

          {bookingDetails?.specialRequest && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Special Requests:</Text>
              <Text style={styles.detailValue}>
                {bookingDetails.specialRequest}
              </Text>
            </View>
          )}

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              Rs. {(invoiceDetails?.amount || 0).toLocaleString()}/-
            </Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invoice Number:</Text>
            <Text style={[styles.detailValue, styles.invoiceHighlight]}>
              {invoiceDetails?.invoiceNumber || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Generated On:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          {bookingId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking Reference:</Text>
              <Text style={styles.detailValue}>
                {bookingId}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <Text style={[
              styles.detailValue,
              paymentStatus === 'paid' ? styles.statusPaid : styles.statusPending
            ]}>
              {paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
            </Text>
          </View>
        </View>

        {/* Important Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Important Instructions</Text>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E7D32" />
            <Text style={styles.instructionTextItem}>
              Complete payment to confirm your booking
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E7D32" />
            <Text style={styles.instructionTextItem}>
              Time slots are strictly followed: Morning, Evening, Night
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E7D32" />
            <Text style={styles.instructionTextItem}>
              Bring this invoice and payment confirmation when you visit
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E7D32" />
            <Text style={styles.instructionTextItem}>
              Maximum capacity: {venue?.maxGuests || bookingDetails?.numberOfGuests || 'As per booking'} guests
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E7D32" />
            <Text style={styles.instructionTextItem}>
              Food and decoration arrangements to be made separately
            </Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            1. Booking confirmation is subject to full payment.
            2. Cancellation 48 hours before event: 50% refund.
            3. Cancellation 24 hours before event: No refund.
            4. Damage to lawn property will be charged separately.
            5. Club rules must be followed at all times.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Assistance?</Text>
          <View style={styles.contactItem}>
            <Feather name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>Lawn Office: 091-1234567</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="mail" size={14} color="#666" />
            <Text style={styles.contactText}>Email: lawn@pscclub.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="clock" size={14} color="#666" />
            <Text style={styles.contactText}>Office Hours: 9:00 AM - 8:00 PM</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.contactText}>Location: Club Lawn Area</Text>
          </View>
        </View>

        {/* Debug Info (only in development)
        {__DEV__ && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Debug Information</Text>
            <Text style={styles.debugText}>
              Invoice Number: {invoiceDetails?.invoiceNumber}
            </Text>
            <Text style={styles.debugText}>
              Booking ID: {bookingId || 'Not created'}
            </Text>
            <Text style={styles.debugText}>
              Status: {error ? 'Error: ' + error : 'Success'}
            </Text>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => console.log('Full invoice data:', invoiceData)}
            >
              <Text style={styles.debugButtonText}>Log Full Data</Text>
            </TouchableOpacity>
          </View>
        )} */}
      </ScrollView>

      {/* Action Buttons */}
      {paymentStatus !== 'paid' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleMakePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="credit-card" size={20} color="#fff" />
                <Text style={styles.paymentButtonText}>
                  Make Payment
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MyBookings')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>View My Bookings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  invoiceHeader: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  invoiceStatus: {
    fontSize: 14,
    color: '#666',
  },
  bookingId: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  statusPending: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  statusPaid: {
    color: '#2E8B57',
    fontWeight: 'bold',
  },
  errorAlertCard: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorAlertText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  dueDate: {
    fontSize: 12,
    color: '#856404',
    marginTop: 5,
    fontStyle: 'italic',
  },
  amountCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionCard: {
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: '40%',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'right',
    width: '60%',
    flexWrap: 'wrap',
  },
  invoiceHighlight: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  instructionsCard: {
    backgroundColor: '#e7f3ff',
    borderWidth: 1,
    borderColor: '#b3d7ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 10,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionTextItem: {
    fontSize: 14,
    color: '#0d6efd',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  termsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  debugCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paymentButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default Voucher;