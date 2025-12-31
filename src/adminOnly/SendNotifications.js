import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


export default function SendNotification({ navigation }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendNotification = async () => {
        if (!title.trim() || !message.trim()) return;

        setLoading(true);
        try {
            // Placeholder for notification logic/API call
            Alert.alert(
                'Success',
                'Notification sent successfully to all members',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error('Error sending notification:', error);
            Alert.alert('Error', 'Failed to send notification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar backgroundColor="#fffaf2" barStyle="dark-content" />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Send Notification</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoCard}>
                        <Icon name="info-outline" size={24} color="#A3834C" />
                        <Text style={styles.infoText}>
                            This notification will be sent to all registered members
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notification Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter notification title"
                                placeholderTextColor="#999"
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                            <Text style={styles.charCount}>{title.length}/100</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Message</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter your message here..."
                                placeholderTextColor="#999"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={8}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.charCount}>{message.length}/500</Text>
                        </View>

                        {(title || message) && (
                            <View style={styles.previewCard}>
                                <Text style={styles.previewLabel}>Preview:</Text>
                                <View style={styles.previewContent}>
                                    {title ? <Text style={styles.previewTitle}>{title}</Text> : null}
                                    {message ? <Text style={styles.previewMessage}>{message}</Text> : null}
                                </View>
                            </View>
                        )}


                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!title.trim() || !message.trim() || loading) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSendNotification}
                        disabled={!title.trim() || !message.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Icon name="send" size={20} color="#fff" />
                                <Text style={styles.sendButtonText}>Send Notification</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#A3834C',
    },
    infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#666', lineHeight: 20 },
    form: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    textArea: { height: 150, paddingTop: 12 },
    charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
    previewCard: {
        marginTop: 8,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    previewLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
    previewContent: { padding: 12, backgroundColor: '#fff', borderRadius: 8 },
    previewTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 8 },
    previewMessage: { fontSize: 14, color: '#333', lineHeight: 20 },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#A3834C',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    sendButtonDisabled: { backgroundColor: '#ccc' },
    sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});