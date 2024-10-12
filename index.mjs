const LABELS = {
  temperature_2m: "🌡️",
  wind_speed_10m: "💨",
  apparent_temperature: "🌻",
  rain: "☔",
  snowfall: "🌨️",
};

const lineNotify = async (message) => {
  const token = process.env.LINE_ACCESS_TOKEN;
  const url = `https://notify-api.line.me/api/notify`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${token}`,
  };
  const body = {
    message,
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: new URLSearchParams(body),
  });
  if (!response.ok)
    throw new Error(
      `Error sending LINE notification: ${response.status} ${response.statusText}`
    );

  return response.json();
};

const lineMessage = async (message) => {
  const token = process.env.LINE_ACCESS_TOKEN;
  const url = `https://api.line.me/v2/bot/message/push`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const body = {
    to: process.env.USER_OR_GROUP_ID,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(
      `Error sending LINE message API: ${response.status} ${response.statusText}`
    );

  return response.json();
};

const getWeather = async (lat, lng, timezone = "GMT") => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,apparent_temperature,rain,snowfall&hourly=temperature_2m,wind_speed_10m,apparent_temperature,rain,snowfall&timezone=${timezone}&forecast_days=2`;

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `Error fetching weather: ${response.status} ${response.statusText}`
    );

  return response.json();
};

const getNextHour = (currentHour) => {
  // 2024-01-28T20:30
  const matches = /\d{4}-\d{2}-\d{2}T(?<hour>\d{2}):(?<minute>\d{2})/.exec(
    currentHour ?? ""
  );
  if (!matches) throw new Error(`Invalid current hour: ${currentHour}`);
};

const formatMessage = async (weather) => {
  const { current, current_units, hourly, hourly_units } = weather;
  const currentWeather = [
    "temperature_2m",
    "wind_speed_10m",
    "apparent_temperature",
    "rain",
    "snowfall",
  ].reduce((result, key) => {
    result.push(`${LABELS[key]}: ${current[key]}${current_units[key]}`);
    return result;
  }, []);

  const { time: currentTime } = current;
  const adjustedCurrentTime = currentTime.replace(/:(?<minute>\d{2})$/, ":00");

  const currentTimeIndex = hourly?.time?.indexOf(adjustedCurrentTime) ?? -1;
  if (currentTimeIndex === -1) return `Current:\n${currentWeather.join(", ")}`;

  let nextHoursWeather = `Forecast:\n`;
  for (let i = 1; i <= 5; i++) {
    const nextHourIndex = currentTimeIndex + i;
    const nextForecast = [
      "temperature_2m",
      "wind_speed_10m",
      "apparent_temperature",
      "rain",
      "snowfall",
    ].reduce((result, key) => {
      result.push(
        `${LABELS[key]}: ${hourly[key][nextHourIndex]}${hourly_units[key]}`
      );
      return result;
    }, []);
    nextHoursWeather += `Next ${i}h: ${nextForecast.join(", ")}\n`;
  }

  return `Current:\n${currentWeather.join(", ")}\n\n${nextHoursWeather}`;
};

async function main() {
  const lat = process.env.LATITUDE;
  const lng = process.env.LONGITUDE;
  const timezone = process.env.TIMEZONE;

  if (!(lat || lng)) throw new Error(`You must provide latitude and longitude`);

  const weather = await getWeather(lat, lng, timezone);
  const formattedMessage = await formatMessage(weather);

  await lineMessage(formattedMessage);
  console.log(`Message sent: ${formattedMessage}`);
}

main().catch((error) => {
  console.log(`ERROR: `, error);

  process.exit(1);
});
