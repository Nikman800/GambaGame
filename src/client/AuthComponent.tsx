import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function AuthComponent() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("TOKEN");
    if (!token) {
      navigate("/login");
      return;
    }

    const configuration = {
      method: "get",
      url: "http://localhost:3000/auth-endpoint",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        setMessage(result.data.message);
      })
      .catch((error) => {
        console.error("Error in API call:", error);
        if (error.response && error.response.status === 401) {
          Cookies.remove("TOKEN", { path: "/" });
          navigate("/login");
        }
      });
  }, [navigate]);

  return (
    <div className="text-center">
      <h1>Auth Component</h1>
      <h3 className="text-danger">{message}</h3>
    </div>
  );
}