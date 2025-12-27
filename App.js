import { NavigationContainer } from "@react-navigation/native";
import CreateUser from "./Screens/CreateUser";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Auth from "./Screens/Auth";
import Home from "./Screens/Home";
import Chat from "./Screens/Chat";
import Account from "./Screens/Home/Account";
import GroupChat from "./Screens/GroupChat";
import CreateGroup from "./Screens/CreateGroup";
import ListGroupUsers from "./Screens/ListGroupUsers";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth" component={Auth}></Stack.Screen>
        <Stack.Screen name="CreateUser" component={CreateUser}></Stack.Screen>
        <Stack.Screen name="Home" component={Home}></Stack.Screen>
         <Stack.Screen name="Chat" component={Chat}></Stack.Screen>
         <Stack.Screen name="Account" component={Account}></Stack.Screen>
         <Stack.Screen name="GroupChat" component={GroupChat}></Stack.Screen>
         <Stack.Screen name="CreateGroup" component={CreateGroup}></Stack.Screen>
         <Stack.Screen name="ListGroupUsers" component={ListGroupUsers}></Stack.Screen>
         
         
      </Stack.Navigator>
    </NavigationContainer>
  );
}
//youssef@gmail.com