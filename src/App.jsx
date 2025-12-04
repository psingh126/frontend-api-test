import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ApiTester from './apiTesterUI';


// Access the environment variables specific to your frontend build tool
// VITE is used here as it's common (CRA uses REACT_APP_)

// Make sure you have these set in your .env file in the root of your project:
// VITE_SUPABASE_URL=https://your-project-ref.supabase.co
// VITE_SUPABASE_ANON_KEY=your_actual_anon_public_key_goes_here

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client using the *public* keys
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/instruments")
      .then((res) => res.json())
      .then((data) => console.log("API Response:", data))
      .catch(err => console.error(err));
  }, []);

  async function getInstruments () {
    // Check if the client initialized correctly (optional, good for debugging)
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase credentials are missing!");
        return;
    }

    const { data, error } = await supabase.from("instruments").select();
    
    if (error) {
        console.error("Error fetching instruments:", error);
    } else {
        setInstruments(data);
    }
  }

  return (
    <div>
      <ApiTester/>
      <ul>
        {instruments.map((instruments) => (
          // Ensure your instrument table has 'id' and 'name' columns
          <li key={instruments.id}>{instruments.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;