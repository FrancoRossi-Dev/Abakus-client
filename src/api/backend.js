import axios from "axios";

const backend = axios.create({
  baseURL: "https://abakus-gamma.vercel.app/v1",
});

export default backend;