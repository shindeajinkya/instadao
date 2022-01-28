import { useRouter } from "next/router";
import React, { ReactText, useEffect, useState } from "react";
import { useChain, useNativeBalance } from "react-moralis";
import { toast } from "react-toastify";
import { Transaction } from "../../contracts";
import { useMoralisData } from "../../hooks/useMoralisData";
import { saveTransaction } from "../../utils/firebaseQueries";
import { tokenMetadata } from "../../utils/tokens";
import { useEnsAddress } from "../../utils/useEnsAddress";
import Button from "../Button";

interface Token {
	readonly name: string;
	readonly symbol: string;
	readonly balance: ReactText;
	readonly decimals: number;
	readonly tokenAddress: string | null;
	readonly logo?: string;
}

const PaymentSection = ({ propAmount, settleAmount }) => {
	const { account: address, user, web3, chainId, sendTx } = useMoralisData();
	const {
		query: { id },
	} = useRouter();

	const { address: otherAddress, name: ens } = useEnsAddress(id?.toString());

	const { switchNetwork } = useChain();

	const [price, setPrice] = useState(0);
	const [message, setMessage] = useState("");
	const [receiverAddress, setReceiverAddress] = useState<string>("");

	const [selectedToken, setSelectedToken] = useState<string>();
	const [isLoading, setIsLoading] = React.useState(false);

	const {
		getBalances,
		data: nativeData,
		isFetching: isFetchingNative,
		isLoading: isLoadingNative,
		error: errorNative,
	} = useNativeBalance({
		address,
		chain: chainId as any,
	});

	const fetchBalances = async () => {
		await getBalances();
	};
	const nativeTokenName = nativeData?.formatted?.split(" ")[1] ?? "";
	const cleanedNativeTokens = {
		symbol: nativeTokenName,
		balance:
			nativeData.formatted ??
			`${(nativeData.balance
				? Number(nativeData.balance) / 10 ** 18
				: 0
			).toPrecision(3)} ETH`,
		name: nativeTokenName,
		decimals: 18,
		tokenAddress: null,
		logo: tokenMetadata[nativeTokenName]?.logoURI,
	};

	const handleTransaction = async () => {
		try {
			setIsLoading(true);
			const tx = await sendTx(receiverAddress, price, message);
			toast.success(`Transaction sent! Tx hash: ${tx.hash}`);

			const newTx: Transaction = {
				...new Transaction(),
				id: tx.hash,
				groupId: String(id),
				from: address,
				to: receiverAddress,
				amount: price,
				createdAt: new Date().getTime(),
			};

			await saveTransaction(newTx);
			setMessage("");
			setPrice(0);
		} catch (error) {
			toast.error(error.message);
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const tokensArray: Token[] = [cleanedNativeTokens];

	const disableDonateButton = isLoadingNative || isFetchingNative || !price;

	const selectedTokenData =
		tokensArray.find((token) => token.name === selectedToken) ??
		cleanedNativeTokens;

	const handleMax = () => {
		setPrice(
			Number((selectedTokenData.balance as string)?.split(" ")[0] ?? 0)
		);
	};

	const handleChangeToMatic = () => {
		switchNetwork("0x1");
	};

	const { symbol } = selectedTokenData;

	useEffect(() => {
		if (!!address) {
			fetchBalances();
		}
	}, [address]);

	useEffect(() => {
		if (!!propAmount) {
			setPrice(Math.abs(propAmount));
			setMessage(`Sending you ${Math.abs(propAmount)} ETH`);
			settleAmount(0);
		}
	}, [propAmount]);

	useEffect(() => {
		if (!!id) {
			setReceiverAddress(otherAddress);
		}
	}, [id, otherAddress]);

	return (
		<div className="grid gap-6 w-full">
			{/* <AddressInput
				defaultValue={receiverAddress}
				onChange={setReceiverAddress}
			/> */}

			<div className="rounded-md mt-2 ">
				<div className="flex items-center justify-between border border-solid  border-gray-600 border-opacity-20 bg-white bg-opacity-10 rounded-md">
					<input
						type="number"
						name="amount"
						id="amount"
						min="0"
						value={price}
						onChange={(e) => setPrice(Number(e.target.value))}
						style={{
							appearance: "none",
						}}
						className="block text-2xl w-full font-bold border-none  border-gray-600 border-opacity-20 bg-transparent rounded-md text-right focus:ring-0 shadow-none cursor-pointer transition duration-300 ease-in-out"
						placeholder="Enter amount in ETH"
					/>
					<button
						className="mr-4 opacity-80 rounded-lg"
						onClick={handleMax}
					>
						MAX
					</button>
				</div>
				<div className="mt-2 text-xs text-right">
					BALANCE: {selectedTokenData?.balance ?? 0}
				</div>
			</div>

			<textarea
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				rows={4}
				name="comment"
				id="comment"
				placeholder="Add notes to the payment"
				className=" shadow-sm placeholder-opacity-50 placeholder-border-gray-600 block w-full sm:text-sm border border-solid  border-gray-600 border-opacity-20 bg-white bg-opacity-10 rounded-md p-2"
			/>

			<Button
				type="button"
				disabled={isLoading}
				onClick={handleTransaction}
				loading={isLoading}
				size="lg"
			>
				Send {!!symbol ? `( ${price} ${symbol} )` : ""}
			</Button>
		</div>
	);
};

export default PaymentSection;
