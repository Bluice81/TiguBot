# TiguBot

Automated trading software for Galactic Marketplace of Star Atlas (https://play.staratlas.com/).

<b>To use the software it is necessary to buy an apiKey.</b> Follow the instructions below.

---DISCLAIMER---<br />
Tigubot.com and its affilliates, creators, sponsors, or anyone associated with this program are not responsible for any losses and/or missed gains that may incur from any use of this program, whether directly or indirectly.  

A misconfigured bot can cause losses, missed gains, incorrect purchases, etc. It is highly recommended that you carefully check, and recheck, that all settings have been entered correctly, before loading the configuration settings to your local sytstem.

Trading carries a high level of risk, and losses and/or missed gains can/will occur even if the bot has been configured correctly. For example, but not limited to, sudden shifts in the market may occur which causes the cost of assets to increase or decrease beyond your respective settings and or previously purchased/sold assets. Tigubot.com and its affilliates are not responsible for any of these losses and/or missed gains which may occur from any of your trading activities.

It is your responsbility as a user to do your own research and analyze the market to determine the best entry/exit points. Tigubot.com is simply a tool which assists a user in making trades. It does not in any shape/form/manner provide any guidance on how/when/why to trade. All of those decisions rest with the user.

The bot should be monitored at all timers by the user to ensure that it is operating within the user's expected guidelines.

The user should review the github repository to ensure they are satisfied with the client code being placed on their local system and also ensure that they review anny additional github commits before downloading those changes to their local system.

All assets are held locally by the users wallet. Tigubot.com does not take any responsbility for any compromises of those wallets and stresses that the user should take all precautions related to wallet security as necessary and recommended in this age of cryptocurrency.

Tigubot.com operates on the Star Atlas Galaxy Marketplace. All trades that have been placed can be seen and accceseed through play.staratlas.com/marketplace. This also means that if the bot has been deactivated or disconnected through any means, the user may need to manually cancel any bids that have been placed.

Any/all users of Tigubot.com must follow the Star Atlas terms of service located here https://staratlas.com/terms-of-service. Specifically, all users should be acutely aware of Section 3.4(e) which explicilty forbids users from "engag[ing] in manipulative activity that violates the integrity of the prices of assets on the Marketplace...". A good rule of thumb is that any order which is placed on the Galaxy Marketplace should be a bonefide purchase/sell order, e.g. there is actual intent to buy/sell the asset tied with that purchase/sell order. Any violation of any terms of the Star Atlas terms of service will result in immediate suspension and termination of any API keys with no refund. All violations will also be reported to Star Atlas. 

Using any products of Tigubot.com, you agree to all terms set forth in this disclaimer.

The information provided on this website (https://www.tigubot.com/) does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the website's content as such. TiguBot does not recommend that any cryptocurrency should be bought, sold, or held by you. Do conduct your own due diligence and consult your financial advisor before making any investment decisions.  

THE LICENSED SOFTWARE IS PROVIDED "AS IS" AND. TIGUBOT DOES NOT WARRANT THAT THE SOFTWARE WILL FUNCTION UNINTERRUPTED, THAT IT IS ERROR-FREE, OR THAT ANY ERRORS WILL BE CORRECTED.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

---HELP AND SUPPORT--<br />
Write to info@tigubot.com, and we will help you.

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
10. when prompetd, enter 34 characters long password to save your encrypted private key. (If you lose this password, you can always repeat the initial procedure and choose a new one.)

for the next launches
1. Visit https://www.tigubot.com/
2. use "Bot settings" to create the configuration.
3. upload your configurations, next copy the configuration and replace the content of your file called orders.json and save it
4. open a new terminal window and go to the root of the program folder, where you will find the package.json file
5. from the prompt, run the command npm start
6. when prompted, enter your password.

Command syntax<br />
npm start {testMode = 0 or 1} {writeLogFile = 0 or 1}<br />
Example:<br />
npm start ---> operating mode (orders will be placed)<br />
npm start 1 ---> for test mode, no orders will be placed. Useful to see the actions the bot will do without executing them.<br />
npm start 1 1 ---> for test mode and save log file<br />
npm start 0 1 ---> operating mode (orders will be placed) and save log file<br />