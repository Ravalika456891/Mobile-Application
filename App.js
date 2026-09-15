import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./LoginApp/signupfolder/LoginScreen";
import SignUpScreen from "./LoginApp/signupfolder/SignUpScreen";
import DashboardScreen from "./LoginApp/DashboardScreen";
const Stack = createNativeStackNavigator();
/*import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("RavalikaApp.db");
db.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT ,
    email TEXT NOT NULL UNIQUE,
    newpwd TEXT NOT NULL,
    confirmpwd TEXT NOT NULL
  );
`);*/
import React, { useEffect } from "react";
import { initDatabase } from "./LoginApp/signupfolder/database";

export default function App() {
  useEffect(() => {
    const setupdatabase = async () => {
      try {
        await initDatabase();
        //console.log("🚀 App database initialized successfully");
      } catch (error) {
        //console.error("❌ Failed to initialize app database:", error);
      }
    };

    setupdatabase();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
        />
        <Stack.Screen
          name = "Dashboard"
          component={DashboardScreen}
          />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
