import "./chart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState ,useContext} from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from 'axios'
import {url} from '../../config.js'
const Chart = ({ aspect, title }) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  useEffect(() => {
    const takeData= async()=>{ 
      const res = await axios.get(`${url()}/orders/TakeInComeSixMonthLatest/${user._id}`); // gửi token để check 
      // console.log("Dữ liệu biểu đồ",res.data)
      if(res && res.data){
        setData(res.data)
      }
    }
    takeData();
  }, [user._id]);
  return (
    <div className="chart">
      <div className="title">Report Order after and before</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <AreaChart
          width={730}
          height={250}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="gray" />
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="Total"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#total)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
