# TiguBot (v. 2.2 19/01/2023)

Automated trading software for the Galactic Marketplace of Star Atlas (https://play.staratlas.com/market).

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

THE LICENSED SOFTWARE IS PROVIDED "AS IS" AND TIGUBOT AND ANY AFFILIATED SOFTWARE WITH TIGUBOT.COM, DOES NOT WARRANT THAT THE SOFTWARE WILL FUNCTION UNINTERRUPTED, THAT IT IS ERROR-FREE, OR THAT ANY ERRORS WILL BE CORRECTED.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

---HELP AND SUPPORT--<br />
Write to info@tigubot.com for any assistance and inquiries.

NOTICE: <b>Your wallet private key should never be sent to anyone. TiguBot will never ask you for your private key except during the first local install. The code does not export your private key outside of the local installation. After the first launch your private key will be encrypted and TiguBot will only ask for the password with which your private key was encrypted. It is your responsbility to monitor the github respository for any changes that may potentially affect your private key.</b>

Instructions for the first launch of TiguBot:

1. Download and install Node JS from https://nodejs.org/en/download/.
2. Navigate to https://github.com/Bluice81/TiguBot and download a copy of the code via your preferred methodology. (ZIP is probably easiest if you do not have experience with git.)
3. Unzip the code to a local directory on the machine you are planning to run the bot from.
4. Visit https://www.tigubot.com/ and purchase an API key from the home page.
5. Follow all instructions listed during the purchase of the API key.
6. Once the API key has been received, visit https://www.tigubot.com/ and login using your API key and the pubkey of the wallet you intend to use for the bot.
7. Navigate to "Bot settings" to create a configuration json file for the bot. See "CONFIGURATION GRID BELOW" for instructions on specific settings.
8. Copy the configuration using the COPY link, and paste into a new file called "orders.json".
9. Save the "orders.json" file in the same installation directory as in step 3, inside the /src directory. (Same location as the "engine.ts" file.)
10. Create a copy of of the "config_template.json" file and save the file as "config.json" file in the /src directory. (Same location as step 9 above.)
11. Update the values in the settings "rpc" and "apiKey" fields in the newly created config.json file.
12. Open a new terminal/command window and navigate to the root of the program folder which was unzipped in step 3 above.
13. From the command prompt, run the command: npm install
14. From the command prompt, run the command: npm start
15. When prompted, enter your full wallet private key, this should be an 88 character key as exported from Phantom. 
16. When prompted, enter a <b>32</b> character password which will encrypt your private key. This will be the password you enter to start the program going forward. If you lose this password, you can restore the fields in the "config.json" file to the same values as the "config_template.json" to start again from step 15.
17. To start the bot, see the command syntax listed below.

Instructions for all subsequent launches and edits to the orders.json file:

1. Visit https://www.tigubot.com/ and use the bot settings to create/update your "orders.json" file.
2. Your prior "orders.json" file can be uploaded to the bot settings where edits can be made.
3. Once your updates to the bot configuration are completed, use the "copy" link to paste into the "orders.json" file which was created earlier.
4. Open a new terminal window and navigate to the root of the bot program folder, as installed in earlier in step 3.
5. From the command prompt, run the command: npm start
6. When prompted, enter your password.

How to create/edit configuration file: orders.json:

1. Visit https://www.tigubot.com/ and log in with the public address of your wallet and the apiKey that you previously purchased from the site.
2. Go to the "Bot Settings" menu:

Through this page you can create your initial configuration and then copy it to the PC clipboard with the "Copy" link. Once copied you can paste it into the orders.json file (You will have to create this file inside the project folder the first time you use it.)

In the future you will use this section to upload your configuration for editing via the upload link. By clicking on the upload link you will need to select your orders.json file. Once the changes have been made, the steps are the same as those described in part one and two. If you have already created an orders.json file, you will only need to delete its contents and paste the data from the clipboard into the file.

<b>---CONFIGURATION GRID---</b><br />
The grid lists all SA Galactic Marketplace assets. They are grouped by category and for each asset there are two lines: 1) The first to configure sales orders and 2) The second to configure purchase orders.

Currency: you can change between USDC and ATLAS by clicking on the name of the currency. You can, for the same asset, have different currencies based on the type of order. In this way you can configure to buy in ATLAS and resell in USDC. You will need the respective currencies in your wallet to place orders.

