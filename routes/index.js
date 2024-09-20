const authRoutes = require('./authRoutes');
const serviceRoutes = require('./serviceRoutes');
const adminRoutes = require('./adminRoutes');

const mountRoutes = (app) => {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/services', serviceRoutes);
  app.use('/api/v1/admin', adminRoutes);
};

module.exports = mountRoutes;
