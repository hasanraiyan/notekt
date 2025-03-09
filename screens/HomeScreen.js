import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NOTES_DATA = [
  {
    id: '1',
    title: 'Youtube script ideas 🎬',
    content: 'There are many apps in Android that can run or emulate other operating systems, via utilizing hardware support for platform...',
    date: new Date('2020-10-15T10:30:00')
  },
  {
    id: '2',
    title: 'Datastore Blog Ideas 🦋',
    content: 'Google Play Protect, regular security updates and control over how your data is shared. We\'re dedicated to securing Android\'s 2.5 billion+ active devices every day and keeping information private.\n\nScreen readers, speech-to-text and some of the newest ways to experience the world your way.\n\nChoices for work, gaming, 5G streaming and anything else. There are over 24,000 phones and tablets that run on Android globally. So no matter what you\'re looking for, there\'s something for you.',
    date: new Date('2020-10-12T09:30:00')
  },
  {
    id: '3',
    title: 'College skit review 😄',
    content: 'There are many apps in Android that can run or emulate other operating systems, via utilizing hardware support for platform...',
    date: new Date('2020-10-08T14:15:00')
  },
  {
    id: '4',
    title: 'Social media blogs 📕',
    content: 'There are many apps in Android that can run or emulate other operating systems, via utilizing hardware support for platform...',
    date: new Date('2020-10-05T16:45:00')
  },
];

const NoteItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.noteItem} onPress={() => onPress(item)}>
    <Text style={styles.noteTitle}>{item.title}</Text>
    <Text style={styles.noteContent} numberOfLines={3}>
      {item.content}
    </Text>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <Image 
      source={require('../assets/images/empty-box.png')} // Make sure this image path is correct
      style={styles.emptyStateImage}
    />
    <Text style={styles.emptyStateTitle}>No notes found</Text>
    <Text style={styles.emptyStateSubtitle}>
      When you add a note, you will see your notes here
    </Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [notes, setNotes] = useState(NOTES_DATA);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Navigate to note detail screen
  const handleNotePress = (note) => {
    navigation.navigate('NoteDetail', { note });
  };

  // Create a new note
  const handleAddNote = () => {
    navigation.navigate('NoteDetail', { 
      note: { 
        id: null, 
        title: '', 
        content: '', 
        date: new Date() 
      } 
    });
  };

  // Toggle theme mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>All Notes</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons 
            name={isDarkMode ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={isDarkMode ? "white" : "black"} 
          />
        </TouchableOpacity>
      </View>
      
      {notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <NoteItem item={item} onPress={handleNotePress} />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddNote}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  darkText: {
    color: 'white',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7B68EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default HomeScreen;
