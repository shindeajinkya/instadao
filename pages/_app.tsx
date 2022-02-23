import "antd/dist/antd.css";
import Head from "next/head";
import Link from "next/link";
import NextNProgress from "nextjs-progressbar";
import React from "react";
import { MoralisProvider } from "react-moralis";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactTooltip from "react-tooltip";
import "tailwindcss/tailwind.css";
import Account from "../components/Account";
import Chains from "../components/Chains";
import Logo from "../components/Logo";
import MetaHead from "../components/MetaHead";
import "./globals.css";

const APP_ID = process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const GTag = "G-4HENSLHDZS";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const hideNavbar = pageProps.hideNavbar;
  return (
    <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
      <NextNProgress height={7} color="#9366F9" />
      <MetaHead />
      <Head key="main-head">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap"
          rel="stylesheet"
        />

        {process.env.NODE_ENV === "production" &&
          typeof window !== "undefined" && (
            <>
              {/* <script
                async
                type="text/javascript"
                src={`https://www.googletagmanager.com/gtag/js?id=${GTag}`}
              /> */}
              {/* <!-- Google Tag Manager --> */}
              {/* <script
                dangerouslySetInnerHTML={{
                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
								new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
								j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
								'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
								})(window,document,'script','dataLayer','GTM-PWX4GJW');`,
                }}
              /> */}
              {/* <!-- End Google Tag Manager --> */}
              {/* <script
                dangerouslySetInnerHTML={{
                  __html: `
										window.dataLayer = window.dataLayer || [];
										function gtag(){dataLayer.push(arguments);}
										gtag('js', new Date());
										gtag('config', '${GTag}', { page_path: window.location.pathname });
										`,
                }}
              /> */}
            </>
          )}
      </Head>

      {!hideNavbar && (
        <header className="border-b border-black">
          <div className="max-w-7xl mx-auto lg:px-8">
            <div className="flex items-center w-full justify-between py-5">
              <div className="flex px-2 lg:px-0">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/">
                    <div className="inline-flex items-center">
                      <Logo />
                    </div>
                  </Link>
                </div>
              </div>
              <div className="flex space-x-6 items-center">
                {/* <Chains /> */}
                <Account />
              </div>
            </div>
          </div>
        </header>
      )}

      <Component {...pageProps} />
      <footer className="h-12 font-audiowide flex items-center justify-center space-x-12 fixed inset-x-0 bottom-0 bg-white w-full">
        <a 
          href="" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black"
        >
          Tech Doc
        </a>
        <div className="w-3 h-3 bg-gray-200 rounded-full" />
        <a 
          href="https://github.com/shindeajinkya/instadao" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black"
        >
          Github Repo
        </a>
        <div className="w-3 h-3 bg-gray-200 rounded-full" />
        <a 
          href="https://etherscan.io/address/0x6cfa18a6e2a4dc5e6d00e9037ab545ea60c12ff8" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black"
        >
          Smart Contract
        </a>
        <div className="w-3 h-3 bg-gray-200 rounded-full" />
        <a 
          href="https://mirror.xyz/madhavanmalolan.eth/OMGH_SQ9E97r2-iXzY2ndQQgOuTUXdVaM-VBoiT0mIg" 
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black"
        >
          Bounty Doc
        </a>
      </footer>
      <ToastContainer />
      <ReactTooltip effect="solid" />
    </MoralisProvider>
  );
}

export default MyApp;
