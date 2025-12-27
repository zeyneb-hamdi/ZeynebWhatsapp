import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ImageBackground,
} from "react-native";
import { useState } from "react";
import firebase from "../config";
const auth = firebase.auth();
const database = firebase.database();
const ref_all_accounts = database.ref("Accounts");

export default function Auth(props) {
  const [email, setemail] = useState();
  const [pwd, setpwd] = useState();
  const [userStatus, setuserStatus] = useState(false);
  const [currentId, setcurrentId] = useState();
 

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.container}
    >
      <View
        style={{
          height: 320,
          width: "95%",
          borderRadius: 16,
          backgroundColor: "#f3f2d3c2",
          alignItems: "center",
          padding: 20,

          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 8,
        }}
      >
        <Text
          style={{
            backgroundColor: "transparent",
            fontWeight: "500",
            fontSize: 26,
            color: "#AEC16F",
            marginBottom: 12,
          }}
        >
          Welcome
        </Text>

        <TextInput
          keyboardType="email-address"
          onChangeText={(text) => {
            setemail(text);
          }}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9b9b9b"
        />
        <TextInput
          onChangeText={(text) => {
            setpwd(text);
          }}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9b9b9b"
          secureTextEntry
        />

        <View
          style={{
            flexDirection: "row",
            // Android ne supporte pas "gap" donc on fait margin horizontale aux boutons
            marginTop: 20,
          }}
        >
          <View style={styles.buttonWrapper}>
            <Button
              onPress={() => {
                alert("sign in email: " + email + " : " + pwd);
                auth
                  .signInWithEmailAndPassword(email, pwd)
                  .then(() => {
                    const uid = auth.currentUser.uid;
                    props.navigation.replace("Home", {
                      currentId: uid,
                    });
                    const ref_account = ref_all_accounts.child(uid);
                    ref_account.child("status").set(true);
                    ref_account.child("lastseen").set(Date.now())
                  })
                  .catch((error) => {
                    alert(error);
                  });
              }}
              title="Submit"
              color="#AEC16F"
            ></Button>
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Exit" color="#AEC16F"></Button>
          </View>
        </View>

        <Text
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: 14,
            color: "#6e6e73",
            marginTop: 14,
            textDecorationLine: "underline",
          }}
          onPress={() => props.navigation?.navigate("CreateUser")}
        >
          Create new Account
        </Text>
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // fond léger, harmonie Pinterest (pastel/dégradé simulé)
    backgroundColor: "#f6f4f7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  input: {
    height: 50,
    width: "95%",
    borderRadius: 30,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderWidth: 2,

    borderColor: "#AEC16F",
    fontSize: 16,
    // petite ombre interne visuelle (seulement pour iOS via elevation-like)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonWrapper: {
    // espace entre boutons
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden", // pour arrondir le bouton natif sur Android
    width: 120,
  },
});
