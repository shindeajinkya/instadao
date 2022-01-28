import { PlusIcon } from "@heroicons/react/outline";
import { CheckIcon } from "@heroicons/react/solid";
import classnames from "classnames";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Group, Transaction } from "../../contracts";
import { importTransaction } from "../../utils";
import Button from "../Button";
import Modal from "../Modal";
import NFTModal from "../NFTModal";
import ImportTransactions from "./ImportTransactions";
import TransactionLogList from "./TransactionLogList";
import Image from "next/image";
import emptyinbox from "../../assets/emptyinbox.png";

// humanise datestring using intl
// const humaniseDate = (date: Date) => {
// 	return new Intl.DateTimeFormat("en-US").format(date);
// };

const Transactions = ({
	transactions,
	account,
	group,
	friendAddress,
}: {
	transactions: Transaction[];
	account: string;
	group: Group;
	friendAddress: string;
}) => {
	const [importing, setImporting] = useState(false);
	const [addNftTransactionModal, setAddNftTransactionModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [transactionId, setTransactionId] = useState("");

	const handleImportTransaction = async () => {
		try {
			setLoading(true);
			await importTransaction(transactionId, group);
			toast.success("Transaction imported successfully");
			setTransactionId("");
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section aria-labelledby="notes-title">
			<h3 className="text-2xl font-bold flex items-center justify-between mb-6">
				Transactions
				{importing ? (
					<Button
						variant="secondary"
						onClick={() => setImporting(false)}
					>
						<CheckIcon className="h-4 w-4 mr-2" />
						Finish importing
					</Button>
				) : (
					<div className="flex items-center space-x-2">
						{/* <Button
							variant="secondary"
							onClick={() => setAddNftTransactionModal(true)}
						>
							<div className="h-4 w-4 mr-2">
								<PlusIcon />
							</div>
							Add NFT Transaction
						</Button> */}
						<Button
							variant="secondary"
							onClick={() => setImporting(true)}
						>
							<div className="h-4 w-4 mr-2">
								<PlusIcon />
							</div>
							Import from Etherscan
						</Button>
					</div>
				)}
			</h3>
			<div className="mt-1 flex items-center space-x-2">
				<input
					value={transactionId}
					onChange={(e) => setTransactionId(e.target.value)}
					type="text"
					name="text"
					id="text"
					className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-1.5"
					placeholder="Transaction id or url"
				/>
				<div>
					<Button
						variant="secondary"
						onClick={handleImportTransaction}
						loading={loading}
					>
						<div className="h-4 w-4 mr-2">
							<PlusIcon />
						</div>
						Transaction
					</Button>
				</div>
			</div>
			<div className="bg-white mt-4 sm:rounded-lg sm:overflow-hidden">
				{importing ? (
					<ImportTransactions
						transactions={transactions}
						account={account}
						friendAddress={friendAddress}
						group={group}
					/>
				) : (
					<>
						<TransactionLogList
							transactions={transactions}
							account={account}
						/>
					</>
				)}
			</div>
			<NFTModal
				addNftTransactionModal={addNftTransactionModal}
				setAddNftTransactionModal={setAddNftTransactionModal}
				group={group}
			/>
            {transactions?.length === 0 && <div className="flex justify-center items-center flex-col">
                <Image src={emptyinbox} />
                <div className="mt-8">When you add a fren, they will show up here.</div>
            </div> }
		</section>
	);
};

export default Transactions;
