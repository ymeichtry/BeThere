import { useState } from "react";
import "./AuthForm.css";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Signing up with:", username, email, password);
  };

  return (
    <div className="auth-container">
      <h1 className="logo">Welcome to <span>BeThere.</span></h1>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Username</label>
        <input
          type="text"
          placeholder="examplename"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a href="/signin" className="link">Sign In</a></p>
    </div>
  );
};

export default SignUpForm;
