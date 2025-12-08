import React from "react";
import { login } from "../../service/loginApi";
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import httpClient from "../../service/httpClients";

const { setAccessToken } = useAuth();

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleLogin = async () => {
    try {
      setMsg("");
      const res = await login(email, password);
      if (res && res.status === 200) {
        setAccessToken(res.accessToken);
        navigate("/users");
      }
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 401) {
        setMsg("* Incorrect email or password");
      } else {
        setMsg("* Login failed, please try again");
        navigate("/login");
      }
    }
  };

  return (
    <Box
      sx={{
        width: "50ch",
        mt: 4,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2
      }}
    >
      <h2 style={{ margin: 0, textAlign: "left" }}>Login</h2>
      <p style={{ color: "red" }}>{msg}</p>
      <FormControl sx={{ width: "100%" }} variant="outlined">
        <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
        />
      </FormControl>
      <FormControl sx={{ width: "100%" }} variant="outlined">
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showPassword ? "hide the password" : "display the password"
                }
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleLogin}>Login</button>
      </Box>
    </Box>
  );
}
