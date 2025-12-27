import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { TouchableOpacity } from "react-native";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Image,
  ImageBackground,
} from "react-native";
import { supabase } from "../../config";
import { useState } from "react";
import { useEffect } from "react";
import React from "react";
import firebase from "../../config";
import { Alert } from "react-native";

const database = firebase.database();

const auth = firebase.auth();
const ref_all_account = database.ref().child("Accounts");

export default function Account(props) {
  const currentId = props.route.params.currentId;
  const ref_account = ref_all_account.child(currentId);
  const user = auth.currentUser;

  const [Nom, setNom] = useState("");
  const [Pseudo, setPseudo] = useState("Anonyme");
  const [Email, setEmail] = useState("");
  const [Numero, setNumero] = useState();
  const [UserImage, setUserImage] = useState();
  const [showpassword, setshowpassword] = useState(false);
  const [password, setpassword] = useState("");
  useEffect(() => {
    ref_account.once("value").then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        setNom(data.Nom ?? "");
        setPseudo(data.Pseudo ?? "Anonyme");
        setEmail(data.Email ?? "");
        setNumero(data.Numero ?? "");
        setUserImage(data.UserImage ?? null);
      }
    });
  }, []);
  const reauthenticate = async () => {
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    await user.reauthenticateWithCredential(credential);
  };
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
      setUserImage(result.assets[0].uri);
    }
  };
  const uploadimageToSupabase = async (localURL) => {
    const ext = localURL.split(".").pop().toLowerCase();

    const response = await fetch(localURL);
    const blob = await response.blob();
    const arraybuffer = await new Response(blob).arrayBuffer();
    supabase.storage
      .from("images")
      .upload(currentId + "." + ext, arraybuffer, { upsert: true });
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(currentId + "." + ext + "?t=" + Date.now());
    return data.publicUrl;
  };

  const deleteUserAccount = async () => {
    if(!password)
    {
      alert("Veillez entrer votre mot de password");
      return
    }
    try {
      await reauthenticate()
      await ref_account.remove();

      if (UserImage) {
        const ext = UserImage.split(".").pop().toLowerCase();
        await supabase.storage.from("images").remove([currentId + "." + ext]);
      }

      await user.delete();

      alert("Compte supprimé avec succès !");
      props.navigation.replace("Auth");
    } catch (error) {
      console.log("Erreur suppression:", error);

      if (error.code === "auth/requires-recent-login") {
        alert("Veuillez vous reconnecter pour pouvoir supprimer votre compte.");
        props.navigation.replace("Auth");
      } else {
        alert("Impossible de supprimer le compte : " + error.message);
      }
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background2.jpg")}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Photo de profil */}
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              UserImage
                ? { uri: UserImage }
                : require("../../assets/profile.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <Text style={styles.title}>My Account</Text>

        {/* Champs modifiables */}
        <TextInput
          onChangeText={(text) => {
            setNom(text);
          }}
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9b9b9b"
          value={Nom}
        />
        <TextInput
          onChangeText={(text) => {
            setPseudo(text);
          }}
          style={styles.input}
          placeholder="Pseudo"
          placeholderTextColor="#9b9b9b"
          value={Pseudo}
        />

        <TextInput
          onChangeText={(text) => {
            setEmail(text);
          }}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9b9b9b"
          value={Email}
        />

        <TextInput
          onChangeText={(text) => {
            setNumero(text);
          }}
          style={styles.input}
          placeholder="Numero"
          placeholderTextColor="#9b9b9b"
          value={Numero}
        />
        {showpassword && (
          <TextInput
            style={styles.input}
            placeholder="Mot de Passe"
            placeholderTextColor="#9b9b9b"
            onChangeText={(text) => setpassword(text)}
          />
        )}

        {/* Bouton Save */}
        <View style={styles.buttonWrapper}>
          <View>
            <Button
              title="Save"
              color="#AEC16F"
              onPress={async () => {
                const urlimage = await uploadimageToSupabase(UserImage);
                ref_account.set({
                  Id: currentId,
                  Nom,
                  Pseudo,
                  Email,
                  Numero,
                  Image: urlimage,
                });
                alert("account updated successfully");
              }}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Deconnecter"
              color="#AEC16F"
              onPress={async () => {
                try {
                  ref_account.child("status").set(false);
                  ref_account.child("lastseen").set(Date.now());
                  await auth.signOut();
                  
                  alert("Déconnecté !");
                  props.navigation.replace("Auth");
                } catch (e) {
                  console.log("Erreur signOut:", e);
                }
              }}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Supprimer"
              color="#AEC16F"
              onPress={() => {
                Alert.alert(
                  "Confirmation",
                  "Voulez-vous vraiment supprimer votre compte ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: () => setshowpassword(true),
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </View>
          {showpassword && (
  <View style={styles.button}>
    <Button
      title="Confirmer la suppression"
       color="#AEC16F"
      onPress={deleteUserAccount}
    />
  </View>
)}
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
    height: 800,
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
  button: {
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#AEC16F",
  },
  title: {
    fontSize: 26,
    fontWeight: "500",
    color: "#AEC16F",
    marginBottom: 16,
  },
  input: {
    height: 50,
    width: "95%",
    borderRadius: 30,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#AEC16F", // comme Auth
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonWrapper: {
    marginTop: 20,

    overflow: "hidden",
    width: 160,
  },
});
//conversation en groupe
// user status : connecté ou non bul verte
// partager fichier , emojis , audio
//zayneb@gmail.com
