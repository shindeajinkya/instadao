import { ethers } from "ethers";
import { useChain, useNativeTransactions } from "react-moralis";
import { TransactionLog } from "../contracts";
import { useMoralisData } from "./useMoralisData";

const useTransactions = (
	toAddress: string
): {
	result: TransactionLog[];
	error: Error;
	isLoading: boolean;
	fetchData: () => void;
} => {
	const { account } = useMoralisData();

	const { chainId } = useChain();

	const { getNativeTransations, data, error, isLoading, isFetching } =
		useNativeTransactions({
			chain: chainId as any,
			address: account,
		});

	const result =
		data?.result?.filter(
			(transaction) =>
				transaction.to_address?.toLowerCase() ===
					toAddress?.toLowerCase() ||
				transaction.from_address?.toLowerCase() ===
					toAddress?.toLowerCase()
		) ?? [];

	const cleanedResult: TransactionLog[] = result.map((transaction) => {
		const gwei = Number(transaction.gas_price) / 10 ** 9;
		const gasLimit = Number(transaction.gas);
		const gasAmount = (gwei * gasLimit) / 10 ** 9;

		return {
			txId: transaction.hash,
			from: transaction.from_address,
			to: transaction.to_address,
			amount: Number(ethers.utils.formatEther(transaction.value)),
			message: transaction.input === "0x" ? "" : transaction.input,
			createdAt: new Date(transaction.block_timestamp).getTime(),
			fromBlock: parseInt(transaction.block_number, 10),
			gas: parseFloat(gasAmount.toPrecision(3)),
		};
	});

	return {
		result: cleanedResult,
		error,
		isLoading,
		fetchData: getNativeTransations,
	};
};

export default useTransactions;
