import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { getHabits, calculateStreak, getLast7Days, getToday } from '../storage/habitStorage';

const SCREEN_W = Dimensions.get('window').width;

const CHART_CONFIG = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(79, 99, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(150, 150, 170, ${opacity})`,
  barPercentage: 0.6,
  decimalPlaces: 0,
  propsForBackgroundLines: { stroke: '#f0f0f8', strokeWidth: 1 },
};

export default function StatsScreen() {
  const [habits, setHabits] = useState([]);
  const last7 = getLast7Days();
  const today = getToday();

  useFocusEffect(
    useCallback(() => {
      getHabits().then(setHabits);
    }, [])
  );

  const dailyCompletions = last7.map((date) =>
    habits.filter((h) => h.completedDates.includes(date)).length
  );

  const dayLabels = last7.map((date) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)
  );

  const topHabits = [...habits]
    .sort((a, b) => calculateStreak(b.completedDates) - calculateStreak(a.completedDates))
    .slice(0, 5);

  const streakLabels = topHabits.map((h) => h.icon);
  const streakData = topHabits.map((h) => calculateStreak(h.completedDates));

  const totalDone = habits.filter((h) => h.completedDates.includes(today)).length;
  const bestStreak = habits.length
    ? Math.max(...habits.map((h) => calculateStreak(h.completedDates)))
    : 0;
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  const renderHabitRow = ({ item }) => {
    const streak = calculateStreak(item.completedDates);
    return (
      <View style={styles.habitRow}>
        <View style={styles.habitRowLeft}>
          <Text style={styles.habitRowIcon}>{item.icon}</Text>
          <View>
            <Text style={styles.habitRowName}>{item.name}</Text>
            <Text style={styles.habitRowTotal}>{item.completedDates.length} total days</Text>
          </View>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>🔥 {streak}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{habits.length}</Text>
          <Text style={styles.summaryLabel}>Habits</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{totalDone}</Text>
          <Text style={styles.summaryLabel}>Today</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardAccent]}>
          <Text style={[styles.summaryNum, { color: '#FF8C00' }]}>🔥 {bestStreak}</Text>
          <Text style={styles.summaryLabel}>Best streak</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{totalCompletions}</Text>
          <Text style={styles.summaryLabel}>All time</Text>
        </View>
      </View>

      {habits.length > 0 ? (
        <>
          {/* Line chart */}
          <Text style={styles.chartTitle}>Daily Completions — Last 7 Days</Text>
          <View style={styles.chartBox}>
            <LineChart
              data={{
                labels: dayLabels,
                datasets: [{ data: dailyCompletions.some(v => v > 0) ? dailyCompletions : [0, 0, 0, 0, 0, 0, 0] }],
              }}
              width={SCREEN_W - 32}
              height={180}
              chartConfig={CHART_CONFIG}
              bezier
              style={{ borderRadius: 14 }}
              withShadow={false}
            />
          </View>

          {/* Bar chart — streaks */}
          {streakData.some((s) => s > 0) && (
            <>
              <Text style={styles.chartTitle}>Current Streaks</Text>
              <View style={styles.chartBox}>
                <BarChart
                  data={{
                    labels: streakLabels.length ? streakLabels : ['—'],
                    datasets: [{ data: streakData.length ? streakData : [0] }],
                  }}
                  width={SCREEN_W - 32}
                  height={180}
                  chartConfig={CHART_CONFIG}
                  style={{ borderRadius: 14 }}
                  showValuesOnTopOfBars
                  fromZero
                />
              </View>
            </>
          )}

          {/* Weekly grid */}
          <Text style={styles.chartTitle}>Weekly Grid</Text>
          {habits.map((habit) => (
            <View key={habit.id} style={styles.gridCard}>
              <Text style={styles.gridHabitName}>{habit.icon} {habit.name}</Text>
              <View style={styles.gridRow}>
                {last7.map((date) => {
                  const done = habit.completedDates.includes(date);
                  const isToday = date === today;
                  return (
                    <View key={date} style={styles.gridCol}>
                      <View style={[
                        styles.gridDot,
                        done && styles.gridDotDone,
                        isToday && !done && styles.gridDotToday,
                      ]} />
                      <Text style={styles.gridLabel}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Leaderboard */}
          <Text style={styles.chartTitle}>Streak Leaderboard</Text>
          <FlatList
            data={[...habits].sort((a, b) => calculateStreak(b.completedDates) - calculateStreak(a.completedDates))}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitRow}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No data yet</Text>
          <Text style={styles.emptySubText}>Add habits and complete them to see stats</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc', padding: 16 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20, marginTop: 4 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#eeeef8',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  summaryCardAccent: { backgroundColor: '#fff8ec', borderColor: '#ffe0aa' },
  summaryNum: { fontSize: 20, fontWeight: '800', color: '#4F63FF', marginBottom: 2 },
  summaryLabel: { fontSize: 10, color: '#aaa', fontWeight: '600', letterSpacing: 0.5 },
  chartTitle: {
    fontSize: 13, fontWeight: '700', color: '#1a1a2e',
    marginBottom: 10, marginTop: 6,
  },
  chartBox: {
    backgroundColor: '#fff', borderRadius: 14,
    overflow: 'hidden', marginBottom: 20,
    borderWidth: 1, borderColor: '#eeeef8',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  gridCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#eeeef8',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  gridHabitName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e', marginBottom: 10 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCol: { alignItems: 'center', gap: 4 },
  gridDot: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f5f6ff' },
  gridDotDone: { backgroundColor: '#4F63FF' },
  gridDotToday: { borderWidth: 2, borderColor: '#4F63FF' },
  gridLabel: { fontSize: 10, color: '#bbb' },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#eeeef8',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  habitRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  habitRowIcon: { fontSize: 22 },
  habitRowName: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  habitRowTotal: { fontSize: 11, color: '#aaa', marginTop: 2 },
  streakBadge: {
    backgroundColor: '#fff8ec', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 10,
    borderWidth: 1, borderColor: '#ffe0aa',
  },
  streakBadgeText: { fontSize: 12, color: '#cc8800', fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});