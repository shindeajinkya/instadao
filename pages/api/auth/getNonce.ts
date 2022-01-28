// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateUser } from "../../../utils/server";

export default async function getNonceToSign(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method !== "GET") throw new Error("Method not allowed");

		const { address } = req.query;

		if (!address) {
			throw new Error("No address provided");
		}

		const user = await getOrCreateUser(address.toString());

		// setTokenCookie(res, user.nonce);

		return res.status(200).send({ nonce: user.nonce });
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
}
