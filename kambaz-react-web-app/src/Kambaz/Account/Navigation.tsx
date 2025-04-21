import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AccountNavigation() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { pathname } = useLocation();
  const active = (path: string) => (pathname.includes(path) ? "active" : "");
  return (
    <div id="wd-account-navigation" className="d-flex flex-column">
      {/* Show Signin & Signup only if there is no currentUser */}
      {!currentUser && (
        <>
          <Link to="/Kambaz/Account/Signin" className="mb-2 text-decoration-none"> Signin </Link>
          <Link to="/Kambaz/Account/Signup" className="mb-2 text-decoration-none"> Signup </Link>
        </>
      )}

      {/* Show Profile only if user is signed in */}
      {currentUser && (
        <Link to="/Kambaz/Account/Profile" className="mb-2 text-decoration-none"> Profile </Link>
      )}

      {currentUser && currentUser.role === "ADMIN" && (
        <Link to={`/Kambaz/Account/Users`} className={`list-group-item ${active("Users")}`}> Users </Link>)}
    </div>
  );
}
