import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../config";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Alert, Image, Linking } from "react-native";
import { Video } from "expo-video";
import { supabase } from "../config";
import EmojiSelector from 'react-native-emoji-selector';


const database = firebase.database();
const ref_all_discussion = database.ref("All_Discussion");


export default function Chat(props) {
  const [data, setdata] = useState([]);
  const [Messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const accountId = props.route.params.accountId;
  const currentId = props.route.params.currentId;
  const accountName = props.route.params.accountName;
  const disc_Id =
    currentId < accountId
      ? `${currentId}_${accountId}`
      : `${accountId}_${currentId}`;
  const ref_disc_ = ref_all_discussion.child(disc_Id);
  const ref_messages = ref_disc_.child("Messages");

  const ref_sec_istyping = ref_disc_.child(accountId + " istyping");
  const [input, setinput] = useState("");
  const [ref_secon_istyping, setref_secon_istyping] = useState(false);




 

 const pickAndSendFile = async () => {
  try {
    
    const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    console.log("DocumentPicker result:", res);

    if (res.type === "cancel" || res.type === "dismiss") return;

    
    const asset = res.assets ? res.assets[0] : res;
    const uri = asset.uri || asset.fileUri || asset.contentUri;
    const name = asset.name || `file_${Date.now()}`;

    if (!uri) {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer le fichier sélectionné (URI manquante)."
      );
      return;
    }

   
    const ext = name.split(".").pop()?.toLowerCase() || "";
    let mimeType = "application/octet-stream";
    if (ext === "pdf") mimeType = "application/pdf";
    else if (["jpg", "jpeg", "png", "gif"].includes(ext))
      mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
    else if (["mp4", "mov", "mkv", "webm"].includes(ext)) {
      mimeType = ext === "mov" ? "video/quicktime" : "video/mp4";
    }

    
    const keymsg = ref_messages.push().key;
    if (!keymsg) throw new Error("Impossible de générer la clé du message");
    const filePath = `${disc_Id}/${keymsg}_${name}`;

    
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

   
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, arrayBuffer, { contentType: mimeType });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      Alert.alert("Erreur", "Impossible d'uploader le fichier sur Supabase.");
      return;
    }

   
    const { publicURL } = supabase.storage.from("files").getPublicUrl(filePath);

    // Créer le message dans Firebase
    ref_messages.child(keymsg).set({
      idmsg: keymsg,
      sender: currentId || "unknown",
      receiver: accountId || "unknown",
      message: "",
      filePath: filePath || "",
      fileName: name || "",
      fileType: mimeType || "application/octet-stream",
      fileUrl: publicURL || "",
      timestamp: Date.now(),
      seen:false,
      seenAt:null
    });

    console.log("Fichier envoyé avec succès :", name);
  } catch (error) {
    console.error("Erreur pick/send file:", error);
    Alert.alert("Erreur", "Erreur lors du partage du fichier.");
  }
};
useEffect(() => {
  if (data.length === 0) return;

  const markAsSeen=()=>
  {
    ref_messages.once("value",(snapshot)=>
    {
      snapshot.forEach((message)=>
      {
        if(message.val().receiver===currentId && message.val().seen===false)
        {
          ref_messages.child(message.key).update(
            {
              seen:true,
              seenAt:Date.now()
            }
          )
        }
      })
    })
  }
  
markAsSeen();
 
}, [data])



  useEffect(() => {
    const handleSnapshot = async (snapshot) => {
      const d = [];
      snapshot.forEach((message) => {
        d.push(message.val());
      });

     
      const enriched = d.map((m) => {
  if (m && m.filePath) {
    const { data } = supabase.storage.from("files").getPublicUrl(m.filePath);
    return { ...m, fileUrl: data?.publicUrl || null };
  }
  return m;
});

      setdata(enriched);
    };

    
    ref_messages.on("value", handleSnapshot);


    ref_sec_istyping.on("value", (snapshot) => {
      setref_secon_istyping(snapshot.val());
    });

    return () => {
      
      try {
        ref_messages.off("value", handleSnapshot);
      } catch (e) {
        ref_messages.off();
      }
      ref_sec_istyping.off();
    };
   
  }, []);

  const sendMessage = () => {
    {
      if (input.trim().length > 0) {
        const keymsg = ref_messages.push().key;
        const ref_un_msg = ref_messages.child(keymsg);
        ref_un_msg.set({
          idmsg: keymsg,
          sender: currentId,
          receiver: accountId,
          message: input,
          seen:false,
          seenAt:null
        });
        setinput(""); 
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background3.jpg")}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{accountName} </Text>

        {ref_secon_istyping && <Text>is typing...</Text>}
        <View style={styles.headerIcons}>
          <Ionicons
            name="chatbubbles"
            size={26}
            color="#AEC16F"
            style={styles.icon}
          />
          <Ionicons name="call" size={26} color="#AEC16F" style={styles.icon} />
        </View>
      </View>

      
      <View style={styles.messagesContainer}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.idmsg}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf:
                  item.sender === currentId ? "flex-end" : "flex-start",
                backgroundColor: item.sender === currentId ? "#AEC16F" : "#fff",
                padding: 10,
                borderRadius: 10,
                marginVertical: 5,
                flexDirection:'row'
              }}
            >
              {item.fileUrl ? (
                item.fileType && item.fileType.startsWith("image") ? (
                  <Image
                    source={{ uri: item.fileUrl }}
                    style={{ width: 200, height: 120, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : item.fileType && item.fileType.startsWith("video") ? (
                  <Video
                    source={{ uri: item.fileUrl }}
                    style={{ width: 250, height: 150 }}
                    useNativeControls
                    resizeMode="cover"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.fileUrl)}
                  >
                    <Text
                      style={{
                        color: item.sender === currentId ? "#fff" : "#000",
                        textDecorationLine: "underline",
                      }}
                    >
                      {item.fileName || "Fichier"}
                    </Text>
                  </TouchableOpacity>
                )
              ) : (
                <Text
                  style={{ color: item.sender === currentId ? "#fff" : "#000" }}
                >
                  {item.message}
                </Text>
              )}
              {item.sender===currentId &&
              (
                <TouchableOpacity
                 style={{ alignSelf: "flex-end", marginTop: 4 }}
                 onPress={()=>
                 {
                  if(item.seenAt)
                  {
                    Alert.alert(
                      "Message vu",
                      `Vu à ${new Date(item.seenAt).toLocaleString()}`
                    )
                  }
                  else
                  {
                    Alert.alert(
                      "Message non vu"
                    )
                  }
                 }
                 }
                >
                  <Ionicons
                  name="checkmark-done"
                  size={18}
                  color={item.seen?"#000":"#fff"}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
          inverted={false}
        />
      </View>

      {/* BARRE D'ENVOI */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickAndSendFile}>
          <Ionicons name="link" size={26} color="#AEC16F" />
        </TouchableOpacity>

        <TextInput
          value={input}
          onFocus={() => {
            const ref_me_typing = ref_disc_.child(currentId + " istyping");
            ref_me_typing.set(true);
          }}
          onBlur={() => {
            const ref_me_typing = ref_disc_.child(currentId + " istyping");
            ref_me_typing.set(false);
          }}
          onChangeText={(text) => {
            setinput(text);
          }}
          placeholder="Type a message..."
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <TouchableOpacity  onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Ionicons name="happy" size={26} color="#AEC16F"  />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
  {showEmojiPicker && (
  <View style={{ height: 250 }}>
    <EmojiSelector
      onEmojiSelected={emoji => {
        setinput(prev => prev + emoji);
        setShowEmojiPicker(false);
      }}
      showSearchBar={false} // optionnel
      columns={8}           // comme tu avais
    />
  </View>
)}



    </ImageBackground>
  );
}
//zayneb@gmail.com

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  /** HEADER **/
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 22,
    color: "#AEC16F",
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 15,
  },

  /** LISTE MESSAGES **/
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 10,
  },

  /** INPUT BAR **/
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    color: "#000",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#AEC16F",
    padding: 3,
    borderRadius: 50,
    marginLeft: 8,
  },
});
//youssef@gmail.com
