const Branch = require("../models/admin/Branch");

exports.getBranchServiceInfo = async (req, res) => {
  try {
    const branches = await Branch.find(
      {},
      {
        name: 1,
        "address.country": 1,
        "address.coordinates": 1,
        serviceRadius: 1,
      }
    );

    console.log("Fetched branches:", branches); // Log 1

    if (!branches.length) {
      return res
        .status(404)
        .json({ message: "No service locations available" });
    }

    // Group branches by country - make country name case insensitive
    const branchesbyCountry = branches.reduce((acc, branch) => {
      const country = branch.address.country.toLowerCase(); // Convert to lowercase
      console.log("Processing country:", country); // Log 2

      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push({
        id: branch._id,
        name: branch.name,
        coordinates: branch.address.coordinates,
        serviceRadius: branch.serviceRadius,
      });
      return acc;
    }, {});

    console.log("Grouped branches:", branchesbyCountry); // Log 3

    res.json({
      availableCountries: Object.keys(branchesbyCountry),
      branchesbyCountry,
    });
  } catch (error) {
    console.error("Error fetching branch service info:", error);
    res.status(500).json({ message: "Server error" });
  }
};
