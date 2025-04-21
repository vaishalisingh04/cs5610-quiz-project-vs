// src/Kambaz/store.ts
import { configureStore } from "@reduxjs/toolkit";
import modulesReducer from "./Courses/Modules/reducer";
import accountReducer from "./Account/reducer";
import assignmentsReducer from "./Courses/Assignments/reducer";
import courseReducer from "./Courses/reducer";
import enrollmentReducer from "./Enrollments/reducer";
import quizzesReducer from "./Courses/Quizzes/reducer";

const store = configureStore({
  reducer: {
    modulesReducer,
    accountReducer,
    assignmentsReducer,
    courseReducer,
    enrollmentReducer,
    quizzesReducer
  },
});


export type RootState = ReturnType<typeof store.getState>;

export default store;