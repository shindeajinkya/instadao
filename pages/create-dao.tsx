import {
  ArrowSmRightIcon,
  ExternalLinkIcon,
  LockClosedIcon,
  PlusIcon,
} from "@heroicons/react/solid";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FileUpload, useFileUpload } from "use-file-upload";
import Button from "../components/Button";
import Select from "../components/Select";
import { useMoralisData } from "../hooks/useMoralisData";
import {
  contract,
  getAllEnsLinked,
  getDAODetails,
  getDAOForENS,
  getTexts,
  uploadImageToIPFS,
} from "../utils/crypto";
import availableDAOimage from "../assets/available.png";
import ensMissingimage from "../assets/ensMissing.png";
import Image from "next/image";
import { GetServerSideProps } from "next";
import Modal from "../components/Modal";
import * as blockies from "blockies-ts";
import { ethers } from "ethers";
import { sha256 } from "ethers/lib/utils";

// import { createGroup } from "../utils/moralis-db";

declare let window: any;

interface InputProps {
  label: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  showENSLink?: boolean;
  selectedEns?: string;
}

export interface DAOMetadata {
  logoURL: string;
  twitterURL: string;
  websiteURL: string;
  discordURL: string;
  snapshotURL: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  disabled = false,
  onChange,
  placeholder,
  showENSLink = false,
  selectedEns = "",
}) => {
  return (
    <div className="flex flex-col mb-5">
      <div className="flex justify-between">
        <span>{label}</span>
        {showENSLink && !!selectedEns?.length && (
          <a
            href={`https://app.ens.domains/name/${selectedEns}/details`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline flex"
          >
            Edit on ENS <ExternalLinkIcon width={20} height={20} />
          </a>
        )}
      </div>
      <div className="mt-2 relative">
        <input
          type="text"
          className="rounded-md w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        {disabled && (
          <LockClosedIcon
            width={24}
            height={24}
            className="absolute top-2 right-2"
          />
        )}
      </div>
    </div>
  );
};

