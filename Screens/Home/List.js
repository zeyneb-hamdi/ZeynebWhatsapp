import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "react-native";
import React from "react";
import firebase from "../../config";
import { Ionicons } from "@expo/vector-icons";
import Chat from "../Chat";
import { Linking } from "react-native";

const database = firebase.database();
const ref_all_account = database.ref().child("Accounts");

export default function List(props) {
  const [data, setdata] = useState([]);
  const [unreadcounts, setunreadcounts] = useState({})
  const currentId = props.route?.params?.currentId;
  const formatLastseen=(timestamp)=>
  {
    if(!timestamp)
      return ""
    const difference=Date.now()-timestamp
    var ch=""
    const minutes=Math.floor(difference/60000)
    const heurs=Math.floor(difference/3600000)
    if(minutes<1) return "à l'instant"
    if(minutes<60) return `il y a ${minutes} min`
    if(heurs<24) return `il y a ${heurs} h`

    return ch
  }
useEffect(() => {
  if (!currentId || data.length === 0) return;

  const ref_all_discussion = database.ref("All_Discussion");

  const listeners = [];

  data.forEach((account) => {
    if (account.Id === currentId) return;

    const disc_Id =
      currentId < account.Id
        ? `${currentId}_${account.Id}`
        : `${account.Id}_${currentId}`;

    const ref_messages = ref_all_discussion.child(disc_Id).child("Messages");


    const listener = ref_messages.on("value", (snapshot) => {
      let count = 0;
      snapshot.forEach((message) => {
        if (message.val().seen === false && message.val().receiver === currentId) {
          count++;
        }
      });
      setunreadcounts((prev) => ({
        ...prev,
        [account.Id]: count,
      }));
    });

   
    listeners.push({ ref: ref_messages, listener });
  });

 
  return () => {
    listeners.forEach(({ ref, listener }) => {
      ref.off("value", listener);
    });
  };
}, [data, currentId]);

  

  useEffect(() => {
    ref_all_account.on("value", (snapshot) => {
      var d = [];
      snapshot.forEach((oneaccount) => {
        d.push(oneaccount.val());
      });
      setdata(d);
    });

    return () => {
      ref_all_account.off();
    };
  }, []);
  //CALL sms chat
  return (
    <ImageBackground
      source={require("../../assets/background2.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>Liste des comptes</Text>

      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Image
                source={
                  item.Image
                    ? { uri: item.Image }
                    : require("../../assets/profile.png")
                }
                style={styles.avatar}
              />
              <View>
                <View style={styles.line}>
                  <View style={{flexDirection:"row"}}>
                    <Text style={styles.name}>{item.Nom}</Text>
                    {
                      unreadcounts[item.Id]>0 &&
                      (
                        <Text style={styles.unreadText}>
                          {unreadcounts[item.Id]}
                        </Text>
                      )
                    }
                  </View>
                  <Text style={styles.pseudo}>
                    {item.status ? "Connecté" : formatLastseen(item.lastseen)}
                  </Text>

                </View>
                <Text style={styles.pseudo}>{item.Pseudo}</Text>
                <Text style={styles.numero}>{item.Numero}</Text>
                <View style={styles.iconRow}>
                  <TouchableOpacity
                    onPress={() => {
                      props.navigation.navigate("Chat", {
                        currentId: currentId,
                        accountId: item.Id,
                        accountName: item.Nom,
                      });
                    }}
                    style={styles.isiconButton}
                  >
                    <Ionicons name="chatbubbles" size={22} color="#AEC16F" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.isiconButton}
                    onPress={() => {
                      const phone = item.Numero;
                      Linking.openURL(`sms:${phone}?body=Bonjour`);
                    }}
                  >
                    <Ionicons name="chatbox" size={22} color="#AEC16F" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.isiconButton}
                    onPress={() => {
                      const phone = item.Numero;
                      Linking.openURL(`tel:${phone}`);
                    }}
                  >
                    <Ionicons name="call" size={22} color="#AEC16F" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  unreadText:
  {
    color:"#fff",
    backgroundColor:"#AEC16F",
    borderRadius:20,
   padding:5,
    marginLeft:10
    
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f2d3ff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },

  avatar: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
line:
{
   flexDirection: "row",
    justifyContent: "space-between",
  
  width:"260"
  
},
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  pseudo: {
    fontSize: 16,
    color: "gray",
  },

  numero: {
    fontSize: 15,
    color: "#555",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
});
