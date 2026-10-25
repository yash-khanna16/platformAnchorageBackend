FROM node:16

WORKDIR /app

COPY package*.json /app
RUN npm install
# Pinned: an unpinned install pulls the newest TypeScript, and TypeScript 7+
# cannot run on this node:16 image (the build fails at the next step).
RUN npm install --save-dev typescript@5.9.3

COPY . /app

# Debugging commands
RUN npx tsc --version
RUN ls -la /app
RUN npm run build

CMD ["node", "dist/index.js"]
