import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student-dashboard');
      else navigate('/faculty-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card-light glass">
        <h2 className="login-title animate-fade-in-up">Welcome back to<br/>ProjectHub</h2>
        <p className="login-subtitle animate-fade-in-up">Student Project Submission & Evaluation Portal</p>
        
        {error && <div className="alert error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-with-icon" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-with-icon" />
            </div>
          </div>

          <div className="forgot-password-link">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              if (!email) {
                setError("Please enter your email address first to reset password.");
              } else {
                setError("");
                alert(`Password reset instructions have been sent to ${email}`);
              }
            }}>Forgot password?</a>
          </div>
          
          <button type="submit" className="btn btn-purple-gradient w-full">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
