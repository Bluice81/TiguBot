import { Connection, PublicKey, VersionedTransaction, TransactionMessage, Keypair } from '@solana/web3.js';
import { GmEventService, GmClientService, GmEventType, Order } from '@staratlas/factory';
import { encrypt, decrypt } from './crypto';
import readline from 'readline';
import fetch from "isomorphic-fetch";
import base58 = require('bs58');
import ordersJson from "./orders.json";
import config from "./config.json";

let version = '1.6 10/01/2023';

let wallet: Keypair;

let connection = new Connection(config.rpc, "confirmed");
let programId = new PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg");

let gmClientService = new GmClientService();
let numConsoleMessage = 0;

let isTest = true;

let nfts: any[] = [];

let USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
let ATLAS = 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx';

let intArr: (string | number | NodeJS.Timeout | undefined)[] = [];

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

  console.log(new Date().toLocaleString(), (important ? '>>>>>>' : ''), data, (important ? '<<<<<<' : ''));
}

const initWallet = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if (config.privateKey.iv == "" || config.privateKey.content == "") {
    rl.question('What is your private key?\n', function (privateKey) {
      rl.question('What is your secret key (32 characters)?\n ', function (secretKey) {
        var hash = encrypt(privateKey, secretKey);

        config.privateKey.iv = hash.iv;
        config.privateKey.content = hash.content;

        var fs = require('fs');
        fs.writeFile('./src/config.json', JSON.stringify(config), function (err: any) {
          if (err) {
            myLog(err);
          }
        });

        console.log(`ris: ${privateKey} ${secretKey} ${hash.content}`);
        rl.close();

        wallet = Keypair.fromSecretKey(base58.decode(privateKey));

        init();
      });
    });

  } else {
    rl.question('What is your secret key (32 characters)?\n ', function (secretKey) {
      wallet = Keypair.fromSecretKey(base58.decode(decrypt(config.privateKey, secretKey)));

      rl.close();

      init();
    });
  }

}

async function init() {
  var param = process.argv.slice(2);

  isTest = param.length < 1 || process.argv.slice(2)[0] == "1";

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

      errorDescription += `Market nr. ${x} - NFT name not found!\n`;

      break;
    }
    if (orderJsonActive[x].currency !== "ATLAS" && orderJsonActive[x].currency !== "USDC") {
      orderJsonActive[x].sellOrderQty = 0;
      orderJsonActive[x].buyOrderQty = 0;

      errorDescription += `Market nr. ${x} - Wrong currency, possible values: ATLAS or USDC\n`;

      break;
    }

    if (orderJsonActive[x].sellOrderQty > 0 && orderJsonActive[x].minimumSellPrice == 0) {
      orderJsonActive[x].sellOrderQty = 0;
      orderJsonActive[x].buyOrderQty = 0;

      errorDescription += `Market nr. ${x} - Wrong minimumSellPrice, value must be greater than zero\n`;

      break;
    }

    orderJsonActive[x].index = index;
    orderJsonActive[x].counter = 0;
    orderJsonActive[x].counterLocal = 0;
    orderJsonActive[x].tmpNewPriceSell = 0;
    orderJsonActive[x].tmpNewPriceBuy = 0;

    orderJsonActive[x].pendingNewOrderCounterSell = 0;
    orderJsonActive[x].pendingNewOrderCounterBuy = 0;
    orderJsonActive[x].openOrdersSell = [];
    orderJsonActive[x].openOrdersBuy = [];

    orderJsonActive[x].lastActivitySell = new Date().getTime();
    orderJsonActive[x].lastActivityBuy = new Date().getTime();

    orderJsonActive[x].stateSell = 0;
    orderJsonActive[x].stateBuy = 0;
    orderJsonActive[x].openOrdersSyncSell = false;
    orderJsonActive[x].openOrdersSyncBuy = false;

    if (!orderJsonActive[x].disableSafetyChecksSell) {
      orderJsonActive[x].disableSafetyChecksSell = false;
    }
    if (!orderJsonActive[x].disableSafetyChecksSell) {
      orderJsonActive[x].disableSafetyChecksBuy = false;
    }

    //get token account of NFT
    try {
      var ris = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: new PublicKey(orderJsonActive[x].itemMint),
      });

      orderJsonActive[x].tokenAccount = ris.value[0].pubkey.toString();
    } catch (e) {
      orderJsonActive[x].tokenAccount = "";
    }

    if (orderJsonActive[x].currency == "ATLAS") {
      orderJsonActive[x].currency = ATLAS;
    }

    if (orderJsonActive[x].currency == "USDC") {
      orderJsonActive[x].currency = USDC;
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

  myLog(`System start ${version} testMode: ${config.testMode} - active markets: ${orderJsonActive.length} - active orders: ${activeOrders} `);

  botEvent();

  await makeOrdersInterval();
}

