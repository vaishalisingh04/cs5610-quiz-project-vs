import { useState } from "react";
export default function ArrayStateVariable() {
    const [array, setArray] = useState([1, 2, 3, 4, 5]);
    const addElement = () => {
        setArray([...array, Math.floor(Math.random() * 100)]);
    };
    const deleteElement = (index: number) => {
        setArray(array.filter((_, i) => i !== index));
    };
    return (
        <div id="wd-array-state-variables" >
            <h2>Array State Variable</h2>
            <button onClick={addElement} className="btn btn-success">Add Element</button>
            <ul className="list-group p-2">
                {array.map((item, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center border">
                        <h2 className="mb-0">{item}</h2>
                        <button onClick={() => deleteElement(index)} className="btn btn-danger">
                            Delete</button>
                    </li>))}
            </ul><hr /></div>);
}