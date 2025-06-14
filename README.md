# Test Task

## Solution Description
The API was implemented using the Nest.js framework. The logic for working with personnel was moved to a separate module, validation was added, and unit tests were written. PrismaORM is used to work with the database.
Of the shortcomings, I can highlight the call of a private method when testing salary calculations, which is a violation of encapsulation, but was necessary for testing the logic.
API documentation was added using Swagger.

## Stack
- Nest.js
- SQLite
- PostgreSQL

## API Documentation
Open api documentation with this link (http://localhost:3000/api/docs)

## Commands to start working with API
- `npm i` — Install all dependencies.
- `npx prisma generate` — Sychronization with database.
- `npm run start:dev` — Run app locally.
