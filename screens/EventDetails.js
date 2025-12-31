// screens/EventDetails.js
import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Linking,
  Alert 
} from 'react-native';

const EventDetails = ({ route, navigation }) => {
  const { event } = route.params || {};

  const handleBookNow = () => {
    Alert.alert(
      'Book Event',
      `Would you like to book "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            // You can navigate to a booking screen or call an API
            Alert.alert('Success', 'Booking request sent!');
          }
        },
      ]
    );
  };

  const handleCallClub = () => {
    Linking.openURL('tel:+923001234567');
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={event.image} 
        style={styles.image}
        defaultSource={require('../../assets/psc_home.jpeg')}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{event.title || 'Event Details'}</Text>
        
        {event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}
        
        <View style={styles.detailsContainer}>
          {event.date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || event.date}
                </Text>
              </View>
            </View>
          )}
          
          {event.time && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⏰</Text>
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>
            </View>
          )}
          
          {event.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity> */}
        
        {/* <TouchableOpacity style={styles.callButton} onPress={handleCallClub}>
          <Text style={styles.callButtonText}>📞 Call Club for Details</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  image: { 
    width: '100%', 
    height: 250 
  },
  content: { 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333'
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  description: { 
    fontSize: 16, 
    color: '#555',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bookButton: { 
    backgroundColor: '#A3834C', 
    padding: 18, 
    borderRadius: 10, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  callButton: { 
    backgroundColor: '#8B4513', 
    padding: 15, 
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default EventDetails;
