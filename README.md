# SafeNet IDS - Machine Learning Powered Intrusion Detection System

## Overview

SafeNet IDS is a Machine Learning-based Intrusion Detection System designed to detect malicious network activities and cyber threats. The system analyzes network traffic data using the Random Forest algorithm and classifies traffic as normal or malicious. It provides security alerts, threat analysis, and an interactive dashboard to help improve network security.

---

## Features

- Real-time intrusion detection
- Network traffic monitoring and analysis
- Attack classification using Machine Learning
- Random Forest-based prediction model
- Security alert generation
- User-friendly dashboard
- Threat visualization and reporting
- High detection accuracy using benchmark datasets

---

## Problem Statement

Traditional security systems often struggle to identify evolving cyber threats. SafeNet IDS addresses this challenge by leveraging Machine Learning techniques to detect suspicious activities and potential attacks in network traffic, enabling faster and more accurate threat detection.

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- Express.js
- REST APIs

### Machine Learning
- Python
- Scikit-learn
- Random Forest
- Pandas
- NumPy

### Data Visualization
- Matplotlib
- Seaborn

### Tools & Platforms
- Git
- GitHub
- VS Code

### Datasets
- NSL-KDD Dataset
- CICIDS2017 Dataset

---

## System Architecture

```text
Network Traffic
       │
       ▼
Data Collection
       │
       ▼
Feature Extraction
       │
       ▼
Random Forest Model
       │
       ▼
Threat Detection
       │
       ▼
Security Alerts
       │
       ▼
Dashboard & Reports
```

---

## Project Structure

```text
Intrusion-detection-system/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── server.js
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── App.tsx
│
├── screenshots/
├── docs/
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/NITYA123715/Intrusion-detection-system.git
```

### Frontend Setup

```bash
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

---

## Machine Learning Workflow

1. Collect network traffic dataset.
2. Perform data preprocessing.
3. Extract important features.
4. Train Random Forest classifier.
5. Evaluate model performance.
6. Deploy model for intrusion detection.
7. Generate alerts for suspicious activities.

---

## Dataset Information

### NSL-KDD
A benchmark dataset widely used for intrusion detection research and evaluation.

### CICIDS2017
A modern cybersecurity dataset containing both normal and attack traffic scenarios.

---

## Future Enhancements

- Real-time packet capturing using Scapy
- Deep Learning-based attack detection
- Threat intelligence integration
- Live monitoring dashboard
- Cloud deployment
- Multi-user authentication system
- Email and SMS security alerts

---

## Screenshots

Add project screenshots in the `screenshots` folder.

Example:

- Dashboard View
- Intrusion Detection Results
- Threat Analytics Page
- Alert Monitoring Screen

---

## Performance

- High detection accuracy using Random Forest
- Efficient classification of network traffic
- Reduced false positive rate
- Fast prediction and alert generation

---

## Learning Outcomes

Through this project, the following concepts were implemented:

- Machine Learning for Cybersecurity
- Intrusion Detection Systems
- Data Preprocessing
- Random Forest Classification
- Full Stack Development
- REST API Development
- Data Visualization

---

## Author

**Nitya Tiwari**

B.Tech (Artificial Intelligence)

GitHub: https://github.com/NITYA123715

LinkedIn: https://www.linkedin.com/in/nitya-tiwari-ai

---

## License

This project is developed for educational, research, and recruitment evaluation purposes.

MIT License
