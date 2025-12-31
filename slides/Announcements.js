import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const announcements = [
  { id: "1", date: "2025-09-24", title: "Welcome" },
  { id: "2", date: "2024-08-12", title: "Welcome to the App" },
];

export default function AnnouncementsScreen({ navigation }) {
  const handleRefresh = () => {
    console.log("Refreshing announcements...");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <ImageBackground
        source={require("../assets/notch.jpg")}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcements</Text>
        </View>
      </ImageBackground>

      {/* Announcements List */}
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      />

      {/* Floating Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshIcon}>↻</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF5EE",
  },
  header: {
    width: "100%",
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    justifyContent: "center", // vertically centered
  },
  headerImage: {
    resizeMode: "cover",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // centers the title horizontally
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#F6EFE9",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    color: "#7B7B7B",
    fontSize: 14,
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
  refreshButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#F8CF93",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  refreshIcon: {
    fontSize: 26,
    color: "#000",
  },
});
