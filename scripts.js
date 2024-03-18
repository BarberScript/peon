// Инициализация Supabase клиента
const supabaseUrl = "https://qkmqzhrosivywepflhtq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbXF6aHJvc2l2eXdlcGZsaHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA3Nzk1NjUsImV4cCI6MjAyNjM1NTU2NX0.8QjJ1W7X0MTS-kPkSr2MzuM3Jjrq8F4H6EYQBEa5a7o";
const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

document
  .getElementById("signupForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
      });
      if (error) {
        console.error("Error signing up:", error.message);
        // Show error message to the user
      } else {
        console.log("User signed up successfully:", data);
        // Redirect or show success message
      }
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  });

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
      const { user, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.error("Error signing in:", error.message);
        // Show error message to the user
      } else {
        console.log("User signed in successfully:", user);
        // Redirect or show success message
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
    }
  });
