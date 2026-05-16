import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import AddHabitScreen from './screens/AddHabitScreen';
import StatsScreen from './screens/StatsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, icon, focused }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#1a1a2e',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Today"
          component={HomeScreen}
          options={{
            title: 'My Habits',
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Today" icon="✓" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Add"
          component={AddHabitScreen}
          options={{
            title: 'New Habit',
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Add" icon="+" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Statistics',
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Stats" icon="▲" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f5',
    height: 65,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 2,
    minWidth: 70,
  },
  tabItemActive: {
    backgroundColor: '#EEF2FF',
  },
  tabIcon: {
    fontSize: 18,
    color: '#aab',
    fontWeight: '600',
  },
  tabIconActive: {
    color: '#4F63FF',
  },
  tabLabel: {
    fontSize: 11,
    color: '#aab',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#4F63FF',
    fontWeight: '700',
  },
});