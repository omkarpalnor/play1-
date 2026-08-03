# PlayRizon - Complete Project Documentation

## Overview

PlayRizon is a comprehensive turf booking platform that connects users with turf owners through a multi-module system. The application consists of three main modules: User, Owner, and Admin, each serving distinct roles in the turf booking ecosystem.

## Architecture

The project follows a **MERN stack architecture** with separate frontend applications for different user types:

- **Backend**: Node.js + Express.js + MongoDB
- **User Frontend**: React + Vite + Tailwind CSS + Redux
- **Owner Frontend**: React + Vite + Tailwind CSS + Redux
- **Admin Module**: Integrated within the backend system

## Project Structure

```
PlayRizon-main-3/
├── client/
│   ├── owner/          # Owner module frontend
│   └── user/           # User module frontend
├── server/             # Backend API server
├── assets/             # Static assets
├── Reports/            # Project reports and documentation
├── LICENSE
└── README.md
```

## Database Models

### Core Entities

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  bookings: [Booking references],
  loyaltyPoints: Number,
  lifetimeLoyaltyPoints: Number,
  isEmailVerified: Boolean,
  emailVerifyToken: String,
  deletionRequest: {
    reason: String,
    suggestion: String,
    status: Enum['none', 'pending_email_verification', 'pending_admin_approval', 'approved', 'rejected']
  }
}
```

#### Owner Model
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  phone: String,
  role: Enum['admin', 'owner'],
  isEmailVerified: Boolean
}
```

#### Turf Model
```javascript
{
  name: String,
  description: String,
  location: String,
  image: String,
  sportTypes: [String],
  pricePerHour: Number,
  openTime: String,
  closeTime: String,
  reviews: [Review references],
  owner: Owner reference
}
```

#### Booking Model
```javascript
{
  user: User reference,
  turf: Turf reference,
  timeSlot: TimeSlot reference,
  baseAmount: Number,
  discountAmount: Number,
  coupon: Coupon reference,
  totalPrice: Number,
  loyaltyPointsEarned: Number,
  qrCode: String,
  status: Enum['confirmed', 'cancelled'],
  payment: {
    orderId: String,
    paymentId: String
  }
}
```

### Supporting Models

- **Review Model**: User ratings and feedback for turfs
- **Coupon Model**: Discount codes and promotions
- **CouponRedemption Model**: Track coupon usage
- **TimeSlot Model**: Available booking slots
- **OwnerRequest Model**: User applications to become owners

## Modules and Features

### 1. User Module

#### Core Features
- **Browse Turfs**: View available turfs with details, filtering, and search
- **Slot Booking**: Real-time slot selection and booking with Razorpay integration
- **Payment Processing**: Secure payment gateway integration
- **QR Code Generation**: Automatic QR code generation for booking confirmations
- **Email Notifications**: Booking confirmation emails with all details
- **Rating System**: Rate and review booked turfs
- **Loyalty Program**: Earn points on bookings

#### Authentication Features
- User registration and login
- Email verification system
- Password reset functionality
- Profile management
- Account deletion request system

#### Pages and Components
- Home page with turf listings
- Turf detail pages
- Booking flow
- User profile
- Authentication pages (Login, Signup, Forgot Password)
- About page

### 2. Owner Module

#### Core Features
- **Turf Management**: Add, edit, and delete turf listings
- **Dashboard**: Analytics and statistics visualization
- **Booking Management**: View and manage all bookings
- **Review Management**: Monitor and respond to user reviews
- **Financial Overview**: Track revenue and transactions
- **Image Upload**: Cloudinary integration for turf images

#### Authentication Features
- Owner registration (admin approval required)
- Email verification system
- Password reset functionality
- Profile management

#### Pages and Components
- Dashboard with charts and statistics
- Turf management interface
- Booking overview
- Review management
- Profile settings
- Authentication pages

### 3. Admin Module

