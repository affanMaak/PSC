import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const About = ({ navigation }) => {
  return (
    <>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Notch Header */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.headerText}>About PSC</Text>
        </ImageBackground>

        {/* Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* About PSC Card */}
            <View style={styles.card}>
              <Text style={styles.contentText}>
                Established in 1863 as the "Games Club", the Peshawar Services
                Club (PSC) has undergone various transformations, from being the
                HQ for the Vale Hunt Club in 1870 to "Peshawar Club" in 1899.
                Since 1947, its name changed multiple times until settling on
                "Peshawar Services Club" in 2011.
              </Text>
              <Text style={styles.contentText}>
                Spanning acres of land, PSC offers its members a place for
                socializing, various amenities, including indoor and outdoor
                sports facilities, dining areas, and elegant accommodations.
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <Text style={styles.lineText}>Down the Memory Lane</Text>
              <View style={styles.line} />
            </View>

            {/* Image Cards */}
            {[
              {
                src: require('../assets/img1.jpeg'),
                caption: 'Club Premier View from Mall Road (1863)',
              },
              {
                src: require('../assets/img2.jpeg'),
                caption: 'Peshawar Vale Hunt (1880)',
              },
              {
                src: require('../assets/img3.jpeg'),
                caption: 'Peshawar Club Limited (1940)',
              },
              {
                src: require('../assets/img4.jpeg'),
                caption: 'Peshawar Services Club (2023)',
              },
            ].map((item, index) => (
              <View style={styles.imageCard} key={index}>
                <Image
                  source={item.src}
                  style={styles.memoryImage}
                  resizeMode="cover"
                />
                <Text style={styles.imageCaption}>{item.caption}</Text>
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
    backgroundColor: '#F5F5F5',
  },

  /* Fixed height notch header */
  notch: {
    height: 120, // 🔒 Fixed height (doesn't grow/shrink)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60, // space for arrow and title
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
  },
  notchImage: {
    resizeMode: 'cover',
  },

  /* Perfect horizontal alignment for arrow and title */
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
  },

  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f1e3dcff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 12,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3834C',
  },
  lineText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A3834C',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memoryImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: 15,
    color: '#A3834C',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 5,
  },
});

export default About;
