import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, ImageBackground } from 'react-native';

import firebase from '../config'
const auth=firebase.auth()
const database=firebase.database();
export default function CreateUser(props) {
 const [email,setemail] = useState("A")
 const [password,setpassword] = useState("zayneb")
 const [confirmedpassword, setconfirmedpassword] = useState("")
 
 
  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.container}>
      
      <View
        style={{
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
        }}>
        
        <Text style={{
          backgroundColor: "transparent",
          fontWeight: "500",
          fontSize: 26,
          color: "#AEC16F",
          marginBottom: 12,
        }}>Create a New User</Text>

       

        <TextInput
         onChangeText={(text)=>{setemail(text)}}
         
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9b9b9b"
        />

        <TextInput
        onChangeText={(text)=>{setpassword(text)}}
          style={styles.input}
          placeholder="Password"
          
          placeholderTextColor="#9b9b9b"
          secureTextEntry
        />
         <TextInput
         onChangeText={(text)=>{setconfirmedpassword(text)}}
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#9b9b9b"
          secureTextEntry
        />

        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <View style={styles.buttonWrapper}>
            <Button title="Submit" color="#AEC16F" onPress={() => 
              {
                if (password===confirmedpassword)
                {
                     auth.createUserWithEmailAndPassword(email,password)
                     .then(()=>{
                       const uid=auth.currentUser.uid
                      props.navigation.replace('Account',{
                        currentId:uid
                      })
                     }
                    )
                     .catch((error)=>{
                      alert(error)
                     })
                     
                ;
                    
                }
                else{
                  alert("verify your password")
                }
              }
            } />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Exit" color="#AEC16F" />
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
          onPress={() => props.navigation?.goBack()}>
          Back to Login
        </Text>

      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  input: {
    height: 50,
    width: "95%",
    borderRadius: 30,           // identique à Auth
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#AEC16F",     // identique à Auth
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonWrapper: {
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
    width: 120,
  },
});
