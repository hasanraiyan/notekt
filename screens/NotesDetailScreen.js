// NotesDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotesDetailScreen = ({ route, navigation }) => {
  // Get note from params or use empty note if creating new
  const { note } = route.params || { note: { id: null, title: '', content: '', date: new Date() } };

  const [isEditing, setIsEditing] = useState(!note.id); // If no ID, we're creating a new note
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
 const [date, setDate] = useState(note.date ? new Date(note.date) : new Date());


  // Format the date: "12 October 2020, 9:30 AM"
  const formattedDate = () => {
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Handle saving the note
  const handleSave = useCallback(async () => {
    if (isEditing) {
      try {
        // In a real app, you would update the note in storage here
        const updatedNote = {
          ...note,
          title,
          content,
          date: date.toISOString()
        };

        // Save the updated note to AsyncStorage
        await saveNote(updatedNote);

        // Return to previous screen
        setIsEditing(false);

        // If this was a new note, we would navigate back to the list
        if (!note.id) {
          navigation.goBack();
        }
      } catch (error) {
        console.error('Failed to save note to AsyncStorage', error);
      }
    } else {
      setIsEditing(true);
    }
  }, [isEditing, note, title, content, date, navigation]);

  // Save note to AsyncStorage
  const saveNote = async (noteToSave) => {
    try {
      // Retrieve existing notes from AsyncStorage
      const existingNotes = await AsyncStorage.getItem('notes');
      let notes = existingNotes ? JSON.parse(existingNotes) : [];

      // If the note has an ID, update the existing note
      if (noteToSave.id) {
        notes = notes.map(note => note.id === noteToSave.id ? noteToSave : note);
      } else {
        // If the note doesn't have an ID, generate a new ID and add the note
        noteToSave.id = generateId();
        notes.push(noteToSave);
      }

      // Save the updated notes to AsyncStorage
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save note to AsyncStorage', error);
    }
  };

  // Generate a unique ID for new notes
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Handle back button press
  const handleBack = () => {
    if (isEditing && note.id) {
      // If editing an existing note, cancel editing
      setIsEditing(false);
      // Restore original values
      setTitle(note.title);
      setContent(note.content);
    } else {
      // Otherwise go back to previous screen
      navigation.goBack();
    }
  };

  // Handle delete button press
  const handleDelete = async () => {
    try {
      // Retrieve existing notes from AsyncStorage
      const existingNotes = await AsyncStorage.getItem('notes');
      let notes = existingNotes ? JSON.parse(existingNotes) : [];

      // Filter out the note to delete
      notes = notes.filter(n => n.id !== note.id);

      // Save the updated notes to AsyncStorage
      await AsyncStorage.setItem('notes', JSON.stringify(notes));

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete note from AsyncStorage', error);
    }
  };

  // Handle share button press
  const handleShare = () => {
    // In a real app, you would implement sharing functionality here
    console.log('Share note:', { title, content });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        {!isEditing && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Ionicons name="share-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {isEditing ? (
          <>
            {/* Editing Mode */}
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#a0a0a0"
            />
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Your notes here..."
              placeholderTextColor="#a0a0a0"
              multiline
              textAlignVertical="top"
            />
          </>
        ) : (
          <>
            {/* Viewing Mode */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{formattedDate()}</Text>
            <Text style={styles.contentText}>{content}</Text>
          </>
        )}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="checkmark" size={24} color="white" />
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    minHeight: 300,
    padding: 0,
  },
  saveButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#7B68EE',
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default NotesDetailScreen;