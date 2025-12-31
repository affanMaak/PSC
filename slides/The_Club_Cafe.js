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
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/AntDesign';
import IconIon from 'react-native-vector-icons/Ionicons';
// ---------------------- MENU DATA ----------------------
const menuData = {
  coffee: [
    { id: 'coffee-1', name: 'Cream Coffee', size: '(Med)', price: 290 },
    { id: 'coffee-2', name: 'Caramel Latte', size: '(Large)', price: 430 },
    { id: 'coffee-3', name: 'Caramel Latte', size: '(Med)', price: 310 },
    { id: 'coffee-4', name: 'Cream Coffee', size: '(Large)', price: 390 },
    { id: 'coffee-5', name: 'Espresso', size: '', price: 120 },
    { id: 'coffee-6', name: 'Cappuccino', size: '', price: 150 },
    { id: 'coffee-7', name: 'Latte', size: '', price: 180 },
    { id: 'coffee-8', name: 'Black Coffee', size: '', price: 80 },
  ],
  icedCoffee: [
    { id: 'icedCoffee-1', name: 'Iced Latte', size: '', price: 200 },
    { id: 'icedCoffee-2', name: 'Iced Mocha', size: '', price: 220 },
    { id: 'icedCoffee-3', name: 'Iced Americano', size: '', price: 180 },
  ],
  coldCoffee: [
    { id: 'coldCoffee-1', name: 'Iced Latte', size: '', price: 200 },
    { id: 'coldCoffee-2', name: 'Cold Brew', size: '', price: 220 },
    { id: 'coldCoffee-3', name: 'Iced Americano', size: '', price: 180 },
    { id: 'coldCoffee-4', name: 'Frappuccino', size: '', price: 250 },
    { id: 'coldCoffee-5', name: 'Iced Caramel', size: '', price: 230 },
  ],
  pizza: [
    { id: 'pizza-1', name: 'Chicken Tikka Pizza', size: '(Small)', price: 500 },
    { id: 'pizza-2', name: 'Chicken Tikka Pizza', size: '(Medium)', price: 800 },
    { id: 'pizza-3', name: 'Chicken Tikka Pizza', size: '(Large)', price: 1200 },
    { id: 'pizza-4', name: 'Fajita Pizza', size: '(Small)', price: 500 },
    { id: 'pizza-5', name: 'Fajita Pizza', size: '(Medium)', price: 800 },
    { id: 'pizza-6', name: 'Fajita Pizza', size: '(Large)', price: 1200 },
    { id: 'pizza-7', name: 'Vegetable Pizza', size: '(Small)', price: 400 },
    { id: 'pizza-8', name: 'Vegetable Pizza', size: '(Medium)', price: 700 },
    { id: 'pizza-9', name: 'Vegetable Pizza', size: '(Large)', price: 1000 },
  ],
  breakfast: [
    { id: 'breakfast-1', name: 'Omelette Plain', size: '', price: 80 },
    { id: 'breakfast-2', name: 'Omelette with Cheese', size: '', price: 100 },
    { id: 'breakfast-3', name: 'Boiled Eggs', size: '(2)', price: 60 },
    { id: 'breakfast-4', name: 'Fried Eggs', size: '(2)', price: 70 },
    { id: 'breakfast-5', name: 'Paratha Plain', size: '', price: 40 },
    { id: 'breakfast-6', name: 'Paratha with Egg', size: '', price: 80 },
    { id: 'breakfast-7', name: 'Halwa Puri', size: '(2 Pcs)', price: 120 },
    { id: 'breakfast-8', name: 'Chanay', size: '', price: 60 },
  ],
  soup: [
    { id: 'soup-1', name: 'Chicken Corn Soup', size: '', price: 150 },
    { id: 'soup-2', name: 'Hot & Sour Soup', size: '', price: 150 },
    { id: 'soup-3', name: 'Chicken Noodle Soup', size: '', price: 150 },
    { id: 'soup-4', name: 'Tom Yum Soup', size: '', price: 180 },
  ],
  chinese: [
    { id: 'chinese-1', name: 'Chicken Chow Mein', size: '', price: 350 },
    { id: 'chinese-2', name: 'Chicken Fried Rice', size: '', price: 350 },
    { id: 'chinese-3', name: 'Chicken Manchurian', size: '', price: 400 },
    { id: 'chinese-4', name: 'Sweet & Sour Chicken', size: '', price: 400 },
    { id: 'chinese-5', name: 'Chicken with Vegetables', size: '', price: 400 },
    { id: 'chinese-6', name: 'Chicken Jalfrezi', size: '', price: 400 },
  ],
  bbq: [
    { id: 'bbq-1', name: 'Seekh Kabab', size: '(6 Pcs)', price: 400 },
    { id: 'bbq-2', name: 'Chicken Tikka', size: '', price: 450 },
    { id: 'bbq-3', name: 'Chicken Malai Boti', size: '', price: 500 },
    { id: 'bbq-4', name: 'Chicken Reshmi Kabab', size: '', price: 500 },
    { id: 'bbq-5', name: 'Mutton Chops', size: '(4 Pcs)', price: 800 },
    { id: 'bbq-6', name: 'Chicken Wings', size: '(6 Pcs)', price: 400 },
    { id: 'bbq-7', name: 'BBQ Platter', size: '', price: 1200 },
  ],
  pakistani: [
    { id: 'pakistani-1', name: 'Chicken Karahi', size: '(Half)', price: 650 },
    { id: 'pakistani-2', name: 'Chicken Karahi', size: '(Full)', price: 1200 },
    { id: 'pakistani-3', name: 'Mutton Karahi', size: '(Half)', price: 900 },
    { id: 'pakistani-4', name: 'Mutton Karahi', size: '(Full)', price: 1600 },
    { id: 'pakistani-5', name: 'Chicken Handi', size: '', price: 600 },
    { id: 'pakistani-6', name: 'Chicken Jalfrezi', size: '', price: 550 },
    { id: 'pakistani-7', name: 'Chicken Tikka Masala', size: '', price: 650 },
    { id: 'pakistani-8', name: 'Butter Chicken', size: '', price: 650 },
    { id: 'pakistani-9', name: 'Chicken Korma', size: '', price: 600 },
    { id: 'pakistani-10', name: 'Nihari', size: '(Beef)', price: 400 },
    { id: 'pakistani-11', name: 'Paya', size: '', price: 350 },
    { id: 'pakistani-12', name: 'Haleem', size: '', price: 300 },
  ],
  fastFood: [
    { id: 'fastFood-1', name: 'Club Sandwich', size: '', price: 350 },
    { id: 'fastFood-2', name: 'Chicken Burger', size: '', price: 300 },
    { id: 'fastFood-3', name: 'Zinger Burger', size: '', price: 350 },
    { id: 'fastFood-4', name: 'Beef Burger', size: '', price: 400 },
    { id: 'fastFood-5', name: 'Chicken Nuggets', size: '(6 Pcs)', price: 300 },
    { id: 'fastFood-6', name: 'French Fries', size: '', price: 150 },
    { id: 'fastFood-7', name: 'Chicken Roll', size: '', price: 250 },
    { id: 'fastFood-8', name: 'Shawarma', size: '', price: 280 },
  ],
  rice: [
    { id: 'rice-1', name: 'Chicken Biryani', size: '', price: 350 },
    { id: 'rice-2', name: 'Mutton Biryani', size: '', price: 500 },
    { id: 'rice-3', name: 'Plain Rice', size: '', price: 100 },
    { id: 'rice-4', name: 'Pulao', size: '', price: 250 },
  ],
  bread: [
    { id: 'bread-1', name: 'Naan', size: '', price: 20 },
    { id: 'bread-2', name: 'Roti', size: '', price: 15 },
    { id: 'bread-3', name: 'Garlic Naan', size: '', price: 40 },
    { id: 'bread-4', name: 'Cheese Naan', size: '', price: 80 },
    { id: 'bread-5', name: 'Kulcha', size: '', price: 50 },
  ],
  beverages: [
    { id: 'beverages-1', name: 'Soft Drinks', size: '', price: 60 },
    { id: 'beverages-2', name: 'Mineral Water', size: '', price: 50 },
    { id: 'beverages-3', name: 'Fresh Juice', size: '', price: 150 },
    { id: 'beverages-4', name: 'Lassi Sweet', size: '', price: 120 },
    { id: 'beverages-5', name: 'Lassi Salty', size: '', price: 120 },
    { id: 'beverages-6', name: 'Lemon Soda', size: '', price: 100 },
  ],
  tea: [
    { id: 'tea-1', name: 'Tea', size: '(Doodh Patti)', price: 50 },
    { id: 'tea-2', name: 'Green Tea', size: '', price: 60 },
    { id: 'tea-3', name: 'Kashmiri Tea', size: '', price: 80 },
    { id: 'tea-4', name: 'Masala Tea', size: '', price: 70 },
  ],
  desserts: [
    { id: 'desserts-1', name: 'Kheer', size: '', price: 150 },
    { id: 'desserts-2', name: 'Gulab Jamun', size: '(2 Pcs)', price: 100 },
    { id: 'desserts-3', name: 'Ras Malai', size: '(2 Pcs)', price: 150 },
    { id: 'desserts-4', name: 'Ice Cream', size: '', price: 120 },
    { id: 'desserts-5', name: 'Fruit Custard', size: '', price: 180 },
  ],
};

