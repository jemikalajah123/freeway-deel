# Use the predefined node base image for this application.
FROM node:20.9.0-alpine
# Creating base "app" directory where the source repo will reside in our container.
# Code is copied from the host machine to this "app" folder in the container as a last step.

RUN mkdir -p /var/log/applications/applogs

RUN mkdir /app

WORKDIR /app

# This will copy from docker cache unless the package.json file has changed

COPY ./package.json .

# Install node dependencies
RUN yarn 

# add app to root directory
COPY . .

# Map a volume for the log files and add a volume to override the code
VOLUME ["/app", "/var/log/applications/applogs"]

# Expose app port
EXPOSE 3000

CMD ["yarn", "dev"]
