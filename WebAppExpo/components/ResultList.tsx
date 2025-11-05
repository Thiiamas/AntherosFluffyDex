import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ResultListProps = {
  results: string[];
};

const ResultList = (props: ResultListProps) => {
  return (
    <View style={styles.container}>
      {props.results.map((x, i) => (
        <Text style={styles.title} key={i}>
          {x}
        </Text>
      ))}
      {/* Add your list items here */}
    </View>
  );
};
export default ResultList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 3,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
  },
});
