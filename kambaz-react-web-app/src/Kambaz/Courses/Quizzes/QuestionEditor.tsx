// import React from "react";
// import { Button, Form, Card, Row, Col } from "react-bootstrap";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import { FaArrowRight } from "react-icons/fa";
// import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";


// export default function QuestionEditor({
//   question,
//   onChange,
//   onCancel,
//   onSave,
// }: any) {
//   const handleInputChange = (field: string, value: any) => {
//     onChange({ ...question, [field]: value });
//   };

//   return (
//     <Card className="p-4 mb-4">
//       <div className="d-flex align-items-center justify-content-between mb-3">
//         <div className="d-flex align-items-center">
//           {/* Title */}
//           <Form.Control
//             type="text"
//             placeholder="Question Title"
//             value={question.title}
//             onChange={(e) => handleInputChange("title", e.target.value)}
//             style={{ width: 300 }}
//           />
//           {/* Type */}
//           <Form.Select
//             value={question.type || "True/False"}
//             onChange={(e) => handleInputChange("type", e.target.value)}
//             style={{ width: 400, marginLeft: "16px" }}
//           >
//             <option>True/False</option>
//             <option>Multiple Choice</option>
//             <option>Fill in the Blank</option>
//           </Form.Select>
//         </div>
//         {/* 右边：Points */}
//         <div className="d-flex align-items-center">
//           <span className="me-2">pts:</span>
//           <Form.Control
//             type="number"
//             value={question.points}
//             onChange={(e) =>
//               handleInputChange("points", parseInt(e.target.value))
//             }
//             style={{ width: "80px" }}
//             min={0}
//           />
//         </div>
//       </div>

//       <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
//         Enter your question text, then select if True or False is the correct
//         answer.
//       </div>

//       {/* Question Content Editor */}
//       <Form.Group className="mb-4">
//         <Form.Label className="fw-bold">Question:</Form.Label>
//         <TinyMCEEditor
//           tinymceScriptSrc="/tinymce/tinymce.min.js"
//           value={question.text}
//           onEditorChange={(content) => handleInputChange("text", content)}
//           init={{
//             height: 200,
//             menubar: "edit view insert format tools table",
//             plugins: "table",
//             toolbar:
//               "fontsizeselect formatselect | bold italic underline | forecolor backcolor | superscript subscript | removeformat",
//             fontsize_formats: "12pt",
//             content_style:
//               "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
//             branding: false,
//             statusbar: false,
//             setup: (editor) => {
//               editor.on("init", () => {
//                 editor.execCommand("FontSize", false, "12pt");
//               });
//             },
//           }}
//         />
//       </Form.Group>

//       {/* Answer Choice */}
//       <Form.Group className="mb-4">
//         <Form.Label className="fw-bold">Answers:</Form.Label>
//         <div className="d-flex flex-column">
//           <div
//             role="button"
//             className="d-flex align-items-center mb-2"
//             onClick={() => handleInputChange("correctAnswer", true)}
//             style={{ cursor: "pointer" }}
//           >
//             {question.correctAnswer === true && (
//               <FaArrowRight className="text-success me-2" />
//             )}
//             <span
//               className={
//                 question.correctAnswer === true ? "text-success fw-bold" : ""
//               }
//             >
//               True
//             </span>
//           </div>
//           <div
//             role="button"
//             className="d-flex align-items-center"
//             onClick={() => handleInputChange("correctAnswer", false)}
//             style={{ cursor: "pointer" }}
//           >
//             {question.correctAnswer === false && (
//               <FaArrowRight className="text-success me-2" />
//             )}
//             <span
//               className={
//                 question.correctAnswer === false ? "text-success fw-bold" : ""
//               }
//             >
//               False
//             </span>
//           </div>
//         </div>
//       </Form.Group>

//       {/* 按钮区域 */}
//       <div className="d-flex gap-2">
//         <Button variant="secondary" onClick={onCancel}>
//           Cancel
//         </Button>
//         <Button variant="danger" onClick={onSave}>
//           Update Question
//         </Button>
//       </div>
//     </Card>
//   );
// }


