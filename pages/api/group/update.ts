// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "../../../contracts";
import { withAuth } from "./../../../middleware/index";
import { updateGroup } from "./../../../utils/firebaseQueries";

const updateGroupAPI = async (
	req: NextApiRequest,
	res: NextApiResponse,
	user: User
) => {
	try {
		if (req.method !== "POST") throw new Error("Method not allowed");

		const { group } = req.body;

		if (!group) throw new Error("Group is required");

		const memeberInGroup = group.members.includes(
			user.address.toLowerCase()
		);

		if (!memeberInGroup) {
			throw new Error("You are not a member of this group");
		}

		await updateGroup({ ...group });

		res.status(200).json(group);
	} catch (error) {
		res.status(404).json({ error: (error as any).message });
	}
};

export default withAuth(updateGroupAPI);
