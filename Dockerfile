FROM node:22-bookworm

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "bin/alphaclaw.js", "start"]
