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
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { paymentAPI, banquetAPI } from '../config/apis';

const HallInvoiceScreen = ({ route, navigation }) => {
  const {
    invoiceData,
    bookingData,
    venue,
    isGuest,
    memberDetails,
    guestDetails
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const handleShareInvoice = async () => {
    try {
      const message = `
🏢 Banquet Hall Booking Invoice

Invoice Number: ${invoiceData.InvoiceNumber || invoiceData.invoiceNumber}
Amount: ${invoiceData.Amount || invoiceData.amount}
Due Date: ${new Date(invoiceData.DueDate || invoiceData.dueDate).toLocaleDateString()}

📋 Booking Details:
• Hall: ${venue?.name || bookingData?.hallName}
• Date: ${formatDate(bookingData?.bookingDate)}
• Time Slot: ${bookingData?.eventTime}
• Event Type: ${bookingData?.eventType}
• Number of Guests: ${bookingData?.numberOfGuests}
• Booking Type: ${isGuest ? 'Guest Booking' : 'Member Booking'}
• Total: ${invoiceData.Amount || invoiceData.amount}

${isGuest ? `
👤 Guest Information:
• Name: ${guestDetails?.guestName}
• Email: ${guestDetails?.guestEmail}
• Phone: ${guestDetails?.guestPhone}
` : `
👤 Member Information:
• Name: ${memberDetails?.memberName}
• Membership No: ${memberDetails?.membershipNo}
`}

💳 Payment Instructions:
• Amount: ${invoiceData.Amount || invoiceData.amount}
• Invoice: ${invoiceData.InvoiceNumber || invoiceData.invoiceNumber}
• Due Date: ${new Date(invoiceData.DueDate || invoiceData.dueDate).toLocaleDateString()}

📞 Contact Club Office for payment details.

Thank you for choosing our banquet hall services!
      `.trim();

      await Share.share({
        message,
        title: `Hall Booking Invoice - ${invoiceData.InvoiceNumber || invoiceData.invoiceNumber}`,
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
Account Name: PSC Banquet Hall
Account Number: 1234567890
Branch Code: 1234
Reference: ${invoiceData.InvoiceNumber || invoiceData.invoiceNumber}

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
        `;
        contactNumber = '091-1234567';
        break;

      case 'card':
        paymentInstructions = `
💳 Card Payment Instructions:

Visit the club office for card payment.
We accept Visa, MasterCard, and UnionPay.
A 2% processing fee applies for credit cards.
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
      console.log('🔍 Verifying payment with transaction ID:', transactionId);

      const result = await paymentAPI.verifyPayment(
        invoiceData.InvoiceNumber || invoiceData.invoiceNumber,
        transactionId,
        method
      );

      setLoading(false);

      if (result.success || result.verified) {
        setPaymentStatus('paid');
        Alert.alert(
          'Payment Verified!',
          'Your payment has been successfully verified. Your hall booking is now confirmed.',
          [
            {
              text: 'View Booking',
              onPress: () => navigation.navigate('BookingConfirmation', {
                invoiceData: invoiceData,
                bookingData: bookingData,
                venue: venue,
                isGuest: isGuest,
                memberDetails: memberDetails,
                guestDetails: guestDetails,
                paymentStatus: 'PAID',
                transactionId: transactionId,
                paymentMethod: method,
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

  const formatEventType = (eventType) => {
    if (!eventType) return '';
    const eventMap = {
      'wedding': 'Wedding Reception',
      'birthday': 'Birthday Party',
      'corporate': 'Corporate Event',
      'anniversary': 'Anniversary',
      'family': 'Family Gathering',
      'other': 'Other Event'
    };
    return eventMap[eventType] || eventType;
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
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrowleft" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hall Booking Invoice</Text>
        <TouchableOpacity onPress={handleShareInvoice} disabled={loading}>
          <Icon name="sharealt" size={24} color={loading ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>BANQUET HALL BOOKING INVOICE</Text>
          <Text style={styles.invoiceNumber}>
            #{invoiceData.InvoiceNumber || invoiceData.invoiceNumber}
          </Text>
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
                Complete payment within 24 hours to confirm your booking
              </Text>
              <Text style={styles.dueDate}>
                Due by: {formatDate(invoiceData.DueDate || invoiceData.dueDate)}
              </Text>
            </View>
          </View>
        )}

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>
            Rs. {(invoiceData.Amount || invoiceData.amount || 0).toLocaleString()}/-
          </Text>
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
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>
                  {guestDetails?.guestEmail || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>
                  {guestDetails?.guestPhone || 'N/A'}
                </Text>
              </View>

              {guestDetails?.guestAddress && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>
                    {guestDetails.guestAddress}
                  </Text>
                </View>
              )}
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

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Booking Type:</Text>
                <Text style={styles.detailValue}>
                  Member Booking
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Hall Booking Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hall Booking Summary</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hall Name:</Text>
            <Text style={styles.detailValue}>
              {venue?.name || bookingData?.hallName || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking Date:</Text>
            <Text style={styles.detailValue}>
              {formatDate(bookingData?.bookingDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Slot:</Text>
            <Text style={styles.detailValue}>
              {formatTimeSlot(bookingData?.eventTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event Type:</Text>
            <Text style={styles.detailValue}>
              {formatEventType(bookingData?.eventType)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number of Guests:</Text>
            <Text style={styles.detailValue}>
              {bookingData?.numberOfGuests || 0} people
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rate Type:</Text>
            <Text style={styles.detailValue}>
              {isGuest ? 'Guest Rate' : 'Member Rate'}
            </Text>
          </View>

          {bookingData?.specialRequest && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Special Requests:</Text>
              <Text style={styles.detailValue}>
                {bookingData.specialRequest}
              </Text>
            </View>
          )}

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              Rs. {(invoiceData.Amount || invoiceData.amount || 0).toLocaleString()}/-
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        {!showPaymentMethods ? (
          <TouchableOpacity
            style={styles.showPaymentMethodsButton}
            onPress={() => setShowPaymentMethods(true)}
          >
            <Feather name="credit-card" size={20} color="#FFF" />
            <Text style={styles.showPaymentMethodsText}>
              Show Payment Methods
            </Text>
            <Icon name="right" size={16} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Available Payment Methods</Text>
            <View style={styles.paymentMethodsGrid}>
              <TouchableOpacity
                style={styles.paymentMethodCard}
                onPress={() => handlePaymentMethodSelect('bank')}
              >
                <View style={styles.paymentMethodIcon}>
                  <Feather name="bank" size={24} color="#2E8B57" />
                </View>
                <Text style={styles.paymentMethodName}>Bank Transfer</Text>
                <Text style={styles.paymentMethodDesc}>Online/ATM Transfer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentMethodCard}
                onPress={() => handlePaymentMethodSelect('cash')}
              >
                <View style={styles.paymentMethodIcon}>
                  <Feather name="dollar-sign" size={24} color="#2E8B57" />
                </View>
                <Text style={styles.paymentMethodName}>Cash Payment</Text>
                <Text style={styles.paymentMethodDesc}>At Club Office</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentMethodCard}
                onPress={() => handlePaymentMethodSelect('card')}
              >
                <View style={styles.paymentMethodIcon}>
                  <Feather name="credit-card" size={24} color="#2E8B57" />
                </View>
                <Text style={styles.paymentMethodName}>Card Payment</Text>
                <Text style={styles.paymentMethodDesc}>Visa/MasterCard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Important Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Important Instructions</Text>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Complete payment within 24 hours to secure your booking
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Bring this invoice and payment confirmation when you visit
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Arrive 1 hour before your event time for setup
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
            <Text style={styles.instructionTextItem}>
              Maximum capacity: {venue?.capacity || 'As per booking'} people
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Icon name="checkcircle" size={14} color="#2E8B57" />
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
            4. Damage to property will be charged separately.
            5. Club rules must be followed at all times.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Assistance?</Text>
          <View style={styles.contactItem}>
            <Feather name="phone" size={14} color="#666" />
            <Text style={styles.contactText}>Banquet Office: 091-1234567</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="mail" size={14} color="#666" />
            <Text style={styles.contactText}>Email: banquet@pscclub.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="clock" size={14} color="#666" />
            <Text style={styles.contactText}>Office Hours: 9:00 AM - 8:00 PM</Text>
          </View>
          <View style={styles.contactItem}>
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.contactText}>Location: Club Main Building</Text>
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
                <Feather name="credit-card" size={20} color="#fff" />
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
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#B8860B',
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
    color: '#B8860B',
  },
  showPaymentMethodsButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  showPaymentMethodsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  paymentMethodCard: {
    width: '31%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  paymentMethodIcon: {
    marginBottom: 10,
  },
  paymentMethodName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  paymentMethodDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
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
    backgroundColor: '#B8860B',
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

export default HallInvoiceScreen;