async function getNfts() {
  const response = await fetch("https://galaxy.staratlas.com/nfts", {
    method: 'GET'
  });

  return response.json();
}

async function makeOrdersInterval() {
  for (var x = 0; x < intArr.length; x++) {
    clearInterval(intArr[x]);
  }

  for (var x = 0; x < orderJsonActive.length; x++) {
    (function (x) {
      if (orderJsonActive[x].sellOrderQty > 0) {
        var delay = 3000;

        var diffLastActivity = (new Date().getTime() - orderJsonActive[x].lastActivitySell) / 1000;
        if (diffLastActivity > 20) {
          delay = 10000;
        }

        myLog(`[${orderJsonActive[x].index}] - sell -----> (${delay})`);

        processOrder(orderJsonActive[x], "sell");
        intArr.push(setInterval(function () {
          processOrder(orderJsonActive[x], "sell");
        }, delay))
      }

      if (orderJsonActive[x].buyOrderQty > 0) {
        var delay = 3000;

        var diffLastActivity = (new Date().getTime() - orderJsonActive[x].lastActivityBuy) / 1000;
        if (diffLastActivity > 20) {
          delay = 10000;
        }

        myLog(`[${orderJsonActive[x].index}] - buy -----> (${delay})`);

        processOrder(orderJsonActive[x], "buy");
        intArr.push(setInterval(function () {
          processOrder(orderJsonActive[x], "buy");
        }, delay))
      }
    })(x);
  }

  setTimeout(function () {
    makeOrdersInterval();
  }, 30000);

}

async function processOrder(order: any, orderType: string) {
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

    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Checking order ${order.name}`);

    //Call api web services
    order.orderType = orderType;

    var result: any;
    try {
      result = await callBackendApi({ method: "getActions", wallet: wallet.publicKey.toString(), apiKey: config.apiKey, order: order });
      order.lastError = undefined;
    } catch {
      if (!order.lastError) {
        order.lastError = new Date().getTime();
      }

      var lastErrorServerContact = Math.round((new Date().getTime() - order.lastError) / 60000);
      myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType}: last error server contact: ${lastErrorServerContact} minutes ago`);

      if (lastErrorServerContact < 1) {
        if (orderType == "sell") {
          order.stateSell = 0; //idle
        } else {
          order.stateBuy = 0; //idle
        }

        return;
      } else {
        myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType}: contact with server lost, remove all open orders`);

        order.actions = [];
        order.actions.push({
          orderType: order.orderType,
          method: "cancelOrder",
          newPrice: 0,
          reason: "server lost"
        });

        var orderNew = await processActionsResult(order);

        if (orderType == "sell") {
          order.stateSell = 0; //idle
        } else {
          order.stateBuy = 0; //idle
        }

        return;
      }
    }

    switch (result.code) {
      case 200:
        var serverOrder = JSON.parse(result.data);

        //server response security checks
        if (serverOrder.orderType !== order.orderType || serverOrder.itemMint !== order.itemMint || serverOrder.currency !== order.currency ||
          (order.orderType == "sell" && serverOrder.newPrice < order.maximumBuyPrice) ||
          (order.orderType == "buy" && serverOrder.newPrice > order.maximumBuyPrice)) {
          myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Service Error: wrong data`);
          break;
        }

        var orderNew = await processActionsResult(serverOrder);

        if (orderType == "sell") {
          order.pendingNewOrderCounterSell = orderNew.pendingNewOrderCounterSell;
          order.tmpNewPriceSell = orderNew.tmpNewPriceSell;

          if (!order.openOrdersSyncSell) {
            for (var j = 0; j < orderNew.openOrdersSell.length; j++) {
              updateOrderTx(order, "sell", "add", "sync", orderNew.openOrdersSell[j]);
            }
          }

          order.openOrdersSyncSell = orderNew.openOrdersSyncSell;
          order.stateSell = 0; //idle
        } else {
          order.pendingNewOrderCounterBuy = orderNew.pendingNewOrderCounterBuy;
          order.tmpNewPriceBuy = orderNew.tmpNewPriceBuy;

          if (!order.openOrdersSyncBuy) {
            for (var j = 0; j < orderNew.openOrdersBuy.length; j++) {
              updateOrderTx(order, "buy", "add", "sync", orderNew.openOrdersBuy[j]);
            }
          }

          order.openOrdersSyncBuy = orderNew.openOrdersSyncBuy;
          order.stateBuy = 0; //idle
        }
        break;
      default:
        myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} Service Error: ${result.code} ${result.data} `);
        break;
    }
  } catch (e) {
    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${orderType} ${e}`);
  }
}

