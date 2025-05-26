# ConnectionApp - Social Media Platform

A full-stack social media platform built with Next.js and Node.js, featuring user authentication, connections, posts, and real-time interactions.

## 🚀 Features

### Core Functionality
- **User Authentication** - Firebase Auth integration with JWT tokens
- **User Profiles** - Complete profile management with education, experience, and skills
- **Social Connections** - Send, accept, reject connection requests
- **Posts & Media** - Create posts with image uploads
- **Comments & Likes** - Interactive engagement system
- **Real-time Updates** - Live connection status

### Key Pages
- **Dashboard** - Main feed with posts from connections
- **Discover** - Find and connect with new users
- **Profile** - Personal profile management
- **My Connections** - Manage existing connections and requests
- **User Profiles** - View other users' profiles

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI (@mui/material)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Security**: CORS, JWT tokens

## 📁 Project Structure

```
connectionapp/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin configuration
│   ├── controllers/
│   │   ├── posts.controller.js  # Posts CRUD operations
│   │   └── user.controller.js   # User management & connections
│   ├── middlewares/
│   │   └── authMiddleware.js    # firebase authentication middleware
│   ├── routes/
│   │   ├── posts.routes.js      # Posts API routes
│   │   └── user.routes.js       # User API routes
│   └── server.js                # Express server setup
└── frontend/
    ├── src/
    │   ├── Components/          # Reusable UI components
    │   ├── config/
    │   │   ├── firebase.js      # Firebase client configuration
    │   │   └── redux/           # Redux store, actions, reducers
    │   ├── layout/              # Layout components
    │   ├── pages/               # Next.js pages
    │   └── styles/              # CSS styles
    └── public/                  # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Firebase project with Authentication enabled

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
# ... other Firebase Admin SDK credentials
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd connectionapp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:5050`

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /register` - User registration
- `GET /get_user_and_profile` - Get authenticated user data

### User Management
- `GET /user/get_all_users` - Get all users
- `GET /user/profile/:username` - Get user profile by username
- `POST /update_profile_picture` - Upload profile picture
- `POST /user_update` - Update user profile
- `GET /user/download_resume/:userId` - Download user resume as PDF

### Connections
- `POST /user/sendConnectionRequest` - Send connection request
- `GET /user/getMyConnectionRequests` - Get received connection requests
- `GET /user/whatAreMyConnections` - Get accepted connections
- `POST /user/acceptConnectionRequest` - Accept connection request
- `POST /user/rejectConnectionRequest` - Reject connection request

### Posts
- `POST /posts` - Create new post
- `GET /posts` - Get all posts (paginated)
- `DELETE /posts/:post_id/delete` - Delete post
- `POST /posts/:post_id/comment` - Add comment
- `POST /posts/:post_id/like` - Toggle like

## 🔐 Authentication Flow

1. **Registration**: Users register with email/password via Firebase Auth
2. **Token Management**: Firebase ID tokens are stored and refreshed automatically
3. **API Protection**: Backend middleware validates Firebase tokens for protected routes
4. **State Management**: Redux manages authentication state across the application

## 🎨 Key Features Implementation

### Connection System
- **Request Management**: Users can send, accept, or reject connection requests
- **Status Tracking**: Real-time connection status updates
- **Mutual Connections**: Bidirectional relationship management

### Profile Management
- **Complete Profiles**: Education, experience, skills, and bio sections
- **Profile Pictures**: Image upload and management
- **PDF Export**: Generate downloadable resume from profile data

### Posts & Interactions
- **Media Support**: Image uploads with posts
- **Engagement**: Comments and likes system
- **Real-time Updates**: Live interaction updates

## 🚀 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Ensure environment variables are properly configured
- Set up MongoDB Atlas for production database

### Frontend Deployment
- Deploy to Vercel (recommended for Next.js)
- Configure environment variables in deployment platform
- Ensure API endpoints point to production backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- File upload size limited to 5MB
- PDF generation requires server-side processing
- Real-time notifications not implemented yet

## 🔮 Future Enhancements

- [ ] Real-time messaging system
- [ ] Push notifications
- [ ] Advanced search and filtering
- [ ] Mobile app development
- [ ] Video post support
- [ ] Group functionality

---

**Built with ❤️ using Next.js and Node.js**
