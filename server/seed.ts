import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool();

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  created_at: string;
  updated_at: string;
}

async function seedDatabase(): Promise<void> {
  const categories: string[] = ['Electronics', 'Clothing', 'Books', 'Home', 'Beauty'];
  const batchSize = 2000;
  const totalRecords = 200000;

  console.log("⏳ Pure .env Seeding started...");
  const startTime = Date.now();

  for (let i = 120000; i < totalRecords; i += batchSize) {
    const batchProducts: SeedProduct[] = [];
    
    for (let j = 0; j < batchSize; j++) {
      const currentId = i + j + 1;
      const name = `Product-${currentId}`;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const price = parseFloat((Math.random() * 1000).toFixed(2));
      const date = new Date(Date.now() - (currentId * 1000)).toISOString();

      batchProducts.push({
        name,
        category,
        price,
        created_at: date,
        updated_at: date,
      });
    }

    const values: (string | number)[] = [];
    const queryRows: string[] = [];
    
    batchProducts.forEach((product, idx) => {
      values.push(product.name, product.category, product.price, product.created_at, product.updated_at);
      const baseIndex = idx * 5;
      queryRows.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`);
    });

    const queryText = `INSERT INTO products (name, category, price, created_at, updated_at) VALUES ` + queryRows.join(',');
    await pool.query(queryText, values);
    console.log(`Progress: Loaded ${i + batchSize} / ${totalRecords} products.`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Seeding completed successfully in ${duration} seconds!`);
  await pool.end();
}

seedDatabase().catch(async (err: Error) => {
  console.error("Seeding failed:", err);
  await pool.end();
});
