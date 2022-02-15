FROM node:12

ENV PORT 3000

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Installing dependencies
COPY . /app
RUN npm install

# Building app
RUN npm run build
EXPOSE 3000

# Running the app
CMD "npm" "run" "dev"