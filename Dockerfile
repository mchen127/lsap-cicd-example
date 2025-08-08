# Use an official Node.js runtime
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

EXPOSE 80
CMD [ "node", "server.js" ]
