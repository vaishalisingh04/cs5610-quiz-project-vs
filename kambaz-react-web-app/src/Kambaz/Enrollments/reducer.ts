import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as db from "../Database";

interface Enrollment {
  user: string;
  course: string;
}

interface EnrollmentState {
  enrollments: Enrollment[];
  showAllCourses: boolean;
}

const initialState: EnrollmentState = {
  enrollments: db.enrollments as Enrollment[],
  showAllCourses: false
};

const enrollmentSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    toggleShowAllCourses: (state) => {
      state.showAllCourses = !state.showAllCourses;
    },
    enroll: (state, action: PayloadAction<{ userId: string; courseId: string }>) => {
      const { userId, courseId } = action.payload;
      const alreadyEnrolled = state.enrollments.some(
        (enrollment) => enrollment.user === userId && enrollment.course === courseId
      );
      if (!alreadyEnrolled) {
        state.enrollments.push({ user: userId, course: courseId });
      }
    },
    unenroll: (state, action: PayloadAction<{ userId: string; courseId: string }>) => {
      const { userId, courseId } = action.payload;
      state.enrollments = state.enrollments.filter(
        (enrollment) => !(enrollment.user === userId && enrollment.course === courseId)
      );
    },
    setEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
      state.enrollments = action.payload;
    },
  },
});

export const {
  toggleShowAllCourses,
  enroll,
  unenroll,
  setEnrollments,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