async function processActionsResult(order: any) {
  try {
    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${order.orderType} Checking result orders for: ${order.name}`);

    for (var z = 0; z < order.actions.length; z++) {
      switch (order.actions[z].method) {
        case "cancelOrder":
          var openOrdersContainer = order.actions[z].orderType == "sell" ? order.openOrdersSell : order.openOrdersBuy;

          if (order.actions[z].orderType == "sell") {
            order.lastActivitySell = new Date().getTime();
          } else {
            order.lastActivityBuy = new Date().getTime();
          }

          for (var y = 0; y < openOrdersContainer.length; y++) {
            var cancelTx: string = "";
            var orderId = openOrdersContainer[y];

            if (config.testMode == "off") {
              if (order.actions[z].orderType == "sell") {
                order.tmpNewPriceSell = order.actions[z].newPrice;
              } else {
                order.tmpNewPriceBuy = order.actions[z].newPrice;
              }

              if (!isTest) {
                cancelTx = await cancelOrder(new PublicKey(orderId));
                updateOrderTx(order, order.actions[z].orderType, "remove", "Cancel order", openOrdersContainer[y]);
              }

            }

            myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] Cancel order id ${orderId} for ${order.actions[z].reason} txID: ${cancelTx}`);
          }

          break;
        case "placeOrder":
          if (order.actions[z].orderType == "sell") {
            order.lastActivitySell = new Date().getTime();
          } else {
            order.lastActivityBuy = new Date().getTime();
          }

          var newOrderTx: string = "";

          if (config.testMode == "off") {
            var tmpNewPriceContainer = order.actions[z].orderType == "sell" ? order.tmpNewPriceSell : order.tmpNewPriceBuy;

            myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] tmp: ${tmpNewPriceContainer} - newPrice ${order.actions[z].newPrice}`);

            try {
              if (order.actions[z].orderType == "sell") {
                order.tmpNewPriceSell = 0;
              } else {
                order.tmpNewPriceBuy = 0;
              }

              var qty = order.actions[z].orderType == "sell" ? order.sellOrderQty : order.buyOrderQty;

              if (!isTest) {
                newOrderTx = await placeOrder(new PublicKey(order.itemMint), new PublicKey(order.currency), qty, order.actions[z].newPrice, order.actions[z].orderType);
              }

              myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${order.actions[z].orderType} Place ${order.actions[z].newPrice} order ${newOrderTx} for ${order.actions[z].reason}`);

              if (order.actions[z].orderType == "sell") {
                order.pendingNewOrderCounterSell++;
              } else {
                order.pendingNewOrderCounterBuy++;
              }
            }
            catch (e) {
              myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${order.actions[z].orderType} Error placing order ${e}`);

              if (order.actions[z].orderType == "sell") {
                order.tmpNewPriceSell = order.actions[z].newPrice;
              } else {
                order.tmpNewPriceBuy = order.actions[z].newPrice;
              }
            }
          }

          var containerPending = order.actions[z].orderType == "sell" ? order.pendingNewOrderCounterSell : order.pendingNewOrderCounterBuy;

          myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] Place ${order.actions[z].newPrice} ${order.actions[z].orderType} order ${newOrderTx} for ${order.actions[z].reason} pendingNewOrders: ${containerPending}`);

          break;
        default:
          myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] ${order.actions[z].reason}`);
          break;
      }
    }
  } catch (e) {
    myLog(`[${order.index}][${order.counterLocal} - ${order.counter}] - ${order.orderType} ${e}`);
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
  switch (eventType) {
    case GmEventType.orderAdded:
      if (order.owner == wallet.publicKey.toString()) {
        for (var x = 0; x < orderJsonActive.length; x++) {
          var el = orderJsonActive[x];

          if (el.itemMint == order.orderMint && el.currency == order.currencyMint) {
            updateOrderTx(orderJsonActive[x], order.orderType, "add", "EVT_ I add my new order", order.id);
            break;
          }
        }
      }

      break;
    case GmEventType.orderModified:
    case GmEventType.orderRemoved:
      for (var x = 0; x < orderJsonActive.length; x++) {
        var el = orderJsonActive[x];

        if (order.owner == wallet.publicKey.toString() && el.itemMint == order.orderMint && el.currency == order.currencyMint) {
          if (eventType == GmEventType.orderModified && order.orderQtyRemaining == 0) {
            updateOrderTx(orderJsonActive[x], order.orderType, "remove", "EVT_ Remove my order for fill", order.id);
          }

          if (eventType == GmEventType.orderRemoved) {
            updateOrderTx(orderJsonActive[x], order.orderType, "remove", "EVT_ Remove my order due to cancellation", order.id);
          }
        }

        if (order.owner !== wallet.publicKey.toString() && el.itemMint == order.orderMint && ((el.sellOrderQty > 0 && order.orderType == "sell" && el.priceWallSell > 0) || (el.buyOrderQty > 0 && order.orderType == "buy" && el.priceWallBuy > 0)) && el.currency == order.currencyMint) {
          var nftName = nfts.filter(function (el) {
            return el.mint == order.orderMint;
          });

          if (nftName.length == 1) {
            myLog(`EVT_ check market [${el.index}][${el.counterLocal} - ${el.counter}] for ${order.orderType} order modified/removed ${nftName[0].name} qty: ${order.orderQtyRemaining} * ${order.uiPrice} USDC`);
            processOrder(orderJsonActive[x], order.orderType);
          }

          break;
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
          order.pendingNewOrderCounterSell--;
        } else {
          order.pendingNewOrderCounterBuy--;
        }
      }

      container.push(orderId);
    }
  }

  myLog(`[${order.index}] - ${orderType} ${source} ${orderId} openOrders: ${container.length}; pendingNewOrders: ${containerPending}`);
}

async function placeOrder(itemMint: PublicKey, quoteMint: PublicKey, quantity: number, uiPrice: number, orderSide: any) {
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

  const txid = await connection.sendTransaction(transaction, { maxRetries: 5 });

  return txid;
}

async function cancelOrder(orderId: PublicKey) {
  const cancelTx = await gmClientService.getCancelOrderTransaction(connection, orderId, wallet.publicKey, programId);

  const transaction = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: (await connection.getLatestBlockhash('confirmed')).blockhash,
      instructions: cancelTx.transaction.instructions
    }).compileToV0Message());

  transaction.sign([wallet, ...cancelTx.signers]);

  const txid = await connection.sendTransaction(transaction, { maxRetries: 5 });

  return txid;
}

initWallet();