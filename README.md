# CitiSafe - Smart Urban Safety Navigation

A comprehensive urban safety navigation system built during the 24-hour HackDePaul hackathon by DePaul University's Data Science Club. CitiSafe combines real-time crime data, AI-powered assistance, and interactive visualization to help users navigate cities safely.

## 🚀 Features

### 1. AI-Powered Safety Assistant
- Real-time chat interface powered by Google's Gemini Flash multi-modal LLM
- Text, image, and video analysis for incident reporting
- Personalized safety updates and alerts
- Natural language understanding for user queries

### 2. Smart Navigation System
- Multiple route options with real-time risk assessment
- Dynamic safety alerts and updates
- Virtual safety guide with personalized assistance
- SOS functionality for emergency situations
- Real-time route adjustments based on safety data

### 3. Interactive Crime Timelapse
- Historical crime data visualization
- Monthly and yearly crime pattern analysis
- Interactive heatmap with risk factors
- Customizable time range and location selection

## 📁 Project Structure

```
citisafe/
├── frontend/           # React Native mobile application
│   ├── app/           # Main application code
│   ├── components/    # Reusable UI components
│   └── constants/     # App constants and configurations
├── backend/           # Python Flask backend server
│   ├── app/          # Main application code
│   ├── data/         # Data processing and storage
│   └── websocket/    # Real-time communication handlers
└── README.md         # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- Google Maps API key
- Google Gemini API key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure environment variables
cp .env.example .env
# Add your API keys to .env
npm start
```

## 🔧 Technical Stack

### Frontend
- React Native with TypeScript
- Expo for cross-platform development
- Google Maps API for navigation
- WebSocket for real-time updates
- React Navigation for routing
- Custom UI components with theme support

### Backend
- Python with Flask
- WebSocket for real-time communication
- Google Gemini Flash API for AI features
- Pandas & NumPy for data processing
- Gevent for async operations

## 📱 App Screenshots

[Placeholder for app screenshots]

## 🔐 Environment Variables

### Frontend (.env)
```
GOOGLE_MAPS_API_KEY=your_maps_api_key
BACKEND_URL=ws://localhost:5001
```

### Backend (.env)
```
AI_API_KEY=your_ai_api_key
FLASK_ENV=development
```

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./backend/API.md)

## 🤝 Contributing

This project was developed during the HackDePaul hackathon. For any questions or contributions, please contact the team.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- DePaul University's Data Science Club
- HackDePaul organizers
- Google Gemini Flash API
- All team members who contributed to this project

## 📞 Contact

For any questions or support, please reach out to the team at [your-email@example.com] 