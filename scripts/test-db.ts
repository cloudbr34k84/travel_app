import { isDatabaseHealthy, closeDatabaseConnections } from '../server/db';

(async () => {
  try {
    console.log('🔄 Testing database connection...');
    const isHealthy = await isDatabaseHealthy();
    if (isHealthy) {
      console.log('✅ Database connection is healthy.');
    } else {
      console.error('❌ Database connection failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error testing database connection:', err);
    process.exit(1);
  } finally {
    await closeDatabaseConnections();
  }
})();
