import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentAPI, photoshootAPI, makeApiCall, getUserData, checkAuthStatus } from '../config/apis';

const shootsBooking = ({ route, navigation }) => {
  const { photoshoot } = route.params || {};

  // State variables
  const [selectedDate, setSelectedDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [isGuest, setIsGuest] = useState(true); // Guest selected by default
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Member info state
  const [memberInfo, setMemberInfo] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🎬 shootsBooking mounted with photoshoot:', photoshoot);

    // Always initialize time slots immediately
    generateTimeSlots();

    // Initialize with today's date
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);

    // Then check authentication
    checkAuthentication();

    // Listen for focus to refresh data
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Screen focused, refreshing...');
      checkAuthentication();
    });

    return unsubscribe;
  }, [navigation]);

  const checkAuthentication = async () => {
    try {
      console.log('🔐 Checking authentication...');
      setLoading(true);
      setAuthError(null);

      // Use the checkAuthStatus function from your config
      const authStatus = await checkAuthStatus();
      console.log('📊 Auth status:', authStatus);

      if (authStatus.isAuthenticated && authStatus.userData) {
        setIsAuthenticated(true);

        // Extract member information from userData
        const userData = authStatus.userData;
        console.log('👤 User data from storage:', userData);

        // Map userData to memberInfo structure
        const memberData = {
          membership_no: userData.membership_no ||
            userData.Membership_No ||
            userData.membershipNumber ||
            userData.memberId ||
            '',
          member_name: userData.member_name ||
            userData.Name ||
            userData.name ||
            userData.fullName ||
            '',
          Sno: userData.Sno || userData.id || userData.userId,
          email: userData.email || '',
          phone: userData.phone || userData.Phone || '',
          status: userData.status || 'active',
        };

        console.log('✅ Extracted member data:', memberData);

        if (!memberData.membership_no) {
          console.warn('⚠️ No membership number found in user data');
          setAuthError('Membership information incomplete. Please login again.');
          setIsAuthenticated(false);
          setMemberInfo(null);
        } else {
          setMemberInfo(memberData);
        }
      } else {
        console.warn('⚠️ User not authenticated');
        setIsAuthenticated(false);
        setMemberInfo(null);
        setAuthError('Please login to book a photoshoot.');
      }
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      setIsAuthenticated(false);
      setMemberInfo(null);
      setAuthError('Authentication error. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    // Generate slots from 9 AM to 6 PM in 2-hour intervals
    for (let hour = 9; hour <= 16; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
      slots.push({
        id: hour,
        startTime,
        endTime,
        label: `${startTime} - ${endTime}`,
        available: true,
      });
    }
    console.log('🕒 Generated time slots:', slots);
    setTimeSlots(slots);
  };

  const handleDateSelect = (day) => {
    const selectedDateStr = day.dateString;
    console.log('📅 Date selected:', selectedDateStr);
    setSelectedDate(selectedDateStr);

    // Reset selected time slot when date changes
    setFromTime('');
    setToTime('');
    setSelectedSlot(null);
  };

  const handleTimeSlotSelect = (slot) => {
    console.log('🕒 Time slot selected:', slot);
    setFromTime(slot.startTime);
    setToTime(slot.endTime);
    setSelectedSlot(slot);
  };

  const handleGenerateInvoice = async () => {
    // Check authentication
    if (!isAuthenticated || !memberInfo || !memberInfo.membership_no) {
      Alert.alert(
        'Authentication Required',
        'Please login to book a photoshoot.',
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

    // Validation
    if (!photoshoot || !photoshoot.id) {
      Alert.alert('Error', 'Photoshoot information is missing');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    if (!fromTime || !toTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    if (isGuest && (!guestName || !guestContact)) {
      Alert.alert('Error', 'Please enter guest name and contact');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        membership_no: memberInfo.membership_no,
        bookingDate: selectedDate,
        timeSlot: `${selectedDate}T${fromTime}:00`,
        pricingType: isGuest ? 'guest' : 'member',
        specialRequest: specialRequest || '',
        guestName: isGuest ? guestName : null,
        guestContact: isGuest ? guestContact : null,
        member_name: memberInfo.member_name || '',
      };

      console.log('🧾 Generating invoice with data:', {
        photoshootId: photoshoot.id,
        bookingData,
      });

      // Generate invoice using the API
      const result = await makeApiCall(
        photoshootAPI.generateInvoicePhotoshoot,
        photoshoot.id,
        bookingData
      );

      setLoading(false);

      if (result.success) {
        console.log('✅ Invoice generated successfully:', result.data);

        // Navigate to invoice screen
        navigation.navigate('InvoiceScreen', {
          invoiceData: result.data.Data || result.data,
          bookingData: {
            ...bookingData,
            photoshootId: photoshoot.id,
            totalPrice: isGuest ? photoshoot.guestCharges : photoshoot.memberCharges,
            photoshootDescription: photoshoot.description,
          },
          photoshoot: photoshoot,
          memberInfo: memberInfo,
        });
      } else {
        Alert.alert('Invoice Generation Failed', result.message || 'Failed to generate invoice');
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Invoice generation error:', error);
      Alert.alert('Error', error.message || 'Failed to generate invoice. Please try again.');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const debugStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔑 All AsyncStorage keys:', keys);

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`📦 ${key}:`, value);
      }

      // Show specific keys
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');

      console.log('🔐 Token exists:', !!token);
      console.log('👤 User data exists:', !!userData);

      if (userData) {
        console.log('📄 Parsed user data:', JSON.parse(userData));
      }

      // Show in alert for easier debugging
      Alert.alert(
        'Storage Debug',
        `Keys: ${keys.length}\nToken: ${token ? 'Yes' : 'No'}\nUser Data: ${userData ? 'Yes' : 'No'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Debug storage error:', error);
    }
  };

  // Function to simulate login for testing
  const simulateLogin = async () => {
    try {
      const testUserData = {
        membership_no: 'M12345',
        member_name: 'Test Member',
        Name: 'Test Member',
        Sno: 1,
        email: 'test@example.com',
        phone: '1234567890',
        status: 'active'
      };

      await AsyncStorage.setItem('user_data', JSON.stringify(testUserData));
      await AsyncStorage.setItem('access_token', 'test_token_123');

      Alert.alert(
        'Test Login',
        'Test member data stored. Now you can test booking.',
        [{
          text: 'OK',
          onPress: () => {
            // Refresh authentication check
            checkAuthentication();
          }
        }]
      );
    } catch (error) {
      console.error('Error simulating login:', error);
    }
  };

  // Render loading state
  if (loading && !timeSlots.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D2B48C" />
          <Text style={styles.loadingText}>Loading booking information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render auth error state - BUT STILL SHOW THE FORM FOR TESTING
  if (!isAuthenticated || authError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" />

        {/* 🔹 NOTCH HEADER */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchRow}>
            <TouchableOpacity
              style={styles.iconWrapper}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrowleft" size={30} color="#000" />
            </TouchableOpacity>

            <Text style={styles.notchTitle}>Book Photoshoot</Text>

            <View style={styles.iconWrapper}>
              <Icon name="bells" size={24} color="#000" />
            </View>
          </View>
        </ImageBackground>

        {/* 
        {/* Header */}
        {/* <View style={styles.headerBackground}>
          {/* <View style={styles.headerBar}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrowleft" size={24} color="black" />
            </TouchableOpacity> */}
        {/* <Text style={styles.headerTitle}>Book Photoshoot</Text> */}
        {/* <View style={{ width: 24 }} />
          </View> */}
        {/* /</View>  */}


        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Authentication Warning Banner */}
          <View style={styles.authWarningBanner}>
            <Icon name="exclamationcircleo" size={20} color="#856404" />
            <Text style={styles.authWarningText}>
              {authError || 'Please login to complete booking'}
            </Text>
          </View>

          {/* Package Info Card */}
          <View style={styles.packageCard}>
            <Text style={styles.packageTitle}>{photoshoot?.description || 'Photoshoot Package'}</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Member Price</Text>
                <Text style={styles.priceValue}>Rs:{photoshoot?.memberCharges || 0}</Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Guest Price</Text>
                <Text style={styles.priceValue}>Rs:{photoshoot?.guestCharges || 0}</Text>
              </View>
            </View>
          </View>

          {/* Member/Guest Booking Toggle - Sliding Pill Style */}
          <View style={styles.bookingTypeCard}>
            <Text style={styles.bookingTypeTitle}>Booking Type</Text>
            <View style={styles.togglePillContainer}>
              <TouchableOpacity
                style={[
                  styles.togglePillOption,
                  !isGuest && styles.togglePillOptionActive
                ]}
                onPress={() => setIsGuest(false)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.togglePillText,
                  !isGuest && styles.togglePillTextActive
                ]}>
                  Member Booking
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.togglePillOption,
                  isGuest && styles.togglePillOptionActive
                ]}
                onPress={() => setIsGuest(true)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.togglePillText,
                  isGuest && styles.togglePillTextActive
                ]}>
                  Guest Booking
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price Description based on selection */}
            <View style={styles.priceDescriptionContainer}>
              <Icon name="infocirlceo" size={16} color="#666" />
              <Text style={styles.priceDescriptionText}>
                {isGuest
                  ? `Guest price: Rs ${photoshoot?.guestCharges || 0}`
                  : `Member price: Rs ${photoshoot?.memberCharges || 0}`
                }
              </Text>
            </View>
          </View>

          {/* Guest Details (Conditional) */}
          {isGuest && (
            <View style={styles.guestContainer}>
              <Text style={styles.sectionTitle}>Guest Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Guest Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter guest full name"
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Guest Contact Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter guest phone number"
                  value={guestContact}
                  onChangeText={setGuestContact}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* Show booking form even if not authenticated */}
          <View style={styles.bookingForm}>
            <Text style={styles.sectionTitle}>Select Date & Time</Text>

            {/* Calendar Section */}
            <View style={styles.calendarCard}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <Text style={styles.selectedDate}>
                {selectedDate ? formatDateForDisplay(selectedDate) : 'Select a date'}
              </Text>

              <Calendar
                current={selectedDate || new Date().toISOString().split('T')[0]}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={handleDateSelect}
                markedDates={{
                  ...markedDates,
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

            {/* Time Slots Section - ALWAYS SHOW */}
            <View style={styles.timeContainer}>
              <Text style={styles.sectionTitle}>Select Time Slot (2 Hours)</Text>
              <View style={styles.timeSlotsGrid}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      selectedSlot?.id === slot.id && styles.timeSlotSelected,
                      !slot.available && styles.timeSlotDisabled,
                    ]}
                    onPress={() => slot.available && handleTimeSlotSelect(slot)}
                    disabled={!slot.available}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedSlot?.id === slot.id && styles.timeSlotTextSelected,
                        !slot.available && styles.timeSlotTextDisabled,
                      ]}
                    >
                      {slot.label}
                    </Text>
                    {!slot.available && (
                      <Text style={styles.bookedText}>Booked</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {selectedSlot && (
                <View style={styles.selectedTimeContainer}>
                  <Text style={styles.selectedTimeText}>
                    Selected Time: {formatTimeForDisplay(selectedSlot.startTime)} to {formatTimeForDisplay(selectedSlot.endTime)}
                  </Text>
                </View>
              )}

              {!selectedSlot && timeSlots.length > 0 && (
                <Text style={styles.timeSlotHint}>
                  Please select a time slot from the options above
                </Text>
              )}
            </View>

            {/* Special Requests */}
            <View style={styles.specialRequestContainer}>
              <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any special requirements or notes..."
                value={specialRequest}
                onChangeText={setSpecialRequest}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>

            {/* Booking Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Package:</Text>
                <Text style={styles.summaryValue}>{photoshoot?.description || 'N/A'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Booking Type:</Text>
                <Text style={styles.summaryValue}>
                  {isGuest ? 'Guest' : 'Member'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate ? formatDateForDisplay(selectedDate) : 'Not selected'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time:</Text>
                <Text style={styles.summaryValue}>
                  {selectedSlot ? `${formatTimeForDisplay(selectedSlot.startTime)} - ${formatTimeForDisplay(selectedSlot.endTime)}` : 'Not selected'}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>
                  Rs: {isGuest ? photoshoot?.guestCharges || 0 : photoshoot?.memberCharges || 0}
                </Text>
              </View>
            </View>

            {/* Login Required Message */}
            <View style={styles.loginRequiredCard}>
              <Icon name="lock" size={24} color="#856404" />
              <Text style={styles.loginRequiredTitle}>Login Required</Text>
              <Text style={styles.loginRequiredText}>
                Please login to generate invoice and complete your booking
              </Text>

              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginButtonText}>Go to Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.testLoginButton}
                  onPress={simulateLogin}
                >
                  <Text style={styles.testLoginButtonText}>Test Login (Dev Only)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={debugStorage}
                >
                  <Text style={styles.debugButtonText}>Debug Storage</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render booking form when authenticated
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* 🔹 NOTCH HEADER */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrowleft" size={30} color="#000" />
          </TouchableOpacity>

          <Text style={styles.notchTitle}>Book Photoshoot</Text>

          <View style={styles.iconWrapper}>
            <Icon name="bells" size={24} color="#000" />
          </View>
        </View>
      </ImageBackground>


      {/* Header
      <View style={styles.headerBackground}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Photoshoot</Text>
          <View style={{ width: 24 }} />
        </View>
      </View> */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Info Card */}
        {/* <View style={styles.memberInfoCard}>
          <View style={styles.memberInfoHeader}>
            <Icon name="user" size={20} color="#2E8B57" />
            <Text style={styles.memberInfoTitle}>Logged in as</Text>
          </View>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>Membership No:</Text>
            <Text style={styles.memberInfoValue}>{memberInfo?.membership_no || 'N/A'}</Text>
          </View>
          <View style={styles.memberInfoRow}>
            <Text style={styles.memberInfoLabel}>Name:</Text>
            <Text style={styles.memberInfoValue}>{memberInfo?.member_name || 'N/A'}</Text>
          </View>
        </View> */}

        {/* Package Info Card */}
        <View style={styles.packageCard}>
          <Text style={styles.packageTitle}>{photoshoot?.description || 'Photoshoot Package'}</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Member Price</Text>
              <Text style={styles.priceValue}>Rs: {photoshoot?.memberCharges || 0}</Text>
            </View>
            <View style={styles.priceColumn}>
              <Text style={styles.priceLabel}>Guest Price</Text>
              <Text style={styles.priceValue}>Rs: {photoshoot?.guestCharges || 0}</Text>
            </View>
          </View>
        </View>

        {/* Member/Guest Booking Toggle - Sliding Pill Style */}
        <View style={styles.bookingTypeCard}>
          <Text style={styles.bookingTypeTitle}>Booking Type</Text>
          <View style={styles.togglePillContainer}>
            <TouchableOpacity
              style={[
                styles.togglePillOption,
                !isGuest && styles.togglePillOptionActive
              ]}
              onPress={() => setIsGuest(false)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.togglePillText,
                !isGuest && styles.togglePillTextActive
              ]}>
                Member Booking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.togglePillOption,
                isGuest && styles.togglePillOptionActive
              ]}
              onPress={() => setIsGuest(true)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.togglePillText,
                isGuest && styles.togglePillTextActive
              ]}>
                Guest Booking
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price Description based on selection */}
          <View style={styles.priceDescriptionContainer}>
            <Icon name="infocirlceo" size={16} color="#666" />
            <Text style={styles.priceDescriptionText}>
              {isGuest
                ? `Guest price: Rs ${photoshoot?.guestCharges || 0}`
                : `Member price: Rs ${photoshoot?.memberCharges || 0}`
              }
            </Text>
          </View>
        </View>

        {/* Guest Details (Conditional) */}
        {isGuest && (
          <View style={styles.guestContainer}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guest Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guest full name"
                value={guestName}
                onChangeText={setGuestName}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Guest Contact Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guest phone number"
                value={guestContact}
                onChangeText={setGuestContact}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
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
            onDayPress={handleDateSelect}
            markedDates={{
              ...markedDates,
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

        {/* Time Slots Section */}
        <View style={styles.timeContainer}>
          <Text style={styles.sectionTitle}>Select Time Slot (2 Hours)</Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedSlot?.id === slot.id && styles.timeSlotSelected,
                  !slot.available && styles.timeSlotDisabled,
                ]}
                onPress={() => slot.available && handleTimeSlotSelect(slot)}
                disabled={!slot.available}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedSlot?.id === slot.id && styles.timeSlotTextSelected,
                    !slot.available && styles.timeSlotTextDisabled,
                  ]}
                >
                  {slot.label}
                </Text>
                {!slot.available && (
                  <Text style={styles.bookedText}>Booked</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedSlot && (
            <View style={styles.selectedTimeContainer}>
              <Text style={styles.selectedTimeText}>
                Selected Time: {formatTimeForDisplay(selectedSlot.startTime)} to {formatTimeForDisplay(selectedSlot.endTime)}
              </Text>
            </View>
          )}

          {!selectedSlot && timeSlots.length > 0 && (
            <Text style={styles.timeSlotHint}>
              Please select a time slot from the options above
            </Text>
          )}
        </View>

        {/* Special Requests */}
        <View style={styles.specialRequestContainer}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requirements or notes..."
            value={specialRequest}
            onChangeText={setSpecialRequest}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package:</Text>
            <Text style={styles.summaryValue}>{photoshoot?.description || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Booking Type:</Text>
            <Text style={styles.summaryValue}>
              {isGuest ? 'Guest' : 'Member'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate ? formatDateForDisplay(selectedDate) : 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>
              {selectedSlot ? `${formatTimeForDisplay(selectedSlot.startTime)} - ${formatTimeForDisplay(selectedSlot.endTime)}` : 'Not selected'}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              Rs: {isGuest ? photoshoot?.guestCharges || 0 : photoshoot?.memberCharges || 0}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.invoiceButton]}
            onPress={handleGenerateInvoice}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="filetext1" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Generate Invoice</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFE6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerBackground: {
    backgroundColor: '#D2B48C',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  notch: {
    paddingTop: 60,
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

  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  authWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  authWarningText: {
    color: '#856404',
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  bookingForm: {
    paddingBottom: 20,
  },
  packageCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    marginLeft: 120
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
  calendarCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  selectedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timeContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#B8860B',
    borderColor: '#B8860B',
  },
  timeSlotDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#000',
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeSlotTextDisabled: {
    color: '#999',
  },
  bookedText: {
    fontSize: 10,
    color: '#ff6b6b',
    marginTop: 4,
  },
  selectedTimeContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  timeSlotHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  specialRequestContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  textArea: {
    height: 100,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
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
    color: '#B8860B',
  },
  loginRequiredCard: {
    backgroundColor: '#e7f3ff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b3d7ff',
  },
  loginRequiredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginTop: 10,
    marginBottom: 5,
  },
  loginRequiredText: {
    fontSize: 14,
    color: '#0d6efd',
    textAlign: 'center',
    marginBottom: 20,
  },
  authButtons: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testLoginButton: {
    backgroundColor: '#D2B48C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testLoginButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  memberInfoCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginLeft: 8,
  },
  memberInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memberInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  memberInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  // Booking Type Toggle Styles (sliding pill style)
  bookingTypeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  // Sliding Pill Toggle Styles
  togglePillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9EFE6',
    borderRadius: 30,
    padding: 4,
  },
  togglePillOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillOptionActive: {
    backgroundColor: '#C9A962',
  },
  togglePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  togglePillTextActive: {
    color: '#000',
  },
  priceDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceDescriptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  // Form Group Styles
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  guestContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  actionButtons: {
    marginHorizontal: 15,
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  invoiceButton: {
    backgroundColor: '#b48a64',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default shootsBooking;