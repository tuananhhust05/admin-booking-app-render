import "./newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Notification from "../../components/notification/Notification";
import { useState, useContext, useEffect } from "react";
import { roomInputs } from "../../formSource";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import {url} from '../../config.js'
const NewRoom = () => {
  const [info, setInfo] = useState({}); // state chứa thông tin của phòng 
  const [hotelId, setHotelId] = useState(undefined);  // set up hotelId 
  const [rooms, setRooms] = useState([]);// 1 mảng
  const navigate = useNavigate();
  const [showNotification,setShowNotification] = useState(false); 
  const [contentNotification,setContentNotification]= useState("");
  const [listhotel,setListhotel] = useState([]);
  const { user } = useContext(AuthContext);


  const handleChange = (e) => { // set up thông tin của phòng 
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleClick = async (e) => {
    e.preventDefault();
    if(hotelId){
        let hotelChoose = listhotel.find((e)=> e._id == hotelId);
        let request = {
           hotelOwner:hotelId,
           Owner:user._id,
           desc:info.desc,
           maxPeople:String(info.maxPeople),
           price:String(info.price),
           title:String(info.title),
           roomNumbers:rooms.split(","),
           hotelNameOwn:hotelChoose.name
        };
        axios.post(`${url()}/rooms/CreateRoomRequest`,request).then((response)=>{
          if(response && response.data && response.data.data){
              setShowNotification(true);
              setContentNotification("Send request successfully");
              const timer = setTimeout(() => {
                setShowNotification(false);
                navigate("/rooms");
              }, 2000);
          }
          else{
            setShowNotification(true);
            setContentNotification("Send request failed");
            const timer = setTimeout(() => {
              setShowNotification(false);
              navigate("/rooms");
            }, 2000);
          }
        }).catch((e)=>{
            console.log(e);
            setShowNotification(true);
            setContentNotification("Send request failed");
            const timer = setTimeout(() => {
              setShowNotification(false);
              navigate("/rooms");
            }, 2000);
        });
    }
  };

  useEffect(() => {
    const takeData= async ()=>{ 
       axios.get(`${url()}/hotels/gethotelbyowner/${user._id}`).then((response)=>{
          if(response && response.data){
              if(response.data.length){
                  setHotelId(response.data[0]._id);
              }
              setListhotel(response.data);
          }
       })
    }
    try{
      takeData();
    }
    catch(e){
      console.log(e);
    }
  },[])

  const handleChoosehotel = async (hotelId)=>{
    try{
        setHotelId(hotelId);
    }
    catch(e){
        console.log(e)
    }
  }
  return (
    <div className="new">
      {
        showNotification && (
          <Notification content={contentNotification} />
        )
      }
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form>
              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Rooms</label>
                <textarea
                  rows="9" cols="20"
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="type list room for this category, example: 123,213,215"
                />
              </div>
              <div className="formInput">
                <label>Choose a hotel</label>
                <select
                  id="hotelId"
                  onChange={(e) => handleChoosehotel(e.target.value)}
                >
                  {
                    listhotel.map((hotel) => (
                       <option 
                            key={hotel._id} 
                            value={hotel._id}>
                              {hotel.name}
                       </option>
                    ))
                  }
                </select>
              </div>
              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;
