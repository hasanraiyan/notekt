import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Animated,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getAllNotes, updateNote, deleteNote } from '../database/database';

const TAGS = [
  { id: 'all', name: 'All', icon: 'apps-outline' },
  { id: 'personal', name: 'Personal', icon: 'person-outline' },
  { id: 'work', name: 'Work', icon: 'briefcase-outline' },
  { id: 'ideas', name: 'Ideas', icon: 'bulb-outline' },
  { id: 'tasks', name: 'Tasks', icon: 'checkbox-outline' }
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'alphabetical', name: 'Alphabetical' }
];

function getTagColor(tagId) {
  switch (tagId) {
    case 'personal': return '#FF6B6B';
    case 'work': return '#4D96FF';
    case 'ideas': return '#FFD166';
    case 'tasks': return '#06D6A0';
    default: return '#7885FF';
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

const NoteItem = ({ item, onPress, onLongPress, theme }) => {
  const tagColor = getTagColor(item.tag);

  return (
    <TouchableOpacity
      style={[
        styles.noteItem,
        {
          backgroundColor: theme.secondaryBackground,
          borderLeftColor: tagColor || theme.primary,
          shadowColor: theme.shadowColor
        }
      ]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={500}
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, { color: theme.textColor }]} numberOfLines={1}>
          {item.title || "Untitled Note"}
        </Text>
        {item.isPinned && (
          <Ionicons name="pin" size={16} color={theme.primary} style={styles.pinIcon} />
        )}
      </View>

      <Text style={[styles.noteContent, { color: theme.secondaryTextColor }]} numberOfLines={2}>
        {item.content || "No content"}
      </Text>

      <View style={styles.noteFooter}>
        <Text style={[styles.noteDate, { color: theme.tertiaryTextColor }]}>
          {formatDate(item.date)}
        </Text>
        {item.tag && item.tag !== 'all' && (
          <View style={[styles.tagBadge, { backgroundColor: tagColor + '20' }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>
              {TAGS.find(t => t.id === item.tag)?.name || item.tag}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = ({ theme, isDarkMode, searchTerm, selectedTag, onAddNote }) => (
  <View style={styles.emptyStateContainer}>
    <Image
      source={
        isDarkMode
          ? require('../assets/images/empty-box-dark.png')
          : require('../assets/images/empty-box.png')
      }
      style={[styles.emptyStateImage, { backgroundColor: theme.background }]}
    />
    {searchTerm ? (
      <>
        <Text style={[styles.emptyStateTitle, { color: theme.textColor }]}>
          No results found
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: theme.secondaryTextColor }]}>
          No notes match "<Text style={{ color: theme.secondaryTextColor }}>{searchTerm}</Text>"
        </Text>
      </>
    ) : selectedTag !== 'all' ? (
      <>
        <Text style={[styles.emptyStateTitle, { color: theme.textColor }]}>
          No {TAGS.find(t => t.id === selectedTag)?.name || selectedTag} notes
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: theme.secondaryTextColor }]}>
          Create your first note in this category
        </Text>
      </>
    ) : (
      <>
        <Text style={[styles.emptyStateTitle, { color: theme.textColor }]}>
          No notes yet
        </Text>
        <Text style={[styles.emptyStateSubtitle, { color: theme.secondaryTextColor }]}>
          Tap the + button to create your first note
        </Text>
      </>
    )}
    <TouchableOpacity
      style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
      onPress={onAddNote}
    >
      <Ionicons name="add" size={20} color="white" style={styles.emptyStateButtonIcon} />
      <Text style={styles.emptyStateButtonText}>Create Note</Text>
    </TouchableOpacity>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const searchInputRef = useRef(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;

  const loadNotes = async () => {
    try {
      const fetchedNotes = await getAllNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Failed to load notes', error);
      Alert.alert('Error', 'Failed to load your notes. Please try again.');
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  useEffect(() => {
    let result = [...notes];

    if (selectedTag !== 'all') {
      result = result.filter(note => note.tag === selectedTag);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        note =>
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term)
      );
    }

    result = sortNotes(result, sortOption);
    setFilteredNotes(result);
  }, [notes, searchTerm, selectedTag, sortOption]);

  const sortNotes = (notesToSort, option) => {
    switch (option) {
      case 'newest':
        return [...notesToSort].sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'oldest':
        return [...notesToSort].sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'alphabetical':
        return [...notesToSort].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return notesToSort;
    }
  };

  const toggleSearch = () => {
    if (isSearchVisible) {
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start(() => {
        setIsSearchVisible(false);
        setSearchTerm('');
      });
    } else {
      setIsSearchVisible(true);
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  // Pass note data along with a refresh callback when navigating
  const handleNotePress = (note) => {
    navigation.navigate('NoteDetail', { note, refresh: loadNotes });
  };

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      date: new Date().toISOString(),
      tag: selectedTag !== 'all' ? selectedTag : 'personal',
      isPinned: false
    };
    navigation.navigate('NoteDetail', { note: newNote, refresh: loadNotes });
  };

  const handleNoteLongPress = (note) => {
    Alert.alert(
      'Note Options',
      'What would you like to do?',
      [
        {
          text: note.isPinned ? 'Unpin Note' : 'Pin Note',
          onPress: () => togglePinNote(note)
        },
        {
          text: 'Delete Note',
          onPress: () => confirmDeleteNote(note),
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const togglePinNote = async (note) => {
    try {
      const updatedNote = { ...note, isPinned: !note.isPinned };
      await updateNote(updatedNote);
      loadNotes();
      Alert.alert(
        note.isPinned ? 'Note Unpinned' : 'Note Pinned',
        note.isPinned
          ? 'The note has been unpinned'
          : 'The note has been pinned to the top of your list'
      );
    } catch (error) {
      console.error('Failed to update note pin status', error);
      Alert.alert('Error', 'Failed to update note. Please try again.');
    }
  };

  const confirmDeleteNote = (note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteNote(note.id);
              loadNotes();
            } catch (error) {
              console.error('Failed to delete note', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={[styles.header, { backgroundColor: theme.headerBackground || theme.background, borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Noty KT</Text>
        <View style={styles.headerActions}>
          {notes.length > 0 && (
            <>
              <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.secondaryBackground }]} onPress={toggleSearch}>
                <Ionicons name={isSearchVisible ? "close-outline" : "search-outline"} size={22} color={theme.textColor} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.secondaryBackground }]} onPress={() => setIsSortModalVisible(true)}>
                <Ionicons name="funnel-outline" size={22} color={theme.textColor} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.secondaryBackground }]} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={22} color={theme.textColor} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.secondaryBackground,
            height: searchAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }),
            opacity: searchAnimation,
            marginBottom: searchAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 10] })
          }
        ]}
      >
        {isSearchVisible && (
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={theme.secondaryTextColor} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.textColor }]}
              placeholder="Search notes..."
              placeholderTextColor={theme.secondaryTextColor}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              onBlur={() => {
                if (!searchTerm) {
                  Animated.timing(searchAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                  }).start(() => {
                    setIsSearchVisible(false);
                  });
                }
              }}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={theme.secondaryTextColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.View>

      <View style={styles.tagFilterContainer}>
        <ScrollableTagFilter tags={TAGS} selectedTag={selectedTag} onSelectTag={setSelectedTag} theme={theme} />
      </View>

      {filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          renderItem={({ item }) => (
            <NoteItem item={item} onPress={handleNotePress} onLongPress={handleNoteLongPress} theme={theme} />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyStateAbsoluteContainer}>
          <EmptyState theme={theme} isDarkMode={isDarkMode} searchTerm={searchTerm} selectedTag={selectedTag} onAddNote={handleAddNote} />
        </View>
      )}

      {notes.length > 0 && (
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddNote}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      <Modal visible={isSortModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsSortModalVisible(false)}>
          <View style={[styles.sortModal, { backgroundColor: theme.secondaryBackground, shadowColor: theme.shadowColor }]}>
            <Text style={[styles.sortModalTitle, { color: theme.textColor }]}>Sort Notes</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.sortOption, sortOption === option.id && { backgroundColor: theme.primary + '20' }]}
                onPress={() => {
                  setSortOption(option.id);
                  setIsSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: sortOption === option.id ? theme.primary : theme.textColor }]}>
                  {option.name}
                </Text>
                {sortOption === option.id && <Ionicons name="checkmark" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const ScrollableTagFilter = ({ tags, selectedTag, onSelectTag, theme }) => {
  return (
    <FlatList
      data={tags}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.tagListContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.tagItem,
            selectedTag === item.id
              ? { backgroundColor: theme.primary }
              : { backgroundColor: theme.secondaryBackground }
          ]}
          onPress={() => onSelectTag(item.id)}
        >
          <Ionicons name={item.icon} size={16} color={selectedTag === item.id ? 'white' : theme.textColor} style={styles.tagIcon} />
          <Text style={[styles.tagName, { color: selectedTag === item.id ? 'white' : theme.textColor }]}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginBottom: 20,
    zIndex: 2,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', padding: 10, zIndex: 2 },
  headerButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  searchContainer: { marginHorizontal: 20, borderRadius: 10, overflow: 'hidden' },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchInput: { flex: 1, height: 40, marginLeft: 8, fontWeight: '400' },
  tagFilterContainer: { height: 50, marginBottom: 10 },
  tagListContent: { paddingHorizontal: 16 },
  tagItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  tagIcon: { marginRight: 6 },
  tagName: { fontWeight: '500', fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  noteItem: { padding: 16, marginBottom: 12, borderRadius: 12, borderLeftWidth: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  noteTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  pinIcon: { marginLeft: 6 },
  noteContent: { fontSize: 14, marginBottom: 12 },
  noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteDate: { fontSize: 12 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 12, fontWeight: '500' },
  addButton: { position: 'absolute', right: 20, bottom: 20, width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  emptyStateContainer: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyStateAbsoluteContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  emptyStateImage: { width: 180, height: 180, marginBottom: 20, resizeMode: 'contain', opacity: 0.8 },
  emptyStateTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  emptyStateSubtitle: { fontSize: 16, textAlign: 'center', maxWidth: '80%', marginBottom: 25 },
  emptyStateButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  emptyStateButtonIcon: { marginRight: 8 },
  emptyStateButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  sortModal: { width: '80%', borderRadius: 15, padding: 20, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  sortModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginBottom: 8 },
  sortOptionText: { fontSize: 16 },
});

export default HomeScreen