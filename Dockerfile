FROM node:18-slim

# Install git and git-lfs
RUN apt-get update && apt-get install -y git git-lfs && rm -rf /var/lib/apt/lists/*
RUN git lfs install

WORKDIR /app

# Clone repo with LFS (uses build arg for token)
ARG GITHUB_TOKEN
RUN git clone https://${GITHUB_TOKEN}@github.com/munchi2025/lof-discord-bot.git .
RUN git lfs pull

# Install dependencies
RUN npm ci

# Start bot
CMD ["npm", "start"]
