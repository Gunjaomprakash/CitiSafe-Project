# CitiSafe Frontend

The mobile application frontend for CitiSafe, built with React Native and Expo. This application provides a user-friendly interface for accessing all CitiSafe features including the AI safety assistant, smart navigation, and crime timelapse visualization.

## 🚀 Features

### Core Components
- **Navigation System**: Real-time route planning with safety assessment
- **AI Chat Interface**: Interactive safety assistant powered by Gemini Flash
- **Crime Timelapse**: Interactive visualization of historical crime data
- **User Authentication**: Secure login and profile management
- **Real-time Updates**: WebSocket integration for live data

## 🛠️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Google Maps API key
- Backend server running (see backend README)

### Installation
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start development server
npm start
```

### Environment Variables
Create a `.env` file with the following variables:
```
GOOGLE_MAPS_API_KEY=your_maps_api_key
BACKEND_URL=ws://localhost:5001
```

## 📁 Project Structure

```
frontend/
├── app/                    # Main application code
│   ├── navigation/        # Navigation configuration
│   ├── screens/          # Screen components
│   └── utils/            # Utility functions
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── maps/             # Map-related components
│   └── chat/             # Chat interface components
├── constants/             # App constants and configurations
│   ├── theme.ts          # UI theme configuration
│   └── config.ts         # App configuration
└── assets/               # Static assets
```

## 🔧 Key Components

### Navigation System
- Real-time route calculation
- Safety risk assessment
- Multiple route options
- Turn-by-turn navigation

### AI Chat Interface
- Real-time message handling
- Multi-modal input support
- Context-aware responses
- Safety alerts and updates

### Crime Timelapse
- Interactive map visualization
- Time-based data filtering
- Customizable heatmap display
- Risk factor analysis

## 📱 Available Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Build for production
npm run build
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e
```

## 📦 Dependencies

### Core
- react-native
- expo
- @react-navigation/native
- react-native-maps
- @react-native-async-storage/async-storage

### UI Components
- react-native-paper
- react-native-vector-icons
- react-native-reanimated

### State Management
- @reduxjs/toolkit
- react-redux

### Maps & Location
- react-native-maps
- react-native-geolocation-service

### Real-time Communication
- socket.io-client

## 🔐 Security Considerations

- API key management
- Secure WebSocket connections
- User data protection
- Location data privacy

## 📚 Documentation

- [Component Documentation](./docs/components.md)
- [API Integration](./docs/api.md)
- [State Management](./docs/state.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
