# 🚀 Emofelix - Complete Setup Guide

## Overview
Emofelix is a modern emotional AI companion platform with a clean, attractive frontend built using React + Vite and connected to your Django + FastAPI backend.

## ✨ Features Implemented

### 🎨 **Modern Frontend Design**
- **Clean, professional UI** with Tailwind CSS
- **Responsive design** that works on all devices
- **Beautiful animations** and smooth transitions
- **Attractive color scheme** with gradients and modern styling
- **High-quality images** from Unsplash for visual appeal

### 🔐 **Authentication System**
- Login/Register pages with proper validation
- JWT token-based authentication
- Protected routes that redirect unauthenticated users
- Google OAuth integration ready
- Proper error handling and loading states

### 📱 **Page System**
- **Home Page** - Landing page with hero section, features, testimonials, and CTA
- **Dashboard** - User overview with stats, recent activity, and quick actions
- **Relations** - Manage AI companions with CRUD operations
- **Chat** - Real-time streaming chat interface with AI
- **Profile** - User settings and account management
- **Login/Register** - Authentication pages

### 🤖 **AI Integration**
- Real-time streaming chat with FastAPI backend
- Emotion-aware responses based on relation types
- Typing indicators and smooth message flow
- Voice recording capabilities (UI ready)

### 🛠 **Technical Features**
- React 18 with modern hooks
- React Router for navigation
- Axios for API calls
- Context API for state management
- Proper error boundaries and loading states
- CORS configured for all services

## 🏗 **Architecture**

```
Frontend (React + Vite) :3000
         ↓
    ┌─────────────────────────────────┐
    │                                 │
    ↓                                 ↓
Django Backend :8000            FastAPI :8001
- User Management              - AI Chat Streaming
- Relations CRUD               - Emotional Responses
- Authentication               - Real-time Features
- Data Persistence
```

## 🚀 **Quick Start**

### 1. **Start Backend Services**
```bash
# Terminal 1 - Django
cd Backend/core
python manage.py runserver 8000

# Terminal 2 - FastAPI
cd FastAPI_services
uvicorn main:app --reload --port 8001
```

### 2. **Start Frontend**
```bash
# Terminal 3 - React Frontend
cd frontend
npm run dev
```

### 3. **Access the Application**
- Frontend: http://localhost:3000
- Django Admin: http://localhost:8000/admin
- FastAPI Docs: http://localhost:8001/docs

## 📋 **How to Use**

### **First Time Setup:**
1. Open http://localhost:3000
2. Click "Get Started" to register
3. Fill in your details and create an account
4. You'll be redirected to the dashboard

### **Creating Relations:**
1. Go to Dashboard → "Add New Relation"
2. Or use the Relations page
3. Fill in name, relation type, emotion model, and voice model
4. Click "Create Relation"

### **Chatting with AI:**
1. From Dashboard or Relations page, click "Chat" on any relation
2. Type your message and press Enter
3. Watch the AI respond with streaming text
4. The AI adapts its personality based on the relation type

### **Managing Profile:**
1. Click your profile in the navigation
2. Edit your information
3. Manage preferences and settings

## 🎨 **Design Highlights**

### **Color Scheme:**
- Primary: Blue tones (#0ea5e9 - #0c4a6e)
- Secondary: Purple/Pink (#d946ef - #701a75)
- Accent: Yellow (#fbbf24)
- Neutrals: Gray scale for text and backgrounds

### **Visual Elements:**
- Gradient backgrounds for hero sections
- Card-based layouts with subtle shadows
- Rounded corners for modern look
- Proper spacing and typography hierarchy
- Icons from Lucide React for consistency

### **Responsive Design:**
- Mobile-first approach
- Flexible grid layouts
- Collapsible navigation on mobile
- Touch-friendly buttons and interfaces

## 🔧 **Configuration**

### **Environment Variables** (`.env` in frontend folder):
```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FASTAPI_BASE_URL=http://127.0.0.1:8001
VITE_APP_NAME=Emofelix
```

### **CORS Settings:**
- Django allows requests from :3000 (React)
- FastAPI allows requests from :3000 and :8000
- All services configured for cross-origin requests

## 📁 **Project Structure**

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── context/           # React Context
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Relations.jsx
│   │   ├── Chat.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx            # Main app
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
└── .env                   # Environment variables
```

## 🔑 **Key Features**

### **Authentication Flow:**
- Public routes: Home, Login, Register
- Protected routes: Dashboard, Relations, Chat, Profile
- Automatic redirection based on auth state
- Token persistence in localStorage

### **State Management:**
- AuthContext for user authentication
- Local state for component-specific data
- Proper loading and error states throughout

### **API Integration:**
- Axios interceptors for automatic token attachment
- Error handling for network failures
- Proper request/response formatting

### **Real-time Features:**
- Streaming chat responses from FastAPI
- Typing indicators
- Live message updates

## 🎯 **Next Steps**

The frontend is fully functional and ready for use! You can:

1. **Customize styling** - Update colors, fonts, or layouts in Tailwind config
2. **Add more features** - Implement voice recording, file uploads, etc.
3. **Enhance AI** - Connect to more sophisticated AI models
4. **Deploy** - Build for production and deploy to hosting platform
5. **Testing** - Add unit tests and integration tests

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors:**
   - Ensure all three services are running
   - Check CORS settings in Django and FastAPI

2. **API Connection Failed:**
   - Verify backend services are running on correct ports
   - Check network requests in browser dev tools

3. **Styling Issues:**
   - Make sure Tailwind CSS is properly configured
   - Check for CSS conflicts or missing imports

4. **Authentication Problems:**
   - Clear localStorage and try again
   - Check token format and expiration

---

**Congratulations! 🎉 You now have a fully functional, modern, and attractive Emofelix frontend that seamlessly integrates with your Django + FastAPI backend!**
