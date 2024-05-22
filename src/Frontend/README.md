# Air Crash Investigations: A Game of Ethics (Frontend)

Game Deployed here: https://game-of-ethics-2022.herokuapp.com/

API Deployed here: https://ge-backend.herokuapp.com/

### All resources including codes and release notes in GE-RedBack-FrontEnd/docs/COMP90082-2022-SM2-GE-RedBack-Handover

## Structure

Frontend and backend are seperate. Frontend uses vue and backend uses Node.js.

To deploy the project, follow the instructions in folder frontend and backend.

## Overview

Game of ethic is a game aimed at investigating how decisions made in the process of designing plane affect the final outcome. Five players will be involved to play different roles as executive, developer, pilot, engineer, FAA. At the first phase, everyone will answer a series of personal questions seperately. After then, there will be a group discussion phase where all players will answer the same questions. The final choice of a question depends on the voted number. After all questions has been done, a final outcome regarding how the product goes on will be presented to every player.


## Project setup

### Local Developmemt

1. Run
```
npm install
```
2. Set the parameters in `.env` :
- `PORT`: Port number for proudction server (only used for deployment)
- `VUE_APP_BACKEND_URL`: URL for backend service (e.g. https://[your app name].herokuapp.com/ ; fill the brackets with your app's name and don't forget the trail in the end)

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Lints and fixes files
```
npm run lint
```
#### Run unit test suite
```
npm run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Project Credentials

### Email Account (Required To maintain other accounts)

```
email address: comp90082gameofethic@gmail.com
password: comp90082
```

### MongoDB account

```
email address: comp90082gameofethic@gmail.com
password: comp90082
```
### Pipedream
this is for only configuring adminstrator page. This is a new feature by implementing a external db, for reducing the load of cuurent timer-based pooling architecture.
1. you can sign up an account through https://pipedream.com/auth/signup, free version can call 100 times a day.
2. create a workflow used to post users' decision to a table. named 'posttotable'.
   1. add a default http trigger
   
   <img src="https://github.com/COMP90082-2023-SM1/GE-Redback/assets/68847099/3a751fe9-87a9-4add-9a3c-dbbfa930823f" width="400" height="300">
   
   2. add a google sheet function - add_single_row, configure Google Sheets Account. create a Spreadsheet named 'options'; Sheet named 'sheet1'; Does the first row of the sheet have headers? - yes; configure all attributes
  
   <img src="https://github.com/COMP90082-2023-SM1/GE-Redback/assets/68847099/2aaf39cf-89bf-452d-a646-35525e1cb2a7" width="400" height="300">
   
   your google account should have a file named 'options', format as follows:
   
      | GameID | RoleID | OptionID |
      |--------|--------|----------|
      |  epzu  |   1    |   20113  |
      |  epzu  |   0    |   10112  |
      |  epzu  |   2    |   50112  |

3. create another workflow used to retrieval user's decisions to admin page. named 'getoptions'
   1. add a http trigger, with HTTP Response - 'Return a custom response from your workflow'
   2. add a google sheet function - get_values, configure Google Sheets Account, Spreadsheet, Sheet Name as the first workflow
   
   <img src="https://github.com/COMP90082-2023-SM1/GE-Redback/assets/68847099/54f38678-d1bb-4976-89ec-f7279546e0aa" width="400" height="300">

   3. add a nodejs function - for respond the correspond info to the request. change the body to 'body: steps.get_values.$return_value,'

   <img src="https://github.com/COMP90082-2023-SM1/GE-Redback/assets/68847099/c6a82d14-75fe-46e1-b88b-f1556c60d045" width="400" height="300">

## AWS deployment (current):
See readme.md in deployment folder

## Heroku deployment:
### Heroku
```
email address: comp90082gameofethic@gmail.com
password: comp90082!
api key: 1ff6fe23-c7d1-4b5e-9c4f-f2d440c91d63
```

## Deployment

### Deployment with Heroku
<!-- Attribution:
https://raw.githubusercontent.com/sahat/hackathon-starter/master/README.md
 -->

<img src="https://upload.wikimedia.org/wikipedia/en/a/a9/Heroku_logo.png" width="200">

1. Download and install [Heroku Toolbelt](https://toolbelt.heroku.com/)
2. In a terminal, run `heroku login` and enter your Heroku credentials
3. From *your app* directory run `heroku create -a [your app name]`
4. Use the command `heroku config:set KEY=val` to set the different environment variables (KEY=val) for your application (i.e.  `heroku config:set BASE_URL=[heroku App Name].herokuapp.com` or `heroku config:set VUE_APP_BACKEND_URL=http://backend-url.com` (see Hosted MongoDB Atlas below), etc.)  Make sure to set the environment variables for SENDGRID_USER, SENDGRID_PASSWORD, and any other API that you are using as well.
5. Initial your git with `git init`
6. Use `git add .` and `git commit -m 'first commit'` to do the first commit
7. Lastly, do `git push heroku master`.

Please note that you may also use the [Heroku Dashboard](https://dashboard.heroku.com) to set or modify the configurations for your application.

### Deployment with Docker

1. To build docker image, run
   ```
   docker build -t a-game-of-ethics-frontend .
   ```
3. To run the image, update the `.env` file (see Local development, Above) and then run
   ```
   docker run --network="host" --env-file .env a-game-of-ethics-frontend:latest
   ```
   or
   ```
   docker run --network="host" -e VUE_APP_BACKEND_URL=http://backend-url.com -e PORT=8080 a-game-of-ethics-frontend:latest
   ```
