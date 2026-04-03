# Email Notification System Plan

This document outlines the plan to implement email-based notifications for the UniVerse backend.

## User Review Required

> [!WARNING]
> Please review this plan, particularly the specific events I have proposed for email notifications. Let me know if you would like me to add emails for other events (such as community posts or chats). Also, you will need to provide an SMTP email address and app password in your `.env` file for this to work (I recommend a Gmail account).

## Proposed Changes

### 1. Environment Variables
#### [MODIFY] [backend/.env](file:///d:/Hackathon/hacksagon/UniVerse/backend/.env)
- Add standard SMTP configuration variables:
  - `SMTP_USER` (e.g. your testing Gmail address)
  - `SMTP_PASSWORD` (App Password)
  - `SMTP_SERVER` (e.g. smtp.gmail.com)
  - `SMTP_PORT` (e.g. 587)

### 2. Email Service Module
#### [NEW] [backend/services/email_service.py](file:///d:/Hackathon/hacksagon/UniVerse/backend/services/email_service.py)
- Create a synchronous or lightweight asynchronous function `send_email_notification(to_email, subject, body)` using standard Python `smtplib` and `email.mime`. 
- Incorporate safety checks to silently skip if SMTP configs are missing (useful for local dev without credentials).

### 3. Project Routing Actions (Triggers)
#### [MODIFY] [backend/routers/projects.py](file:///d:/Hackathon/hacksagon/UniVerse/backend/routers/projects.py)
Integrate FastAPI's native `BackgroundTasks` so that emails are sent in the background and don't slow down the API response. I propose adding emails for the following events:

1. **New Join Request:**
   - **Trigger:** `POST /{project_id}/join` when a new request is lodged.
   - **Recipient:** The project's creator/admin. 
   - **Content:** "User XYZ has requested to join your project [Project Name]."

2. **Join Request Accepted:**
   - **Trigger:** `POST /{project_id}/requests/{user_id}/accept`
   - **Recipient:** The user who made the request.
   - **Content:** "Congratulations! Your request to join [Project Name] was accepted."

3. **Join Request Rejected:**
   - **Trigger:** `POST /{project_id}/requests/{user_id}/reject`
   - **Recipient:** The user who made the request.
   - **Content:** "Your request to join [Project Name] was declined."

## Open Questions

> [!IMPORTANT]
> 1. Are you okay with using Python's built-in `smtplib` (SMTP with Gmail App Passwords)? 
> 2. Do you want to receive emails for any other events, such as when a new Comment is added to a project, or when a Chat message is sent?
> 3. Does the list of proposed triggers look appropriate to you?

## Verification Plan

### Manual Verification
1. I will add dummy SMTP configurations testing whether errors are correctly caught.
2. If you provide a test SMTP account via `.env`, we can test an actual email loop by using the frontend to request joining a project. 
