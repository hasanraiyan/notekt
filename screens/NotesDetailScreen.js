// NotesDetailScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { addNote, deleteNote, updateNote } from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const { width, height } = Dimensions.get('window');

const NotesDetailScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();

  const renderCount = useRef(0);

  const { note } = route.params || { note: { id: null, title: '', content: '', date: new Date(), tag: 'Personal' } }; // Default tag to 'Personal'

  const [isEditing, setIsEditing] = useState(!note.id);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [date, setDate] = useState(note.date ? new Date(note.date) : new Date());
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(note.tag || 'Personal'); // Initialize with 'Personal' (capitalized)
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // State for auto-save
  const autoSaveTimeout = useRef(null); // Ref to hold timeout for debouncing


  const TAGS = [
    { id: 'personal', name: 'Personal', icon: 'person-outline' },
    { id: 'work', name: 'Work', icon: 'briefcase-outline' },
    { id: 'ideas', name: 'Ideas', icon: 'bulb-outline' },
    { id: 'tasks', name: 'Tasks', icon: 'checkbox-outline' }
  ];

  useEffect(() => {
    loadAutoSaveSetting();
  }, []);

  const loadAutoSaveSetting = async () => {
    try {
      const value = await AsyncStorage.getItem('autoSave');
      if (value !== null) {
        setAutoSaveEnabled(value === 'true');
      }
    } catch (error) {
      console.error('Failed to load autoSave setting:', error);
    }
  };


  useEffect(() => {
    if (autoSaveEnabled && isEditing) {
      // Debounce auto-save
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      autoSaveTimeout.current = setTimeout(handleAutoSave, 1000); // Save after 1 second of inactivity
    }
    return () => clearTimeout(autoSaveTimeout.current); // Cleanup timeout on unmount/update
  }, [title, content, isEditing, autoSaveEnabled]);


  const formattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const toggleOptions = () => {
    if (showOptions) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true })
      ]).start(() => setShowOptions(false));
    } else {
      setShowOptions(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    }
  };

  const saveNoteToDatabase = async (noteToSave) => {
    if (note.id) {
      return await updateNote(note.id, noteToSave.title, noteToSave.content, noteToSave.tag);
    } else {
      return await addNote(noteToSave.title, noteToSave.content, noteToSave.tag);
    }
  };


  const handleSave = useCallback(async () => {
    try {
      const currentDate = new Date();
      setDate(currentDate);

      const noteToSave = {
        id: note.id,
        title: title.trim() === '' ? 'Untitled Note' : title,
        content,
        tag: selectedCategory,
      };

      if (title.trim() === '') {
        setTitle('Untitled Note');
      }

      console.log('handleSave - note.id before saveNoteToDatabase:', note.id);
      const savedNote = await saveNoteToDatabase(noteToSave);
      console.log('handleSave - savedNote:', savedNote);

      if (!note.id && savedNote) {
        navigation.goBack(); // Go back to list after adding a new note
      } else if (note.id && savedNote) {
        setIsEditing(false); // Stop editing after manual save on existing note
        navigation.setParams({ 
          note: {
            ...savedNote,
            date: savedNote.date
          }
        }); // Update note in params
      }


    } catch (error) {
      console.error('Failed to save note', error);
    }
  }, [note, title, content, selectedCategory, navigation]);


  const handleAutoSave = useCallback(async () => {
    if (!isEditing || !autoSaveEnabled) {
      return; // Don't auto-save if not editing or auto-save is disabled
    }
    try {
      const currentDate = new Date();
      setDate(currentDate);

      const noteToSave = {
        id: note.id,
        title: title.trim() === '' ? 'Untitled Note' : title,
        content,
        tag: selectedCategory,
      };

      if (title.trim() === '') {
        setTitle('Untitled Note');
      }

      const savedNote = await saveNoteToDatabase(noteToSave);
      if (note.id && savedNote) {
        navigation.setParams({ note: savedNote }); // Update note in params to reflect changes from auto-save
      } else if (!note.id && savedNote && savedNote.id) {
        // If a new note was created during auto-save, update the route params with the new note id.
        navigation.setParams({ note: savedNote, id: savedNote.id }); // Make sure route params has the new ID.
        note.id = savedNote.id; // Update the local note.id to the newly created id
      }


    } catch (error) {
      console.error('Failed to auto-save note', error);
    }
  }, [isEditing, note, title, content, selectedCategory, navigation, autoSaveEnabled]);


  const handleDelete = async () => {
    if (note.id) {
      try {
        await deleteNote(note.id);
        navigation.goBack();
      } catch (error) {
        console.error('Failed to delete note', error);
      }
    } else {
      console.log("Cannot delete a note that hasn't been saved yet.");
      navigation.goBack();
    }
  };

  const handleShare = () => {
    console.log('Share note:', { title, content });
    toggleOptions();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Personal': return '#8A2BE2';
      case 'Work': return '#1E90FF';
      case 'Ideas': return '#32CD32';
      case 'Tasks': return '#FF8C00';
      default: return '#8A2BE2';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Personal': return 'account';
      case 'Work': return 'briefcase';
      case 'Ideas': return 'lightbulb';
      case 'Tasks': return 'clipboard-check';
      default: return 'bookmark';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={[styles.header, {
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderBottomColor: theme.borderColor,
        paddingTop: StatusBar.currentHeight + 10
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textColor} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {isEditing || titleFocused || contentFocused ? (
            <>
              <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
                <Ionicons name="create-outline" size={24} color={theme.textColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={theme.textColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color={theme.textColor} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.headerButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil-outline" size={24} color={theme.textColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerButton} onPress={toggleOptions}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.textColor} />
          </TouchableOpacity>
        </View>

      </View>

      {showOptions && (
        <View style={[
          styles.dropdown,
          { backgroundColor: theme.background, borderColor: theme.borderColor }
        ]}>
          <TouchableOpacity onPress={() => { setIsEditing(true); toggleOptions(); }} style={styles.dropdownItem}>
            <Text style={{ color: theme.textColor }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { handleShare(); toggleOptions(); }} style={styles.dropdownItem}>
            <Text style={{ color: theme.textColor }}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { handleDelete(); toggleOptions(); }} style={styles.dropdownItem}>
            <Text style={{ color: theme.textColor }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 20}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          {!isEditing && (
            <View style={styles.metaContainer}>
              <Text style={[styles.date, { color: theme.secondaryTextColor }]}>
                {formattedDate()}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedCategory) }]}>
                <MaterialCommunityIcons name={getCategoryIcon(selectedCategory)} size={14} color="white" />
                <Text style={styles.categoryText}>{selectedCategory}</Text>
              </View>
            </View>
          )}

          {isEditing && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categorySelector}
              contentContainerStyle={styles.categorySelectorContent}
            >
              {TAGS.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory.toLowerCase() === tag.name.toLowerCase() ?
                      { backgroundColor: getCategoryColor(tag.name) } :
                      { backgroundColor: 'transparent', borderColor: getCategoryColor(tag.name), borderWidth: 1 }
                  ]}
                  onPress={() => setSelectedCategory(tag.name)}
                >
                  <Ionicons name={tag.icon} size={16} color={selectedCategory.toLowerCase() === tag.name.toLowerCase() ? "white" : getCategoryColor(tag.name)} />
                  <Text style={[
                    styles.categoryItemText,
                    { color: selectedCategory.toLowerCase() === tag.name.toLowerCase() ? "white" : getCategoryColor(tag.name) }
                  ]}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {isEditing ? (
            <>
              <TextInput
                ref={titleInputRef}
                style={[styles.titleInput, { color: theme.textColor }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor={theme.tertiaryTextColor}
                selectionColor={theme.primary}
                maxLength={100}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
              />
              <TextInput
                ref={contentInputRef}
                style={[styles.contentInput, { color: theme.textColor }]}
                value={content}
                onChangeText={setContent}
                placeholder="Type your note here..."
                placeholderTextColor={theme.tertiaryTextColor}
                multiline
                textAlignVertical="top"
                selectionColor={theme.primary}
                autoFocus={!note.id}
                onFocus={() => setContentFocused(true)}
                onBlur={() => setContentFocused(false)}
              />
            </>
          ) : (
            <>
              <Text style={[styles.titleDisplay, { color: theme.textColor }]}>
                {title.trim() === '' ? 'Untitled Note' : title}
              </Text>
              <Text style={[styles.contentText, { color: theme.textColor }]}>
                {content.trim() === '' ? 'No content' : content}
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {!isEditing && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary }]}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 80,
    borderBottomWidth: 1,
    elevation: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editHeader: {
    flex: 1,
    alignItems: 'flex-end',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  categorySelector: {
    marginTop: 16,
    marginBottom: 20,
    maxHeight: 50,
  },
  categorySelectorContent: {
    paddingRight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    height: 30,
    // The border style is already here for non-active state
    // selectedCategory === category ?
    //   { backgroundColor: getCategoryColor(category) } :
    //   { backgroundColor: 'transparent', borderColor: getCategoryColor(category), borderWidth: 1 }
  },
  categoryItemText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  titleDisplay: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 26,
    minHeight: 300,
    padding: 0,
  },
  contentFooter: {
    marginTop: 16,
    marginBottom: 40,
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 12,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    right: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bottomPadding: {
    height: 100,
  },
});

export default NotesDetailScreen;
