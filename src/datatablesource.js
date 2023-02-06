import CheckIcon from '@mui/icons-material/Check';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
export const userColumns = [
 
  {
    field: "_id",
    headerName: "Email",
    width: 230,
  },

  {
    field: "count",
    headerName: "Number Order",
    width: 100,
  }
];

export const hotelColumns = [
  { field: "_id", headerName: "ID", width: 250 },
  {
    field: "name",
    headerName: "Name",
    width: 150,
  },
  {
    field: "type",
    headerName: "Type",
    width: 100,
  },
  {
    field: "title",
    headerName: "Title",
    width: 230,
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
  }
];

export const roomColumns = [
  // { field: "_id", headerName: "ID", width: 70 },
  {
    field: "title",
    headerName: "Title",
    width: 230,
  },
  {
    field: "desc",
    headerName: "Description",
    width: 200,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
  },
  {
    field: "maxPeople",
    headerName: "Max People",
    width: 50,
  },
  {
    field: "hotelNameOwn",
    headerName: "Hotel",
    width: 200,
  },
];

export const orderColumns = [
  {
    field: "HotelName",
    headerName: "Hotel",
    width: 100,
  },
  {
    field: "CategoryRoomDesc",
    headerName: "Service",
    width: 100,
  },
  {
    field: "RoomNumber",
    headerName: "Room",
    width: 100,
  },
  {
    field: "Price",
    headerName: "Price",
    width: 100,
  },
  {
    field: "DateOrder",
    headerName: "Order Day",
    width: 100,
    renderCell: (params) => (
      <div>
          {new Date(params.row.DateOrder).getDate()}/{new Date(params.row.DateOrder).getMonth()+1}/{new Date(params.row.DateOrder).getFullYear()}
      </div>
    )
  },
  {
    field: "FirstDayServe",
    headerName: "Start Day",
    width: 100,
    renderCell: (params) => (
      <div>
          {new Date(params.row.FirstDayServe).getDate()}/{new Date(params.row.FirstDayServe).getMonth()+1}/{new Date(params.row.FirstDayServe).getFullYear()}
      </div>
    )
  },
  {
    field: "LastDayServe",
    headerName: "End Day",
    width: 100,
    renderCell: (params) => (
      <div>
          {new Date(params.row.LastDayServe).getDate()}/{new Date(params.row.LastDayServe).getMonth()+1}/{new Date(params.row.LastDayServe).getFullYear()}
      </div>
    )
  },
  {
    field: "statusServe",
    headerName: "Status",
    width: 250,
    renderCell: (params) => (
      <div>
        {
          ( new Date(params.row.FirstDayServe) > new Date())?(
            <div style={{color:"blue",display:"flex"}}>
               <AccessAlarmIcon style={{color:"blue",margin:"0 5px"}}/>
               Chưa đến thời gian phục vụ
            </div>
          ):( 
              <>
                {
                  (new Date(params.row.LastDayServe) < new Date()) ? (
                    <div style={{color:"green",display:"flex"}}>
                      <CheckIcon style={{color:"green",margin:"0 5px"}}/>
                      Đã hết thời gian phục vụ
                    </div>
                  ) :(
                    <div style={{color:"green",display:"flex"}}>
                          <CheckIcon style={{color:"green",margin:"0 5px"}}/>
                          Đang trong thời gian phục vụ
                    </div>
                  )
                }
              </>
          )
        }
      </div>
    )
  }
];
