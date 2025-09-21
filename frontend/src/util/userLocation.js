import { BASE_URL } from "./api.js";

export const fetchUserLocation = async (setLocation, setDistrict, setSubLocation) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.user) {
        const userLocation = data.user.location;
        const userSubLocation = data.user.subLocation;
        if (userLocation && userSubLocation) {
          setLocation(`${userLocation}, ${userSubLocation}`);
          setDistrict(userLocation);
          setSubLocation(userSubLocation);
        } else if (userLocation) {
          setLocation(userLocation);
          setDistrict(userLocation);
        }
      }
    }
  } catch (error) {
    console.log("Could not fetch user location, using default");
  }
};
