import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import List from "./Home/List";

import Account from "./Home/Account";
import Groups from "./Home/Groups";

const Tab = createBottomTabNavigator();
export default function Home(props) {
  const currentId=props.route.params.currentId
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // icons per route
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'List') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

        
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#AEC16F', 
        tabBarInactiveTintColor: 'gray',     
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 60,
        },
        headerShown: false, 
      })}
    >
      <Tab.Screen 
       initialParams={{currentId:currentId}}
       name="List" component={List}/>
      <Tab.Screen 
       initialParams={{currentId:currentId}}
      name="Groups" component={Groups}/>
      <Tab.Screen 
      initialParams={{currentId:currentId}}
      name="Account" component={Account}/>
    </Tab.Navigator>
  );
}
