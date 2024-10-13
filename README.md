# Weather Station

This script fetches weather information from the Open Meteo API and sends a notification via Telegram Bot API.

## Prerequisites

- Node.js installed
- Telegram Bot API Access Token
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
   ACCESS_TOKEN=telegram_bot_api_access_token
	CHAT_ID=chat_id
   LATITUDE=your_latitude
   LONGITUDE=your_longitude
   TIMEZONE=your_timezone
   ```

4. Run the script:

   ```bash
   npm start
   ```

## Features

- Fetches current weather information and a 5-hour forecast.
- Notifies the information using Telegram Bot API.
