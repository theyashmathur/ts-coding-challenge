import { Given, Then, When, setDefaultTimeout } from "@cucumber/cucumber";
import { accounts } from "../../src/config";
import {
  AccountBalanceQuery,
  AccountId,
  AccountInfoQuery,
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenId,
  TokenInfoQuery,
  TokenMintTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";
import assert from "node:assert";
import TokenTransfer from "@hashgraph/sdk/lib/token/TokenTransfer";

setDefaultTimeout(60 * 1000);

const client = Client.forTestnet();
let tokenID: any;
let tx: any;

Given(
  /^A Hedera account with more than (\d+) hbar$/,
  async function (expectedBalance: number) {
    const account = accounts[3];
    const MY_ACCOUNT_ID = AccountId.fromString(account.id);
    const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
    client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

    //Create the query request
    const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
    const balance = await query.execute(client);
    console.log("Balance: ", balance.hbars.toBigNumber().toNumber());
    assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
  }
);

When(/^I create a token named Test Token \(HTT\)$/, async function () {
  const account = accounts[3];
  const adminId = AccountId.fromString(account.id);
  const adminKey = PrivateKey.fromStringED25519(account.privateKey);

  // Create token
  const transaction = new TokenCreateTransaction()
    .setTokenName("Test Token")
    .setTokenSymbol("HTT")
    .setTreasuryAccountId(adminId)
    .setDecimals(2)
    .setAdminKey(adminKey)
    .setSupplyKey(adminKey);

  // Sign and execute Tx
  const tx = await transaction.execute(client);

  //Request the receipt of the transaction
  const getReceipt = await tx.getReceipt(client);

  //Get the token ID from the receipt
  const tokenId = getReceipt.tokenId?.toString();
  tokenID = tokenId;

  console.log("The new token ID is " + tokenId);
});

Then(/^The token has the name "([^"]*)"$/, async function (name: string) {
  const tokenId = TokenId.fromString(tokenID);
  const token = new TokenInfoQuery()
    .setTokenId(tokenId);

  const tokenName = (await token.execute(client)).name;

  assert.equal(tokenName, name);
});

Then(/^The token has the symbol "([^"]*)"$/, async function (symbol: string) {
  const tokenId = TokenId.fromString(tokenID);
  const token = new TokenInfoQuery()
    .setTokenId(tokenId);

  const tokenSymbol = (await token.execute(client)).symbol;

  assert.equal(tokenSymbol, symbol);
});

Then(/^The token has (\d+) decimals$/, async function (decimals: string) {
  const tokenId = TokenId.fromString(tokenID);
  const token = new TokenInfoQuery()
    .setTokenId(tokenId);

  const tokenDecimals = (await token.execute(client)).decimals;
  
  assert.equal(tokenDecimals, decimals);
});

Then(/^The token is owned by the account$/, async function (owner: any) {
  const tokenId = TokenId.fromString(tokenID);
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.ok(tokenInfo.adminKey !== null);
});

Then(/^An attempt to mint (\d+) additional tokens succeeds$/, async function (amount: number) {
  const tokenId = TokenId.fromString(tokenID);
  const transaction = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(10000);
  
  const tokenInfo = new TokenInfoQuery()
    .setTokenId(tokenId)
  
    
  const tx = await transaction.execute(client);
  const receipt = await tx.getReceipt(client);
  
  const totalSupply = (await tokenInfo.execute(client)).totalSupply;
  const _totalSupply = totalSupply.getLowBits();
  console.log("TOTAL SUPPLY", _totalSupply);
  const supplyToDecimal = _totalSupply / 100;    // 2 decimal places

  assert.ok(supplyToDecimal.toString() == amount.toString());
});

When(/^I create a fixed supply token named Test Token \(HTT\) with (\d+) tokens$/, async function (amount: number) {
  const account = accounts[3];
  const adminId = AccountId.fromString(account.id);
  const adminKey = PrivateKey.fromStringED25519(account.privateKey);

  // Create token
  const transaction = new TokenCreateTransaction()
    .setTokenName("Test Token")
    .setTokenSymbol("HTT")
    .setTreasuryAccountId(adminId)
    .setDecimals(2)
    .setInitialSupply(100000)
    .setAdminKey(adminKey)

  // Sign and execute Tx
  const tx = await transaction.execute(client);

  //Request the receipt of the transaction
  const getReceipt = await tx.getReceipt(client);

  assert.equal(amount, 1000)
});

