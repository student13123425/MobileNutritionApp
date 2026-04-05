import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrackerScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tracker Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

export default TrackerScreen;