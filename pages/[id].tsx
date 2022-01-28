import { DuplicateIcon } from "@heroicons/react/outline";
import {
  ArrowSmLeftIcon,
  ArrowSmRightIcon,
  ArrowSmUpIcon,
} from "@heroicons/react/solid";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import PieChart from "../components/PieChart";
import { getEllipsisTxt } from "../helpers/formatters";
import { useMoralisData } from "../hooks/useMoralisData";
import { createGroup } from "../utils/firebaseQueries";
import { Input } from "./create-dao";

// import { createGroup } from "../utils/moralis-db";

declare let window: any;

interface LinkProps {
  href: string;
  label: string;
}

export const Link: React.FC<LinkProps> = ({ href, label }) => {
  return (
    <div className="p-2 border border-black rounded-xl flex items-center ml-4">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
      <ArrowSmUpIcon width={24} height={24} className="rotate-45" />
    </div>
  );
};

const DAODetail: React.FC = () => {
  const router = useRouter();
  const { account: selfAddress } = useMoralisData();
  const [address, setAddress] = useState("");
  const [ens, setEns] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const handleAddressChange = async (address: string, ens: string) => {
    if (!address) {
      return;
    }
    console.log(address, ens);

    setEns(ens ?? null);
    setAddress(address);
  };

  return (
    <div className="bg-light-yellow min-h-screen">
      <div className="max-w-7xl pt-7 rounded-t-3xl my-0 mx-auto pb-0">
        <div className="flex justify-between font-audiowide py-6 px-4 rounded-md border-black border items-center bg-white">
          <div className="flex">
            <h1 className="text-2xl mr-4">Rungta</h1>
            <div className="flex items-center ">
              <a
                href={`https://instadao.xyz/rungta`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-l-lg bg-gray-100"
              >
                instadao.xyz/rungta
              </a>
              <div className="bg-gray-200 p-2 rounded-r-lg">
                <DuplicateIcon width={20} height={20} />
              </div>
            </div>
          </div>
          <div className="flex">
            <Link href={`https://instadao.xyz/rungta`} label="Snapshot" />
            <Link href={`https://instadao.xyz/rungta`} label="Twitter" />
            <Link href={`https://instadao.xyz/rungta`} label="Discord" />
            <Link href={`https://instadao.xyz/rungta`} label="pratyush.wtf" />
          </div>
        </div>
        <div className="grid grid-cols-2 font-audiowide gap-4 mt-4">
          <div className="bg-white p-8 rounded-lg border border-black">
            <p className="text-lg">Token Details</p>
            <hr className="mt-4 mb-4" />
            <div>
              <PieChart width={500} height={500} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-8 border border-black">
            <p className="text-lg mb-4">Token Details</p>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Token Name</p>
              <p>$Rungta</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Address</p>
              <p>
                {getEllipsisTxt("0xcf193782f2ebc069ae05ec0ef955e4b042d000dd")}
              </p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Volume</p>
              <p>Ξ11,613 ($29,407,127)</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">token Supply</p>
              <p>1,000,000</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Token Price</p>
              <p>0.005 Ξ ($29)</p>
            </div>
            <Button className="w-full py-5 mt-8">
              Buy tokens <ArrowSmRightIcon width={24} height={24} />
            </Button>
            <div className="border border-black bg-gray-100 mt-3 py-3 px-4 rounded-md">
              <div className="flex justify-between items-center">
                <p className="text-lg">Your balance</p>
                <p>500 $Rungta</p>
              </div>
              <hr className="mt-2 mb-2" />
              <div className="flex justify-between items-center">
                <p className="text-lg">Your Own</p>
                <p>5.022 %</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAODetail;
