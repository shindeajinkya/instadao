import { NextApiRequest, NextApiResponse } from "next";
import { User } from "next-auth";
import { ACCOUNT, getDataFromCookie, TOKEN_NAME } from "../utils/cookie";
import { db, firestoreCollections } from "../utils/firebaseClient";
import {
	getUserFromAddress,
	getUserByNonce,
	recoverAddress,
} from "../utils/server";

export const withAuth =
	(api: any) => async (req: NextApiRequest, res: NextApiResponse) => {
		console.log("1 hee");

		const signature = getDataFromCookie(req, TOKEN_NAME);
		console.log("3 hee", signature);
		const address = getDataFromCookie(req, ACCOUNT);
		console.log("4hee", address);

		// fetch user from firebase
		const user = await getUserFromAddress(address);
		console.log("asdf hee");

		console.log({ user });

		const recoveredAddress = recoverAddress(user.nonce, signature);

		if (recoveredAddress !== address) {
			return res.status(401).json({
				message: "You are not authorized to access this resource",
			});
		}

		return api(req, res, user);
	};
