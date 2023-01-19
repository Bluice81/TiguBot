import { Connection, PublicKey, VersionedTransaction, TransactionMessage, Keypair } from '@solana/web3.js';
import { GmEventService, GmClientService, GmEventType, Order } from '@staratlas/factory';
import { encrypt, decrypt } from './crypto';
import readline from 'readline';
import fetch from "isomorphic-fetch";
import base58 = require('bs58');
import ordersJson from "./orders.json";
import config from "./config.json";

let version = '2.1 19/01/2023';

let wallet: Keypair;

let connection = new Connection(config.rpc, "confirmed");
let programId = new PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg");

let gmClientService = new GmClientService();
let numConsoleMessage = 0;

let isTest = true;
let writeLogFile = false;
let logPathWindows = `${__dirname}\\log\\${new Date().toISOString().replaceAll(":", "_")}.log`;
let logPathMac = `${__dirname}/log/${new Date().toISOString().replaceAll(":", "_")}.log`;
let logPath =  process.platform == "win32" ? logPathWindows : logPathMac;

let nfts: any[] = [];

let USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
let ATLAS = 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx';

let orderJsonActive: any[];

let counter = 0;

function myLog(
  data: String,
  important: boolean = false
) {
  numConsoleMessage++;

  if (numConsoleMessage == 500) {
    console.clear();
  }

  let message = `${new Date().toLocaleString()}, ${(important ? '>>>>>>' : '')} ${data} ${(important ? '<<<<<<' : '')}`;
  console.log(message);

  if (writeLogFile) {
    try {
      var fs = require('fs');
      fs.writeFile(logPath, message + "\n", { flag: "a+" }, function (err: any) {
      });
    } catch (e) {
    }
  }
}

const initWallet = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if (config.privateKey.iv == "" || config.privateKey.content == "") {
    rl.question('What is your private key?\n', function (privateKey) {
      rl.question('Enter a password (32 characters long) to encrypt your private key (If you lose this password, you can always repeat the initial procedure and choose a new one.):\n ', function (secretKey) {
        var hash = encrypt(privateKey, secretKey);

        config.privateKey.iv = hash.iv;
        config.privateKey.content = hash.content;

        var fs = require('fs');
        fs.writeFile('./src/config.json', JSON.stringify(config), function (err: any) {
          if (err) {
            myLog(err);
          }
        });
        rl.close();

      });
    });

  } else {
    rl.question('What is your password (32 characters)?\n ', function (secretKey) {
      wallet = Keypair.fromSecretKey(base58.decode(decrypt(config.privateKey, secretKey)));

      rl.close();

      init();
    });
  }

}

