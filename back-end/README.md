# Getting Started with Express App

This project was bootstrapped with [Express](https://expressjs.com/).

## Before You Run The Backend

Create a .env file in the front-end folder with the following content:
- backPORT
- frontPORT
- MOCK_ERROR
- SECRET_KEY

### Sample .env file

    backPORT = 5001
    frontPORT = http://localhost:3000
    MOCK_ERROR = false
    SECRET_KEY = thisisasecretkey

Note that if the backPORT 5001 doesn't work try to change both the .env files in the backend and frontend to have backPORT = 5000

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Running on [http://localhost:5001](http://localhost:5001)

### `npm run dev`

Starts nodemon to dynamically refresh the backend whenever there is a change made, starts the backend

### `npm test`

Launches the tests and returns the results for mocha chai



