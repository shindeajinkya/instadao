// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createGroup } from "../../../utils/firebaseQueries";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method !== "POST") throw new Error("Method not allowed");

		const { members } = req.body;

		const group = await createGroup(members, members[0]);

		res.status(200).json(group);
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
}
