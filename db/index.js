// db/index.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables first!
dotenv.config();

// Create and export a single Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
