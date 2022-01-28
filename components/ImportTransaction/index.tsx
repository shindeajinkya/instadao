import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Group } from "../../contracts";
import { importTransaction } from "../../utils";

const ImportTransaction = ({ group }: { group?: Group }) => {
	const [transactionId, setTransactionId] = useState("");
	const [loading, setLoading] = useState(false);
	const {
		query: { id },
	} = useRouter();

	const handleImportTransaction = async () => {
		try {
			setLoading(true);
			if (!group) {
				throw new Error("Group not found");
			}
			await importTransaction(transactionId, group);
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-2">
			<div className="w-full">
				<input
					type="text"
					name="text"
					value={transactionId}
					onChange={(e) => setTransactionId(e.target.value)}
					id="text"
					className="shadow-sm focus:ring-blue-600 focus:border-blue-600 block w-full sm:text-sm border-gray-300 rounded-md"
					placeholder="Transaction id or link"
				/>
			</div>

			<button
				type="button"
				disabled={!transactionId.length || loading}
				onClick={handleImportTransaction}
				className={`text-center inline-flex items-center px-4 py-3 w-full border-2 text-sm font-medium rounded-md shadow-sm text-white  ${
					!!transactionId.length || !loading
						? " bg-white hover:border-blue-600 hover:bg-blue-600 border-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 text-blue-600 hover:text-white transition-all ease-in-out "
						: "cursor-not-allowed bg-gray-400"
				}`}
			>
				{loading ? (
					<svg
						className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				) : (
					<div className="text-center w-full text-base">
						Import Transaction
					</div>
				)}
			</button>
		</div>
	);
};

export default ImportTransaction;
