import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if((url.trim()!="") && ((String(url).split("/")[String(url).split("/").length-1]) != "Pending") ){
          const res = await axios.get(url);
          setData(res.data);
        }
        else{
          setData([])
        }
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [url]);

  const reFetch = async () => {
    setLoading(true);
    try {
      if((url.trim()!="") && ((String(url).split("/")[String(url).split("/").length-1]) != "Pending") ){
        const res = await axios.get(url);
        setData(res.data);
      }
      else{
        setData([])
      }
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
