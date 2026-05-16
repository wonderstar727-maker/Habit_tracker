import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const HABITS_KEY = 'habits_data';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const setupAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
};

const scheduleAlarm = async (habitId, habitName, hour, minute) => {
  try {
    await setupAndroidChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    await Notifications.cancelScheduledNotificationAsync(habitId).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: habitId,
      content: {
        title: '⏰ Habit Reminder',
        body: `Time to: ${habitName}`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (error) {
    console.error('Schedule alarm failed:', error);
  }
};

// ── Exported functions ──────────────────────────────────────────

export const getToday = () => new Date().toISOString().split('T')[0];

export const getHabits = async () => {
  try {
    const json = await AsyncStorage.getItem(HABITS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const addHabit = async (name, icon, description, alarmTime) => {
  try {
    const habits = await getHabits();
    const id = Date.now().toString();
    const newHabit = {
      id,
      name,
      icon,
      description: description || '',
      alarmTime: alarmTime || null,
      createdAt: getToday(),
      completedDates: [],
    };
    if (alarmTime) {
      await scheduleAlarm(id, name, alarmTime.hour, alarmTime.minute);
    }
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify([...habits, newHabit]));
  } catch (error) {
    console.error('Add habit failed:', error);
  }
};

export const toggleHabitToday = async (habitId) => {
  try {
    const habits = await getHabits();
    const today = getToday();
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const alreadyDone = h.completedDates.includes(today);
      return {
        ...h,
        completedDates: alreadyDone
          ? h.completedDates.filter((d) => d !== today)
          : [...h.completedDates, today],
      };
    });
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Toggle failed:', error);
  }
};

export const deleteHabit = async (habitId) => {
  try {
    const habits = await getHabits();
    await Notifications.cancelScheduledNotificationAsync(habitId).catch(() => {});
    const filtered = habits.filter((h) => h.id !== habitId);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

export const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date(getToday());
  let streak = 0;
  let checkDate = new Date(today);
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]);
    const diffDays = Math.round((checkDate - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (diffDays === 1 && i === 0) {
      streak++;
      checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }
  return streak;
};

export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};