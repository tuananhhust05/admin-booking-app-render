import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Comment from "../../components/comment/Comment";
import StarRateIcon from '@mui/icons-material/StarRate';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Notification from "../../components/notification/Notification";
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLocation, useNavigate ,Link} from "react-router-dom";
import { useEffect, useState,useContext } from "react";
import { useDropzone } from "react-dropzone"
import { AuthContext } from "../../context/AuthContext";
import {url} from '../../config.js'
import {socketCient} from '../../config.js'
import axios from "axios";
import {useSelector,useDispatch} from 'react-redux'
import{SearchDataSelector} from '../../redux/selector'
const Single = () => {
  let socket = socketCient();
  const Data = useSelector(SearchDataSelector);
  const dispatchredux = useDispatch();
  const { user } = useContext(AuthContext);
  const { dispatch } = useContext(AuthContext);
  // chỉ hiển thị thông tin về khách sạn và loại phòng 
  const navigate = useNavigate();
  const location = useLocation(); 
  const path = location.pathname.split("/")[1];
  const id = location.pathname.split("/")[2];  // id khách sạn 

  const [data,setData] = useState({}); // chung => sau đặt lại tên biến
  const [listComment,setListComment] = useState([]);
  const [mediumVote,setMediumVote] = useState(5);
  const [countVote,setCountVote] = useState(0)

  // vote 
  const [listUserVote,setListUserVote] = useState([]);
  const [openListUserVote,setOpenListUserVote] = useState(false);
  const [openListImage,setOpenListImage] = useState(false)
  
  // edit hotel Infomation 
  const [openEditForm,setOpenEditForm] = useState(false);
  
  // data để edit thông tin khách sạn 
  const [dataHotelToEdit,setDataHotelToEdit] = useState({});
  const [dataRoomToEdit,setDataRoomToEdit] = useState({});
  const [dataUserToEdit,setDataUserToEdit] = useState({})
  // nhập phản hồi 
  const [commentReply,setCommentReply] = useState("");

  // edit comment 
  const [commentReplyMode,setCommentReplyMode] = useState("");
  const [commentEdit,setCommentEdit] = useState(null); // là id thôi 
  
  // list user care about thí product 
  const [ listUserCare, setListUserCare] =useState([]);

  // change pass
  const [dataToChangePass,setDataToChangePass] = useState({
    passold:"",
    passnew:"",
    repassnew:""
  })
  const [ openFormChangePass, setOpenFormChangePass] =useState(false);
  const [showNotification,setShowNotification] = useState(false);
  const [contentNotification,setContentNotification]= useState("");

  const [openFormChat,setOpenFormChat]= useState(false);
  // replace element in react array state 
  const EditCommentListState = (idCommentEdit,CommentEdited) => {
    const newState = listComment.map(obj => {
      if (String(obj._id) === String(idCommentEdit)) {
        return CommentEdited;
      }
      return obj;
    });
    setListComment(newState);
  };

  const sendComment = async ()=>{
    try{
      let comment;
      if(String(path) === "hotels"){
        comment = {
          content:commentReply,
          createAt: new Date(),
          emotion:"",
          hotelId:id,
          userId:user._id
        }
      }
      else if(String(path) === "rooms" && data.hotelOwner){
        comment = {
          content:commentReply,
          createAt: new Date(),
          emotion:"",
          hotelId:data.hotelOwner,
          roomId:id,
          userId:user._id
        }
      }
      else if(String(path) === "users"){
        comment = {
          content:commentReply,
          createAt: new Date(),
          emotion:"",
          userIdHostPage:id,
          userId:user._id
        }
      }
      if(String(commentReplyMode) === "editcomment" && commentEdit ){
          if(String(path) === "hotels"){
            let res = await axios.post(`${url()}/comments/EditCommentHotel`,{IdComment:commentEdit,content:commentReply});
            if(res && res.data && res.data.data){
              EditCommentListState(commentEdit,res.data.data);
              setCommentReply("");
              setCommentReplyMode("");
              socket.emit("editcomment",listUserCare.filter((e)=> String(e) !== String(user._id)),res.data.data,"hotels");
            }
          }
          else if(String(path) === "rooms"){
            let res = await axios.post(`${url()}/comments/EditCommentRoom`,{IdComment:commentEdit,content:commentReply});
            if(res && res.data && res.data.data){
              EditCommentListState(commentEdit,res.data.data);
              setCommentReply("");
              setCommentReplyMode("");
              socket.emit("editcomment",listUserCare.filter((e)=> String(e) !== String(user._id)),res.data.data,"rooms");
            }
          }
          else if(String(path) === "users"){
            let res = await axios.post(`${url()}/comments/EditCommentPersonalPage`,{IdComment:commentEdit,content:commentReply});
            if(res && res.data && res.data.data){
              EditCommentListState(commentEdit,res.data.data);
              setCommentReply("");
              setCommentReplyMode("");
            }
          }
      }
      else{
          if(String(path) === "hotels"){
              axios.post(`${url()}/comments/CreateCommentHotel`,comment).then((res,err)=>{
                if(err){
                  console.log("Không thể gửi comment",err)
                }
                else if(res && res.data && res.data.data){
                  setListComment(current => [res.data.data,...current]);
                  setCommentReply("");
                  socket.emit("comment",listUserCare.filter((e)=> String(e) !== String(user._id)),res.data.data,"hotels");
                  for(let i =0; i<listUserCare.length; i++){
                      let newNotification = {
                        content:`You have a new comment in hotel ${data.name}`,
                        userId:listUserCare[i],
                        type:"CommentHotel",
                        hotelId:id,
                        roomId:"",
                      }
                      axios.post(`${url()}/notifications/CreateNotification`,newNotification)
                      .then((notification)=>{
                        if(notification && notification.data && notification.data.data){
                          socket.emit("notification",listUserCare[i],notification.data.data)
                        };
                      })
                      .catch((e)=>{console.log(e)});
                  }
                }
              })
          }
          else if(String(path) === "rooms"){
                axios.post(`${url()}/comments/CommentRoom`,comment).then((res,err)=>{
                  if(err){
                    console.log("Không thể gửi comment",err)
                  }
                  else if(res && res.data && res.data.data){
                    setListComment(current => [res.data.data,...current]);
                    setCommentReply("");
                    socket.emit("comment",listUserCare.filter((e)=> String(e) !== String(user._id)),res.data.data,"rooms");
                    for(let i =0; i<listUserCare.length; i++){
                      let newNotification = {
                        content:`You have a new comment in room ${data.desc} hotel ${data.hotelNameOwn}`,
                        userId:listUserCare[i],
                        type:"CommentRoom",
                        hotelId:data.hotelOwner,
                        roomId:data._id,
                      }
                      axios.post(`${url()}/notifications/CreateNotification`,newNotification)
                      .then((notification)=>{
                        if(notification && notification.data && notification.data.data){
                          socket.emit("notification",listUserCare[i],notification.data.data)
                        };
                      })
                      .catch((e)=>{console.log(e)});
                  }
                  }
                })
          }
          else if(String(path) === "users"){
            axios.post(`${url()}/comments/CreateCommentPersonalPage`,comment).then((res,err)=>{
              if(err){
                console.log("Không thể gửi comment",err)
              }
              else if(res && res.data && res.data.data){
                setListComment(current => [res.data.data,...current]);
                setCommentReply("");
              }
            })
      }
      }
    }
    catch(e){
      console.log(e)
    }

  }
  
  const handleDeleteCommentFromDad = async (id) =>{
    try{
      if(String(path)=== "hotels"){
        let res = await axios.post(`${url()}/comments/DeleteCommentHotel`,{IdComment:id});
        if(res && res.data && res.data.data){
         setListComment((current) =>
            current.filter((e) => String(e._id) !== String(res.data.data))
         );
         socket.emit("deletecomment",listUserCare.filter((e)=> String(e) !== String(user._id)),res.data.data,"hotels");
        }
      }
      else if(String(path)=== "rooms"){
        let res = await axios.post(`${url()}/comments/DeleteCommentRoom`,{IdComment:id});
        if(res && res.data && res.data.data){
         setListComment((current) =>
            current.filter((e) => String(e._id) !== String(res.data.data))
         );
         socket.emit("deletecomment",listUserCare.filter((e)=> String(e) !== String(user._id)),res.data.data,"rooms");
        }
      }
      else if(String(path)=== "users"){
        let res = await axios.post(`${url()}/comments/DeleteCommentPersonalPage`,{IdComment:id});
        if(res && res.data && res.data.data){
         setListComment((current) =>
            current.filter((e) => String(e._id) !== String(res.data.data))
         );
        }
      }
    }
    catch(e){
      console.log(e)
    }
  }
  useEffect(() => {
   
    const takeData= async ()=>{ 
        if( String(location.pathname.split("/")[1]) === "hotels"){
          // dữ liệu về khách sạn
          axios.get(`${url()}/hotels/find/${id}`).then((res)=>{
            if(res && res.data && res.data._id){
              setData(res.data);
              setDataHotelToEdit(res.data)
            }
          })
          
          // dữ liệu về comment 
          axios.get(`${url()}/comments/TakeCommentByHotelId/${id}`).then((res2)=>{
            if(res2.data && res2.data.data){
              setListComment(res2.data.data);
            }
          }).catch((e)=>{
            console.log(e);
          })
          
          axios.get(`${url()}/votes/CountCaculateVoteHotel/${id}`).then((res3)=>{
            if(res3.data && res3.data.data && res3.data.data.mediumVote && res3.data.data.countVote){
              setMediumVote(res3.data.data.mediumVote);
              setCountVote(res3.data.data.countVote);
            }  
          }).catch((e)=>{console.log(e)})
          axios.post(`${url()}/comments/TakeListUserCare`,{Id:id,Type:"hotels"}).then((response)=>{
             if(response && response.data && response.data.data){
                setListUserCare(response.data.data)
             }
          }).catch((e)=>{console.log(e)})
        }
        else if(String(location.pathname.split("/")[1]) === "rooms"){
            let res = await axios.get(`${url()}/rooms/${id}`);
            if(res && res.data){
              setData(res.data);
              setDataRoomToEdit(res.data)
              // dữ liệu về comment 
              await axios.post(`${url()}/comments/TakeCommentByRoomIdHotelId`,{
                 roomId: id,
                 hotelId:res.data.hotelOwner
              }).then((res2)=>{
                if(res2.data && res2.data.data){
                  setListComment(res2.data.data);
                }
              }).catch((e)=>{console.log(e)})
              };
              axios.get(`${url()}/votes/CountCaculateVoteRoom/${id}`).then((res3)=>{
                if(res3.data && res3.data.data && res3.data.data.mediumVote && res3.data.data.countVote){
                  setMediumVote(res3.data.data.mediumVote);
                  setCountVote(res3.data.data.countVote);
                }
              }).catch((e)=>{console.log(e)})
              axios.post(`${url()}/comments/TakeListUserCare`,{Id:id,Type:"rooms"}).then((response)=>{
                if(response && response.data && response.data.data){
                  setListUserCare(response.data.data)
                }
              }).catch((e)=>{console.log(e)})
        }
        else if (String(location.pathname.split("/")[1]) === "users"){
          let res = await axios.get(`${url()}/users/${id}`);
          if(res && res.data){
            setData(res.data);
            setDataUserToEdit(res.data)
          }

           // dữ liệu về comment 
           const res2 = await axios.get(`${url()}/comments/TakeListCommentPersonalPage/${id}`); 
           if(res2.data && res2.data.data){
              setListComment(res2.data.data);
           }

        }
        socket.on("comment",(comment,type)=>{
          if( (String(location.pathname.split("/")[1]) === "hotels") && ( String(type) === "hotels") ){
             if(comment && comment._id && (!comment.roomId) && (!comment.userIdHostPage) 
                && comment.hotelId && (String(comment.hotelId) === id)){
                 setListComment(current => [comment,...current]);
             }
          }
          else if((String(location.pathname.split("/")[1]) === "rooms") && (String(type) === "rooms") ){
              if(comment && comment._id && (comment.roomId) && (!comment.userIdHostPage) 
                  && comment.hotelId && (String(comment.roomId) === id)){
                  setListComment(current => [comment,...current]);
              }
          }
        })
        socket.on("editcomment",(comment,type)=>{
          if( (String(location.pathname.split("/")[1]) === "hotels") && (String(type) === "hotels") ){
             if(comment && comment._id && (!comment.roomId) && (!comment.userIdHostPage) 
                && comment.hotelId && (String(comment.hotelId) === id)){
                  setListComment(current => current.map(
                    (element, i) => String(element._id) === comment._id ? comment
                                            : element
                  ));
              
             }
          }
          if( (String(location.pathname.split("/")[1]) === "rooms") && (String(type) === "rooms") ){
            if(comment && comment._id && (comment.roomId) && (!comment.userIdHostPage) 
               && comment.hotelId && (String(comment.roomId) === id)){
                 setListComment(current => current.map(
                   (element, i) => String(element._id) === String(comment._id) ? comment
                                           : element
                 ));
            }
          }
        })
        socket.on("deletecomment",(commentId,type)=>{
          if( (String(location.pathname.split("/")[1]) === "hotels") && (String(type) === "hotels") ){
            setListComment((current) =>
               current.filter((e) => String(e._id) !== String(commentId))
            );
          }
          if( (String(location.pathname.split("/")[1]) === "rooms") && (String(type) === "rooms") ){
            setListComment((current) =>
               current.filter((e) => String(e._id) !== String(commentId))
            );
          }
        })
      }
    try{
      takeData();
    }
    catch(e){
      navigate("/");
      console.log(e);
    }
  },[id,location.pathname,navigate,socket])

  const takeListUserVote  = async ()=>{
    if( String(location.pathname.split("/")[1]) === "hotels"){
      const res = await axios.get(`${url()}/votes/TakeListInforUserVote/${id}`); 
      if(res.data && res.data.data){
        // console.log(res.data.data);
        setListUserVote(res.data.data);
        setOpenListUserVote(true)
      }
    }
    else if(String(location.pathname.split("/")[1]) === "rooms"){
      const res = await axios.get(`${url()}/votes/TakeListInforUserVoteRoom/${id}`); 
      if(res.data && res.data.data){
        // console.log(res.data.data);
        setListUserVote(res.data.data);
        setOpenListUserVote(true)
      }
    }
  }

  const handleChangeValueEdit = (value,field)=>{
    if( String(location.pathname.split("/")[1]) === "hotels"){
      setDataHotelToEdit((prev) => {
        return {
          ...prev, 
          [field]: value,
        };
      });
    }
    else if(String(location.pathname.split("/")[1]) === "rooms"){
      setDataRoomToEdit((prev) => {
        return {
          ...prev, 
          [field]: value,
        };
      });
    }
    else if(String(location.pathname.split("/")[1]) === "users"){
      setDataUserToEdit((prev) => {
        return {
          ...prev, 
          [field]: value,
        };
      });
    }
  }

  const handleSendEdit = async ()=>{
     try{
      setOpenEditForm(false);
      if( String(location.pathname.split("/")[1]) === "hotels"){
        let res = await axios.put(`${url()}/hotels/${id}`,dataHotelToEdit);
        if(res && res.data){
          setData(res.data);
          setDataHotelToEdit(res.data)
        }
      }
      else if (String(location.pathname.split("/")[1]) === "rooms"){
        let res = await axios.put(`${url()}/rooms/${id}`,dataRoomToEdit);
        if(res && res.data){
          setData(res.data);
          setDataRoomToEdit(res.data)
        }
      }
      else if (String(location.pathname.split("/")[1]) === "users"){
        if(String(id) === String(user._id)){
          let res = await axios.put(`${url()}/users/${id}`,dataUserToEdit);
          if(res && res.data){
            setData(res.data);
            setDataUserToEdit(res.data)
          }
        }
      }
     }
     catch(e){
      console.log(e)
     }
  }

  const handeDeleteImgHotel = async (Id,ImgLink) =>{
    try{
      if( String(location.pathname.split("/")[1]) === "hotels"){
        let res = await axios.post(`${url()}/hotels/update/DeleteImgHotel`,{HotelId:Id,ImgLink});
        if(res && res.data && res.data.data){
          setData(res.data.data);
        }
      }
      else if (String(location.pathname.split("/")[1]) === "rooms"){
        let res = await axios.post(`${url()}/rooms/update/DeleteImgRoom`,{RoomId:Id,ImgLink});
        if(res && res.data && res.data.data){
          setData(res.data.data);
        }
      }
    }
    catch(e){
      console.log(e)
    }
  }
  const BrokenImage ="https://dvdn247.net/wp-content/uploads/2020/07/avatar-mac-dinh-1.png";
  const imageOnError = (event) => {
    event.currentTarget.src = BrokenImage;
    event.currentTarget.className = "itemImg";
  };
  
  const BrokenImageHotel ="https://danviet.mediacdn.vn/296231569849192448/2022/12/24/11-167186872826516072932.jpg";
  const imageOnErrorHotel = (event) => {
    event.currentTarget.src = BrokenImageHotel;
  };
  const handleChangeValueChangePass = (value,field)=>{
    setDataToChangePass((prev) => {
      return {
        ...prev, 
        [field]: value,
      };
    });
  }
  const handleSendChangePass = async ()=>{
    try{
       setOpenFormChangePass(false);
       if(dataToChangePass.passold && dataToChangePass.passnew && dataToChangePass.repassnew && user && user._id){
          if(String(dataToChangePass.repassnew) === String(dataToChangePass.passnew)){
              if(String(dataToChangePass.passold) !== String(dataToChangePass.passnew)){
                  let dataSend ={
                      _id:user._id,
                      passold:dataToChangePass.passold,
                      passnew:dataToChangePass.passnew,
                      repassnew:dataToChangePass.repassnew,
                  }
                  axios.post(`${url()}/auth/changePass`,dataSend).then((response)=>{
                    if(response && response.data && response.data.data){
                        setShowNotification(true);
                        setTimeout(() => {
                          setShowNotification(false);
                        }, 5000);
                        setContentNotification("Updated successfully");
                        setDataToChangePass({
                          passold:"",
                          passnew:"",
                          repassnew:""
                        })
                    }
                    else{
                        setShowNotification(true);
                        setTimeout(() => {
                          setShowNotification(false);
                        }, 5000);
                        setContentNotification("Updated failed");
                        setDataToChangePass({
                          passold:"",
                          passnew:"",
                          repassnew:""
                        })
                    }
                  }).catch((e)=>{
                      setShowNotification(true);
                      setTimeout(() => {
                        setShowNotification(false);
                      }, 5000);
                      setContentNotification("Updated failed");
                      setDataToChangePass({
                        passold:"",
                        passnew:"",
                        repassnew:""
                      })
                  })
              }
              else{
                setShowNotification(true);
                setTimeout(() => {
                  setShowNotification(false);
                }, 5000);
                setContentNotification("New password is similar to old password");
                setDataToChangePass({
                  passold:"",
                  passnew:"",
                  repassnew:""
                })
              }
          }
          else{
            setShowNotification(true);
            setTimeout(() => {
              setShowNotification(false);
            }, 5000);
            setContentNotification("New password is not similar to old password");
            setDataToChangePass({
              passold:"",
              passnew:"",
              repassnew:""
            })
          }
       }
    }
    catch(e){
       console.log(e)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (accceptedFiles)=>{
        const formData = new FormData();
        const listType = ["img","jpg","jpeg","png","gif","tiff"]
        const config = {
            header: { 'Content-Type': 'multipart/form-data' }
        }
        accceptedFiles.forEach(pic => {
          let type = String(pic.path).split(".")[String(pic.path).split(".").length-1].toLowerCase();
          if(listType.find((e)=> String(e) === type)){
            formData.append("files",pic);
          }
        });
        if(path === "hotels"){
            // /update/imghotel
            formData.append("HotelId",id);
            axios.post(`${url()}/hotels/update/imghotel`, formData, config)
            .then(async (response) => {
              if (response && response.data && response.data.data) {
                 setData(response.data.data);
              }
            }).catch((e)=>{
              console.log(e)
            })
        }
        else if( String(path) === "users"){
          formData.append("userId",user._id);
          axios.post(`${url()}/users/UploadAvartar`, formData, config)
          .then(async (response) => {
            if (response && response.data && response.data.data) {
              let newuser = user;
              newuser= {...newuser,img:response.data.data};
              setData(newuser);
              dispatch({ type: "LOGIN_SUCCESS", payload: newuser }); 
              localStorage.setItem("user", JSON.stringify(newuser));
            }
          }).catch((e)=>{
            console.log(e)
          })
        }
    }
  }); 
  return (
    <div className="single">
      <MenuIcon 
               className="menu_btn" 
               style={ Data.isOpenSideBar ? {display:"none"} :{}} 
               onClick = {()=>{
                  dispatchredux({type: "OPENCLOSESIDEBAR", payload: { status:true }});
               }}
      />
      <CloseIcon
                className="menu_btn_close" 
                style={ Data.isOpenSideBar ? {} :{display:"none"}} 
                onClick = {()=>{
                    dispatchredux({type: "OPENCLOSESIDEBAR", payload: { status:false }});
                }}
      />
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <div onClick={()=>setOpenEditForm(true)} className="editButton">Edit</div>
            <h1 className="title">Information</h1>
            {
              ( String(path) === "hotels") &&(
                  (data !== {}) && (
                      <div className="item">
                          <img
                            src={data.photos && data.photos.length > 0 ? data.photos[0] : ""}
                            alt=""
                            className="itemImg"
                            onError= {imageOnErrorHotel}
                          />
                          <div className="details">
                            <h1 className="itemTitle">{data.name}</h1>
                            <div className="detailItem">
                              <span className="itemKey">City:</span>
                              <span className="itemValue">{data.city}</span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Address:</span>
                              <span className="itemValue">{data.address}</span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Title:</span>
                              <span className="itemValue">
                                  {data.title}
                              </span>
                            </div>
                            <div className="detailItem">
                              <div {...getRootProps({ className: "small_dropzone" })}>
                                <input className="small_dropzone" {...getInputProps()} />
                                <span className="itemKey" style={{cursor:"pointer"}}>Upload File</span>
                              </div>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Type:</span>
                              <span className="itemValue">{data.type}</span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Comments</span>
                              <span className="itemValue">{listComment.length}</span>
                            </div>
                            <div className="detailItem" onClick={()=>takeListUserVote()}>
                              <span className="itemKey">{countVote}</span>
                              <span className="itemValue">{(countVote<2)? "Vote":"Votes"}</span>
                              <div className="Star">
                                  <span className="itemValue">{mediumVote}</span>
                                  <span className="itemValue"><StarRateIcon className="IconStar"/></span>
                              </div>
                            </div>
                          </div>
                      </div>
                  )
              )
            }
            {
              (String(path) === "rooms") &&(
                  (data !== {}) && (
                      <div className="item">
                          <img
                            src={data.photos && data.photos.length > 0 ? data.photos[0] : ""}
                            alt=""
                            className="itemImg"
                          />
                          <div className="details">
                            <h1 className="itemTitle">{data.desc}</h1>
                            <div className="detailItem">
                              <span className="itemKey">Hotel:</span>
                              <span className="itemValue">
                                  <Link to={`/hotels/${data.hotelOwner}`} style={{textDecoration: "none"}}>
                                         {data.hotelNameOwn}
                                  </Link>
                              </span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Max People:</span>
                              <span className="itemValue">{data.maxPeople}</span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Title:</span>
                              <span className="itemValue">
                                  {data.title}
                              </span>
                            </div>
                            <div className="detailItem">
                              <div {...getRootProps({ className: "small_dropzone" })}>
                                <input className="small_dropzone" {...getInputProps()} />
                                <span className="itemKey" style={{cursor:"pointer"}}>Upload File</span>
                              </div>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Price:</span>
                              <span className="itemValue">
                                  {data.price}
                              </span>
                            </div>

                            <div className="detailItem">
                              <span className="itemKey">Comments</span>
                              <span className="itemValue">{listComment.length}</span>
                            </div>
                            <div className="detailItem" onClick={()=>takeListUserVote()}>
                              <span className="itemKey">{countVote}</span>
                              <span className="itemValue">{(countVote<2)? "Vote":"Votes"}</span>
                              <div className="Star">
                                  <span className="itemValue">{mediumVote}</span>
                                  <span className="itemValue"><StarRateIcon className="IconStar"/></span>
                              </div>
                            </div>
                          </div>
                      </div>
                  )
              )
            }
            {
              (String(path) === "users") &&(
                  (data !== {}) && (
                      <div className="item">
                          <img
                            src={data.img ? data.img : ""}
                            alt=""
                            className="itemImg"
                            onError= {imageOnError}
                          />
                          <div className="details">
                            <h1 className="itemTitle">{data.username}</h1>
                            <div className="detailItem">
                              <span className="itemKey"> Country:</span>
                              <span className="itemValue">
                                         {data.country}
                              </span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">City:</span>
                              <span className="itemValue">{data.city}</span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Email:</span>
                              <span className="itemValue">
                                  {data.email}
                              </span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Date Join:</span>
                              <span className="itemValue">
                                  {`${new Date(data.createdAt).getDate()}/${new Date(data.createdAt).getMonth()+1}/${new Date(data.createdAt).getFullYear()}`}
                              </span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Phone:</span>
                              <span className="itemValue">
                                  {data.phone}
                              </span>
                            </div>
                            <div className="detailItem">
                              <span className="itemKey">Admin:</span>
                              <span className="itemValue">
                                  {data.isAdmin ? "Yes" :"No"}
                              </span>
                            </div>
                            {
                              (String(id) === String(user._id)) && (
                                <div 
                                    onClick={()=>setOpenFormChangePass(true)}
                                    className="detailItem changePassBtn">
                                  <span className="itemKey">Change Password</span>
                                </div>
                              )
                            }

                          </div>
                      </div>
                  )
              )
            }
          </div>
          {
            ( (String(path) === "hotels") && (data !== {}) && (data.photos) && (data.photos.length>0) )
            && (
              <div className="right">
                  <div className="img1">
                     <img
                       src={data.photos && data.photos.length>0 ? data.photos[0] : ""}
                       alt=""
                       className="itemImg1"
                       onError= {imageOnErrorHotel}
                     />
                  </div>
                  <div onClick = {()=>setOpenListImage(true)} className="img2">
                      <img
                          src={data.photos && data.photos.length>1 ? data.photos[1] : ""}
                          alt=""
                          className="itemImg2"
                          onError= {imageOnErrorHotel}
                        />
                      {
                        (data.photos.length>1) &&(
                          <div className="count">
                              <p>
                                 {data.photos.length -1}+
                              </p>
                         </div>
                        )
                      }
                  </div>
                   {/*upload file*/}
                  <div {...getRootProps({ className: "dropzone" })}>
                    <input className="input-zone" {...getInputProps()} />
                    <button className="snip15823">Upload</button>
                  </div>
              </div>
            )
          }
          {
            ( (path === "rooms") && (data !== {}) && (data.photos) && (data.photos.length>0) )
            && (
              <div className="right">
                  <div className="img1">
                     <img
                       src={data.photos && data.photos.length>0 ? data.photos[0] : ""}
                       alt=""
                       className="itemImg1"
                     />
                  </div>
                  <div onClick = {()=>setOpenListImage(true)} className="img2">
                      <img
                          src={data.photos && data.photos.length>1 ? data.photos[1] : ""}
                          alt=""
                          className="itemImg2"
                        />
                      {
                        (data.photos.length>1) &&(
                          <div className="count">
                              <p>
                                 {data.photos.length -1}+
                              </p>
                         </div>
                        )
                      }
                  </div>
                   {/*upload file*/}
                  <div {...getRootProps({ className: "dropzone" })}>
                    <input className="input-zone" {...getInputProps()} />
                    <button className="snip15823">Upload</button>
                  </div>
              </div>
            )
          }
        </div>
        <div className="comment">
              {
                [...new Map(listComment.map((item) => [item["_id"], item])).values()].map(comment=>
                  (
                    <Comment 
                        key={comment._id} 
                        idComment={comment._id}
                        nameuser={comment.username} 
                        imgsource={comment.imgUser} 
                        content={comment.content} 
                        time={comment.createAt} 
                        listUserLike ={comment.emotion}
                        hostStatus ={comment.emotion.includes(user._id)}
                        hostId={user._id}
                        userIdCommented={comment.userId}
                        handleEditValueFormComment= {setCommentReply}
                        setcommentMode={setCommentReplyMode}
                        setcommentToEdit = {setCommentEdit}
                        handleDeleteComment={handleDeleteCommentFromDad}
                        typeComment={path}
                        listUserCare = {listUserCare}
                    />
                  )
                )
              }
        </div>
      </div>
      
      {/*Tạo bình luận*/}
      { 
        openFormChat && (
          <div className="reply_comment">
            <textarea onChange={(e)=>setCommentReply(e.target.value)} 
                    value={commentReply} 
                    className="comment_input" 
                    placeholder={commentReplyMode}
                    rows="9" cols="50">
            </textarea>
            <SendIcon onClick={()=>sendComment()} className="icon_reply_comment" style={{}}/>
          </div>
        )
      }

      {/* list user voted  */}
      {
        (openListUserVote && (listUserVote.length>0)) && (
          <div className="list_user_voted">
             {
              listUserVote.map(user=>
                  (
                    <div key={user.userId} className="user_vote_element">
                         <img className="img_vote_element" src={user.img} alt={user.name}/>
                         <div className="name_vote_element">{user.name}</div>
                         <div className="count_vote_element">
                             <p>
                                {user.Vote}
                             </p>
                             <StarRateIcon style={{color: "yellow",fontSize: "17px", marginLeft:"2px"}}/>
                         </div>
                    </div>
                  )
                )
              }
          </div>
        )
      }
      {
        openListImage && (
          <div className="listImage">
              <div className="listImage_temp">
                  { 
                    data.photos && (data.photos.length >0)  && (
                      data.photos.map(imgSource=>
                        ( <div key={imgSource} className="img_listImage_wrapper">
                            <CloseIcon onClick={()=>handeDeleteImgHotel(id,imgSource)} className="close_icon"/>
                             <img  alt="" src={imgSource} className="img_listImage"/>
                          </div>
                        )
                      )
                    )
                  }
              </div>
          </div>
        )
      }
      {/*background blur*/}
      {
        (openListUserVote || openListImage ||openEditForm ||openFormChangePass) && (
          <div 
             onClick={()=> {
                             setOpenListUserVote(false);
                             setOpenListImage(false);
                             setOpenEditForm(false);
                             setOpenFormChangePass(false)
                           }} 
             className="background_blur">
          </div>
        )
      }
      {
        openFormChangePass && (
          <div className="form_change_pass">
              {
                (path === "users") && (
                  <>
                    <input
                      type="password"
                      placeholder="passold"
                      id="passold"
                      value ={dataToChangePass.passold}
                      onChange= {(e)=>handleChangeValueChangePass(e.target.value,e.target.id)}
                      className="lInput"
                    />
                    <input
                      type="password"
                      placeholder="passnew"
                      id="passnew"
                      onChange= {(e)=>handleChangeValueChangePass(e.target.value,e.target.id)}
                      value ={dataToChangePass.passnew}
                      className="lInput"
                    />
                    <input
                      type="password"
                      placeholder="repassnew"
                      id="repassnew"
                      onChange= {(e)=>handleChangeValueChangePass(e.target.value,e.target.id)}
                      value={dataToChangePass.repassnew}
                      className="lInput"
                    /> 
                    
                    <button onClick={()=>handleSendChangePass()} className="submit">Submit</button>
                  </>
                )
              }
              </div>
        )
      }
      {
        showNotification && (
          <Notification content={contentNotification} />
        )
      }
      {
        openEditForm && (
          <div className="editForm">
            {
              (path === "hotels") && (
                <>
                  <input
                    type="text"
                    placeholder="city"
                    id="city"
                    value ={dataHotelToEdit.city}
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    className="lInput"
                  />
                  <input
                    type="text"
                    placeholder="address"
                    id="address"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value ={dataHotelToEdit.address}
                    className="lInput"
                  />
                  <input
                    type="text"
                    placeholder="title"
                    id="title"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value={dataHotelToEdit.title}
                    className="lInput"
                  /> 
                  <input
                    type="text"
                    placeholder="type"
                    id="type"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value ={dataHotelToEdit.type}
                    className="lInput"
                  />
                  <button onClick={()=>handleSendEdit()} className="submit">Submit</button>
                </>
              )
            }
            {
              (path === "rooms") && (
                <>
                  <input
                    type="number"
                    placeholder="maxPeople"
                    id="maxPeople"
                    value ={dataHotelToEdit.city}
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    className="lInput"
                  />
                  <input
                    type="text"
                    placeholder="price"
                    id="price"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value ={dataHotelToEdit.address}
                    className="lInput"
                  />
                  <input
                    type="text"
                    placeholder="title"
                    id="title"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value={dataHotelToEdit.title}
                    className="lInput"
                  /> 
                  <button onClick={()=>handleSendEdit()} className="submit">Submit</button>
                </>
              )
            }
            {
              (path === "users") && (
                <>
                 
                  <input
                    type="text"
                    placeholder="city"
                    id="city"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value ={dataUserToEdit.city}
                    className="lInput"
                  />
                  <input
                    type="text"
                    placeholder="country"
                    id="country"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value={dataUserToEdit.country}
                    className="lInput"
                  /> 
                  <input
                    type="text"
                    placeholder="phone"
                    id="phone"
                    onChange= {(e)=>handleChangeValueEdit(e.target.value,e.target.id)}
                    value={dataUserToEdit.phone}
                    className="lInput"
                  /> 
                  <div 
                        {...getRootProps({ className: "small_dropzone" })}
                        className="upload_file">
                          <input className="small_dropzone" {...getInputProps()} />
                          <FileUploadIcon/>
                          <div className="decription_btn">
                              Upload Avatar
                          </div>
                  </div>
                  <button onClick={()=>handleSendEdit()} className="submit">Submit</button>
                </>
              )
            }
          </div>
        )
      }
      {
        (!openFormChat) && (
          <div 
               onClick={()=>{
                setOpenFormChat(true)
                }}
               className="icon_open_message">
              <ChatBubbleIcon className="icon"/>
          </div>
        )
      }
      { (openFormChat) && (
        <div onClick={()=>{
                setOpenFormChat(false)
                }}
               className="icon_open_message">
                 <CancelIcon className="icon"/>
        </div>
      )
      }
    </div>
  );
};

export default Single;
