import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import * as db from "../Database";

export interface Course {
    _id: string;
    name: string;
    number: string;
    startDate: string;
    endDate: string;
    description: string;
    department: string;
    credits: number;
    author?: string;
}

interface CourseState {
    courses: Course[];
    course: Course;
}

const initialState: CourseState = {
    courses: db.courses as Course[],
    course: {
        _id: "1234",
        name: "New Course",
        number: "New Number",
        startDate: "2023-09-10",
        endDate: "2023-12-15",
        description: "New Description",
        department: "Computer Science",
        credits: 3,
        author: ""
    }
};

const courseSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        setCourses: (state, action: PayloadAction<Course[]>) => {
            state.courses = action.payload;
        },
        setCourse: (state, action: PayloadAction<Course>) => {
            state.course = action.payload;
        },
        addCourse: (state) => {
            state.courses.push({ ...state.course, _id: uuidv4() });
        },
        deleteCourse: (state, action: PayloadAction<string>) => {
            state.courses = state.courses.filter((course) => course._id !== action.payload);
        },
        updateCourse: (state) => {
            state.courses = state.courses.map((c) => {
                if (c._id === state.course._id) {
                    return state.course;
                } else {
                    return c;
                }
            });
        }
    }
});

export const { setCourses, setCourse, addCourse, deleteCourse, updateCourse } = courseSlice.actions;
export default courseSlice.reducer;