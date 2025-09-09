import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : `${__dirname}/../database.sqlite`;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

export { sequelize };
