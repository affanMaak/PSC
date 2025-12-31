// // InvoiceScreen.js
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Share,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
// import { photoshootAPI, paymentAPI } from '../../config/apis';


// const InvoiceScreen = ({ route, navigation }) => {
//   const { invoiceData, bookingData, photoshoot } = route.params;
//   const [loading, setLoading] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState('pending');

//   const handleShareInvoice = async () => {
//     try {
//       const message = `
// 📸 Photoshoot Booking Invoice

// Invoice Number: ${invoiceData.InvoiceNumber}
// Amount: ₹${invoiceData.Amount}
// Due Date: ${new Date(invoiceData.DueDate).toLocaleDateString()}

// 📋 Booking Details:
// • Package: ${photoshoot.description}
// • Date: ${new Date(bookingData.bookingDate).toLocaleDateString()}
// • Time: ${bookingData.timeSlot.split('T')[1].slice(0, 5)}
// • Duration: 2 hours
// • Type: ${bookingData.pricingType === 'member' ? 'Member' : 'Guest'}
// • Total: ₹${invoiceData.Amount}

// 💳 Payment Channels:
// ${invoiceData.PaymentChannels.map(channel => `• ${channel}`).join('\n')}

// 📝 Instructions:
// ${invoiceData.Instructions}

// Thank you for choosing our service!
//       `.trim();

//       await Share.share({
//         message,
//         title: `Invoice - ${invoiceData.InvoiceNumber}`,
//       });
//     } catch (error) {
//       console.error('Error sharing:', error);
//       Alert.alert('Error', 'Failed to share invoice');
//     }
//   };

//   const handleMakePayment = () => {
//     Alert.alert(
//       'Payment Instructions',
//       `Complete your payment using any of these methods:\n\n${invoiceData.PaymentChannels.join('\n')}\n\nAfter payment, save your transaction ID and click "I Have Paid".\n\nAmount: ₹${invoiceData.Amount}\nInvoice: ${invoiceData.InvoiceNumber}`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'I Have Paid',
//           onPress: () => promptForTransactionId(),
//         },
//       ]
//     );
//   };

//   const promptForTransactionId = () => {
//     Alert.prompt(
//       'Transaction ID',
//       'Please enter your payment transaction ID:',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Submit',
//           onPress: (transactionId) => verifyPayment(transactionId),
//         },
//       ],
//       'plain-text'
//     );
//   };

//   const verifyPayment = async (transactionId) => {
//     setLoading(true);
//     try {
//       // Verify payment with transaction ID
//       const verification = await paymentAPI.verifyPayment(
//         invoiceData.InvoiceNumber,
//         transactionId
//       );

//       if (verification.data.success) {
//         // Complete the booking
//         const bookingPayload = {
//           consumerInfo: {
//             membership_no: bookingData.membership_no,
//           },
//           bookingData: {
//             photoshootId: bookingData.photoshootId,
//             bookingDate: bookingData.bookingDate,
//             startTime: bookingData.timeSlot,
//             pricingType: bookingData.pricingType,
//             specialRequest: bookingData.specialRequest || '',
//             totalPrice: bookingData.totalPrice,
//           }
//         };

//         const bookingResponse = await photoshootAPI.completePhotoshootBooking(bookingPayload);

//         if (bookingResponse.data.success) {
//           setPaymentStatus('paid');
//           Alert.alert(
//             'Payment Verified!',
//             'Your booking has been confirmed successfully.',
//             [
//               {
//                 text: 'View Booking',
//                 onPress: () => navigation.navigate('BookingConfirmation', {
//                   bookingDetails: bookingResponse.data.booking,
//                   photoshoot: photoshoot,
//                 }),
//               },
//             ]
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Payment verification error:', error);
//       Alert.alert(
//         'Payment Verification',
//         'We are verifying your payment. Please check your bookings list in a few minutes.',
//         [
//           {
//             text: 'OK',
//             onPress: () => navigation.navigate('Home'),
//           },
//         ]
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     const timePart = timeString.includes('T') 
//       ? timeString.split('T')[1].slice(0, 5)
//       : timeString.slice(0, 5);
//     return timePart;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrowleft" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Booking Invoice</Text>
//         <TouchableOpacity onPress={handleShareInvoice} disabled={loading}>
//           <Icon name="sharealt" size={24} color={loading ? '#ccc' : '#000'} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.content}>
//         {/* Invoice Header */}
//         <View style={styles.invoiceHeader}>
//           <Text style={styles.invoiceTitle}>PHOTOSHOOT BOOKING INVOICE</Text>
//           <Text style={styles.invoiceNumber}>#{invoiceData.InvoiceNumber}</Text>
//           <Text style={styles.invoiceStatus}>
//             Status: <Text style={styles.statusPending}>PENDING PAYMENT</Text>
//           </Text>
//         </View>

