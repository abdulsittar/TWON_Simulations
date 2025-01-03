# Use the official Node.js image as the base image
FROM node:20.2.0

# Set working directory inside the container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the backend port (for example, 5000)
EXPOSE 5000

# Set the command to run your application
CMD ["npm", "run", "dev"]
