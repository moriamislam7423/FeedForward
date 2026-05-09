# 1. Use a highly optimized, lightweight version of Node
FROM node:20-alpine

# 2. Tell Node this is a production environment
ENV NODE_ENV=production

# 3. Create a directory to hold the application code inside the container
WORKDIR /app

# 4. Copy ONLY the package files first (This makes future builds much faster via caching)
COPY package*.json ./

# 5. Install dependencies cleanly (npm ci is the gold standard for production)
RUN npm ci --only=production

# 6. Copy the rest of  backend code into the container
COPY . .


# We switch to the restricted 'node' user that comes built into the alpine image.
USER node

# 8. Expose the port your Express server runs on
EXPOSE 5000

# 9. The command to wake up the server
CMD ["node", "app.js"]