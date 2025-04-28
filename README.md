# 📘 DSA Pattern Practice Tracker

This project is a full-stack application designed to help you track progress on common DSA (Data Structures and Algorithms) problems, organized by pattern. Built using **React** (frontend) and **FastAPI** (backend), it also supports persistent local storage and real-time progress tracking across multiple tabs.

---

## 🚀 Features

- ✅ Interactive checklist for each DSA problem
- 📦 Organized by problem-solving patterns (e.g. Sliding Window, DP, Graphs)
- 💾 Local storage support to persist progress across sessions
- 🔄 Real-time overall progress bar
- 📊 Expandable/collapsible cards for each topic
- 🌐 Fully Dockerized for easy setup

---

## To Run Docker

```bash
    docker compose up --build
    #or
    docker compose up -d
    # To stop (keeps the network and containers)
    docker compose stop
    # Removes network and containers
    docker compose down
