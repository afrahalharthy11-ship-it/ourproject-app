const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  next();
};

const requireDoctor = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  if (req.session.role !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }
  next();
};

const requirePatient = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  if (req.session.role !== 'patient') {
    return res.status(403).json({ message: 'Access denied. Patients only.' });
  }
  next();
};
const requireManager = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  if (req.session.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Managers only.' });
  }
  next();
};


module.exports = {
  requireLogin,
  requireDoctor,
  requirePatient,
  requireManager,
};

