import { useState ,useEffect} from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import Link from 'next/link'
import { API_URL } from '../constant/const';
import styles from '../styles/Order.module.css';

const Order: NextPage = () => {

  const [detailInfo,setDetailInfo] = useState({})

  useEffect(()=>{
    let oderInfo = localStorage.getItem('orderInfo')
    fetch(`${API_URL}/save`,{
      method:'POST',
      body:oderInfo,
      headers:{
        'content-type':'application/json'
      }
    }).then(response=>{
      return response.json()
    }).then(res=>{
      if(res.code ==0){
        localStorage.removeItem('orderInfo')
      }
    })
  },[])

  useEffect(()=>{
    let detail = localStorage.getItem('orderDetailInfo')
    if(detail){
      detail = JSON.parse(detail)
    }else{
      detail={}
    }
    setDetailInfo(detail)
  },[])

  return (
    <div className={styles.container}>
      <Head>
        <title>Pay</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {/* <WalletContextProvider> */}
      <main className={styles.main}>
        <Header />
        <div className={styles.order}>
          <div className={styles.title}>Confirmation&gt;Order Details</div>
          <div className={styles.order_info}>Order Completed! Order:{detailInfo.orderNum}</div>
          {/* <div className={styles.sub_info}>You Earned {detailInfo.points} Points!</div> */}
          <div className={styles.order_desc}>Thank you for placing your order. Your order has been successfully processed.</div>
          <div className={styles.order_date}>{detailInfo.time}</div>

          <div className={styles.order_btns}>
          <Link href={{ pathname: '/'}}>
            <div className={styles.order_continue}>Continue Shopping</div>
          </Link>
            
            {/* <div className={styles.order_history}>View Order History</div> */}
          </div>
          <div className={styles.sub_title}>Order Summary</div>
          <div className={styles.items_img}>
            {
              detailInfo?.items?.map(item=>{
                return  <img key={item.NFTId} src={item.URL} alt="" />
              })
            }
          </div>
          <div className={styles.items_info}>
            <div>Order: {detailInfo.orderNum}</div>
            <div>
            Items: {
               detailInfo?.items?.map(item=>{
                return  <span key={item.NFTId}>{item.name} ; </span>
              })
              
            }
            </div>
            <div>
            Payment Method: METANA
            </div>
            <div>
            Total: {detailInfo.totalPrice} SOL
            </div>
          </div>
        </div>
      </main>
      {/* </WalletContextProvider> */}
    </div>
  );
};

export default Order;
