import "@/styles/globals.css";
import Navbar from "../components/NavigationBar";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar/>
      <Component {...pageProps} />
    </>
  );
}
