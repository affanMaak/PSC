import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const cardData = [
  {
    id: '1',
    title: 'The Club Cafe',
    image: require('../assets/club_and_cafe.jpg'),
    screen: 'The_Club_Cafe',
  },
  {
    id: '2',
    title: 'F & B',
    image: require('../assets/F_and_B.jpg'),
    screen: 'FB',
  },
  {
    id: '3',
    title: 'Bakistry',
    image: require('../assets/bakistry.jpg'),
    screen: 'Bakistry',
  },
];

const MessingScreen = ({ navigation }) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#5a472c" />
      <View style={styles.container}>

        {/* 🔹 Notch Header */}
        <ImageBackground
          source={require('../assets/notch.jpg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('start')}
            >
              <Icon name="arrowleft" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Messing</Text>
            <View style={{ width: 40 }} /> {/* Empty space instead of bell */}
          </View>
        </ImageBackground>

        {/* 🔹 Vertical Image Cards */}
        <View style={styles.cardsContainer}>
          {cardData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cardWrapper}
              onPress={() => navigation.navigate(item.screen)}
            >
              <ImageBackground
                source={item.image}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Icon name="arrowright" size={28} color="#fff" />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔹 Main Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            {/* Dress Code Header */}
            <View style={styles.dressCodeHeader}>
              <Text style={styles.dressCodeTitle}>More About Messing</Text>
            </View>

            {/* Chinar Lawn Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Chinar Lawn <Text style={styles.sectionSubtitle}>(Smart Casual)</Text>
              </Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Dress pant with Bush shirt / Collar T-shirt.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shalwar Kameez starched without waist coat.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Jersey / Coat (winters).</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Closed Shoes and Moccasin.</Text></View>
              <Text style={styles.sublistItemHeader}>Following are not allowed:-</Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Back Strap Chapels, Slippers</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Men's Shawl</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shorts</Text></View>
            </View>

            {/* Ball Room Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ball Room</Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Dress pants / shirts (with formal shoes) before Lounge suite.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shalwar Kameez with Coat / Blazer or waist coat.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Closed Shoes</Text></View>
              <Text style={styles.sublistItemHeader}>Following are not allowed:-</Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Jeans with T- Shirt</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Track Suits</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shorts</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Back Strap Chapels/ Joggers</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Pointed Higher Heels</Text></View>
            </View>

            {/* Dining Hall Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Dining Hall and Engle Bright Hall <Text style={styles.sectionSubtitle}>(Smart Casual)</Text>
              </Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Dress pant / Shirt. Lounge Suit and Safari Suit.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Smart Casual (Dress or Cotton Pant with T- shirt (Collared).</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shalwar Kameez</Text></View>
              <Text style={styles.sublistItemHeader}>Following are not allowed:-</Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Slippers</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Track Suit</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shorts / Nicker</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Men's Shawl</Text></View>
            </View>

            {/* BBQ Lawn Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                BBQ Lawn <Text style={styles.sectionSubtitle}>(Casual Dress)</Text>
              </Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Shalwar Kameez / Kurta</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Jeans & T- shirts (Round Collar)</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Track Suits</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Sandals, Back Strap Chapels and Joggers</Text></View>
            </View>

            {/* Note Section */}
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>Note</Text>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>All respectable members are requested to cooperate with the club administration.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Members and their guest improperly dressed up would not be entertained.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Members entering the club are expected to wear smart informal dress.</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bullet}>•</Text><Text style={styles.itemText}>Club dress rules are also applicable on guest.</Text></View>
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9EFE6' },

  notch: {
    width: width,
    height: 110,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  notchImage: {
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  notchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'Black' },

  cardsContainer: { paddingHorizontal: 15, marginTop: 15 },
  cardWrapper: {
    height: 110,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: { width: '100%', height: '100%', justifyContent: 'center' },
  cardImageStyle: { borderRadius: 15, resizeMode: 'cover' },
  cardOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  safeArea: { flex: 1 },
  scrollView: { flex: 1, backgroundColor: '#F9EFE6' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 0 },

  dressCodeHeader: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  dressCodeTitle: { fontSize: 13, fontWeight: '700', color: '#000', textAlign: 'center', letterSpacing: 0.5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 12 },
  sectionSubtitle: { fontSize: 13, fontWeight: '400', color: '#333' },
  bulletItem: { flexDirection: 'row', marginBottom: 8, paddingRight: 5 },
  bullet: { fontSize: 14, color: '#000', marginRight: 8, marginTop: 1, fontWeight: '600' },
  itemText: { flex: 1, fontSize: 13, color: '#000', lineHeight: 19 },
  sublistItemHeader: { fontSize: 13, fontWeight: 'bold', color: '#000', marginLeft: 16, marginBottom: 8, marginTop: 4 },
  noteSection: { marginTop: 5, marginBottom: 20 },
  noteTitle: { fontSize: 14, fontWeight: '700', color: '#C9A86A', marginBottom: 12 },
});

export default MessingScreen;
