import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import {url} from '../../config.js'
import {useState,useEffect,useContext} from 'react';
import axios from 'axios'
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
const Widget = ({ type }) => {
  let data; 
  const { user } = useContext(AuthContext);
  //temporary
  const [amount,setAmount] = useState(100);
  const diff = 20;

  useEffect(() => {
    const checkUser= async()=>{ 
        if(String(type) === "user"){
          const res = await axios.get(`${url()}/users/countlistuserorderedbyownerid/${user._id}`); // gửi token để check 
          setAmount(res.data.count)
        }
        else if(String(type) === "order"){
          const res = await axios.get(`${url()}/orders/countorderbyownerid/${user._id}`); // gửi token để check 
          setAmount(res.data.count)
        }
        else if(String(type) === "revenue"){
          const res = await axios.get(`${url()}/orders/SumOrderByOwnerIdBefore/${user._id}`); // gửi token để check 
          setAmount(res.data.sum)
        }
        else if(String(type) === "contract"){
          const res = await axios.get(`${url()}/orders/SumOrderByOwnerIdAfter/${user._id}`); // gửi token để check 
          setAmount(res.data.sum)
        }
      }
    try{
      if(user){
        checkUser();
      }
    }
    catch(e){
      console.log(e);
    }
  },[type,user])
  
  // dựa vào prop truyền vào để set dữ liệu cho biết ở trong ( và đây k phải là state)
  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        link:  <Link to="/users" style={{ textDecoration: "none" }}>See all users</Link>,
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "order":
      data = {
        title: "ORDERS",
        isMoney: false,
        link: <Link to="/orders" style={{ textDecoration: "none" }}>View all orders</Link>,
        icon: (
          <ShoppingCartOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "revenue":
      data = {
        title: "BEFORE",
        isMoney: true,
        link: <Link to="/orders" style={{ textDecoration: "none" }}>View net earnings</Link>,
        icon: (
          <MonetizationOnOutlinedIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    case "contract":
      data = {
        title: "AFTER",
        isMoney: true,
        link:<Link to="/orders" style={{ textDecoration: "none" }}>See details</Link>,
        icon: (
          <AccountBalanceWalletOutlinedIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "$"} {amount}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className="percentage positive">
          <KeyboardArrowUpIcon />
          {diff} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
