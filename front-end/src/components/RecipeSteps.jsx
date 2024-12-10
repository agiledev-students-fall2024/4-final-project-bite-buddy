import React from "react";
import Timer from "./Timer.jsx";
import "./Timer.css";
function RecipeSteps({
  steps,
  completedSteps,
  onStepComplete,
  buttonRef,
  onComplete,
}) {
  return (
    <div className="steps-container">
      <h3>Steps:</h3>
      {steps?.map((step, index) => (
        <div
          key={index}
          className={`steps-card ${
            completedSteps.includes(index) ? "completed" : "default"
          }`}
        >
          <h4>Step {index + 1}</h4>
          <p>{step.type}</p>
          {step.duration > 0 && (
            <div className="timerScale">
              <Timer stepIndex={index} duration={step.duration} />
            </div>
          )}

          <br></br>
          <button
            className={`steps-button ${
              completedSteps.includes(index) ? "completed" : "default"
            }`}
            onClick={() => onStepComplete(index)}
          >
            {completedSteps.includes(index) ? "Completed" : "Mark as Completed"}
          </button>
        </div>
      ))}
      <button
        ref={buttonRef}
        className={`finish-activity-button ${
          completedSteps.length === steps.length ? "finished" : "default"
        }`}
        onClick={onComplete}
      >
        Finish Activity
      </button>
    </div>
  );
}

export default RecipeSteps;