//         {/* Payment Required Alert */}
//         <View style={styles.alertCard}>
//           <View style={styles.alertIcon}>
//             <Icon name="clockcircle" size={20} color="#856404" />
//           </View>
//           <View style={styles.alertContent}>
//             <Text style={styles.alertTitle}>Payment Required</Text>
//             <Text style={styles.alertText}>
//               Complete payment within 3 minutes to confirm your booking
//             </Text>
//             <Text style={styles.dueDate}>
//               Due by: {formatDate(invoiceData.DueDate)}
//             </Text>
//           </View>
//         </View>

//         {/* Amount Card */}
//         <View style={styles.amountCard}>
//           <Text style={styles.amountLabel}>Total Amount Due</Text>
//           <Text style={styles.amountValue}>₹{invoiceData.Amount}</Text>
//         </View>

//         {/* Booking Summary */}
//         <View style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Booking Summary</Text>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Package:</Text>
//             <Text style={styles.detailValue}>
//               {invoiceData.BookingSummary?.ServiceName || photoshoot.description}
//             </Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Date:</Text>
//             <Text style={styles.detailValue}>
//               {formatDate(bookingData.bookingDate)}
//             </Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Time:</Text>
//             <Text style={styles.detailValue}>
//               {formatTime(bookingData.timeSlot)} (2 hours duration)
//             </Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Booking Type:</Text>
//             <Text style={styles.detailValue}>
//               {bookingData.pricingType === 'member' ? 'Member Booking' : 'Guest Booking'}
//             </Text>
//           </View>

//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>Base Price:</Text>
//             <Text style={styles.detailValue}>
//               ₹{invoiceData.BookingSummary?.BasePrice || bookingData.totalPrice}
//             </Text>
//           </View>

//           <View style={[styles.detailRow, styles.totalRow]}>
//             <Text style={styles.totalLabel}>Total Amount:</Text>
//             <Text style={styles.totalValue}>₹{invoiceData.Amount}</Text>
//           </View>
//         </View>

//         {/* Payment Channels */}
//         <View style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Available Payment Methods</Text>
//           <View style={styles.channelsGrid}>
//             {invoiceData.PaymentChannels.map((channel, index) => (
//               <View key={index} style={styles.channelItem}>
//                 <Icon name="creditcard" size={16} color="#2E8B57" />
//                 <Text style={styles.channelText}>{channel}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Instructions */}
//         <View style={styles.instructionsCard}>
//           <Text style={styles.instructionsTitle}>Important Instructions</Text>
//           <Text style={styles.instructionsText}>
//             {invoiceData.Instructions}
//           </Text>
//           <View style={styles.instructionItem}>
//             <Icon name="checkcircle" size={14} color="#2E8B57" />
//             <Text style={styles.instructionTextItem}>
//               Save this invoice for reference
//             </Text>
//           </View>
//           <View style={styles.instructionItem}>
//             <Icon name="checkcircle" size={14} color="#2E8B57" />
//             <Text style={styles.instructionTextItem}>
//               Present payment confirmation at reception
//             </Text>
//           </View>
//           <View style={styles.instructionItem}>
//             <Icon name="checkcircle" size={14} color="#2E8B57" />
//             <Text style={styles.instructionTextItem}>
//               Arrive 15 minutes before scheduled time
//             </Text>
//           </View>
//         </View>

