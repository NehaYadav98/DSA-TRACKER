from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re
from typing import Dict, List

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_topics_from_file(file_path: str) -> Dict[str, Dict]:
    """
    Parse the formatted_output.txt file and extract topics with their problems.
    """
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        
        topics = {}
        current_topic = None
        current_topic_id = None
        
        # Split the content by lines
        lines = content.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].rstrip()
            
            # Skip empty lines
            if not line:
                i += 1
                continue
                
            # Check if this is a main topic line (starts with a number followed by a dot)
            if re.match(r'^\d+\.\s+\w+', line):
                current_topic_id = line.split('.')[0].strip()
                current_topic = line
                topics[current_topic_id] = {
                    "title": line,
                    "problems": []
                }
                i += 1
            
            # Check if this is a problem line - could be indented with spaces, tabs, or have numbering
            elif current_topic and (line.startswith('\t') or line.startswith('    ') or 
                                    (re.match(r'^\s*\d+\.', line) and i > 0 and lines[i-1].rstrip() == current_topic)):
                # It's a problem or a problem header
                if re.match(r'^\s*\d+\.\s+Problems:', line):
                    # This is just a header, skip it
                    i += 1
                    continue
                
                # Keep the original problem line
                problem = line.strip()
                if problem and not problem.endswith(':'):  # Ensure it's not a header and not empty
                    topics[current_topic_id]["problems"].append(problem)
                i += 1
            else:
                i += 1
        
        return topics
    
    except Exception as e:
        # Log the error for debugging
        print(f"Error parsing file: {str(e)}")
        return {}

# API endpoints
@app.get("/")
def read_root():
    return {"message": "Algorithm Topics API is running"}

@app.get("/topics")
def get_topics():
    try:
        # Load data from the text file
        topics = parse_topics_from_file("formatted_output.txt")
        if not topics:
            raise HTTPException(status_code=500, detail="Failed to parse topics from file")
        
        # Format the response to match the existing structure
        formatted_topics = {}
        for topic_id, topic_data in topics.items():
            formatted_topics[topic_data["title"]] = [re.sub(r'^\s*\d+\.', '', p).strip() for p in topic_data["problems"]]
            
        return formatted_topics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/topics/{topic_id}")
def get_topic(topic_id: str):
    topics = parse_topics_from_file("formatted_output.txt")
    if topic_id in topics:
        topic_data = topics[topic_id]
        return {"topic": topic_data["title"], "problems": [re.sub(r'^\s*\d+\.', '', p).strip() for p in topic_data["problems"]]}
    raise HTTPException(status_code=404, detail="Topic not found")

@app.get("/topics/{topic_id}/problems")
def get_problems_by_topic_id(topic_id: str):
    topics = parse_topics_from_file("formatted_output.txt")
    
    if topic_id in topics:
        topic_data = topics[topic_id]
        # Return problems with their original formatting (including numbering)
        return {"topic": topic_data["title"], "problems": topic_data["problems"]}
    
    raise HTTPException(status_code=404, detail="Topic not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)