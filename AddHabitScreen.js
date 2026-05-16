import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { addHabit } from '../storage/habitStorage';

const ICONS = ['💧','🏃','📚','🧘','🥗','😴','💪','✍️','🎯','🎸','🧹','🐕','🧠','🌅','🚴','🍎'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function AddHabitScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmHour, setAlarmHour] = useState(8);
  const [alarmMinute, setAlarmMinute] = useState(0);

  const fmt = (n) => String(n).padStart(2, '0');

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a habit name');
      return;
    }
    const alarmTime = alarmEnabled ? { hour: alarmHour, minute: alarmMinute } : null;
    await addHabit(name.trim(), selectedIcon, description.trim(), alarmTime);
    setName('');
    setDescription('');
    setAlarmEnabled(false);
    navigation.navigate('Today');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon picker */}
      <Text style={styles.sectionLabel}>Choose Icon</Text>
      <View style={styles.iconGrid}>
        {ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[styles.iconBtn, selectedIcon === icon && styles.iconBtnSelected]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Text style={styles.iconEmoji}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Name */}
      <Text style={styles.sectionLabel}>Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Drink 8 glasses of water"
        placeholderTextColor="#bbb"
        value={name}
        onChangeText={setName}
        maxLength={40}
      />

      {/* Description */}
      <Text style={styles.sectionLabel}>
        Description <Text style={styles.optional}>(optional)</Text>
      </Text>
      <TextInput
        style={[styles.input, styles.inputMulti]}
        placeholder="Why is this habit important to you?"
        placeholderTextColor="#bbb"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        maxLength={120}
        textAlignVertical="top"
      />

      {/* Alarm toggle */}
      <View style={styles.alarmHeader}>
        <View>
          <Text style={styles.sectionLabel}>Daily Reminder</Text>
          <Text style={styles.alarmSubLabel}>Get notified at a set time every day</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, alarmEnabled && styles.toggleOn]}
          onPress={() => setAlarmEnabled(!alarmEnabled)}
          activeOpacity={0.8}
        >
          <View style={[styles.toggleThumb, alarmEnabled && styles.toggleThumbOn]} />
        </TouchableOpacity>
      </View>

      {alarmEnabled && (
        <View style={styles.alarmBox}>
          <Text style={styles.alarmPreview}>
            {fmt(alarmHour)}:{fmt(alarmMinute)}
          </Text>

          <Text style={styles.pickerLabel}>Hour</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerRow}
          >
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.pickerItem, alarmHour === h && styles.pickerItemSelected]}
                onPress={() => setAlarmHour(h)}
              >
                <Text style={[styles.pickerItemText, alarmHour === h && styles.pickerItemTextSelected]}>
                  {fmt(h)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.pickerLabel}>Minute</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pickerRow}
          >
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.pickerItem, alarmMinute === m && styles.pickerItemSelected]}
                onPress={() => setAlarmMinute(m)}
              >
                <Text style={[styles.pickerItemText, alarmMinute === m && styles.pickerItemTextSelected]}>
                  {fmt(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Add button */}
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
        <Text style={styles.addBtnText}>+ Add Habit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc', padding: 20 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: '#1a1a2e',
    marginBottom: 10, marginTop: 20,
  },
  optional: { color: '#bbb', fontWeight: '400' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#eeeef8',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  iconBtnSelected: { borderColor: '#4F63FF', borderWidth: 2, backgroundColor: '#f0f2ff' },
  iconEmoji: { fontSize: 24 },
  input: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: '#eeeef8', padding: 14, fontSize: 15, color: '#1a1a2e',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  inputMulti: { minHeight: 80, paddingTop: 12 },
  alarmHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 20,
  },
  alarmSubLabel: { fontSize: 12, color: '#aaa', marginTop: 2 },
  toggle: {
    width: 50, height: 28, borderRadius: 14,
    backgroundColor: '#e0e0ec', justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: '#4F63FF' },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  alarmBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#eeeef8', marginTop: 10,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3,
  },
  alarmPreview: {
    fontSize: 40, fontWeight: '800', color: '#4F63FF',
    textAlign: 'center', letterSpacing: 4, marginBottom: 16,
  },
  pickerLabel: { fontSize: 12, color: '#aaa', fontWeight: '600', marginBottom: 8 },
  pickerRow: { marginBottom: 14 },
  pickerItem: {
    width: 46, height: 46, borderRadius: 12, marginRight: 8,
    backgroundColor: '#f5f6ff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#eeeef8',
  },
  pickerItemSelected: { backgroundColor: '#4F63FF', borderColor: '#4F63FF' },
  pickerItemText: { fontSize: 14, color: '#666', fontWeight: '600' },
  pickerItemTextSelected: { color: '#fff' },
  addBtn: {
    backgroundColor: '#4F63FF', borderRadius: 14,
    padding: 18, alignItems: 'center', marginTop: 30,
    elevation: 3, shadowColor: '#4F63FF', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});