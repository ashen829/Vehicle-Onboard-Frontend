import { View, Text, Pressable, StyleSheet, ImageBackground } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import 'react-native-gesture-handler';
import 'react-native-reanimated';


const Home = () => {
  const router = useRouter();

  const handleSearch = () => {
    router.push('/(tabs)/search');
  };

  const handleOnboard = () => {
    router.push('/(tabs)/addVehicle');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/homepage-background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to ROFI</Text>
        <Text style={styles.subtitle}>Quickly search or onboard your vehicle with ease</Text>

        <View style={styles.spacer} />

        <Pressable style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>🔍 Search Vehicles</Text>
        </Pressable>

        <View style={styles.spacerSmall} />

        <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleOnboard}>
          <Text style={styles.buttonText}>🚗 Onboard Vehicle</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: 260,
    alignItems: 'center',
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  spacerSmall: {
    height: 15,
  },
});
