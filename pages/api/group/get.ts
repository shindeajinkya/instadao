// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "../../../contracts";
import { withAuth } from "../../../middleware";
import { createGroup, getGroup } from "../../../utils/firebaseQueries";

const getGroupAPI = async (
	req: NextApiRequest,
	res: NextApiResponse,
	user: User
) => {
	try {
		if (req.method !== "GET") throw new Error("Method not allowed");

		const { id } = req.query;

		const group = await getGroup(id.toString());

		res.status(200).json(group);
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
};

export default withAuth(getGroupAPI);
