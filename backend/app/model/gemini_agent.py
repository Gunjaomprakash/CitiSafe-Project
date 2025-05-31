from typing import List, Dict, Any, Callable
import google.generativeai as genai
from datetime import datetime
import json
import os
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

class ToolCategory(Enum):
    SEARCH = "search"
    DATA_MANAGEMENT = "data_management"
    ANALYSIS = "analysis"

@dataclass
class Tool:
    name: str
    description: str
    category: ToolCategory
    function: Callable
    parameters: Dict[str, Any]

class GeminiAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.tools: Dict[str, Tool] = {}
        self._register_default_tools()
        self.incidents_file = Path("app/data/incidents.json")
        self.incidents_file.parent.mkdir(parents=True, exist_ok=True)
        if not self.incidents_file.exists():
            self.incidents_file.write_text("[]")

    def _register_default_tools(self):
        self.register_tool(
            name="log_incident",
            description="Log a security incident with details like description, location, severity, and timestamp",
            category=ToolCategory.DATA_MANAGEMENT,
            function=self.log_incident,
            parameters={
                "description": {"type": "string", "description": "Description of the incident"},
                "location": {"type": "string", "description": "Location where the incident occurred"},
                "severity": {"type": "string", "description": "Severity level (low/medium/high)"},
                "additional_details": {"type": "object", "description": "Any additional details about the incident"}
            }
        )

        self.register_tool(
            name="web_search",
            description="Search the web for information about security incidents, threats, or related topics",
            category=ToolCategory.SEARCH,
            function=self.web_search,
            parameters={
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Maximum number of results to return"}
            }
        )

    def register_tool(self, name: str, description: str, category: ToolCategory, 
                     function: Callable, parameters: Dict[str, Any]):
        """Register a new tool with the agent"""
        self.tools[name] = Tool(
            name=name,
            description=description,
            category=category,
            function=function,
            parameters=parameters
        )

    def chat(self, message: str) -> Dict[str, Any]:
        try:
            # Create a system prompt that includes available tools
            tools_description = self._get_tools_description()
            system_prompt = f"""You are a security assistant with access to the following tools:
            {tools_description}
            Keep your responses concise and to the point.
            When a user asks for something that can be done with these tools, explain what you can do and ask for permission to use the appropriate tool.
            """
            
            response = self.model.generate_content(
                contents=[system_prompt, message]
            )
            return {
                "reply": response.text,
                "status": "success"
            }
        except Exception as e:
            return {
                "reply": f"Error: {str(e)}",
                "status": "error"
            }

    def _get_tools_description(self) -> str:
        """Generate a description of all available tools"""
        descriptions = []
        for tool in self.tools.values():
            param_desc = "\n".join([f"  - {name}: {details['description']}" 
                                  for name, details in tool.parameters.items()])
            descriptions.append(f"""
            Tool: {tool.name}
            Category: {tool.category.value}
            Description: {tool.description}
            Parameters:
            {param_desc}
            """)
        return "\n".join(descriptions)

    def log_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            incidents = json.loads(self.incidents_file.read_text())
            incident_data["timestamp"] = datetime.now().isoformat()
            incidents.append(incident_data)
            self.incidents_file.write_text(json.dumps(incidents, indent=2))
            return {
                "status": "success",
                "message": "Incident logged successfully",
                "incident_id": len(incidents)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to log incident: {str(e)}"
            }

    def web_search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        # This is a placeholder for web search functionality
        # You would need to implement actual web search using a service like Google Custom Search API
        return {
            "status": "success",
            "message": f"Web search results for: {query}",
            "results": [],  # Placeholder for actual search results
            "max_results": max_results
        }

    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get detailed information about all available tools"""
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "category": tool.category.value,
                "parameters": tool.parameters
            }
            for tool in self.tools.values()
        ] 