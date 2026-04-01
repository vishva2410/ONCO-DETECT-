# Alternative Deployment Guides (100% Free)

If Render is rejecting the builds due to its strict memory or lockfile limits, here are two alternative, 100% free ways to deploy OncoDetect.

---

## Alternative 1: Vercel (Frontend) + Koyeb (Backend)
**Why this?** Vercel is the absolute best, most frictionless platform for React/Vite frontends, and Koyeb provides a robust free tier for Docker/Python backends.

### Part A: Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Import the `vishva2410/ONCO-DETECT-` repository.
4. Expand the **"Root Directory"** setting and type `frontend`. This tells Vercel to only deploy the React code.
5. In **Build and Output Settings**, Vercel will automatically detect Vite.
6. Click **Deploy**. Vercel will instantly build the frontend and give you a fast, live URL (e.g., `https://oncodetect.vercel.app`).

### Part B: Deploy Backend on Koyeb
1. Go to [Koyeb.com](https://www.koyeb.com/) and sign up.
2. Click **Create Service** and link your GitHub account.
3. Select the `ONCO-DETECT-` repository.
4. Under **Run Command**, select "Builder: Buildpack", and set the **Work directory** to `backend`.
5. Set the **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port 8000`.
6. Add the **Environment Variable**: `GROQ_API_KEY = your_grok_key`.
7. Select the **EcoFree** instance type.
8. Click **Deploy**. Once live, Koyeb gives you an API link (e.g., `https://onco-api-koyeb.app`).
9. **Final Step:** Go back to Vercel, go to Settings -> Environment Variables, and add `VITE_API_URL` equal to your new Koyeb API link!

---

## Alternative 2: "The Manual Way" — AWS EC2 Free Tier
**Why this?** Amazon Web Services gives you a free Linux computer for a year. You have absolute control, no build limits, and no strict Render rules.

### Part A: Create the Free Server
1. Log in to your [AWS Console](https://aws.amazon.com/console/).
2. Search for **EC2** and click **Launch Instance**.
3. Name it "OncoDetect".
4. Select **Ubuntu** as the operating system.
5. Ensure the Instance Type is **t2.micro** (this says "Free tier eligible").
6. Create a new **Key Pair** (download the `.pem` file so you can log into the computer).
7. Under Network Settings, check the boxes to **Allow HTTP traffic** and **Allow HTTPS traffic** from the internet.
8. Click **Launch Instance**.

### Part B: Install the App on the Server
Once the instance is running, click "Connect" in the AWS console to open the terminal in your browser. Run these exact commands:

```bash
# 1. Update the computer and install Python and Node.js
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv git curl -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Download the code
git clone https://github.com/vishva2410/ONCO-DETECT-.git
cd ONCO-DETECT-

# 3. Start the Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# (Optional: Add your groq key to a .env file here)
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ..

# 4. Start the Frontend
cd frontend
npm install
nohup npm run dev -- --host 0.0.0.0 --port 5173 &
```

### Part C: Open the Ports
1. Go back to your AWS EC2 Dashboard.
2. Click your Instance, go to the **Security** tab, and click the Security Group link.
3. Click **Edit inbound rules**.
4. Add a rule: Type `Custom TCP`, Port `8000`, Source `0.0.0.0/0`.
5. Add a rule: Type `Custom TCP`, Port `5173`, Source `0.0.0.0/0`.
6. Save rules.

**You're Live!**
Copy the public **IPv4 address** of your EC2 instance from the AWS dashboard. 
Go to your browser and type `http://YOUR_AWS_IP:5173`. Your app is running globally on Amazon!
