import { StatusBar } from "expo-status-bar";
import React, { useEffectEvent } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ImageBackground,
  FlatList,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../config";
const database = firebase.database();
const ref_groups = database.ref("Groups");
const ref_all_accounts = database.ref("Accounts");

export default function GroupChat(props) {
  const [input, setinput] = useState("");
  const [username, setusername] = useState("hello");
  const [messages, setmessages] = useState([]);
  const [users, setusers] = useState([])
  const groupId = props.route.params.groupId;
  const groupName = props.route.params.groupName;
  const currentId = props.route.params.currentId;

  const ref_group = ref_groups.child(groupId);
  const ref_messages = ref_group.child("Messages");

  const quitterGroup = () => {

    Alert.alert(
      "Quitter le group",
      "Voulez vous vraiment quitter le groupe",
      [
        {text:"Annuler",style:"cancel"},
        {text:"Quitter",style:"destructive",
          onPress:async()=>
          {
            try {
              await ref_group.child('users').child(currentId).remove();
              

              props.navigation?.navigate("Home",{currentId:currentId})
              
            } catch (error) {
              console.log('erruer de quitter group')
            }
          }
        }
      ]
    )
  };

  const sendMessage = () => {
    const key_message = ref_messages.push().key;
    const ref_message = ref_messages.child(key_message);
    ref_message.set({
      Content: input,
    });
    const sender = ref_message.child("Sender");
    sender.set({
      Id: currentId,
      Nom: username,
    });
  };
  useEffect(() => {
    ref_all_accounts.child(currentId).on("value", (snapshot) => {
      setusername(snapshot.val().Nom);
    });

    ref_group.child("Messages").on("value", (snapshot) => {
      const d = [];
      if (snapshot.exists()) {
        snapshot.forEach((message) => {
          d.push(message.val());
          console.log(message.val());
        });
      }
      setmessages(d);
    });
    ref_group.child("users").on("value",(snapshot)=>
    {
      const d=[]
      snapshot.forEach((user)=>
      {
        d.push(user.val().Nom)
console.log(user.val().Nom)
      })
      setusers(d)
    })

   

    return () => {
      ref_all_accounts.off();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.container}
      imageStyle={{ resizeMode: "cover" }}
    >
      <StatusBar style="auto" />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{groupName}</Text>

          <View style={[styles.topButtons, { justifyContent: "center" }]}>
  <TouchableOpacity
    style={styles.customButton}
    onPress={() => {
      props.navigation.navigate("ListGroupUsers", { groupId: groupId });
    }}
  >
    <Text style={styles.buttonText}>Ajouter quelqun</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.customButton}
    onPress={quitterGroup}
  >
    <Text style={styles.buttonText}>Quitter Groupe</Text>
  </TouchableOpacity>
</View>
<FlatList
  data={users}
  horizontal
  showsHorizontalScrollIndicator={false}
  renderItem={({ item }) => (
    <Text style={styles.usersFlatListText}>{item}, </Text>
  )}
  style={styles.usersFlatList}
/>
 

        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View
                style={{
                  alignSelf:
                    item.Sender.Id === currentId ? "flex-end" : "flex-start",
                  backgroundColor:
                    item.Sender.Id === currentId ? "#AEC16F" : "#fff",
                  padding: 10,
                  borderRadius: 10,
                  marginVertical: 5,
                }}
              >
                {!(item.Sender.Id === currentId) && (
                  <Text style={{ color: "#AEC16F", fontWeight: "bold" }}>
                    {item.Sender.Nom}
                  </Text>
                )}
                <Text
                  style={{
                    color: item.Sender.Id === currentId ? "#fff" : "#000",
                  }}
                >
                  {item.Content}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inputBarWrapper}
        >
          <View style={styles.inputBar}>
            <TextInput
              placeholder="enter a message"
              placeholderTextColor="#9b9b9b"
              style={styles.input}
              onChangeText={(text) => setinput(text)}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f4f7",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    width: "96%",
    borderRadius: 16,
    backgroundColor: "#f3f2d3c2",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
    overflow: "hidden",
  },
  button: {
    width: 500,
  },
  header: {
    marginBottom: 8,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "500",
    fontSize: 22,
    color: "#AEC16F",
  },
  topButtons: {
    flexDirection: "column",
    alignItems: "center",
  },
  buttonWrapper: {
    width: 500,
    borderRadius: 10,
    overflow: "hidden",
  },
  button: {
    width: 500,
  },
  customButton: {
  backgroundColor: "#AEC16F",
  height: 40,                 // hauteur fixe
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,      // largeur flexible selon texte
  marginVertical: 10,       // espace entre les boutons
},
buttonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},
  listContainer: {
    flex: 1,
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  usersFlatList: {
  width: "100%",
  backgroundColor: "#fff",
  padding: 12,
  
  borderWidth: 2,
borderColor:"#fff",
  marginVertical: 10,
},

usersFlatListText: {
  color: "#AEC16F",
  fontSize: 16,
  fontWeight: "bold",
},

  messageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    padding: 10,
    marginVertical: 6,
    borderRadius: 14,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: "#333",
  },

  inputBarWrapper: {
    paddingTop: 6,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#AEC16F",
    paddingHorizontal: 10,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: "#222",
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#AEC16F",
    justifyContent: "center",
    alignItems: "center",
  },
});
//youssef@gmail.com
