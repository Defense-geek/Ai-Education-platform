inlustro-aieducation-backend
AI for Education - Backend Repository

This project uses Prisma as an ORM to interact with a PostgreSQL database. Follow the steps below to set up, generate the Prisma client, and apply database migrations.

Prerequisites
Node.js (version 14 or above)
PostgreSQL (or any other supported database)
Prisma CLI installed globally:
```bash
npm install -g prisma
```
```bash
npm install
```
Configure Environment Variables:

Create a .env file in the project root if it doesn't exist.
Add the DATABASE_URL in .env to connect to your PostgreSQL database:
env

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
Replace USER, PASSWORD, HOST, PORT, and DATABASE with your database credentials.
Prisma Commands

1. Generate Prisma Client
After modifying the schema, generate the Prisma client to use in your project.

```bash
npx prisma generate
```

2. Creating and Applying Migrations
Prisma migrations allow you to track and apply schema changes to your database.

Create a Migration
Use this command to create a new migration based on your schema changes:

```bash
npx prisma migrate dev --name migration_name
```
Apply Migrations
Apply all pending migrations to your database. This command is typically used in deployment scripts.

```bash
npx prisma migrate deploy
```

3. Reset Database (Optional)
If you need to reset your database, you can use the following command. This will drop all tables and apply migrations from scratch:

```bash
npx prisma migrate reset
```
Warning: This will delete all data in the database.

4. Seed the Database
If you've defined a seed script in your package.json or a seed.js/seed.ts file, you can populate the database with initial data:

```bash
npx prisma db seed
```

5. Run Prisma Studio
Prisma Studio is a visual editor for managing data in your database.

```bash
npx prisma studio
```
Common Prisma Commands
Format schema file:

```bash
npx prisma format
```
Check for issues in the schema:

````bash
de
npx prisma validate
````

Launch Prisma Studio (UI for managing database data):

```bash
npx prisma studio
```

Running the Project
After generating the Prisma client and applying migrations, you can start your application as per your project's requirements. For example:

```bash
npm run dev
```

Running The app.py
```bash
pip install -r requirements.txt
python3 app.py
```

place the app.py, yaml file and into one directory level then run the above commands to install required libraries and run the app in localhost:5000


###IGNORE BEYOND THIS POINT

##NOTE: CURRENT PRISMA SCHEMA IS NOT SUPPORTED FOR THE TEST API'S AND CORE LOGIC NEEDS TO BE REBUILT
##NOTE: TO TEST THE ASSESSMENT PAGE UPLOAD THE QUESTIONS.JSON FILE IN THE DATA DIRECTORY INTO YOUR MONGODB USING MONGO COMPASS
##To use the Assessment page create a mongodb connection url and store it in the .env file with name: MONOG_DATABASE_URL
Run the following commands:

```bash
npx prisma init
npx prisma generate
npx prisma db push
```
Add the data required and go to localhost:3000/test
