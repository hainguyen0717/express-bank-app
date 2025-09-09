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

test('user can register and login', async (t) => {
  await sequelize.sync({ force: true });
  const { server, base } = await startServer();
  t.after(() => server.close());

  // register user
  let res = await fetch(`${base}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'john', password: 'secret' }),
    redirect: 'manual',
  });
  assert.strictEqual(res.status, 302);
  assert.match(res.headers.get('location'), /success/);

  // login user
  res = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'john', password: 'secret' }),
    redirect: 'manual',
  });
  assert.strictEqual(res.status, 302);
  const location = res.headers.get('location');
  assert.ok(location.startsWith('/welcome'));

  // visit welcome page
  const welcomeRes = await fetch(base + location);
  assert.strictEqual(welcomeRes.status, 200);
  const text = await welcomeRes.text();
  assert.ok(text.includes('john'));
});
