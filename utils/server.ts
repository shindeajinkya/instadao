import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { User } from "../contracts";
import { firestoreCollections } from "./firebaseClient";
import firebaseAdmin, { adminDb } from "./firebaseServer";

export const getOrCreateUser = async (address: string): Promise<User> => {
	const response = await getUserFromAddress(address);

	if (!response) {
		const docRef = adminDb.collection(firestoreCollections.USERS).doc();
		const generatedNonce = Math.floor(Math.random() * 1000000).toString();

		const user: User = {
			address: address,
			id: docRef.id,
			nonce: generatedNonce.toString(),
		};

		await firebaseAdmin.auth().createUser({
			uid: address,
		});

		await docRef.set({ ...user });

		return user;
	}
	const generatedNonce = Math.floor(Math.random() * 1000000).toString();

	return { ...response, nonce: generatedNonce.toString() };
};

export const getUserFromAddress = async (
	address: string
): Promise<User | null> => {
	const response = await adminDb
		.collection(firestoreCollections.USERS)
		.where("address", "==", address)
		.get();

	if (response.empty) return null;

	return response.docs[0].data() as User;
};
export const getUserByNonce = async (nonce: string): Promise<User | null> => {
	const response = await adminDb
		.collection(firestoreCollections.USERS)
		.where("nonce", "==", nonce)
		.get();

	if (response.empty) return null;

	return response.docs[0].data() as User;
};

export const updateUser = async (user: User): Promise<void> => {
	const docRef = adminDb.collection(firestoreCollections.USERS).doc(user.id);

	await docRef.update({ ...user });
};

export const recoverAddress = (existingNonce: string, sig: string): string => {
	const hexNonce = ethers.utils.hexlify(Number(existingNonce));

	console.log({ hexNonce });
	console.log({ asd: existingNonce.toString() });

	const recoveredAddress = recoverPersonalSignature({
		data: hexNonce,
		signature: sig,
	});

	return recoveredAddress;
};

export const toHex = (stringToConvert: string) => {
	return stringToConvert
		.split("")
		.map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
		.join("");
};
