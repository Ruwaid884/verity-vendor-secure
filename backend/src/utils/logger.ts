import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
  level: 'info', // Hardcoded log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'verity-vendor-backend' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transport in production - hardcoded to always use development
// const logDir = path.join(process.cwd(), 'logs');
// if (process.env['NODE_ENV'] === 'production') {
//   logger.add(
//     new winston.transports.File({
//       filename: path.join(logDir, 'error.log'),
//       level: 'error',
//     })
//   );

//   logger.add(
//     new winston.transports.File({
//       filename: path.join(logDir, 'combined.log'),
//     })
//   );
// }

export { logger }; 