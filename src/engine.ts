import { Connection, PublicKey, VersionedTransaction, TransactionMessage, Keypair } from '@solana/web3.js';
import { GmEventService, GmClientService, GmEventType, Order } from '@staratlas/factory';
import fetch from "isomorphic-fetch";
import base58 = require('bs58');
import ordersJson from "./markets.json";
import config from "./config.json";

let version = '1.54 05/01/2023';

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

const init = async () => {
  var param = process.argv.slice(2);
  if (param.length >= 1) {
    //First parameters is private key of your wallet
    if (process.argv.slice(2)[0] !== '-') {
      wallet = Keypair.fromSecretKey(base58.decode(process.argv.slice(2)[0]));
    }

    isTest = param.length < 2 || process.argv.slice(3)[0] == "1";
  } else {
    myLog("Invalid parameters", true);
    return;
  }

  nfts = await getNfts();

  orderJsonActive = ordersJson.filter(function (el) {
    return el.buyOrderQty > 0 || el.sellOrderQty > 0;
  });

  var index = 0;
  var errorDescription = '';
  var activeOrders = 0;

  for (var x = 0; x < orderJsonActive.length; x++) {
    var nft = nfts.filter(function (el) {
      return el.name.toLowerCase() == orderJsonActive[x].name.toLowerCase();
    });

    if (nft.length !== 1) {
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

    orderJsonActive[x].index = index;
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

    try {
      var ris = await connection.getTokenAccountsByOwner(wallet.publicKey, {
        mint: new PublicKey(orderJsonActive[x].itemMint),
      });

      orderJsonActive[x].tokenAccount = ris.value[0].pubkey.toString();
    } catch (e) {
      orderJsonActive[x].tokenAccount = "";
    }

    if (orderJsonActive[x].currency == "ATLAS") {
      orderJsonActive[x].currencyMint = ATLAS;
    }

    if (orderJsonActive[x].currency == "USDC") {
      orderJsonActive[x].currencyMint = USDC;
    }

    activeOrders += orderJsonActive[x].sellOrderQty > 0 ? 1 : 0;
    activeOrders += orderJsonActive[x].buyOrderQty > 0 ? 1 : 0;

    index++;
  }


  orderJsonActive = ordersJson.filter(function (el) {
    return el.sellOrderQty > 0 || el.buyOrderQty > 0;
  });

  myLog(`System start ${version} testMode: ${isTest} - active markets: ${orderJsonActive.length} - active orders: ${activeOrders} `);

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

    myLog(`[${order.index}] - ${orderType} Checking order ${order.name}`);

    //Call api web services
    var result = await callBackendApi({ method: "getActions", wallet: wallet.publicKey.toString(), apiKey: config.apiKey, order: order });

    switch (result.code) {
      case 200:
        await processActionsResult(JSON.parse(result.data));

        if (orderType == "sell") {
          order.stateSell = 0; //idle
        } else {
          order.stateBuy = 0; //idle
        }
        break;
      default:
        myLog(`[${order.index}] - ${orderType} Service Error: ${result.code} ${result.data} `);
        break;
    }
  } catch (e) {
    myLog(`[${order.index}] - ${orderType} ${e}`);
  }
}

async function processActionsResult(order: any) {
  for (var x = 0; x < order.actions.length; x++) {
    myLog(`[${order.index}] Checking ${order.actions[x].orderType} orders for: ${order.name}`);

    switch (order.actions[x].action) {
      case "placeOrder":
        order.lastActivity = new Date().getTime();

        var newOrderTx: string = "";

        if (!isTest) {
          myLog(`[${x}] tmp: ${order.tmpNewPrice} - newPrice ${order.actions[x].newPrice}`);

          try {
            order.tmpNewPrice = 0;
            newOrderTx = await placeOrder(order.itemMint, new PublicKey(order.currency), order.actions[x].qty, order.actions[x].newPrice, order.actions[x].orderType);

            order.pendingNewOrderCounter++;
          }
          catch (e) {
            order.tmpNewPrice = order.actions[x].newPrice;
          }
        }

        myLog(`[${x}] Place ${order.actions[x].newPrice} ${order.actions[x].orderType} order ${newOrderTx} for ${order.actions[x].reason}`);

        break;
      case "cancelOrder":
        order.lastActivity = new Date().getTime();

        for (var y = 0; y < order.openOrders.length; y++) {
          var cancelTx: string = "";

          if (!isTest) {
            order.tmpNewPrice = order.actions[x].newPrice;
            cancelTx = await cancelOrder(new PublicKey(order.openOrders[y]));
          }

          myLog(`[${x}] Cancel order id ${order.openOrders[y]} for ${order.actions[x].reason} txID: ${cancelTx}`);
        }

        break;
      default:
        myLog(`[${x}] No action needed`);
        break;
    }
  }
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

async function callBackendApi2(data = {}) {
  const response = await fetch(config.apiServerAddress, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response.text();
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
            updateOrderTx(orderJsonActive[x], order.orderType, "add", "I add my new order", order.id);
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
            if (order.orderType == "sell") {
              orderJsonActive[x].sellOrderQty = order.orderQtyRemaining;
            } else {
              orderJsonActive[x].buyOrderQty = order.orderQtyRemaining;
            }

            updateOrderTx(orderJsonActive[x], order.orderType, "remove", "I remove my order for fill", order.id);
          }

          if (eventType == GmEventType.orderRemoved) {
            updateOrderTx(orderJsonActive[x], order.orderType, "remove", "I remove my order due to cancellation", order.id);
          }
        }

        if (order.owner !== wallet.publicKey.toString() && el.itemMint == order.orderMint && el.active && ((el.sellOrderQty > 0 && order.orderType == "sell") || (el.buyOrderQty > 0 && order.orderType == "buy")) && el.currency == order.currencyMint && el.priceWall > 0) {
          var nftName = nfts.filter(function (el) {
            return el.mint == order.orderMint;
          });

          if (nftName.length == 1) {
            myLog(`--------Check market [${x}] for ${order.orderType} order modified/removed ${nftName[0].name} qty: ${order.orderQtyRemaining} * ${order.uiPrice} USDC`);
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

  myLog(`[${order.index}] - ${orderType} ${source} ${orderId} openOrders: ${container.length};`);
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

init();