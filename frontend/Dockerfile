FROM node:23.11.0-alpine  AS build

WORKDIR /app

COPY package.json .
RUN npm i
COPY . .

RUN npm run build


FROM nginx:alpine AS run

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]