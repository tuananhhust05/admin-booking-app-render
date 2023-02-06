import axios from "axios";
import { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import {url} from '../../config.js'
import { AuthContext } from "../../context/AuthContext";
const Register = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    email: undefined,
    password: undefined,
    confirm_password: undefined
  });
  const [notify, setNotify] = useState(false);
  const [content, setContent]= useState("Registered failed")
  const navigate = useNavigate()
  const { loading, error, dispatch } = useContext(AuthContext);
  // thay đổi dữ liệu cho state up lên 
  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value })); 
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if((credentials.username)&&(credentials.password)&&(credentials.confirm_password)&&(credentials.email)&&(String(credentials.password)===String(credentials.confirm_password))){
        const res = await axios.post(`${url()}/auth/registeradmin`,
          {
            username:credentials.username,
            email:credentials.email,
            img:"1",
            city:"1",
            country:"1",
            phone:"1",
            password:credentials.password,
          }
        );
        if(res &&(res.data)&&(res.data.success)){
          console.log(res);
          // auto login 
          const res2 = await axios.post(`${url()}/auth/loginmail`, credentials);
          console.log(res2);
          if (res2 && res2.data && res2.data.isAdmin) {
            res2.data.details.isAdmin=res2.data.isAdmin; 
            dispatch({ type: "LOGIN_SUCCESS", payload: res2.data.details });
            navigate("/");
          } else {
            setNotify(true);
            navigate("/login");
          }
        }
        else{
          setNotify(true);
          if(res && res.data && res.data.err){
             setContent(res.data.err);
          }
        }
    }
    else{
      console.log("Invalid information")
      setNotify(true);
    }
  };
  
  return (
    <div className="login">
      <div className="lContainer">
        <input
          type="text"
          placeholder="username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="lInput"
        />
         <input
          type="password"
          placeholder="confirm password"
          id="confirm_password"
          onChange={handleChange}
          className="lInput"
        />
        <p>If you registered a client account, Please enter the same password, email and name as the client account to upgrade to an admin account</p>
        <button onClick={handleClick} className="lButton">
          Register
        </button>
        <button onClick={()=>{navigate("/login")}} className="lButton">
          Login
        </button>
        {notify && <span>{content}</span>}
      </div>
    </div>
  );
};

export default Register;