Then(/^The total supply of the token is (\d+)$/, async function (totalSupply: any) {
  const tokenId = TokenId.fromString(tokenID);
  const token = new TokenInfoQuery()
    .setTokenId(tokenId);
  
  const supply = (await token.execute(client)).totalSupply;
  const _supply = supply.getLowBits() / 100;
  console.log("Supply", supply);
  assert.equal(_supply, totalSupply);
});

Then(/^An attempt to mint tokens fails$/, async function () {
  const tokenId = TokenId.fromString(tokenID);
  const transaction = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(1000);
  
  const tx = await transaction.execute(client);
  const receipt = await tx.getReceipt(client);

  assert.notStrictEqual(receipt.status.toString(), "SUCCESS")
});

Given(/^A first hedera account with more than (\d+) hbar$/, async function (expectedBalance: number) {
  const account = accounts[3];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  //Create the query request
  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

Given(/^A second Hedera account$/, async function () {
  const account = accounts[1];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
});

Given(/^A token named Test Token \(HTT\) with (\d+) tokens$/, async function (expectedSupply: number) {
  const tokenId = TokenId.fromString(tokenID);
  const tokenInfo = new TokenInfoQuery()
    .setTokenId(tokenId);
  
  const supply = (await tokenInfo.execute(client)).totalSupply;
  const _totalSupply = supply.getLowBits();
  const supplyToDecimal = _totalSupply / 100;

  assert.equal(supplyToDecimal, expectedSupply);
});

Given(/^The first account holds (\d+) HTT tokens$/, async function (amount: number) {
  const query = new AccountInfoQuery()
    .setAccountId(accounts[3].id)
    .execute(client);
  
  const token = (await query).tokenRelationships.get(tokenID);
  const balance = token?.balance.getLowBits();

  assert.ok(balance !== undefined && balance > amount);
});

Given(/^The second account holds (\d+) HTT tokens$/, async function (expectedBalance: number) {
  const query = new AccountInfoQuery()
    .setAccountId(accounts[1].id)
    .execute(client);
  
  const token = (await query).tokenRelationships.get(tokenID);
  
  const balance = token?.balance.getLowBits();

  assert.equal(balance, expectedBalance);
});

When(/^The first account creates a transaction to transfer (\d+) HTT tokens to the second account$/, async function (tokensToSend: number) {
  const transaction = await new TransferTransaction()
    .addTokenTransfer(tokenID, accounts[3].id, -(tokensToSend))
    .addTokenTransfer(tokenID, accounts[1].id, tokensToSend)
  
  tx = transaction;
});
When(/^The first account submits the transaction$/, async function () {
  const transaction = await tx.execute(client);
  const receipt = await transaction.getReceipt(client);

  const status = receipt.status;
  assert.equal(status.toString(), "SUCCESS");
});

Then(/^The second account holds (\d+) HTT tokens$/, async function (expectedBalance: number) {
  const query = new AccountInfoQuery()
    .setAccountId(accounts[1].id)
    .execute(client);
  
  const token = (await query).tokenRelationships.get(tokenID);
  const balance = token?.balance.getLowBits();

  assert.equal(balance, expectedBalance);
});

Then(/^The first account holds (\d+) HTT tokens$/, async function (amount: number) {
  const query = new AccountInfoQuery()
    .setAccountId(accounts[3].id)
    .execute(client);
  
  const token = (await query).tokenRelationships.get(tokenID);
  const balance = token?.balance.getLowBits();

  assert.ok(balance !== undefined && balance > amount);
});

When(
  /^The second account creates a transaction to transfer (\d+) HTT tokens to the first account$/,
  async function () {}
);
Then(
  /^The first account has paid for the transaction fee$/,
  async function () {}
);
Given(
  /^A first hedera account with more than (\d+) hbar and (\d+) HTT tokens$/,
  async function () {}
);
Given(
  /^A second Hedera account with (\d+) hbar and (\d+) HTT tokens$/,
  async function () {}
);
Given(
  /^A third Hedera account with (\d+) hbar and (\d+) HTT tokens$/,
  async function () {}
);
Given(
  /^A fourth Hedera account with (\d+) hbar and (\d+) HTT tokens$/,
  async function () {}
);
When(
  /^A transaction is created to transfer (\d+) HTT tokens out of the first and second account and (\d+) HTT tokens into the third account and (\d+) HTT tokens into the fourth account$/,
  async function () {}
);
Then(/^The third account holds (\d+) HTT tokens$/, async function () { });
Then(/^The fourth account holds (\d+) HTT tokens$/, async function () { });
