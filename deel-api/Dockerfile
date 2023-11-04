# Use the predefined node base image for this application.
FROM node:20.9.0

WORKDIR '/app'

# This will copy from docker cache unless the package.json file has changed
COPY package.json .

# Install node dependencies
RUN npm install


# add app to root directory
COPY . .


# Start the app
CMD ["npm", "start"]