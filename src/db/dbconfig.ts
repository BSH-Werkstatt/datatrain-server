const dotenv = require('dotenv');
dotenv.config();

/**
 * these should be present in a .env file (NOT IN GIT!)
 */
export const DBConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  adminUser: process.env.DB_ADMIN_USER,
  adminPassword: process.env.DB_ADMIN_PASSWORD,
  awsKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsKeySecret: process.env.AWS_ACCESS_KEY_SECRET
};
