FROM node:20-alpine

WORKDIR /app

# Install dependencies for node-gyp and bcrypt
RUN apk add --no-cache python3 make g++ gcc libc-dev linux-headers

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3001
EXPOSE 9229

# Start in development mode
CMD ["npm", "run", "start:dev"]