async function init() {
  var param = process.argv.slice(2);

  isTest = param.length < 1 || process.argv.slice(2)[0] == "1";
  writeLogFile = param.length > 1 && process.argv.slice(3)[0] == "1";

  nfts = await getNfts();

  orderJsonActive = ordersJson.filter(function (el: any) {
    return el.buyOrderQty > 0 || el.sellOrderQty > 0;
  });

  var index = 0;
  var errorDescription = '';
  var activeOrders = 0;

  for (var x = 0; x < orderJsonActive.length; x++) {
    var nft = nfts.filter(function (el) {
      return el.name.toLowerCase() == orderJsonActive[x].name.toLowerCase();
    });

    if (nft.length == 1) {
      orderJsonActive[x].itemMint = nft[0].mint;
    } else {
      orderJsonActive[x].sellOrderQty = 0;
      orderJsonActive[x].buyOrderQty = 0;

      errorDescription += `Market nr.${x} - NFT name not found!\n`;

      break;
    }
    if (orderJsonActive[x].currencySell !== "ATLAS" && orderJsonActive[x].currencySell !== "USDC") {
      orderJsonActive[x].sellOrderQty = 0;

      errorDescription += `Market nr.${x} - Wrong sell currency, possible values: ATLAS or USDC\n`;

      break;
    }

    if (orderJsonActive[x].currencyBuy !== "ATLAS" && orderJsonActive[x].currencyBuy !== "USDC") {
      orderJsonActive[x].buyOrderQty = 0;

      errorDescription += `Market nr.${x} - Wrong buy currency, possible values: ATLAS or USDC\n`;

      break;
    }

    if (orderJsonActive[x].sellOrderQty > 0 && orderJsonActive[x].minimumSellPrice == 0) {
      orderJsonActive[x].sellOrderQty = 0;
      orderJsonActive[x].buyOrderQty = 0;

      errorDescription += `Market nr.${x} - Wrong minimumSellPrice, value must be greater than zero\n`;

      break;
    }

    orderJsonActive[x].index = index;
    orderJsonActive[x].checkSellMarket = 0;
    orderJsonActive[x].checkBuyMarket = 0;
    orderJsonActive[x].counter = 0;
    orderJsonActive[x].counterLocal = 0;
    orderJsonActive[x].tmpNewPriceSell = 0;
    orderJsonActive[x].tmpNewPriceBuy = 0;

    orderJsonActive[x].pendingNewOrderCounterSell = [];
    orderJsonActive[x].pendingNewOrderCounterBuy = [];
    orderJsonActive[x].openOrdersSell = [];
    orderJsonActive[x].openOrdersBuy = [];

    orderJsonActive[x].lastActivitySell = new Date().getTime();
    orderJsonActive[x].lastActivityBuy = new Date().getTime();

    orderJsonActive[x].stateSell = 0;
    orderJsonActive[x].stateBuy = 0;
    orderJsonActive[x].openOrdersSyncSell = false;
    orderJsonActive[x].openOrdersSyncBuy = false;

    //get token account of NFT
    try {
      var ris = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: new PublicKey(orderJsonActive[x].itemMint),
      });

      orderJsonActive[x].tokenAccount = ris.value[0].pubkey.toString();
    } catch (e) {
      orderJsonActive[x].tokenAccount = "";
    }

    if (orderJsonActive[x].currencySell == "ATLAS") {
      orderJsonActive[x].currencySell = ATLAS;
    }

    if (orderJsonActive[x].currencySell == "USDC") {
      orderJsonActive[x].currencySell = USDC;
    }

    if (orderJsonActive[x].currencyBuy == "ATLAS") {
      orderJsonActive[x].currencyBuy = ATLAS;
    }

    if (orderJsonActive[x].currencyBuy == "USDC") {
      orderJsonActive[x].currencyBuy = USDC;
    }

    activeOrders += orderJsonActive[x].sellOrderQty > 0 ? 1 : 0;
    activeOrders += orderJsonActive[x].buyOrderQty > 0 ? 1 : 0;

    index++;
  }

  if (errorDescription !== '') {
    myLog(errorDescription);
  }

  //get valid orders
  orderJsonActive = ordersJson.filter(function (el: any) {
    return el.sellOrderQty > 0 || el.buyOrderQty > 0;
  });

  myLog(`System start ${version} - ${process.platform} testMode: ${isTest} writeLogFile: ${writeLogFile} - active markets: ${orderJsonActive.length} - active orders: ${activeOrders} `);

  botEvent();

  await start();
}

async function getNfts() {
  const response = await fetch("https://galaxy.staratlas.com/nfts", {
    method: 'GET'
  });

  return response.json();
}

function start() {
  for (var x = 0; x < orderJsonActive.length; x++) {
    processOrder(x, "sell");
    processOrder(x, "buy");
  }

  setInterval(function () {
    checkActiveMarkets();
  }, 1000 * 60);
}

