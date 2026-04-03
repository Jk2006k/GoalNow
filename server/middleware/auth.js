const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('❌ Auth Error: No token provided in Authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔐 Verifying token...');
    console.log('Token first 20 chars:', token.substring(0, 20) + '...');
    console.log('JWT_SECRET defined:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET value:', process.env.JWT_SECRET?.substring(0, 10) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully. UserId:', decoded.userId);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('JWT_SECRET matches:', process.env.JWT_SECRET ? 'defined' : 'UNDEFINED');
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format or secret mismatch' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
