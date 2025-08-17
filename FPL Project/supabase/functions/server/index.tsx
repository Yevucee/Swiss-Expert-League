import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/middleware';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// CORS and logging
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Create Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// API Routes
app.get('/make-server-e9a4590f/chip-usage-roi', async (c) => {
  try {
    const { data, error } = await supabase
      .from('vw_chip_usage_roi')
      .select('*')
      .order('roi_vs_league_avg', { ascending: false });

    if (error) {
      console.log('Chip usage ROI query error:', error);
      return c.json({ error: 'Failed to fetch chip usage ROI data' }, 500);
    }

    return c.json({ data });
  } catch (error) {
    console.log('Chip usage ROI route error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-e9a4590f/manager-of-month/:month', async (c) => {
  try {
    const month = c.req.param('month');
    
    const { data, error } = await supabase
      .from('vw_manager_of_month_totals')
      .select('*')
      .eq('month_utc', month)
      .order('rank', { ascending: true });

    if (error) {
      console.log('Manager of month query error:', error);
      return c.json({ error: 'Failed to fetch manager of month data' }, 500);
    }

    return c.json({ data });
  } catch (error) {
    console.log('Manager of month route error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/make-server-e9a4590f/manager-of-month-winners', async (c) => {
  try {
    const { data, error } = await supabase
      .from('vw_manager_of_month_winners')
      .select('*')
      .order('month_utc', { ascending: false });

    if (error) {
      console.log('Manager of month winners query error:', error);
      return c.json({ error: 'Failed to fetch manager of month winners' }, 500);
    }

    return c.json({ data });
  } catch (error) {
    console.log('Manager of month winners route error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/make-server-e9a4590f/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);