interface ENSResponse {
  id: string;
  name: string;
  labelName: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { account: selfAddress, isAuthenticated } = useMoralisData();
  const [file, selectFile] = useFileUpload();
  const [selectedEns, setSelectedEns] = useState(null);
  const [ensList, setEnsList] = useState<ENSResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [daoName, setDaoName] = useState("");
  const [url, setUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [snapshotUrl, setSnapshotUrl] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [decimal, setDecimal] = useState(18);
  const [totalSupply, setTotalSupply] = useState(1000000);
  const [availableDAO, setAvailableDAO] = useState("");
  const [ensMissing, setEnsMissing] = useState(false);
  const [blockieSrc, setBlockieSrc] = useState("");

  const fetchLinkedENS = async () => {
    if (!selfAddress) return;
    const ensLinked = await getAllEnsLinked(selfAddress);
    setEnsList(ensLinked.data.domains);
    setSelectedEns(ensLinked.data.domains[0]);
    setEnsMissing(!ensLinked.data.domains?.length);
  };

  const fetchDAOForENS = async () => {
    if (!selfAddress) return;
    const createdDAO = await getDAOForENS(selectedEns.name);
    if (!!createdDAO.data.tokenEntities?.length) {
      console.log(createdDAO.data.tokenEntities[0]);
      setAvailableDAO(createdDAO.data.tokenEntities[0]?.name);
      return;
    }
    setAvailableDAO("");
  };

  const getAllURLsLinkedWithENS = async () => {
    if (!selfAddress) return;
    setLoading(true);
    try {
      const { discordURL, twitterURL, URL } = await getTexts(
        selectedEns.labelName
      );
      setDiscordUrl(discordURL);
      setTwitterUrl(twitterURL);
      setUrl(URL);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createDAO = async (
    supply: number,
    amt: number,
    deci: number,
    name: string,
    symbol: string,
    metadata: DAOMetadata,
    ens: string
  ) => {
    setLoading(true);
    try {
      const res = await contract().create(
        supply,
        amt,
        deci,
        name,
        symbol,
        JSON.stringify(metadata),
        ens,
        {
          gasLimit: 10000000,
        }
      );

      await res.wait();
    } catch (error) {
      console.error("Error creating DAO", error);
      toast.error("Error creating DAO");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDAO = async () => {
    if (
      !totalSupply ||
      !decimal ||
      !tokenSymbol.length ||
      !String(daoName).length
    ) {
      toast.error("Make sure you have filled all required fields");
      return;
    }
    const logoURL = await uploadImageToIPFS(blockieSrc);
    const metadata: DAOMetadata = {
      logoURL,
      twitterURL: twitterUrl,
      discordURL: discordUrl,
      snapshotURL: snapshotUrl,
      websiteURL: url,
    };
    await createDAO(
      totalSupply,
      10000,
      decimal,
      String(daoName),
      tokenSymbol,
      metadata,
      selectedEns?.name
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinkedENS();
    }
  }, [isAuthenticated, selfAddress]);

  useEffect(() => {
    if (selectedEns) {
      getAllURLsLinkedWithENS();
      fetchDAOForENS();
      setDaoName(selectedEns.labelName);
      setTokenSymbol(selectedEns.labelName);
      const imgSrc = blockies.create({ seed: selectedEns.name }).toDataURL();
      setBlockieSrc(imgSrc);
    }
  }, [selectedEns]);

  return (
    <div className="bg-light-yellow min-h-screen">
      <div className="max-w-7xl pt-7 sm:px-8 rounded-t-3xl my-0 mx-auto pb-0">
        <div className="flex justify-between font-audiowide py-6 px-4 rounded-md border-black border items-center bg-white">
          <h1 className="text-2xl xs:text-xl">Project Details</h1>
          <div className="flex items-center">
            <p className="text-md mr-4">Select ENS:</p>
            <Select
              options={ensList.map(({ name, id }) => ({
                label: name,
                key: id,
              }))}
              value={selectedEns?.id}
              onChange={(e) => {
                setSelectedEns(ensList.find((ens) => ens.id === e));
                setDaoName(ensList.find((ens) => ens.id === e)?.labelName);
                // setTokenSymbol(ensList.find((ens) => ens.id === e)?.labelName);
              }}
            />
          </div>
        </div>
        {!!availableDAO?.length ? (
          <div className="flex flex-col text-2xl justify-center font-audiowide items-center w-full h-full bg-white mt-4 border border-black rounded-md pt-6 pb-16 px-8">
            <Image src={availableDAOimage} />
            <span className="text-center mx-40">
              DAO is already available with this ENS domain. Please switch to
              other ENS domain to create a new DAO.
            </span>
            <a
              href={`/${availableDAO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white text-lg py-3 px-12 flex items-center space-x-8 mt-6"
            >
              Open {availableDAO} DAO
              <ArrowSmRightIcon width={24} height={24} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-1 font-audiowide gap-4 mt-4">
            <div className="bg-white p-8 rounded-lg border border-black">
              <p className="text-lg">DAO Details</p>
              <hr className="mt-4 mb-4" />
              <Input
                label="Name"
                value={String(daoName)}
                // onChange={(e) => setDaoName(e.target.value)}
                selectedEns={selectedEns?.name}
                disabled
              />
              <Input
                label="URL"
                disabled
                showENSLink
                selectedEns={selectedEns?.name}
                value={url}
              />
              <Input
                label="Twitter"
                disabled
                showENSLink
                selectedEns={selectedEns?.name}
                value={twitterUrl}
              />
              <Input
                label="Discord"
                disabled
                showENSLink
                selectedEns={selectedEns?.name}
                value={discordUrl}
              />
              <Input
                label="Snapshot"
                value={snapshotUrl}
                onChange={(e) => setSnapshotUrl(e.target.value)}
              />
            </div>
            <div className="bg-white rounded-lg p-8 border border-black">
              <p className="text-lg mb-4">Token Details</p>
              <hr className="mt-4 mb-4" />
              <div className="flex flex-col mb-4">
                <span className="mb-4">Token Logo</span>
                <div className="flex space-x-6">
                  <img
                    src={blockieSrc}
                    className="cursor-pointer w-16 rounded-lg flex items-center justify-center"
                  />
                  {false && (
                    <div
                      className="cursor-pointer w-16 h-16 border border-black rounded-lg flex items-center justify-center"
                      onClick={() =>
                        selectFile(
                          { multiple: false, accept: "image/*" },
                          (f) => {}
                        )
                      }
                    >
                      {!file ? (
                        <PlusIcon width={30} height={30} />
                      ) : (
                        <img
                          src={(file as FileUpload).source as any}
                          className="cursor-pointer w-16 rounded-lg flex items-center justify-center"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Input
                label="Token Symbol"
                value={`$${tokenSymbol}`}
                // onChange={(e) => setTokenSymbol(e.target.value)}
                disabled
              />
              <Input
                label="Decimals"
                value={decimal}
                // onChange={(e) => setDecimal(Number(e.target.value))}
                disabled
              />
              <Input
                label="Token Supply"
                value={totalSupply}
                // onChange={(e) => setTotalSupply(Number(e.target.value))}
                disabled
              />
              <Button
                className="w-full"
                loading={loading}
                onClick={handleCreateDAO}
              >
                Create DAO
              </Button>
            </div>
          </div>
        )}
      </div>
      <Modal open={ensMissing}>
        <div className="flex flex-col items-center justify-center font-audiowide mx-6">
          <Image src={ensMissingimage} />
          <span className="text-base mt-4">
            You do not have an ENS. To proceed, purchase an ENS.
          </span>
          <a
            href="https://app.ens.domains/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-4 bg-black text-white px-12 py-2 mt-4 rounded-lg"
          >
            <span>Visit ENS Website</span>
            <ArrowSmRightIcon width={24} height={24} />
          </a>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
