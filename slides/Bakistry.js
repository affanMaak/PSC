import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';

const BakistryScreen = ({ navigation }) => {
  const [cart, setCart] = useState({});

  const bakeryItems = [
    { id: 1, name: 'Mini pizza', price: 320 },
    { id: 2, name: 'Burger', price: 390 },
    { id: 3, name: 'Bread large', price: 200 },
    { id: 4, name: 'Brown bread (s)', price: 150 },
    { id: 5, name: 'Chicken sandwich', price: 120 },
    { id: 6, name: 'Club Sandwich', price: 160 },
    { id: 7, name: 'Chicken patties', price: 80 },
    { id: 8, name: 'Chicken samosa', price: 60 },
    { id: 9, name: 'Veg Samosa', price: 25 },
    { id: 10, name: 'Shami', price: 70 },
    { id: 11, name: 'Cheese Roll', price: 120 },
    { id: 12, name: 'Donut', price: 100 },
    { id: 13, name: 'Mix Cookies kg', price: 800 },
    { id: 14, name: 'Cake rusk kg', price: 800 },
    { id: 15, name: 'Banana', price: 380 },
    { id: 16, name: 'Flavoured croisants', price: 100 },
    { id: 17, name: 'pastry', price: 90 },
    { id: 18, name: 'Cream puff', price: 70 },
    { id: 19, name: 'cream cup cake', price: 80 },
    { id: 20, name: 'Lemon tart', price: 90 },
    { id: 21, name: 'Chicken PC', price: 250 },
    { id: 22, name: 'Plain cake', price: 300 },
    { id: 23, name: 'fruits cake', price: 330 },
    { id: 24, name: 'Croissant', price: 70 },
    { id: 25, name: 'walnut browni', price: 180 },
    { id: 26, name: 'plain browni', price: 140 },
    { id: 27, name: 'chocolate cookie 1pc', price: 60 },
    { id: 28, name: 'vanilla cookie 1pc', price: 50 },
    { id: 29, name: 'cinemon roll', price: 70 },
    { id: 30, name: 'caramel cake 1 pound', price: 800 },
    { id: 31, name: 'chip cake 1 pound', price: 850 },
    { id: 32, name: 'dry cake 1 pound', price: 600 },
    { id: 33, name: 'ice cream scoop', price: 80 },
    { id: 34, name: 'Hot coffee', price: 250 },
    { id: 35, name: 'Tea', price: 60 },
  ];

  const addToCart = (item) => {
    setCart((prevCart) => ({
      ...prevCart,
      [item.id]: (prevCart[item.id] || 0) + 1,
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const handleViewCart = () => {
    navigation.navigate("BakistryItems", {
      cart: cart,
      items: bakeryItems,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ---------------- NOTCH AREA ---------------- */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Messing")}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Bakistry</Text>

          <View style={styles.placeholder} />
        </View>
      </ImageBackground>

      {/* ---------------- CONTENT AREA ---------------- */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SLIDER */}
          <View style={styles.sliderContainer}>
            <Swiper
              autoplay
              autoplayTimeout={4}
              loop
              showsPagination
              activeDotColor="#A3834C"
              dotColor="rgba(255,255,255,0.5)"
            >
              <Image
                source={require('../assets/notch.jpg')}
                style={styles.sliderImage}
              />
              <Image
                source={require('../assets/notch.jpg')}
                style={styles.sliderImage}
              />
              <Image
                source={require('../assets/notch.jpg')}
                style={styles.sliderImage}
              />
            </Swiper>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <View style={styles.menuHeader}>
              <View style={styles.line} />
              <Text style={styles.menuText}>Menu</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.categoryTitle}>BAKERY ITEMS</Text>

            {/* Bakery Items List */}
            {bakeryItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rs.{item.price}</Text>
                </View>
              </View>
            ))}

            {/* Bottom spacing for cart button */}
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>


      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E8',
  },
  // Notch Styles
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
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
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  // Content Styles
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Slider Styles
  sliderContainer: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Menu Section
  menuSection: {
    paddingHorizontal: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3834C',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Item Card Styles
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5E9D8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A3834C',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A3834C',
  },
  // Cart Button Styles
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#A3834C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  cartButton: {
    width: '100%',
  },
  cartContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCounter: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cartCounterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A3834C',
  },
  cartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 10,
  },
});

export default BakistryScreen;