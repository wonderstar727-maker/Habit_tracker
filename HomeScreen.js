import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getHabits, toggleHabitToday,
  deleteHabit, calculateStreak, getToday
} from '../storage/habitStorage';

export default function HomeScreen() {
  const [habits, setHabits] = useState([]);
  const today = getToday();

  useFocusEffect(
    useCallback(() => {
      getHabits().then(setHabits);
    }, [])
  );

  const handleToggle = async (id) => {
    const updated = await toggleHabitToday(id);
    if (updated) setHabits(updated);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Habit', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteHabit(id);
          setHabits((prev) => prev.filter((h) => h.id !== id));
        },
      },
    ]);
  };

  const completed = habits.filter((h) => h.completedDates.includes(today)).length;
  const percent = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  const renderHabit = ({ item }) => {
    const isDone = item.completedDates.includes(today);
    const streak = calculateStreak(item.completedDates);
    return (
      <TouchableOpacity
        style={[styles.card, isDone && styles.cardDone]}
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, isDone && styles.iconCircleDone]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.habitName, isDone && styles.habitNameDone]}>
              {item.name}
            </Text>
            {item.description ? (
              <Text style={styles.habitDesc} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {streak > 0 && (
                <View style={styles.streakPill}>
                  <Text style={styles.streakText}>🔥 {streak} day{streak !== 1 ? 's' : ''}</Text>
                </View>
              )}
              {item.alarmTime && (
                <View style={styles.alarmPill}>
                  <Text style={styles.alarmText}>
                    ⏰ {String(item.alarmTime.hour).padStart(2, '0')}:{String(item.alarmTime.minute).padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
            {isDone && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fc" />

      {/* Summary hero */}
      <View style={styles.hero}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroPercent}>{percent}%</Text>
          <Text style={styles.heroLabel}>completed today</Text>
          <Text style={styles.heroSub}>{completed} of {habits.length} habits done</Text>
        </View>
        <View style={styles.heroRight}>
          <View style={styles.circleTrack}>
            <Text style={styles.circleEmoji}>
              {percent === 100 ? '🎉' : percent >= 50 ? '💪' : '✦'}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      {habits.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No habits yet</Text>
          <Text style={styles.emptySubText}>Tap Add below to create your first habit</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabit}
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  hero: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#4F63FF', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 22,
  },
  heroLeft: { flex: 1 },
  heroPercent: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4, letterSpacing: 0.5 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  heroRight: { marginLeft: 16 },
  circleTrack: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  circleEmoji: { fontSize: 28 },
  progressTrack: {
    height: 5, backgroundColor: '#e8eaf0',
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4F63FF', borderRadius: 3 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#f0f0f8',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 4,
  },
  cardDone: { borderColor: '#c7ceff', backgroundColor: '#f5f6ff' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#f5f6ff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#eeeeff',
  },
  iconCircleDone: { backgroundColor: '#e8ebff', borderColor: '#c7ceff' },
  iconText: { fontSize: 22 },
  cardBody: { flex: 1 },
  habitName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 2 },
  habitNameDone: { color: '#4F63FF', textDecorationLine: 'line-through' },
  habitDesc: { fontSize: 12, color: '#9999aa', marginBottom: 5 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  streakPill: {
    backgroundColor: '#fff8ec', borderRadius: 20,
    paddingVertical: 2, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#ffe0aa',
  },
  streakText: { fontSize: 11, color: '#cc8800' },
  alarmPill: {
    backgroundColor: '#eef5ff', borderRadius: 20,
    paddingVertical: 2, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#c0d8ff',
  },
  alarmText: { fontSize: 11, color: '#3377cc' },
  cardRight: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 8,
  },
  deleteBtn: {
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 14, color: '#111', fontWeight: '700',
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: '#dde0f0',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#4F63FF', borderColor: '#4F63FF' },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});