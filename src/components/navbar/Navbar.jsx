import "./navbar.scss";
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
// import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
// import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import Conversation from "../conversation/Conversation";
import Message from "../message/Message";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext,useState,useEffect,useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link} from "react-router-dom";
import axios from 'axios'
import {url} from '../../config.js'
import {socketCient} from '../../config.js'
import {useDispatch,useSelector} from 'react-redux' // redux 
import{SearchDataSelector} from '../../redux/selector' 
const Navbar = () => {
  let socket = socketCient();
  const { dispatch } = useContext(DarkModeContext); // lấy mỗi hàm dispatch 
  const { user } = useContext(AuthContext);
  const [openListNotification,setOpenListNotification] = useState(false);
  const Data = useSelector(SearchDataSelector);
  const scrollRef = useRef();
  const dispatchredux = useDispatch();  
  // const [chatOption,setChatOption] = useState("");  // sendNormal or 
  const [messToSend,setMessToSend] = useState("");
  // flag to scroll down 
  const [flagScrollDown, setFlagScrollDown] = useState(0);
  useEffect(() => {
    const takeData= async()=>{ 
      const res2 = await axios.get(`${url()}/notifications/TakeNotificationByUserId/${user._id}`); // gửi token để check 
      if(res2 &&(res2.data) && res2.data.data){
         console.log(res2.data.data)
         dispatchredux({type: "LISTNOTIFICATION", payload: { listNotification:res2.data.data }});
      };
      axios.get(`${url()}/orders/takelistorderbyownerid/orderpage/${user._id}/Pending`).then((listOrder)=>{
          if(listOrder && listOrder.data && listOrder.data.length){
              dispatchredux({type: "LISTORDERPENDING", payload: { listOrder:listOrder.data }});
          }
      }).catch((e)=>{ console.log("lỗi lấy danh sách đơn hàng pending",e)});

      axios.post(`${url()}/conversations/getListConvByUserId`,{userId:user._id}).then((res)=>{
        if(res && res.data && res.data.data){
          // console.log("Dữ liệu conv",res.data.data);
          dispatchredux({type: "LISTCONV", payload: { listConv:res.data.data }});
          dispatchredux({type: "COUNTCONVERSATIONUNREADER", payload: { count:res.data.data.filter((e)=> Number(e.unReader) === 1).length }});
        }
      }).catch((e)=>{
        console.log(e)
      })
    }
    if(user){
      takeData();
    };
    socket.on("notification",(data,additionalInfor)=>{
      dispatchredux({type: "ADDNOTIFICATION", payload: { newNotification:data }});
      if(additionalInfor && String(additionalInfor.Type) === "NewOrder" && additionalInfor.IdOrder){
           axios.get(`${url()}/orders/TakeOrderById/${additionalInfor.IdOrder}`).then((order)=>{
               if(order && order.data && order.data.data && order.data.data._id){
                  dispatchredux({type: "ADDORDERPENDING", payload: { newOrder:order.data.data }});
               }
           }).catch((e)=>{
              console.log("Lỗi lấy dữ liệu đơn hàng mới khi nhận được thông báo",e)
           });
      }
    });
    socket.on("sendMessage",(mess)=>{
      let update_cov = {};
      update_cov.unReader=1;
      // console.log("Dữ liệu nhận được",mess);
      dispatchredux({type: "ADDMESS", payload: { newMess:mess }});
    });
    socket.on('DeleteMessage',(convId,messId)=>{
        let arr = Data.listMess.filter((e) => String(e.messageId) !== String(messId));
        dispatchredux({type: "LISTMESS", payload: { listMess:arr }});
    })
  },[dispatchredux,socket,user,Data.listMess])
  


  const ReadNotification = (id)=>{
    try{
      dispatchredux({type: "READNOTIFICATION", payload: { idNotify:id }});
      axios.get(`${url()}/notifications/ReadNotification/${id}`)
    }
    catch(e){
       console.log(e)
    }
  }
  const handleOpenChat = ()=>{
    try{
      dispatchredux({type: "OPENCLOSECHAT", payload: { status:true }});
      axios.post(`${url()}/conversations/getListConvByUserId`,{userId:user._id}).then((res)=>{
        // console.log(res.data)
        if(res && res.data && res.data.data){
          dispatchredux({type: "LISTCONV", payload: { listConv:res.data.data }});
          dispatchredux({type: "COUNTCONVERSATIONUNREADER", payload: { count:res.data.data.filter((e)=> Number(e.unReader) === 1).length }});
        }
      }).catch((e)=>{
        console.log(e)
      })
    }
    catch(e){
       console.log(e)
    }
  }
  const handleStartChat = (idconv)=>{
    try{ 
       dispatchredux({type: "CHANGECHATMODE", payload: { chatMode:true }});
       let convChoose = Data.listConv.find((e)=> String(e._id) === String(idconv));
       if(convChoose){
          axios.post(`${url()}/conversations/LoadMessage`,{
            conversationId:idconv,
            userId:user._id,
            isDevide:true,
            loaded:0
          }).then((res)=>{
              if(res.data && res.data.data){
                let arr_messages = [];
                for(let i=res.data.data.length-1; i>=0; i--){
                  arr_messages.push(res.data.data[i])
                };
                dispatchredux({type: "LISTMESS", payload: { listMess:arr_messages }});
                setFlagScrollDown(flagScrollDown+1);
              }
          }).catch((e)=>{
            console.log(e)
          });
          if(String(convChoose.unReader) === 1){
            dispatchredux({type: "CHANGECONVERSATIONUNREADER", payload: { count:-1 }});
          }
          let update_cov = {};
          update_cov.timeLastMessage = convChoose.timeLastMessage;
          update_cov.unReader=0;
          update_cov.memberList=convChoose.memberList;
          update_cov.messageList=convChoose.messageList;
          dispatchredux({type: "UPDATELISTCONV", payload: { idconv:idconv, updateConv:update_cov }});
          dispatchredux({type: "CHOOSECONV", payload: { conversationChosen:convChoose }})
       }
    }catch(e){
      console.log(e)
    }
  }

  const SendMessage = (e)=>{
    try{
      if (String(e.key) === "Enter") {
          setMessToSend("");
          let mess = {
             conversationId:Data.conversationChosen._id,
             messageId:`${(new Date().getTime() * 10000) + 621355968000000000 +8}_${user._id}`,
             message:e.target.value,
             senderId: user._id,
             emotion:[],
             createAt:new Date(),
             receiverId: Data.conversationChosen.memberList[0].memberId
          };
          dispatchredux({type: "ADDMESS", payload: { newMess:mess }});
          axios.post(`${url()}/conversations/SendMessage`,mess).catch((e)=>{console.log(e)});
          socket.emit("sendMessage",Data.conversationChosen.memberList[0].memberId,mess);
          setFlagScrollDown(flagScrollDown+1);
      }
    }
    catch(e){
      console.log(e)
    }
  }

  const handleScroll = event => {
    try{
      if(Number(event.currentTarget.scrollTop) === 0){
           console.log("Data transform",Data.countLoadedMessage)
           axios.post(`${url()}/conversations/LoadMessage`,{
               conversationId:Data.conversationChosen._id,
               userId:user._id,
               isDevide:true,
               loaded:Data.countLoadedMessage
           }).then((res)=>{
              if(res && res.data && res.data.data && (res.data.data.length > 0)){
                if(res.data && res.data.data){
                  let arr_messages = [];
                  
                  for(let i=res.data.data.length-1; i>=0; i--){
                    arr_messages.push(res.data.data[i])
                  };
                  dispatchredux({type: "LOADMESS", payload: { listMess:arr_messages }});
                  scrollRef.current.scrollIntoView({ 
                    behavior: 'smooth', block: 'center'
                  });
                }
              }
            }).catch((e)=>{console.log(e)})
        }
      }
      catch(e){
        console.log(e)
      }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });// đoạn code để trượt xuống khi có tin nhắn mới 
  }, [flagScrollDown]);


  const BrokenImage ="https://dvdn247.net/wp-content/uploads/2020/07/avatar-mac-dinh-1.png";
  const imageOnError = (event) => {
    event.currentTarget.src = BrokenImage;
    event.currentTarget.className = "avatar";
  };
  return (
    <div className="navbar">
      <div className="wrapper">
        <div className="search">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="items">
          <div className="item">
            <DarkModeOutlinedIcon
              className="icon"
              onClick={() => dispatch({ type: "TOGGLE" })}
            />
          </div>
          <div className="item">
            <NotificationsNoneOutlinedIcon onClick={()=>setOpenListNotification(true)} className="icon" />
            {
              (Data && Data.listNotification && Data.listNotification.length && (Data.listNotification.filter(e=>Number(e.Status)=== 1).length>0)) && (
                <div className="counter">
                      {[...new Map(Data.listNotification.map((item) => [item["_id"], item])).values()].filter(e=>Number(e.Status)=== 1).length}
                </div>
              )
            }
          </div>
          <div onClick={()=>handleOpenChat()} className="item">
            <ChatBubbleOutlineOutlinedIcon className="icon" />
            <div className="counter">{Data.countConversationUnreader}</div>
          </div>
          <Link to={`/users/${user._id}`} style={{textDecoration: "none"}}  className="link">
              <div className="item">
                <img
                  src={user.img}
                  alt=""
                  className="avatar"
                  onError={imageOnError}
                />
              </div>        
          </Link>
        </div>
      </div>
      {
        (openListNotification) && (
          <div className="notification_list">
                <div className="notification_list_title">
                      List Notification
                </div>
                {/* <NotificationsActiveIcon/> */}
                <div className="notification_list_wrapper">
                {      
                       [...new Map(Data.listNotification.map((item) => [item["_id"], item])).values()].map((notification,index)=>
                          (
                            <div key={index}  className="notification_list_ele_wrapper">
                              {
                                 (  Number(notification.Status) === 1) ?(
                                    <div onClick={()=>ReadNotification(notification._id)}>
                                      { 
                                        ((String(notification.type) === "ReceiveOrder") || (String(notification.type) ==="AcceptOrder") || (String(notification.type) === "DenyOrder")) && (
                                          <Link to={`/orders`} style={{textDecoration: "none", color:"white",fontSize:"15px"}}>
                                              <div style={{backgroundColor:"rgba(46, 138, 231, 0.6)"}} className="notification_list_ele">
                                                  <div className="notification_list_ele_icon">
                                                        <NotificationsActiveIcon />
                                                  </div>
                                                  <div className="notification_list_ele_content">
                                                        {notification.content}
                                                  </div>
                                                  <div className="notification_list_ele_day">
                                                       {new Date(notification.createAt).getDate()} Th{new Date(notification.createAt).getMonth() +1} {new Date(notification.createAt).getHours()}:{new Date(notification.createAt).getMinutes()}
                                                  </div>
                                              </div>
                                          </Link>
                                        ) 
                                      }
                                      {
                                        (String(notification.type) === "CommentHotel") && (
                                                 <Link to={`/hotels/${notification.hotelId}`} style={{textDecoration: "none", color:"white",fontSize:"15px"}}>
                                                      <div style={{backgroundColor:"rgba(46, 138, 231, 0.6)"}} className="notification_list_ele">
                                                          <div className="notification_list_ele_icon">
                                                                <NotificationsActiveIcon />
                                                          </div>
                                                          <div className="notification_list_ele_content">
                                                                {notification.content}
                                                          </div>
                                                          <div className="notification_list_ele_day">
                                                              {new Date(notification.createAt).getDate()} Th{new Date(notification.createAt).getMonth() +1} {new Date(notification.createAt).getHours()}:{new Date(notification.createAt).getMinutes()}
                                                          </div>
                                                      </div>
                                                  </Link>
                                        )
                                      }
                                      {
                                        (String(notification.type) === "CommentRoom") && (
                                                  <Link to={`/rooms/${notification.roomId}`} style={{textDecoration: "none", color:"white",fontSize:"15px"}}>
                                                              <div style={{backgroundColor:"rgba(46, 138, 231, 0.6)"}} className="notification_list_ele">
                                                                  <div className="notification_list_ele_icon">
                                                                        <NotificationsActiveIcon />
                                                                  </div>
                                                                  <div className="notification_list_ele_content">
                                                                        {notification.content}
                                                                  </div>
                                                                  <div className="">
                                                                      {new Date(notification.createAt).getDate()} Th{new Date(notification.createAt).getMonth() +1} {new Date(notification.createAt).getHours()}:{new Date(notification.createAt).getMinutes()}
                                                                  </div>
                                                              </div>
                                                  </Link>
                                        )
                                      }
                                    </div>
                                 ):(
                                    <>
                                      { 
                                          ((String(notification.type) === "ReceiveOrder") || (String(notification.type) ==="AcceptOrder") || (String(notification.type) ==="DenyOrder")) && (
                                            <Link to={`/orders`} style={{textDecoration: "none", color:"white",fontSize:"15px"}}>
                                                <div  className="notification_list_ele">
                                                    <div className="notification_list_ele_icon">
                                                          <NotificationsActiveIcon />
                                                    </div>
                                                    <div className="notification_list_ele_content">
                                                          {notification.content}
                                                    </div>
                                                    <div className="notification_list_ele_day">
                                                         {new Date(notification.createAt).getDate()} Th{new Date(notification.createAt).getMonth() +1} {new Date(notification.createAt).getHours()}:{new Date(notification.createAt).getMinutes()}
                                                    </div>
                                                </div>
                                            </Link>
                                          ) 
                                        }
                                        {
                                          (String(notification.type) === "CommentHotel") && (
                                                  <Link to={`/hotels/${notification.hotelId}`} style={{textDecoration: "none", color:"white",fontSize:"15px"}}>
                                                        <div  className="notification_list_ele">
                                                            <div className="notification_list_ele_icon">
                                                                  <NotificationsActiveIcon />
                                                            </div>
                                                            <div className="notification_list_ele_content">
                                                                  {notification.content}
                                                            </div>
                                                            <div className="notification_list_ele_day">
                                                                 {new Date(notification.createAt).getDate()} Th{new Date(notification.createAt).getMonth() +1} {new Date(notification.createAt).getHours()}:{new Date(notification.createAt).getMinutes()}
                                                            </div>
                                                        </div>
                                                    </Link>
                                          )
                                        }
                                        {
                                          (String(notification.type) === "CommentRoom") && (
                                                    <Link to={`/rooms/${notification.roomId}`} style={{textDecoration: "none", color:"white",fontSize:"15px"}}>
                                                                <div  className="notification_list_ele">
                                                                    <div className="notification_list_ele_icon">
                                                                          <NotificationsActiveIcon />
                                                                    </div>
                                                                    <div className="notification_list_ele_content">
                                                                          {notification.content}
                                                                    </div>
                                                                    <div className="notification_list_ele_day">
                                                                        {new Date(notification.createAt).getDate()} Th{new Date(notification.createAt).getMonth() +1} {new Date(notification.createAt).getHours()}:{new Date(notification.createAt).getMinutes()}
                                                                    </div>
                                                                </div>
                                                    </Link>
                                          )
                                        }
                                    </>
                                 )
                              }
                              <hr  width="100%" align="center" />
                            </div>
                          )
                        )
                      }
                </div>
            </div>
        )
      }
      {
          Data.isOpenChat && (
            <div className="box_chat">
                {
                  (Data.chatMode) && (
                    <div 
                       onClick={()=>{
                          dispatchredux({type: "CHANGECHATMODE", payload: { chatMode:false }});
                          // setChatOption("");
                          axios.post(`${url()}/conversations/getListConvByUserId`,{userId:user._id}).then((res)=>{
                            if(res && res.data && res.data.data){
                              // console.log("Dữ liệu conv",res.data.data);
                              dispatchredux({type: "LISTCONV", payload: { listConv:res.data.data }});
                              dispatchredux({type: "COUNTCONVERSATIONUNREADER", payload: { count:res.data.data.filter((e)=> Number(e.unReader) === 1).length }});
                            }
                          }).catch((e)=>{
                            console.log(e)
                          })
                       }}
                       className="back_to_list_conv">
                       <AssignmentReturnIcon />
                    </div>
                  )
                }
                {
                  (!Data.chatMode) && (
                    <div className="list_conversation">
                        <div className="list_conversation_wrapper">
                            {
                              [...new Map(Data.listConv.sort((a,b)=>{
                                  if (new Date(a.timeLastMessage) > new Date(b.timeLastMessage)) {
                                    return -1;
                                  }
                                  if (new Date(a.timeLastMessage) < new Date(b.timeLastMessage)) {
                                    return 1;
                                  }
                                  return 0;
                                }).map((item) => [item["_id"], item])).values()].map((item,index)=>(
                                <div key={index} onClick={()=>handleStartChat(item._id)} >
                                    <Conversation  dataConv={item}/>
                                </div>
          
                              ))
                            }
                        </div>
                    </div>
                  )
                }
                {
                  (Data.chatMode) && (
                    <div className="message-box">
                          <div className="message_list_wrapper" onScroll={(e)=>handleScroll(e)}>
                              { 
                                [...new Map(Data.listMess.map((item) => [item["messageId"], item])).values()]
                                  .sort((a,b)=>{
                                          if (new Date(a.createAt) < new Date(b.createAt)) {
                                            return -1;
                                          }
                                          else{
                                            return 1;
                                          }
                                        })
                                  .map((item,index)=>(
                                  <div ref={scrollRef}  key={index}>
                                      <Message 
                                          dataMess={item} 
                                          dataConv={Data.conversationChosen} 
                                      />
                                  </div>
                                ))
                              }
                          </div>
                          <div className="message-box-input-wrapper">
                              <input 
                                    onChange={(e)=>{setMessToSend(e.target.value)}}
                                    value = {messToSend}
                                    onKeyDown={(e) => SendMessage(e)} 
                                    className="message-box-input" type="text" />
                          </div>
                    </div>
                  )
                }
              
            </div>
          )
        }
      {
        (openListNotification || Data.isOpenChat ) && (
          <div 
             onClick={()=> {
                             setOpenListNotification(false);
                             dispatchredux({type: "OPENCLOSECHAT", payload: { status:false }});
                           }} 
             className="background_blur">
          </div>
        )
      }
    </div>
  );
};

export default Navbar;