async function processOrder(x: number, orderType: string) {
  var order: any = orderJsonActive[x];

  if ((orderType == "sell" && order.sellOrderQty <= 0) ||
    (orderType == "buy" && order.buyOrderQty <= 0)) {
    return
  }

  try {
    if (orderType == "sell") {
      if (order.stateSell == 1) {
        return;
      }

      order.stateSell = 1; //running
    } else {
      if (order.stateBuy == 1) {
        return;
      }

      order.stateBuy = 1; //running
    }

    order.counterLocal = counter;
    counter++;

    myLog(`[${order.index}][${order.counterLocal} - xxx] - ${orderType} Checking order ${order.name} `);

    //Call api web services
    //order.orderType = orderType;

    var result: any;
    try {
      result = await callBackendApi({ method: "getActions", wallet: wallet.publicKey.toString(), apiKey: config.apiKey, order: order, orderType: orderType });
      order.lastError = undefined;
    } catch {
      if (!order.lastError) {
        order.lastError = new Date().getTime();
      }

      var lastErrorServerContact = Math.round((new Date().getTime() - order.lastError) / 60000);
      myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType}: last error server contact: ${lastErrorServerContact} minutes ago`);

      if (lastErrorServerContact < 5) {
        nextJob(x, orderType);

        return;
      } else {
        order.lastError = undefined;

        myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType}: contact with server lost, remove all open orders`);

        order.actions = [];
        order.actions.push({
          orderType: orderType,
          method: "cancelOrder",
          newPrice: 0,
          reason: "server lost"
        });

        await processActionsResult(order, orderType, -1);

        nextJob(x, orderType);

        return;
      }
    }

    switch (result.code) {
      case 200:
        var serverOrder = JSON.parse(result.data);

        //server response security checks
        var checkOrderType = serverOrder.orderType == orderType;
        var checkItemMint = serverOrder.itemMint == order.itemMint;
        var checkCurrency = (orderType == "sell" ? serverOrder.currencySell : serverOrder.currencyBuy) == (orderType == "sell" ? order.currencySell : order.currencyBuy);

        var checkSellPriceFilter = serverOrder.actions.filter(function (el: any) {
          return el.orderType == "sell" && el.method == "PlaceOrder" && el.newPrice > order.minimumSellPrice && el.newPrice > 0;
        });

        var checkBuyPriceFilter = serverOrder.actions.filter(function (el: any) {
          return el.orderType == "buy" && el.method == "PlaceOrder" && el.newPrice < order.maximumBuyPrice && el.newPrice > 0;
        });

        var checkSellPrice = checkSellPriceFilter.length == 0;
        var checkBuyPrice = checkBuyPriceFilter == 0;

        if (!checkOrderType || !checkItemMint || !checkCurrency || !checkSellPrice || !checkBuyPrice) {
          myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Service Error: wrong data. checkOrderType: ${checkOrderType} checkItemMint: ${checkItemMint} checkCurrency: ${checkCurrency} checkSellPrice: ${checkSellPrice} checkBuyPrice: ${checkBuyPrice}`);
          console.log(serverOrder.orderType + ";" + ";" + orderType);
          console.log(serverOrder);
          break;
        }

        var orderNew = await processActionsResult(serverOrder, orderType, x);

        if (orderType == "sell") {
          if (orderNew.actions.length > 0) {
            order.checkSellMarketCounter = 8;
          }

          if (!order.openOrdersSyncSell) {
            for (var j = 0; j < orderNew.openOrdersSell.length; j++) {
              updateOrderTx(order, "sell", "add", "sync", orderNew.openOrdersSell[j]);
            }
          }

          order.openOrdersSyncSell = orderNew.openOrdersSyncSell;
        } else {
          if (orderNew.actions.length > 0) {
            order.checkBuyMarketCounter = 8;
          }

          if (!order.openOrdersSyncBuy) {
            for (var j = 0; j < orderNew.openOrdersBuy.length; j++) {
              updateOrderTx(order, "buy", "add", "sync", orderNew.openOrdersBuy[j]);
            }
          }

          order.openOrdersSyncBuy = orderNew.openOrdersSyncBuy;
        }

        nextJob(x, orderType);

        break;
      default:
        myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Service Error: ${result.code} ${result.data} `);
        break;
    }
  } catch (e) {
    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} ${e} `);
  }
}

async function nextJob(x: number, orderType: string) {
  var order: any = orderJsonActive[x];

  if (orderType == "sell") {
    order.stateSell = 0; //idle
    order.checkSellMarket = new Date().getTime();

    if (order.checkSellMarketCounter > 0) {
      myLog(`Check sell market[${order.index}][${order.counterLocal} - ${order.counter}] - for activities (${order.checkSellMarketCounter})`);
      order.checkSellMarketCounter--;

      setTimeout(function () {
        processOrder(order.index, orderType);
      }, 3000);
    }
  } else {
    order.stateBuy = 0; //idle
    order.checkBuyMarket = new Date().getTime();

    if (order.checkBuyMarketCounter > 0) {
      myLog(`Check buy market[${order.index}][${order.counterLocal} - ${order.counter}] - for activities (${order.checkBuyMarketCounter})`);
      order.checkBuyMarketCounter--;

      setTimeout(function () {
        processOrder(order.index, orderType);
      }, 3000);
    }
  }
}

function checkActiveMarkets() {
  myLog("Check active markets");

  //every 60 seconds
  for (let x = 0; x < orderJsonActive.length; x++) {
    let order: any = orderJsonActive[x];
    let diffLastCheckMarket = 0;

    if (order.sellOrderQty > 0) {
      diffLastCheckMarket = (new Date().getTime() - order.checkSellMarket) / 1000;

      if (diffLastCheckMarket >= (order.keepFirstPositionForMinuteSell - 1) * 60) {
        myLog(`Check market[${order.index}][${order.counterLocal} - ${order.counter}] - sell for KFPFM expired (${diffLastCheckMarket})`);

        processOrder(x, "sell");
      }
    }

    if (order.buyOrderQty > 0) {
      diffLastCheckMarket = (new Date().getTime() - order.checkBuyMarket) / 1000;

      if (diffLastCheckMarket >= (order.keepFirstPositionForMinuteBuy - 1) * 60) {
        myLog(`Check market[${order.index}][${order.counterLocal} - ${order.counter}] - buy for KFPFM expired (${diffLastCheckMarket})`);

        processOrder(x, "buy");
      }
    }
  }
}

async function processActionsResult(order: any, orderType: string, x: number) {
  try {
    var orderLocal: any = orderJsonActive[x];

    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Checking result orders for: ${order.name} `);

    for (var z = 0; z < order.actions.length; z++) {
      switch (order.actions[z].method) {
        case "cancelOrder":
          var openOrdersContainer = orderType == "sell" ? order.openOrdersSell : order.openOrdersBuy;

          if (orderType == "sell") {
            orderLocal.lastActivitySell = new Date().getTime();
          } else {
            orderLocal.lastActivityBuy = new Date().getTime();
          }

          for (var y = 0; y < openOrdersContainer.length; y++) {
            var cancelTx: string = "";
            var orderId = openOrdersContainer[y];

            if (!isTest) {
              if (orderType == "sell") {
                orderLocal.tmpNewPriceSell = order.actions[z].newPrice;
              } else {
                orderLocal.tmpNewPriceBuy = order.actions[z].newPrice;
              }

              cancelTx = await cancelOrder(new PublicKey(orderId));

              if (cancelTx !== "") {
                updateOrderTx(order, orderType, "remove", "Cancel order", openOrdersContainer[y]);
              }
            }

            myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] ${orderType} - Cancel order id ${orderId} for ${order.actions[z].reason} txID: ${cancelTx} `);
          }

          break;
        case "placeOrder":
          if (orderType == "sell") {
            orderLocal.lastActivitySell = new Date().getTime();
          } else {
            orderLocal.lastActivityBuy = new Date().getTime();
          }

          var newOrderTx: string = "";

          if (!isTest) {
            var tmpNewPriceContainer = orderType == "sell" ? order.tmpNewPriceSell : order.tmpNewPriceBuy;

            myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} tmp: ${tmpNewPriceContainer} - newPrice ${order.actions[z].newPrice} `);

            try {
              if (orderType == "sell") {
                orderLocal.tmpNewPriceSell = 0;
              } else {
                orderLocal.tmpNewPriceBuy = 0;
              }

              var qty = orderType == "sell" ? order.sellOrderQty : order.buyOrderQty;

              newOrderTx = await placeOrder(new PublicKey(order.itemMint), new PublicKey(orderType == "sell" ? order.currencySell : order.currencyBuy), qty, order.actions[z].newPrice, orderType);

              if (newOrderTx == "") {
                throw new Error();
              }

              if (orderType == "sell") {
                orderLocal.pendingNewOrderCounterSell.push(new Date());
              } else {
                orderLocal.pendingNewOrderCounterBuy.push(new Date());
              }
            }
            catch (e) {
              myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Error placing order ${e} `);

              if (orderType == "sell") {
                orderLocal.tmpNewPriceSell = order.actions[z].newPrice;
              } else {
                orderLocal.tmpNewPriceBuy = order.actions[z].newPrice;
              }
            }
          }

          var containerPending = orderType == "sell" ? orderLocal.pendingNewOrderCounterSell : orderLocal.pendingNewOrderCounterBuy;

          myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Place ${order.actions[z].newPrice} for ${order.actions[z].reason} txID: ${newOrderTx} - pendingNewOrders: ${containerPending.length} `);

          break;
        default:
          myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} ${order.actions[z].reason} `);
          break;
      }
    }
  } catch (e) {
    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} ${e} `);
  }

  return order;
}

