backend-sonaby/
├── package.json
├── .env
├── .gitignore
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── server.js
│   ├── config/
│   │   ├── appConfig.js
│   │   └── prisma.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── asyncHandler.js
│   │   ├── requestLogger.js
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── logger.js
│   ├── docs/
│   │   └── swagger.js
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.schema.js
│   │       ├── auth.service.js
│   │       ├── auth.controller.js
│   │       └── auth.routes.js
│   ├── routes/
│   │   └── index.js
|   ├── server.js
│   └── uploads/
└── logs/