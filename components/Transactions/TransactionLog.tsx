import { Menu, Switch, Transition } from "@headlessui/react";
import { DotsVerticalIcon, ExternalLinkIcon } from "@heroicons/react/solid";
import { default as classnames, default as classNames } from "classnames";
import moment from "moment";
import React, { Fragment } from "react";
import { toast } from "react-toastify";
import { Transaction } from "../../contracts";
import {
	deleteTransaction,
	hideTransaction,
} from "../../utils/firebaseQueries";
import Note from "./Note";

const TransactionLog = ({
	txn,
	account,
}: {
	txn: Transaction;
	account: string;
}) => {
	const isDebited = txn.from.toLowerCase() === account;

	const handleHide = async (hide: boolean) => {
		try {
			await hideTransaction(txn.id, hide);
			toast.success("Transaction hidden successfully");
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		}
	};
	const handleDelete = async () => {
		try {
			await deleteTransaction(txn.id);
			toast.success("Transaction deleted successfully");
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		}
	};

	return (
		<div
			key={txn.id}
			className="mb-4 hover:bg-gray-100 p-4 rounded-md -mx-4 group"
		>
			<div className=" text-gray-400 text-xs flex items-center justify-between">
				{moment(new Date(txn.createdAt)).format("DD MMM, YYYY")}
				<div className="space-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all ease-in-out">
					<a
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-400"
						href={`https://etherscan.io/tx/${txn.id}`}
					>
						<ExternalLinkIcon className="h-6 w-6" />
					</a>
					<Menu as="div" className="relative inline-block text-left">
						<div>
							<Menu.Button className="">
								<DotsVerticalIcon className="h-6 w-6" />
							</Menu.Button>
						</div>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95"
						>
							<Menu.Items className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
								<Menu.Item>
									<div
										className={classNames(
											"cursor-pointer text-gray-700 px-4 py-2 text-sm hover:bg-gray-50 rounded-t-md flex items-center justify-between w-full"
										)}
									>
										<span>Skip Tx</span>
										<Switch
											checked={!!txn.skipped}
											onChange={(e) => handleHide(e)}
											className={classNames(
												txn.skipped
													? "bg-indigo-600"
													: "bg-gray-200",
												"relative inline-flex flex-shrink-0 h-4 w-8 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
											)}
										>
											<span className="sr-only">
												Use setting
											</span>
											<span
												aria-hidden="true"
												className={classNames(
													txn.skipped
														? "translate-x-4"
														: "translate-x-0",
													"pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
												)}
											/>
										</Switch>
									</div>
								</Menu.Item>
								<Menu.Item>
									<div
										onClick={() => handleDelete()}
										className={classNames(
											"cursor-pointer text-orange block px-4 py-2 text-sm hover:text-white hover:bg-orange rounded-b-md"
										)}
									>
										Delete
									</div>
								</Menu.Item>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>

			<div
				className={classnames(
					"text-xl font-medium flex items-center",
					isDebited ? "text-orange" : " text-green"
				)}
			>
				{isDebited ? "- " : "+ "}{" "}
				{(txn.amount + txn.gas).toPrecision(3)} ETH
				{txn.skipped && (
					<div className="text-sm px-2 py-1 bg-gray-200 text-gray-500 rounded-md ml-4">
						Skipped
					</div>
				)}
			</div>

			<div className="mt-1 text-gray-500">
				<Note txn={txn} />
			</div>
		</div>
	);
};

export default TransactionLog;
