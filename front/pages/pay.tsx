import { useState, useEffect, useMemo,useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Link from 'next/link'
import { useRouter } from 'next/router';
import styles from '../styles/Pay.module.css';
import { Program, Provider, BN, utils, web3 } from '@coral-xyz/anchor';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'
import { TOKEN_METADATA_PROGRAMID, RECIPIENT_ID, MINT_SEEDs, PROGRAM_ID,API_URL } from '../constant/const'
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { hasLogin,getAddress ,RainbowKitKey} from '../utils/util';
import TronWeb from 'tronweb'

const Pay: NextPage = () => {
  const [showDetail, setShowDetail] = useState(false)
  const [cartList, setCartList] = useState([])
  const [detail, setDetail] = useState([])
  const router = useRouter()
  // const { connection } = useConnection();
  // const wallet = useWallet()
  const headerRef = useRef()

  useEffect(() => {
    const listIds = []
    let list = localStorage.getItem('cartList')
    if (cartList) {
      list = JSON.parse(list) || []
    } else {
      list = []
    }
    list?.map(item => {
      listIds.push({
        NFTId: item.NFTId,
        quantity: item.num
      })
    })
    setCartList(list)
    //TODO，调接口
    fetch(`${API_URL}/routes`, {
      method: 'POST',
      body: JSON.stringify(listIds),
      headers: {
        'content-type': 'application/json'
      }
    }).then(response => {
      return response.json()
    }).then(res => {
      if (res.code == 0) {
        setDetail(res.data.routes)
      } else {
        alert(res.msg)
      }
    })
  }, [])


  const onChangeDetail = () => {
    setShowDetail(!showDetail)
  }

  //支付
  const onPay = async (route, tokenToBuy) => {
    const payInfo: any = []
    const items: any = []

    cartList?.map(item => {
      payInfo.push({
        userAddress: getAddress(),
        NFTId: item.NFTId,
        quantity: item.num,
        price: detail[route]?.totalPrice,
        token: detail[route]?.totalToken
      })
      items.push({
        URL: item.URL,
        name: item.name
      })
    })
    try {
      console.log('window.pg::::',window.pg)
      if(!hasLogin()){
        alert('Please connect wallet!')
        return
      }
      //TODO,联调合约
      //可以在此初始化
      const fullNode = 'https://api.trongrid.io';
    const solidityNode = 'https://api.shasta.trongrid.io';
    const eventServer = 'https://api.shasta.trongrid.io';
    const privateKey = '';
    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

    const tokenAddress = getAddress();
    console.log('tronWeb.trx.defaultAddress.base58:::',tronWeb.trx,tronWeb.trx.tronWeb.defaultAddress.base58)
      // const METADATA_SEED = "metadata";
      // const TOKEN_METADATA_PROGRAM_ID = new PublicKey(TOKEN_METADATA_PROGRAMID);
      // const payer = window.pg.userKey //pg.wallet.publicKey;
      // const programId = window.pg.programID // window.pg.programId//new PublicKey(PROGRAM_ID)
      // console.log('programId>>>>>>>>>>', window, window.pg, window.pg.programID, payer)
      // let mintPDAs: any = [];
      // let pricePDAs: any = [];
      // let metadataAddresses: any = [];

      // for (let i = 0; i < MINT_SEEDs.length; i++) {
      //   let [mint] = web3.PublicKey.findProgramAddressSync(
      //     [Buffer.from(MINT_SEEDs[i])],
      //     programId
      //   );
      //   mintPDAs.push(mint);
      //   let [pricePDA] = web3.PublicKey.findProgramAddressSync(
      //     [Buffer.from(MINT_SEEDs[i] + "-price")],
      //     programId
      //   );
      //   pricePDAs.push(pricePDA);
      // }


      // const destinationCredit = utils.token.associatedAddress({
      //   mint: mintPDAs[0],
      //   owner: payer,
      // });

      // const destination1 = utils.token.associatedAddress({
      //   mint: mintPDAs[1],
      //   owner: payer,
      // });

      // const destination2 = utils.token.associatedAddress({
      //   mint: mintPDAs[2],
      //   owner: payer,
      // });

      // const destination3 = utils.token.associatedAddress({
      //   mint: mintPDAs[3],
      //   owner: payer,
      // });

      // const recipient = new web3.PublicKey(RECIPIENT_ID); //

      // const credit_recipient = utils.token.associatedAddress({
      //   mint: mintPDAs[0],
      //   owner: recipient,
      // });

      // const context = {
      //   mintCredit: mintPDAs[0],
      //   destinationCredit: destinationCredit,

      //   mint1: mintPDAs[1],
      //   destination1: destination1,
      //   ftPrice1: pricePDAs[1],

      //   mint2: mintPDAs[2],
      //   destination2: destination2,
      //   ftPrice2: pricePDAs[2],

      //   mint3: mintPDAs[3],
      //   destination3: destination3,
      //   ftPrice3: pricePDAs[3],

      //   payer: payer,

      //   solRecipient: recipient,
      //   creditRecipient: credit_recipient,

      //   rent: web3.SYSVAR_RENT_PUBKEY,
      //   systemProgram: web3.SystemProgram.programId,
      //   tokenProgram: utils.token.TOKEN_PROGRAM_ID,
      //   associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
      // };

      // console.log('context::::', context)
   
      // const cartItem1_num = cartList.filter(item=>item.NFTId === '00001')[0]?.num || 0
      // const cartItem2_num = cartList.filter(item=>item.NFTId === '00002')[0]?.num || 0
      // const cartItem3_num = cartList.filter(item=>item.NFTId === '00003')[0]?.num || 0
      // console.log('buyFt:',{
      //   c1:cartItem1_num,
      //   c2:cartItem2_num,
      //   c3:cartItem3_num,
      //   r:route == 0 ? false : true,
      //   t:tokenToBuy
      // })
      // //TODO
      // const txHash =  await window.pg.program.methods
      //   .buyFt([new BN(cartItem1_num), new BN(cartItem2_num), new BN(cartItem3_num)], route == 0 ? false : true, new BN(tokenToBuy))
      //   .accounts(context)
      //   .rpc({
      //     skipPreflight: true,
      //   });
      // console.log('结果--txHash:', txHash)
      // await connection.confirmTransaction(txHash);

      // if(!txHash){
      //   alert('Pay Failed！Please retry')
      //   return
      // }
      const txHash = '1111'
      const detailInfo = {
        time: new Date().toDateString(),
        orderNum: txHash,
        totalPrice: detail[route]?.totalPrice,
        items,
        points: 15
      }
      localStorage.setItem('orderInfo', JSON.stringify(payInfo))
      localStorage.setItem('orderDetailInfo', JSON.stringify(detailInfo))
      router.push('/order')
      console.log('headerRef;::',headerRef.current.fetchLogin())
      //TODO 支付后清除
      localStorage.removeItem('cartList')
    } catch (e) {

    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Pay</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {/* <WalletContextProvider> */}
      <main className={styles.main}>
        <Header ref={headerRef}/>

        <div className={styles.pay}>
          <div className={styles.pay_left}>
            <div className={styles.title}>Items</div>
            <div className={styles.pay_list}>
              {
                cartList.map(item => {
                  return (
                    <div className={styles.pay_list_item} key={item.NFTId}>
                      <img src={item.URL} alt="" />
                      <div className={styles.pay_list_item_content}>
                        <div className={styles.name}>{item.name}</div>
                        <div className={styles.sub_name}>{item.description}</div>
                        <div className={styles.price}>{item.price} SOL</div>
                        <div className={styles.price}>x{item.num}</div>
                      </div>
                    </div>
                  )
                })
              }

            </div>
            <div className={styles.pay_total}>Total: {detail[2]?.totalRawPrice || 0} SOL</div>
          </div>
          <div className={styles.pay_right}>
            <div className={styles.title}>Payment</div>
            <div className={styles.pay_metana} onClick={onChangeDetail}>
              Pay ~{detail[2]?.totalPrice || 0} SOL with Metana
              <span className={!showDetail ? styles.arrow_up : styles.arrow_down}></span>
            </div>
            <div className={!showDetail ? styles.pay_detail : styles.pay_detail_hide}>
              <div>Details: </div>
              <div>
              original price: {detail[2]?.totalRawPrice || 0} SOL
              </div>
              <div>
                discount: {detail[2]?.totalDiscountPrice || 0} SOL
              </div>
              <div>
              you pay: {detail[2]?.totalPrice || 0} SOL
              </div>
              <div className={styles.pay_metana_btn} onClick={() => { onPay(2, detail[2]?.tokenToBuy) }}>Continue to pay <i className='iconfont icon-zhixiang-you'></i></div>
            </div>
            <div className={styles.pay_cart} onClick={() => { onPay(0, detail[0]?.tokenToBuy) }}>Pay ~{detail[0]?.totalPrice||0} SOL with card </div>
            <div className={styles.pay_cart} onClick={() => { onPay(1, detail[1]?.tokenToBuy) }}>Pay ~{detail[1]?.totalPrice||0} SOL with token </div>
          </div>
        </div>

      </main>
      {/* </WalletContextProvider> */}
    </div>
  );
};

export default Pay;
