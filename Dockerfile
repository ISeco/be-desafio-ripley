FROM node:18.18-alpine3.17 as deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:18.18-alpine3.17 as builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run test
RUN npm run build

FROM node:18.18-alpine3.17 as prod-deps
WORKDIR /app
COPY --from=builder /app/package.json ./
RUN npm install --production

FROM node:18.18-alpine3.17 as runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
RUN npm install -D tslib @types/node
COPY knexfile.ts ./
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]