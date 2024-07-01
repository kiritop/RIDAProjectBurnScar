// src/contexts/UserContext.js
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('myData')) || null);

  const updateUserInfo = (user) => {
    setUserInfo(user);
    if (user) {
      localStorage.setItem('myData', JSON.stringify(user));
    } else {
      localStorage.removeItem('myData');
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};