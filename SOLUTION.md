💫 Welcome To Freeway! 🎉🎉

### freeway
This is a simple freelancing application with basic features, built with Next Js for the Frontend and Node js framework for the backend.

### Highlights of the Solution
- Note that the folder deel-api is the backend service and deel-client is a Next js application that serves as UI for the app and my newly built apis were consumed to built it.

1. All required APIs were built and fixed.This solution exist in this folder path  **_deel-api/src/app.js of the root directory_**

2. Wrote Test cases for the APIs built. This solution exist in this folder path  **_deel-api/tests/appTest.js of the root directory_**

3. Wrote Docker files, to dockerise the service.

4. Test and Documented the API using POSTMAN (Click here to view the documentation https://documenter.getpostman.com/view/10333949/2s9YXe7PsD)

5. Wrote a deployment script to deploy deploy the application to staging or a production environment. These scripts can found in the **_config folder of the root directory_**.

6. Also, wrote a ci-cd pipeline script to help deploy the service to an AWS EKS environment via github actions. This script exist in this folder path  **_.github/worflows/ci-cd.yml of the root directory_**

## APIs Documentation
There is an API documentation built with postman to assist you on understanding the APIs usage. Click here to view the documentation https://documenter.getpostman.com/view/10333949/2s9YXe7PsD

## Getting Started 

First, run the development server:

❗️ **You need docker installed.**

### Running in docker

```bash
npm run docker:bash
```

### Running locally

```bash
npm install && npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your postman or api testing tool to see the result.


## Test Suites
Test cases for the various apis exist inside apiTest.js in the "Tests" folder, run the test with the following command;
Run `npm run test` from the root directory.

### Recommendation/Improvements

Write more test cases
