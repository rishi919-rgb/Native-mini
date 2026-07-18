import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Dashboard() {
  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [surveys, setSurveys] = useState([]);

  const createSurvey = () => {
    if (!siteName || !clientName || !description || !date) {
      Alert.alert('Missing details', 'Please fill in all required fields.');
      return;
    }

    setSurveys([
      { siteName, clientName, priority, date },
      ...surveys,
    ]);
    setSiteName('');
    setClientName('');
    setDescription('');
    setPriority('Medium');
    setDate('');
    setShowForm(false);
    Alert.alert('Success', 'Survey created successfully.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Student Dashboard</Text>
      <Text style={styles.welcome}>Welcome, Rishi!</Text>

      <View style={styles.box}>
        <Text style={styles.title}>Student Details</Text>
        <Text>Name: Rishikesh</Text>
        <Text>Course: Computer Engineering</Text>
        <Text>Year: 2</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>Today&apos;s Survey Count</Text>
        <Text style={styles.count}>{surveys.length}</Text>
      </View>

      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actions}>
        <Button title="Create Survey" onPress={() => setShowForm(true)} />
        <View style={styles.buttonSpace} />
        <Button title="View Recent Surveys" onPress={() => Alert.alert('Recent Surveys', `${surveys.length} survey(s) created.`)} />
      </View>

      {showForm && (
        <View style={styles.box}>
          <Text style={styles.title}>Create Survey</Text>

          <Text>Site Name *</Text>
          <TextInput style={styles.input} placeholder="Enter site name" value={siteName} onChangeText={setSiteName} />

          <Text>Client Name *</Text>
          <TextInput style={styles.input} placeholder="Enter client name" value={clientName} onChangeText={setClientName} />

          <Text>Description *</Text>
          <TextInput style={styles.input} placeholder="Enter description" value={description} onChangeText={setDescription} />

          <Text>Priority *</Text>
          <TextInput style={styles.input} placeholder="Low, Medium, or High" value={priority} onChangeText={setPriority} />

          <Text>Date *</Text>
          <TextInput style={styles.input} placeholder="DD/MM/YYYY" value={date} onChangeText={setDate} />

          <Button title="Submit Survey" onPress={createSurvey} />
          <View style={styles.buttonSpace} />
          <Button title="Cancel" color="gray" onPress={() => setShowForm(false)} />
        </View>
      )}

      <View style={styles.box}>
        <Text style={styles.title}>Recent Survey Summary</Text>
        {surveys.length === 0 ? (
          <Text>No surveys created yet.</Text>
        ) : (
          surveys.map((survey, index) => (
            <View key={`${survey.siteName}-${index}`} style={styles.survey}>
              <Text>Site: {survey.siteName}</Text>
              <Text>Client: {survey.clientName}</Text>
              <Text>Priority: {survey.priority}</Text>
              <Text>Date: {survey.date}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  welcome: { fontSize: 18, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  box: { borderWidth: 1, borderColor: '#ccc', padding: 15, marginTop: 16 },
  count: { fontSize: 30, fontWeight: 'bold' },
  actions: { marginTop: 8 },
  buttonSpace: { height: 10 },
  input: { borderWidth: 1, borderColor: '#999', padding: 10, marginTop: 5, marginBottom: 12 },
  survey: { borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10, marginTop: 10 },
});
