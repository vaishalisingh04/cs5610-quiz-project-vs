import { useSelector } from "react-redux";
import QuizPreview from "./QuizPreview";
import QuizTaking from "./QuizTaking";

export default function QuizRouter() {
  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);

  if (!currentUser) {
    return <div className="text-danger">Unauthorized</div>;
  }

  if (currentUser.role === "FACULTY") {
    return <QuizPreview />;
  } else {
    return <QuizTaking />;
  }
}
