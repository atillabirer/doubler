import BitcoinJsonRpc from "bitcoin-json-rpc";
import { NextFunction, Request, Response } from "express";
import express from "express";
import bodyParser from "body-parser";
const app = express();
import sqlite3 from "sqlite3";

interface Investment {
  address: string;
  amount: number;
  txid: string;
  timestamp: number;
  paid: boolean;
}

(async function () {
  const rpc = new BitcoinJsonRpc("http://user:pass@localhost:19332");

  var investments: Investment[] = [];

  const db = new sqlite3.Database("database.db");

  var depositaddress = await rpc.getNewAddress();
  console.log(depositaddress);

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.post(
    "/",
    async function (req: Request, res: Response, next: NextFunction) {
      try {
        // check the payments queue, get the first unpaid address from database
        if (req.body.txid) {
          var value = 0;

          const obj = await rpc.getRawTransactionAsObject(req.body.txid);
          obj.vout.forEach((singlevout) => {
            let searchResult = singlevout.scriptPubKey.addresses?.find(
              (address) => address === depositaddress
            );
            //this is the transaction output that paid to our deposit address
            //this is the value of what they sent to us
            if (searchResult) {
              value = singlevout.value!; //it exists damn you
              db.get(
                "SELECT * FROM investments WHERE paid=0 AND amount ORDER BY id ASC",
                async (err, row) => {
                  console.log("row", row);

                  if (!row) return;

                  try {
                    const balance = await rpc.getBalance();
                    if (balance >= row.amount) {
                      console.log("doubleToFixed", row.amount.toFixed(8));
                      const rpcReply = await rpc.sendToAddress(
                        row.address,
                        "0.0001"
                      );
                      console.log("rpcReply:", rpcReply);
                      if (!rpcReply.includes("Error")) {
                        //awsum
                        console.log(await rpc.getTransaction(rpcReply));
                        db.run(
                          "UPDATE investments SET paid=1 WHERE txid = ?",
                          [row.txid],
                          (err) => {
                            console.log("updateErr:", err);
                          }
                        );
                      }
                    }
                  } catch (error) {
                    next(error);
                  }
                }
              );
            }
          });

          console.log("receive tx:" + req.body.txid);
          if (obj.vin) {
            let txid = obj.vin[0].txid;
            let vout = obj.vin[0].vout;
            console.log(txid);
            console.log(vout);
            if (txid) {
              let sendertx = await rpc.getRawTransactionAsObject(txid);

              let outputSearchResult = sendertx.vout.find(
                (single) => single.n === vout
              );
              let sender = outputSearchResult?.scriptPubKey.addresses?.pop();
              console.log("Amount:", value);
              console.log("TXID: ", req.body.txid);
              console.log("Timestamp:", Date.now());
              if (
                !investments.find(
                  (investment) => investment.txid === req.body.txid
                ) &&
                Math.ceil(value) > 0
              ) {
                investments.push({
                  address: sender!,
                  amount: value,
                  txid: req.body.txid,
                  timestamp: Date.now(),
                  paid: false,
                });
                console.log("dbVal", value);
                db.run(
                  "INSERT INTO investments(address,amount,txid,timestamp,paid) VALUES($address,$amount,$txid,$timestamp,$paid)",
                  {
                    $address: sender!,
                    $amount: value,
                    $txid: req.body.txid,
                    $timestamp: Date.now(),
                    $paid: false,
                  },
                  (result: any, error: any) => {
                    console.log(result);
                    console.log(error);
                  }
                );
              }
              console.log(investments);
              res.end();
              next();
            }
          }
        } else {
          res.end();
          next();
        }
      } catch (error) {
        next(error);
      }
    }
  );

  app.get("/transactions", function (req, res) {
    db.all("SELECT * FROM investments", (err, rows) => {
      res.json(rows);
    });
  });
  app.listen(3000, () => console.log(":3000"));
})();
