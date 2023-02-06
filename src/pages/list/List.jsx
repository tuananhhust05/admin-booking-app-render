import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import{SearchDataSelector} from '../../redux/selector'
import {useSelector,useDispatch} from 'react-redux'
const List = ({columns}) => {
  const Data = useSelector(SearchDataSelector);
  const dispatchredux = useDispatch();
  return (
    <div className="list">
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
      <div className="listContainer">
        <Navbar/>
        <Datatable columns={columns}/>
      </div>
    </div>
  )
}

export default List