import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Box, Avatar, Button, TextField, Grid, Typography, Alert, Card, CardContent, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoadingScreen from '../components/LoadingScreen';
import { loginUser } from '../reducers/authSlice';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((userData) => {
        localStorage.setItem('myData', JSON.stringify(userData));
        navigate('/');
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Please contact Admin',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  if (loading) {
    return <LoadingScreen />;
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
              Sign in
            </Typography>
            {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: '#0077b6' } }}
                InputProps={{ style: { color: '#0077b6' } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: '#0077b6' } }}
                InputProps={{ style: { color: '#0077b6' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#0077b6', color: '#ffffff' }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2" sx={{ color: '#0077b6' }} onClick={handleForgotPassword}>
                    {"Forgot password?"}
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" sx={{ color: '#0077b6' }} onClick={handleSignUp}>
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
