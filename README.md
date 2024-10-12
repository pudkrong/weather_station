# Weather Station

This script fetches weather information from the Open Meteo API and sends a notification via LINE Message API.

## Prerequisites

- Node.js installed
- LINE Message API Access Token
- Latitude and Longitude coordinates
- Open Meteo API key

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/pudkrong/weather_station.git
   cd weather_station
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the project root and add the following:

   ```env
   LINE_ACCESS_TOKEN=your_line_message_api_access_token
   USER_OR_GROUP_ID=user_or_group_id
   LATITUDE=your_latitude
   LONGITUDE=your_longitude
   TIMEZONE=your_timezone
   ```

4. Run the script:

   ```bash
   npm start
   ```

## Environment Variables

- `LINE_ACCESS_TOKEN`: Access token for LINE Notify.
- `USER_OR_GROUP_ID`: User or Group ID which you want to send message to
- `LATITUDE`: Latitude coordinates for the weather location.
- `LONGITUDE`: Longitude coordinates for the weather location.
- `TIMEZONE`: Timezone of the location (default: GMT).

## Features

- Fetches current weather information and a 5-hour forecast.
- Notifies the information using LINE Message API.
