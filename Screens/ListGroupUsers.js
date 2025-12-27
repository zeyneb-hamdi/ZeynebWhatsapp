import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import Groups from './Home/Groups';
import { Ionicons } from '@expo/vector-icons';
import firebase from '../config';

const database = firebase.database();
const ref_all_account = database.ref().child('Accounts');
const ref_groups=database.ref('Groups')



export default function ListGroupUsers(props) {
  const groupId = props.route.params.groupId;
  const [data, setdata] = useState([]);
  const ref_group=ref_groups.child(groupId)
  

  useEffect(() => {
    const d = [];
    const handler = ref_all_account.on('value', (snapshot) => {
      d.length = 0; 
      snapshot.forEach((accountSnap) => {
       
        const val = accountSnap.val();
        const key = accountSnap.key;
        d.push({ key, ...val });
      });
      setdata([...d]);
    });

    return () => {
      ref_all_account.off('value', handler);
    };
  }, []); 

  const adduser = (user) => {
    
      const ref_users=ref_group.child('users')
  const user_key=user.Id
  const ref_user=ref_users.child(user_key)
  ref_user.set(
    {
      Id:user.Id,
      Nom:user.Nom
    }
  )
  alert(user.Nom+" added successfully")
  
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.row}>
       

        <View style={styles.info}>
          <Text style={styles.name}>{item.Nom?? 'No name'}</Text>
          {item.Email ? <Text style={styles.email}>{item.Email}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => adduser(item)}
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Choose contact</Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item.key ?? item.Email ?? Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  card: {
    height: '85%',
    width: '95%',
    borderRadius: 16,
    backgroundColor: '#f3f2d3c2',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  title: {
    backgroundColor: 'transparent',
    fontWeight: '500',
    fontSize: 26,
    color: '#AEC16F',
    marginBottom: 12,
    alignSelf: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e9f1d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#6b8b3b',
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 12,
    color: '#6e6e73',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#AEC16F',
    padding: 8,
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
//youssef@gmail.com