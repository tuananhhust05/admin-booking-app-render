import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
// import {url} from '../../config.js'
// check lại tài khoản 1 lần nữa 
// import {useContext} from 'react'
// import { AuthContext } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import axios from "axios"
import{SearchDataSelector} from '../../redux/selector'
import {useSelector,useDispatch} from 'react-redux'
const Home = () => {
  // const navigate = useNavigate();
  // const { user } = useContext(AuthContext);
  const Data = useSelector(SearchDataSelector);
  const dispatchredux = useDispatch();
  // useEffect(() => {
  //   const checkUser= async()=>{ 
  //       const res = await axios.get(`${url()}/users/check/${user._id}`); // gửi token để check 
  //       console.log("data check",res.data)
  //       if(res && res.data && (!res.data.check)){
  //         console.log("Xóa localstore do tài khoản không hợp lệ");
  //         navigate("/login")
  //         localStorage.setItem("user", null);
  //       }
  //       if(res&&(res.data)&&(res.data.check)){
  //         console.log("Tài khoản hợp lệ")
  //       }
  //       else{
  //         navigate("/login")
  //       }
  //     }

  //   try{
  //     if(user){
  //       checkUser();
  //     }
  //   }
  //   catch(e){
  //     console.log(e);
  //     navigate("/login")
  //   }
  // },[])

  return (
    <div className="home">
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
      <Sidebar/>
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          {/* các loại widgets khác nhau */}
          <Widget type="user" />
          <Widget type="order" />
          <Widget type="revenue" />
          <Widget type="contract" />
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
        <div className="listContainer">
          <div className="listTitle">Latest Transactions</div>
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Home;
