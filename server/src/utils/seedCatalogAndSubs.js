/**
 * Catalog & Subscriptions Seeder
 * Backwards-compatible runner for `npm run seed:catalog`
 * Loads modular fixtures from `./fixtures/` and seeds MongoDB.
 */

const { seedAll } = require('./seeder');

seedAll({ isCli: true })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed catalog failed:', err);
    process.exit(1);
  });
