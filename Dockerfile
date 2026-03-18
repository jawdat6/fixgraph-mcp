FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY src/ ./src/

ENV FIXGRAPH_API_KEY=""

ENTRYPOINT ["node", "src/index.js"]
