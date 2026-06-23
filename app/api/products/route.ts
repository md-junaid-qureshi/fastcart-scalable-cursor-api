import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../db';

export const dynamic = 'force-dynamic';

export interface Product {
  id: number;
  name: string;
  price: number;
  created_at: string;
  category: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = Math.max(1, Number(searchParams.get('limit')) || 10);
    const cursor = searchParams.get('cursor');

    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (cursor) {
      const [createdAt, rawId] = Buffer.from(cursor, 'base64').toString().split('_');
      params.push(createdAt, Number(rawId));
      conditions.push(`(created_at, id) < ($${params.length - 1}, $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);

    const query = `
      SELECT id, name, category, price, created_at 
      FROM products 
      ${whereClause} 
      ORDER BY created_at DESC, id DESC 
      LIMIT $${params.length}
    `;

    const { rows: products } = await pool.query<Product>(query, params);
    const last = products[products.length - 1];

    const nextCursor = products.length === limit
      ? Buffer.from(`${new Date(last.created_at).toISOString()}_${last.id}`).toString('base64')
      : null;

    return NextResponse.json({ products, nextCursor, hasMore: !!nextCursor });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
