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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { addNote, deleteNote, updateNote, getNoteById } from '../database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const NotesDetailScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { id } = route.params;

  // State for loaded note data
  const [noteData, setNoteData] = useState(null);
  const [isEditing, setIsEditing] = useState(!id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date());
  // Use lowercase for category consistency with the database
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [showOptions, setShowOptions] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const autoSaveTimeout = useRef(null);

  const TAGS = [
    { id: 'personal', name: 'Personal', icon: 'person-outline' },
    { id: 'work', name: 'Work', icon: 'briefcase-outline' },
    { id: 'ideas', name: 'Ideas', icon: 'bulb-outline' },
    { id: 'tasks', name: 'Tasks', icon: 'checkbox-outline' }
  ];

  // Load the note asynchronously if an ID is provided
  useEffect(() => {
    if (id) {
      getNoteById(id).then(data => {
        if (data) {
          setNoteData(data);
        }
      });
    }
  }, [id]);

  // Update state once noteData is loaded
  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title || '');
      setContent(noteData.content || '');
      setDate(noteData.date ? new Date(noteData.date) : new Date());
      setSelectedCategory(noteData.tag || 'personal');
    }
  }, [noteData]);

  // Load auto-save setting from AsyncStorage
  useEffect(() => {
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
    loadAutoSaveSetting();
  }, []);

  // Debounce auto-save if enabled
  useEffect(() => {
    if (autoSaveEnabled && isEditing) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      autoSaveTimeout.current = setTimeout(handleAutoSave, 1000);
    }
    return () => clearTimeout(autoSaveTimeout.current);
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

  // Helper to save a note to the database
  const saveNoteToDatabase = async (noteToSave) => {
    if (noteData && noteData.id) {
      return await updateNote(noteData.id, noteToSave.title, noteToSave.content, noteToSave.tag);
    } else {
      return await addNote(noteToSave.title, noteToSave.content, noteToSave.tag);
    }
  };

    // Manual save handler
    const handleSave = useCallback(async () => {
      try {
        const currentDate = new Date();
        setDate(currentDate);
  
        const noteToSave = {
          id: noteData && noteData.id,
          title: title.trim() === '' ? 'Untitled Note' : title,
          content,
          tag: selectedCategory,
        };
  
        if (title.trim() === '') {
          setTitle('Untitled Note');
        }
  
        const savedNote = await saveNoteToDatabase(noteToSave);
        if (!noteData && savedNote && savedNote.id) {
          // New note created; go back to the list
          navigation.goBack();
        } else if (noteData && savedNote) {
          setIsEditing(false);
          setNoteData(savedNote);
          // navigation.setParams({ id: savedNote.id }); // remove this line
        }
      } catch (error) {
        console.error('Failed to save note', error);
      }
    }, [noteData, title, content, selectedCategory, navigation]);
  
    // Auto-save handler
    const handleAutoSave = useCallback(async () => {
      if (!isEditing || !autoSaveEnabled) return;
      try {
        const currentDate = new Date();
        setDate(currentDate);
  
        const noteToSave = {
          id: noteData && noteData.id,
          title: title.trim() === '' ? 'Untitled Note' : title,
          content,
          tag: selectedCategory,
        };
  
        if (title.trim() === '') {
          setTitle('Untitled Note');
        }
  
        const savedNote = await saveNoteToDatabase(noteToSave);
        if (noteData && noteData.id && savedNote) {
          setNoteData(savedNote);
          // navigation.setParams({ id: savedNote.id }); // remove this line
        } else if (!noteData && savedNote && savedNote.id) {
          // navigation.setParams({ id: savedNote.id }); // remove this line
          setNoteData(savedNote);
        }
      } catch (error) {
        console.error('Failed to auto-save note', error);
      }
    }, [isEditing, noteData, title, content, selectedCategory, navigation, autoSaveEnabled]);
  

  // Delete note handler
  const handleDelete = async () => {
    if (noteData && noteData.id) {
      try {
        await deleteNote(noteData.id);
        navigation.goBack();
      } catch (error) {
        console.error('Failed to delete note', error);
      }
    } else {
      navigation.goBack();
    }
  };

  const handleShare = () => {
    console.log('Share note:', { title, content });
    toggleOptions();
  };

  // Helper functions to get category color and icon based on category
  const getCategoryColor = (category) => {
    const cat = category.toLowerCase();
    switch (cat) {
      case 'personal': return '#8A2BE2';
      case 'work': return '#1E90FF';
      case 'ideas': return '#32CD32';
      case 'tasks': return '#FF8C00';
      default: return '#8A2BE2';
    }
  };

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    switch (cat) {
      case 'personal': return 'account';
      case 'work': return 'briefcase';
      case 'ideas': return 'lightbulb';
      case 'tasks': return 'clipboard-check';
      default: return 'bookmark';
    }
  };

  // While loading an existing note, show an ActivityIndicator
  if (id && !noteData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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
          {(isEditing || titleFocused || contentFocused) ? (
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
        <View style={[styles.dropdown, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
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
                <Text>{formattedDate()}</Text>
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedCategory) }]}>
                <MaterialCommunityIcons name={getCategoryIcon(selectedCategory)} size={14} color="white" />
                <Text style={styles.categoryText}>
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </Text>
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
                    selectedCategory.toLowerCase() === tag.id
                      ? { backgroundColor: getCategoryColor(tag.id) }
                      : { backgroundColor: 'transparent', borderColor: getCategoryColor(tag.id), borderWidth: 1 }
                  ]}
                  onPress={() => setSelectedCategory(tag.id)}
                >
                  <Ionicons
                    name={tag.icon}
                    size={16}
                    color={selectedCategory.toLowerCase() === tag.id ? "white" : getCategoryColor(tag.id)}
                  />
                  <Text style={[
                    styles.categoryItemText,
                    { color: selectedCategory.toLowerCase() === tag.id ? "white" : getCategoryColor(tag.id) }
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
                autoFocus={!id}
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
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
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
  headerActions: { flexDirection: 'row' },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12 },
  content: { flex: 1, paddingHorizontal: 24 },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  date: { fontSize: 14 },
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
  categorySelector: { marginTop: 16, marginBottom: 20, maxHeight: 50 },
  categorySelectorContent: { paddingRight: 20 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    height: 30,
  },
  categoryItemText: { fontSize: 14, fontWeight: '500', marginLeft: 8 },
  titleDisplay: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  contentText: { fontSize: 16, lineHeight: 26 },
  titleInput: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, padding: 0 },
  contentInput: { fontSize: 16, lineHeight: 26, minHeight: 300, padding: 0 },
  fabContainer: { position: 'absolute', right: 24, bottom: 32, flexDirection: 'row', alignItems: 'center' },
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
});

export default NotesDetailScreen;
