# Use the predefined node base image for this application.
FROM node:latest

WORKDIR '/app'

# This will copy from docker cache unless the package.json file has changed
COPY package.json .

# Install node dependencies
RUN npm install


# add app to root directory
COPY . .

RUN npm run seed

# Start the app
CMD ["npm", "start"]