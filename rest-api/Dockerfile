# Use official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files from current directory to container's /app directory
COPY . .

# Expose the port on which your app runs (replace with your actual port if different)
EXPOSE 4000

# Command to run your app using Node.js
CMD ["node", "server.js"]