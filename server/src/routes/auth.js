async (req, res) => {
  try {
    let { name, email, password, role, specialty } = req.body;

    if (role) {
      role = role.toLowerCase();
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({ name, email, password, role });

    if (role === "doctor" && specialty) {
      user.specialty = specialty;
    }

    await user.save();

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    req.session.save((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ message: "Failed to create session" });
      }

      res.status(201).json({
        message: "Registered successfully",
        user: user.toSafeObject(),
      });
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}