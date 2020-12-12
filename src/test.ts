import BitcoinJsonRpc from "bitcoin-json-rpc";

const rpc = new BitcoinJsonRpc("http://user:pass@localhost:19332");

(async function () {
  console.log(await rpc.getBalance());
  var address = await rpc.getNewAddress();
  var txid = await rpc.sendToAddress(address, "0.0001");
  console.log(await rpc.getTransaction(txid));
})();
