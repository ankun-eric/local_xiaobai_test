FROM node:18-alpine

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.cloud.tencent.com/g' /etc/apk/repositories
RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json* ./

RUN npm install --frozen-lockfile

COPY . .

ARG BUILD_COMMIT
RUN echo "$BUILD_COMMIT" > /app/BUILD_INFO || echo "unknown" > /app/BUILD_INFO

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
