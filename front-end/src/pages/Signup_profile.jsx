import { useNavigate } from "react-router-dom"
import React, { useState } from "react";
import axios from "axios";

function Signup_Profile(){
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');

    async function goToHome(event) {
        event.preventDefault(); 
    
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId'); 
    
            const response = await axios.put(
                `${process.env.REACT_APP_BACK_PORT}/api/update-profile`,
                {
                    userId,
                    firstName,
                    lastName,
                    age,
                    location,
                    bio,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            console.log('Profile updated successfully:', response.data);
            navigate('/home');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }
    

    return (
        <>
            <div className='edit-profile'>
                <h2>Edit your profile</h2>
                
                <form onSubmit={goToHome}>
                    <label>
                        First Name:
                        <input 
                            type="text" 
                            placeholder="John" 
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </label>
                    <label>
                        Last Name:
                        <input 
                            type="text" 
                            placeholder="Doe" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </label>
                    <label>
                        Age:
                        <input 
                            type="number" 
                            placeholder="Age" 
                            min="13" 
                            max="120" 
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </label>
                    <label>
                        Location:
                        <input 
                            type="text" 
                            placeholder="United States" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </label>
                    <label>
                        Short Bio:
                        <input 
                            type="text" 
                            placeholder="Hello!" 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </label>
                    <button type='submit'>Save and Continue</button>
                </form>
            </div>
        </>
    );
}

export default Signup_Profile;