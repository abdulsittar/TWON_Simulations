import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/simulation",
    JWT_SECRET: process.env.JWT_SECRET || "defaultsecret",
    PORT: process.env.PORT || 5000,
};