#### Core Features
- **Owner Request Management**: Approve/reject owner applications
- **User Management**: View and manage all registered users
- **Turf Oversight**: Monitor all platform turfs
- **Transaction Analytics**: Comprehensive financial reporting
- **Platform Statistics**: Overall platform metrics
- **Content Moderation**: Manage reviews and content

#### Administrative Functions
- Owner approval workflow
- User account management
- Turf listing verification
- Transaction monitoring
- Monthly reporting with graphs

## Technology Stack

### Backend Dependencies
- **Express.js**: Web framework
- **MongoDB + Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **Argon2**: Password hashing
- **Cloudinary**: Image hosting
- **Razorpay**: Payment processing
- **Nodemailer**: Email services
- **PDFKit**: PDF generation
- **QRCode**: QR code generation
- **Sharp**: Image processing

### Frontend Dependencies (User & Owner)
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS + DaisyUI**: Styling
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Yup**: Form validation
- **Lucide React**: Icons
- **React Hot Toast**: Notifications

### Owner-Specific Dependencies
- **Recharts**: Data visualization
- **React CountUp**: Animated counters
- **React Avatar**: User avatars
- **React DatePicker**: Date selection
- **React Time Picker**: Time selection

### User-Specific Dependencies
- **GSAP**: Animations
- **React DatePicker**: Date selection

## API Architecture

### Route Structure
```
/api/
├── /user/           # User-specific routes
├── /owner/          # Owner-specific routes
├── /admin/          # Admin-specific routes
└── /                # Common routes
```

### Key Endpoints

#### User Routes
- Authentication (login, signup, verify email)
- Turf browsing and details
- Booking management
- Profile management
- Review submission

#### Owner Routes
- Authentication and profile
- Turf CRUD operations
- Booking management
- Dashboard analytics
- Review management

#### Admin Routes
- Owner request management
- User oversight
- Turf management
- Transaction analytics
- Platform statistics

## Security Features

- **Password Hashing**: Argon2 for secure password storage
- **JWT Authentication**: Token-based authentication
- **Email Verification**: Verify user email addresses
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Express-validator for request sanitization
- **CORS Configuration**: Cross-origin resource sharing setup
- **MongoDB Sanitization**: Prevent NoSQL injection attacks
- **Helmet**: Security headers configuration

## Integration Services

### Payment Integration (Razorpay)
- Secure payment processing
- Order creation and verification
- Payment status tracking
- Refund handling

### Email Service (Nodemailer)
- Booking confirmations
- Email verification
- Password reset
- Owner approval notifications
- Account deletion notifications

### Image Hosting (Cloudinary)
- Turf image uploads
- Image optimization
- CDN delivery
- Secure storage

## Development Setup

### Environment Variables
```env
PORT = your_port
MONGO_URI=your_mongo_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
OWNER_URL = your_owner_url
USER_URL = your_user_url
EMAIL = your_email
PASSWORD = your_app_password
RAZORPAY_KEY_ID = your_razorpay_key_id
RAZORPAY_SECRET_KEY = your_razorpay_secret_key
JWT_SECRET = your_jwt_secret
```

### Installation Steps
1. Clone repository
2. Install server dependencies
3. Install owner client dependencies
4. Install user client dependencies
5. Configure environment variables
6. Start all three services

## Key Features Summary

### User Experience
- Intuitive turf browsing with filters
- Seamless booking flow
- Multiple payment options
- Real-time availability checking
- Booking history and management
- Loyalty rewards program

### Owner Experience
- Comprehensive turf management
- Real-time booking notifications
- Financial analytics dashboard
- Review management system
- Easy image uploads
- Revenue tracking

### Administrative Features
- Centralized user management
- Owner approval workflow
- Platform-wide analytics
- Transaction monitoring
- Content moderation tools
- Monthly reporting

## Advanced Features

### Loyalty Program
- Points earned on every booking
- Lifetime points tracking
- Points-based rewards system
- Points history in user profile

