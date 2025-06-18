// This file provides direct SQL execution capability for migrations
import postgres from 'postgres';

// Create a PostgreSQL client
const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

export default sql;