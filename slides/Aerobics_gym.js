import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Aerobics_gym = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', data: [] });

  const modalData = {
    rates: {
      title: 'Rates',
      subtitle: 'Monthly',
      data: [
        'Member - 2500',
        'Spouse - 2500',
        'Other Dependents - 2500',
        'Guests - 12500',
        'Affiliated Clubs - 8000',
      ],
    },
    timings: {
      title: 'Timings',
      subtitle: 'Closed on Monday',
      data: [
        'Gents: 3:00 PM - 09:00 PM',
        'Ladies: 09:00 AM - 02:45 PM',
        'Ladies: 09:00 PM - 10:00 PM',
        'Ladies on Friday: 09:00 AM - 12:00 PM',

      ],
      subtitles: 'Ladies on Friday',
      datas: [
        'Ladies: 09:00 AM - 12:00 PM',
      ],
    },
    dressCode: {
      title: 'Dress Code',
      sections: [
        {
          subtitle: "Do's",
          items: [
            'Track suit',
            'Trouser',
            'T-Shirt',
            'Knee Length Shorts (Sauna/Steam)',
            'Suitable workout track suit (For Ladies)',
            'Suitable costumes for SPA/Sauna (For Ladies)',
            'Joggers, Sneakers',
          ],
        },
        {
          subtitle: "Don'ts",
          items: [
            'Shalwar Kameez',
            'Jeans',
            'Sandals, Slippers',
          ],
        },
      ],
    },
    dosAndDonts: {
      title: "Do's & Don'ts",
      subtitle: 'NOTE',
      numbered: true,
      data: [
        "Members and guests are requested to bring their membership and activity card, respectively, along with them.",
        "Refrain from yelling, making loud sounds, and avoid gossiping.",
        "Ensure entry in ledger before starting exercise.",
        "Re-rack weights and return all other equipment and accessories to their proper location. Weights must not be dropped.",
        "Ask staff to show you how to operate equipment properly so that others are not waiting as you figure it out.",
        "Any misconduct by playing member / guest will lead to suspension / cancellation of membership / activity card.",
        "Do not leave your bag or other personal belongings at the counter. Place them in lockers in the presence of an instructor and take them along when you leave the gym.",
        "No dedicated locker will be allotted to any member. Please do not insist.",
        "Do not sit on machines between sets.",
        "Do not use treadmill for more than 10 minutes.",
        "All kinds of food items and drinks are prohibited.",
        "Do not bring children into the gym to avoid injury.",
        "Unauthorized use of the sound system by members is not allowed.",
        "Only authorized soundtrack (Pakistani / English) is played. Indian songs / movies are prohibited.",
      ],
    },
  };

  const openModal = (type) => {
    setModalContent(modalData[type]);
    setModalVisible(true);
  };
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
            <Text style={styles.headerTitle}>Aerobics + Gym</Text>
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
            <Image source={require('../assets/gym.png')} style={styles.sliderImage} />
            <Image source={require('../assets/gym1.jpg')} style={styles.sliderImage} />
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
              <TouchableOpacity style={styles.card} onPress={() => openModal('rates')}>
                <View style={styles.iconContainer}>
                  <Icon name="attach-money" size={40} color="#000" />
                </View>
                <Text style={styles.cardText}>Rates</Text>
              </TouchableOpacity>

              {/* Timings Card */}
              <TouchableOpacity style={styles.card} onPress={() => openModal('timings')}>
                <View style={styles.iconContainer}>
                  <Icon name="access-time" size={40} color="#000" />
                </View>
                <Text style={styles.cardText}>Timings</Text>
              </TouchableOpacity>

              {/* Dress Code Card */}
              <TouchableOpacity style={styles.card} onPress={() => openModal('dressCode')}>
                <View style={styles.iconContainer}>
                  <Icon name="person" size={40} color="#000" />
                </View>
                <Text style={styles.cardText}>Dress Code</Text>
              </TouchableOpacity>
            </View>

            {/* Second Row - 1 Card aligned left */}
            <View style={styles.cardRowLeft}>
              {/* Do's & Don'ts Card */}
              <TouchableOpacity style={styles.card} onPress={() => openModal('dosAndDonts')}>
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

        {/* 🔹 Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Modal Content - Check if sections exist (for Dress Code) */}
              {modalContent.sections ? (
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  {modalContent.sections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.sectionContainer}>
                      <Text style={styles.modalSubtitle}>{section.subtitle}</Text>
                      <View style={styles.modalContent}>
                        {section.items.map((item, index) => (
                          <View key={index} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : modalContent.numbered ? (
                <>
                  <Text style={styles.modalSubtitle}>{modalContent.subtitle}</Text>
                  <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.modalContent}>
                      {modalContent.data?.map((item, index) => (
                        <View key={index} style={styles.numberedListItem}>
                          <Text style={styles.numberText}>{index + 1}.</Text>
                          <Text style={styles.listText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </>
              ) : (
                <>
                  <Text style={styles.modalSubtitle}>{modalContent.subtitle}</Text>
                  <View style={styles.modalContent}>
                    {modalContent.data?.map((item, index) => (
                      <View key={index} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
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
    height: 250,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    backgroundColor: '#E57373',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#C4A570',
    fontWeight: '600',
    marginBottom: 15,
  },
  modalContent: {
    paddingLeft: 5,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  numberedListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  numberText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginRight: 10,
    minWidth: 24,
    lineHeight: 22,
  },
  bullet: {
    fontSize: 18,
    color: '#000',
    marginRight: 10,
    lineHeight: 22,
  },
  listText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
});

export default Aerobics_gym;