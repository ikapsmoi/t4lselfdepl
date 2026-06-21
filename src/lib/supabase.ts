import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are configured
if (!supabaseUrl || !supabaseAnonKey) {
  // Show user-friendly error message once
  if (typeof window !== 'undefined' && !document.getElementById('supabase-config-error')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'supabase-config-error';
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: system-ui;
      ">
        <div style="text-align: center; padding: 2rem;">
          <h2 style="margin-bottom: 1rem;">⚠️ Configuration Required</h2>
          <p style="margin-bottom: 1rem;">Supabase environment variables are missing.</p>
          <p style="margin-bottom: 1rem;">Please click "Connect to Supabase" in the top right corner.</p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
          ">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Create client - fail fast if configuration is missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: { persistSession: true },
    global: { headers: {} }
  }
);