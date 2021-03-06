FROM 068531097348.dkr.ecr.eu-west-2.amazonaws.com/sf-node-alpine:latest

#RUN apk update || : && apk --no-cache add --virtual builds-deps build-base python
# && apk add make

# Create app directory
WORKDIR /api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production
# If you are building your code for production
# RUN npm ci --only=production

#RUN npm rebuild bcrypt --build-from-source

# Bundle app source
COPY . /api

EXPOSE 5000
CMD [ "node", "index.js" ]