// ---------------------- COMPONENT ----------------------
const categoriesOrder = [
  { key: 'coffee', label: 'COFFEE' },
  { key: 'icedCoffee', label: 'ICED COFFEE' },
  { key: 'coldCoffee', label: 'COLD COFFEE' },
  { key: 'pizza', label: 'PIZZA' },
  { key: 'breakfast', label: 'BREAKFAST' },
  { key: 'soup', label: 'SOUP' },
  { key: 'chinese', label: 'CHINESE' },
  { key: 'bbq', label: 'BBQ' },
  { key: 'pakistani', label: 'PAKISTANI' },
  { key: 'fastFood', label: 'FAST FOOD' },
  { key: 'rice', label: 'RICE' },
  { key: 'bread', label: 'BREAD' },
  { key: 'beverages', label: 'BEVERAGES' },
  { key: 'tea', label: 'TEA' },
  { key: 'desserts', label: 'DESSERTS' },
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [cart, setCart] = useState({});

  // Flatten all menu items into a single array for cart reference
  const allMenuItems = Object.values(menuData).flat();

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
    navigation.navigate("ClubCafeCart", {
      cart: cart,
      items: allMenuItems,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ---------- NOTCH (STATIC) ---------- */}
      <ImageBackground
        source={require('../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchRow}>
          {/* Back Button with real icon */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation && navigation.navigate('Messing')}
            activeOpacity={0.7}
          >
            <Icon name="arrowleft" size={32} color="#000" />
          </TouchableOpacity>

          {/* Centered Title */}
          <Text style={styles.titleCentered}>The Club Cafe</Text>
        </View>
      </ImageBackground>


      {/* ---------- STATIC TOP: slider + categories + title ---------- */}
      <View>
        {/* Slider (static) */}
        <View style={styles.sliderContainer}>
          <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
            <Image source={require('../assets/food.jpeg')} style={styles.sliderImage} />
            <Image source={require('../assets/1.jpeg')} style={styles.sliderImage} />
            <Image source={require('../assets/2.jpeg')} style={styles.sliderImage} />
            <Image source={require('../assets/3.jpeg')} style={styles.sliderImage} />
            <Image source={require('../assets/4.jpeg')} style={styles.sliderImage} />
          </Swiper>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.line} />
          <Text style={styles.sectionTitle}>Menu</Text>
          <View style={styles.line} />
        </View>

        {/* Horizontal Categories - static */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {categoriesOrder.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.menuButton, selectedCategory === cat.key && styles.menuButtonActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={[styles.menuButtonText, selectedCategory === cat.key && styles.menuButtonTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Title (static) */}
        <Text style={styles.categoryTitle}>
          {selectedCategory.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}
        </Text>
      </View>

      {/* ---------- SCROLLABLE MENU ITEMS ONLY ---------- */}
      <ScrollView style={styles.itemsScroll} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.menuItemsContainer}>
          {(menuData[selectedCategory] || []).map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemName}>
                  {item.name}{'\n'}
                  <Text style={styles.menuItemSize}>{item.size}</Text>
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemPrice}>Rs.{item.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },

  notch: {
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 110,
    justifyContent: 'center',
  },
  notchImage: {
    resizeMode: 'cover',
  },

  // notchRow holds the centered title and absolute-positioned back button
  notchRow: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // title is absolutely centered (left:0,right:0 ensures true center)
  titleCentered: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    color: '#000',
    fontWeight: '500',
  },

  // back button absolute-left, vertically centered using top: '50%' + translateY
  backBtn: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: [{ translateY: -18 }], // -18 matches half of icon size to align baseline
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Bigger, bold arrow
  backIcon: {
    fontSize: 36,      // larger arrow as requested
    fontWeight: '700', // bold
    color: '#000',
    lineHeight: 36,    // keep it vertically tight
  },

  sliderContainer: {
    height: 200,
    width: '90%',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    paddingHorizontal: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
    marginHorizontal: 15,
    letterSpacing: 2,
  },

  horizontalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0D4C0',
  },
  menuButtonActive: {
    backgroundColor: '#A3834C',
  },
  menuButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  menuButtonTextActive: {
    color: '#FFFFFF',
  },

  categoryTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
    marginVertical: 18,
    letterSpacing: 1,
  },

  itemsScroll: {
    flex: 1,
  },
  menuItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  menuItemLeft: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  menuItemSize: {
    fontSize: 14,
    color: '#666',
    fontWeight: '300',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 12,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#A3834C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
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

export default HomeScreen;
