import { useState, useEffect } from "react";
import { setModules, addModule, editModule, updateModule, deleteModule }
  from "./reducer";
import { useSelector, useDispatch } from "react-redux";
import ModulesControls from "./ModulesControls";
import { BsGripVertical } from "react-icons/bs";
import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import { useParams } from "react-router";
import { FormControl } from "react-bootstrap";
import * as coursesClient from "../client";
import * as modulesClient from "./client";

export default function Modules() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { cid } = useParams();
  const [moduleName, setModuleName] = useState("");
  const { modules } = useSelector((state: any) => state.modulesReducer);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const saveModule = async (module: any) => {
    setError(null);
    try {
      console.log("Saving module:", module);
      await modulesClient.updateModule(module);
      dispatch(updateModule(module));
    } catch (err) {
      const error = err as Error;
      console.error("Error saving module:", error);
      setError(error.message);
    }
  };

  const removeModule = async (moduleId: string) => {
    setError(null);
    try {
      console.log("Removing module:", moduleId);
      await modulesClient.deleteModule(moduleId);
      dispatch(deleteModule(moduleId));
    } catch (err) {
      const error = err as Error;
      console.error("Error removing module:", error);
      setError(error.message);
    }
  };

  const createModuleForCourse = async () => {
    if (!cid) return;
    setError(null);
    try {
      console.log("Creating module for course:", cid, moduleName);
      const newModule = { name: moduleName, course: cid };
      const module = await coursesClient.createModuleForCourse(cid, newModule);
      dispatch(addModule(module));
    } catch (err) {
      const error = err as Error;
      console.error("Error creating module:", error);
      setError(error.message);
    }
  };

  const fetchModules = async () => {
    if (!cid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching modules for course:", cid);
      const modules = await coursesClient.findModulesForCourse(cid as string);
      dispatch(setModules(modules));
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching modules:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchModules();
  }, [cid]);

  return (
    <div className="d-flex flex-column">
      {currentUser?.role === "FACULTY" && (
        <div className="mb-4">
          <ModulesControls setModuleName={setModuleName} moduleName={moduleName}
            addModule={createModuleForCourse} />
        </div>
      )}
      {loading ? (
        <div className="text-center p-4">Loading modules...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <ul id="wd-modules" className="list-group rounded-0">
          {modules.length === 0 ? (
            <li className="list-group-item text-center p-3">
              No modules available for this course.
            </li>
          ) : (
            modules.map((module: any) => (
              <li key={module._id} className="wd-module list-group-item p-0 mb-3 fs-5 border-gray">
                <div className="wd-title p-3 ps-2 bg-secondary">
                  <BsGripVertical className="me-2 fs-3" />
                  {!module.editing && module.name}
                  {module.editing && (
                    <FormControl className="w-50 d-inline-block"
                      onChange={(e) => dispatch(updateModule({ ...module, name: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveModule({ ...module, editing: false });
                        }
                      }}
                      defaultValue={module.name} />
                  )}
                  {currentUser?.role === "FACULTY" && (
                    <ModuleControlButtons
                      moduleId={module._id}
                      deleteModule={(moduleId) => removeModule(moduleId)}
                      editModule={(moduleId) => dispatch(editModule(moduleId))} />
                  )}
                </div>
                {module.lessons && module.lessons.length > 0 && (
                  <ul className="wd-lessons list-group rounded-0">
                    {module.lessons.map((lesson: any) => (
                      <li key={lesson._id} className="wd-lesson list-group-item p-3 ps-1">
                        <BsGripVertical className="me-2 fs-3" /> 
                        {lesson.name} 
                        <LessonControlButtons />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}