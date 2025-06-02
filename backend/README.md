# CitiSafe Backend

The backend server for CitiSafe, built with Python and Flask. This server handles real-time communication, AI-powered safety analysis, and data processing for the CitiSafe mobile application.

## 🚀 Features

### Core Services
- **WebSocket Server**: Real-time communication with frontend
- **AI Integration**: Google Gemini Flash API integration
- **Data Processing**: Crime data analysis and risk assessment
- **Route Analysis**: Safety-aware route calculation
- **Timelapse Generation**: Historical crime data visualization

## 🛠️ Development Setup

### Prerequisites
- Python 3.8+
- pip
- Google Gemini API key
- Virtual environment (recommended)

### Installation
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start the server
python run.py
```

### Environment Variables
Create a `.env` file with the following variables:
```
AI_API_KEY=your_ai_api_key
FLASK_ENV=development
FLASK_APP=run.py
```

## 📁 Project Structure

```
backend/
├── app/                    # Main application code
│   ├── routes/            # API route handlers
│   ├── models/            # Data models
│   └── services/          # Business logic
├── data/                  # Data processing and storage
│   ├── crime_data/       # Crime data files
│   └── processed/        # Processed data cache
├── websocket/            # WebSocket handlers
│   ├── chat.py          # Chat functionality
│   └── navigation.py    # Navigation updates
└── utils/               # Utility functions
```

## 🔧 Key Components

### WebSocket Server
- Real-time communication
- Connection management
- Message handling
- Error recovery

### AI Integration
- Gemini Flash API integration
- Multi-modal analysis
- Context management
- Response generation

### Data Processing
- Crime data analysis
- Risk assessment
- Route optimization
- Timelapse generation

## 📊 API Endpoints

### WebSocket Routes
- `/ws/chat`: Chat interface
- `/ws/navigation`: Navigation updates
- `/ws/timelapse`: Timelapse data

### REST Endpoints
- `/api/health`: Health check
- `/api/routes`: Route calculation
- `/api/analysis`: Safety analysis

## 🧪 Testing

```bash
# Run unit tests
python -m pytest

# Run with coverage
python -m pytest --cov=app tests/
```

## 📦 Dependencies

### Core
- Flask
- gevent
- websockets
- python-dotenv

### AI & Data Processing
- google-generativeai
- pandas
- numpy
- scikit-learn

### Utilities
- python-dateutil
- requests
- geopy

## 🔐 Security Considerations

- API key management
- WebSocket security
- Data encryption
- Rate limiting
- Input validation

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [WebSocket Protocol](./docs/websocket.md)
- [Data Processing](./docs/data.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔍 Monitoring

The server includes monitoring endpoints for:
- Health checks
- Performance metrics
- Error tracking
- Usage statistics

## 🚨 Error Handling

- Comprehensive error logging
- Graceful error recovery
- Client notification system
- Automatic reconnection

## 📈 Performance Optimization

- Connection pooling
- Data caching
- Async processing
- Load balancing support
