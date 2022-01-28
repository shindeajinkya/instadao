// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ICookie, setTokenCookie, TOKEN_NAME } from "../../../utils/cookie";
import firebaseAdmin from "../../../utils/firebaseServer";
import {
	getUserFromAddress,
	recoverAddress,
	updateUser,
} from "../../../utils/server";
import { ACCOUNT } from "./../../../utils/cookie";

export default async function verifyNonce(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method !== "POST") throw new Error("Method not allowed");

		const { signature, address: currAddress } = req.body;
		const address = currAddress.toLowerCase();

		if (!address) {
			throw new Error("No address provided");
		}
		if (!signature) {
			throw new Error("No signature provided");
		}

		const user = await getUserFromAddress(address);
		if (!user) {
			throw new Error("No user found");
		}

		console.log(user.nonce);
		console.log(signature);

		const recoveredAddress = recoverAddress(user.nonce, signature);

		if (address === recoveredAddress) {
			const cookies: ICookie[] = [
				{
					name: ACCOUNT,
					value: address,
				},
				{
					name: TOKEN_NAME,
					value: signature,
				},
			];

			setTokenCookie(res, cookies);

			return res.status(200).send({});
		} else {
			res.status(401).json({ error: "Signature is invalid" });
		}
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
}
