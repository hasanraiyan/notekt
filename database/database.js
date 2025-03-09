import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_STORAGE_KEY = 'NOTES';

export const initDB = async () => {
  try {
    const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (existingNotes === null) {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([]));
      console.log('Initialized notes in AsyncStorage');
    } else {
      console.log('Notes already exist in AsyncStorage');
    }
  } catch (error) {
    console.error('Error initializing notes in AsyncStorage:', error);
  }
};

export const addNote = async (title, content, tag = 'personal') => {

  try {
    const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      tag,
      date: new Date().toISOString(),
      isPinned: false,
    };
    notes.push(newNote);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    console.log('Note added successfully:', newNote.id);
    return newNote;
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
};

export const getNoteById = async (id) => {
  try {
    const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    const note = notes.find((note) => note.id === id);
    return note || null;
  } catch (error) {
    console.error('Error retrieving note:', error);
    return null;
  }
};

export const getAllNotes = async () => {
  try {
    const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    return notes;
  } catch (error) {
    console.error('Error retrieving notes:', error);
    return [];
  }
};

export const deleteNote = async (id) => {
  try {
    const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    let notes = existingNotes ? JSON.parse(existingNotes) : [];
    notes = notes.filter((note) => note.id !== id);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    console.log('Note deleted successfully:', id);
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};

export const clearDB = async () => {
  try {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    console.log('All notes deleted successfully');
    return true;
  } catch (error) {
    console.error('Error clearing notes:', error);
    return false;
  }
};

export const updateNote = async (id, title, content, tag) => {
  console.log('updateNote - id:', id);
  try {
    const existingNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    let notes = [];
    if (existingNotes) {
      notes = JSON.parse(existingNotes);
    } else {
      console.log('updateNote - existingNotes is null, initializing notes');
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([]));
    }
    console.log('updateNote - notes:', notes);
    const noteIndex = notes.findIndex((note) => note.id === id);

    if (noteIndex !== -1) {
      notes[noteIndex] = {
        ...notes[noteIndex],
        title,
        content,
        tag,
        date: new Date().toISOString(), // Optionally update the date on update
      };
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      console.log('Note updated successfully:', id);
      return notes[noteIndex];
    } else {
      console.log('Note not found for update:', id);
      return null; // Note not found
    }
  } catch (error) {
    console.error('Error updating note:', error);
    return null;
  }
};
