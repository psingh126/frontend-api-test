import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




//import { createClient } from "@supabase/supabase-js";
//import dotenv from "dotenv";

//dotenv.config();

//const supabase = createClient(
  //process.env.SUPABASE_URL,
  //process.env.SUPABASE_SERVICE_ROLE_KEY
//);