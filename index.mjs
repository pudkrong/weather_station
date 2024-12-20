import "dotenv/config";

const TELEGRAM_URL = "https://api.telegram.org";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const LABELS = {
  temperature_2m: "🌡️",
  wind_speed_10m: "💨",
  apparent_temperature: "🌻",
  rain: "☔",
  snowfall: "🌨️",
};

const notifyToTelegram = async (message) => {
  const res = await fetch(`${TELEGRAM_URL}/bot${ACCESS_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
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
      "apparent_temperature",
      "rain",
      "snowfall",
      "wind_speed_10m",
    ].reduce((result, key) => {
      result.push(
        `${LABELS[key]}: ${hourly[key][nextHourIndex]}${hourly_units[key]}`
      );
      return result;
    }, []);
    const nextHourText = hourly["time"][nextHourIndex]?.replace(
      /[\d-]+T(\d{2})\:\d+/,
      "$1"
    );
    nextHoursWeather += `Next ${nextHourText}h: ${nextForecast
      .map((s) => s.padEnd(12))
      .join("")}\n`;
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

  await notifyToTelegram(formattedMessage);
  console.log(`Message sent: ${formattedMessage}`);
}

main().catch((error) => {
  console.log(`ERROR: `, error);

  process.exit(1);
});
