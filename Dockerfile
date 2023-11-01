# Stage 1: Development
FROM node:18-alpine3.18 AS development

WORKDIR /app

COPY package*.json ./
COPY .env.docker .env

RUN npm install typeorm@0.3.0

RUN npm install

RUN npm i typeorm@0.2.37 

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:18-alpine3.18 AS production

WORKDIR /app

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package*.json ./
COPY --from=development /app/dist ./dist

CMD [ "npm run", "build:docker" ]

