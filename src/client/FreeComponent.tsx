import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function FreeComponent() {
  // set an initial state for the message we will receive after the API call
  const [message, setMessage] = useState("");

  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // Get the token generated on login
    const token = Cookies.get("TOKEN");

    // set configurations for the API call here
    const configuration = {
      method: "get",
      url: "http://localhost:3000/free-endpoint",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setMessage(result.data.message);
      })
      .catch((error) => {
        console.error("Error in API call:", error);
      });
  }, []);

  return (
    <div>
      <h1 className="text-center">Free Component</h1>

      {/* displaying our message from our API call */}
      <h3 className="text-center text-danger">{message}</h3>
    </div>
  );
}