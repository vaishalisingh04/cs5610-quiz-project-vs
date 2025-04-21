import { Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

interface ProtectedCourseRouteProps {
  children: React.ReactNode;
}

export default function ProtectedCourseRoute({ children }: ProtectedCourseRouteProps) {
  const { cid } = useParams();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { enrollments } = useSelector((state: any) => state.enrollmentReducer) || { enrollments: [] };


  if (currentUser?.role === "FACULTY") {
    return <>{children}</>;
  }


  const isEnrolled = enrollments.some(
    (enrollment: any) =>
      enrollment.user === currentUser?._id &&
      enrollment.course === cid
  );


  if (!isEnrolled) {
    return <Navigate to="/Kambaz/Dashboard" />;
  }

  return <>{children}</>;
}