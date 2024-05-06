import React,{useState,useEffect} from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header'
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import {API_URL} from '../constant/const'

const myLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`
}
// const data = [
//   {
//       "NFTId": "000001",
//       "name": "Twilight Whisper",
//       "price": 0.186,
//       "description": "A cocktail capturing dusk's magic with purple hues, vodka, blackberry liqueur, lime, and a hint of sweetness, garnished with lemon and blackberries.",
//       "URL": "https://va7.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc57373f7-f233-48a8-a7f9-6d04e6ada65f%2Fab7cd2b7-a098-4da5-a36d-65e49407d658%2FNight_Whisper.jpg?table=block&id=2c591cdb-815d-49d3-b9b0-badb59842896&spaceId=c57373f7-f233-48a8-a7f9-6d04e6ada65f&width=1420&userId=&cache=v2",
//       "maxTokenPerNFT": 600
//   },
//   {
//       "NFTId": "000002",
//       "name": "Azure Seascape",
//       "price": 0.121,
//       "description": "A refreshing ocean-inspired cocktail blending clear blue spirits with citrus for a seaside experience. Served in a tall glass with ice, lemon, and mint.",
//       "URL": "https://va7.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc57373f7-f233-48a8-a7f9-6d04e6ada65f%2F3089a216-690d-4424-8e3a-f98f0abdaf3e%2FAzure_Seascape.jpg?table=block&id=3ca62df2-13ac-4a9a-acfe-77fd0f28a222&spaceId=c57373f7-f233-48a8-a7f9-6d04e6ada65f&width=1420&userId=&cache=v2",
//       "maxTokenPerNFT": 600
//   },
//   {
//       "NFTId": "000003",
//       "name": "Blockchain Elixir",
//       "price": 0.234,
//       "description": "A cocktail symbolizing blockchain's structure with layers of vodka, blue curaçao, lemon-lime soda, and edible gold flakes, garnished with a QR code.",
//       "URL": "https://va7.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc57373f7-f233-48a8-a7f9-6d04e6ada65f%2F04902ad3-6d7c-4dc6-9904-f5b56f7006b9%2FNight_Whisper.jpg?table=block&id=af9b0605-894c-454f-91e0-841b0056ccf3&spaceId=c57373f7-f233-48a8-a7f9-6d04e6ada65f&width=660&userId=&cache=v2",
//       "maxTokenPerNFT": 600
//   }
// ]

const Home: NextPage = () => {
  const [cartList,setCartList] = useState([])
  const [goodsList,setGoodsList] = useState([])

  useEffect(()=>{
    fetch(`${API_URL}/goods`,{
      method:'GET',
    }).then(response=>{
      return response.json()
    }).then(res=>{
      if(res.code == 0){
        setGoodsList(res.data)
      }else{
        setGoodsList([])
      }
    })
  },[])

  useEffect(()=>{
    let list = localStorage.getItem('cartList')
    if(list){
      list = JSON.parse(list)||[]
    }else{
      list = []
    }
    setCartList(list)
  },[])

  const onAddCart=(item=>{
    const index= cartList?.findIndex(i=>i.NFTId === item.NFTId)
    let list = [] 
    if(index > -1){
      cartList.map(i=>{
        if(i.NFTId === item.NFTId){
          i.num = i.num+1
        }
        list.push(i)
      })
    }else{
      list = cartList.concat({
        ...item,
        num:1
      })
    }
    setCartList(list)
    localStorage.setItem('cartList',JSON.stringify(list))
   
  })

  const onDelete=(NFTId)=>{
    const list = cartList.filter(item=>item.NFTId !== NFTId)
    setCartList(list)
    localStorage.setItem('cartList',JSON.stringify(list))
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Metana Demo</title>
        <meta
          content="Metana Demo"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      {/* <WalletContextProvider> */}
      <main className={styles.main}>
        <Header source='home' cart={cartList} onDelete={onDelete}/>
        <div className={styles.home}>
        <div className={styles['header-content']}>
      <div className={styles['title']}>Discover</div>
      <div className={styles['sub-title']}>COCKTAILS</div>
      <div className={styles.desc}>Indulge in Mixology Masterpieces.</div>
    </div>
    <div className={styles.list} style={{justifyContent:goodsList.length>4?'start':'space-around'}}>
      {
        goodsList.map(item=>{
          const num = cartList?.filter(i=>i.NFTId === item.NFTId)[0]?.num
          return (
           <>
            <div className={styles.item} key={item.NFTId}>
              <div className={styles.img}>
                <Image src={item.URL} alt="" width={304} height={304} loader={myLoader} />
              </div>
              <div className={styles.name}>{item.name}</div>
              <div className={styles['sub-name']}>{item.description}</div>
              <div className={styles.price}>{`${item.price}`} SOL</div>
              <div className={styles['cart-btn']}  id={`btnCart-${item.NFTId}`} onClick={()=>onAddCart(item)}>
                Add To Cart
                {
                  num ?  <span className={styles['cart-btn-num']}>{num}</span>:''
                }
              </div>
            </div>
           </>
          )
        })
      }
     
    </div>
        </div>
    {/* <div className={styles['more-btn']}>View More</div> */}
      </main>
      {/* </WalletContextProvider> */}
    </div>
  );
};

export default Home;
