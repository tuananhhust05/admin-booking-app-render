
// nạp dữ liệu mặc định cho state
const INITIAL_STATE = {
    destination:  null,
    date: [],
    options: {
      adult: null,
      children:  null,
      room:  null,
    },
    listOrderPending:[],
    listNotification:[],
    isOpenChat:false,
    listOrder:[],
    countConversationUnreader:0,
    listConv:[],
    chatMode:false,
    conversationChosen:{},
    listMess:[],
    isOpenSideBar:true,
    countLoadedMessage:0
};  
// { destination, date, options }
// reducer bản chất là 1 hàm nhận vào 2 đối số
// đẩy dữ liệu mặc định vào store 
const add_arr_to_arr = (arr1,arr2)=>{
  for(let i=0;i<arr1.length;i++){
     arr2.push(arr1[i])
  };
  return arr2;
}
const SearchReducerRedux = (state =INITIAL_STATE, action) => {  // state lấy mặc định từ store 
    switch (action.type) {
      case "OPENCLOSESIDEBAR":
        return{
          ...state, 
          isOpenSideBar: action.payload.status 
        } 
      case "OPENCLOSECHAT":
        return{
          ...state, 
          isOpenChat: action.payload.status 
        } 
      case "ADDMESS":
        return { 
          ...state, 
          listMess: (state.chatMode && state.conversationChosen._id && (String(state.conversationChosen._id) === String(action.payload.newMess.conversationId))) ? [action.payload.newMess,...state.listMess] : state.listMess,
          countConversationUnreader: (
                                        (state.chatMode && state.conversationChosen._id && (String(state.conversationChosen._id) === String(action.payload.newMess.conversationId)))
                                        || ( state.listConv.find((e)=> String(e._id) === String(action.payload.newMess.conversationId)  ))
                                     ) 
                                     ? state.countConversationUnreader : (state.listConv.filter((e)=> Number(e.unReader) === 1).length + 1),
          listConv: state.listConv.map(
            (conv, i) => String(conv._id) === String(action.payload.newMess.conversationId) ? 
                                     {
                                       unReader:1,
                                       _id:action.payload.newMess.conversationId,
                                       timeLastMessage:action.payload.newMess.createAt,
                                       memberList:conv.memberList,
                                       messageList:[action.payload.newMess],
                                     }
                                    : conv
          )
        }
      case "LISTMESS":
        return { 
          ...state, 
          listMess: action.payload.listMess,
          countLoadedMessage:action.payload.listMess.length
        }
      case "LOADMESS":
        return { 
          ...state, 
          listMess: add_arr_to_arr(action.payload.listMess,state.listMess) ,
          countLoadedMessage:Number(state.countLoadedMessage) + action.payload.listMess.length
        }
      case "ADDCONV":
        return { 
          ...state, 
          listConv: [action.payload.newConv,...state.listConv]
        }
      case "CHOOSECONV":
        return { 
          ...state, 
          conversationChosen: action.payload.conversationChosen
        }
      case "CHANGECHATMODE":
        return { 
          ...state, 
          chatMode: action.payload.chatMode
        }
      case "COUNTCONVERSATIONUNREADER":
        return { 
          ...state, 
          countConversationUnreader: action.payload.count
        }
      case "LISTCONV":
        return { 
          ...state, 
          listConv: action.payload.listConv
        }
      case "UPDATELISTCONV":
        return { 
          ...state, 
          listConv: state.listConv.map(
            (conv, i) => String(conv._id) === action.payload.idconv ? action.payload.updateConv
                                    : conv
          )
        }
      case "CHANGECONVERSATIONUNREADER":
        return { 
          ...state, 
          countConversationUnreader: state.countConversationUnreader + action.payload.count
        }
      case "LISTORDERPENDING":
        return { 
          ...state, 
          listOrderPending: action.payload.listOrder
        }
      case "ADDORDERPENDING":
        return{
          ...state, 
          listOrderPending: [action.payload.newOrder,...state.listOrderPending]
        }
      case "REMOVEPENDINGORDER":
        return{
          ...state, 
          listOrderPending: state.listOrderPending.filter(item => String(item._id) !== action.payload.OrderId),
        }
      case "LISTNOTIFICATION":
        return { 
          ...state, 
          listNotification: action.payload.listNotification
        }
      case "ADDNOTIFICATION":
        return { 
          ...state, 
          listNotification: [action.payload.newNotification,...state.listNotification]
        }
      case "READNOTIFICATION":
        return { 
          ...state, 
          listNotification: state.listNotification.map(
            (notification, i) => String(notification._id) === String(action.payload.idNotify) ? {...notification, Status: 0}
                                    : notification
          )
        }
      case "NEW_SEARCH":
        return { 
          ...state, 
          destination: action.payload.destination,
          date: action.payload.date,
          options: action.payload.options,
        }
      case "RESET_SEARCH":
        return INITIAL_STATE;
      default: // luôn phải set default action
        return state;
    }
};
export default SearchReducerRedux;