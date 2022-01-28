import { NotificationTypes } from "./../contracts/index";
import { Group, Notification, Transaction, TransactionLog } from "../contracts";
import { db, firestoreCollections } from "./firebaseClient";

export const createGroup = async (
	members: string[],
	creator: string
): Promise<Group> => {
	const [user1, user2] = members;

	const existingGroup = await getGroupByPerson(user1, user2);

	if (existingGroup) {
		return existingGroup;
	}

	const group = new Group();
	group.members = members.map((m) => m.toLowerCase());
	group.creator = creator;
	group.createdAt = new Date().toISOString();

	const groupRef = db.collection(firestoreCollections.GROUPS).doc();

	group.id = groupRef.id;
	group.name = `Group ${group.id.slice(4)}`;

	await groupRef.set({ ...group });
	return group;
};

export const updateGroup = async (group: Group) => {
	console.log(group);
	const groupRef = db.collection(firestoreCollections.GROUPS).doc(group.id);

	await groupRef.set({ ...group });
};

export const getGroup = async (id: string): Promise<Group | null> => {
	const groupRef = db.collection(firestoreCollections.GROUPS).doc(id);

	const group = await groupRef.get();

	if (!group.exists) return null;

	return group.data() as Group;
};

export const getGroupByPerson = async (
	walletAddress: string,
	senderAddress: string
): Promise<Group | null> => {
	const groupRef = db
		.collection("groups")
		.where("members", "array-contains", walletAddress);

	const group = await groupRef.get();

	if (group.empty) return null;

	const groupData = group.docs.map((doc) => doc.data() as Group);
	const currentGroup = groupData.find(
		(group) =>
			group.members.includes(senderAddress.toLowerCase()) &&
			group.members.includes(walletAddress.toLowerCase())
	);

	if (currentGroup) {
		return currentGroup;
	}

	return null;
};

// export const getUser = async (
// 	address: string,
// 	customProvider?:
// 		| ethers.providers.Web3Provider
// 		| ethers.providers.JsonRpcProvider
// ): Promise<User> => {
// 	const provider = customProvider
// 		? customProvider
// 		: new ethers.providers.Web3Provider((window as any).ethereum);

// 	const { address: userAddress } = await validateAndResolveAddress(
// 		address,
// 		provider
// 	);

// 	const response = await db
// 		.collection(firestoreCollections.USERS)
// 		.where("address", "==", userAddress)
// 		.get();

// 	if (!response.empty) {
// 		return response.docs[0].data() as User;
// 	}

// 	return null;
// };

export const saveTransaction = async (
	transaction: Transaction
): Promise<void> => {
	await db
		.doc(`${firestoreCollections.TRANSACTIONS}/${transaction.id}`)
		.set({ ...transaction });
};

export const importTransactionLog = async (
	transaction: TransactionLog,
	group: Group
): Promise<void> => {
	const transactionLog = new Transaction();

	transactionLog.id = transaction.txId;
	transactionLog.from = transaction.from;
	transactionLog.to = transaction.to;
	transactionLog.amount = transaction.amount;
	transactionLog.createdAt = transaction.createdAt;
	transactionLog.groupId = group.id;
	transactionLog.gas = transaction.gas;
	transactionLog.message =
		transaction.message === "0x" ? "" : transaction.message;

	const tx = await db
		.collection(firestoreCollections.TRANSACTIONS)
		.where("id", "==", transactionLog.id)
		.where("groupId", "==", group.id)
		.get();

	if (!tx.empty) throw new Error("Transaction already imported");

	await saveTransaction(transactionLog);
};

export const hideTransaction = async (
	txn: string,
	toggle: boolean
): Promise<void> => {
	await db.doc(`${firestoreCollections.TRANSACTIONS}/${txn}`).update({
		skipped: toggle,
	});
};

export const deleteTransaction = async (txn: string): Promise<void> => {
	await db.doc(`${firestoreCollections.TRANSACTIONS}/${txn}`).delete();
};

export const saveNote = async (txnId: string, message: string) => {
	await db.doc(`${firestoreCollections.TRANSACTIONS}/${txnId}`).update({
		message,
	});
};

export const createNotification = async (
	groupId: string,
	type: NotificationTypes,
	amount: number,
	recipient: string,
	message: string,
	skipTransaction?: boolean
) => {
	const notification: Notification = {
		...new Notification(),
		amount,
		type,
		groupId,
		recipient,
		message,
		skipTransaction: !!skipTransaction,
	};

	const notificationRef = db
		.collection(firestoreCollections.NOTIFICATIONS)
		.doc();

	notification.id = notificationRef.id;

	await notificationRef.set({ ...notification });
};

export const closeNotification = async (notificationId: string) => {
	await db
		.doc(`${firestoreCollections.NOTIFICATIONS}/${notificationId}`)
		.update({
			closed: true,
		});
};
