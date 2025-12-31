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
  TouchableOpacity
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Billiard = ({ navigation }) => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        
        {/* 🔹 Notch Header with Back Button */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Swimming Pool</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        {/* 🔹 Image Slider */}
        <View style={styles.sliderContainer}>
          <Swiper
            autoplay
            autoplayTimeout={4}
            loop
            showsPagination
            activeDotColor="#A3834C"
            dotColor="#D3D3D3"
          >
            <Image source={require('../assets/pool.jpg')} style={styles.sliderImage} />
            <Image source={require('../assets/pool1.jpg')} style={styles.sliderImage} />
          </Swiper>
        </View>

        {/* 🔹 More About Sports Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            MORE ABOUT <Text style={styles.infoTitleGold}>SPORTS</Text>
          </Text>

          {/* Info Cards Grid */}
          <View style={styles.cardsContainer}>
            {/* First Row - 3 Cards */}
            <View style={styles.cardRow}>
              {/* Rates Card */}
              <TouchableOpacity style={styles.card}>
                <View style={styles.iconContainer}>
                  <Icon name="attach-money" size={40} color="#000" />
                </View>
                <Text style={styles.cardText}>Rates</Text>
              </TouchableOpacity>

              {/* Timings Card */}
              <TouchableOpacity style={styles.card}>
                <View style={styles.iconContainer}>
                  <Icon name="access-time" size={40} color="#000" />
                </View>
                <Text style={styles.cardText}>Timings</Text>
              </TouchableOpacity>

              {/* Dress Code Card */}
              <TouchableOpacity style={styles.card}>
                <View style={styles.iconContainer}>
                  <Icon name="person" size={40} color="#000" />
                </View>
                <Text style={styles.cardText}>Dress Code</Text>
              </TouchableOpacity>
            </View>

            {/* Second Row - 1 Card aligned left */}
            <View style={styles.cardRowLeft}>
              {/* Do's & Don'ts Card */}
              <TouchableOpacity style={styles.card}>
                <View style={styles.iconContainerDark}>
                  <Icon name="close" size={28} color="#FFF" />
                </View>
                <Text style={styles.cardText}>Do's & Don'ts</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 🔹 Main Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Additional content can be added here */}
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
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 120,
  },
  notchImage: {
    resizeMode: 'cover',
  },
  notchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  sliderContainer: {
    height: 200,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoTitleGold: {
    color: '#A3834C',
  },
  cardsContainer: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardRowLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: '#C4A570',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '31%',
    minHeight: 110,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconContainerDark: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
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
});

export default Billiard;