

import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TextInput,
  Image,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import firebase from "../config";
import { supabase } from "../config";

const database = firebase.database();
const ref_groups = database.ref("Groups");
const ref_all_account = database.ref("Accounts");

export default function CreateGroup(props) {
  const currentId = props.route?.params?.currentId ?? null;
  const [username, setUsername] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
const [GroupImage, setGroupImage] = useState()
  const [groupId, setgroupId] = useState()

  useEffect(() => {
    if (!currentId) {
      setUsername("");
      return;
    }

    const childRef = ref_all_account.child(currentId);
   
    childRef
      .once("value", (snapshot) => {
        const val = snapshot.val();
        if (val && typeof val === "object") setUsername(val.Nom ?? "");
        else setUsername("");
      })
      .catch((e) => {
        console.warn("Erreur lecture account:", e);
        setUsername("");
      });

    
    return () => {
     
      try {
        childRef.off("value");
      } catch (e) {}
    };
  }, [currentId]);
    const pickImage = async () => {
    // No permissions request is necessary for launching the image library.
    // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
    // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
    // so the app users aren't surprised by a system dialog after picking a video.
    // See "Invoke permissions for videos" sub section for more details.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setGroupImage(result.assets[0].uri);
    }
  };
  const uploadimageToSupabase = async (localURL) => {
    const ext = localURL.split(".").pop().toLowerCase();

    const response = await fetch(localURL);
    const blob = await response.blob();
    const arraybuffer = await new Response(blob).arrayBuffer();
    supabase.storage
      .from("images")
      .upload(groupId + "." + ext, arraybuffer, { upsert: true });
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(groupId + "." + ext + "?t=" + Date.now());
    return data.publicUrl;
  };
 

  const handleGroupe = async () => {
    const nameTrim = (groupName || "").trim();
    if (!nameTrim) {
      alert("Donne un nom au groupe.");
      return;
    }
    if (!currentId) {
      alert("Utilisateur non identifié.");
      return;
    }

    setLoading(true);
    const key = ref_groups.push().key;
    setgroupId(key)
    const ref_group = ref_groups.child(key);
    const user_key = currentId;
    const urlimage = await uploadimageToSupabase(GroupImage);
    
    const groupObj = {
      Name: nameTrim,
      Id: key,
      Image:urlimage,
      users: {
        [user_key]: {
          Id: currentId,
          Nom: username || "Utilisateur",
        },
      },
    };

    try {
      await ref_group.set(groupObj); 
      setGroupName("");
      
      props.navigation?.navigate('Home',{currentId:currentId})
    } catch (err) {
      console.error("Erreur création groupe:", err);
      alert("Impossible de créer le groupe, réessaye.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create a New Group</Text>

       <TouchableOpacity onPress={pickImage}>
         <Image
          source={
              GroupImage
                ? { uri: GroupImage }
                : require("../assets/profile.png")
            }
          style={styles.avatar}
          resizeMode="cover"
        />
       </TouchableOpacity>

        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          style={styles.input}
          placeholder="Enter Group Name"
          placeholderTextColor="#9b9b9b"
        />

        <View style={styles.row}>
          <View style={styles.buttonWrapper}>
            <Button
              title={loading ? "Creating..." : "Create"}
              color="#AEC16F"
              onPress={handleGroupe}
              disabled={loading}
            />
          </View>
        </View>
      </View>

      <StatusBar style="auto" />
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f4f7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  card: {
    height: 360,
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
  },
  title: {
    backgroundColor: "transparent",
    fontWeight: "500",
    fontSize: 26,
    color: "#AEC16F",
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: "#ffffffaa",
    backgroundColor: "#ffffff",
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
  },
  row: { flexDirection: "row", marginTop: 10, alignItems: "center" },
  buttonWrapper: {
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
    width: 120,
  },
});