import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { FaArrowRight, FaPencilAlt, FaPlus, FaTrashAlt } from "react-icons/fa";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";


export default function QuestionEditor({ question, onChange, onCancel, onSave }: any) {
  const handleInputChange = (field: string, value: any) => {
    onChange({ ...question, [field]: value });
  };

  // render different question types
  function renderAnswerEditor() {
    switch (question.type) {
      case "True/False":
        return renderTrueFalseEditor();
      case "Multiple Choice":
        return renderMultipleChoiceEditor();
      case "Fill in the Blank":
        return renderFillBlankEditor();
      default:
        return null;
    }
  }

  // True/False Editor
  function renderTrueFalseEditor() {
    return (
      <Card className="p-4 mb-4">
        {/* Top Row: Title / Type / Points */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Question Title"
              value={question.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              style={{ width: 300 }}
            />
            <Form.Select
              value={question.type || "True/False"}
              onChange={(e) => handleInputChange("type", e.target.value)}
              style={{ width: 400, marginLeft: "16px" }}
            >
              <option>True/False</option>
              <option>Multiple Choice</option>
              <option>Fill in the Blank</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">pts:</span>
            <Form.Control
              type="number"
              value={question.points}
              onChange={(e) =>
                handleInputChange("points", parseInt(e.target.value))
              }
              style={{ width: "80px" }}
              min={0}
            />
          </div>
        </div>

        {/* Description */}
        <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
          Enter your question text, then select if True or False is the correct answer.
        </div>

        {/* Editor */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold mb-2">Question:</Form.Label>
          <TinyMCEEditor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={question.text}
            onEditorChange={(content:any) => handleInputChange("text", content)}
            init={{
              height: 200,
              menubar: "edit view insert format tools table",
              plugins: "table",
              toolbar:
                "fontsizeselect formatselect | bold italic underline | forecolor backcolor | superscript subscript | removeformat",
              fontsize_formats: "12pt",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              branding: false,
              statusbar: false,
              setup: (editor:any) => {
                editor.on("init", () => {
                  editor.execCommand("FontSize", false, "12pt");
                });
              },
            }}
          />
        </Form.Group>

        {/* Answers */}
        <Form.Group className="mb-4 mt-4">
          <Form.Label className="fw-bold">Answers:</Form.Label>
          <div className="d-flex flex-column">
            {["True", "False"].map((option) => (
              <div
                key={option}
                role="button"
                className="d-flex align-items-center mb-2"
                onClick={() => handleInputChange("correctAnswer", option === "True")}
                style={{ cursor: "pointer" }}
              >
                {question.correctAnswer === (option === "True") && (
                  <FaArrowRight className="text-success me-2" />
                )}
                <span
                  className={
                    question.correctAnswer === (option === "True")
                      ? "text-success fw-bold"
                      : ""
                  }
                >
                  {option}
                </span>
              </div>
            ))}
          </div>
        </Form.Group>

        {/* Buttons */}
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSave(question)}>
            Update Question
          </Button>
        </div>
      </Card>
    );
  }

  // MultipleChoices Editor  
  function renderMultipleChoiceEditor() {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleOptionChange = (index: number, value: string) => {
      const updatedOptions = [...(question.choices || [])];
      updatedOptions[index] = value;
      handleInputChange("choices", updatedOptions);
    };

    const addOption = () => {
      const updatedOptions = [...(question.choices || []), ""];
      handleInputChange("choices", updatedOptions);
      // Set the new option to editing mode
      setEditingIndex(updatedOptions.length - 1);
    };

    const removeOption = (index: number) => {
      // Simply remove the option without additional index adjustments
      const updatedOptions = [...(question.choices || [])];
      updatedOptions.splice(index, 1);
      handleInputChange("choices", updatedOptions);
      setEditingIndex(null);
    };

    const setCorrectAnswer = (index: number) => {
      // Only allow setting correct answer in edit mode
      if (editingIndex === index) {
        handleInputChange("correctAnswer", question.choices?.[index]);
      }
    };
    
    const toggleEditMode = (index: number) => {
      setEditingIndex(editingIndex === index ? null : index);
    };

    // Add click outside handler to exit edit mode
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // Exit edit mode when clicking outside
        if (editingIndex !== null) {
          // Check if the click target is part of any answer row
          const target = event.target as HTMLElement;
          const isClickInsideAnswerRow = target.closest('.answer-row') !== null;
          
          if (!isClickInsideAnswerRow) {
            setEditingIndex(null);
          }
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [editingIndex]);

    return (
      <Card className="p-4 mb-4">
        {/* Header: Title / Type / Points */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Question Title"
              value={question.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              style={{ width: 300 }}
            />
            <Form.Select
              value={question.type || "Multiple Choice"}
              onChange={(e) => handleInputChange("type", e.target.value)}
              style={{ width: 400, marginLeft: "16px" }}
            >
              <option>True/False</option>
              <option>Multiple Choice</option>
              <option>Fill in the Blank</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">pts:</span>
            <Form.Control
              type="number"
              value={question.points}
              onChange={(e) =>
                handleInputChange("points", parseInt(e.target.value))
              }
              style={{ width: "80px" }}
              min={0}
            />
          </div>
        </div>

        {/* Description */}
        <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
          Enter your question and multiple answers, then select the one correct answer.
        </div>

        {/* Question Text */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Question:</Form.Label>
          <TinyMCEEditor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={question.text}
            onEditorChange={(content:any) => handleInputChange("text", content)}
            init={{
              height: 200,
              menubar: "edit view insert format tools table",
              plugins: "table",
              toolbar:
                "fontsizeselect formatselect | bold italic underline | forecolor backcolor | superscript subscript | removeformat",
              fontsize_formats: "12pt",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              branding: false,
              statusbar: false,
              setup: (editor:any) => {
                editor.on("init", () => {
                  editor.execCommand("FontSize", false, "12pt");
                });
              },
            }}
          />
        </Form.Group>

        {/* Answer Options */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Answers:</Form.Label>
          {(question.choices || []).map((option: string, index: number) => (
            <div 
              key={index} 
              className={`d-flex align-items-center mb-3 answer-row ${editingIndex === index ? 'border border-primary rounded p-2' : ''}`}
              // Remove the click handler from the entire row
            >
              {/* Left icon area */}
              <div style={{ width: '30px' }}>
                {question.correctAnswer === option && (
                  <FaArrowRight 
                    className="text-success" 
                    style={{ fontSize: '18px' }}
                  />
                )}
              </div>
              
              {/* Label text - click to enter edit mode or set correct answer */}
              <div 
                style={{ 
                  width: '130px',
                  fontWeight: question.correctAnswer === option ? 'bold' : 'normal',
                  color: question.correctAnswer === option ? '#4CAF50' : 'inherit',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingIndex === index) {
                    // If already in edit mode, set as correct answer
                    setCorrectAnswer(index);
                  } else {
                    // Enter edit mode
                    toggleEditMode(index);
                  }
                }}
              >
                {question.correctAnswer === option ? "Correct Answer" : "Possible Answer"}
              </div>
              
              {/* Input field - shorter width and click to enter edit mode */}
              <Form.Control
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className={question.correctAnswer === option ? "border-success" : ""}
                readOnly={editingIndex !== index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingIndex !== index) {
                    toggleEditMode(index);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setEditingIndex(null);
                  }
                }}
                style={{ maxWidth: '300px' }} // Make text field shorter
              />
              
              {/* Edit and delete buttons - only visible in edit mode */}
              <div className="ms-2">
                {editingIndex === index && (
                  <>
                    <Button
                      variant="link"
                      className="text-secondary p-0 mx-1"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Focus on the input field
                        const inputElement = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                        if (inputElement) inputElement.focus();
                      }}
                    >
                      <FaPencilAlt />
                    </Button>
                    <Button
                      variant="link"
                      className="text-secondary p-0 mx-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(index);
                      }}
                      title="Delete" 
                    >
                      <FaTrashAlt />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {/* Add Answer button */}
          <div className="d-flex justify-content-end">
            <Button 
              variant="link" 
              className="text-decoration-none text-danger" 
              onClick={addOption}
            >
              <FaPlus className="me-1" /> Add Another Answer
            </Button>
          </div>
        </Form.Group>

        {/* Buttons */}
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSave(question)}>
            Update Question
          </Button>
        </div>
      </Card>
    );
  }

  // Fill in the Blank Editor
  function renderFillBlankEditor() {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
    const answers = question.choices || [];
  
    const handleAnswerChange = (index: number, value: string) => {
      const updated = [...answers];
      updated[index] = value;
      handleInputChange("choices", updated);
    };
  
    const addAnswer = () => {
      const updated = [...answers, ""];
      handleInputChange("choices", updated);
      setEditingIndex(updated.length - 1); // fix: set to last added index
    };
  
    const removeAnswer = (index: number) => {
      const updated = [...answers];
      updated.splice(index, 1);
      handleInputChange("choices", updated);
      setEditingIndex(null);
    };
  
    const toggleEditMode = (index: number) => {
      setEditingIndex(editingIndex === index ? null : index);
    };
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (editingIndex !== null) {
          const target = event.target as HTMLElement;
          const isClickInside = target.closest(".answer-row") !== null;
          if (!isClickInside) setEditingIndex(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [editingIndex]);
  
    return (
      <Card className="p-4 mb-4">
        {/* Header: Title / Type / Points */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Question Title"
              value={question.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              style={{ width: 300 }}
            />
            <Form.Select
              value={question.type || "Fill in the Blank"}
              onChange={(e) => handleInputChange("type", e.target.value)}
              style={{ width: 400, marginLeft: "16px" }}
            >
              <option>True/False</option>
              <option>Multiple Choice</option>
              <option>Fill in the Blank</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">pts:</span>
            <Form.Control
              type="number"
              value={question.points ?? 0}
              onChange={(e) => handleInputChange("points", parseInt(e.target.value))}
              style={{ width: "80px" }}
              min={0}
            />
          </div>
        </div>
  
        {/* Description */}
        <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
          Enter your question text, then define all possible correct answers for the blank.< br></br>
          Students will see the question followed by a small text box to type their answer.
        </div>
  
        {/* Question Editor */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Question:</Form.Label>
          <TinyMCEEditor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={question.text}
            onEditorChange={(content:any) => handleInputChange("text", content)}
            init={{
              height: 150,
              menubar: false,
              toolbar: "bold italic underline | bullist numlist",
              branding: false,
              statusbar: false,
            }}
          />
        </Form.Group>
  
        {/* Answer List */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Answers:</Form.Label>
          {answers.map((answer: string, index: number) => (
            <div
              key={index}
              className={`d-flex align-items-center mb-2 answer-row ${editingIndex === index ? "border border-primary rounded p-2" : ""}`}
            >
              {/* Label */}
              <div
                style={{ width: "150px", cursor: "pointer" }}
                onClick={() => toggleEditMode(index)}
              >
                Possible Answer:
              </div>
  
              {/* Input field */}
              <Form.Control
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                readOnly={editingIndex !== index}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditMode(index);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setEditingIndex(null);
                  }
                }}
                style={{ maxWidth: "300px" }}
              />
  
              {/* Delete button (only in edit mode) */}
              <div className="ms-2">
                {editingIndex === index && (
                  <Button
                    variant="link"
                    className="text-secondary p-0 mx-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnswer(index);
                    }}
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </Button>
                )}
              </div>
            </div>
          ))}
  
          {/* Add Answer button */}
          <div className="d-flex justify-content-end">
            <Button
              variant="link"
              className="text-decoration-none text-danger"
              onClick={addAnswer}
            >
              <FaPlus className="me-1" /> Add Another Answer
            </Button>
          </div>
  
          {/* <div className="text-muted mt-1" style={{ fontSize: "13px" }}>
            Matching will be case-insensitive. Multiple correct answers allowed.
          </div> */}
        </Form.Group>
  
        {/* Footer buttons */}
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onSave(question)}>
            Update Question
          </Button>
        </div>
      </Card>
    );
  }  

  return <>{renderAnswerEditor()}</>;
}