Order qty: This is the order quantity that will be used in placing the order. Please keep in mind that the bot works with single orders: one for the sale and one for the purchase. If you enter 2 in the "BUY" section, the system will place a single buy order with a quantity of 2.

Important: To deactivate a market, simply set the order qty to 0 on the order type which you wish to deactivate, sell, buy, or both.

Inventory (Sell): In the case of sell orders, this field indicates the minimum amount of asetss that you will want to keep in the wallet. For example, if you have 3 assets in your wallet and you want to sell 2 of those in single orders, you will have to enter "Order qty": 1 and "Inventory": 1. The system will place the first sales order of 1 asset, and if that asset is sold, the bot will place a second sell order. In this situation, the bot would not sell the third asset because the minimum inventory is 1. An order is only sold if the quantity in the wallet is greater than the "Inventory" value.

Inventory (Buy): In the case of buy orders, this field indicates the maximum amount of assets of this type in your wallet. "Order qty": 1 and "Inventory": 3 will tell the bot to buy up to a maximum of 3 assets in this category, assuming you started with 0 assets in your wallet.

Limit price (Sell): Minimum selling price. This indicates the lowest price for which the asset will sell. The bot will take the current lowest price and bid until it reaches the first position. If it cannot claim the first position, it will either fall back to the second position if set, or the next lowest sell order.

Limit price (Buy): This is the maximum purchase price an asset will be purchased at. It will followed the same bidding procedure as noted above in the Sell section.

Important: The bot will try to occupy the first position of the list of sales or purchase orders. If it fails, due to the limited price, then it will try to occupy the following positions: 2, 3....

Step raise: Indicates the percentage of decrease (sell) or increase (buy) expressed in values from 0 to 1, where 0.02 = 2%. Since we will be competing with other bids, using an appropriate percentage avoids canceling/placing the order too many times. 1% (0.01) is a good starting point but the optimal value may vary according to the market.

KFPFM: Keep First Position For Minutes - If the system manages to occupy the first position and the gap with the 2nd exceeds the step raise the bot will reposition itself on the 2nd position + step raise. This behavior can creates an infinite loop with other bids if those other bids are continously cancelled. With this parameter you can decide the pause time, in minutes, with which to hold the top position. With KFPFM = 5, if the bot manages to occupy the first position, it will hold the top position for 5 minutes. Once the time has expired, the system will evaluate whether to reposition it. Users can also take advantage of this system by creating fake bids to increase your buy/sell price. In these situations, it is best to have the KFPFM set at a low value.

Minimum price: This is the entry price for the market. If you want to enter the market immediately with a specific price, use this field. For example, if you want to sell an opod at 500 up to a limit price of 450, while the current market's best order is 700. To avoid bidding down from 700, this field will start your bid at 500.

2nd position: This field will set the price where the bot cannot obtain the top bid but wants to hold a lower position. For example, if there is an Opod for sell at 450 and 650, and your minimum sell price is 500, the bot will occupy a sell price of 649 because it cannot beat the price of 450. If you set a second position price of 501, then the bot will bid 501. The final Opod market would have orders of 450, 501, and 650.

The system will warn you if you enter any parameters incorrectly (zero sales price, or missing parameters), but it cannot and will not determine whether the parameters that have been entered can cause any losses, For example, if you set the sell price of an opod to $1 or if you set to sell price for $600 but your original purchase price was $900. Triple check your parameters every time!

The orders can be filtered through the combobox: 1) Active orders: those active and with valid settings, 2) Valued: those markets with values but with some missing/incorrect fields and 3) Invalid: Markets with incorrect values.



<b>Bot Start Up - Command syntax</b><br />
At the command prompt, enter the following commands:
npm start {testMode = 0 or 1} {writeLogFile = 0 or 1}<br />
Example:<br />
npm start ---> operating mode (orders will be placed).<br />
npm start 1 ---> for test mode, no orders will be placed. This mode is useful to see the actions the bot will take through the logs without executing them.<br />
npm start 1 1 ---> for test mode and saving a log file.<br />
npm start 0 1 ---> operating mode (orders will be placed) and logs will be saved to the log file.<br />