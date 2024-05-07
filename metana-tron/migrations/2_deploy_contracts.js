var MyContract = artifacts.require("./TokenFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(MyContract);
};
