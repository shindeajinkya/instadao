// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Notification } from "../../../contracts";
import { db, firestoreCollections } from "../../../utils/firebaseClient";
import { createNotification } from "../../../utils/firebaseQueries";

export default async function updateTransaction(
	req: NextApiRequest,
	res: NextApiResponse
	// user: User
) {
	try {
		if (req.method !== "POST") throw new Error("Method not allowed");

		const { amount, type, groupId, recipient, message } = req.body;

		await createNotification(groupId, type, amount, recipient, message);

		res.status(200).json({});
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
}
