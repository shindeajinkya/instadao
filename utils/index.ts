import { ethers } from "ethers";
import { Group, Transaction, TransactionLog } from "../contracts";
import { db, firestoreCollections } from "./firebaseClient";
import { saveTransaction } from "./firebaseQueries";

export const minimizeAddress = (
	address?: string,
	currUser?: string
): string => {
	if (!address) return "";

	if (address.toLowerCase() === currUser?.toLowerCase()) return "you";
	return (
		address.substring(0, 6) + "..." + address.substring(address.length - 4)
	);
};

export const importTransaction = async (
	txId: string,
	group: Group
): Promise<void> => {
	const tx = await db
		.collection(firestoreCollections.TRANSACTIONS)
		.where("id", "==", txId)
		.where("groupId", "==", group.id)
		.get();

	if (!tx.empty) throw new Error("Transaction already imported");

	const provider = new ethers.providers.Web3Provider(
		(window as any).ethereum
	);

	const txn = await provider.getTransaction(txId);

	const block = await provider.getBlock(txn.blockNumber);

	if (!txn) {
		throw new Error(
			"Please make sure you are connected to correct network"
		);
	}

	const { hash, from, to, value } = txn;

	const checkIfSenderIsMember =
		group.members.includes(from.toLowerCase()) ||
		group.members.includes(from);
	const checkIfReceiverIsMember =
		group.members.includes(to.toLowerCase()) || group.members.includes(to);

	if (!checkIfSenderIsMember) {
		throw new Error("Sender is not a member of this group");
	}
	if (!checkIfReceiverIsMember) {
		throw new Error("Receiver is not a member of this group");
	}

	const formattedValue = Number(ethers.utils.formatEther(value));

	const transaction = new Transaction();
	transaction.id = hash;
	transaction.from = from;
	transaction.to = to;
	transaction.amount = formattedValue;
	transaction.createdAt = new Date().getTime();
	transaction.groupId = group.id;
	transaction.createdAt = block.timestamp * 1000;

	await saveTransaction({ ...transaction });
};

export const importNFTTransaction = async (
	txId: string,
	group: Group
): Promise<Transaction> => {
	const tx = await db
		.collection(firestoreCollections.TRANSACTIONS)
		.where("id", "==", txId)
		.where("groupId", "==", group.id)
		.get();

	if (!tx.empty) throw new Error("Transaction already imported");

	const provider = new ethers.providers.Web3Provider(
		(window as any).ethereum
	);
	const txn = await provider.getTransaction(txId);

	const gwei = Number(txn.gasPrice.toString()) / 10 ** 9;
	const response = await txn.wait();
	const gasLimit = Number(response.gasUsed.toString());

	const gasAmount = (gwei * gasLimit) / 10 ** 9;

	const block = await provider.getBlock(txn.blockNumber);

	if (!txn) {
		throw new Error(
			"Please make sure you are connected to correct network"
		);
	}

	const { hash, from, to, value } = txn;

	const checkIfSenderIsMember =
		group.members.includes(from.toLowerCase()) ||
		group.members.includes(from);
	const checkIfReceiverIsMember =
		group.members.includes(to.toLowerCase()) || group.members.includes(to);

	if (!checkIfSenderIsMember && !checkIfReceiverIsMember) {
		throw new Error("Sender is not a member of this group");
	}

	const formattedValue = Number(ethers.utils.formatEther(value));

	const transaction = new Transaction();

	transaction.id = hash;
	transaction.from = from;
	transaction.to = to;
	transaction.amount = formattedValue;
	transaction.createdAt = new Date().getTime();
	transaction.groupId = group.id;
	transaction.createdAt = block.timestamp * 1000;
	transaction.gas = gasAmount;

	return transaction;
};
