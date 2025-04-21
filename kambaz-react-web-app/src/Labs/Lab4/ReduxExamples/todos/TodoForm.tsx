import { useSelector, useDispatch } from "react-redux";
import { addTodo, updateTodo, setTodo } from "./todosReducer";
import { ListGroup } from "react-bootstrap";
import { FormControl } from "react-bootstrap";
import { Button } from "react-bootstrap";

export default function TodoForm(
) {
    const { todo } = useSelector((state: any) => state.todosReducer);
    const dispatch = useDispatch();
    return (
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <FormControl
                value={todo.title}
                onChange={(e) => dispatch(setTodo({ ...todo, title: e.target.value }))}
                className="me-2 w-75" />
            <Button onClick={() => dispatch(updateTodo(todo))}
                id="wd-update-todo-click" className="btn btn-warning"> Update </Button>
            <Button onClick={() => dispatch(addTodo(todo))}
                id="wd-add-todo-click" className="btn btn-success me-2"> Add </Button>
        </ListGroup.Item>
    );
}
