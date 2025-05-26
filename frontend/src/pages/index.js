import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Home() {
  const router = useRouter();
  const { loggedIn } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (loggedIn) {
      router.push("/dashboard");
    }
  }, [loggedIn, router]);

  return(
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A True social media platform, with stories no blufs !</p>

            <div onClick={() => {
              router.push("/login");
            }} className={styles.buttonJoin}>
              <p>Join Now</p>
            </div>
          </div>

          <div className={styles.mainContainer_right}>
            <img src="images/home_image.png" alt="main"/>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
