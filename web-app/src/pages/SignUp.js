import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Box, Avatar, Button, TextField, Grid, Typography, Alert, Card, CardContent } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoadingScreen from '../components/LoadingScreen';
import { registerUser } from '../reducers/authSlice';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success } = useSelector((state) => state.auth);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    dispatch(registerUser({ username, name: firstName, surname: lastName, email, password }))
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (success) {
    return (
      <Box
        sx={{
          marginTop: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Alert severity="success" sx={{ mb: 2 }}>
          Welcome to our website! You can login using your email and password. Redirecting to the main page...
        </Alert>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Card sx={{ marginTop: 8, padding: 2, backgroundColor: '#ffffff' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: '#0077b6' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ color: '#0077b6' }}>
              Sign Up
            </Typography>
            {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    InputLabelProps={{ style: { color: '#272D36' } }}
                    InputProps={{ style: { color: '#272D36' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    InputLabelProps={{ style: { color: '#272D36' } }}
                    InputProps={{ style: { color: '#272D36' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputLabelProps={{ style: { color: '#272D36' } }}
                    InputProps={{ style: { color: '#272D36' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputLabelProps={{ style: { color: '#272D36' } }}
                    InputProps={{ style: { color: '#272D36' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputLabelProps={{ style: { color: '#272D36' } }}
                    InputProps={{ style: { color: '#272D36' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputLabelProps={{ style: { color: '#272D36' } }}
                    InputProps={{ style: { color: '#272D36' } }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#0077b6', color: '#ffffff' }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
