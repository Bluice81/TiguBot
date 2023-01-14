# bot2023Client

Automated trading software for Galactic Marketplace of Star Atlas (https://play.staratlas.com/).

Only for the first launch

1. Visit https://www.tigubot.com/
2. use "Bot settings" to create the configuration.
3. copy the configuration to a new file called orders.json and save it in the same path as the "engine.ts" file
4. create a new "config.json" file with the contents of the config_template.json file and save it in the same path as the "engine.ts" file. 
5. values the "rpc" and "apiKey" fields in the newly created config.json file. Do not value the privateKey field.
6. open a new terminal window and go to the root of the program folder, where you will find the package.json file
7. from the prompt, run the command: npm install
8. from the prompt, run the command npm start
9. when prompted, enter your wallet private key.
10. when prompetd, enter 34 characters long secrek key to save your encrypted private key
11. when prompted, enter your secret key.

for the next launches
1. Visit https://www.tigubot.com/
2. use "Bot settings" to create the configuration.
3. upload your configurations, next copy the configuration and replace the content of your file called orders.json and save it
4. open a new terminal window and go to the root of the program folder, where you will find the package.json file
5. from the prompt, run the command npm start
6. when prompted, enter your secret key.

Command syntax<br />
npm start {testMode = 0 or 1} {writeLogFile = 0 or 1}<br />
Example:<br />
npm start ---> operating mode (orders will be placed)<br />
npm start 1 ---> for test mode, no orders will be placed. Useful to see the actions the bot will do without executing them.<br />
npm start 1 1 ---> for test mode and save log file<br />
npm start 0 1 ---> operating mode (orders will be placed) and save log file<br />