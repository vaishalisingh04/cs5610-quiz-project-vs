import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./styles.css";
import Session from "./Account/Session";
import Account from "./Account";
import Dashboard from "./Dashboard";
import Courses from "./Courses";
import KambazNavigation from "./Navigation";
import ProtectedRoute from "./Account/ProtectedRoute";
import ProtectedCourseRoute from "./Courses/ProtectedCourseRoute";

import * as userClient from "./Account/client";
import * as courseClient from "./Courses/client";
import { setCourses as setReduxCourses } from "./Courses/reducer";

export default function Kambaz() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [courses, setCourses] = useState<any[]>([]);
  const [course, setCourse] = useState<any>({
    name: "",
    description: "",
  });
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const dispatch = useDispatch();

  const findCoursesForUser = async () => {
    try {
      console.log("Finding courses for user:", currentUser?._id);
      const courses = await userClient.findCoursesForUser(currentUser._id);
      console.log("Found courses:", courses);
      setCourses(courses.map((c: any) => ({ ...c, enrolled: true })));
      dispatch(
        setReduxCourses(courses.map((c: any) => ({ ...c, enrolled: true })))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log("Fetching all courses");
      const allCourses = await courseClient.fetchAllCourses();
      console.log("All courses:", allCourses);

      console.log("Finding enrolled courses for user:", currentUser?._id);
      const enrolledCourses = await userClient.findCoursesForUser(
        currentUser._id
      );
      console.log("Enrolled courses:", enrolledCourses);

      const coursesWithStatus = allCourses.map((course: any) => {
        if (enrolledCourses.find((c: any) => c._id === course._id)) {
          return { ...course, enrolled: true };
        } else {
          return { ...course, enrolled: false };
        }
      });
      console.log("Setting courses with status:", coursesWithStatus);
      setCourses(coursesWithStatus);
      dispatch(setReduxCourses(coursesWithStatus));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const updateEnrollment = async (courseId: string, enrolled: boolean) => {
    if (!currentUser) return;

    try {
      console.log(
        `${enrolled ? "Enrolling in" : "Unenrolling from"} course ${courseId}`
      );

      if (enrolled) {
        await userClient.enrollIntoCourse(currentUser._id, courseId);
      } else {
        await userClient.unenrollFromCourse(currentUser._id, courseId);
      }

      // Update courses state with the new enrollment status
      const updatedCourses = courses.map((c) =>
        c._id === courseId ? { ...c, enrolled } : c
      );

      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      // Optional: Revert UI changes if the API call failed
      // This would require tracking the previous state
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log(
        "Current user detected, loading courses. Enrolling mode:",
        enrolling
      );
      if (enrolling) {
        fetchCourses();
      } else {
        findCoursesForUser();
      }
    } else {
      console.log("No current user, skipping course loading");
    }
  }, [currentUser, enrolling]);

  const addNewCourse = async () => {
    if (!course.name || !course.description) {
      alert("Course name and description are required.");
      return;
    }

    try {
      console.log("Creating new course:", course);
      const newCourse = await courseClient.createCourse(course);
      console.log("New course created:", newCourse);
      setCourses([...courses, newCourse]);
      setCourse({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      console.log("Deleting course:", courseId);
      await courseClient.deleteCourse(courseId);
      setCourses(courses.filter((course) => course._id !== courseId));
      console.log("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const updateCourse = async () => {
    try {
      console.log("Updating course:", course);
      await courseClient.updateCourse(course);
      setCourses(courses.map((c) => (c._id === course._id ? course : c)));
      console.log("Course updated successfully");
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  return (
    <Session>
      <div id="wd-kambaz">
        <KambazNavigation />
        <div
          className="wd-main-content-offset p-3"
          style={{
            flex: 1,
            overflowY: "auto",
            // marginLeft: "120px",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="Account" />} />
            <Route path="/Account/*" element={<Account />} />
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    courses={courses}
                    course={course}
                    setCourse={setCourse}
                    addNewCourse={addNewCourse}
                    deleteCourse={deleteCourse}
                    updateCourse={updateCourse}
                    enrolling={enrolling}
                    setEnrolling={setEnrolling}
                    updateEnrollment={updateEnrollment}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Courses/:cid/*"
              element={
                <ProtectedRoute>
                  <ProtectedCourseRoute>
                    <Courses />
                  </ProtectedCourseRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/Calendar" element={<h1>Calendar</h1>} />
            <Route path="/Inbox" element={<h1>Inbox</h1>} />
          </Routes>
        </div>
      </div>
    </Session>
  );
}
