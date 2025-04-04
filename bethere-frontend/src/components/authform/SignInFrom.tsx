import { useState } from "react";
import "./AuthForm.css";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Signing in with:", email, password);
  };

  return (
    <div className="auth-container">
      <h1 className="logo">Welcome to <span>BeThere.</span></h1>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a href="#" className="forgot-password">Forgot password?</a>
        <button type="submit">Sign In</button>
      </form>
      <p>Don't have an account? <a href="/signup" className="link">Sign Up</a></p>
    </div>
  );
};

export default SignInForm;
