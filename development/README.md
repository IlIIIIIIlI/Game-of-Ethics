## How to deploy project to aws

1. To create an EC2 instance:
Log in to the AWS console, select "Services" and click on "EC2".
Under "Instances", click on "Launch Instances".
Select the appropriate Amazon Machine Image (AMI), in this version we use Ubuntu Server.
Select t2.micro and click on "Next: Configure Instance Details".
On the next page, most settings can be left as default. Make sure your instance is configured correctly and click on 'Next: Add Storage'.
Configure the security group, opening at least SSH (port 22) and any other ports project requires (for example, Node.js usually uses port 3000).
Check the settings, make sure they are correct and click on "Review and Launch", then click on "Launch".
In the pop-up window, select an existing key pair or create a new key pair. If you have created a new key pair, download it and save it.

2. Connecting to an EC2 instance:
Once the EC2 instance is started, you can connect via SSH. (you will need your private key) and the public IPv4 address of your instance. Use the following command to connect:
ssh -i /path/to/your.pem ubuntu@your-ec2-ip-address for example, we use ssh -i /path/to/GE.pem ubuntu@3.26.223.153

3. Cloning your Node.js application:

  > - Use code su to get root accuss and  Gitclone to clone application to EC2 instance at:
  > gitclone git@github.com:COMP90082-2023-SM1/GE-Redback.git

4. Installation of application dependencies
In the backend and frontend folder, using npm i to install the dependencies

5. Launching applications
First in Backend using npm start to lanch the backend, when lanched, go to the other terminal to lanch frontend, using npm run serve.

6. Start the game
Using the public IPV4 to connect to the game and add the frontend port 8000 like 3.26.223.153:8000
