import React, { useState, useEffect } from 'react';
import './App.css';
import TopicCard from './components/TopicCard';

function App() {
  const [topicsData, setTopicsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [overallProgress, setOverallProgress] = useState({ completed: 0, total: 0 });

  // Function to recalculate progress across all topics
  const recalculateProgress = () => {
    let completedCount = 0;
    topicsData.forEach(topic => {
      const savedChecked = localStorage.getItem(`checkedProblems-${topic.id}`);
      if (savedChecked) {
        const checked = JSON.parse(savedChecked);
        completedCount += Object.values(checked).filter(Boolean).length;
      }
    });
    setOverallProgress(prev => ({ ...prev, completed: completedCount }));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // First fetch the list of all topics
        const topicsResponse = await fetch('http://localhost:8000/topics');
        if (!topicsResponse.ok) {
          throw new Error('Failed to fetch topics');
        }
        const topicsData = await topicsResponse.json();
        
        // Convert topics object to array with ID extracted from the key
        const topicsArray = Object.entries(topicsData).map(([topicName, problems]) => {
          const topicId = topicName.split('.')[0].trim();
          return { id: topicId, name: topicName, problems: problems };
        });
        
        // Now fetch detailed problems for each topic
        const topicsWithProblems = await Promise.all(
          topicsArray.map(async (topic) => {
            try {
              const problemsResponse = await fetch(`http://localhost:8000/topics/${topic.id}/problems`);
              if (problemsResponse.ok) {
                const data = await problemsResponse.json();
                return {
                  ...topic,
                  formattedProblems: data.problems
                };
              }
              return topic;
            } catch (err) {
              console.error(`Error fetching problems for topic ${topic.id}:`, err);
              return topic;
            }
          })
        );
        
        setTopicsData(topicsWithProblems);
        
        // Calculate total problems
        const totalProblems = topicsWithProblems.reduce((acc, topic) => acc + topic.problems.length, 0);
        setOverallProgress(prev => ({ ...prev, total: totalProblems }));
        
        // Calculate completed problems from localStorage
        let completedCount = 0;
        topicsWithProblems.forEach(topic => {
          const savedChecked = localStorage.getItem(`checkedProblems-${topic.id}`);
          if (savedChecked) {
            const checked = JSON.parse(savedChecked);
            completedCount += Object.values(checked).filter(Boolean).length;
          }
        });
        setOverallProgress(prev => ({ ...prev, completed: completedCount }));
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllData();
    
    // Add event listener for storage changes (for multi-tab support)
    window.addEventListener('storage', recalculateProgress);
    return () => window.removeEventListener('storage', recalculateProgress);
  }, []);

  const handleTopicExpand = (topicId) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  // Function to update progress when a checkbox is toggled
  const handleCheckboxToggle = () => {
    // Re-calculate progress when any checkbox is toggled
    recalculateProgress();
  };

  if (loading) {
    return <div className="loading">Loading topics and problems...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <header>
        <h1>Algorithm Topics</h1>
        <p>A collection of common algorithm problems organized by patterns</p>
        <div className="overall-progress">
          <div className="progress-text">Overall Progress: {overallProgress.completed} / {overallProgress.total}</div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${overallProgress.total > 0 ? (overallProgress.completed / overallProgress.total) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </header>
      <div className="topics-grid">
        {topicsData.map((topic) => (
          <TopicCard 
            key={topic.id}
            topicId={topic.id}
            topicName={topic.name}
            problems={topic.problems}
            formattedProblems={topic.formattedProblems || []}
            isExpanded={expandedTopicId === topic.id}
            onToggle={() => handleTopicExpand(topic.id)}
            onCheckboxToggle={handleCheckboxToggle}
          />
        ))}
      </div>
    </div>
  );
}

export default App;