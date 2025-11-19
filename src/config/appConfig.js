require('dotenv').config();

const appConfig = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    apiVersion: process.env.API_VERSION || 'v1'
};

// Validation des variables requises
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`❌ Environment variable ${envVar} is required`);
    }
}

module.exports = { appConfig };
