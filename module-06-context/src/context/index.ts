import { YogaInitialContext } from 'graphql-yoga';
import { IncomingMessage } from 'node:http';
import { GraphQLContext, RequestMeta } from '../types/index.js';
import { createDatabase } from '../db/index.js';
import { createLogger } from '../services/logger.js';
import { authenticateRequest } from '../services/auth.js';

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Extract client IP from request
const getClientIp = (req: IncomingMessage): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

// Create database instance (shared across requests - simulating connection pool)
const db = createDatabase();

// Context factory function - called for each request
export const createContext = async (
  initialContext: YogaInitialContext
): Promise<GraphQLContext> => {
  const req = initialContext.request;

  // Generate request-scoped metadata
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Extract headers from the Fetch API Request
  const authHeader = req.headers.get('authorization') || undefined;
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // For IP, we need to access the raw Node.js request if available
  // In Yoga, the raw request might be in params
  const rawReq = (initialContext as unknown as { req?: IncomingMessage }).req;
  const ip = rawReq ? getClientIp(rawReq) : 'unknown';

  // Create request metadata
  const requestMeta: RequestMeta = {
    requestId,
    startTime,
    ip,
    userAgent,
  };

  // Create request-scoped logger
  const logger = createLogger(requestId);

  // Authenticate request
  const currentUser = authenticateRequest(authHeader);

  // Log incoming request
  logger.info('Incoming GraphQL request', {
    authenticated: !!currentUser,
    userId: currentUser?.id,
  });

  return {
    db,
    logger,
    currentUser,
    request: requestMeta,
    req: rawReq as IncomingMessage,
  };
};
