import React, { useState } from "react";
import TransactionLog from "./TransactionLog";

const TransactionLogList = ({ transactions, account }) => {
	const [skipped, setSkipped] = useState(true);

	return (
		<div>
			<div className="relative flex items-start my-2">
				<div className="flex items-center h-5 cursor-pointer">
					<input
						id="skip"
						aria-describedby="skip-description"
						name="skip"
						type="checkbox"
						className="h-4 w-4 border-gray-300 rounded outline-none"
						onChange={() => setSkipped(!skipped)}
						checked={skipped}
					/>
				</div>
				<div className="ml-3 text-sm">
					<label
						htmlFor="skip"
						className="font-medium text-gray-700 cursor-pointer"
					>
						Hide skipped transactions
					</label>
				</div>
			</div>
			{transactions
				.sort((a, b) => b.createdAt - a.createdAt)
				.filter((t) => (skipped ? !t.skipped : true))
				.map((txn) => (
					<TransactionLog txn={txn} key={txn.id} account={account} />
				))}
		</div>
	);
};

export default TransactionLogList;
