import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { sequelize } from '../models/index.js';
import user from '../models/user.js';
import account from '../models/account.js';

const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
};

test('transaction routes process deposits', async (t) => {
  await sequelize.sync({ force: true });
  const { server, base } = await startServer();
  t.after(() => server.close());

  const newUser = await user.create({ username: 'jack', password: 'pwd' });
  const acc = await account.create({ accountNumber: '222', balance: 0, accountType: 'checking', userId: newUser.id });

  // create deposit transaction
  let res = await fetch(`${base}/accounts/${acc.id}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionType: 'deposit', amount: 50 }),
    redirect: 'manual',
  });
  assert.strictEqual(res.status, 302);

  // check transactions page
  res = await fetch(`${base}/accounts/${acc.id}/transactions?username=${newUser.username}`);
  assert.strictEqual(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('deposit'));
});
