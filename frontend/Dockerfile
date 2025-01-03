#FROM node:18-alpine as build

#WORKDIR /app
##COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build

#FROM nginx:alpine
#COPY --from=build /app/dist /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#EXPOSE 3000
#CMD ["npm", "start"]
 
FROM node:20.2.0 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build 

FROM node:20.2.0
WORKDIR /app 
COPY --from=build /app/dist ./build 
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000

CMD ["npm", "run", "dev"]
