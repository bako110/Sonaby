const { asyncHandler } = require('../../middleware/asyncHandler');
const { authService } = require('./auth.service');
const userService = require('../user/user.service'); // Import du service user
const { 
    registerSchema, 
    loginSchema, 
    refreshTokenSchema,
    changePasswordSchema,
    resetPasswordByAdminSchema
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
        const userId = req.user.userId;
        console.log("L'identifiant de l'utilisateur est:", userId);
        
        const user = await authService.getUserProfile({ userId });
        
        res.json({
            success: true,
            data: { user }
        });
    }),
    
    // Nouvelle méthode : Changement de mot de passe
   resetPasswordByAdmin: asyncHandler(async (req, res) => {
    // Validation avec Zod
    const { newPassword } = resetPasswordByAdminSchema.parse(req.body);
    const { userId } = req.params;
    
    // Vérifier que l'utilisateur est ADMIN
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé aux administrateurs'
        });
    }
    
    // Appeler le service
    const result = await authService.resetPasswordByAdmin(userId, newPassword);
    
    return res.status(200).json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
        data: result
    });
}),
    
    // Tableau de bord complet pour agent de contrôle
    getAgentDashboard: asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        // Vérifier que c'est un agent de contrôle
        if (userRole !== 'AGENT_CONTROLE') {
            return res.status(403).json({
                success: false,
                message: 'Accès réservé aux agents de contrôle'
            });
        }
        
        const dashboardData = await authService.getAgentDashboardData(userId);
        
        res.json({
            success: true,
            message: 'Données du tableau de bord agent récupérées',
            data: dashboardData
        });
    })
};

module.exports = authController;