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

const SquashCourt = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', data: [] });

  const modalData = {
    rates: {
      title: 'Rates',
      sections: [
        {
          subtitle: 'Monthly',
          items: [
            'Member - Free',
            'Spouse - 750',
            'Other Dependents - 1200',
            'Guests - 10000',
            'Affiliated Clubs - 10000',
          ],
        },
        {
          subtitle: 'Per Hour',
          items: [
            'Member - Free',
            'Spouse - 200',
            'Other Dependents - 300',
            'Guests - 1000',
            'Affiliated Clubs - 500',
          ],
        },
      ],
    },
    timings: {
      title: 'Timings',
      subtitle: 'Court Schedule',
      data: [
        '03:00 PM - 09:00 PM',
        'Closed on Sunday',
      ],
    },
    dressCode: {
      title: 'Dress Code',
      sections: [
        {
          subtitle: "Do's",
          items: [
            'Track suit',
            'T-shirts',
            'Trouser/Knee Length Shorts',
            'Yellow badminton shoes/ sneakers',
          ],
        },
        {
          subtitle: "Don'ts",
          items: [
            'Jeans or casual pants',
            'Marking shoes / sandals',
            'Shalwar Kameez',
          ],
        },
      ],
    },
    dosAndDonts: {
      title: "Do's & Don'ts",
      subtitle: 'NOTE',
      numbered: true,
      data: [
        "Members and guests are requested to bring their activity card along with them.",
        "Use of squash courts shall be on 'first come first serve' basis. The reception desk attendant shall monitor the court use and sign-in process and resolve any problems.",
        "Refrain from yelling, making loud sounds, and avoid gossiping in court sitting area.",
        "A limit of 20 minutes per pair shall apply for each court when there are other members signed-in and waiting to use the courts.",
        "All members / guests to ensure entry in ledger at reception desk before entering the courts.",
        "Any misconduct by playing member / guest will result in cancellation of activity card.",
        "Do not leave your bag or other personal belongings or expensive items in absence of instructor at the reception desk.",
        "All kind of food items and drinks are not permitted in the squash courts except in the lobby / reception area.",
        "Cellular phones or other items that may distract other players are not permitted in the courts. Turn them off before entering the courts.",
        "Children are not allowed in the squash courts.",
        "Proper squash shoes with non-marking soles must be worn at all times on the court.",
        "Eye protection is strongly recommended for safety purposes.",
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
            <Text style={styles.headerTitle}>Squash</Text>
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
            <Image source={require('../assets/squashcourt.jpg')} style={styles.sliderImage} />
            <Image source={require('../assets/squashcourt.jpg')} style={styles.sliderImage} />
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

              {/* Modal Content - Check if sections exist (for Dress Code/Rates) */}
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

export default SquashCourt;