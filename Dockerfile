# Use the official Node.js image as the base image
# FROM node:16

# Use the official ARM-compatible Node.js image as the base image
FROM arm64v8/node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to the working directory
COPY . .

# Compile the source code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Serve the app
CMD ["npm", "start"]
