FROM node:lts-buster
RUN npm install -g pm2
RUN git clone https://github.com/YOUR_USERNAME/VES-MINI
WORKDIR /VES-MINI
RUN npm install || yarn install
COPY . .
EXPOSE 9090
CMD ["npm", "start"]
