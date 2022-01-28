// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { setTokenCookie } from "../../../utils/cookie";
import { db, firestoreCollections } from "../../../utils/firebaseClient";
import { saveTransaction } from "../../../utils/firebaseQueries";
import { getOrCreateUser } from "../../../utils/server";

export default async function createTransaction(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method !== "POST") throw new Error("Method not allowed");

		const { transaction } = req.body;

		await saveTransaction({ ...transaction });

		res.status(200).json({});
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
}
