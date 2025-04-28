import React, { useState, useEffect, useRef } from 'react';
import './TopicCard.css';

function TopicCard({ topicId, topicName, problems, formattedProblems, isExpanded, onToggle, onCheckboxToggle }) {
  const [checkedProblems, setCheckedProblems] = useState({});
  const hasMounted = useRef(false);

  // Count of completed problems
  const completedCount = Object.values(checkedProblems).filter(Boolean).length;

  // Load checked state from localStorage on component mount
  useEffect(() => {
    const savedCheckedProblems = localStorage.getItem(`checkedProblems-${topicId}`);
    if (savedCheckedProblems) {
      setCheckedProblems(JSON.parse(savedCheckedProblems));
    }
  }, [topicId]);

  // Save checked state to localStorage and notify parent
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    localStorage.setItem(`checkedProblems-${topicId}`, JSON.stringify(checkedProblems));
    if (onCheckboxToggle) {
      onCheckboxToggle();
    }
  }, [checkedProblems]);

  const handleCheckboxChange = (problemIndex, event) => {
    event.stopPropagation();
    setCheckedProblems(prevState => ({
      ...prevState,
      [problemIndex]: !prevState[problemIndex]
    }));
  };

  return (
    <div className={`topic-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="topic-header" onClick={onToggle}>
        <h2>{topicName}</h2>
        <div className="problem-count">
          {completedCount} / {problems.length}
        </div>
        <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {isExpanded && (
        <div className="problems-container">
          <ul className="problems-list">
            {(formattedProblems.length > 0 ? formattedProblems : problems).map((problem, index) => (
              <li key={index} className={`problem-item ${checkedProblems[index] ? 'completed' : ''}`}>
                <label className="problem-checkbox">
                  <input 
                    type="checkbox" 
                    checked={!!checkedProblems[index]}
                    onChange={(e) => handleCheckboxChange(index, e)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="problem-text">{problem}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TopicCard;
