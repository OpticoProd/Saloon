import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet, View, StatusBar } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeContext } from '../ThemeContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { isDarkMode } = useContext(ThemeContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const [role, setRole] = useState('user');

  useEffect(() => {
    // Staggered animations for a more engaging entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
    checkLoginStatus();
    loadRole();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');
    if (token && user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === 'admin') {
        navigation.replace('AdminDashboard');
      } else if (parsedUser.role === 'superadmin') {
        navigation.replace('SuperAdminDashboard');
      } else {
        navigation.replace('UserDashboard');
      }
    }
  };

  // Load role from storage
  const loadRole = async () => {
    const savedRole = await AsyncStorage.getItem('selectedRole');
    if (savedRole) setRole(savedRole);
  };

  // Save role persistently
  const handleRoleChange = async itemValue => {
    setRole(itemValue);
    await AsyncStorage.setItem('selectedRole', itemValue);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Prevent back navigation
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#f8f9ff' }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        style={[
          styles.innerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <ThemeToggle style={styles.toggle} />

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#333' }]}>
            Sales Rewards Salon
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Welcome to the ultimate salon experience
        </Text>

        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: isDarkMode ? '#333' : '#fff',
              borderColor: isDarkMode ? '#555' : '#ddd',
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerLabel, { color: colors.text }]}>Select Your Role</Text>
          </View>
          <Picker
            selectedValue={role}
            onValueChange={handleRoleChange}
            style={[styles.picker, { color: isDarkMode ? '#FFFFFF' : colors.text }]}
            dropdownIconColor={isDarkMode ? '#FFFFFF' : colors.text}
            itemStyle={{ backgroundColor: isDarkMode ? '#444' : '#f0f0f0' }}
          >
            <Picker.Item label="👤 User" value="user" />
            <Picker.Item label="🛡️ Admin" value="admin" />
            {/* <Picker.Item label="Super Admin" value="superadmin" /> */}
          </Picker>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login', { role })}
          style={[styles.button, { backgroundColor: isDarkMode ? '#2a2a2a' : '#1e3a8a' }]}
          textColor="#FFFFFF"
          uppercase={false}
          contentStyle={styles.buttonContent}
        >
          Login
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Register', { role })}
          style={[styles.button, { backgroundColor: isDarkMode ? '#2a2a2a' : '#7c2d12' }]}
          textColor="#FFFFFF"
          uppercase={false}
          contentStyle={styles.buttonContent}
        >
          Register
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: width,
  },
  toggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  pickerContainer: {
    width: '90%',
    borderRadius: 15,
    marginBottom: 30,
  },
  pickerHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    width: '90%',
    borderRadius: 15,
    marginVertical: 10,
  },
  buttonContent: {
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});
