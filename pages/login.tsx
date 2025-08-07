import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Info } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { useAuthRedirect } from "../helpers/useAuthRedirect";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const { authState } = useAuth();
  const { redirectAfterAuth } = useAuthRedirect();

  console.log('Login page - auth state:', authState);

  useEffect(() => {
    console.log('Login page - auth state changed:', authState);
    if (authState.type === "authenticated") {
      console.log('User is authenticated, redirecting appropriately');
      redirectAfterAuth();
    }
  }, [authState, redirectAfterAuth]);

  if (authState.type === "loading") {
    // Render a minimal loading state or nothing to avoid flicker
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Login | Kaikoon</title>
        <meta
          name="description"
          content="Log in or create an account to start managing your tasks with Kaikoon."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.loginCard}>
          <h1 className={styles.logo}>
            <Link to="/">KAIKOON</Link>
          </h1>

          <Tabs defaultValue="login" className={styles.tabsContainer}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="login" className={styles.tabTrigger}>
                Log In
              </TabsTrigger>
              <TabsTrigger value="register" className={styles.tabTrigger}>
                Create Account
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className={styles.tabContent}>
              <PasswordLoginForm />
            </TabsContent>
            <TabsContent value="register" className={styles.tabContent}>
              <PasswordRegisterForm />
            </TabsContent>
          </Tabs>

          <div className={styles.testCredentials}>
            <Info size={20} className={styles.infoIcon} />
            <div className={styles.credentialsContent}>
              <p className={styles.credentialsTitle}>Valid Test Credentials</p>
              <p className={styles.credentialsText}>
                <strong>User 1:</strong> <span>test@example.com</span> / <span>Password123</span>
              </p>
              <p className={styles.credentialsText}>
                <strong>User 2:</strong> <span>admin@kaikoon.com</span> / <span>Admin123</span>
              </p>
              <p className={styles.credentialsText}>
                <strong>User 3:</strong> <span>user@example.com</span> / <span>User123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;