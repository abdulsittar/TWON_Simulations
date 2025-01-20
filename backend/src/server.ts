import { ENV } from "./config/env";
import connectDB from "./config/db";
import httpServer  from "./app";

const startServer = async () => {
    try {
        await connectDB();
        
        httpServer.listen(ENV.PORT, () => {
            console.log(`Server running on port ${ENV.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();