const { asyncHandler } = require('../../middleware/asyncHandler');
const { authService } = require('./auth.service');
const { 
    registerSchema, 
    loginSchema, 
    refreshTokenSchema 
} = require('./auth.schema');

const authController = {
  
    register: asyncHandler(async (req, res) => {
        const validatedData = registerSchema.parse(req.body);
        const result = await authService.register(validatedData);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    }),
    
 
    login: asyncHandler(async (req, res) => {
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.login(validatedData);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    }),
    

    refreshToken: asyncHandler(async (req, res) => {
        const validatedData = refreshTokenSchema.parse(req.body);
        const tokens = await authService.refreshToken(validatedData);
        
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        });
    }),
    

    logout: asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;
        
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }),
    
   
    getProfile: asyncHandler(async (req, res) => {
        // req.user contient les données du token JWT (userId, role)
        const userId = req.user.userId;
        
        // Récupérer les données complètes de l'utilisateur depuis la base
        const user = await authService.getUserProfile(userId);
        
        res.json({
            success: true,
            data: { user }
        });
    })
};

module.exports = authController;
