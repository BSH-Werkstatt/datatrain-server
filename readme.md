# Datatrain Server

## Technology

This server is using Express and runs on Node.Js

The code in the src directory is written in Typescript, transpiled and packaged using Webpack and linted using TS-Lint and Prettier.

## Install All Dependencies

Install all dependencies by first installing yarn: `npm i -g yarn` and then installing dependencies with `yarn install`

## Start Development Server

To start the development server at [`http://localhost:5000`](http://localhost:5000) run `npm run devstart`

## To Use Example Files

Create `.env` file under root directory via copying content from `.env.example` file of the project and change relevant lines according to your settings.

Create `db-init.ts` file under `./root/src/db/` via copying content from `db-init.example.ts` file of the project to use dummy database for the project.
Upload dummy data from `db-init.ts` to database with [`http://localhost:5000/campaigns/initialize`](http://localhost:5000/campaigns/initialize)
