import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';

import Upload from './upload';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Configure Amplify
Amplify.configure(amplifyconfig);

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if a user is already logged in when the component loads
        Amplify.Auth.currentAuthenticatedUser()
            .then(setUser)
            .catch(() => setUser(null));
    }, []);

    const login = () => {
        // Redirects to Cognito hosted login UI
        Amplify.Auth.federatedSignIn();
    };

    const logout = () => {
        // Logs out and updates user state
        Amplify.Auth.signOut()
            .then(() => setUser(null))
            .catch(console.log);
    };

    return (
        <div className="App">
            <h1>Home</h1>
            {user ? (
                <div>
                    <p>Welcome, {user.username}</p>
                    <button onClick={logout} className="btn btn-danger">Logout</button>
                    <Upload /> {/* Display the upload component for logged-in users */}
                </div>
            ) : (
                <button onClick={login} className="btn btn-primary">Login</button>
            )}
        </div>
    );
}

export default App;
