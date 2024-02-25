import express from 'express';
import usersRoutes from './src/users/routes.js';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import { config } from "dotenv";
config({ path: '.env' });

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

app.use("/users", usersRoutes);

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});

app.get('/auth/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await client.getToken(code);
    // Simpan token di cookies tanpa memeriksa NODE_ENV
    res.cookie('access_token', tokens.access_token, { httpOnly: true }); // Contoh untuk development, buang opsi secure
    if (tokens.refresh_token) { // Refresh token hanya diberikan pada grant pertama, simpan jika ada
      res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true }); // Contoh untuk development, buang opsi secure
    }
    // Redirect pengguna setelah berhasil login
    res.redirect('/');
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/', (req, res) => {
    res.send("Welcome to Idealibs");
});

app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});
