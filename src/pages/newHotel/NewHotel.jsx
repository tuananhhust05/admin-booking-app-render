import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { hotelInputs } from "../../formSource";
// import useFetch from "../../hooks/useFetch";
import axios from "axios";
import {url} from '../../config.js'
import Notification from "../../components/notification/Notification";
// component thêm khách sạn mới 
const NewHotel = () => {
  const [info, setInfo] = useState({}); // biến chứa thông tin khách sạn 
  const [showNotification,setShowNotification] = useState(false);
  const [contentNotification,setContentNotification]= useState("");
  // const { data, loading, error } = useFetch("/rooms");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };
  function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); 
    str = str.replace(/ + /g," ");
    str = str.trim();
    str = str.replace(/!|%|\^|\*|\(|\)|\+|\?|\/|,|\.|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
  }
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      axios.post(`${url()}/hotels/SaveRequestCreateHotel`,{...info,owner:user._id,cityNoVn:removeVietnameseTones(info.city)}).then((response)=>{
        if(response && response.data && response.data._id){
            setShowNotification(true);
            setContentNotification("Send request successfully");
            setTimeout(() => {
              setShowNotification(false);
              navigate("/hotels");
            }, 2000);
        }
        else{
          setShowNotification(true);
          setContentNotification("Send request failed");
          setTimeout(() => {
            setShowNotification(false);
            navigate("/hotels");
          }, 2000);
        }
      }).catch((e)=>{
          console.log(e);
          setShowNotification(true);
          setContentNotification("Send request failed");
          setTimeout(() => {
            setShowNotification(false);
            navigate("/hotels");
          }, 2000);
      });
      
    } catch (err) {console.log(err)}
  };
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
          <h1>Add New Product</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form>
              {hotelInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Featured</label>
                <select id="featured" onChange={handleChange}>
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
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

export default NewHotel;
