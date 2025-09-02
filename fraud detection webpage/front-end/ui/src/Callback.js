import React, { useEffect } from 'react';
import { Auth } from 'aws-amplify';

const Callback = () => {
    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then(user => console.log("User logged in", user))
            .catch(() => console.log("User not authenticated"));
    }, []);

    return <div>Loading...</div>;
};

export default Callback;
