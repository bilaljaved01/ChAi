import User from "../models/user.model.js";
import connectDB from "../db/connection.js";
import dotenv from "dotenv";

dotenv.config();

async function createGeminiBot() {
  await connectDB();

  const botExists = await User.findOne({ email: "gemini@chatapp.com" });

  if (!botExists) {
    const bot = new User({
      fullName: "Gemini AI",
      email: "gemini@chatapp.com",
      password: "dummy-password",
      profilePic: "https://api.dicebear.com/7.x/bottts/png?seed=Gemini",
      isBot: true,
    });

    await bot.save();
    console.log("Gemini AI bot created successfully");
  } else {
    console.log("Gemini AI bot already exists");
  }

  process.exit(0);
}

createGeminiBot();
