import React, { useState, useEffect } from "react";
import * as client from "./client";
import { FormControl, ListGroup } from "react-bootstrap";
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { FaPencil } from "react-icons/fa6";
export default function WorkingWithArraysAsynchronously() {
    const [errorMessage, setErrorMessage] = useState(null);
    const [todos, setTodos] = useState<any[]>([]);
    const fetchTodos = async () => {
        const todos = await client.fetchTodos();
        setTodos(todos);
    };
    const removeTodo = async (todo: any) => {
        const updatedTodos = await client.removeTodo(todo);
        setTodos(updatedTodos);
    };
    const createTodo = async () => {
        const todos = await client.createTodo();
        setTodos(todos);
    };
    const postTodo = async () => {
        const newTodo = await client.postTodo({ title: "New Posted Todo", completed: false, });
        setTodos([...todos, newTodo]);
    };
    const deleteTodo = async (todo: any) => {
        try {
            await client.deleteTodo(todo);
            const newTodos = todos.filter((t) => t.id !== todo.id);
            setTodos(newTodos);
        } catch (error: any) {
            console.log(error);
            setErrorMessage(error.response.data.message);
        }

    };
    const editTodo = (todo: any) => {
        const updatedTodos = todos.map(
            (t) => t.id === todo.id ? { ...todo, editing: true } : t);
        setTodos(updatedTodos);
    };
    const updateTodo = async (todo: any) => {
        try {
            await client.updateTodo(todo);
            setTodos(todos.map((t) => (t.id === todo.id ? todo : t)));
        } catch (error: any) {
            setErrorMessage(error.response.data.message);
        }

    };


    useEffect(() => {
        fetchTodos();
    }, []);
    return (
        <div id="wd-asynchronous-arrays">
            <h3>Working with Arrays Asynchronously</h3>
            {errorMessage && (<div id="wd-todo-error-message" className="alert alert-danger mb-2 mt-2">{errorMessage}</div>)}
            <h4>Todos
                <FaPlusCircle onClick={createTodo} className="text-success float-end fs-3"
                    id="wd-create-todo" />
                <FaPlusCircle onClick={postTodo} className="text-primary float-end fs-3 me-3" id="wd-post-todo" /></h4>
            <ListGroup>
                {todos.map((todo) => (
                    <ListGroup.Item key={todo.id} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center w-100">
                            <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={todo.completed}
                                onChange={(e) =>
                                    updateTodo({ ...todo, completed: e.target.checked })
                                }
                            />

                            {!todo.editing ? (
                                <span
                                    style={{
                                        textDecoration: todo.completed ? "line-through" : "none",
                                        flexGrow: 1,
                                    }}
                                >
                                    {todo.title}
                                </span>
                            ) : (
                                <FormControl
                                    className="w-50"
                                    value={todo.title}
                                    onChange={(e) => {
                                        const updatedTodos = todos.map((t) =>
                                            t.id === todo.id ? { ...t, title: e.target.value } : t
                                        );
                                        setTodos(updatedTodos);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            updateTodo({ ...todo, editing: false });
                                        }
                                    }}
                                    onBlur={() => updateTodo({ ...todo, editing: false })}
                                />
                            )}
                        </div>

                        <div className="ms-2 d-flex align-items-center">
                            <FaPencil
                                onClick={() => editTodo(todo)}
                                className="text-primary me-2"
                            />
                            <TiDelete
                                onClick={() => deleteTodo(todo)}
                                className="text-danger fs-3 me-2"
                                id="wd-delete-todo"
                            />
                            <FaTrash
                                onClick={() => removeTodo(todo)}
                                className="text-danger mt-1"
                                id="wd-remove-todo"
                            />
                        </div>
                    </ListGroup.Item>

                ))}
            </ListGroup> <hr />
        </div>
    );
}

