
const RainbowKitKey = '-walletlink:https://www.walletlink.org:Addresses'

const getAddress=()=>{
  return localStorage.getItem(RainbowKitKey)
}
const hasLogin = ()=>{
  const address = getAddress()

  return address
}



export {
  hasLogin,
  getAddress,
  RainbowKitKey
}