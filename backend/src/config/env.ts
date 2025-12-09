import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    MONGO_URI: "mongodb+srv://abdulsittar72:2106010991As@cluster0.gsnbbwq.mongodb.net/toxicity",
    JWT_SECRET: process.env.JWT_SECRET || "defaultsecret",
    PORT: process.env.PORT || 5000,
};
