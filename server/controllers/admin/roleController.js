const Role = require("../../models/admin/Role");

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body; // removed services
    const role = new Role({ name });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, status } = req.body; // removed services
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
