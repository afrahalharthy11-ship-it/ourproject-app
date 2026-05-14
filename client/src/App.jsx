import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRouter from './routes/AppRouter';
import { fetchMe } from './redux/authSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return <AppRouter />;
}

export default App;
