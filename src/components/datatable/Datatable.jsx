import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import {BedroomParent} from '@mui/icons-material'
import QuizIcon from '@mui/icons-material/Quiz';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CloseIcon from '@mui/icons-material/Close';
// import { userColumns, userRows } from "../../datatablesource";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState ,useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {useSelector,useDispatch} from 'react-redux' // redux 
import{SearchDataSelector} from '../../redux/selector' 
// import useFetch from "../../hooks/useFetch";
import axios from "axios";
import {url} from '../../config.js'
import {socketCient} from '../../config.js'
const dateColumns = [
  {
    field: "time",
    headerName: "Time",
    width: 400,
    renderCell: (params) => (
      <div style={{display:"flex"}}>
          <DateRangeIcon/>
          <div style={{marginLeft:"5px"}}>
              {params.row.time}
          </div>
      </div>
    )
  }
];


const Datatable = ({columns}) => {
  const location = useLocation();
  let socket = socketCient();
  const Data = useSelector(SearchDataSelector);
  const dispatchredux = useDispatch();  
  let path = location.pathname.split("/")[1]; // muốn hiểu thì xem chỗ app config router; path thay đổi linh hoạt tùy vào chủng loại
  let namePage = path;
  const { user } = useContext(AuthContext);

  const [listHotel, setListHotel] = useState([]);  // dữ liệu bảng chính 
  const [listOrder, setListOrder] = useState([]);
  const [listUser, setListUser] = useState([]);
  const [listRoom, setListRoom] = useState([]);

  // hiển thị dữ liệu chi tiết
  const [listDataDetail,setListDataDetail] = useState([]);// dữ liệu hotels
  const [dataDetail,setDataDetail] = useState({});  // dữ liệu orders 
  const [dataDetailRoom,setDataDetailRoom] = useState({});
  const [detailUser,setDetailUser] = useState({});
  
  // data to link 
  const [dataToLinkHotel, setDataToLinkHotel] = useState("")
  // hiển thị danh sách những ngày đặt phòng (route rooms)
  const [openListUnavailableDates,setOpenListUnavailableDates] = useState(false);
  const [listUnavailableDates,setListUnavailableDates] = useState([]);
  const [inforRoomChosen,setInforRoomChosen] = useState("");
  // type hiển thị danh sách orders 
  const [typeOrder,setTypeOrder] = useState("Pending");
  // đóng mở form thông tin 
  let link = ""
  const [showDetail,setShowDetail] = useState(false)
  if(String(path)==="hotels"){
    link = `${url()}/${path}/gethotelbyowner/${user._id}`
  }
  else if( String(path)==="rooms"){
    link = `${url()}/${path}/getroombyuserid/${user._id}`;
  }
  else if(String(path) ==="orders"){
    link = `${url()}/${path}/takelistorderbyownerid/orderpage/${user._id}/Pending`
  }
  else if(String(path) ==="users"){
    link = `${url()}/${path}/takelistuserorderedbyownerid/${user._id}`
  }
  

  useEffect(() => {
    const takeData= async ()=>{ 
      try{
        let data = await axios.get(`${link}`);
        // console.log(String(path.split("/")[0]));
        if( data && data.data && data.data.length){
          if(String(path.split("/")[0]) === "hotels"){
            setListHotel(data.data); 
          }
          else if (String(path.split("/")[0]) === "orders"){
            if( String(typeOrder) !== "Pending"){
              setListOrder(data.data);
            }
          }
          else if (String(path.split("/")[0]) === "users"){
            // console.log("Thiết lập dữ liệu user", data.data)
            setListUser(data.data);
          }
          else if (String(path.split("/")[0]) === "rooms"){
            setListRoom(data.data);
          }
        }
      } catch(e) {
        console.log(e)
      }
    }

    if(user){
       takeData();
    }
  }, [path,link,typeOrder,user]);

  // chống khởi tạo hàm nhiều lần vì trong hàm sử dụng các state bị thay đổi và hai hàm không bao giờ bằng nhau 
  const handleOnClick= async (rowData) => {
    if(String(path.split("/")[0]) === "hotels"){
        setShowDetail(true);
        setDataToLinkHotel(rowData._id)
        let result = await axios.get(`${url()}/rooms/getroombyhotelowner/${rowData._id}`);
        setListDataDetail(result.data.result);
    }
    else if (String(path.split("/")[0]) === "orders"){

        setShowDetail(true);
        setDataDetail(rowData)
    }
    else if (String(path.split("/")[0]) === "rooms"){

      setShowDetail(true);
      setDataDetailRoom(rowData.roomNumbers)
    }
    else if (String(path.split("/")[0]) === "users"){

      let result = await axios.get(`${url()}/users/takeinforuserbymail/${rowData._id}`);
      // console.log(result)
      setShowDetail(true);
      setDetailUser(result.data.data.userinfor)
    }
  }
  
  // hàm show danh sách phòng đã cho thuê của 1 room chỉ khi hiển thị danh sách room mới có 
  const handleShowListUnavailableDates = async (data) =>{
    // console.log(data);
    let result = await axios.get(`${url()}/orders/TakeUnAvailableDateByOrderRoomId/${data._id}`);
    let listDate =[];
    let id= 1;;
    for( let i=0; i<result.data.length; i++){
      let a ={};
      // {new Date(params.row.time).getDate()}/{new Date(params.row.time).getMonth()+1}/{new Date(params.row.time).getFullYear()}
      a.time = `${new Date(result.data[i].FirstDayServe).getDate()}/${new Date(result.data[i].FirstDayServe).getMonth()+1}/${new Date(result.data[i].FirstDayServe).getFullYear()}--${new Date(result.data[i].LastDayServe).getDate()}/${new Date(result.data[i].LastDayServe).getMonth()+1}/${new Date(result.data[i].LastDayServe).getFullYear()}`
      a._id=id;
      listDate.push(a);
      id++;
    }
    setOpenListUnavailableDates(true);
    setInforRoomChosen(data.number)
    setListUnavailableDates(listDate);
  }
  // ẩn thông tin các form 
  const handleHideInfor = ()=>{
    setShowDetail(false);
    setOpenListUnavailableDates(false)
  }
  // const handleDelete = async (id) => { // xóa dữ liệu 
  //   try {
  //     await axios.delete(`/${path}/${id}`);
  //     setList(list.filter((item) => item._id !== id));
  //   } catch (err) {}
  // };
  // đây là 1 mảng, chứa 1 object 
  // const actionColumn = [
  //   {
  //     field: "action",
  //     headerName: "Action",
  //     width: 200,
  //     // 1 trường có giá trị là một function component 
  //     renderCell: (params) => {
  //       return (
  //         <div className="cellAction">
  //           <Link to="/users/test" style={{ textDecoration: "none" }}>
  //             <div className="viewButton">View</div>
  //           </Link>
  //           <div
  //             className="deleteButton"
  //             onClick={() => handleDelete(params.row._id)}
  //           >
  //             Delete
  //           </div>
  //         </div>
  //       );
  //     },
  //   },
  // ];
  
  const handleChangeTypeOrder = async (type) =>{
    try{
       if(String(type) === "Sending"){
          setTypeOrder(type);
       }
       else{
          let response = await axios.get(`${url()}/orders/takelistorderbyownerid/orderpage/${user._id}/${type}`);
          if(response && response.data && response.data.length && (response.data.length >0)){
            setListOrder(response.data); 
            setTypeOrder(type);
          }
          else{
            setListOrder([]);
          }
       }
    }
    catch(e){
      console.log(e)
    }
  }

  const handleChangeStatusOrder = async (IdOrder,Status)=>{
     try{   
            setShowDetail(false);
            axios.post(`${url()}/orders/ChangeStatusOrder`,{IdOrder,Status}).then((order)=>{
              if(order && order.data && order.data.data._id){
                 if( ( String(typeOrder) === "Pending") && ( ( String(Status) === "Accepted")||(String(Status) === "Denied"))){
                   dispatchredux({type: "REMOVEPENDINGORDER", payload: { OrderId:order.data.data._id }});
                 }
              }
            }).catch((e)=>{
               console.log(e)
            });
            if( (String(typeOrder) === "Accepted") && (Status)){
              setListOrder((current) =>
                current.filter((order) => String(order._id) !== String(IdOrder))
              );
            }
            if( (String(path.split("/")[0]) === "orders") && (String(typeOrder) === "Pending") && ( (String(Status) === "Accepted")||(String(Status) === "Denied"))){
                if(String(Status) === "Accepted"){
                  let newNotification = {
                    content:"You have accepted an order!",
                    userId:user._id,
                    type:"AcceptOrder",
                    hotelId:dataDetail.HotelId,
                    roomId:dataDetail.CategoryRoomId,
                  }
                  axios.post(`${url()}/notifications/CreateNotification`,newNotification)
                  .then((notification)=>{
                    if(notification && notification.data && notification.data.data){
                        dispatchredux({type: "ADDNOTIFICATION", payload: {newNotification:notification.data.data}});
                    };
                  })
                  .catch((e)=>{console.log("Lỗi api tạo thông báo",e)});
                  let newNotification2 = {
                    content:"Your order is accepted!",
                    userId:dataDetail.UserOrderId,
                    type:"AcceptOrder",
                    hotelId:dataDetail.HotelId,
                    roomId:dataDetail.CategoryRoomId,
                  };
                  axios.post(`${url()}/notifications/CreateNotification`,newNotification2).then((notification)=>{
                    if(notification && notification.data && notification.data.data){
                       socket.emit("notification",dataDetail.UserOrderId,notification.data.data,{Type:"ResonseOrder",IdOrder:dataDetail._id,TypeOrder:"Accepted"})
                    };
                  })
                  .catch((e)=>{console.log("Lỗi api tạo thông báo",e)});
                }
                else if ( String(Status) === "Denied"){
                  let newNotification = {
                    content:"You have denied an order!",
                    userId:user._id,
                    type:"DenyOrder",
                    hotelId:dataDetail.HotelId,
                    roomId:dataDetail.CategoryRoomId,
                  }
                  axios.post(`${url()}/notifications/CreateNotification`,newNotification)
                  .then((notification)=>{
                    if(notification && notification.data && notification.data.data){
                      dispatchredux({type: "ADDNOTIFICATION", payload: {newNotification:notification.data.data}});
                    };
                  })
                  .catch((e)=>{console.log("Lỗi api tạo thông báo",e)});
                  let newNotification2 = {
                    content:"Your order is denied!",
                    userId:dataDetail.UserOrderId,
                    type:"DenyOrder",
                    hotelId:dataDetail.HotelId,
                    roomId:dataDetail.CategoryRoomId,
                  }
                  axios.post(`${url()}/notifications/CreateNotification`,newNotification2).then((notification)=>{
                    if(notification && notification.data && notification.data.data){
                       socket.emit("notification",dataDetail.UserOrderId,notification.data.data,{Type:"ResonseOrder",IdOrder:dataDetail._id,TypeOrder:"Denied"})
                    };
                  })
                  .catch((e)=>{console.log("Lỗi api tạo thông báo",e)});
                }
            }
     }
     catch(e){
       console.log(e)
     }
  }
  return (
    <div>
        {showDetail &&
          <div onClick={()=>handleHideInfor()} className="brother">
          </div>
        }
        {
          (String(path.split("/")[0]) === "orders") && (
            <select onChange={(e)=>handleChangeTypeOrder(e.target.value)} className="select_form_order">
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Denied">Denied</option>
              <option value="Served">Served</option>
              <option value="Checked">Checked</option>
           </select>
          )
        }
        <div className="datatable">
          {
            openListUnavailableDates && 
            <div className="listdateordered">
                 <h3>
                     Danh sách ngày đã cho thuê phòng {inforRoomChosen}
                     <CloseIcon className="close_icon" onClick={()=>setOpenListUnavailableDates(false)}/>
                 </h3>
                 {/* phải set up chiều dài của thẻ chứa datagrid Không là lỗi lòi ra */}
                 <div className="container_datagrid">  
                    <DataGrid
                      className="datagrid"
                      rows={listUnavailableDates}
                      columns={dateColumns}
                      pageSize={9}
                      checkboxSelection
                      rowsPerPageOptions={[9]}
                      getRowId={(row) => row._id}
                      onRowClick={(param) => handleOnClick(param.row)}
                    />
                  </div>
            </div> 
          }
          {showDetail && 
            <div className="listroom" >
              {  // header 
                (String(path.split("/")[0]) === "hotels") ?(
                  <h3>
                      ListCategory({listDataDetail.length})
                  </h3>
                ):( // logic lồng 
                  <div>
                      {
                        (String(path.split("/")[0]) === "orders") ? (
                          <h3>
                              Detail 
                          </h3>
                        ):(
                          <h3>
                             <div>Detail</div>
                          </h3>
                        )
                      }
                  </div>
                )
              }
              {/* content*/}
              {
                (String(path.split("/")[0]) === "hotels") ?(
                  <div>
                    {listDataDetail.map(item =>
                        <div key={item._id} className="elementData">
                              <Link to={`/rooms/${item._id}`} style={{textDecoration: "none"}}  className="link">
                                  <BedroomParent/>
                                  <div className="elementContent">{item.desc}</div>
                              </Link>
                        </div>
                        )
                    }
                    <Link to={`/hotels/${dataToLinkHotel}`} style={{textDecoration: "none"}}  className="link">
                        <div style={{display:"flex", margin:"10px"}}>
                            <QuizIcon style={{color: "rgba(46, 138, 206, 0.7)"}}/> 
                            <p  style={{color: "rgba(46, 138, 206, 0.7)"}} >More Infor</p>
                        </div>
                    </Link>
                  </div>
                ):( // logic lồng 
                  <div>
                       {(String(path.split("/")[0]) === "orders")&&
                          (
                            <div className="content_order">
                              <div className="content_order_left">
                                  <div className="element_orders">
                                    <div>Hotel: </div>
                                    <div>{dataDetail.HotelName}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Service: </div>
                                    <div> {dataDetail.CategoryRoomDesc}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Room Number: </div>
                                    <div> {dataDetail.IdRoomNumber}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Date:</div>
                                    <div>
                                    
                                          <div> 
                                                  <div>
                                                    {new Date(dataDetail.FirstDayServe).getDate()}/{new Date(dataDetail.FirstDayServe).getMonth()+1}/{new Date(dataDetail.FirstDayServe).getFullYear()}--{new Date(dataDetail.LastDayServe).getDate()}/{new Date(dataDetail.LastDayServe).getMonth()+1}/{new Date(dataDetail.LastDayServe).getFullYear()}
                                                  </div>
                                          </div>
                                      
                                    </div>
                                  </div>
                                  <div className="element_orders">
                                    <div>DateOrder: </div>
                                    <div>
                                        {new Date(dataDetail.DateOrder).getDate()}/{new Date(dataDetail.DateOrder).getMonth()+1}/{new Date(dataDetail.DateOrder).getFullYear()}
                                    </div>
                                  </div>
                                  {
                                    ( String(typeOrder) === "Pending") && (
                                      <div onClick={()=>handleChangeStatusOrder(dataDetail._id,"Denied")} className="element_denied_button">
                                        <div>Denied</div>
                                      </div>
                                    )
                                  }
                
                              </div>
                              <div className="content_order_right">
                                  {/* <img alt="" src="https://luv.vn/wp-content/uploads/2021/10/gai-xinh-12.jpg"/> */}
                                  <Link to={`/users/${dataDetail.UserOrderId}`}>
                                      <img alt={dataDetail.NameUserOrder} src={dataDetail.ImgUserOrder}/>
                                  </Link>
                                  <div className="element_orders">
                                    <div>Name: </div>
                                    <div>{dataDetail.NameUserOrder}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Email: </div>
                                    <div>{dataDetail.EmailUserOrder}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Phone: </div>
                                    <div>{dataDetail.PhoneUserOrder}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Phone Extra: </div>
                                    <div>{dataDetail.PhoneContactExtra}</div>
                                  </div>
                                  {
                                    ( String(typeOrder) === "Pending") && (
                                      <div onClick={()=>handleChangeStatusOrder(dataDetail._id,"Accepted")} className="element_accept_button">
                                        <div>Accepted</div>
                                      </div>
                                    )
                                  }
                                  {
                                    (String(typeOrder) === "Accepted") && (
                                      <div onClick={()=>handleChangeStatusOrder(dataDetail._id,"Served")} className="element_accept_button">
                                        <div>Served</div>
                                      </div>
                                    )
                                  }
                              </div>
                            </div>
                          )
                       }
                       {(String(path.split("/")[0]) === "users")&&
                          (
                            <div className="content_order">
                              <div className="content_order_left">
                                  <div className="element_orders">
                                    <div>UserName: </div>
                                    <div>{detailUser.username}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Email: </div>
                                    <div> {detailUser.email}</div>
                                  </div>
                                  <Link to={`/users/${detailUser._id}`} style={{textDecoration: "none"}}  className="link">
                                      <div style={{display:"flex", margin:"10px"}}>
                                          <QuizIcon style={{color: "rgba(46, 138, 206, 0.7)"}}/> 
                                          <p  style={{color: "rgba(46, 138, 206, 0.7)"}} >More Infor</p>
                                      </div>
                                  </Link>
                              </div>
                              <div className="content_order_right">
                                  <img alt={detailUser.username} src={detailUser.img}/>
                                  <div className="element_orders">
                                    <div>City: </div>
                                    <div>{detailUser.city}</div>
                                  </div>
                                  <div className="element_orders">
                                    <div>Country: </div>
                                    <div> {detailUser.country}</div>
                                  </div>
                              </div>
                            </div>
                          )
                       }
                       {
                        (String(path.split("/")[0]) === "rooms") &&(
                          <div>
                              {dataDetailRoom.map(item =>
                                <div key={item._id} className="elementData">
                                    <BedroomParent/>
                                    <div onClick={()=>handleShowListUnavailableDates(item)} className="elementContent">{item.number}</div>
                                </div>
                              )}
                          </div>
                        )
                       }
                  
                  </div>
                )
              }
            </div>
          }
          <div className="datatableTitle">
            {namePage}
           
            {
              ((String(path) !== "users") && (String(path) !== "orders")) && (
                <Link to={`/${path}/new`} className="link">
                  Add New
                </Link>
              )
            }
          </div>
          {
            (String(path.split("/")[0]) === "hotels") && (
              <DataGrid
                className="datagrid"
                rows={listHotel}
                columns={columns}
                pageSize={9}
                rowsPerPageOptions={[9]}
                checkboxSelection
                getRowId={(row) => row._id}
                onRowClick={(param) => handleOnClick(param.row)}
              />
            )
          }
          {
            (String(path.split("/")[0]) === "orders") && (
              <> 
                {
                  ( String(typeOrder) === "Pending") ? (
                    <DataGrid
                      className="datagrid"
                      rows={[...new Map(Data.listOrderPending.map((item) => [item["_id"], item])).values()]}
                      columns={columns}
                      pageSize={9}
                      rowsPerPageOptions={[9]}
                      checkboxSelection
                      getRowId={(row) => row._id}
                      onRowClick={(param) => handleOnClick(param.row)}
                    />
                  ):(
                    <DataGrid
                      className="datagrid"
                      rows={listOrder}
                      columns={columns}
                      pageSize={9}
                      rowsPerPageOptions={[9]}
                      checkboxSelection
                      getRowId={(row) => row._id}
                      onRowClick={(param) => handleOnClick(param.row)}
                    />
                  )
                }
              </>
            )
          }
          {
            (String(path.split("/")[0]) === "users") && (
              <DataGrid
                className="datagrid"
                rows={listUser}
                columns={columns}
                pageSize={9}
                rowsPerPageOptions={[9]}
                checkboxSelection
                getRowId={(row) => row._id}
                onRowClick={(param) => handleOnClick(param.row)}
              />
            )
          }
          {
            (String(path.split("/")[0]) === "rooms") && (
              <DataGrid
                className="datagrid"
                rows={listRoom}
                columns={columns}
                pageSize={9}
                rowsPerPageOptions={[9]}
                checkboxSelection
                getRowId={(row) => row._id}
                onRowClick={(param) => handleOnClick(param.row)}
              />
            )
          }
        
      </div>
    </div>
  );
};

export default Datatable;
