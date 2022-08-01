# Ethereum Auth - Node.js-Express + React

## Proof of concept

The user can sign up/login to a web service using just an Ethereum wallet. There's no need of usernames/emails/passwords. All you need is just Metamask (non-custodial wallet). This is a huge advantage over the traditional system because the user does not have to remember or come up with insecure passwords. Another advantage is that no third parties are required in this process.

This project is inspired by the following source code: [eth-auth-demo](https://github.com/oneclickdapp/ethereum-auth) and this concept is currently featured here: [oneclickdapp](https://oneclickdapp.com). The mentioned project was designed to work with RedwoodJS, so I've decided to test this concept on NodeJS Express.

## Design of the system

### Frontend - User Interface

Frontend makes use of React & Metamask. The [HardHat boilerplate](https://github.com/NomicFoundation/hardhat-boilerplate) template was used for this project.

* User can connect wallet (initialise MetaMask) to the portal
* User can press the `login` button
* User can sign random data (via MetaMask). Random data is provided by Backend server to make sure that the user has the private key of chosen account
* Once the server (backend) validates the signed data, the JWT is displayed on the screen (JWT also stored in `localstorage` for future access)
* User can submit a request that requires authentication. When the user presses the `Get Data` button, a request with JWT is sent to the backend server. If JWT is valid, then the server responds with an authorised response.

Watch the video below:

<kbd>[![Watch the video](https://img.youtube.com/vi/e0Ds0ULAHrI/maxresdefault.jpg)](https://youtu.be/e0Ds0ULAHrI)</kbd>


### Backend - MySQL + NodeJs-Express

Backend makes use of Node.js Express + ORM Sequelizer (MySQL). Template project was inspired from [bezkoder/node-js-express-login-example](https://github.com/bezkoder/node-js-express-login-example).

#### Database Schema

The backend system makes use of two tables. The `users` table, stores the `address` (public key) of the user that is requesting to login/sign up. The `authdetails` table contains the `nonce` (random text by the system) and the `timestamp`. Timestamp is used to make sure that the user signs the random text within 5 minutes.

<kbd>![DB Schema](https://i.ibb.co/2n33L9r/schema.jpg)</kbd>

#### Sign Up/Login Logic

 `controllers\ethereum_auth_controller.js` contains code that generates the random nonce and checks the validity of the signed signature by the user via MetaMask. If a valid signature is received, then a JWT is created and sent to the Frontend.

`middleware\authJwt.js` contains code that validates the received JWT token.


## Project Setup

Run backend server

- Setup Database in MySQL. Update config in `app\config\db.config.js`.

```
cd Backend
npm install
node server.js
```
Run HardHat node. 
- Connect MetaMask to localhost:8545

```
cd HardHat
npm install
npx hardhat node
```
Run Frontend

```
cd Frontend
npm install
npm start
```

