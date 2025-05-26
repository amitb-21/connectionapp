import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles.module.css";
import { resetState } from "@/config/redux/reducer/authReducer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { isLoading, isError, isSuccess, message, loggedIn } = useSelector(
    (state) => state.auth
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (loggedIn) {
      router.push("/dashboard");
    }
    
    return () => {
      dispatch(resetState());
    };
  }, [loggedIn, router, dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h1>Login</h1>
        
        {isError && <div className={styles.error}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p className={styles.registerLink}>
          Don't have an account? <Link href="/register" onClick={() => dispatch(resetState())}>Register</Link>
        </p>
      </div>
    </div>
  );
}
