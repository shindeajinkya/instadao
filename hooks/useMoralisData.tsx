import { ethers } from "ethers";
import { MoralisContextValue, useChain, useMoralis } from "react-moralis";

export const useMoralisData = (): MoralisContextValue & {
	readonly isMainnet: boolean;
	readonly chainId: string;
	readonly sendTx: (
		receiver: string,
		amount: number,
		message: string
	) => Promise<ethers.providers.TransactionResponse>;
} => {
	const { account, ...moralis } = useMoralis();
	const { chainId } = useChain();

	const { user, web3 } = moralis;

	const address: string = user?.get("ethAddress") ?? account;

	const mainnetChainId = 1;
	const mainnetChain = "0x1";

	const ethereumObjPresent =
		typeof window !== "undefined" && !!(window as any)?.ethereum;

	const isWalletconnectOnMainnet =
		(web3.currentProvider as any)?.chainId === mainnetChainId &&
		!ethereumObjPresent;

	const isMainnet =
		!!isWalletconnectOnMainnet ||
		(ethereumObjPresent && chainId !== mainnetChain);

	const currentChain: string =
		chainId ?? (web3.currentProvider as any)?.chainId; // on walletconnect, value for chainId is undefined

	const sendTx = async (
		receiver: string,
		amount: number,
		message: string
	) => {
		const { ethereum } = window as any;

		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			ethers.utils.getAddress(receiver);
			const hexaMessage = ethers.utils.formatBytes32String(message);
			const tx = await signer.sendTransaction({
				to: receiver,
				value: ethers.utils.parseEther(amount.toString()),
				data: hexaMessage,
			});

			return tx;
		}
	};

	return {
		...moralis,
		account: address?.toLowerCase(),
		user,
		web3,
		isMainnet,
		chainId: currentChain,
		sendTx,
	};
};
