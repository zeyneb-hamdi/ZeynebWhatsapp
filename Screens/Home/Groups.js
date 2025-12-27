import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";

const database = firebase.database();
const ref_groups = database.ref("Groups");

export default function Groups(props) {
  const currentId = props.route.params.currentId;
  const [data, setData] = useState([]);

  useEffect(() => {
    
    const d = [];
    ref_groups.on("value", (snapshot) => {
      
      d.length = 0;
      snapshot.forEach((group) => {
        if (group.child("users").val()[[currentId]])
          d.push({ key: group.key, ...group.val() });
      });
      setData(d);
    });

    return () => ref_groups.off();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.container}
    >
      <StatusBar style="auto" />

      {/* ---- BOUTON CREATE GROUP ---- */}
      <View style={styles.topButtonWrapper}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            props.navigation?.navigate("CreateGroup", { currentId: currentId })
          }
        >
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      </View>

      {/* ---- CARTE LISTE ---- */}
      <View style={styles.card}>
        <Text style={styles.title}>Liste des groupes</Text>

        <FlatList
          data={data}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.groupItem}
              onPress={() =>
                props.navigation?.navigate("GroupChat", {
                  groupId: item.key,
                  groupName: item.Name,
                  currentId: currentId,
                })
              }
            >
              <Image
                source={
                  item.Image
                    ? { uri: item.Image }
                    : require("../../assets/profile.png")
                }
                style={styles.groupImage} // <-- appliquer le style ici
              />
              <Text style={styles.groupName}>{item.Name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#f6f4f7",
  },

  topButtonWrapper: {
    width: "95%",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  createButton: {
    backgroundColor: "#AEC16F",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  card: {
    width: "95%",
    height: "80%",
    backgroundColor: "#f3f2d3c2",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },

  title: {
    fontSize: 24,
    color: "#AEC16F",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
groupItem: {
  flexDirection: "row",   // image à gauche, texte à droite
  alignItems: "center",   // centre verticalement image et texte
  backgroundColor: "#ffffff",
  padding: 14,
  borderRadius: 12,
  marginVertical: 6,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 3,
},
groupImage: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 12,   // espace entre l'image et le texte
  resizeMode: "cover",
},
  groupName: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
});
