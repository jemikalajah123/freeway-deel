💫 Welcome To Freeway! 🎉🎉

### freeway
This is a simple freelancing application with basic features, built with Next Js for the Frontend and Node js framework for the backend.

### Highlights of the Solution 

- Note that the folder deel-api is the backend service and deel-client is a Next js application that serves as UI for the app and consumes the deel-api.

1. All required APIs were built and fixed.This solution exist in this folder path  **_deel-api/src/app.js of the root directory_**

2. Built a UI interface using Next Js to show the api usage.

3. Wrote Test cases for the APIs built. This solution exist in this folder path  **_deel-api/tests/appTest.js of the root directory_**

4. Wrote Docker files, to dockerise each the service (Frontend and Backend).

5. Test and Documented the API using POSTMAN (Click here to view the documentation https://documenter.getpostman.com/view/10333949/2s9YXe7PsD)

6. Wrote a deployment script to deploy deploy the backend service to staging or a production environment. These scripts can found in this folder path  **_deel-api/config of the root directory_**.

7. Also, wrote a ci-cd pipeline script to help deploy the service to an AWS EKS environment via github actions. This script exist in this folder path  **_.github/worflows/ci-cd.yml of the root directory_**

## APIs Documentation
There is an API documentation built with postman to assist you on understanding the APIs usage. Click here to view the documentation https://documenter.getpostman.com/view/10333949/2s9YXe7PsD

## Getting Started 

First, run the development server:

❗️ **You need docker installed.**

### Running in docker

```bash
npm run docker:bash
```

### Running locally (CLient and Server Side)

❗️ **You need the lates node version installed ( >= v18.18.2) because of the next js app**

Run the command below to build and start the application

```bash
npm install
```

```bash
npm run setup-server && npm run setup-client && npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the contractor and client landing page.

Open [http://localhost:3000/admin](http://localhost:3000/admin) with your browser to view the admin dashboard.

Open [http://localhost:3001](http://localhost:3001) with your postman or api testing tool to see the result.


## Test Suites
Test cases for the various apis exist inside apiTest.js in the "Tests" folder, run the test with the following command;
Run `cd deel-api && npm run test` from the root directory.

### Recommendation/Improvements

Write more test cases
