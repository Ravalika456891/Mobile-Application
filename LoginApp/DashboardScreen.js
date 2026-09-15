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
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  return (
    <SafeAreaView style={style.container}>
      <View>
        <Text style = {style.title}>Dashboard</Text>
        <Text style={style.text}>
              Login Successful
        </Text>
      </View>
    </SafeAreaView>
  )
    
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems:"center",
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
    },
    text :{
      fontSize: 18,
      marginTop:10, 
    },
},);