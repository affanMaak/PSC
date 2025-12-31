import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert, // 👈 Imported Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../auth/contexts/AuthContext';

// Placeholder image source (REPLACE THIS)
const ROOM_IMAGE_URI = 'https://via.placeholder.com/350x250/d8c7aa/808080?text=Studio+Room';

const features = [
  'Single room',
  'Two single beds',
  'TV',
  'Sofa set',
  'Refrigerator',
  'Side table',
  'Dining Table',
  'Washroom with toiletries',
];

export default function studio({ navigation }) {
  const { user } = useAuth();

  const handleBookNow = () => {
    console.log('📖 Book Now clicked - Studio');
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

    navigation.navigate("booking");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />

      {/* Header Section (Back Button & Title) */}
      <View style={styles.headerBackground}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Studio Room</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Room Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: ROOM_IMAGE_URI }}
            style={styles.roomImage}
            resizeMode="cover"
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresHeading}>Features</Text>
          <Text style={styles.featuresSubText}>Studio room comprise of:</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Spacer to lift content above the fixed Book Now button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- Book Now Button --- */}
      <View style={styles.bookNowContainer}>
        <TouchableOpacity
          style={styles.bookNowButton}
          onPress={handleBookNow} // 👈 Calls the new handler
        >
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Stylesheet (Matching your first UI/UX image) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f3eb' }, // Lighter background for the entire screen
  headerBackground: {
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#dbc9a5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  backButton: { padding: 5, marginRight: 20 },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: -20,
  },
  imageContainer: {
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    backgroundColor: '#fff',
  },
  roomImage: { width: '100%', height: 250 },
  featuresCard: {
    width: '90%',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  featuresHeading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#a0855c',
    marginBottom: 10,
  },
  featuresSubText: { fontSize: 16, color: '#333', marginBottom: 15 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: {
    fontSize: 18,
    lineHeight: 24,
    color: '#a0855c',
    marginRight: 8,
    marginTop: -3,
  },
  featureText: { fontSize: 16, color: '#333', lineHeight: 24, flexShrink: 1 },
  bookNowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#a0855c',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bookNowButton: { width: '100%', alignItems: 'center', paddingVertical: 5 },
  bookNowText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});