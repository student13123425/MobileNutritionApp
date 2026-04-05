import React, { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

interface SelectedDayScreenProps {
  year: number;
  month: number;
  day: number;
}

const SelectedDayScreen = ({ navigation, route }: any) => {
  const { year, month, day } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>{day} / {month} / {year}</Text>
      </View>

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

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  const _firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const _lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

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
    setSelectedDay(null);
  };

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
    setSelectedDay(null);
  };

  const _onDayTap = (day: number) => {
    setSelectedDay(day);
  };

  const _isCurrentDate = (testDate: Date) => {
    const now = new Date();
    return testDate.getFullYear() === now.getFullYear() &&
           testDate.getMonth() === now.getMonth() &&
           testDate.getDate() === now.getDate();
  };

  const _buildCalendarGrid = () => {
    const firstDay = _firstDayOfMonth;
    const lastDay = _lastDayOfMonth;

    let startWeekday = firstDay.getDay();
    if (startWeekday === 0) startWeekday = 7;

    const days: JSX.Element[] = [];

    for (let i = 0; i < startWeekday - 1; i++) {
      days.push(<CalendarDay day={0} isToday={false} key={`empty-${i}`} />);
    }

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

  const _buildEmptyCell = () => {
    return (
      <CalendarDay day={0} isToday={false} key="empty-cell" />
    );
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.daysHeader}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <Text key={`day-${index}`} style={styles.dayHeaderText}>{day}</Text>
        ))}
      </View>

      {_buildCalendarGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
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
    backgroundColor: '#E8F5E9',
  },
  dayHeaderText: {
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
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
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBox: {
    backgroundColor: '#388E3C',
  },
  regularText: {
    fontSize: 16,
    color: '#1B5E20',
  },
  todayText: {
    fontSize: 16,
    fontWeight: 'bold' as any,
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E8F5E9',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 24,
    fontWeight: 'bold' as any,
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedDateSubtitle: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#BDBDBD',
    marginVertical: 32,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#388E32',
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
    backgroundColor: '#2E7D32',
    height: 56,
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default CalendarScreen;
export { CalendarDay, SelectedDayScreen };