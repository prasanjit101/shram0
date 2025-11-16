# Shram0 - Voice-first To-do List Web App

# **Product Requirements Document**

## **1. Overview**

A voice-first to-do list web app that uses a user's voice commands to process CRUD operations on tasks.

## **2. Goal**

Make a voice-first to-do list web-app that uses a user’s voice commands to process CRUD operations.

## **3. User Stories**

* As a user, I want to say “Show me all administrative tasks” and see exactly those tasks.
* As a user, I want to say “I want to work on X” or “Make me a task to do Y” and create tasks with appropriate titles.
* As a user, I want to say “Delete the task about the compliances” and delete that task.
* Bonus:

  * As a user, I want tasks to have a title, scheduled time, and priority index.
  * As a user, I want to say “Push the task about fixing bugs to tomorrow” and update its scheduled time.
  * As a user, I want to say “Delete the 4th task” and delete the task by index.

## **4. Functional Requirements**

### **4.1 Voice Command Input**

* Support natural language voice commands.
* Process commands for CRUD:

  * Create tasks
  * Read tasks
  * Update tasks
  * Delete tasks

### **4.2 Voice-to-Text**

* Use any voice model (Apple STT, Deepgram, etc).

### **4.3 Natural Language Processing**

* Use any LLM of choice.
* Interpret user intent from spoken commands.
* Must support:

  * Task creation
  * Task listing
  * Task updating
  * Task deletion
  * Optional: time updates and priority index

### **4.4 Task Model**

* Required field: title
* Optional fields:

  * scheduled time
  * priority index

### **4.5 Performance**

* Sub-2s latency.
* 90%+ accuracy.

### **4.6 Deployment**

* Deploy on Vercel or any preferred hosting so the app can be tested easily.

## **5. Non-functional Requirements**

### **5.1 Code Quality**

* Clean, modular code.
* Python or JavaScript.
* Include comments.

### **5.2 Performance**

* Must process voice commands consistently.
* 90%+ accuracy in natural language understanding.
* Under 2 seconds.

## **6. Data Model**

* Task:
  * title
  * scheduled time
  * priority index
  * created_at
  * updated_at

## **7. UX / UI Requirements**

* Minimal, without any styling, color.
* View that displays filtered tasks when user says “Show me all administrative tasks”.

## **8. Voice Interaction Flows**
* Show tasks via spoken request.
* Create tasks via spoken request.
* Delete tasks via spoken request.
* Update tasks via spoken request.

## **9. Bonus Features**

* Scheduled time support.
* Priority index support.
* Deleting tasks by index.

## **10. Constraints**

* Must meet submission requirements or user will be disqualified.

## **11. Deliverables**
* Deployed working app.
* GitHub repository link.
* Note in repo explaining choice of voice model and LLM.

## TECH STACK

- `pnpm` for package management
- `Next.js` for the web framework
- Turso Sqlite for the database
- Qroq whisper model for voice-to-text
- Shadcn + Tailwind css for UI components
- groq models for natural language processing
- Authentication : skipped for the MVP. All users will share the same to-do list
- Deployment : Vercel



NOTE:
1. To push db schema changes to Turso, use `pnpm db:sync`
