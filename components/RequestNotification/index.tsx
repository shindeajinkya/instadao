import React from "react";
import human from "human-time";
import Button from "../Button";
import { Notification } from "../../contracts";
import { toast } from "react-toastify";
import { closeNotification } from "../../utils/firebaseQueries";
import { useEnsAddress } from "../../utils/useEnsAddress";
import { minimizeAddress } from "../../utils";

const RequestNotification = ({
	notification,
	settleAmount,
}: {
	notification: Notification;
	settleAmount: (amount: number) => void;
}) => {
	const { address, name } = useEnsAddress(notification.recipient);

	const handleClosed = async () => {
		try {
			await closeNotification(notification.id);
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		}
	};

	const handleSettle = async () => {
		settleAmount(notification.amount);
		await handleClosed();
	};

	return (
		<div className="button-gradient p-0.5 rounded-lg">
			<div className="bg-white rounded-md p-4 border-none">
				<div className="w-full flex justify-between items-center">
					<span className="text-gray-400">
						{human(new Date(notification.timestamp))}
					</span>
					<span onClick={handleClosed} className="cursor-pointer">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</span>
				</div>
				<div className="flex flex-col mt-2 space-y-2">
					<div className="w-full font-bold">
						{name ?? minimizeAddress(address)}
					</div>
					<div className="text-sm">{notification.message}</div>
					<div className="items-start">
						<Button onClick={handleSettle} size="sm">
							Settle
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RequestNotification;