async function callBackendApi(data = {}) {
  const response = await fetch(config.apiServerAddress, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

async function botEvent() {
  const gmEventService = new GmEventService(
    connection,
    programId,
  );

  // As events are emitted from the program eventHandler will be called
  gmEventService.setEventHandler(eventHandler);

  gmEventService.initialize();
}

async function eventHandler(eventType: GmEventType, order: Order, slotContext: number) {
  var inMyMarket = orderJsonActive.filter(function (el) {
    return el.itemMint == order.orderMint && (order.orderType == "sell" ? el.currencySell : el.currencyBuy) == order.currencyMint;
  });

  switch (eventType) {
    case GmEventType.orderAdded:
      if (inMyMarket.length == 1) {
        for (var x = 0; x < orderJsonActive.length; x++) {
          var el = orderJsonActive[x];

          if (el.itemMint == order.orderMint && (order.orderType == "sell" ? el.currencySell : el.currencyBuy) == order.currencyMint) {
            if (order.owner == wallet.publicKey.toString()) {
              updateOrderTx(orderJsonActive[x], order.orderType, "add", "EVT_ I add my new order", order.id);
            } else {
              myLog(`EVT_ check market[${el.index}][${el.counterLocal} - ${el.counter}] - ${order.orderType} for order added`);
              processOrder(x, order.orderType);
            }

            break;
          }
        }
      }

      break;
    case GmEventType.orderModified:
    case GmEventType.orderRemoved:
      for (var x = 0; x < orderJsonActive.length; x++) {
        var el = orderJsonActive[x];

        if (order.owner == wallet.publicKey.toString() && el.itemMint == order.orderMint && (order.orderType == "sell" ? el.currencySell : el.currencyBuy) == order.currencyMint) {
          if (eventType == GmEventType.orderModified && order.orderQtyRemaining == 0) {
            updateOrderTx(orderJsonActive[x], order.orderType, "remove", "EVT_ Remove my order for fill", order.id);
          }

          if (eventType == GmEventType.orderRemoved) {
            updateOrderTx(orderJsonActive[x], order.orderType, "remove", "EVT_ Remove my order due to cancellation", order.id);
          }
        }

        if (el.itemMint == order.orderMint && (order.orderType == "sell" ? el.currencySell : el.currencyBuy) == order.currencyMint) {
          myLog(`EVT_ check market[${el.index}][${el.counterLocal} - ${el.counter}] - ${order.orderType} for order modified / removed`);
          processOrder(x, order.orderType);
        }
      }

      break;
    default:
      break;
  }
}

function updateOrderTx(order: any, orderType: string, action: string, source: string, orderId: string) {
  var container = orderType == "sell" ? order.openOrdersSell : order.openOrdersBuy;
  var containerPending = orderType == "sell" ? order.pendingNewOrderCounterSell : order.pendingNewOrderCounterBuy;

  if (action == "remove") {
    var index = container.indexOf(orderId);
    if (index > -1) {
      container.splice(index, 1);
    }
  }

  if (action == "add") {
    var index = container.indexOf(orderId);
    if (index == -1) {
      if (source !== 'sync') {
        if (orderType == "sell") {
          order.pendingNewOrderCounterSell.shift();
        } else {
          order.pendingNewOrderCounterBuy.shift();
        }
      }

      container.push(orderId);
    }
  }

  myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} ${source} ${orderId} openOrders: ${container.length}; pendingNewOrders: ${containerPending.length} `);
}

async function placeOrder(itemMint: PublicKey, quoteMint: PublicKey, quantity: number, uiPrice: number, orderSide: any) {
  var txid = "";

  try {
    const priceBN = await gmClientService.getBnPriceForCurrency(
      connection,
      uiPrice,
      quoteMint,
      programId
    );

    const orderTx = await gmClientService.getInitializeOrderTransaction(
      connection,
      wallet.publicKey,
      itemMint,
      quoteMint,
      quantity,
      priceBN,
      programId,
      orderSide
    );

    const transaction = new VersionedTransaction(
      new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: (await connection.getLatestBlockhash('confirmed')).blockhash,
        instructions: orderTx.transaction.instructions
      }).compileToV0Message());

    transaction.sign([wallet, ...orderTx.signers]);

    txid = await connection.sendTransaction(transaction, { maxRetries: 5 });
  } catch {

  }

  return txid;
}

async function cancelOrder(orderId: PublicKey) {
  var txid = "";

  try {
    const cancelTx = await gmClientService.getCancelOrderTransaction(connection, orderId, wallet.publicKey, programId);

    const transaction = new VersionedTransaction(
      new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: (await connection.getLatestBlockhash('confirmed')).blockhash,
        instructions: cancelTx.transaction.instructions
      }).compileToV0Message());

    transaction.sign([wallet, ...cancelTx.signers]);

    txid = await connection.sendTransaction(transaction, { maxRetries: 5 });
  } catch {

  }

  return txid;
}

initWallet();