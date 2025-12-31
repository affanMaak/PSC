import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
import { View, Button, Alert, LogBox, Image, StyleSheet, Text, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient instance
const queryClient = new QueryClient();

// Import screens
import home from './src/rooms/home';
import start from './slides/start';
import details from './src/rooms/details';
import booking from './src/rooms/booking';
import studio from './src/rooms/studio';
import deluxe from './src/rooms/deluxe';
import suite from './src/rooms/suite';
import about from './slides/about';
import contact from './slides/contact';
import BH from './src/halls/BanquetHallScreen';
import BHBooking from './src/halls/BHBooking';
import shoots from './slides/shoots';
import shootsBooking from './slides/shootsBooking';
import ConferenceRoomBookingScreen from './slides/ConferenceRoomBookingScreen';
import ConferenceRoomDetailsScreen from './slides/ConferenceRoomDetailsScreen';
import BanquetHallDetailsScreen from './slides/BanquetHallDetailsScreen';
import BallRoomDetailsScreen from './slides/BallRoomDetailsScreen';
import EngleBrightHallDetailsScreen from './slides/EngleBrightHallDetailsScreen';
import IrvineHallDetailsScreen from './slides/IrvineHallDetailsScreen';
import VeteransLoungeDetailsScreen from './slides/VeteransLoungeDetailsScreen';
import DiningHallDetailsScreen from './slides/DiningHallDetailsScreen';
import events from './slides/events';
import VerifyScreen from './src/auth/VerifyScreen';
import Announcements from './slides/Announcements';
import SportsScreen from './src/sports/SportsScreen.js';
import SportDetailsScreen from './src/sports/SportDetailsScreen.js';
import ClubArenaScreen from './slides/ClubArenaScreen';
import BillPaymentScreen from './slides/BillPaymentScreen';
import LoginScr from './src/auth/LoginScr';
import HallDetailsScreen from './src/halls/HallDetailsScreen';
import voucher from './src/rooms/voucher';
import Lawn from './src/lawn/Lawn';
import LawnBooking from './src/lawn/LawnBooking';
import LawnListScreen from './src/lawn/LawnListScreen';
import Voucher from './src/lawn/Voucher';
import InvoiceScreen from './src/shoots/InvoiceScreen';
import BookingConfirmation from './src/shoots/BookingConfirmation';
import HallInvoiceScreen from './src/halls/HallInvoiceScreen';
import aff_club from './src/affClub/aff_club';
import calendar from './src/adminOnly/calender';
import Dashboard from './src/adminOnly/Dashboard'; // Import Dashboard
import Aerobics_gym from './slides/Aerobics_gym';
import Badminton from './slides/Badminton';
import Gym_jogging from './slides/Gym_jogging';
import Tennis from './slides/Tennis';
import Squash from './slides/Squash';
import Billiard from './slides/Billiard';
import Messing from './slides/Messing';
import The_Club_Cafe from './slides/The_Club_Cafe';
import Bakistry from './slides/Bakistry';
import BakistryItems from './slides/BakistryItems';
import ClubCafeCart from './slides/ClubCafeCart';
import FoodMenuCart from './slides/FoodMenuCart';
import SplashScreen from './components/SplashScreen';
import VCR from './slides/VCR';
import GTN from './slides/GTN';
import CR from './slides/CR';
import NY from './slides/NY';
import SF from './slides/SF';
import LCM from './slides/LCM';
import SNB from './slides/SNB';
import HiTea from './slides/HiTea';
import Swimming from './slides/Swimming';
import SB from './slides/SB';
import FB from './slides/FB';
import SendNotifications from './src/adminOnly/SendNotifications';
import EventDetails from './src/events/EventDetails';
import ClubRulesScreen from './src/events/ClubRulesScreen';
import MemberBookingsScreen from './src/view/MemberBookingsScreen';
import BookingDetailsScreen from './src/view/BookingDetailsScreen';
import AdminBookingsScreen from './src/view/AdminBookingsScreen';

// ===== Navigation Setup =====
enableScreens();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// ===== Custom Drawer Content Component =====
function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScr' }],
              });
              Alert.alert('Success', 'Logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: '#FEF2E4' }}
    >
      {/* Header with Image */}
      <View style={styles.drawerHeader}>
        <Image
          source={require('./assets/logo.jpeg')}
          style={styles.drawerImage}
          resizeMode="cover"
        />
        <Text style={styles.drawerTitle}>PESHAWAR SERVICES CLUB</Text>
      </View>

      {/* Default Drawer Items */}
      <View style={{ flex: 1, backgroundColor: '#FEF2E4' }}>
        <DrawerItemList {...props} />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Developed and Designed by</Text>
        <Text style={styles.footerTextBold}>CODE CLUB</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.codeclub.tech')}>
          <Text style={[styles.footerTextBold, styles.websiteLink]}>www.codeclub.tech</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

// ===== Member Drawer Navigator =====
function MemberDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 16 },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={start}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="About PSC"
        component={about}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Announcements"
        component={Announcements}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="megaphone-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Affiliated Clubs"
        component={aff_club}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Contact us"
        component={contact}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="call-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Club rules"
        component={ClubRulesScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="My Bookings"
        component={MemberBookingsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Booking Details"
        component={BookingDetailsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="information-circle-outline" size={size} color={color} />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
}

// ===== Admin Drawer Navigator =====
function AdminDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 16 },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={start}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Facility Calendar"
        component={calendar}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="About PSC"
        component={about}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Affiliated Clubs"
        component={aff_club}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Contact us"
        component={contact}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="call-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Announcements"
        component={events}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="megaphone-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Club rules"
        component={ClubRulesScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="My Bookings"
        component={MemberBookingsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Booking Details"
        component={BookingDetailsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="information-circle-outline" size={size} color={color} />
          ),
        }}
      /> */}
      <Drawer.Screen
        name="Booking Management"
        component={AdminBookingsScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// ===== Role-Based Drawer Selector =====
function RoleBasedDrawer() {
  const { user } = useAuth();

  // Check if user is admin (you might have SUPER_ADMIN, ADMIN, etc.)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return isAdmin ? <AdminDrawer /> : <MemberDrawer />;
}

// ===== Main App Component =====
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  // Ignore noisy logs
  useEffect(() => {
    LogBox.ignoreLogs(['Animated node with tag', 'ViewPropTypes']);
  }, []);

  // Handle splash screen finish
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show nothing while checking auth state
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerShown: !['start', 'LoginScr'].includes(route.name),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: 'black',
          },
          headerShadowVisible: false,
          gestureEnabled: false,
          animation: 'none',
          headerTitle: '',
          headerLeft: () =>
            navigation.canGoBack() ? (
              <Button onPress={() => navigation.goBack()} title="Back" color="#007AFF" />
            ) : null,
        })}
        initialRouteName={isAuthenticated ? 'start' : 'LoginScr'}
      >
        {/* Auth Screens */}
        <Stack.Screen name="LoginScr" component={LoginScr} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} />

        {/* Main Drawer Navigation (Role-based) */}
        <Stack.Screen name="start" component={RoleBasedDrawer} options={{ headerShown: false }} />

        {/* Dashboard - accessible as standalone screen */}
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />

        {/* Common screens accessible from anywhere */}
        <Stack.Screen name="home" component={home} options={{ headerShown: false }} />
        <Stack.Screen name="details" component={details} options={{ headerShown: false }} />
        <Stack.Screen name="booking" component={booking} />
        <Stack.Screen name="studio" component={studio} />
        <Stack.Screen name="deluxe" component={deluxe} />
        <Stack.Screen name="suite" component={suite} />
        <Stack.Screen name="BHBooking" component={BHBooking} options={{ headerShown: false }} />
        <Stack.Screen name="shootsBooking" component={shootsBooking} options={{ headerShown: false }} />
        <Stack.Screen name="ConferenceRoomBooking" component={ConferenceRoomBookingScreen} />
        <Stack.Screen name="ConferenceRoomDetailsScreen" component={ConferenceRoomDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BanquetHallDetailsScreen" component={BanquetHallDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BallRoomDetailsScreen" component={BallRoomDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EngleBrightHallDetailsScreen" component={EngleBrightHallDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IrvineHallDetailsScreen" component={IrvineHallDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VeteransLoungeDetailsScreen" component={VeteransLoungeDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DiningHallDetailsScreen" component={DiningHallDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HallDetailsScreen" component={HallDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="voucher" component={voucher} options={{ headerShown: false }} />
        <Stack.Screen name="LawnBooking" component={LawnBooking} options={{ headerShown: false }} />
        <Stack.Screen name="LawnListScreen" component={LawnListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Voucher" component={Voucher} options={{ headerShown: false }} />
        <Stack.Screen name="Lawn" component={Lawn} options={{ headerShown: false }} />
        <Stack.Screen name="BH" component={BH} options={{ headerShown: false }} />
        <Stack.Screen name="about" component={about} options={{ headerShown: false }} />
        <Stack.Screen name="aff_club" component={aff_club} />
        <Stack.Screen name="SportDetailsScreen" component={SportDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Swimming" component={Swimming} options={{ headerShown: false }} />
        <Stack.Screen name="BillPaymentScreen" component={BillPaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ClubArenaScreen" component={ClubArenaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="contact" component={contact} />
        <Stack.Screen name="events" component={events} options={{ headerShown: false }} />
        <Stack.Screen name="shoots" component={shoots} options={{ headerShown: false }} />
        <Stack.Screen name="SportsScreen" component={SportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Aerobics_gym" component={Aerobics_gym} options={{ headerShown: false }} />
        <Stack.Screen name="Badminton" component={Badminton} options={{ headerShown: false }} />
        <Stack.Screen name="Gym_jogging" component={Gym_jogging} options={{ headerShown: false }} />
        <Stack.Screen name="Tennis" component={Tennis} options={{ headerShown: false }} />
        <Stack.Screen name="Squash" component={Squash} options={{ headerShown: false }} />
        <Stack.Screen name="Billiard" component={Billiard} options={{ headerShown: false }} />
        <Stack.Screen name='InvoiceScreen' component={InvoiceScreen} options={{ headerShown: false }} />
        <Stack.Screen name='BookingConfirmation' component={BookingConfirmation} />
        <Stack.Screen name="HallInvoiceScreen" component={HallInvoiceScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Messing" component={Messing} options={{ headerShown: false }} />
        <Stack.Screen name="The_Club_Cafe" component={The_Club_Cafe} options={{ headerShown: false }} />
        <Stack.Screen name="FB" component={FB} options={{ headerShown: false }} />
        <Stack.Screen name="Bakistry" component={Bakistry} options={{ headerShown: false }} />
        <Stack.Screen name="BakistryItems" component={BakistryItems} options={{ headerShown: false }} />
        <Stack.Screen name="ClubCafeCart" component={ClubCafeCart} options={{ headerShown: false }} />
        <Stack.Screen name="FoodMenuCart" component={FoodMenuCart} options={{ headerShown: false }} />
        <Stack.Screen name="VCR" component={VCR} options={{ headerShown: false }} />
        <Stack.Screen name="GTN" component={GTN} options={{ headerShown: false }} />
        <Stack.Screen name="CR" component={CR} options={{ headerShown: false }} />
        <Stack.Screen name="NY" component={NY} options={{ headerShown: false }} />
        <Stack.Screen name="SF" component={SF} options={{ headerShown: false }} />
        <Stack.Screen name="LCM" component={LCM} options={{ headerShown: false }} />
        <Stack.Screen name="SNB" component={SNB} options={{ headerShown: false }} />
        <Stack.Screen name="HiTea" component={HiTea} options={{ headerShown: false }} />
        <Stack.Screen name="SB" component={SB} options={{ headerShown: false }} />
        <Stack.Screen name="SendNotifications" component={SendNotifications} options={{ headerShown: false }} />
        <Stack.Screen name="EventDetails" component={EventDetails} options={{ headerShown: false }} />
        <Stack.Screen name="ClubRulesScreen" component={ClubRulesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MemberBookingsScreen" component={MemberBookingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BookingDetailsScreen" component={BookingDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminBookingsScreen" component={AdminBookingsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ===== Root App Component with AuthProvider and QueryClientProvider =====
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  drawerImage: {
    width: 110,
    height: 110,
    marginBottom: 30,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  logoutContainer: {
    padding: 15,
    backgroundColor: '#FEF2E4',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#FEF2E4',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  footerTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
  },
  websiteLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});