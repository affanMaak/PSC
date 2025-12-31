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
  TouchableOpacity
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';

// Complete Menu Data - Exact from PDF
const menuData = {
  appetizers: [
    { id: '1', name: 'Crostini Blue Chicken', size: '', price: 525, description: 'Crispy bread topped with blue chicken' },
    { id: '2', name: 'Roll Paratha', size: '', price: 250, description: 'Traditional rolled paratha' },
    { id: '3', name: 'Fried Wings with Bar B Q Sauce', size: '', price: 595, description: 'Crispy wings with BBQ sauce' },
    { id: '4', name: 'Chicken Strips', size: '', price: 410, description: 'Crispy chicken strips' },
    { id: '5', name: 'Cheese Naan', size: '', price: 160, description: 'Naan stuffed with cheese' },
    { id: '6', name: 'Chicken Cheese Naan', size: '', price: 210, description: 'Naan stuffed with chicken and cheese' },
    { id: '7', name: 'Chicken Pakora', size: '', price: 580, description: 'Deep fried chicken fritters' },
    { id: '8', name: 'Mix Veg Pakora', size: '', price: 180, description: 'Mixed vegetable fritters' },
    { id: '9', name: 'Mini Veg Samosa', size: '', price: 120, description: 'Mini vegetable samosas' },
    { id: '10', name: 'Veg Spring Roll', size: '', price: 125, description: 'Vegetable spring rolls' },
    { id: '11', name: 'Chicken Spring Roll', size: '', price: 150, description: 'Chicken filled spring rolls' },
  ],

  soups: [
    { id: '1', name: 'Cream of Mushroom Soup with Chicken', size: '(Single)', price: 235, description: 'Creamy mushroom soup with chicken' },
    { id: '2', name: 'Cream of Mushroom Soup with Chicken', size: '(Family Bowl 4x)', price: 685, description: 'Family size mushroom soup' },
    { id: '3', name: 'Club Special Soup', size: '(Family Bowl)', price: 770, description: 'Special house soup family size' },
    { id: '4', name: 'Chicken Thai Soup', size: '(Single)', price: 225, description: 'Thai style chicken soup' },
    { id: '5', name: 'Tomato Soup', size: '(Single)', price: 225, description: 'Classic tomato soup' },
    { id: '6', name: 'Chicken Corn Soup', size: '(Family Bowl)', price: 570, description: 'Chicken and corn soup family size' },
    { id: '7', name: 'Club Special Soup', size: '(Single)', price: 260, description: 'Special house soup' },
    { id: '8', name: 'Chicken Corn Soup', size: '(Single)', price: 220, description: 'Chicken and corn soup' },
    { id: '9', name: 'Chicken Hot & Sour Soup', size: '(Single)', price: 220, description: 'Spicy and tangy chicken soup' },
    { id: '10', name: 'Hot & Sour Soup', size: '(Single)', price: 165, description: 'Spicy and tangy soup' },
    { id: '11', name: 'Chicken Corn Soup', size: '(Single)', price: 165, description: 'Chicken and corn soup' },
    { id: '12', name: 'Club Special Soup', size: '(Family Bowl)', price: 640, description: 'Special house soup family size' },
    { id: '13', name: 'Hot & Sour Soup', size: '(Family Bowl)', price: 570, description: 'Spicy soup family size' },
    { id: '14', name: 'Club Special Soup', size: '(Single)', price: 185, description: 'Special house soup' },
  ],

  snacks: [
    { id: '1', name: 'Burger', size: '', price: 495, description: 'Classic burger' },
    { id: '2', name: 'Chicken Cheese Burger', size: '', price: 505, description: 'Chicken burger with cheese' },
    { id: '3', name: 'Shami Kabab', size: '(4 Pieces)', price: 225, description: 'Traditional shami kabab' },
    { id: '4', name: 'Short Lunch', size: '', price: 570, description: 'Quick lunch combo' },
    { id: '5', name: 'BBQ Wings', size: '', price: 495, description: 'BBQ flavored wings' },
    { id: '6', name: 'Nachos', size: '', price: 510, description: 'Crispy nachos' },
    { id: '7', name: 'French Fries', size: '', price: 150, description: 'Crispy french fries' },
    { id: '8', name: 'Chicken Sandwich', size: '', price: 300, description: 'Chicken sandwich' },
    { id: '9', name: 'Fried Finger Fish', size: '', price: 820, description: 'Fried fish fingers' },
    { id: '10', name: 'Fish & Chips', size: '', price: 655, description: 'Fish with chips' },
    { id: '11', name: 'Finger Fish with Fries', size: '', price: 720, description: 'Fish fingers with fries' },
  ],

  bbqcorner: [
    { id: '1', name: 'Chicken Boti (Boneless)', size: '(Full - 8 Pcs)', price: 795, description: 'Boneless chicken boti' },
    { id: '2', name: 'Chicken Boti (Boneless)', size: '(Half - 4 Pcs)', price: 410, description: 'Boneless chicken boti' },
    { id: '3', name: 'Beef Kabab', size: '(Full - 8 Pcs)', price: 820, description: 'Grilled beef kabab' },
    { id: '4', name: 'Beef Kabab', size: '(Half - 4 Pcs)', price: 425, description: 'Grilled beef kabab' },
    { id: '5', name: 'Chicken Malai Boti', size: '(Full - 8 Pcs)', price: 820, description: 'Creamy chicken boti' },
    { id: '6', name: 'Chicken Malai Boti', size: '(Half - 4 Pcs)', price: 425, description: 'Creamy chicken boti' },
    { id: '7', name: 'Mutton Seekh Kabab', size: '(Full - 8 Pcs)', price: 900, description: 'Mutton seekh kabab' },
    { id: '8', name: 'Mutton Seekh Kabab', size: '(Half - 4 Pcs)', price: 470, description: 'Mutton seekh kabab' },
    { id: '9', name: 'Mutton Chops', size: '(Full - 8 Pcs)', price: 1200, description: 'Grilled mutton chops' },
    { id: '10', name: 'Mutton Chops', size: '(Half - 4 Pcs)', price: 620, description: 'Grilled mutton chops' },
    { id: '11', name: 'Beef Bihari Boti', size: '(Full - 8 Pcs)', price: 870, description: 'Bihari style beef boti' },
    { id: '12', name: 'Beef Bihari Boti', size: '(Half - 4 Pcs)', price: 450, description: 'Bihari style beef boti' },
    { id: '13', name: 'Mix Grill', size: '(Full - 8 Pcs)', price: 1350, description: 'Mixed grilled platter' },
    { id: '14', name: 'Mix Grill', size: '(Half - 4 Pcs)', price: 695, description: 'Mixed grilled platter' },
    { id: '15', name: 'Chicken Tikka', size: '(Quarter Leg/Chest)', price: 350, description: 'Grilled chicken tikka' },
    { id: '16', name: 'Chicken Piece', size: '(Full)', price: 670, description: 'Full chicken piece' },
  ],

  continental: [
    { id: '1', name: 'Beef Chili Dry', size: '', price: 900, description: 'Dry beef chili' },
    { id: '2', name: 'Chicken Chili Dry', size: '', price: 800, description: 'Dry chicken chili' },
    { id: '3', name: 'Beef Masala Handi', size: '', price: 1200, description: 'Beef in masala gravy' },
    { id: '4', name: 'Chicken Masala Handi', size: '', price: 1000, description: 'Chicken in masala gravy' },
    { id: '5', name: 'Beef Steak', size: '', price: 1100, description: 'Grilled beef steak' },
    { id: '6', name: 'Chicken Steak', size: '', price: 950, description: 'Grilled chicken steak' },
    { id: '7', name: 'Chicken Fajita with Fried Rice', size: '', price: 700, description: 'Chicken fajita with rice' },
    { id: '8', name: 'Chicken Fajita', size: '', price: 600, description: 'Chicken fajita' },
    { id: '9', name: 'Chicken Shashlik', size: '', price: 720, description: 'Chicken shashlik' },
    { id: '10', name: 'Chicken Jalfrezi', size: '', price: 750, description: 'Chicken jalfrezi' },
  ],

  italian: [
    { id: '1', name: 'Fettuccine Alfredo Pasta', size: '', price: 620, description: 'Creamy alfredo pasta' },
    { id: '2', name: 'Club Special Pasta', size: '', price: 670, description: 'Special house pasta' },
    { id: '3', name: 'Chicken Lasagna', size: '', price: 650, description: 'Layered chicken lasagna' },
    { id: '4', name: 'Chicken Macaroni', size: '', price: 500, description: 'Chicken macaroni' },
    { id: '5', name: 'Cheese Pizza', size: '', price: 670, description: 'Classic cheese pizza' },
    { id: '6', name: 'Chicken Fajita Pizza', size: '', price: 720, description: 'Chicken fajita pizza' },
    { id: '7', name: 'Club Special Pizza', size: '', price: 800, description: 'Special house pizza' },
  ],

  chinese: [
    { id: '1', name: 'Chicken Manchurian', size: '', price: 750, description: 'Chicken in manchurian sauce' },
    { id: '2', name: 'Chicken in Oyster Sauce', size: '', price: 780, description: 'Chicken in oyster sauce' },
    { id: '3', name: 'Sweet and Sour Chicken', size: '', price: 750, description: 'Sweet and sour chicken' },
    { id: '4', name: 'Chicken Shashlik', size: '', price: 720, description: 'Chicken shashlik' },
    { id: '5', name: 'Chicken Vegetable', size: '', price: 650, description: 'Chicken with vegetables' },
    { id: '6', name: 'Chicken with Mushroom', size: '', price: 780, description: 'Chicken with mushroom' },
    { id: '7', name: 'Club Special Chowmein', size: '', price: 700, description: 'Special house chowmein' },
    { id: '8', name: 'Chicken Chowmein', size: '', price: 600, description: 'Chicken chowmein' },
    { id: '9', name: 'Veg Chowmein', size: '', price: 520, description: 'Vegetable chowmein' },
    { id: '10', name: 'Egg Fried Rice', size: '', price: 450, description: 'Fried rice with egg' },
    { id: '11', name: 'Chicken Fried Rice', size: '', price: 550, description: 'Chicken fried rice' },
    { id: '12', name: 'Prawn Fried Rice', size: '', price: 650, description: 'Prawn fried rice' },
  ],

  pakistani: [
    { id: '1', name: 'Chicken White Karahi', size: '(Full)', price: 1500, description: 'White chicken karahi' },
    { id: '2', name: 'Chicken White Karahi', size: '(Half)', price: 800, description: 'White chicken karahi' },
    { id: '3', name: 'Mutton White Karahi', size: '(Full)', price: 2500, description: 'White mutton karahi' },
    { id: '4', name: 'Mutton White Karahi', size: '(Half)', price: 1300, description: 'White mutton karahi' },
    { id: '5', name: 'Mutton Achari Karahi', size: '(Full)', price: 2500, description: 'Achari mutton karahi' },
    { id: '6', name: 'Mutton Achari Karahi', size: '(Half)', price: 1300, description: 'Achari mutton karahi' },
    { id: '7', name: 'Chicken Boneless Handi', size: '(Full)', price: 1800, description: 'Boneless chicken handi' },
    { id: '8', name: 'Chicken Boneless Handi', size: '(Half)', price: 950, description: 'Boneless chicken handi' },
    { id: '9', name: 'Daal Mash', size: '(Full)', price: 700, description: 'Lentil curry' },
    { id: '10', name: 'Daal Mash', size: '(Half)', price: 380, description: 'Lentil curry' },
    { id: '11', name: 'Chicken Biryani', size: '(Single)', price: 550, description: 'Aromatic chicken biryani' },
    { id: '12', name: 'Mutton Biryani', size: '(Single)', price: 700, description: 'Aromatic mutton biryani' },
    { id: '13', name: 'Chicken Qorma', size: '(Single)', price: 550, description: 'Chicken qorma' },
    { id: '14', name: 'Mutton Qorma', size: '(Single)', price: 700, description: 'Mutton qorma' },
  ],

  saladbar: [
    { id: '1', name: 'Fresh Salad', size: '', price: 150, description: 'Fresh garden salad' },
    { id: '2', name: 'Raita', size: '', price: 120, description: 'Yogurt raita' },
    { id: '3', name: 'Fruit Chat', size: '', price: 280, description: 'Mixed fruit chat' },
    { id: '4', name: 'Russian Salad', size: '', price: 300, description: 'Russian salad' },
    { id: '5', name: 'Cream Salad', size: '', price: 350, description: 'Creamy salad' },
  ],

  desserts: [
    { id: '1', name: 'Lab-e-Shireen', size: '', price: 220, description: 'Traditional sweet dessert' },
    { id: '2', name: 'Kheer', size: '', price: 200, description: 'Rice pudding' },
    { id: '3', name: 'Kulfa Falooda', size: '', price: 320, description: 'Kulfi with falooda' },
    { id: '4', name: 'Gulab Jamun', size: '(2 Pcs)', price: 160, description: 'Sweet gulab jamun' },
    { id: '5', name: 'Ice Cream', size: '(2 Scoops)', price: 200, description: 'Ice cream scoops' },
  ],

  bakery: [
    { id: '1', name: 'Plain Cake', size: '', price: 300, description: 'Plain vanilla cake' },
    { id: '2', name: 'Cup Cakes', size: '(2 Pcs)', price: 150, description: 'Mini cupcakes' },
    { id: '3', name: 'Danish', size: '', price: 150, description: 'Danish pastry' },
    { id: '4', name: 'Croissant', size: '', price: 150, description: 'Buttery croissant' },
    { id: '5', name: 'Muffins', size: '', price: 150, description: 'Fresh muffins' },
    { id: '6', name: 'Pizza Bread', size: '', price: 180, description: 'Pizza bread' },
    { id: '7', name: 'Sandwich Bread', size: '', price: 150, description: 'Sandwich bread' },
    { id: '8', name: 'Rusk', size: '(Half Kg)', price: 350, description: 'Crunchy rusk' },
    { id: '9', name: 'Sweet Biscuits', size: '', price: 100, description: 'Sweet biscuits' },
  ],

  beverages: [
    { id: '1', name: 'Mineral Water', size: '(Small)', price: 100, description: 'Bottled water' },
    { id: '2', name: 'Mineral Water', size: '(Large)', price: 150, description: 'Bottled water' },
    { id: '3', name: 'Soft Drinks', size: '(Small)', price: 120, description: 'Carbonated drinks' },
    { id: '4', name: 'Soft Drinks', size: '(Large)', price: 180, description: 'Carbonated drinks' },
    { id: '5', name: 'Tea', size: '', price: 100, description: 'Hot tea' },
    { id: '6', name: 'Green Tea', size: '', price: 120, description: 'Green tea' },
    { id: '7', name: 'Black Coffee', size: '', price: 180, description: 'Black coffee' },
    { id: '8', name: 'Milk Coffee', size: '', price: 220, description: 'Coffee with milk' },
    { id: '9', name: 'Hot Chocolate', size: '', price: 250, description: 'Hot chocolate' },
    { id: '10', name: 'Cappuccino', size: '', price: 250, description: 'Cappuccino' },
    { id: '11', name: 'Espresso', size: '', price: 220, description: 'Espresso shot' },
  ],

  coldmargarita: [
    { id: '1', name: 'Pina Colada', size: '', price: 320, description: 'Pineapple coconut drink' },
    { id: '2', name: 'BMW 4', size: '', price: 275, description: 'Special house drink' },
    { id: '3', name: 'Captain Blood', size: '', price: 275, description: 'Fruity mocktail' },
    { id: '4', name: 'Blue Lady', size: '', price: 280, description: 'Blue mocktail' },
    { id: '5', name: 'Virgin Mojito', size: '', price: 280, description: 'Mint mojito' },
    { id: '6', name: 'Mint Margarita', size: '', price: 280, description: 'Mint margarita' },
    { id: '7', name: 'Club Special Margarita', size: '', price: 280, description: 'Special margarita' },
  ],

  cocktailbar: [
    { id: '1', name: 'Virgin Mojito', size: '', price: 320, description: 'Fresh mint mojito' },
    { id: '2', name: 'BMW 4', size: '', price: 275, description: 'Special mocktail' },
    { id: '3', name: 'Captain Blood', size: '', price: 275, description: 'Fruity blend' },
    { id: '4', name: 'Blue Lady', size: '', price: 280, description: 'Blue mocktail' },
    { id: '5', name: 'Pina Colada', size: '', price: 320, description: 'Creamy tropical drink' },
  ],

  smoothies: [
    { id: '1', name: 'Strawberry Smoothie', size: '', price: 275, description: 'Fresh strawberry smoothie' },
    { id: '2', name: 'Mango Smoothie', size: '', price: 275, description: 'Thick mango smoothie' },
    { id: '3', name: 'Chocolate Banana Smoothie', size: '', price: 280, description: 'Chocolate banana blend' },
    { id: '4', name: 'Peanut Butter Smoothie', size: '', price: 300, description: 'Peanut butter smoothie' },
  ],

  seasonalfreshjuice: [
    { id: '1', name: 'Orange Juice', size: '', price: 295, description: 'Fresh orange juice' },
    { id: '2', name: 'Apple Juice', size: '', price: 295, description: 'Fresh apple juice' },
    { id: '3', name: 'Carrot Juice', size: '', price: 295, description: 'Fresh carrot juice' },
    { id: '4', name: 'Peach Juice', size: '', price: 295, description: 'Fresh peach juice' },
    { id: '5', name: 'Strawberry Juice', size: '', price: 295, description: 'Fresh strawberry juice' },
    { id: '6', name: 'Mango Juice', size: '', price: 295, description: 'Fresh mango juice' },
  ],

  pastries: [
    { id: '1', name: 'Chocolate Pastry', size: '', price: 120, description: 'Chocolate pastry' },
    { id: '2', name: 'Strawberry Pastry', size: '', price: 120, description: 'Strawberry pastry' },
    { id: '3', name: 'Pineapple Pastry', size: '', price: 120, description: 'Pineapple pastry' },
    { id: '4', name: 'Fudge Pastry', size: '', price: 150, description: 'Fudge pastry' },
  ],

  cakes: [
    { id: '1', name: 'Black Forest Cherry Cake', size: '', price: 1350, description: 'Chocolate cake with cherries' },
    { id: '2', name: 'Pineapple Cake', size: '', price: 1420, description: 'Fresh pineapple cake' },
    { id: '3', name: 'Almond Cake', size: '', price: 1100, description: 'Almond flavored cake' },
    { id: '4', name: 'Chocolate Mousse Cake', size: '', price: 1350, description: 'Rich chocolate mousse' },
    { id: '5', name: 'Seasonal Fresh Strawberry Cake', size: '', price: 1280, description: 'Fresh strawberry cake' },
    { id: '6', name: 'Chocolate Cherry Layer Cake', size: '', price: 1520, description: 'Layered chocolate cherry' },
    { id: '7', name: 'Mango Cheese Cake', size: '', price: 1520, description: 'Mango cheesecake' },
    { id: '8', name: 'Strawberry Cheese Cake', size: '', price: 1520, description: 'Strawberry cheesecake' },
    { id: '9', name: 'Seasonal Fresh Mango Cake', size: '', price: 1280, description: 'Fresh mango cake' },
    { id: '10', name: 'Chocolate Chip Cake', size: '', price: 1370, description: 'Chocolate chip cake' },
    { id: '11', name: 'Chocolate Fudge Cake', size: '', price: 1350, description: 'Fudge chocolate cake' },
    { id: '12', name: 'Chocolate Cream Cake', size: '', price: 1280, description: 'Creamy chocolate cake' },
  ],

  frozenitems: [
    { id: '1', name: 'Chicken Spring Roll', size: '(Half Dozen)', price: 520, description: 'Frozen chicken spring rolls' },
    { id: '2', name: 'Chicken Samosa', size: '(Half Dozen)', price: 485, description: 'Frozen chicken samosas' },
    { id: '3', name: 'Beef Shami Kabab', size: '(Half Dozen)', price: 545, description: 'Frozen beef shami kabab' },
    { id: '4', name: 'Patato Samosa', size: '(Half Dozen)', price: 225, description: 'Frozen potato samosas' },
  ],
};

const FoodMenuScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('appetizers');
  const [cart, setCart] = useState({});

  // Flatten all menu items into a single array for cart reference
  const allMenuItems = Object.entries(menuData).flatMap(([category, items]) =>
    items.map(item => ({ ...item, id: `${category}-${item.id}` }))
  );

  const addToCart = (item, category) => {
    const uniqueId = `${category}-${item.id}`;
    setCart((prevCart) => ({
      ...prevCart,
      [uniqueId]: (prevCart[uniqueId] || 0) + 1,
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const handleViewCart = () => {
    navigation.navigate("FoodMenuCart", {
      cart: cart,
      items: allMenuItems,
    });
  };

  const categories = [
    { key: 'appetizers', label: 'APPETIZERS' },
    { key: 'soups', label: 'SOUPS' },
    { key: 'snacks', label: 'SNACKS' },
    { key: 'bbqcorner', label: 'BBQ CORNER' },
    { key: 'continental', label: 'CONTINENTAL' },
    { key: 'italian', label: 'ITALIAN' },
    { key: 'chinese', label: 'CHINESE' },
    { key: 'pakistani', label: 'PAKISTANI' },
    { key: 'saladbar', label: 'SALAD BAR' },
    { key: 'desserts', label: 'DESSERTS' },
    { key: 'bakery', label: 'BAKERY' },
    { key: 'beverages', label: 'BEVERAGES' },
    { key: 'coldmargarita', label: 'MARGARITA' },
    { key: 'cocktailbar', label: 'MOCKTAILS' },
    { key: 'smoothies', label: 'SMOOTHIES' },
    { key: 'seasonalfreshjuice', label: 'FRESH JUICE' },
    { key: 'pastries', label: 'PASTRIES' },
    { key: 'cakes', label: 'CAKES' },
    { key: 'frozenitems', label: 'FROZEN' },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* Notch Header */}
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
            <Text style={styles.ctext}>Food Menu</Text>
            <TouchableOpacity
              style={styles.bellIcon}
              activeOpacity={0.7}
            >
              <Icon name="notifications-outline" size={26} color="#000" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Image Slider */}
          <View style={styles.sliderContainer}>
            <Swiper
              autoplay
              autoplayTimeout={4}
              loop
              showsPagination
              activeDotColor="#A3834C"
            >
              <Image source={require('../assets/notch.jpg')} style={styles.sliderImage} />
              <Image source={require('../assets/notch.jpg')} style={styles.sliderImage} />
              <Image source={require('../assets/notch.jpg')} style={styles.sliderImage} />
            </Swiper>
          </View>

          {/* Menu Section Title */}
          <View style={styles.sectionHeader}>
            <View style={styles.line} />
            <Text style={styles.sectionTitle}>Menu</Text>
            <View style={styles.line} />
          </View>

          {/* Horizontal Menu Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[styles.menuButton, selectedCategory === category.key && styles.menuButtonActive]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text style={[styles.menuButtonText, selectedCategory === category.key && styles.menuButtonTextActive]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Title */}
          <Text style={styles.categoryTitle}>
            {categories.find(cat => cat.key === selectedCategory)?.label || selectedCategory.toUpperCase()}
          </Text>

          {/* Menu Items List */}
          <View style={styles.menuItemsContainer}>
            {menuData[selectedCategory].map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemName}>
                    {item.name} {item.size}
                  </Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  <Text style={styles.menuItemPrice}>Rs.{item.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>


      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  notch: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 140,
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
  },
  ctext: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  bellIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sliderContainer: {
    height: 200,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
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
    marginVertical: 20,
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
    paddingVertical: 10,
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
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
    fontSize: 28,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
    marginVertical: 25,
    letterSpacing: 1,
  },
  menuItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  menuItemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  menuItemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 15,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  cartIcon: {
    fontSize: 24,
  },
});

export default FoodMenuScreen;