//         {/* Contact Info */}
//         <View style={styles.contactCard}>
//           <Text style={styles.contactTitle}>Need Assistance?</Text>
//           <View style={styles.contactItem}>
//             <Icon name="phone" size={14} color="#666" />
//             <Text style={styles.contactText}>Club Office: 091-1234567</Text>
//           </View>
//           <View style={styles.contactItem}>
//             <Icon name="mail" size={14} color="#666" />
//             <Text style={styles.contactText}>Email: photoshoot@club.com</Text>
//           </View>
//           <View style={styles.contactItem}>
//             <Icon name="clockcircle" size={14} color="#666" />
//             <Text style={styles.contactText}>Office Hours: 9:00 AM - 6:00 PM</Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Action Buttons */}
//       <View style={styles.actionContainer}>
//         <TouchableOpacity
//           style={styles.paymentButton}
//           onPress={handleMakePayment}
//           disabled={loading || paymentStatus === 'paid'}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <>
//               <Icon name="creditcard" size={20} color="#fff" />
//               <Text style={styles.paymentButtonText}>
//                 {paymentStatus === 'paid' ? 'Payment Completed' : 'Make Payment'}
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.secondaryButton}
//           onPress={() => navigation.goBack()}
//           disabled={loading}
//         >
//           <Text style={styles.secondaryButtonText}>Back to Booking</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   content: {
//     padding: 20,
//     paddingBottom: 100,
//   },
//   invoiceHeader: {
//     alignItems: 'center',
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   invoiceTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   invoiceNumber: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//   },
//   invoiceStatus: {
//     fontSize: 12,
//     color: '#666',
//   },
//   statusPending: {
//     color: '#FFA500',
//     fontWeight: 'bold',
//   },
//   alertCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff3cd',
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffc107',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   alertIcon: {
//     marginRight: 10,
//   },
//   alertContent: {
//     flex: 1,
//   },
//   alertTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#856404',
//     marginBottom: 5,
//   },
//   alertText: {
//     fontSize: 14,
//     color: '#856404',
//     lineHeight: 20,
//   },
//   dueDate: {
//     fontSize: 12,
//     color: '#856404',
//     marginTop: 5,
//     fontStyle: 'italic',
//   },
//   amountCard: {
//     backgroundColor: '#2E8B57',
//     borderRadius: 12,
//     padding: 20,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   amountLabel: {
//     fontSize: 14,
//     color: '#fff',
//     opacity: 0.9,
//     marginBottom: 5,
//   },
//   amountValue: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   sectionCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 10,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   detailValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#000',
//     textAlign: 'right',
//     flex: 1,
//     marginLeft: 10,
//   },
//   totalRow: {
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 10,
//     marginTop: 10,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2E8B57',
//   },
//   channelsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   channelItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   channelText: {
//     fontSize: 12,
//     color: '#2E8B57',
//     marginLeft: 5,
//   },
//   instructionsCard: {
//     backgroundColor: '#e7f3ff',
//     borderWidth: 1,
//     borderColor: '#b3d7ff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 15,
//   },
//   instructionsTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#0d6efd',
//     marginBottom: 10,
//   },
//   instructionsText: {
//     fontSize: 14,
//     color: '#0d6efd',
//     lineHeight: 20,
//     marginBottom: 15,
//   },
//   instructionItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   instructionTextItem: {
//     fontSize: 14,
//     color: '#0d6efd',
//     marginLeft: 8,
//     flex: 1,
//     lineHeight: 20,
//   },
//   contactCard: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   contactTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 10,
//   },
//   contactItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   contactText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   actionContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 20,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   paymentButton: {
//     backgroundColor: '#2E8B57',
//     paddingVertical: 15,
//     borderRadius: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//     marginBottom: 10,
//   },
//   paymentButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   secondaryButton: {
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   secondaryButtonText: {
//     color: '#666',
//     fontSize: 16,
//   },
// });

// export default InvoiceScreen;
import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { paymentAPI } from '../config/apis';

const InvoiceScreen = ({ route, navigation }) => {
  const { invoiceData, bookingData, photoshoot, memberInfo } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const handleShareInvoice = async () => {
    try {
      const message = `
📸 Photoshoot Booking Invoice

Invoice Number: ${invoiceData.InvoiceNumber}
Amount: ₹${invoiceData.Amount}
Due Date: ${new Date(invoiceData.DueDate).toLocaleDateString()}

📋 Booking Details:
• Package: ${photoshoot?.description || 'Photoshoot Package'}
• Date: ${new Date(bookingData?.bookingDate).toLocaleDateString()}
• Time: ${bookingData?.timeSlot ? bookingData.timeSlot.split('T')[1].slice(0, 5) : 'N/A'}
• Duration: 2 hours
• Type: ${bookingData?.pricingType === 'member' ? 'Member' : 'Guest'}
• Total: ₹${invoiceData.Amount}

💳 Payment Channels:
${invoiceData.PaymentChannels?.map(channel => `• ${channel}`).join('\n') || '• Not specified'}

📝 Instructions:
${invoiceData.Instructions}

Thank you for choosing our service!
      `.trim();

      await Share.share({
        message,
        title: `Invoice - ${invoiceData.InvoiceNumber}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share invoice');
    }
  };

  const handleMakePayment = () => {
    Alert.alert(
      'Payment Instructions',
      `Complete your payment using any of these methods:\n\n${invoiceData.PaymentChannels?.join('\n') || 'Contact club office for payment details'}\n\nAfter payment, save your transaction ID and click "I Have Paid".\n\nAmount: ₹${invoiceData.Amount}\nInvoice: ${invoiceData.InvoiceNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Have Paid',
          onPress: () => promptForTransactionId(),
        },
      ]
    );
  };

  const promptForTransactionId = () => {
    Alert.prompt(
      'Transaction ID',
      'Please enter your payment transaction ID:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: (transactionId) => verifyPayment(transactionId),
        },
      ],
      'plain-text'
    );
  };

  const verifyPayment = async (transactionId) => {
    if (!transactionId || transactionId.trim() === '') {
      Alert.alert('Error', 'Please enter a valid transaction ID');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Verifying payment with transaction ID:', transactionId);

      const result = await paymentAPI.verifyPayment(
        invoiceData.InvoiceNumber,
        transactionId
      );

      setLoading(false);

      if (result.success || result.verified) {
        setPaymentStatus('paid');
        Alert.alert(
          'Payment Verified!',
          'Your payment has been successfully verified. Your booking is now confirmed.',
          [
            {
              text: 'View Booking',
              onPress: () => navigation.navigate('BookingConfirmation', {
                invoiceData: invoiceData,
                bookingData: bookingData,
                photoshoot: photoshoot,
                memberInfo: memberInfo,
                paymentStatus: 'PAID',
                transactionId: transactionId,
              }),
            },
          ]
        );
      } else {
        Alert.alert(
          'Payment Verification',
          result.message || 'We are verifying your payment. Please check your bookings list in a few minutes.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Payment verification error:', error);
      Alert.alert(
        'Payment Verification',
        'We are verifying your payment. Please check your bookings list in a few minutes.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const timePart = timeString.includes('T')
        ? timeString.split('T')[1].slice(0, 5)
        : timeString.slice(0, 5);

      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  if (!invoiceData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="exclamationcircleo" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>Invoice data not found</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Invoice</Text>
        <TouchableOpacity onPress={handleShareInvoice} disabled={loading}>
          <Icon name="sharealt" size={24} color={loading ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View> */}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>PHOTOSHOOT BOOKING INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{invoiceData.InvoiceNumber}</Text>
          <Text style={styles.invoiceStatus}>
            Status: <Text style={paymentStatus === 'paid' ? styles.statusPaid : styles.statusPending}>
              {paymentStatus === 'paid' ? 'PAID' : 'PENDING PAYMENT'}
            </Text>
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
                Complete payment within 3 minutes to confirm your booking
              </Text>
              <Text style={styles.dueDate}>
                Due by: {formatDate(invoiceData.DueDate)}
              </Text>
            </View>
          </View>
        )}

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>Rs: {invoiceData.Amount}</Text>
        </View>

        {/* Member Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Member Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Membership No:</Text>
            <Text style={styles.detailValue}>
              {memberInfo?.membership_no || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>
              {memberInfo?.member_name || memberInfo?.Name || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Package:</Text>
            <Text style={styles.detailValue}>
              {invoiceData.BookingSummary?.ServiceName || photoshoot?.description || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingData?.bookingDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>
              {formatTime(bookingData?.timeSlot)} (2 hours duration)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking Type:</Text>
            <Text style={styles.detailValue}>
              {bookingData?.pricingType === 'member' ? 'Member Booking' : 'Guest Booking'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Base Price:</Text>
            <Text style={styles.detailValue}>
              Rs: {invoiceData.BookingSummary?.BasePrice || invoiceData.Amount}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>Rs: {invoiceData.Amount}</Text>
          </View>
        </View>

        {/* Payment Channels */}
        {invoiceData.PaymentChannels && invoiceData.PaymentChannels.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Available Payment Methods</Text>
            <View style={styles.channelsGrid}>
              {invoiceData.PaymentChannels.map((channel, index) => (
                <View key={index} style={styles.channelItem}>
                  <Icon name="creditcard" size={16} color="#2E8B57" />
                  <Text style={styles.channelText}>{channel}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Important Instructions</Text>
          <Text style={styles.instructionsText}>
            {invoiceData.Instructions || 'Please complete your payment to confirm the booking.'}
          </Text>
          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Save this invoice for reference
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Present payment confirmation at reception
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Arrive 15 minutes before scheduled time
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Assistance?</Text>
          <View style={styles.contactItem}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>Club Office: 091-1234567</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="mail" size={14} color="#666" />
            <Text style={styles.contactText}>Email: photoshoot@club.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="clockcircle" size={14} color="#666" />
            <Text style={styles.contactText}>Office Hours: 9:00 AM - 6:00 PM</Text>
          </View>
        </View>
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
                <Icon name="creditcard" size={20} color="#fff" />
                <Text style={styles.paymentButtonText}>
                  Make Payment
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Back to Booking</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFE6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#D2B48C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
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
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  invoiceStatus: {
    fontSize: 12,
    color: '#666',
  },
  statusPending: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  statusPaid: {
    color: '#2E8B57',
    fontWeight: 'bold',
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
    backgroundColor: '#2E8B57',
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
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
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
    color: '#2E8B57',
  },
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  channelText: {
    fontSize: 12,
    color: '#2E8B57',
    marginLeft: 5,
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
  instructionsText: {
    fontSize: 14,
    color: '#0d6efd',
    lineHeight: 20,
    marginBottom: 15,
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
    backgroundColor: '#2E8B57',
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

export default InvoiceScreen;