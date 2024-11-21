require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const User = require("./models/userModel");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start Command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Welcome to the Weather Bot! Use /subscribe to receive daily weather updates.`
  );
});

// Subscribe Command
bot.onText(/\/subscribe/, async (msg) => {
  const { id, first_name } = msg.chat;

  try {
    let user = await User.findOne({ chatId: id });
    if (!user) {
      user = new User({ chatId: id, name: first_name });
      await user.save();
      bot.sendMessage(id, "You have successfully subscribed to weather updates!");
    } else {
      bot.sendMessage(id, "You are already subscribed!");
    }
  } catch (error) {
    console.error("Subscription error:", error);
    bot.sendMessage(id, "An error occurred. Please try again later.");
  }
});

// Fetch and send weather updates
async function sendWeatherUpdates() {
  const users = await User.find();
  for (const user of users) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${process.env.WEATHER_API_KEY}`
      );
      const weather = response.data.weather[0].description;
      bot.sendMessage(user.chatId, `Today's weather: ${weather}`);
    } catch (error) {
      console.error("Weather update error:", error);
    }
  }
}

// Schedule weather updates (daily at 9 AM)
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 9 && now.getMinutes() === 0) {
    sendWeatherUpdates();
  }
}, 60000);
