import React, { useState } from 'react';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUserName] = useState('');
  const [roleId, setRoleId] = useState('');

  const [error, setError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleUserRoleId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleId(e.target.value);
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic form validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      // Make a POST request to the backend API endpoint for signup
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, email, password , roleId  }),
      });
      if (response.ok) {
        console.log('Signup successful');
        // Optionally, redirect the user to another page upon successful signup
        // router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error:any) {
      console.error('Signup failed:', error.message);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
          <div>
                <label htmlFor="username">UserName:</label>
                <input type="text" id="username" value={username} onChange={handleUserNameChange} required/>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={email} onChange={handleEmailChange} required/>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={handlePasswordChange} required/>
                <label htmlFor="roleId">Role ID:</label>
                <input type="text" id="roleId" value={roleId} onChange={handleUserRoleId} required/>
          </div>
        <button type="submit">Sign Up</button>
      </form>
      <style jsx>{`
        div {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        div > div {
          margin-bottom: 10px;
        }
        label {
          font-weight: bold;
        }
        input[type='email'],
        input[type='password'] {
          padding: 8px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 3px;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;