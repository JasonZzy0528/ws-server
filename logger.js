import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(
      {
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
        level: process.env.LOG_LEVEL,
        prettyPrint: true,
        colorize: true,
        silent: false,
        timestamp: false
      }
    )
  ]
})

export default logger
