const Service = require("../../models/admin/Service");

exports.createService = async (req, res) => {
  try {
    const { name, route } = req.body;
    const service = new Service({ name, route });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, route, status } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, route, status },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
