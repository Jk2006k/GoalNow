# GoalNow - Interview Preparation Platform

A modern interview preparation platform with Google OAuth authentication, MongoDB storage, and interactive assessment modules.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Google OAuth Credentials

### Installation

1. **Clone/Setup the project**

   ```bash
   cd GoalNow
   ```

2. **Configure Google OAuth**
   - Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for Google Cloud setup
   - Get your Google Client ID

3. **Setup Server**

   ```bash
   cd server
   npm install
   # Create .env file with your credentials
   npm run dev
   ```

4. **Setup Client**

   ```bash
   cd client
   npm install
   # Create .env.local with your Google Client ID
   npm run dev
   ```

5. **Access the app**
   - Client: http://localhost:5173
   - Server: http://localhost:5000

## 📋 Features

### Authentication

- ✅ **Google OAuth Sign-In** - Direct login with Google
- ✅ **Email Sign-Up** - Manual registration with name & email
- ✅ **Profile Management** - Custom avatar and profile updates
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **MongoDB Storage** - All user data persisted

### Assessment Modules

- 📝 **Behavioral Assessment** - Interview behavior questions
- 💻 **Technical Assessment** - Coding and technical questions
- 📊 **Performance Tracking** - Track progress over time

### User Features

- 👤 **User Profiles** - Custom profile with avatar
- 🔐 **Secure Authentication** - JWT tokens
- 📱 **Responsive Design** - Works on all devices

## 🏗️ Project Structure

```
GoalNow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── Page/          # Page components
│   │   ├── components/    # Reusable components
│   │   ├── assesment/     # Assessment modules
│   │   └── services/      # API services
│   ├── .env.local         # Client environment
│   └── package.json
├── server/                # Express backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── server.js          # Entry point
│   ├── .env               # Server environment
│   └── package.json
└── SETUP_GUIDE.md         # Detailed setup guide
```

## 🔑 Environment Variables

### Server (.env)

```
MONGODB_URI=mongodb://localhost:27017/goalnow
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Client (.env.local)

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints

**Google Sign-Up**

```
POST /api/auth/google-signup
Body: { googleId, firstName, lastName, email, googleProfileImage }
Response: { token, user }
```

**Email Sign-Up**

```
POST /api/auth/email-signup
Body: { firstName, lastName, email, profileImage }
Response: { token, user }
```

**Get Profile**

```
GET /api/auth/profile/:userId
Response: { user }
```

**Update Profile**

```
PUT /api/auth/profile/:userId
Body: { firstName, lastName, profileImage }
Response: { user }
```

## 🛠️ Tech Stack

### Frontend

- React 19
- React Router DOM
- Axios
- React OAuth (Google)
- Tailwind CSS
- Three.js (3D elements)

### Backend

- Node.js / Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- CORS

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (ready to implement)
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ MongoDB injection prevention

## 📝 Data Storage

All user information is stored in MongoDB with the following schema:

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  googleId: String (unique, sparse),
  profileImage: String,
  googleProfileImage: String,
  signupMethod: String ('google' | 'email'),
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Heroku/Railway

1. Update your env variables
2. Ensure MongoDB Atlas connection string
3. Update CORS origins
4. Deploy both client and server

### Vercel/Netlify (Client)

1. Deploy from GitHub
2. Set env variables
3. Update API URL

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [API Documentation](#-api-documentation) - Endpoint reference
- [Architecture](./ARCHITECTURE.md) - System design

## 🐛 Troubleshooting

### Google Sign-In Not Working

- Verify Client ID in `.env.local`
- Check origins in Google Cloud Console
- Clear browser cache

### MongoDB Connection Error

- Verify connection string in `.env`
- Check MongoDB is running
- For Atlas: verify credentials and IP whitelist

### CORS Errors

- Ensure client and server URLs match
- Check CORS configuration in server

## 📧 Support

For issues or questions, refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md) or contact support.

## 📄 License

ISC

## 👥 Contributors

Created for interview preparation practice.

---

**Last Updated:** March 2026
