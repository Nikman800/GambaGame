import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DecodedToken {
  userId: string;
  // Add any other properties that your token payload might have
}

export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

const SECRET_KEY = process.env.JWT_SECRET || "RANDOM-TOKEN"; // Use environment variable if available
console.log('Environment Secret Key:', process.env.JWT_SECRET); // Log the environment secret key
console.log('Used Secret Key:', SECRET_KEY); // Log the used secret key

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Log the token
    console.log('Secret Key:', SECRET_KEY); // Log the secret key

    // Check if the token matches the supposed origin
    const decodedToken = jwt.verify(token, SECRET_KEY) as DecodedToken;
    console.log('Decoded Token:', decodedToken); // Log the decoded token

    // Pass the user down to the endpoints here
    req.user = decodedToken;

    // Pass down functionality to the endpoint
    next();
  } catch (error) {
    console.error('Token verification error:', error); // Log the error
    return res.status(401).json({
      error: 'Invalid token',
    });
  }
};

export default authMiddleware;