// screens/EventDetails.js
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';

import Icon from "react-native-vector-icons/Ionicons";

const EventDetails = ({ route, navigation }) => {
  const { event } = route.params || {};

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text>Event data not found</Text>
      </View>
    );
  }

  // Determine images array
  const getImages = () => {
    let images = [];

    // Check if event.images exists and is an array or string
    if (event.images) {
      if (Array.isArray(event.images)) {
        images = event.images;
      } else if (typeof event.images === 'string') {
        try {
          images = JSON.parse(event.images);
        } catch (e) {
          images = [event.images];
        }
      }
    } else if (event.image) {
      // Fallback for single image property
      images = [event.image];
    }

    // Default fallback if no images found
    if (images.length === 0) {
      images = [require('../../assets/psc_home.jpeg')];
    }

    return images;
  };

  const imagesList = getImages();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View style={styles.container}>

        {/* 🔹 Notch Header */}
        <ImageBackground
          source={require("../../assets/notch.jpg")}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('events')}
            >
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>

            {/* Center Title */}
            <Text style={styles.headerText}>{event.title || 'Event Details'}</Text>

          </View>
        </ImageBackground>

        {/* 🌟 Premium Info Panel (Time, Date, Location) */}
        <View style={styles.infoPanelContainer}>
          <View style={styles.infoPanel}>
            {/* Time Section */}
            {event.time && (
              <View style={styles.infoItem}>
                <Icon name="time-outline" size={18} color="#A3834C" />
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            )}

            {/* Divider */}
            {event.time && (event.date || event.startDate) && <View style={styles.verticalDivider} />}

            {/* Date Section */}
            {(event.date || event.startDate) && (
              <View style={styles.infoItem}>
                <Icon name="calendar-outline" size={18} color="#A3834C" />
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(event.date || event.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}

            {/* Divider */}
            {(event.date || event.startDate) && (event.location || event.venue) && <View style={styles.verticalDivider} />}

            {/* Location Section */}
            {(event.location || event.venue) && (
              <View style={styles.infoItem}>
                <Icon name="location-outline" size={18} color="#A3834C" />
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {event.location || event.venue}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 🔹 Main Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Description Card */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {event.description || 'No description available for this event.'}
              </Text>
            </View>

            {/* Dynamic Images */}
            {imagesList.map((img, index) => (
              <View key={`img-${index}`} style={styles.imageContainer}>
                <Image
                  source={typeof img === 'string' ? { uri: img } : img}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              </View>
            ))}

          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* -------------------- NOTCH HEADER -------------------- */
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 130,
  },
  notchImage: {
    resizeMode: 'cover',
  },
  notchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
    marginRight: 40,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* -------------------- PREMIUM INFO PANEL -------------------- */
  infoPanelContainer: {
    paddingHorizontal: 15,
    marginTop: 20, // Floats slightly over the bottom of the notch
    zIndex: 10,
    marginBottom: 10,
  },
  infoPanel: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(163, 131, 76, 0.1)', // Subtle gold border
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  infoLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  /* -------------------- SCROLLABLE CONTENT -------------------- */
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* -------------------- DESCRIPTION CARD -------------------- */
  descriptionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 25,
    paddingHorizontal: 25,
    backgroundColor: '#ff5f2917',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
  },

  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
  },

  /* -------------------- IMAGES -------------------- */
  imageContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },

  eventImage: {
    width: '100%',
    height: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventDetails;