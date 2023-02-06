import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import NewHotel from "./pages/newHotel/NewHotel";
import NewRoom from "./pages/newRoom/NewRoom";
import Register from "./pages/register/Register"
import New from "./pages/new/New";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { productInputs, userInputs } from "./formSource";
import { userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext} from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import { hotelColumns, roomColumns, userColumns,orderColumns } from "./datatablesource";
// socket 
import {useEffect} from 'react'
import {socketCient} from './config.js'
function App() {
  const { darkMode } = useContext(DarkModeContext); // lấy dữ liệu từ context
  const { user } = useContext(AuthContext);
  let socket = socketCient();
  useEffect(() => {
    if(user && user._id){
      socket.emit("login",user._id)
    }
  },[])
  // tự tạo ra protected Route: bản chất là 1 function component 
  const ProtectedRoute =  ({ children }) => {
    try{
      if (!user) {
        return <Navigate to="/login" />;  // đưa đến trang login nếu không có dữ liệu user 
      }
      if(!user.isAdmin){ // nếu không phải admin 
        return <Navigate to="/login" />;
      }
      return children;
    }
    catch(e){
      console.log(e);
      return <Navigate to="/login" />;
    }
  };
  // đi từng case một 
  return (
    <div className={darkMode ? "app dark" : "app"}>
      {/* <BrowserRouter basename="/client_admin_level2_hotel"> */}
      <BrowserRouter>
        <Routes>
          {/* Route chồng route */}
          <Route path="/">
            {/* nếu /login thì dẫn tới component Login*/}
            <Route path="login" element={<Login />} />  
            <Route path="register" element={<Register />} />  
            <Route
              index
              element={
                // nếu qua được authen thì vào home
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="users">
              <Route
                index
                element={
                  // nếu qua được authen thì vào bảng thông tin server
                  <ProtectedRoute>
                    {/* userColumns chứa dữ liệu thô */}
                    <List columns={userColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":userId"
                element={
                  // chỉ là giao diện 
                  <ProtectedRoute>
                    <Single />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                     {/* userInputs là mảng chứa dữ liệu  */}
                    <New inputs={userInputs} title="Add New User" />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="hotels">
              <Route
                index
                element={
                  <ProtectedRoute>
                     {/* hotelColumns là mảng chứa dữ liệu  */}
                     {/* Hiển thị dữ liệu  */}
                    <List columns={hotelColumns} />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":productId"
                element={
                  <ProtectedRoute>
                  {/* Hiển thị dữ liệu cứng=> sau này muốn có những dữ liệu cụ thể thì cần truyền vào những prop  */}
                    <Single />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                  {/* Tạo khách sạn mới */}
                    <NewHotel  />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="rooms">
              {/* Danh sách các phòng => dữ liệu cứng  */}
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={roomColumns} />
                  </ProtectedRoute>
                }
              />
              {/* Cụ thể dữ liệu của từng phòng , dữ liệu cứng, chưa có gì ở trong cả */}
              <Route
                path=":productId"
                element={
                  <ProtectedRoute>
                    <Single />
                  </ProtectedRoute>
                }
              />
              {/* Thêm phòng mới */}
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewRoom  />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="orders">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <List columns={orderColumns} />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
