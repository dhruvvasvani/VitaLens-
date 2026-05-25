#  VitaLens 

**VitaLens** isn't just another performance dashboard—it's an intelligent AI engineer that actively watches over your web application. 

Instead of just giving you a boring chart that says "your website is slow," VitaLens captures real-world Core Web Vitals directly from your users, deeply analyzes the patterns using Google Gemini, and literally writes the exact code snippet needed to fix the root cause. 

##  How it Works
1. **The Pulse (Next.js)**: A lightweight tracker sits on the frontend, quietly capturing performance metrics as real users navigate your site.
2. **The Brain (FastAPI & Gemini)**: The data flows into our backend, where Google Gemini 1.5 Flash steps in as your senior performance engineer. It doesn't just read the numbers; it looks for hidden correlations (e.g., "A slow database query is causing your visual layout to shift").
3. **The Cure (Actionable Insights)**: You don't get generic advice like "optimize images." You get exact, copy-pasteable code fixes specifically tailored to your framework to solve your biggest bottlenecks immediately.

##  Built With
- **Frontend**: Next.js 14 (App Router) & React for a beautiful, responsive dashboard.
- **Backend**: FastAPI & Python for lightning-fast API handling.
- **Database**: PostgreSQL on Supabase for persistent, reliable metric storage.
- **AI Agent**: Google Gemini 1.5 Flash (the absolute best at synthesizing code and context in real-time).

##  Getting Started (Local Development)

Want to run VitaLens on your own machine? It's surprisingly simple!

### 1. Spin up the Backend
```bash
# Move into the backend folder
cd backend

# Create and activate your virtual environment
python -m venv venv
venv\Scripts\activate  # (Use `source venv/bin/activate` if you're on Mac/Linux!)

# Install the Python dependencies
pip install -r requirements.txt
```
*(Don't forget to create a `.env` file inside the `backend` folder and add your `GEMINI_API_KEY`!)*

### 2. Launch the Frontend
```bash
# Open a new terminal and move to the frontend folder
cd frontend

# Install all the necessary packages
npm install

# Start the development server
npm run dev
```

That's it! Open `http://localhost:3000` in your browser and watch your new AI engineer go to work.
