import React, { useState, useContext } from 'react';
import { Container, Box, Avatar, Button, TextField, Grid, Typography, Alert, Card, CardContent, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoadingScreen from '../components/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import CONFIG from '../config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${CONFIG.API_URL}/login`, { email, password });
      updateUserInfo(response.data.user);
      navigate('/');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // SweetAlert for Forgot Password
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
