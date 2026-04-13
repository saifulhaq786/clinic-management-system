# 🚀 Elite Clinic - Quick Setup Guide

## Step 1: Clone Repository

```bash
cd elite-clinic
```

## Step 2: Install Dependencies

```bash
npm install --prefix server
npm install --prefix client
```

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env` in the server directory:

```bash
cp server/.env.example server/.env
```

2. Edit `server/.env` and add your credentials:

```
MONGO_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_key
JWT_SECRET=generate_a_random_secret
EMAIL_USER=your_gmail
EMAIL_PASSWORD=gmail_app_password
```

## Step 4: Start Development Servers

### Option A: Local Development

```bash
# Terminal 1: Start Backend
cd server && npm run dev

# Terminal 2: Start Frontend
cd client && npm run dev
```

Backend: http://localhost:5001  
Frontend: http://localhost:5177

### Option B: Docker (Recommended)

```bash
docker-compose up -d
```

## Step 5: Access the Application

1. **Frontend**: http://localhost:5177
2. **Test DB**: http://localhost:5001/test-db
3. **Admin Dashboard**: `/admin`
4. **Prescriptions**: `/prescriptions`
5. **Payments**: `/payments`

## 🔑 Demo Credentials

### Patient

- Email: `patient@clinic.com`
- Password: `password123`

### Doctor

- Email: `doctor@clinic.com`
- Password: `password123`

### Admin

- Email: `admin@clinic.com`
- Password: `password123`

## 📚 Key Features to Test

### 1. Real-Time Features

- Open dashboard in 2 browsers
- Book an appointment in one browser
- See live update in the other browser

### 2. Payment System

- Go to `/payments`
- Enter appointment ID and amount
- View transaction in admin dashboard

### 3. Prescriptions

- Doctor: Create prescription in `/prescriptions`
- Patient: Download PDF

### 4. Admin Dashboard

- Navigate to `/admin`
- View analytics, revenue, top doctors
- Manage users

### 5. Medical Chatbot

- Click chatbot icon
- Ask medical questions
- Get AI-powered responses

## 🧪 Run Tests

```bash
cd server && npm test
cd client && npm run lint
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

## 🔒 Security Checklist

- ✅ Update `.env` with real credentials
- ✅ Never commit `.env` file
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Enable SSL in production
- ✅ Use Stripe live keys in production
- ✅ Set proper CORS origins

## 📊 Project Stats

- **Files Created**: 20+
- **API Endpoints**: 25+
- **Features**: 10 major features
- **Tech Stack**: MERN + Stripe + Socket.io
- **Security**: 8+ security layers
- **Testing**: Unit + Integration tests
- **DevOps**: Docker + GitHub Actions

## 🎓 What You've Built

- ✅ Production-grade clinic management system
- ✅ Real-time appointment updates
- ✅ Secure payment processing
- ✅ Admin analytics dashboard
- ✅ Digital prescription system
- ✅ Email notifications
- ✅ Audit logging
- ✅ Docker containerization
- ✅ CI/CD pipeline
- ✅ Professional UI/UX

## 💡 Tips for Your Portfolio

1. **Deploy to production** (Heroku, AWS, etc.)
2. **Add GitHub Actions badge** to README
3. **Write case study** on what you learned
4. **Screenshot admin dashboard** for portfolio
5. **Record demo video** showing all features
6. **Highlight challenges solved** (payments, real-time, etc.)

## 🆘 Troubleshooting

### Port 5001 already in use

```bash
# Mac/Linux
lsof -i :5001
kill -9 <PID>

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### MongoDB Connection Error

- Check `MONGO_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas
- Test connection: http://localhost:5001/test-db

### Stripe Error

- Verify `STRIPE_SECRET_KEY` format
- Check Stripe dashboard for correct key

## 📞 Support

For issues and questions about the project structure, refer to:

- Backend: `server/README.md` (to be created)
- Frontend: `client/README.md` (to be created)
- API Docs: See `README.md` for endpoint documentation

---

**You now have a enterprise-grade clinic management system! 🏥🚀**