### Coupon System
- Discount code generation
- Usage tracking
- Redemption management
- Campaign-based promotions

### Email Templates
- Automated booking confirmations
- QR code integration
- Professional email design
- Multi-purpose notification system

### Analytics and Reporting
- Real-time dashboard charts
- Monthly transaction reports
- User engagement metrics
- Revenue analytics
- Booking trends

## File Structure Details

### Server Structure
```
server/
├── controllers/       # Business logic
│   ├── admin/        # Admin controllers
│   ├── owner/        # Owner controllers
│   └── user/         # User controllers
├── models/           # Database models
├── routes/           # API routes
│   ├── admin/        # Admin routes
│   ├── owner/        # Owner routes
│   └── user/         # User routes
├── middleware/       # Custom middleware
├── utils/            # Utility functions
├── config/           # Configuration files
└── server.js         # Server entry point
```

### Client Structure (Owner & User)
```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── layouts/         # Layout components
├── hooks/           # Custom hooks
├── redux/           # Redux store and slices
├── utils/           # Utility functions
├── router.jsx       # Route configuration
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## 📧 Messaging System

PlayRizon features a comprehensive, real-time messaging system that enables seamless communication between all platform participants.

### **Core Features**

**🔄 Bidirectional Communication:**
- **User ↔ Admin**: Direct messaging and contact form integration
- **User ↔ Owner**: Turf owner search and direct messaging
- **Owner ↔ User**: Owner-initiated conversations with user search
- **Owner ↔ Admin**: Business communication and support
- **Admin ↔ All**: Complete admin control and auto-reply system

**🤖 Auto-Reply System:**
- **Smart Auto-Reply**: Configurable messages with delay settings
- **Batch Processing**: Automated response handling for multiple conversations
- **Email Notifications**: Real-time alerts for auto-replies sent
- **Conversation Management**: Per-conversation auto-reply settings
- **Audit Trail**: Complete logging of auto-reply activities

**📱 Advanced Features:**
- **Real-time Messaging**: Instant message delivery and read receipts
- **Search & Filter**: Advanced conversation management
- **Priority System**: Color-coded priority levels (Low, Medium, High, Urgent)
- **Categories**: General, Booking, Payment, Technical, Feedback, Complaint
- **Archive System**: Clean conversation management
- **Pagination**: Efficient data loading for large conversation lists
- **Responsive Design**: Works perfectly on all screen sizes

### **Technical Implementation**

**Database Models:**
- **Conversation Schema**: Multi-participant conversations with status tracking
- **Message Schema**: Rich messaging with reactions, edits, attachments
- **Auto-Reply Settings**: Configurable per-conversation automation

**API Endpoints:**
```
User: /api/user/messages/* (with owner search)
Owner: /api/owner/messages/* (with user search & auto-reply)
Admin: /api/admin/messages/* (with user/owner support & auto-reply)
```

**Email Integration:**
- **Beautiful Templates**: Professional HTML emails for all message types
- **Smart Routing**: Reply-to functionality for easy responses
- **Auto-Reply Alerts**: Special notifications for automated responses
- **Module-Specific Styling**: Different branding for admin vs owner communications

### **User Experience**

**🎨 Modern UI/UX:**
- **Conversation List**: Clean interface with search, filtering, and unread indicators
- **Message View**: Real-time chat interface with typing indicators
- **Auto-Reply Management**: Easy configuration and status tracking
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with keyboard navigation support

The messaging system represents enterprise-grade communication infrastructure with advanced automation, comprehensive search capabilities, and beautiful user interfaces across all platform modules.

## Conclusion

PlayRizon is a feature-rich, scalable turf booking platform that provides comprehensive solutions for users, turf owners, and administrators. With its modular architecture, robust security features, and extensive functionality, it offers a complete solution for managing turf bookings and operations.

The platform demonstrates modern web development practices with clean code structure, efficient database design, and user-friendly interfaces across all modules.
