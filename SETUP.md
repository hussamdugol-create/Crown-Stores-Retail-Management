# 🚀 Crown Stores RMS - Setup & Testing Guide

## **Prerequisites**
- Node.js (v14+)
- MongoDB (local or cloud)
- VS Code
- Postman or REST Client extension (optional, for API testing)

---

## **📦 Installation Steps**

### **1. Install Dependencies**
```bash
npm install
```

This installs:
- ✅ `express` - Web framework
- ✅ `mongoose` - MongoDB ODM
- ✅ `jsonwebtoken` - JWT authentication
- ✅ `bcryptjs` - Password hashing
- ✅ `cors` - Cross-origin requests
- ✅ `dotenv` - Environment variables

### **2. Create `.env` File**
Copy the `.env.example` and create your `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
MONGO_URI=mongodb://localhost:27017/crown-stores-rms
PORT=3000
JWT_SECRET=your-secure-random-secret-key-here
```

**For MongoDB Atlas cloud:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crown-stores-rms
```

### **3. Start MongoDB**
If using local MongoDB:
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

Or use **MongoDB Atlas** (cloud): https://www.mongodb.com/cloud/atlas

---

## **🌱 Seed Initial Data**

Create test users in the database:
```bash
node seed-users.js
```

**Output:**
```
📦 Connected to MongoDB
🗑️  Cleared existing users
✅ Test users created successfully

📋 Created Users:
  - cashier (agent): cashier@crownstores.com
  - manager (manager): manager@crownstores.com
  - director (director): director@crownstores.com
```

---

## **🎯 Start the Server**

```bash
node app.js
```

**Expected Output:**
```
========================================
🎉 Database Connected Successfully to MongoDB!
========================================
🚀 Server is running on: http://localhost:3000
```

---

## **🧪 Testing the System**

### **Option 1: Automated Testing (Node.js)**
```bash
node test-auth.js
```

This comprehensive test covers:
- ✅ Login for all 3 roles
- ✅ Invalid credentials rejection
- ✅ Protected endpoints
- ✅ User registration
- ✅ Logout

**Sample Output:**
```
╔════════════════════════════════════════════════════════╗
║   CROWN STORES RMS - AUTHENTICATION TEST SUITE        ║
╚════════════════════════════════════════════════════════╝

🔐 TESTING LOGIN ENDPOINTS
==================================================

📝 Testing login for: cashier (agent)
   ✅ Login successful
   🔑 Token: eyJhbGciOiJIUzI1NiIsInR5...
   👤 User: John Cashier (agent)
```

### **Option 2: Browser Testing (Recommended)**
1. Open: `http://localhost:3000`
2. Login with demo credentials:
   - **Username:** `cashier`, `manager`, or `director`
   - **Password:** `123456`
3. After login, you'll be redirected to your dashboard

### **Option 3: Postman/REST Client Testing**

#### **Login Request**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "cashier",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Cashier",
    "username": "cashier",
    "role": "agent",
    "email": "cashier@crownstores.com"
  }
}
```

#### **Get Current User (Protected)**
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <YOUR_TOKEN_HERE>
```

#### **Register New User**
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "newagent",
  "password": "newpass123",
  "email": "newagent@crownstores.com",
  "name": "New Agent",
  "role": "agent"
}
```

#### **Logout**
```
POST http://localhost:3000/api/auth/logout
Authorization: Bearer <YOUR_TOKEN_HERE>
```

---

## **🔐 Authentication System Overview**

### **How It Works:**

1. **User Login**
   - Browser sends `username` + `password` to `/api/auth/login`
   - Server validates credentials against MongoDB
   - If valid, generates JWT token with 24-hour expiry
   - Token stored in browser's `localStorage`

2. **Protected Requests**
   - Frontend adds token to `Authorization: Bearer <token>` header
   - Backend middleware validates token
   - Request proceeds if token is valid

3. **Token Expiry**
   - Tokens expire after 24 hours
   - User must login again

4. **Role-Based Access**
   - Each user has a role: `agent`, `manager`, or `director`
   - Can restrict endpoints by role using middleware

---

## **📁 Project Structure**

```
crown-stores-rms/
├── app.js                      # Main server file
├── package.json                # Dependencies
├── .env                        # Configuration (create this)
├── .env.example                # Example configuration
├── seed-users.js               # Create test users
├── test-auth.js                # Authentication tests
│
├── models/
│   ├── Product.js              # Product schema
│   ├── sale.js                 # Sale schema
│   └── User.js                 # User schema (NEW)
│
├── Routes/
│   ├── productRoutes.js        # Product endpoints
│   └── authRoutes.js           # Auth endpoints (NEW)
│
├── middleware/
│   └── authMiddleware.js       # JWT verification (NEW)
│
├── public/
│   ├── dashboard-agent.html    # Sales Agent dashboard
│   ├── dashboard-manager.html  # Manager dashboard
│   ├── dashboard-director.html # Director dashboard
│   └── js/
│       ├── auth.js             # Frontend auth logic (UPDATED)
│       └── sales.js            # Sales module
│
└── views/
    └── login.html              # Login page (UPDATED)
```

---

## **🚨 Troubleshooting**

### **"Cannot find module" Error**
```bash
npm install
```

### **"MongoDB connection failed"**
- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- Check firewall settings

### **"Port 3000 already in use"**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Or use different port in .env
PORT=3001
```

### **"Invalid token" errors**
- Restart the server (tokens may be using old secret)
- Clear browser's localStorage and login again

---

## **🎓 Test Credentials**

| Username  | Password | Role     | Email                      |
|-----------|----------|----------|----------------------------|
| cashier   | 123456   | agent    | cashier@crownstores.com    |
| manager   | 123456   | manager  | manager@crownstores.com    |
| director  | 123456   | director | director@crownstores.com   |

---

## **✅ Next Steps**

1. ✅ Install dependencies
2. ✅ Create `.env` file
3. ✅ Start MongoDB
4. ✅ Seed test users
5. ✅ Start server
6. ✅ Run tests
7. ✅ Test in browser: `http://localhost:3000`

---

## **📝 Common Tasks**

### **Create a New User Programmatically**
```javascript
const User = require('./models/User');

await User.create({
  username: 'newuser',
  password: 'pass123',
  email: 'newuser@example.com',
  name: 'New User',
  role: 'agent'
});
```

### **Protect an API Endpoint**
```javascript
const authMiddleware = require('./middleware/authMiddleware');
const { authorize } = require('./middleware/authMiddleware');

// All authenticated users
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Accessed by: ' + req.user.username });
});

// Only managers and directors
router.delete('/admin-only', authorize('manager', 'director'), (req, res) => {
  res.json({ message: 'Admin-only action' });
});
```

---

## **📚 Resources**

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Documentation](https://jwt.io)
- [MongoDB Documentation](https://docs.mongodb.com)

---

**Happy testing! 🎉**
