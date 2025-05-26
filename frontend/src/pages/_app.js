import store from "@/config/redux/store";
import "@/styles/globals.css";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { setUser } from "@/config/redux/reducer/authReducer";
import { getAboutUser } from "@/config/redux/action/authAction";
import axios from "axios";
import Head from "next/head";
import Cookies from "js-cookie";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <AuthStateObserver>
        <Component {...pageProps} />
      </AuthStateObserver>
    </Provider>
  );
}

function AuthStateObserver({ children }) {
  const router = useRouter();

  useEffect(() => {
    const API_URL = "http://localhost:5050";
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          localStorage.setItem("token", token);
          Cookies.set("token", token, { expires: 1 }); // expires in 1 day

          const response = await axios.get(`${API_URL}/get_user_and_profile`, {
            headers: { Authorization: `Bearer ${token}` }
          }); 

          store.dispatch(setUser(response.data));
          store.dispatch(getAboutUser());

          if (router.pathname === "/login") {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          
          if (error.response?.status === 404) {
            if (router.pathname !== "/register/complete") {
              router.push("/register/complete");
            }
          } else if (error.response?.status === 401 || error.response?.status === 403) {
            await auth.signOut();
            localStorage.removeItem("token");
          }
        }
      } else {
        localStorage.removeItem("token");
        const publicPaths = ["/", "/login", "/register", "/register/complete"];
        if (!publicPaths.includes(router.pathname)) {
          router.push("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return children;
}

export default MyApp;
