# Created by Micha Roon at 13.06.23
@wip
Feature: Token Service Use Cases
  Demonstration of the understanding of the Hedera Hashgraph Token Service and transaction model

  Scenario: Create a mintable token
    Given A Hedera account with more than 10 hbar
    When I create a token named Test Token (HTT)
    Then The token has the name "Test Token"
    And The token has the symbol "HTT"
    And The token has 2 decimals
    And The token is owned by the account
    And An attempt to mint 100 additional tokens succeeds

  