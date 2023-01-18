# TiguBot

Automated trading software for the Galactic Marketplace of Star Atlas (https://play.staratlas.com/).

<b>An API key is necessary to use this software.</b> Once an API key has been purchased, please Follow the instructions below to install and setup the bot.

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

By using any product listed on Tigubot.com, including the local bot service, you agree to all terms set forth in this disclaimer.

The information provided on this website (https://www.tigubot.com/) does not constitute investment advice, financial advice, trading advice, legal advice, or any other sort of advice and you should not treat any of the website's content as such. TiguBot does not recommend that any cryptocurrency should be bought, sold, or held by you. You should conduct your own due diligence and consult your financial advisor before making any investment decisions.  

THE LICENSED SOFTWARE IS PROVIDED "AS IS" AND. TIGUBOT DOES NOT WARRANT THAT THE SOFTWARE WILL FUNCTION UNINTERRUPTED, THAT IT IS ERROR-FREE, OR THAT ANY ERRORS WILL BE CORRECTED.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

---HELP AND SUPPORT--<br />
Write to info@tigubot.com, and we will help you.

NOTICE: <b>The private key must never be sent to anyone. TiguBot will never ask you for your private key. The code does not export your private key outside your PC. Your private key will only be required on the first launch. After the first launch you will only be asked for the password with which your private key was encrypted.</b>

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

how to create/edit configuration file: orders.json
1. Visit https://www.tigubot.com/ log in with the public address of your wallet and the apiKey that you previously purchased from the site.
2. Go to the "Bot Settings" menu


Through this page you can create your initial configuration and then copy it to the PC clipboard with the "Copy" link. Once copied you can paste it in the orders.json file (you will have to create this file inside the project folder the first time you use it).


In the future you will use this section to upload your configuration for editing via the upload link. By clicking on the upload link you will need to select your orders.json file. Once the changes have been made, the steps are the same as those described in point 1. Having already the orders.json file, you will only have to delete its contents and paste the data from the clipboard.

<b>---CONFIGURATION GRID---</b><br />
The grid lists all SA Galactic Marketplace NFTs. They are grouped by category, and for each nft there are two lines: the first to configure sales orders and the second to configure purchase orders.

Currency: you can change between USDC and ATLAS by clicking on the name of the currency. You can, for the same nft, have different currencies based on the type of order. In this way you can set up to buy in ATLAS and resell in USDC, obviously you will need to have the necessary currency in your wallet.

Order qty: is the quantity that will be used in placing the order. Keep in mind that the bot works with single orders: one for the sale and one for the purchase. If you enter 2 in the "BUY" section, the system will place a single order with quantity 2.

N.B.: to deactivate a market, simply set the order qty to zero on the type sell, buy or both

Inventory (sell): in the case of sell, it indicates the minimum amount of NFTs that you will want to keep in the wallet. Therefore, if you have 3 nfts in your wallet and you want to sell 2 of them in single orders of a quantity, you will have to enter "Order qty": 1 and "Inventory":1. The system will place the first sales order of 1 nft, if it sells it then it will place the second only if the quantity in the wallet is greater than the "Inventory" value.

Inventory (buy): in the case of a buy, it indicates the maximum amount of NFTs you will want to have in your wallet. "Order qty": 1 and "Inventory": 3 tells the bot that you want to buy up to a maximum of 3 NFTs (if you start with 0 amount of that NFT in your wallet)

N.B.: the system has often been tested with Order qty = 1. Higher values could create anomalies in case of partially filled orders. In the worst case it would not place the sell or buy order there

Limit price (sell): minimum selling price.
Limit price (buy): maximum purchase price.

N.B.: The logic of the bot is to occupy the first position of the list of sales or purchase orders. If it fails, due to the limited price, then it will try to occupy the following positions: 2, 3....

Step raise: indicates the percentage of decrease (sell) or increase (buy) expressed in values from 0 to 1, where 0.02 = 2%. Since we will be competing with other bots, using an appropriate percentage avoids canceling/placing the order too many times. Evaluate the optimal value according to the market.

KFPFM: Keep First Position For Minutes, if the system manages to occupy the first position and the gap with the 2nd exceeds the step raise the bot repositions itself on the 2nd position + step raise. This behavior creates an infinite loop with other bots. With this parameter you can decide the pause time, in minutes, with which to inhibit this behaviour. With KFPFM = 5 you tell the system, that if it manages to occupy the first position, to hold the order for 5 minutes. Once the time has expired, the system will evaluate whether to reposition it.

Minimum price: it is the entry price. If you want to enter the market immediately with a specific price, use this field. Example I want to sell an opod at 500 up to a limit price of 450, while the market at the moment the best order is 700. To avoid a series of discount orders I start immediately with the minimum price valued at 500.


The system will warn you if you enter the SELL / BUY sections incorrectly (zero sales price, or missing parameters), but it cannot check whether the parameters you entered can cause you losses: for example, if you set to sell an opod to $1 or if you set to sell it for $600 but your purchase price is $900. So first rule: check the parameters 3 times!.

Through a combobox you can select the Active orders: those active and formally valid, Valued: those valued but with missing/incorrect fields and the "Invalid" ones with incorrect values.



<b>Extra - Command syntax</b><br />
npm start {testMode = 0 or 1} {writeLogFile = 0 or 1}<br />
Example:<br />
npm start ---> operating mode (orders will be placed)<br />
npm start 1 ---> for test mode, no orders will be placed. Useful to see the actions the bot will do without executing them.<br />
npm start 1 1 ---> for test mode and save log file<br />
npm start 0 1 ---> operating mode (orders will be placed) and save log file<br />