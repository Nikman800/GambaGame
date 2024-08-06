import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

export default function AuthComponent() {
  // Get the token generated on login
  const token = Cookies.get("TOKEN");

  // Set an initial state for the message we will receive after the API call
  const [message, setMessage] = useState("");

  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // Set configurations for the API call here
    const configuration = {
      method: "get",
      url: "http://localhost:3000/auth-endpoint",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Make the API call
    axios(configuration)
      .then((result) => {
        // Assign the message in our result to the message we initialized above
        setMessage(result.data.message);
      })
      .catch((error) => {
        console.error("Error in API call:", error);
      });
  }, [token]);

  // logout
  const logout = () => {
    // destroy the cookie
    Cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    window.location.href = "/";
  };

  return (
    <div className="text-center">
      <h1>Auth Component</h1>

      {/* Displaying our message from our API call */}
      <h3 className="text-danger">{message}</h3>

      {/* logout */}
      <Button type="submit" variant="danger" onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}