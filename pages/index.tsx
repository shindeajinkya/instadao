import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthenticateOptions } from "react-moralis/lib/hooks/core/useMoralis/_useMoralisAuth";
import illustration from "../assets/illustration.png";
import wallet from "../assets/Wallet.svg";
import Button from "../components/Button";
import { useMoralisData } from "../hooks/useMoralisData";
import { getSignedNonce } from "../utils/crypto";
import pattern1 from "../assets/pattern1.png";
import pattern2 from "../assets/pattern2.png";
import pattern3 from "../assets/pattern3.png";
import pattern4 from "../assets/pattern4.png";
import pattern5 from "../assets/pattern5.png";
import { ArrowNarrowRightIcon } from "@heroicons/react/solid";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    authenticate,
    isAuthenticated,
    account: walletAddress,
    user,
  } = useMoralisData();

  const queriedAddress = user?.get("ethAddress");
  const account = walletAddress ?? queriedAddress;

  const handleAuth = async () => {
    try {
      setLoading(true);
      const options: AuthenticateOptions = {
        signingMessage: `
					Get your audience support with crypto!\n
					With BuyMeACryptoCoffee your audience can support you with cryptocurrency.\n
					How does it work?\n
					- Supporter connects their Wallet on Crypto Coffee
					- They enter their favorite creator’s wallet address and donate crypto.
					- Creators can create their own crypto coffee page and share with their audience too
				`,
        chainId: process.env.NODE_ENV === "development" ? 4 : 1,
      };

      if (!(window as any).ethereum) {
        options.provider = "walletconnect";
      }

      await authenticate(options);

      // const nonce = await axios.get(`/api/auth/getNonce?address=${account}`);

      // console.log({ nonce: nonce.data });

      // const signature = await getSignedNonce(nonce.data.nonce);

      // console.log({ signature });

      // const token = await axios.post(`/api/auth/verifyNonce`, {
      //   address: account,
      //   signature,
      // });

      // console.log({ token: token.data });

      // await firebaseClient.default
      // 	.auth()
      // 	.signInWithCustomToken(token.data.token);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/create-dao");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex justify-center min-h-screen items-center bg-light-yellow">
      <div className="max-w-7xl flex space-x-4 justify-center items-center font-urbanist py-12 pb-0">
        <div className="w-full min-h-full flex justify-between items-center flex-col">
          <div>
            <div className="flex justify-center items-center flex-col mb-10">
              <p className="text-5xl font-audiowide xs:mx-4 lg:mx-60 xs:text-2xl text-center font-bold leading-tight mb-8">
                Setup your DAO instantly with{" "}
                <span className="bg-gradient-to-r from-neon-purple to-neon-peach bg-clip-text text-transparent">
                  InstaDAO
                </span>
              </p>
              <div className="flex space-x-6 items-center font-audiowide">
                {!loading && (
                  <Button size="lg" onClick={handleAuth}>
                    Connect your wallet{" "}
                    <ArrowNarrowRightIcon
                      width={24}
                      height={24}
                      className="ml-2"
                    />
                  </Button>
                )}

                {!!loading && <span>loading...</span>}
              </div>
            </div>
          </div>
          <div className="flex xs:hidden">
            <div className="-translate-y-12">
              <Image src={pattern1} />
            </div>
            <div className="translate-y-40 -translate-x-12">
              <Image src={pattern2} />
            </div>
            <div className="translate-y-28 -translate-x-12">
              <Image src={pattern3} />
            </div>
            <div>
              <Image src={pattern4} />
            </div>
            <div className="-translate-y-20">
              <Image src={pattern5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export const getStaticProps = async () => {
  return { props: { hideNavbar: true } };
};

/**
 *
 *
 * nonce ->
 * FE gets nonce -> metamask -> signature
 * BE verifies signature -> and check address
 * user gets nonce in DB
 *
 *
 *
 *
 *
 *
 */
