import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CalendarDayProps {
  day: number;
  isToday?: boolean;
  onTap?: () => void;
}

export const CalendarDay = ({ day, isToday = false, onTap }: CalendarDayProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, isToday && styles.todayContainer]}
      onPress={onTap}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dayText,
          isToday && styles.todayText,
        ]}
      >
        {day}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todayContainer: {
    backgroundColor: '#2E7D32',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  dayText: {
    fontSize: 16,
    color: '#2E7D32',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CalendarDay;