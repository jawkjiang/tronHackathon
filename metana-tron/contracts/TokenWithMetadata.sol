// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20TokenWithMetadata is ERC20, Ownable {
    string private _metadata;
    uint256 public  _price = 0;

    event PriceUpdated(uint256 price);

    constructor(string memory name, string memory symbol, string memory metadataUri, uint256 price ) ERC20(name, symbol) Ownable(msg.sender) {
        _metadata = metadataUri;
        _price = price;
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function mint(address to,uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function metadata() public view returns (string memory) {
        return _metadata;
    }

    function setPrice(uint256 _priceIn) public virtual returns (uint256) {
        _price = _priceIn;
        emit PriceUpdated(_price);
        return _price;
    }

    function getPrice() public virtual returns (uint256) {
        return _price;
    }


}