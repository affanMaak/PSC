import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Import your actual API
import { getDashboardStats, checkAuthStatus } from '../../config/apis';

// Mock data for testing
const getMockDashboardStats = async () => {
  console.log('Using MOCK data for testing');
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    totalMembers: 1542,
    activeMembers: 1280,
    deactivatedMembers: 210,
    blockedMembers: 52,
    upcomingBookings: {
      room: 12,
      hall: 5,
      lawn: 3,
      photoshoot: 8,
    },
    paymentsUnpaid: 45,
    paymentsHalfPaid: 18,
    paymentsPaid: 850,
    monthlyTrend: [
      { month: 'Jan', bookings: 10, revenue: 50000 },
      { month: 'Feb', bookings: 15, revenue: 75000 },
      { month: 'Mar', bookings: 12, revenue: 60000 },
      { month: 'Apr', bookings: 20, revenue: 100000 },
    ],
  };
};

const Header = ({ authStatus, handleRetry, shouldUseMock, onToggleMock }) => {
  const adminName = authStatus?.userData?.name || 'Admin';

  return (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={require('../../assets/notch.jpg')}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <SafeAreaView style={styles.notchSafeArea}>
          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View>
                <Text style={styles.greetingText}>Welcome back,</Text>
                <Text style={styles.adminNameText}>{adminName}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleRetry} style={styles.iconButton}>
                  <Icon name="refresh-cw" size={20} color="#334155" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onToggleMock} style={styles.iconButton}>
                  <Icon name="more-vertical" size={20} color="#334155" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerStatusRow}>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: authStatus?.isAuthenticated ? '#10B981' : '#F59E0B' }]} />
                <Text style={styles.statusText}>
                  {authStatus?.isAuthenticated ? 'Systems Online' : 'Reviewing Offline'}
                </Text>
              </View>
              {shouldUseMock && (
                <View style={styles.mockBadge}>
                  <Text style={styles.mockBadgeText}>DEMO MODE</Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const StatCard = ({ title, value, iconName, color, subValue, type = 'grid' }) => {
  const isLarge = type === 'large';

  return (
    <View style={[
      styles.card,
      isLarge ? styles.largeCard : styles.gridCard,
      { borderLeftColor: color, borderLeftWidth: 4 }
    ]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon name={iconName} size={isLarge ? 24 : 18} color={color} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardValue}>{value}</Text>
        {subValue && (
          <View style={styles.subValueContainer}>
            <Icon name="trending-up" size={12} color="#10B981" />
            <Text style={styles.subValueText}>{subValue}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {/* <TouchableOpacity style={styles.seeAllButton}>
      <Text style={styles.seeAllText}>See All</Text>
      <Icon name="chevron-right" size={14} color="#64748B" />
    </TouchableOpacity> */}
  </View>
);

export default function Dashboard() {
  const navigation = useNavigation();
  const [useMock, setUseMock] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const status = await checkAuthStatus();
    setAuthStatus(status);
  };

  const shouldUseMock = useMock || !authStatus?.isAuthenticated;

  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['dashboardStats', shouldUseMock],
    queryFn: shouldUseMock ? getMockDashboardStats : getDashboardStats,
    retry: 1,
    onError: (error) => {
      if (error.message.includes('Not authenticated') || error.message.includes('401')) {
        Alert.alert(
          'Authentication Required',
          'You need to login to view dashboard data.',
          [{ text: 'Cancel', style: 'cancel' }, { text: 'Login', onPress: () => navigation.navigate('Login') }]
        );
      }
    }
  });

  const handleRetry = async () => {
    await checkAuth();
    refetch();
  };

  const toggleMockData = () => {
    setUseMock(!useMock);
    Alert.alert('Data Source Changed', `Now using ${!useMock ? 'MOCK' : 'REAL API'} data`);
  };

  if (isLoading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Fetching intelligence...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
      <Header
        authStatus={authStatus}
        handleRetry={handleRetry}
        shouldUseMock={shouldUseMock}
        onToggleMock={toggleMockData}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRetry}
            tintColor="#3B82F6"
          />
        }
      >
        {/* At a Glance */}
        <View style={styles.section}>
          <StatCard
            title="Total Club Members"
            value={stats?.totalMembers || 0}
            iconName="users"
            color="#3B82F6"
            subValue="+12% this month"
            type="large"
          />
        </View>

        {/* Member Breakdown */}
        <View style={styles.section}>
          <SectionHeader title="Member Breakdown" subtitle="Detailed membership status" />
          <View style={styles.grid}>
            <StatCard
              title="Active"
              value={stats?.activeMembers || 0}
              iconName="user-check"
              color="#10B981"
            />
            <StatCard
              title="Deactivated"
              value={stats?.deactivatedMembers || 0}
              iconName="user-x"
              color="#F59E0B"
            />
            <StatCard
              title="Blocked"
              value={stats?.blockedMembers || 0}
              iconName="slash"
              color="#EF4444"
            />
            <StatCard
              title="New Requests"
              value="8"
              iconName="grid"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Bookings */}
        <View style={styles.section}>
          <SectionHeader title="Live Bookings" subtitle="Current and upcoming scheduled events" />
          <View style={styles.bookingGrid}>
            <View style={styles.bookingCard}>
              <View style={[styles.bookingIcon, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="home" size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.bookingLabel}>Rooms</Text>
              <Text style={styles.bookingValue}>{stats?.upcomingBookings?.room || 0}</Text>
            </View>
            <View style={styles.bookingCard}>
              <View style={[styles.bookingIcon, { backgroundColor: '#F0FDF4' }]}>
                <Icon name="package" size={20} color="#22C55E" />
              </View>
              <Text style={styles.bookingLabel}>Halls</Text>
              <Text style={styles.bookingValue}>{stats?.upcomingBookings?.hall || 0}</Text>
            </View>
            <View style={styles.bookingCard}>
              <View style={[styles.bookingIcon, { backgroundColor: '#FFFBEB' }]}>
                <Icon name="sun" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.bookingLabel}>Lawn</Text>
              <Text style={styles.bookingValue}>{stats?.upcomingBookings?.lawn || 0}</Text>
            </View>
            <View style={styles.bookingCard}>
              <View style={[styles.bookingIcon, { backgroundColor: '#FAF5FF' }]}>
                <Icon name="camera" size={20} color="#A855F7" />
              </View>
              <Text style={styles.bookingLabel}>Shoots</Text>
              <Text style={styles.bookingValue}>{stats?.upcomingBookings?.photoshoot || 0}</Text>
            </View>
          </View>
        </View>

        {/* Payments */}
        <View style={styles.section}>
          <SectionHeader title="Financial Status" subtitle="Overview of pending and completed payments" />
          <View style={styles.paymentSection}>
            <View style={styles.paymentRow}>
              <View style={styles.paymentInfo}>
                <View style={[styles.paymentStatusDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.paymentLabel}>Unpaid</Text>
              </View>
              <Text style={styles.paymentCount}>{stats?.paymentsUnpaid || 0} Cases</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.paymentInfo}>
                <View style={[styles.paymentStatusDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.paymentLabel}>Partial Payment</Text>
              </View>
              <Text style={styles.paymentCount}>{stats?.paymentsHalfPaid || 0} Cases</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.paymentInfo}>
                <View style={[styles.paymentStatusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.paymentLabel}>Full Payment</Text>
              </View>
              <Text style={styles.paymentCount}>{stats?.paymentsPaid || 0} Cases</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last Synchronized: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  headerContainer: {
    paddingBottom: 0,
  },
  notch: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomEndRadius: 40,
    borderBottomStartRadius: 40,
    overflow: 'hidden',
  },
  notchImage: {
    resizeMode: 'cover',
  },
  notchSafeArea: {
    paddingHorizontal: 24,
  },
  headerContent: {
    marginTop: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 14,
    // color: '#64748B',
    fontFamily: 'System',
  },
  adminNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    // color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  mockBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  seeAllText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  largeCard: {
    width: '100%',
    padding: 20,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  subValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    bottom: 4,
  },
  subValueText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    width: (SCREEN_WIDTH - 64) / 4,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  bookingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  bookingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  paymentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  paymentCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
