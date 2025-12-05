// supatest.mjs
import { supabase } from "./db/index.js";
const r = await supabase.from("products").select("*").limit(1);
console.log(r);
