export class Group {
	id: string = "";
	name: string = "";
	creator: string = "";
	members: string[] = [];
	createdAt: string = "";
	groupBalance: Record<string, Record<string, number>> | null = null;
}

export class Transaction {
	id: string = "";
	groupId: string = "";
	from: string = "";
	to: string = "";
	amount: number = 0;
	createdAt: number | null = null;
	message: string = "";
	gas: number = 0;
	skipped: boolean = false;
}

export interface TransactionLog {
	txId: string;
	from: string;
	to: string;
	amount: number;
	message: string;
	createdAt: number;
	fromBlock: number;
	gas: number;
}
// export class Transaction {
// 	from: string = "";
// 	fromEns: string | null = null;
// 	to: string = "";
// 	amount: number = 0;
// 	timestamp: number = new Date().getTime();
// 	id: string = "";
// 	message: string = "";
// 	cronStatus: "pending" | "success" = "pending";
// 	status: "success" | "failure" | "" = "";
// 	chain: string = "";
// 	formattedAmount: string = "";
// 	tokenDecimals: number = 0;
// 	senderAvatar?: string = null;
// }

export enum NotificationTypes {
	Request = "request",
	RequestToSettle = "requestToSettle",
}
export class Notification {
	type: NotificationTypes = NotificationTypes.Request;
	amount: number;
	closed: boolean = false;
	groupId: string = "";
	id: string = "";
	recipient: string = "";
	timestamp: number = new Date().getTime();
	message: string = "";
	skipTransaction: boolean = false;
}

export class User {
	id: string;
	nonce: string;
	address: string;
}
