const Branch = require("../../models/admin/Branch");

// Helper function to calculate distance between coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Get nearby branches for pickup, sorted by distance
 */
exports.getNearbyBranches = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Get all branches
    const branches = await Branch.find(
      {},
      {
        name: 1,
        address: 1,
        serviceRadius: 1,
      }
    );

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No branches found",
      });
    }

    // Calculate distance for each branch and add to response
    const branchesWithDistance = branches.map((branch) => {
      const branchLat = branch.address.coordinates.latitude;
      const branchLng = branch.address.coordinates.longitude;

      const distance = calculateDistance(
        latitude,
        longitude,
        branchLat,
        branchLng
      );

      return {
        _id: branch._id,
        name: branch.name,
        distance: parseFloat(distance.toFixed(2)),
        address: {
          mainAddress: branch.address.mainAddress,
          city: branch.address.city,
          state: branch.address.state,
        },
        coordinates: branch.address.coordinates,
      };
    });

    // Sort branches by distance
    branchesWithDistance.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      success: true,
      count: branchesWithDistance.length,
      data: branchesWithDistance,
    });
  } catch (error) {
    console.error("Error fetching nearby branches:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby branches",
    });
  }
};

/**
 * Check if delivery is available to user's location
 */
exports.checkDeliveryAvailability = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Get all branches
    const branches = await Branch.find(
      {},
      {
        name: 1,
        address: 1,
        serviceRadius: 1,
      }
    );

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No branches found",
      });
    }

    // Find the nearest branch that can deliver to this location
    let nearestBranch = null;
    let shortestDistance = Infinity;

    branches.forEach((branch) => {
      const branchLat = branch.address.coordinates.latitude;
      const branchLng = branch.address.coordinates.longitude;

      const distance = calculateDistance(
        latitude,
        longitude,
        branchLat,
        branchLng
      );

      // Check if this branch is closer than the current nearest and can deliver
      if (distance < shortestDistance) {
        if (distance <= branch.serviceRadius) {
          nearestBranch = {
            _id: branch._id,
            name: branch.name,
            distance: parseFloat(distance.toFixed(2)),
            address: {
              mainAddress: branch.address.mainAddress,
              city: branch.address.city,
              state: branch.address.state,
            },
            coordinates: branch.address.coordinates,
            serviceRadius: branch.serviceRadius,
          };
          shortestDistance = distance;
        }
      }
    });

    if (!nearestBranch) {
      return res.status(200).json({
        success: true,
        isDeliveryAvailable: false,
        message: "No branches available for delivery to this location",
      });
    }

    return res.status(200).json({
      success: true,
      isDeliveryAvailable: true,
      branch: nearestBranch,
    });
  } catch (error) {
    console.error("Error checking delivery availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check delivery availability",
    });
  }
};
