from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime
import math
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

timelapse_bp = Blueprint("timelapse", __name__)

# Load the crime data with risk factors
risk_df = pd.read_csv('/Users/omprakashgunja/Documents/GitHub/crimeapp/backend/app/data/Crimes_df_with_risk.csv')

# Parse the date column correctly
risk_df['Date'] = pd.to_datetime(risk_df['Date'], format='%Y-%m-%d %H:%M:%S')
# Extract year from the parsed date
risk_df['year'] = risk_df['Date'].dt.year

# Convert numeric columns to Python native types
numeric_columns = ['Latitude', 'Longitude', 'severity_score', 'risk_factor']
for col in numeric_columns:
    risk_df[col] = risk_df[col].astype(float)

# Log the coordinate range and sample data
logger.info(f"Dataset coordinate range:")
logger.info(f"Latitude: {risk_df['Latitude'].min()} to {risk_df['Latitude'].max()}")
logger.info(f"Longitude: {risk_df['Longitude'].min()} to {risk_df['Longitude'].max()}")
logger.info(f"Total records: {len(risk_df)}")
logger.info(f"Available years: {sorted(risk_df['year'].unique())}")
logger.info("\nSample coordinates from dataset:")
logger.info(risk_df[['Latitude', 'Longitude', 'Date', 'year', 'risk_factor', 'severity_score']].head().to_string())

def is_within_radius(lat1, lon1, lat2, lon2, radius_km):
    """
    Calculate if two points are within the specified radius using the Haversine formula
    """
    R = 6371  # Earth's radius in kilometers

    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return distance <= radius_km

@timelapse_bp.route("/", methods=["GET"])
def timelapse():
    # Get logger inside the function to avoid reload issues
    current_logger = logging.getLogger(__name__)
    current_logger.info("Received timelapse request")
    current_logger.info(f"Request args: {request.args}")
    
    try:
        # Parse inputs
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        radius_km = float(request.args.get('radius_km'))
        year = int(request.args.get('year'))

        current_logger.info(f"Parsed parameters: lat={lat}, lon={lon}, radius_km={radius_km}, year={year}")
        current_logger.info(f"Available years in dataset: {sorted(risk_df['year'].unique())}")

        # Filter by year using the parsed year column
        df_year = risk_df[risk_df['year'] == year]
        current_logger.info(f"Found {len(df_year)} records for year {year}")
        
        if len(df_year) == 0:
            current_logger.warning(f"No data found for year {year}. Available years are: {sorted(risk_df['year'].unique())}")
            # If no data for requested year, use the most recent year available
            latest_year = max(risk_df['year'].unique())
            current_logger.info(f"Using latest available year: {latest_year}")
            df_year = risk_df[risk_df['year'] == latest_year]
            year = latest_year

        # Filter by radius
        df_filtered = df_year[df_year.apply(
            lambda row: is_within_radius(lat, lon, row['Latitude'], row['Longitude'], radius_km), axis=1
        )]
        current_logger.info(f"Found {len(df_filtered)} records within {radius_km}km radius")
        
        if len(df_filtered) == 0:
            current_logger.warning(f"No data found within {radius_km}km radius. Showing sample data for debugging.")
            current_logger.info(f"Sample data points near the requested location:")
            sample_points = df_year.head(5)
            current_logger.info(sample_points[['Latitude', 'Longitude', 'Date', 'year', 'risk_factor']].to_string())

        # Convert to the required format with risk factors and severity scores
        heatmap_data = {
            "place": f"Location: {lat}, {lon}",
            "year": int(year),  # Convert to Python int
            "data": [
                {
                    "lat": float(row['Latitude']),  # Convert to Python float
                    "lng": float(row['Longitude']),  # Convert to Python float
                    "intensity": float(row['risk_factor']),  # Convert to Python float
                    "severity": float(row['severity_score']),  # Convert to Python float
                    "type": str(row['Primary Type']),  # Convert to Python string
                    "description": str(row['Description']),  # Convert to Python string
                    "risk_level": str(row['risk_level']),  # Convert to Python string
                    "date": row['Date'].strftime('%Y-%m-%d %H:%M:%S')  # Format date as string
                }
                for _, row in df_filtered.iterrows()
            ]
        }

        # Log the data being sent
        current_logger.info(f"Sample data point being sent: {heatmap_data['data'][0] if heatmap_data['data'] else 'No data points'}")
        current_logger.info(f"Returning {len(heatmap_data['data'])} data points")
        return jsonify(heatmap_data)

    except Exception as e:
        current_logger.error(f"Error processing timelapse request: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400
