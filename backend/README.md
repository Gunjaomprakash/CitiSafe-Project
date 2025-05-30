# Backend for CrimeApp

A modular Flask server with WebSocket support and three main routes:
- /chat: Chat with Gemini
- /navigation: Provide multiple routes (source, destination)
- /timelapse: Provide data for crime heatmap (place, year)

## Structure
- app/: Main application package
- app/routes/: Route blueprints
- app/websocket/: WebSocket logic
- app/utils/: Utility functions
- run.py: Entrypoint
- requirements.txt: Dependencies
