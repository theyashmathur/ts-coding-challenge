import { Given, Then, When, setDefaultTimeout } from "@cucumber/cucumber";
import { accounts } from "../../src/config";
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  Key,
  PrivateKey,
  TokenCreateTransaction,
  TokenId,
  TokenInfoQuery,
  TokenType,
} from "@hashgraph/sdk";
import assert from "node:assert";

setDefaultTimeout(60 * 1000);

const client = Client.forTestnet();
let tokenID: any;

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
    .setAdminKey(adminKey);

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

Then(/^The token is owned by the account$/, async function (owner: Key) {
  const tokenId = TokenId.fromString(tokenID);
  const token = await new TokenInfoQuery()
    .setTokenId(tokenId)
    .execute(client);
  console.log(owner, "OWNER")

  const tokenOwner = token.adminKey;
  console.log("Ownerkey: ", tokenOwner);
  assert.equal(tokenOwner, owner);
});

Then(/^An attempt to mint (\d+) additional tokens succeeds$/, async function () { });
When(
  /^I create a fixed supply token named Test Token \(HTT\) with (\d+) tokens$/,
  async function () { }
);
Then(/^The total supply of the token is (\d+)$/, async function () { });
Then(/^An attempt to mint tokens fails$/, async function () { });
Given(
  /^A first hedera account with more than (\d+) hbar$/,
  async function () { }
);
Given(/^A second Hedera account$/, async function () { });
Given(
  /^A token named Test Token \(HTT\) with (\d+) tokens$/,
  async function () { }
);
Given(/^The first account holds (\d+) HTT tokens$/, async function () { });
Given(/^The second account holds (\d+) HTT tokens$/, async function () { });
When(
  /^The first account creates a transaction to transfer (\d+) HTT tokens to the second account$/,
  async function () { }
);
When(/^The first account submits the transaction$/, async function () { });
When(
  /^The second account creates a transaction to transfer (\d+) HTT tokens to the first account$/,
  async function () { }
);
Then(
  /^The first account has paid for the transaction fee$/,
  async function () { }
);
Given(
  /^A first hedera account with more than (\d+) hbar and (\d+) HTT tokens$/,
  async function () { }
);
Given(
  /^A second Hedera account with (\d+) hbar and (\d+) HTT tokens$/,
  async function () { }
);
Given(
  /^A third Hedera account with (\d+) hbar and (\d+) HTT tokens$/,
  async function () { }
);
Given(
  /^A fourth Hedera account with (\d+) hbar and (\d+) HTT tokens$/,
  async function () { }
);
When(
  /^A transaction is created to transfer (\d+) HTT tokens out of the first and second account and (\d+) HTT tokens into the third account and (\d+) HTT tokens into the fourth account$/,
  async function () { }
);
Then(/^The third account holds (\d+) HTT tokens$/, async function () { });
Then(/^The fourth account holds (\d+) HTT tokens$/, async function () { });
