import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import appointmentReducer from './appointmentSlice';
import usersReducer from "./userSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    users: usersReducer,
  },
});

export default store;
