import { Row, Col, Card, Button, FormControl } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCourse, addCourse, deleteCourse, updateCourse, setCourses } from "./Courses/reducer";
import {
  toggleShowAllCourses,
  enroll,
  unenroll,
  setEnrollments
} from "./Enrollments/reducer";
import * as enrollmentsClient from "./Enrollments/client";
import * as userClient from "./Account/client"
import { useEffect, useState, useRef } from "react";

export default function Dashboard({ 
  courses, 
  course, 
  setCourse, 
  addNewCourse, 
  deleteCourse, 
  updateCourse,
  enrolling, 
  setEnrolling
}: {
  courses: any[];
  course: any;
  setCourse: (course: any) => void;
  addNewCourse: () => void;
  deleteCourse: (id: string) => void;
  updateCourse: () => void;
  enrolling: boolean;
  setEnrolling: (enrolling: boolean) => void;
  updateEnrollment: (courseId: string, enrolled: boolean) => void;
}) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const enrollmentState = useSelector((state: any) => state.enrollmentReducer);
  const { enrollments, showAllCourses } = enrollmentState || { enrollments: [], showAllCourses: false };
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    coursesCount: 0,
    enrollmentsCount: 0,
    userRole: ''
  });

  // Use ref to track if enrollments have been fetched
  const enrollmentsFetched = useRef(false);

  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Dashboard - Current User:", currentUser);
    console.log("Dashboard - Courses:", courses);
    console.log("Dashboard - Enrollments:", enrollments);
    
    setDebugInfo({
      coursesCount: Array.isArray(courses) ? courses.length : 0,
      enrollmentsCount: Array.isArray(enrollments) ? enrollments.length : 0,
      userRole: currentUser?.role || 'None'
    });
    
    // Only fetch enrollments once
    if (!enrollmentsFetched.current) {
      const fetchEnrollments = async () => {
        try {
          console.log("Fetching enrollments...");
          const serverEnrollments = await enrollmentsClient.getAllEnrollments();
          console.log("Enrollments fetched:", serverEnrollments);
          dispatch(setEnrollments(serverEnrollments));
          enrollmentsFetched.current = true;
        } catch (error) {
          console.error("Failed to load enrollments:", error);
        }
      };
      fetchEnrollments();
    }
  }, [dispatch]);

  const handleSetCourse = (newCourseData: any) => {
    console.log("Setting course data:", newCourseData);
    setCourse(newCourseData);
  };

  const handleToggleShowAllCourses = () => {
    console.log("Toggling show all courses from", showAllCourses, "to", !showAllCourses);
    dispatch(toggleShowAllCourses());
    console.log("Toggling enrolling from", enrolling, "to", !enrolling);
    setEnrolling(!enrolling);
  };

  const handleEnroll = async (courseId: string) => {
    if (currentUser) {
      try {
        console.log("Enrolling user", currentUser._id, "in course", courseId);
        await userClient.enrollIntoCourse(currentUser._id, courseId);
        dispatch(enroll({ userId: currentUser._id, courseId }));
        
        // Update UI optimistically, but provide a fallback if the API call fails
        const updatedCourses = courses.map(c => 
          c._id === courseId ? { ...c, enrolled: true } : c
        );
        setCourses(updatedCourses);
      } catch (error) {
        console.error("Failed to enroll:", error);
        // Show an error message to the user
        alert("Failed to enroll in course. Please try again.");
      }
    }
  };
  
  const handleUnenroll = async (courseId: string) => {
    if (currentUser) {
      try {
        console.log("Unenrolling user", currentUser._id, "from course", courseId);
        await userClient.unenrollFromCourse(currentUser._id, courseId);
        dispatch(unenroll({ userId: currentUser._id, courseId }));
        
        // Update UI optimistically, but provide a fallback if the API call fails
        const updatedCourses = courses.map(c => 
          c._id === courseId ? { ...c, enrolled: false } : c
        );
        setCourses(updatedCourses);
      } catch (error) {
        console.error("Failed to unenroll:", error);
        // Show an error message to the user
        alert("Failed to unenroll from course. Please try again.");
      }
    }
  };
  const isEnrolled = (courseId: string) => {
    // First check if the course has an enrolled flag
    const course = courses.find(c => c._id === courseId);
    if (course && 'enrolled' in course) {
      return course.enrolled === true;
    }
    
    // Fallback to checking enrollments
    return Array.isArray(enrollments) && enrollments.some(
      e => e.user === currentUser?._id && e.course === courseId
    );
  };

  const handleCourseNavigation = (event: React.MouseEvent, courseId: string) => {
    if (currentUser?.role === "STUDENT" && !isEnrolled(courseId)) {
      event.preventDefault();
    }
  };

  return (
    <div id="wd-dashboard">
      <h1 id="wd-dashboard-title">Dashboard</h1>
      <hr />

      {currentUser?.role === "STUDENT" && (
        <div className="mb-3">
          <button
            className={showAllCourses ? "btn btn-secondary float-end" : "btn btn-primary float-end"}
            onClick={handleToggleShowAllCourses}
          >
            {showAllCourses ? "My Courses" : "All Courses"}
          </button>
        </div>
      )}

      {currentUser?.role === "FACULTY" && (
        <>
          <h5>New Course
            <button className="btn btn-primary float-end" onClick={addNewCourse}>Add</button>
            <button className="btn btn-warning float-end me-2" onClick={updateCourse}>Update</button>
          </h5>
          <br />
          <FormControl
            value={course.name || ''}
            className="mb-2"
            onChange={(e) => handleSetCourse({ ...course, name: e.target.value })}
          />
          <FormControl
            value={course.description || ''}
            as="textarea"
            rows={3}
            onChange={(e) => handleSetCourse({ ...course, description: e.target.value })}
          />
        </>
      )}

      <hr />
      <h2 id="wd-dashboard-published">
        {currentUser?.role === "STUDENT" && !showAllCourses
          ? "My Enrollments"
          : "Published Courses"} ({Array.isArray(courses) ? courses.length : 0})
      </h2>
      <hr />

      {/* Display message if no courses */}
      {(!Array.isArray(courses) || courses.length === 0) && (
        <div className="alert alert-info">
          {currentUser?.role === "FACULTY" 
            ? "No courses available. Create a new course using the form above."
            : "No courses available. Try changing to 'All Courses' mode or contact your administrator."}
        </div>
      )}

      <div id="wd-dashboard-courses">
        <Row xs={1} md={5} className="g-4">
          {Array.isArray(courses) && courses.map((course: any, index: number) => (
            <Col key={course._id || `course-${index}`} className="wd-dashboard-course" style={{ width: "300px" }}>
              <Card>
                <Link
                  to={`/Kambaz/Courses/${course._id}/Home`}
                  className="wd-dashboard-course-link text-decoration-none text-dark"
                  onClick={(e) => handleCourseNavigation(e, course._id)}
                >
                  <Card.Img src="/images/reactjs.jpg" variant="top" width="100%" height={160} />
                  <Card.Body className="card-body">
                    <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">
                      {course.name}
                    </Card.Title>
                    <Card.Text className="wd-dashboard-course-description overflow-hidden" style={{ height: "100px" }}>
                      {course.description}
                    </Card.Text>

                    {currentUser?.role === "STUDENT" ? (
                      isEnrolled(course._id) ? (
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.preventDefault();
                            handleUnenroll(course._id);
                          }}
                        >
                          Unenroll
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEnroll(course._id);
                          }}
                        >
                          Enroll
                        </Button>
                      )
                    ) : (
                      <Button variant="primary">Go</Button>
                    )}

                    {currentUser?.role === "FACULTY" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteCourse(course._id);
                          }}
                          className="btn btn-danger float-end"
                        >
                          Delete
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSetCourse(course);
                          }}
                          className="btn btn-warning me-2 float-end"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </Card.Body>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}