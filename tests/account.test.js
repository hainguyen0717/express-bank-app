import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { sequelize } from '../models/index.js';
import user from '../models/user.js';

const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
};

test('account routes allow creating and listing accounts', async (t) => {
  await sequelize.sync({ force: true });
  const { server, base } = await startServer();
  t.after(() => server.close());

  const newUser = await user.create({ username: 'mary', password: 'pwd' });

  // create account
  let res = await fetch(`${base}/users/${newUser.id}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountNumber: '123', balance: 100, accountType: 'savings' }),
  });
  assert.strictEqual(res.status, 201);
  const account = await res.json();
  assert.strictEqual(account.accountNumber, '123');

  // list accounts
  res = await fetch(`${base}/users/${newUser.id}/accounts`);
  assert.strictEqual(res.status, 200);
  const accounts = await res.json();
  assert.strictEqual(accounts.length, 1);
  assert.strictEqual(accounts[0].accountNumber, '123');
});
