import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ClubArenaScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notch Header Image */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../assets/notch.jpg')}
            style={styles.notchImage}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SportsScreen')}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>The Club Arena</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            Get ready for the grand opening of our brand-new The Club Arena in April 2024,
            exclusively for our valued members. Dive into relaxation and fun with our top-notch
            facilities. We've got swimming pools with comfy temperatures, perfect for all
            seasons. And don't worry, we've got separate sections for ladies and gentlemen,
            so everyone can enjoy a swim without any worries. But that's not all! Take a break
            in our Sauna and Steam rooms, where the heat helps you relax and feel great. Or try
            out our Jacuzzi for a soothing soak that's perfect for unwinding. For something
            really cool, check out our Ice Room, where you can chill out and refresh. And if
            you're looking for some health benefits, our Salt Room is the place to be. Best of
            all, our friendly staff are here to make sure you have an awesome time and feel
            totally taken care of. Join us at our sports arena, where relaxation and fun come
            together for an unforgettable experience.
          </Text>
        </View>

        {/* Video Placeholder */}
        <View style={styles.videoContainer}>
          <Image
            source={require('../assets/psc_home.jpeg')}
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          <View style={styles.videoOverlay}>
            <TouchableOpacity style={styles.playButton}>
              <Icon name="play" size={36} color="#fff" style={styles.playIcon} />
            </TouchableOpacity>
            <Text style={styles.videoText}>COMPLETE INCLUDE OWING FEATURES</Text>
          </View>
        </View>

        {/* Facility Cards */}
        <TouchableOpacity style={styles.facilityCard} onPress={() => navigation.navigate('Swimming')}>
          <Image
            source={require('../assets/swimming.jpg')}
            style={styles.facilityImage}
            resizeMode="cover"
          />

          <View style={styles.facilityOverlay}>
            <Text style={styles.facilityTitle}>Swimming Pool</Text>
            <Icon name="chevron-forward" size={32} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.facilityCard}>
          <View style={styles.underConstructionBadge}>
            <Text style={styles.underConstructionText}>UNDER</Text>
            <Text style={styles.underConstructionText}>CONSTRUCTION</Text>
          </View>
          <View style={styles.facilityOverlay}>
            <Text style={styles.facilityTitle}>Sauna & Steam</Text>
            <Icon name="chevron-forward" size={32} color="#fff" />
          </View>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.facilityCard}>
          <View style={styles.underConstructionBadge}>
            <Text style={styles.underConstructionText}>UNDER</Text>
            <Text style={styles.underConstructionText}>CONSTRUCTION</Text>
          </View>
          <View style={styles.facilityOverlay}>
            <Text style={styles.facilityTitle}>Jacuzzi, Ice Room, Salt Room</Text>
            <Icon name="chevron-forward" size={32} color="#fff" />
          </View>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  scrollView: {
    flex: 1,
  },

  /* -------------------- HEADER -------------------- */
  headerContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#d2b48c',
  },
  notchImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
    marginRight: 28,
  },

  /* -------------------- DESCRIPTION -------------------- */
  descriptionCard: {
    backgroundColor: '#f7efe6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.7,
    borderColor: '#e6d7c3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#2f2f2f',
    textAlign: 'center',
  },

  /* -------------------- VIDEO -------------------- */
  videoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 0,
    overflow: 'hidden',
    height: 220,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  playIcon: {
    marginLeft: 4,
  },
  videoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },

  /* -------------------- FACILITY CARDS -------------------- */
  facilityCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 140,
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  facilityImage: {
    width: '100%',
    height: '100%',
  },
  facilityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },

  /* -------------------- UNDER CONSTRUCTION -------------------- */
  underConstructionBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -30 }, { rotate: '-15deg' }],
    zIndex: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: '#d4af37',
  },
  underConstructionText: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default ClubArenaScreen;