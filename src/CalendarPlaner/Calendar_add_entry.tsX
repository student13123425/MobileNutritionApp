// calendar_day.tsx

import React, { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Calendar Day Component 
interface CalendarDayProps {
  day: number;
  isToday: boolean;
  onTap?: () => void;
}

const CalendarDay = ({ day, isToday, onTap }: CalendarDayProps) => {
  return (
    <TouchableOpacity onPress={onTap} style={styles.dayContainer}>
      <View
        style={[
          styles.dayBox,
          isToday && styles.todayBox
        ]}
      >
        <Text style={isToday ? styles.todayText : styles.regularText}>
          {day.toString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Selected Day Screen Component
interface SelectedDayScreenProps {
  year: number;
  month: number;
  day: number;
}

const SelectedDayScreen = ({ navigation, route }: any) => {
  const { year, month, day } = route.params;

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{day} / {month} / {year}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Icon name="event-available" size={80} color="#2E7D32" />
        </View>

        <Text style={styles.selectedDateTitle}>Selected Date</Text>
        <Text style={styles.selectedDateSubtitle}>{day} / {month} / {year}</Text>

        <View style={styles.divider} />

        <View style={styles.emptyStateContainer}>
          <Icon name="info-outline" size={64} color="#2E7D32" />
          <Text style={styles.emptyStateText}>No log entries for this date yet.</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Calendar Screen Component
const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // Helper to get the first day of the month
  const _firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // Helper to get the last day of the month
  const _lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Helper to navigate to previous month
  const _previousMonth = () => {
    setCurrentDate(prevDate => {
      let year = prevDate.getFullYear();
      let month = prevDate.getMonth();

      if (month === 0) {
        month = 11;
        year--;
      } else {
        month--;
      }

      return new Date(year, month);
    });
    setSelectedDay(null); // Reset selection when month changes
  };

  // Helper to navigate to next month
  const _nextMonth = () => {
    setCurrentDate(prevDate => {
      let year = prevDate.getFullYear();
      let month = prevDate.getMonth();

      if (month === 11) {
        month = 0;
        year++;
      } else {
        month++;
      }

      return new Date(year, month);
    });
    setSelectedDay(null); // Reset selection when month changes
  };

  // Handle day tap
  const _onDayTap = (day: number) => {
    setSelectedDay(day);
    // In React Navigation, you would typically use navigation.navigate here
    // For this example, we'll just update the state
  };

  // Helper to check if a date is today
  const _isCurrentDate = (testDate: Date) => {
    const now = new Date();
    return testDate.getFullYear() === now.getFullYear() &&
           testDate.getMonth() === now.getMonth() &&
           testDate.getDate() === now.getDate();
  };

  // Build calendar grid
  const _buildCalendarGrid = () => {
    const firstDay = _firstDayOfMonth;
    const lastDay = _lastDayOfMonth;

    // Get day of week for the first day (0=Sunday, 6=Saturday in JavaScript)
    let startWeekday = firstDay.getDay();
    if (startWeekday === 0) startWeekday = 7; // Convert to 1-7 range

    const days: JSX.Element[] = [];

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startWeekday - 1; i++) {
      days.push(<CalendarDay day={0} isToday={false} key={`empty-${i}`} />);
    }

    // Add all days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
      const isToday = _isCurrentDate(currentDate);

      days.push(
        <CalendarDay
          key={`day-${day}`}
          day={day}
          isToday={isToday}
          onTap={() => _onDayTap(day)}
        />
      );
    }

    return (
      <View style={styles.calendarGrid}>
        {days}
      </View>
    );
  };

  // Build empty cell
  const _buildEmptyCell = () => {
    return (
      <CalendarDay day={0} isToday={false} key="empty-cell" />
    );
  };

  return (
    <View style={styles.container}>
      {/* NAVBAR SECTION */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={_previousMonth}>
        <View style={{opacity: 0.7}}>
          <Icon name="arrow-back-ios" size={24} color="#FFFFFF" />
        </View>

        </TouchableOpacity>

        <Text style={styles.monthYearText}>
          {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
        </Text>

        <TouchableOpacity onPress={_nextMonth}>
          <View style={{opacity: 0.7}}>
            <Icon name="arrow-forward-ios" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* DAYS OF WEEK HEADER */}
      <View style={styles.daysHeader}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <Text key={`day-${index}`} style={styles.dayHeaderText}>{day}</Text>
        ))}
      </View>

      {/* CALENDAR GRID */}
      {_buildCalendarGrid()}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // green.shade50 equivalent
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32', // green.shade700 equivalent
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9', // green.shade200 equivalent
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#E8F5E9', // green.shade50 equivalent
  },
  dayHeaderText: {
    fontWeight: 'bold',
    color: '#1B5E20', // green.shade900 equivalent
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%', // 1/7 of the screen
    aspectRatio: 1,
  },
  dayBox: {
    margin: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For Android
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBox: {
    backgroundColor: '#388E3C', // green.shade700 equivalent
  },
  regularText: {
    fontSize: 16,
    color: '#1B5E20', // green.shade900 equivalent
  },
  todayText: {
    fontSize: 16,
    fontWeight: 'bold' as any,
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E8F5E9', // green.shade50 equivalent
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 24,
    fontWeight: 'bold' as any,
    color: '#1B5E20', // green.shade900 equivalent
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedDateSubtitle: {
    fontSize: 18,
    color: '#757575', // grey.shade700 equivalent
    textAlign: 'center',
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#BDBDBD', // grey.shade400 equivalent
    marginVertical: 32,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#757575', // grey.shade800 equivalent
    marginTop: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#388E32', // green.shade700 equivalent
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32', // green.shade700 equivalent
    height: 56,
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
  },
});

// Export the components
export default CalendarScreen;
export { CalendarDay, SelectedDayScreen };
