import express from 'express';
import usersRouter from './src/routes/user.js';
import filesRouter from './src/routes/file.js';
import cookieParser from 'cookie-parser';
import { OAuth2Client } from 'google-auth-library';
import { config } from "dotenv";
import fileUpload from "express-fileupload"
import cors from 'cors'; // Import middleware CORS
import { saveUserToDatabase } from './src/config/supabase.js'; 
config({ path: '.env' });

const app = express();
const port = 8080;

app.use(express.json());
app.use(cookieParser());
app.use(cors()); // Gunakan middleware CORS di seluruh aplikasi
app.use(fileUpload())

app.use("/users", usersRouter);
app.use("/files", filesRouter);

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
    const user = await getUserInfo(tokens.access_token);
    // Simpan informasi pengguna ke database
    await saveUserToDatabase(user);
    // Redirect pengguna ke halaman utama
    res.redirect('/');
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});

async function getUserInfo(accessToken) {
  const { data } = await client.request({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return data;
}