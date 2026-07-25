## 🌐 OIBSIP — Oasis Infobyte Student Internship Program

### **Track: Web Development & Designing**

![GitHub repo size](https://img.shields.io/badge/Repository%20Size-Active-brightgreen?style=for-the-badge)  
![Track](https://img.shields.io/badge/Track-Web%20Development%20%26%20Designing-blue?style=for-the-badge&logo=html5)  
![Status](https://img.shields.io/badge/Internship%20Status-In%20Progress-orange?style=for-the-badge)  
![Organization](https://img.shields.io/badge/Organization-Oasis%20Infobyte-0077B5?style=for-the-badge)

## 📌 About This Repository

This repository contains all task submissions and project source code developed during the **Oasis Infobyte Student Internship Program (OIBSIP)** in the **Web Development & Designing** domain track.

The repository strictly follows the official folder naming conventions mandated by Oasis Infobyte:

```plaintext
OIBSIP/[TrackName]-[Level/Task]-[ProjectName]/
```

## 🎯 Completed Task Summary

In accordance with the **Domain Track Matrix (Section 2)** of the official SIP Task List, interns in the Web Development track are required to complete **ALL tasks within one chosen Level (Level 1, Level 2, or Level 3)**.

I have completed **Level 3 (Advanced Full-Stack Development)**, which consists of a comprehensive, production-grade MERN stack application.

| Track | Level | Task Name | Folder Name | Tech Stack | Status |
| --- | --- | --- | --- | --- | --- |
| **Web Dev** | Level 3 | Task 1: Pizza Delivery Full-Stack Platform | [`WebDev-L3-PizzaApp`](./WebDev-L3-PizzaApp/) | React.js, Node.js, Express.js, MongoDB, Razorpay, Tailwind | ✅ Completed |

## 💎 Why This Submission Stands Out (Engineering Differentiators)

Unlike typical student CRUD applications, this Level 3 project was engineered to meet **production-grade software architecture standards**:

1.  **🏛️ Clean Layered Architecture:** Enforces strict modular separation across Routes, Controllers, Services, Middlewares, and Data Models.
2.  **⚡ Atomic MongoDB Transactions:** Guarantees zero race conditions or partial stock deductions by executing multi-ingredient inventory decrements inside atomic database transactions.
3.  **🔒 Cryptographic Signature Verification:** Implements zero-trust server-side SHA-256 HMAC signature verification for Razorpay payments before confirming orders or modifying inventory.
4.  **🧠 Smart Low-Stock Cron Notifications:** Utilizes `node-cron` and `nodemailer` with automated timestamp cooldown tracking (`lastAlertSentAt`) to prevent email alert spamming.
5.  **🛡️ Enterprise Dual-Token Auth:** Secures user sessions using short-lived 15-minute Access Tokens paired with 7-day HTTP-Only, Secure Refresh Cookies to eliminate XSS token theft.

👉 [**Read the deep-dive architectural explanation in the main project README here!**](./WebDev-L3-PizzaApp/README.md#--where-this-project-stands-out-engineering--architectural-differentiators)

## 🚀 Featured Project: Pizza Delivery Full-Stack Application

### 📁 Project Folder: [`./WebDev-L3-PizzaApp`](./WebDev-L3-PizzaApp/)

A complete, production-grade full-stack pizza ordering and inventory management platform built with:

*   **Frontend:** React.js (Vite), React Router, Context/Zustand State, Axios
*   **Backend:** Node.js, Express.js, REST APIs, JWT Auth (Access + Refresh tokens)
*   **Database:** MongoDB with Mongoose ODM (Atomic Transactions & Aggregations)
*   **Payments:** Razorpay Gateway Integration (Test Mode with Cryptographic HMAC Signature Verification)
*   **Automated Jobs & Alerts:** `node-cron` scheduled jobs & `nodemailer` SMTP automated low-stock email alerts to administrators.

👉 [**Click here to view the full project documentation, setup guide, and screenshots!**](./WebDev-L3-PizzaApp/README.md)

## 🗂️ Assets & Visual Evidence

All project evidence, screenshots, and official internship certificates are organized cleanly inside the dedicated assets folder:

*   **Screenshots Gallery:** [`./WebDev-L3-PizzaApp/assets/screenshots/`](./WebDev-L3-PizzaApp/assets/screenshots/)
*   **Official Certificates & Letters:** [`./WebDev-L3-PizzaApp/assets/certificates/`](./WebDev-L3-PizzaApp/assets/certificates/)

## 🛠️ Quick Start & Setup Overview

To run the completed Level 3 project locally:

1.  **Clone the repository:**
2.  **Follow detailed installation instructions:** Refer to the step-by-step instructions in [`WebDev-L3-PizzaApp/README.md`](./WebDev-L3-PizzaApp/README.md) to set up environment variables (`.env`), run the database seeder (`node src/seeder.js`), and launch both backend (`npm run dev` on port 5000) and frontend (`npm run dev` on port 5173).

## 🔗 Connect & Peer Evaluation

*   **LinkedIn Post & Demo Video:** Watch the complete screen-recorded walkthrough of this project on LinkedIn with hashtag `#oasisinfobyte`.
*   **Peer Evaluation:** As part of Step 6 of the onboarding checklist, peer feedback and code reviews from fellow cohort interns are highly welcome!

_Repository maintained for **Oasis Infobyte SIP (OIBSIP)** evaluation._

```plaintext
git clone https://github.com/siddesh0002T/OIBSIP.git
cd OIBSIP/WebDev-L3-PizzaApp
```