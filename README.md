# s1-23-id608001-project-2-node-js-express-pub-quiz-app-Josephhongg

s1-23-id608001-project-2-node-js-express-pub-quiz-app-Josephhongg created by GitHub Classroom

## Setting up the development environment

after the repo is cloned, run the command <code>npm install</code> to get all the required dependices. Run <code>npm run dev</code> to run the REST API.
<br>Create a <code>.env</code> file in the root directory. In <code>.env</code>, make sure the variables <code>PORT=3000</code>, <code>DATABASE_URL</code> - add the URL of the database here, <code>JWT_SECRET=Pazzw0rd123</code>, <code>JWT_LIFETIME=1hr</code> are in the file

## Open Prisma Studio

Enter <code>npm run studio</code> in the CLI

## Create a migration

Enter <code>npm run migrate</code> in the CLI

## Seeding Admin Users

To seed admin users, run command in the terminal: <code>adminUsers:create</code>

## Lint & fix code

Enter <code>npm run lint:check</code> to lint code

## Format code with Prettier

Run <code>npm run format</code> to format code

## Run the API/Intergration Tests

Run <code>npm run test</code> in the CLI
