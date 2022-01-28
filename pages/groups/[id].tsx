import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useCollection } from "react-firebase-hooks/firestore";
import { toast } from "react-toastify";
import PaymentSection from "../../components/PaymentSection";
import RequestNotification from "../../components/RequestNotification";
import RequestSection from "../../components/RequestSection";
import Transactions from "../../components/Transactions";
import {
	Group,
	Notification,
	NotificationTypes,
	Transaction,
} from "../../contracts";
import { useMoralisData } from "../../hooks/useMoralisData";
import useTransactions from "../../hooks/useTransactions";
import { minimizeAddress } from "../../utils";
import { db, firestoreCollections } from "../../utils/firebaseClient";
import {
	createNotification,
	getGroupByPerson,
} from "../../utils/firebaseQueries";
import { fetchEnsAddress, useEnsAddress } from "../../utils/useEnsAddress";

declare let window: any;
export interface ProfileProps {
	transactions: Transaction[];
	profileAddress: string;
	ens?: string;
	avatar?: string;
	group?: Group;
}

const UserPage: React.FC<ProfileProps> = ({
	transactions: allTransactions,
	profileAddress,
	avatar: defaultAvatar,
	// group,
}) => {
	const router = useRouter();
	const queryAddress = router.query.id?.toString();

	const { address: otherAddress, name: ens } = useEnsAddress(queryAddress);

	const otherPersonAccount = queryAddress?.includes(".")
		? otherAddress
		: queryAddress?.toLowerCase();

	const [group, setGroup] = useState<Group>();
	const { account } = useMoralisData();
	const { address, avatar, error, name } = useEnsAddress(otherPersonAccount);

	const [selectedSection, setSelectedSection] = useState<"pay" | "request">(
		"pay"
	);
	const [settleAmount, setSettleAmount] = useState<number>(0);

	const [snapshot] = useCollection(
		group?.id &&
			db
				.collection(firestoreCollections.TRANSACTIONS)
				.where("groupId", "==", group?.id)
	);
	const [notificationSnapshot] = useCollection(
		group?.id &&
			address &&
			db
				.collection(firestoreCollections.NOTIFICATIONS)
				.where("groupId", "==", group?.id)
				.where("recipient", "==", account)
				.where("closed", "==", false)
	);

	const notifications: Notification[] =
		notificationSnapshot?.docs?.map((doc) => doc.data() as Notification) ??
		[];

	const transactions: Transaction[] =
		(snapshot?.docs.map((doc) => doc.data() as Transaction) ?? []).sort(
			(a, b) => a.createdAt - b.createdAt
		) || [];
	const isOwner = group?.creator === account;

	const memberBalance = transactions?.reduce<
		Record<string, Record<string, number>>
	>((balance, transaction) => {
		if (transaction.skipped) {
			return balance;
		}

		const { from: fromAddress, to: toAddress, amount, gas } = transaction;
		const from = fromAddress.toLowerCase();
		const to = toAddress.toLowerCase();

		balance[from] = {
			...balance[from],
			[to]: (balance[from]?.[to] ?? 0) + (amount + gas),
		};

		balance[to] = {
			...balance[to],
			[from]: (balance[to]?.[from] ?? 0) - (amount + gas),
		};

		return balance;
	}, {});

	const otherMember = group?.members.filter(
		(member) => member !== account
	)[0];
	const { result } = useTransactions(otherMember ?? "");

	const userName = name ?? minimizeAddress(address ?? otherPersonAccount);

	const fetchGroupData = async () => {
		let friendAddress: string = otherPersonAccount?.toLowerCase() ?? "";

		if (friendAddress.includes(".")) {
			const response = await fetchEnsAddress(friendAddress);
			friendAddress = response.address.toLowerCase();
		}

		if (friendAddress && account) {
			const data = await getGroupByPerson(friendAddress, account);

			setGroup(data);
		}
	};

	const handleRequest = async () => {
		try {
			const balance =
				memberBalance[account.toLowerCase()][
					otherAddress?.toLowerCase()
				];

			await createNotification(
				group.id,
				NotificationTypes.RequestToSettle,
				balance,
				otherAddress?.toLowerCase(),
				"Hey! Paisa lautau"
			);
			toast.success("Request sent");
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		}
	};

	useEffect(() => {
		fetchGroupData();
	}, [otherPersonAccount, account]);

	const balanceAmount =
		memberBalance?.[account?.toLowerCase()]?.[otherAddress.toLowerCase()] ??
		0;

	return (
		<>
			<div className="min-h-screen">
				<div className="container rounded-xl py-12 ">
					<div className="mx-auto grid grid-cols-1 gap-6 sm:px-6 xs:px-0 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
						<div className="space-y-6 card xs:p-4 rounded-lg bg-white lg:col-start-1 lg:col-span-2">
							<div className="flex justify-between items-center sm:hidden">
								<div className="flex items-center space-x-5">
									<div className="group">
										<div className="flex space-x-4 items-center">
											{avatar?.length ? (
												<img
													src={avatar}
													className="h-16 w-16 rounded-xl"
												/>
											) : (
												<Blockies
													seed={userName}
													size={9}
													scale={8}
													className="h-16 w-16 rounded-xl"
												/>
											)}

											<div>
												<h1 className="text-3xl font-bold text-gray-900 mb-1">
													{userName}
												</h1>
												{!!name && (
													<span className="text-sm">
														{`(${minimizeAddress(
															address ??
																otherPersonAccount
														)})`}
													</span>
												)}
											</div>
										</div>

										<div>
											{Object.entries(
												memberBalance[
													account?.toLowerCase()
												] ?? {}
											).map(([address, balance]) => {
												const shouldSkip =
													balance === 0 ||
													address ===
														account?.toLowerCase();
												const shouldPay = balance > 0;

												if (shouldSkip) return null;

												return (
													<div
														key={address}
														className="my-4 flex items-center space-x-6"
													>
														<div className="flex-1 text-md">
															{!shouldPay ? (
																<>
																	You owe
																	<span className="font-bold text-lg mx-2">
																		{
																			userName
																		}
																	</span>
																</>
															) : (
																<>
																	<span className="font-bold mr-2 text-lg">
																		{
																			userName
																		}
																	</span>
																	owes you
																</>
															)}
															<span
																className={`font-bold ml-2 text-lg ${
																	shouldSkip
																		? ""
																		: shouldPay
																		? " text-green "
																		: " text-orange"
																}`}
															>
																{balance === 0
																	? ""
																	: shouldPay
																	? "+ "
																	: ""}
																{balance.toPrecision(
																	3
																)}{" "}
																ETH
															</span>
														</div>
														{shouldPay ? (
															<div
																onClick={
																	handleRequest
																}
																className="border-2 text-white bg-black px-3 py-0.5 rounded-md cursor-pointer transition-all ease-in-out"
															>
																Request
															</div>
														) : (
															<div
																onClick={() => {
																	setSelectedSection(
																		"pay"
																	);
																	setSettleAmount(
																		balanceAmount
																	);
																}}
																className="bg-black text-white border-2 border-black px-3 py-0.5 rounded-md cursor-pointer transition-all ease-in-out"
															>
																Settle
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</div>
							<div className="mt-8 border-b -mx-8 xs:hidden" />

							<Transactions
								transactions={transactions}
								account={account}
								group={group}
								friendAddress={otherAddress}
							/>
						</div>

						<section
							aria-labelledby="timeline-title"
							className={`${
								isOwner ? "grid grid-cols-1 gap-4" : ""
							} lg:col-start-3 lg:col-span-1 sm:row-span-full`}
						>
							<div>
								<div className="card space-y-4 bg-white rounded-lg">
									<div className="flex items-center justify-between">
										<div
											className={`px-4 py-2 pb-4 relative text-center w-full cursor-pointer border-b-2 border-transparent text-sm ${
												selectedSection === "pay" &&
												" active-bottom-border font-bold "
											}`}
											onClick={() =>
												setSelectedSection("pay")
											}
										>
											Pay
										</div>
										<div
											className={`px-4 py-2 pb-4 w-full relative text-center cursor-pointer border-b-2 border-transparent text-sm ${
												selectedSection === "request" &&
												"  active-bottom-border font-bold "
											}`}
											onClick={() =>
												setSelectedSection("request")
											}
										>
											Request
										</div>
									</div>
									{selectedSection === "pay" && (
										<PaymentSection
											propAmount={settleAmount}
											settleAmount={setSettleAmount}
										/>
									)}
									{selectedSection === "request" && (
										<RequestSection group={group} />
									)}
								</div>
								<div className="mt-6 space-y-2">
									{notifications.map((notification) => (
										<RequestNotification
											settleAmount={(amount) => {
												setSelectedSection("pay");
												setSettleAmount(amount);
											}}
											notification={notification}
											key={notification.id}
										/>
									))}
								</div>
							</div>
						</section>
					</div>
				</div>
				{/* <Modal
					visible={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					className="embed-modal"
					width={1032}
					bodyStyle={{
						borderRadius: "10px",
					}}
					title={
						<div className="font-urbanist">
							<h3 className="font-bold text-xl mb-1">
								Embed CryptoCoffee
							</h3>
							<p>
								Copy and paste the code below to send your
								website's visitors to your cryptocoffee page!
							</p>
						</div>
					}
					footer={null}
				>
					<div className="flex flex-col items-center justify-center">
						<Image src={embedbadge} />
						<div className="mt-8 relative mb-8 mx-8 border border-cryptopurple bg-lightpurple rounded-md py-8 px-12 text-lg">
							{script}
							<button
								className="flex absolute right-4 bottom-3 items-center text-lg text-cryptopurple"
								onClick={copyEmbedButtonScript}
								disabled={isScriptCopied}
							>
								{isScriptCopied ? (
									<CheckIcon className="w-6 h-6 mr-2" />
								) : (
									<DuplicateIcon className="w-6 h-6 mr-2" />
								)}
								Copy Code
							</button>
						</div>
					</div>
				</Modal> */}
			</div>
		</>
	);
};

export default UserPage;
