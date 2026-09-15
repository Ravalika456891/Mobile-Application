import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  ImageBackground,
  Button,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";

import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
//import db from "./database";
import { initDatabase } from "./database";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [emailid, setemailid] = useState("");
  //const [password, setpassword]=useState("");
  //const [isChecked, setIsChecked] = useState(false);//
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState("");
  const [Mobile, setMobile] = useState("");
  const [AlternatePhoneNumber, setAlternatePhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [bloodgroup, setbloodgroup] = useState("");
  const [address, setaddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //const db = getDatabase();
  const handleSignUp = async () => {
    console.log("🔥 CREATE ACCOUNT BUTTON PRESSED");
    // 1. Empty field validation
    if (
      name.trim() === "" ||
      Mobile.trim() === "" ||
      AlternatePhoneNumber.trim() === "" ||
      emailid.trim() === "" ||
      age.trim() === "" ||
      gender.trim() === "" ||
      bloodgroup.trim() === "" ||
      address.trim() === "" ||
      newPassword.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      Alert.alert("Error", "Please fill all the details.");
      return;
    }
    // 2. Name validation
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name.trim())) {
      Alert.alert(
        "Invalid Name",
        "Name should contain only letters and spaces.",
      );
      return;
    }
    // 3. Age validation
    const ageRegex = /^[0-9]+$/;
    if (!ageRegex.test(age.trim())) {
      Alert.alert("Invalid Age", "Age should contain only numbers.");
      return;
    }
    // 4. Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(Mobile.trim())) {
      Alert.alert(
        "Invalid Mobile",
        "Mobile number must contain exactly 10 digits.",
      );
      return;
    }
    // 5. Alternate mobile validation
    const alternatePhoneRegex = /^[0-9]{10}$/;
    if (!alternatePhoneRegex.test(AlternatePhoneNumber.trim())) {
      Alert.alert(
        "Invalid Alternate Number",
        "Alternate phone number must contain exactly 10 digits.",
      );
      return;
    }
    // 6. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailid.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email.");
      return;
    }
    // 7. Address validation
    const addressRegex = /^[A-Za-z0-9\s,#./-]{5,}$/;
    if (!addressRegex.test(address.trim())) {
      Alert.alert("Invalid Address", "Please enter a valid address.");
      return;
    }
    // 8. Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword.trim())) {
      Alert.alert(
        "Invalid Password",
        "Password must contain at least 8 characters, one letter and one number.",
      );
      return;
    }
    // 9. Confirm password
    if (newPassword.trim() !== confirmPassword.trim()) {
      Alert.alert(
        "Password Error",
        "Password and Confirm Password should match.",
      );
      return;
    }
    // 10. Insert into SQLite
    try {
      console.log("Opening database...");
      const database = await initDatabase();
      console.log("Database opened");
      await database.runAsync(
        `INSERT INTO users
  (NAME, AGE, MOBILE, GENDER, BLOODGROUP, ADDRESS, ALTERNATEPHONE,EMAIL, NEWPASSWORD, CONFIRMEDPWD)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          age.trim(),
          Mobile.trim(),
          gender.trim(),
          bloodgroup.trim(),
          address.trim(),
          AlternatePhoneNumber.trim(),
          emailid.trim(),
          newPassword.trim(),
          confirmPassword.trim()
        ],
      );

      console.log("✅ User inserted successfully");

      Alert.alert("Success", "User registered successfully!");
    } catch (error) {
      console.log("❌ Insert error:", error);

      Alert.alert("Error", "Could not register user: " + error.message);
    }
  };
  const handleNameChange = (text) => {
    const filteredText = text.replace(/[^a-zA-Z\s]/g, "");
    setName(filteredText);
  };
  const handleAgeChange = (text) => {
    const onlyNumbers = text.replace(/[^0-9]/g, "");
    setAge(onlyNumbers);
  };
  const handleMobileChange = (text) => {
    const onlyNumbers = text.replace(/[^0-9]/g, "");
    setMobile(onlyNumbers);
  };
  const handleAlternatePhoneNumber = (text) => {
    const onlyNumbers = text.replace(/[^0-9]/g, "");
    setAlternatePhoneNumber(onlyNumbers);
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#B5DEEC",
      }}
    >
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={{ width: 100, height: 100 }}
          />
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={handleNameChange}
            keyboardType="default"
            style={styles.input}
          />
          <TextInput
            placeholder="age"
            value={age}
            onChangeText={handleAgeChange}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Mobile"
            value={Mobile}
            onChangeText={handleMobileChange}
            keyboardType="numeric"
            style={styles.input}
            maxLength={10}
          />
          <TextInput
            placeholder="AlternatePhoneNumber"
            value={AlternatePhoneNumber}
            onChangeText={handleAlternatePhoneNumber}
            keyboardType="numeric"
            style={styles.input}
            maxLength={10}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bloodgroup}
              onValueChange={(itemValue) => setbloodgroup(itemValue)}
            >
              <Picker.Item label="Select bloodgroup" value="" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
            </Picker>
          </View>
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setaddress}
            keyboardType="default"
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={emailid}
            onChangeText={setemailid}
            keyboardType="email-address"
            style={styles.input}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showNewPassword ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}> Create Account </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#094e6e",
    padding: 20,
  },
  nameInput: {
    marginTop: 25,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: "contain",
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#ebe7e7",
    height: 50,
    marginBottom: 15,
    width: "90%",
    borderWidth: 1.5,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#858d8d", // Blue border
    borderRadius: 12,
    fontSize: 16,
    alignSelf: "center",
  },
  pickerContainer: {
    width: "90%",
    height: 55,
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  button: {
    width: "90%",
    height: 55,
    backgroundColor: "#00CB50",
    borderRadius: 12,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  passwordContainer: {
    width: "90%",
    height: 62,
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  passwordInput: {
    flex: 1,
    height: 58,
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  eyeIcon: {
    width: 80,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
