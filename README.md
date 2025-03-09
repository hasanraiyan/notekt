# Notekt - A Simple Notes App

Notekt is a basic notes application built with React Native and Expo. It allows users to create, edit, delete, and save notes locally on their device.

## Features

*   **Authentication:** Simple authentication flow with login and signup screens. Uses a dummy token for demonstration purposes.
*   **Note Creation:** Create new notes with a title and content.
*   **Note Editing:** Edit existing notes.
*   **Note Deletion:** Delete notes.
*   **Local Storage:** Notes are stored locally using AsyncStorage.
*   **Dark Mode:** Toggle between light and dark mode.

## Technologies Used

*   React Native
*   Expo
*   React Navigation
*   AsyncStorage

## Project Structure

```
notekt/
├── .gitignore
├── App.js                  # Main application component
├── app.json                # Expo configuration file
├── index.js                # Entry point for the application
├── package-lock.json
├── package.json
├── assets/
│   └── images/
│       ├── empty-box.png   # Image for empty state
│       └── icon.png        # App icon
├── context/
│   └── AuthContext.js      # Authentication context
├── navigation/
│   └── NavigationStacks.js # Navigation stacks
└── screens/
    ├── HomeScreen.js       # Home screen with list of notes
    ├── LoginScreen.js      # Login screen
    ├── NotesDetailScreen.js# Note detail screen for creating/editing notes
    ├── SignupScreen.js     # Signup screen
    └── SplashScreen.js     # Splash screen
```

## Setup

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Start the application:

    ```bash
    expo start
    ```

## Notes

*   This is a simplified notes application and does not include features such as cloud storage or advanced editing capabilities.
*   The authentication is implemented with a dummy token and is not secure.
