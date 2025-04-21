import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FormControl, Button } from "react-bootstrap";
import * as client from "./client";
import { setCurrentUser } from "./reducer";

export default function Signin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signin = async () => {
    try {
      const user = await client.signin(credentials);
      dispatch(setCurrentUser(user));
      // jump back up to the /Kambaz/Dashboard route
      navigate("/Kambaz/Dashboard");
    } catch (e) {
      alert("Invalid credentials");
    }
  };

  return (
    <div id="wd-signin-screen">
      <h1>Sign in</h1>
      <FormControl
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        className="mb-2"
        placeholder="Username"
      />
      <FormControl
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        className="mb-2"
        type="password"
        placeholder="Password"
      />
      <Button onClick={signin} className="w-100 mb-2">
        Sign in
      </Button>
      {/* make sure this points at the full /Kambaz/... path */}
      <Link to="/Kambaz/Account/Signup">Sign up</Link>
    </div>
  );
}
