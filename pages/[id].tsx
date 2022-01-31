import { DuplicateIcon } from "@heroicons/react/outline";
import {
  ArrowSmLeftIcon,
  ArrowSmRightIcon,
  ArrowSmUpIcon,
} from "@heroicons/react/solid";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import PieChart from "../components/PieChart";
import { getEllipsisTxt } from "../helpers/formatters";
import { useMoralisData } from "../hooks/useMoralisData";
import {
  getAllEnsLinked,
  getDAODetails,
  getTokenTransferDetails,
} from "../utils/crypto";
import { createGroup } from "../utils/firebaseQueries";
import { DAOMetadata, Input } from "./create-dao";
import copy from "copy-to-clipboard";
import { useTooltip } from "@visx/tooltip";

// import { createGroup } from "../utils/moralis-db";

declare let window: any;

interface LinkProps {
  href: string;
  label: string;
}

export interface DaoData {
  id: string;
  count: string;
  tokenaddress: string;
  creator: string;
  name: string;
  ensName: string;
  metadata: string;
  symbol: string;
  totalSupply: string;
  decimals: string;
}

export interface DaoDetailsProps {
  daoData: DaoData;
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

const formatBalance = (amount: number, decimals: number) =>
  amount / 10 ** decimals;

const DAODetail: React.FC<DaoDetailsProps> = ({ daoData }) => {
  if (!daoData) {
    return <>Not Found</>;
  }
  const { name, symbol, tokenaddress, totalSupply, metadata, decimals } =
    daoData;
  const metadataObject = !!metadata.length ? JSON.parse(metadata) : null;
  const router = useRouter();
  const { account: selfAddress, isAuthenticated } = useMoralisData();
  const [address, setAddress] = useState("");
  const [ens, setEns] = useState<string | null>("");
  const [tokenTranfers, setTokenTransfers] = useState([]);
  const [balanceMapping, setBalanceMapping] = useState<Record<string, number>>(
    {}
  );
  const [remainingSupply, setRemainingSupply] = useState(0);
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState([]);

  const fetchTokenTransferDetails = async () => {
    const tokenTransferDetails = await getTokenTransferDetails(tokenaddress);
    setTokenTransfers(tokenTransferDetails);
  };

  const balanceMapper = () => {
    if (!tokenTranfers.length) return;
    let remainingSupply = Number(totalSupply) * 10 ** 18;
    let holdings = [];
    const addressToBalance = tokenTranfers.reduce((final, curr) => {
      const { to, amt } = curr;
      if (!!final[to]) {
        final[to] += Number(amt);
      } else {
        final = {
          ...final,
          [to]: Number(amt),
        };
      }
      if (curr?.from) {
        final[curr.from] -= Number(amt);
      } else {
        remainingSupply -= Number(amt);
      }
      setRemainingSupply(formatBalance(remainingSupply, Number(decimals)));

      return final;
    }, {});

    holdings = Object.keys(addressToBalance).map((address) => ({
      address,
      balance: formatBalance(addressToBalance[address], Number(decimals)),
    }));

    setHoldings(holdings);
    // console.log();
    setBalanceMapping(addressToBalance);
  };

  useEffect(() => {
    if (!!tokenaddress?.length) {
      fetchTokenTransferDetails();
    }
  }, [daoData]);

  useEffect(() => {
    if (!!tokenTranfers?.length) {
      balanceMapper();
    }
  }, [tokenTranfers]);

  return (
    <div className="bg-light-yellow min-h-screen">
      <div className="max-w-7xl pt-7 rounded-t-3xl my-0 mx-auto pb-0">
        <div className="flex justify-between font-audiowide py-6 px-4 rounded-md border-black border items-center bg-white">
          <div className="flex">
            <h1 className="text-2xl mr-4">{name}</h1>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                copy(`https://instadao.org/${name}`);
              }}
            >
              <span className="p-2 rounded-l-lg bg-gray-100">
                instadao.org/{name}
              </span>
              <div className="bg-gray-200 p-2 rounded-r-lg">
                <DuplicateIcon width={20} height={20} />
              </div>
            </div>
          </div>
          <div className="flex">
            {!!metadataObject?.snapshotURL?.length && (
              <Link href={`https://instadao.xyz/rungta`} label="Snapshot" />
            )}
            {!!metadataObject?.twitterURL?.length && (
              <Link href={`https://instadao.xyz/rungta`} label="Twitter" />
            )}
            {!!metadataObject?.discordURL?.length && (
              <Link href={`https://instadao.xyz/rungta`} label="Discord" />
            )}
            {!!metadataObject?.websiteURL?.length && (
              <Link href={`https://instadao.xyz/rungta`} label="pratyush.wtf" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 font-audiowide gap-4 mt-4">
          <div className="bg-white p-8 rounded-lg border border-black">
            <p className="text-lg">Token Distribution</p>
            <hr className="mt-4 mb-4" />
            <div>
              <PieChart
                width={500}
                height={500}
                data={[
                  ...holdings,
                  {
                    address: "not yet minted",
                    balance: remainingSupply,
                  },
                ]}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg p-8 border border-black">
            <p className="text-lg mb-4">Token Details</p>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Token Name</p>
              <p>{symbol}</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Address</p>
              <p>{getEllipsisTxt(tokenaddress)}</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Volume</p>
              {/* <p>Ξ11,613 ($29,407,127)</p> */}
              <p>Add Token on Uniswap</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">token Supply</p>
              <p>{totalSupply}</p>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="flex justify-between">
              <p className="text-lg">Token Price</p>
              {/* <p>0.005 Ξ ($29)</p> */}
              <p>Add Token on Uniswap</p>
            </div>
            <a
              href={`
                https://app.uniswap.org/#/swap?exactField=output&outputCurrency=${tokenaddress}
              `}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-black text-white text-xl rounded-md w-full py-5 mt-8"
            >
              Buy tokens <ArrowSmRightIcon width={24} height={24} />
            </a>
            {isAuthenticated && (
              <div className="border border-black bg-gray-100 mt-3 py-3 px-4 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="text-lg">Your balance</p>
                  <p>{`${formatBalance(
                    balanceMapping[selfAddress],
                    Number(decimals)
                  )} ${symbol}`}</p>
                </div>
                <hr className="mt-2 mb-2" />
                <div className="flex justify-between items-center">
                  <p className="text-lg">Your Own</p>
                  <p>{`${
                    (formatBalance(
                      balanceMapping[selfAddress],
                      Number(decimals)
                    ) /
                      Number(totalSupply)) *
                    100
                  } %`}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.params;
  const daoData = await getDAODetails(id as string);

  return {
    props: {
      daoData: daoData ?? null,
    },
  };
};

export default DAODetail;
