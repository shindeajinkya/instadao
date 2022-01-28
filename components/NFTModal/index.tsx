import React, { useState } from "react";
import { toast } from "react-toastify";
import { Transaction } from "../../contracts";
import { useMoralisData } from "../../hooks/useMoralisData";
import { importNFTTransaction } from "../../utils";
import { saveTransaction } from "../../utils/firebaseQueries";
import Button from "../Button";
import Modal from "../Modal";

const NFTModal = ({
	addNftTransactionModal,
	setAddNftTransactionModal,
	group,
}) => {
	const [transactionId, setTransactionId] = React.useState("");
	const [split, setSplit] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [transaction, setTransaction] = useState<Transaction | null>(null);
	const { account } = useMoralisData();

	const handleImportTransaction = async () => {
		setLoading(true);
		const tx = await importNFTTransaction(transactionId, group);
		setLoading(false);
		setTransaction(tx);
	};

	const handleFinalNFTTransaction = async () => {
		try {
			const splitAmount = Number(
				(transaction?.amount / split).toPrecision(3)
			);
			const splitGas = Number((transaction?.gas / split).toPrecision(3));

			await saveTransaction({
				...transaction,
				amount: splitAmount,
				gas: splitGas,
				to: account,
				message: `We bought a NFT together and split it among ${split} of us.`,
			});
			setAddNftTransactionModal(false);
			resetData();
			toast.success("Transaction imported successfully");
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		} finally {
		}
	};

	const resetData = () => {
		setTransactionId("");
		setSplit(1);
		setTransaction(null);
	};

	const amount = transaction?.amount ?? 0;
	const gas = transaction?.gas ?? 0;

	const splitAmount = parseFloat(
		(Number(amount) / (isNaN(split) ? 1 : split)).toPrecision(3)
	);
	const splitGas = parseFloat(
		(Number(gas) / (isNaN(split) ? 1 : split)).toPrecision(3)
	);

	return (
		<Modal
			width="w-2/5"
			open={addNftTransactionModal}
			onClose={() => {
				setAddNftTransactionModal(false);
				resetData();
			}}
			title="Add NFT Transaction"
			onOk={handleFinalNFTTransaction}
			okText="Add"
			disabled={!transactionId || loading || !transactionId.length}
			loading={loading}
		>
			<div className="text-left space-y-4">
				<label
					htmlFor="text"
					className="block text-sm font-medium text-gray-700"
				>
					Transaction id
				</label>
				<div className="mt-1 mb-4">
					<input
						value={transactionId}
						onChange={(e) => setTransactionId(e.target.value)}
						type="text"
						name="text"
						id="text"
						className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
						placeholder="Transaction id of nft mint"
					/>
				</div>

				<div className="">
					<Button
						loading={loading}
						onClick={handleImportTransaction}
						variant="secondary"
					>
						Fetch
					</Button>
				</div>
				<div>
					<div className="grid grid-cols-6 w-48">
						<span className=" col-span-2">Amount:</span>
						<span className="col-span-4">
							{amount.toPrecision(3)} ETH
						</span>
					</div>
					<div className="grid grid-cols-6 w-48">
						<span className=" col-span-2">Gas:</span>
						<span className="col-span-4">
							{gas.toPrecision(3)} ETH
						</span>
					</div>
				</div>

				<label htmlFor="split" className="block font-bold ">
					Splits of NFT
				</label>
				<div className="mt-1">
					<input
						value={split}
						onChange={(e) =>
							setSplit(parseInt(e.target.value ?? "0"))
						}
						type="number"
						name="split"
						id="split"
						className="shadow-sm w-24 focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
						placeholder="#"
					/>
				</div>

				<div className=" font-bold">Cost per person</div>
				<div>
					<div className="grid grid-cols-6 w-48">
						<span className=" col-span-2">Amount:</span>
						<span className="col-span-4">{splitAmount} ETH</span>
					</div>
					<div className="grid grid-cols-6 w-48">
						<span className=" col-span-2">Gas:</span>
						<span className="col-span-4">{splitGas} ETH</span>
					</div>
					<div className="grid grid-cols-6 w-48 border-t-2 mt-2 pt-2">
						<span className=" font-bold col-span-2">Total:</span>
						<span className="col-span-4">
							{splitGas + splitAmount} ETH
						</span>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default NFTModal;
