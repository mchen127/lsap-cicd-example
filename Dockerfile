# Use an official Node.js runtime
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

# Install only the production dependencies inside the box
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
