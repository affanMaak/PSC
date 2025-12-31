import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    ImageBackground,
    StatusBar
} from 'react-native';
import { getRules } from '../../config/apis';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HtmlRenderer from './HtmlRenderer';

const ClubRulesScreen = ({ navigation }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchRules = async () => {
        try {
            setError(null);
            const data = await getRules();
            // Filter to show only active rules
            const activeRules = Array.isArray(data) ? data.filter(rule => rule.isActive === true) : [];
            setRules(activeRules);
        } catch (err) {
            setError(err.message || 'Failed to fetch rules');
            console.error('Fetch rules error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRules();
    }, []);

    const renderRuleItem = ({ item, index }) => (
        <View style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
                <View style={styles.ruleNumberContainer}>
                    <Text style={styles.ruleNumber}>{index + 1}</Text>
                </View>
                <View style={styles.ruleStatusContainer}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: item.isActive ? '#2ECC71' : '#E74C3C' }
                    ]} />
                    <Text style={styles.statusText}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>

            {/* Use HtmlRenderer for HTML content */}
            <View style={styles.htmlContainer}>
                <HtmlRenderer
                    htmlContent={item.content}
                    textStyle={styles.htmlText}
                />
            </View>

            <View style={styles.ruleFooter}>
                <Text style={styles.ruleDate}>
                    Updated: {new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#A3834C" />
                <Text style={styles.loadingText}>Loading rules...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="error-outline" size={60} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchRules}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 🔹 Notch Header */}
            <ImageBackground
                source={require('../../assets/notch.jpg')}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchContent}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={28} color="#000" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.headerText}>Club Rules</Text>
                </View>
            </ImageBackground>

            <FlatList
                data={rules}
                renderItem={renderRuleItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#A3834C']}
                        tintColor="#A3834C"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="rule" size={80} color="#DDD" />
                        <Text style={styles.emptyTitle}>No rules available</Text>
                        <Text style={styles.emptySubtitle}>
                            Club rules will be displayed here once added
                        </Text>
                    </View>
                }
                ListHeaderComponent={
                    rules.length > 0 && (
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderText}>
                                Important: Please read all rules carefully to ensure a pleasant experience for everyone.
                            </Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    /* -------------------- NOTCH HEADER -------------------- */
    notch: {
        height: 120,
        paddingTop: 50,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        marginBottom: 37,
    },
    headerText: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 40,
        marginRight: 40, // Offset for back button to center text
    },

    /* -------------------- LIST CONTENT -------------------- */
    listContainer: {
        padding: 15,
        paddingBottom: 30,
    },
    listHeader: {
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FFC107',
    },
    listHeaderText: {
        fontSize: 14,
        color: '#856404',
        fontWeight: '500',
        lineHeight: 20,
    },
    ruleCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ruleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    ruleNumberContainer: {
        backgroundColor: '#A3834C',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ruleNumber: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ruleStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    htmlContainer: {
        marginBottom: 15,
    },
    htmlText: {
        color: '#333',
        fontSize: 16,
        lineHeight: 24,
    },
    ruleFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 10,
    },
    ruleDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#E74C3C',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: '#A3834C',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyTitle: {
        fontSize: 18,
        color: '#AAA',
        marginTop: 10,
        marginBottom: 5,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#BBB',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default ClubRulesScreen;