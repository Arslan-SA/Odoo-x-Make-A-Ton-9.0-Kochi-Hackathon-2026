const publicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified !== false,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
});

module.exports = publicUser;
