FROM node:16

WORKDIR /app

COPY package*.json /app
RUN npm install
RUN npm install --save-dev typescript

COPY . /app

# Debugging commands
RUN npx tsc --version
RUN ls -la /app
RUN npm run build

CMD ["node", "dist/index.js"]
