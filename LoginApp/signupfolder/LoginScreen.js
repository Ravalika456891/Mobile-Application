import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import { initDatabase } from "./database";

export default function LoginScreen({ navigation }) {
  const [Mobile, setMobile] = useState("");
  const [password, setpassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // Mobile validation while typing
  const handleMobileChange = (text) => {
    const onlyNumbers = text.replace(/[^0-9]/g, "");
    setMobile(onlyNumbers);
  };
  const handleLogin = async () => {
    // Check empty fields
    if (Mobile.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please fill all the details.");
      return;
    }
    // Mobile validation
    const MobileRegex = /^[0-9]{10}$/;
    if (!MobileRegex.test(Mobile.trim())) {
      Alert.alert(
        "Invalid Mobile",
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }
    // Terms and conditions
    if (!isChecked) {
      Alert.alert(
        "Terms and Conditions",
        "Please accept the Terms and Conditions before logging in."
      );
      return;
    }
    try {
      // Open database
      const database = await initDatabase();
      console.log("database:", database);
      // Find matching user
      const user = await database.getFirstAsync(
        `SELECT * FROM users WHERE MOBILE = ? AND NEWPASSWORD = ?`,
        [Mobile.trim(), password.trim()]
      );
      if (user) {
       // Alert.alert(
         // "Login Successful",
          //`Welcome ${user.NAME}!`
        //);

        //after login clear credentials
        setMobile (" ");
        setpassword  (" ");

        console.log("Logged in user:", user);
        navigation.navigate("Dashboard");
      }
      else {
        Alert.alert(
          "Login Failed",
          "Invalid mobile or password."
        );
      }

    } catch (error) {
      console.log("Login error:", error);
      Alert.alert(
        "Error",
        "Unable to login: " + error.message
      );
    }
  };
  /*const handleLogin = async () => {
  if (Mobile.trim() === "" || password.trim() === "") {
    Alert.alert("Error", "Please enter mobile and password.");
    return;
  }
  try {
    // Open database
    const database = await initDatabase();

    // Find matching user
    const user = await database.getFirstAsync(
      `SELECT * FROM users
       WHERE MOBILE = ? AND NEWPASSWORD = ?`,
      [Mobile.trim(), password]
    );

    if (user) {
      Alert.alert(
        "Login Successful",
        `Welcome ${user.name}!`
      );

      console.log("Logged in user:", user);

      // Later we will navigate to Home Screen
    } else {
      Alert.alert(
        "Login Failed",
        "Invalid email or password."
      );
    }

  } catch (error) {
    console.log("Login error:", error);

    Alert.alert(
      "Error",
      "Unable to login: " + error.message
    );
  }
};*/
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Logo */}
        <View style={styles.logoContainer}>

          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.logo}
          />
          <Text style={styles.title}>
            Ravalika App
          </Text>

        </View>

        {/* Mobile */}
        <TextInput
          placeholder="Mobile"
          value={Mobile}
          onChangeText={handleMobileChange}
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setpassword}
          secureTextEntry={true}
          style={styles.input}
        />

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>

          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
          />

          <Text style={styles.checkboxText}>
            I agree to the terms and conditions
          </Text>

        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign Up */}
        <Text style={styles.bottomText}>
          Don't you have an account?{" "}

          <Text
            style={styles.signUp}
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign Up 
          </Text>

        </Text>

        {/* Social Icons */}
        <View style={styles.socialContainer}>

          <Image
            source={require("../../assets/images/Facebook.png")}
            style={styles.socialIcon}
          />

          <Image
            source={require("../../assets/images/Twitter.png")}
            style={styles.socialIcon}
          />

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#B5DEEC",
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginTop: 10,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#ebe7e7",
    height: 50,
    margin: 15,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#858d8d",
    borderRadius: 12,
    fontSize: 16,
  },

  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: 15,
    marginTop: 10,
  },

  checkboxText: {
    marginLeft: 5,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#00CB50",
    height: 50,
    margin: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  bottomText: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
    color: "#333",
  },

  signUp: {
    color: "blue",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    marginBottom: 20,
    gap: 40,
  },

  socialIcon: {
    width: 30,
    height: 30,
  },
},);
