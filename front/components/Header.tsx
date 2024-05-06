import { useState, useEffect,useCallback ,forwardRef,useImperativeHandle} from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { hasLogin,getAddress ,RainbowKitKey} from '../utils/util';
import styles from '../styles/Header.module.css';
import React from 'react';
import { useAccount } from 'wagmi'
import Image from 'next/image';
import { PROGRAM_ID, PREFLIGHTCOMMITMENT, MINT_SEEDs, TOKEN_METADATA_PROGRAMID ,API_URL} from '../constant/const'
import TronWeb from 'tronweb'

const myLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

function Header({ source, cart,onDelete }:any,ref) {

  const [showCartDialog, setShowCartDialog] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [cartList, setCartList] = useState([])
  const [account,setAccount] = useState({})
  const router = useRouter()
  const { address, isConnected } = useAccount()

  useEffect(()=>{
    console.log(90000000,source,isConnected,address)
    if(!isConnected ){
      localStorage.removeItem('accountInfo')
      localStorage.removeItem(RainbowKitKey)
      setAccount({})
      return 
    }
    let accountInfo = localStorage.getItem('accountInfo') as any
    if(accountInfo){
      accountInfo = JSON.parse(accountInfo)||{}
    }else{
      accountInfo = {}
    }
    localStorage.setItem(RainbowKitKey, `${address}`)
    console.log(accountInfo,'::::::::')
    if(accountInfo.userAddress){
      setAccount(accountInfo)
      return
    }
    const userAddress = getAddress() || address
    console.log(userAddress,'>>>>>>>>')
    
    fetchLogin(userAddress)
  },[ address, isConnected ])

  
  const fetchLogin = (userAddress)=>{
    fetch(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        userAddress: userAddress,
        token: userAddress
      }),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json()
    }).then(res => {
      if (res.code == 0) {
        setAccount(res.data)
        localStorage.setItem('accountInfo', JSON.stringify(res.data))
        localStorage.setItem(RainbowKitKey, `${address}`)
      }
    })
  }

  useImperativeHandle(ref, () => ({
    fetchLogin: fetchLogin
  }));


  useEffect(() => {
    let list = localStorage.getItem('cartList') as any
    if (list) {
      list = JSON.parse(list)
    } else {
      list = []
    }
    let num = 0
    list.map(item => {
      num += item.price * item.num
    })
    setCartList(list)
    setTotalPrice(Math.round(num * 1000000000) / 1000000000)
  }, [cart])

  const onOpenDialog = async () => {
    if (!source) return
    setShowCartDialog(!showCartDialog)
  }

  const onCloseDialog = () => {
    setShowCartDialog(false)
  }


  useEffect(()=>{
    
  },[])

  const onToPay = () => {
    if (!hasLogin()) {
      alert('please connect wallet!')
      return
    }
    if (!cartList.length) {
      alert('please add cart!')
      return
    }
    
    console.log('等待中....')
    router.push('/pay')
  }

  const onDisconnect = (e) => {
    localStorage.removeItem('accountInfo')
    localStorage.removeItem(RainbowKitKey)
    // localStorage.setItem('autoConnect',false)
    setAccount({})
  }


  return (
    <div className={styles.header}>
    <div className={styles.left}><Link href={{ pathname: '/' }}><img src="https://raw.githubusercontent.com/1va7/BlockTargeter/main/Logo%20color.png" alt="" /></Link></div>
    <div className={styles.right}>
      <div className={styles.connect}>
      <ConnectButton label='Connect Wallet'/>
        {/* {
          account.userAddress?<WalletDisconnectButton onClick={onDisconnect}/>:<WalletMultiButton />
        } */}
        {
          account.userAddress ? <div className={styles.account}>
            {
              account?.assets?.map(item => {
                return <span key={item.asset}>
                  {item.quantity} {item.asset}
                </span>
              })
            }
          </div> : ''
        }
      </div>
      <div className={styles.cart} onClick={onOpenDialog} id='shopCart'>
        <img className={styles['cart-icon']} src='https://www.shilingou.cn:9801/temp/image_2.png' />
        <span className={styles['cart-num']}>({cartList.length})</span>
        {
          source && <div className={styles['cart-down']}>
            <div className={styles['cart-title']}>
              <div>My Cart ({cartList.length})</div>
              {/* <span onClick={onCloseDialog}>X</span> */}
            </div>
            <div className={styles['cart-list']}>
              {
                cartList.length ? <>
                  {
                    cartList.map(item => {
                      return (
                        <div className={styles['cart-item']} key={item.NFTId}>
                          <Image src={item.URL} alt="" width={160} height={160} loader={myLoader} />
                          <div className={styles['cart-item-content']}>
                            <div className={styles['name']}>{item.name}</div>
                            <div className={styles['sub-name']}>{item.description}</div>
                            <div className={styles['price']}>{item.price} SOL</div>
                          </div>
                          <div className={styles['cart-delete']}>
                            <span className={styles['cart-item-num']}>x{item.num}</span>
                            <i onClick={() => { onDelete(item.NFTId) }} className='iconfont icon-shanchuanniu'></i>
                          </div>
                        </div>
                      )
                    })
                  }
                </> : <div className={styles.no_data}><i className='iconfont icon-gouwuchehuanshikongde'></i> <div>No Data</div></div>
              }

            </div>
            <div className={styles['total']}>Total: {totalPrice} SOL</div>
            <div className={styles['cart-footer']}>
              <div className={styles['footer-btn']} id='pay' onClick={onToPay}>Continue to payment</div>
            </div>
          </div>
        }
      </div>
    </div>

  </div>
  );
}

export default forwardRef(Header);
